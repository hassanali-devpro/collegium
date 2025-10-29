import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetStudentsQuery } from "../../features/students/studentApi";

const StudentPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: studentsData, isLoading, error } = useGetStudentsQuery();

  const handleAddNewStudent = () => navigate("/student/add");
  const handleEditStudent = (id) => navigate(`/student/edit/${id}`);
  const handleViewApplications = (id) =>
    navigate(`/student/edit/${id}`, { state: { selectedApplicationId: id } });

  const filteredStudents =
    studentsData?.data?.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">
          Error loading students: {error.message}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Students
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Manage student profiles and applications
            </p>
          </div>
          <button
            onClick={handleAddNewStudent}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add New Student</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search students by ID, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <svg
              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
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
        </div>

        {/* ===== Desktop Table ===== */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Student ID",
                    "Name",
                    "Email",
                    "Phone",
                    "Applications",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500 text-sm"
                    >
                      {searchTerm
                        ? "No students found matching your search."
                        : "No students found. Add your first student!"}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {student.studentCode || student._id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 break-all">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {student.countryCode}
                        {student.phoneNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {student.applicationCount} Apply
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium space-x-3">
                        <button
                          onClick={() => handleEditStudent(student._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleViewApplications(student._id)}
                          className="text-green-600 hover:text-green-900"
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

        {/* ===== Mobile Card Layout ===== */}
        <div className="block md:hidden space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-lg p-4 shadow text-center text-gray-500 text-sm">
              {searchTerm
                ? "No students found matching your search."
                : "No students found. Add your first student!"}
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student._id}
                className="bg-white rounded-lg shadow p-4 border border-gray-100"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-base font-semibold text-gray-900">
                    {student.name}
                  </h2>
                  <span className="text-xs text-gray-500">
                    {student.studentCode || student._id.slice(0, 6)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 break-all">
                  <span className="font-medium">Email:</span> {student.email}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Phone:</span>{" "}
                  {student.countryCode}
                  {student.phoneNumber}
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-medium">Applications:</span>{" "}
                  {student.applicationCount}
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleEditStudent(student._id)}
                    className="text-blue-600 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewApplications(student._id)}
                    className="text-green-600 text-sm font-medium"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
