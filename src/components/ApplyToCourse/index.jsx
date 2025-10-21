import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  useSearchCoursesQuery,
} from "../../features/courses/courseApi";
import { useCreateApplicationMutation, useGetApplicationsByStudentQuery } from "../../features/applications/applicationApi";

const ApplyToCourse = ({ studentId }) => {
  const { user } = useSelector((state) => state.auth);

  // 🔎 Form state
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    type: "",
    university: "",
    intake: "",
    feeSort: "", // "high-to-low" or "low-to-high"
  });

  // API call with filters
  const { data, error, isLoading } = useSearchCoursesQuery({
    search: filters.search,
    country: filters.country,
    type: filters.type,
    university: filters.university,
    intake: filters.intake,
    feeSort: filters.feeSort,
    page: 1,
    limit: 20,
  });

  const [createApplication, { isLoading: isLinking }] = useCreateApplicationMutation();

  // Fetch student's applications to check which courses they've already applied to
  const { data: studentApplications } = useGetApplicationsByStudentQuery({
    studentId,
    page: 1,
    limit: 100, // Get all applications to check against
    sortBy: 'applicationDate',
    sortOrder: 'desc'
  }, {
    skip: !studentId // Only fetch if studentId exists
  });

  // Helper function to check if student has already applied to a course
  const hasAppliedToCourse = (courseId) => {
    if (!studentApplications?.data) return false;
    return studentApplications.data.some(app => app.courseId?._id === courseId);
  };

  const handleApplyToCourse = async (courseId) => {
    if (!studentId) {
      alert("Student ID not found. Please ensure you're on the correct page.");
      return;
    }

    if (confirm("Are you sure you want to apply this student to this course?")) {
      try {
        // Create application using the new Applications API
        await createApplication({
          studentId: studentId,
          courseId: courseId,
          priority: "medium",
          notes: "Application submitted via application module"
        }).unwrap();
        alert("✅ Student successfully applied to the course!");
      } catch (error) {
        console.error("Error applying to course:", error);
        alert("❌ Failed to apply to course. Please try again.");
      }
    }
  };

  if (!studentId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Selected</h3>
          <p className="text-gray-500">Please navigate to this page with a valid student ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Filters */}
      <div className="p-4 shadow-lg rounded-lg bg-white">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Filters</h3>
        
        {/* First Row - Search and Country */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by course name..."
            className="border border-gray-300 p-2 rounded-lg w-full md:flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          <input
            type="text"
            placeholder="Country"
            className="border border-gray-300 p-2 rounded-lg w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          />
        </div>

        {/* Second Row - University, Intake, Type, Fee Sort */}
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="University"
            className="border border-gray-300 p-2 rounded-lg w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.university}
            onChange={(e) => setFilters({ ...filters, university: e.target.value })}
          />

          <input
            type="text"
            placeholder="Intake (e.g., Fall 2024, Spring 2025)"
            className="border border-gray-300 p-2 rounded-lg w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.intake}
            onChange={(e) => setFilters({ ...filters, intake: e.target.value })}
          />

          <select
            className="border border-gray-300 p-2 rounded-lg w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="Bachelors">Bachelors</option>
            <option value="Masters">Masters</option>
            <option value="PhD">PhD</option>
          </select>

          <select
            className="border border-gray-300 p-2 rounded-lg w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={filters.feeSort}
            onChange={(e) => setFilters({ ...filters, feeSort: e.target.value })}
          >
            <option value="">Fee Sort</option>
            <option value="high-to-low">Fee: High to Low</option>
            <option value="low-to-high">Fee: Low to High</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({
              search: "",
              country: "",
              type: "",
              university: "",
              intake: "",
              feeSort: "",
            })}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading courses...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Failed to load courses. Please try again.
        </div>
      )}

      {/* Course Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.data?.length === 0 && (
          <div className="col-span-full text-center py-8">
            <div className="w-16 h-16 text-gray-300 mx-auto mb-4">🔍</div>
            <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms.</p>
          </div>
        )}

        {data?.data?.map((program) => (
          <div
            key={program._id}
            className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow"
          >
            {/* Title & University */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{program.name}</h3>
              <p className="text-sm text-gray-600 mb-1">
                {program.university} • {program.country}
              </p>
              {program.city && (
                <p className="text-xs text-gray-500">{program.city}</p>
              )}
            </div>

            {/* Course Details */}
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              {program.department && (
                <div className="flex justify-between">
                  <span className="font-medium">Department:</span>
                  <span>{program.department}</span>
                </div>
              )}
              {program.intake && (
                <div className="flex justify-between">
                  <span className="font-medium">Intake:</span>
                  <span>{program.intake}</span>
                </div>
              )}
              {program.type && (
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <span>{program.type}</span>
                </div>
              )}
              {program.fee && (
                <div className="flex justify-between">
                  <span className="font-medium">Fee:</span>
                  <span className="font-semibold text-green-600">{program.fee}</span>
                </div>
              )}
              {program.timePeriod && (
                <div className="flex justify-between">
                  <span className="font-medium">Duration:</span>
                  <span>{program.timePeriod}</span>
                </div>
              )}
            </div>

            {/* Apply Button */}
            <div className="pt-4 border-t border-gray-200">
              {hasAppliedToCourse(program._id) ? (
                <button
                  disabled
                  className="w-full px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg cursor-not-allowed shadow-sm"
                >
                  ✓ Already Applied
                </button>
              ) : (
                <button
                  onClick={() => handleApplyToCourse(program._id)}
                  disabled={isLinking}
                  className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                >
                  {isLinking ? "Applying..." : "Apply to Course"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApplyToCourse;
