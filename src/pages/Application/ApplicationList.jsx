import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetApplicationsQuery, useGetApplicationStatsQuery } from "../../features/applications/applicationApi";
import { useGetStudentsQuery } from "../../features/students/studentApi";

const ApplicationList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("applicationDate");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch applications using the proper API
  const { data: applicationsData, isLoading: isLoadingApps, error: appsError } = useGetApplicationsQuery({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    sortBy,
    sortOrder,
    priority: priorityFilter !== "all" ? priorityFilter : "",
  });

  // Fetch application statistics
  const { data: statsData, error: statsError } = useGetApplicationStatsQuery();

  // Determine if we need fallback
  const needsFallback = appsError && appsError.status !== 401; // Don't fallback on auth errors
  
  // Fallback: Use student API only if applications API fails and it's not an auth error
  const { data: studentsData, isLoading: isLoadingStudents, error: studentsError } = useGetStudentsQuery(undefined, {
    skip: !needsFallback, // Only run if we actually need the fallback
  });

  // Determine which data to use
  const useFallback = needsFallback;
  const isLoading = isLoadingApps || (useFallback && isLoadingStudents);
  const error = appsError && studentsError ? appsError : null;

  // Debug logging (only on mount and when errors change)
  React.useEffect(() => {
    if (appsError) {
      console.log('Applications API Error:', appsError);
    }
    if (statsError) {
      console.log('Stats API Error:', statsError);
    }
    if (studentsError) {
      console.log('Students API Error:', studentsError);
    }
  }, [appsError, statsError, studentsError]);

  // Process applications data
  let applications = [];
  let totalApplications = 0;
  let totalPages = 1;

  if (!useFallback && applicationsData) {
    // Use proper applications API data
    applications = applicationsData.data || [];
    totalApplications = applicationsData.pagination?.total || 0;
    totalPages = applicationsData.pagination?.totalPages || 0;
  } else if (useFallback && studentsData) {
    // Fallback: Extract applications from student data
    const allApplications = studentsData.data?.reduce((acc, student) => {
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
            applicationDate: course.applicationDate || new Date().toISOString(),
            applicationNumber: course.applicationNumber || `APP-${student._id.slice(-6)}-${course._id.slice(-6)}`,
          });
        });
      }
      return acc;
    }, []) || [];

    // Apply client-side filtering for fallback
    let filteredApplications = allApplications;
    
    if (searchTerm) {
      filteredApplications = filteredApplications.filter(app => 
        app.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentId.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.courseId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.courseId.university.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    
    if (priorityFilter !== "all") {
      filteredApplications = filteredApplications.filter(app => 
        app.priority.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    // Apply sorting
    filteredApplications.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'priority':
          aVal = a.priority;
          bVal = b.priority;
          break;
        case 'applicationDate':
        default:
          aVal = new Date(a.applicationDate);
          bVal = new Date(b.applicationDate);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (currentPage - 1) * 10;
    const endIndex = startIndex + 10;
    applications = filteredApplications.slice(startIndex, endIndex);
    totalApplications = filteredApplications.length;
    totalPages = Math.ceil(filteredApplications.length / 10);
  }

  const handleViewApplication = (application) => {
    navigate(`/student/edit/${application.studentId?._id}`, {
      state: { selectedApplicationId: application._id }
    });
  };

  // Reset page when filters change
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
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Error loading applications</div>
          <div className="text-gray-600 mb-4">{error.message || error.data?.message || 'Unknown error occurred'}</div>
          <div className="text-sm text-gray-500">
            If this error persists, please check if the Applications API is properly configured in the backend.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600 mt-2">Manage and track all student applications</p>
            {useFallback && (
              <div className="mt-2 text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full inline-block">
                ⚠️ Using fallback data source (Student API)
              </div>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Total Applications: {totalApplications}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="applicationDate-desc">Date (Newest)</option>
            <option value="applicationDate-asc">Date (Oldest)</option>
            <option value="priority-desc">Priority (High-Low)</option>
            <option value="priority-asc">Priority (Low-High)</option>
          </select>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    University
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        {searchTerm || priorityFilter !== "all"
                        ? "No applications found matching your criteria." 
                        : "No applications found. Students need to apply to courses first."}
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.studentId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.studentId?.studentCode || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {application.studentId?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.courseId?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {application.courseId?.university || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(application.priority)}`}>
                          {application.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.applicationDate ? new Date(application.applicationDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewApplication(application)}
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

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {statsData?.totalApplications || totalApplications}
            </div>
            <div className="text-sm text-gray-500">Total Applications</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {statsData?.lowPriority || applications.filter(app => app.priority === 'low').length}
            </div>
            <div className="text-sm text-gray-500">Low Priority</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">
              {statsData?.mediumPriority || applications.filter(app => app.priority === 'medium').length}
            </div>
            <div className="text-sm text-gray-500">Medium Priority</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">
              {statsData?.highPriority || applications.filter(app => app.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-500">High Priority</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              {statsData?.urgentPriority || applications.filter(app => app.priority === 'urgent').length}
            </div>
            <div className="text-sm text-gray-500">Urgent Priority</div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationList;
