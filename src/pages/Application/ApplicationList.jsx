import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetApplicationsQuery,
  useGetApplicationStatsQuery,
} from "../../features/applications/applicationApi";
import { useGetStudentsQuery } from "../../features/students/studentApi";

const ApplicationList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("applicationDate");
  const [sortOrder, setSortOrder] = useState("desc");

  const { data: applicationsData, isLoading: isLoadingApps, error: appsError } =
    useGetApplicationsQuery({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      sortBy,
      sortOrder,
      priority: priorityFilter !== "all" ? priorityFilter : "",
    });

  const { data: statsData, error: statsError } = useGetApplicationStatsQuery();
  const needsFallback = appsError && appsError.status !== 401;

  const {
    data: studentsData,
    isLoading: isLoadingStudents,
    error: studentsError,
  } = useGetStudentsQuery(undefined, {
    skip: !needsFallback,
  });

  const useFallback = needsFallback;
  const isLoading = isLoadingApps || (useFallback && isLoadingStudents);
  const error = appsError && studentsError ? appsError : null;

  React.useEffect(() => {
    if (appsError) console.log("Applications API Error:", appsError);
    if (statsError) console.log("Stats API Error:", statsError);
    if (studentsError) console.log("Students API Error:", studentsError);
  }, [appsError, statsError, studentsError]);

  let applications = [];
  let totalApplications = 0;
  let totalPages = 1;

  if (!useFallback && applicationsData) {
    applications = applicationsData.data || [];
    totalApplications = applicationsData.pagination?.total || 0;
    totalPages = applicationsData.pagination?.totalPages || 0;
  } else if (useFallback && studentsData) {
    const allApplications =
      studentsData.data?.reduce((acc, student) => {
        if (student.courses && student.courses.length > 0) {
          student.courses.forEach((course, index) => {
            acc.push({
              _id: `${student._id}-${course._id}-${index}`,
              studentId: {
                _id: student._id,
                name: student.name,
                studentCode: student.studentCode || student._id,
                email: student.email,
              },
              courseId: {
                _id: course._id,
                name: course.name,
                university: course.university,
              },
              status: course.status || "pending",
              priority: course.priority || "medium",
              applicationDate:
                course.applicationDate || new Date().toISOString(),
              applicationNumber:
                course.applicationNumber ||
                `APP-${student._id.slice(-6)}-${course._id.slice(-6)}`,
            });
          });
        }
        return acc;
      }, []) || [];

    let filteredApplications = allApplications;

    if (searchTerm) {
      filteredApplications = filteredApplications.filter(
        (app) =>
          app.studentId.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.studentId.studentCode
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.courseId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.courseId.university
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (priorityFilter !== "all") {
      filteredApplications = filteredApplications.filter(
        (app) =>
          app.priority.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    filteredApplications.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case "priority":
          aVal = a.priority;
          bVal = b.priority;
          break;
        case "applicationDate":
        default:
          aVal = new Date(a.applicationDate);
          bVal = new Date(b.applicationDate);
          break;
      }
      if (sortOrder === "asc") return aVal > bVal ? 1 : -1;
      else return aVal < bVal ? 1 : -1;
    });

    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    applications = filteredApplications.slice(startIndex, endIndex);
    totalApplications = filteredApplications.length;
    totalPages = Math.ceil(filteredApplications.length / 10);
  }

  const handleViewApplication = (application) => {
    navigate(`/student/edit/${application.studentId?._id}`, {
      state: { selectedApplicationId: application._id },
    });
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priorityFilter, sortBy, sortOrder]);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-center">
        <div>
          <div className="text-red-600 text-lg font-semibold mb-2">
            Error loading applications
          </div>
          <div className="text-gray-600 mb-4">
            {error.message ||
              error.data?.message ||
              "Unknown error occurred"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Applications
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage and track all student applications
          </p>
          {useFallback && (
            <div className="mt-2 text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full inline-block">
              ⚠️ Using fallback data (Student API)
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Total: {totalApplications}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split("-");
            setSortBy(field);
            setSortOrder(order);
          }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="applicationDate-desc">Date (Newest)</option>
          <option value="applicationDate-asc">Date (Oldest)</option>
          <option value="priority-desc">Priority (High-Low)</option>
          <option value="priority-asc">Priority (Low-High)</option>
        </select>
      </div>

      {/* Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Course
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  University
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Priority
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm || priorityFilter !== "all"
                      ? "No applications match your search."
                      : "No applications available."}
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {app.studentId?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {app.studentId?.studentCode}
                      </div>
                      <div className="text-xs text-gray-400">
                        {app.studentId?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">{app.courseId?.name}</td>
                    <td className="px-6 py-4">{app.courseId?.university}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          app.priority
                        )}`}
                      >
                        {app.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(app.applicationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewApplication(app)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {applications.map((app) => (
          <div
            key={app._id}
            className="bg-white p-4 rounded-lg shadow border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">
                {app.studentId?.name}
              </h2>
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(
                  app.priority
                )}`}
              >
                {app.priority}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {app.courseId?.name} — {app.courseId?.university}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(app.applicationDate).toLocaleDateString()}
            </p>
            <button
              onClick={() => handleViewApplication(app)}
              className="mt-3 w-full text-center text-blue-600 text-sm font-medium border border-blue-600 py-1.5 rounded-md hover:bg-blue-50 transition"
            >
              View Application
            </button>
          </div>
        ))}

        {applications.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No applications found.
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          {
            label: "Total",
            value: statsData?.totalApplications || totalApplications,
            color: "text-blue-600",
          },
          {
            label: "Low Priority",
            value:
              statsData?.lowPriority ||
              applications.filter((a) => a.priority === "low").length,
            color: "text-green-600",
          },
          {
            label: "Medium Priority",
            value:
              statsData?.mediumPriority ||
              applications.filter((a) => a.priority === "medium").length,
            color: "text-yellow-600",
          },
          {
            label: "High Priority",
            value:
              statsData?.highPriority ||
              applications.filter((a) => a.priority === "high").length,
            color: "text-orange-600",
          },
          {
            label: "Urgent Priority",
            value:
              statsData?.urgentPriority ||
              applications.filter((a) => a.priority === "urgent").length,
            color: "text-red-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-4 rounded-lg shadow text-center"
          >
            <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ApplicationList;
