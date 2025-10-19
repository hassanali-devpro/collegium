import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useSearchCoursesQuery,
  useDeleteCourseMutation,
} from "../../features/courses/courseApi";
import { useCreateApplicationMutation, useGetApplicationsByStudentQuery } from "../../features/applications/applicationApi";

const ProgramCard = ({ studentId }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Debug logging (remove in production)
  console.log('CourseSearch - studentId:', studentId);
  console.log('CourseSearch - user role:', user?.role);

  // 🔎 Form state
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    type: "",
  });

  // API call with filters
  const { data, error, isLoading } = useSearchCoursesQuery({
    search: filters.search,
    country: filters.country,
    type: filters.type,
    page: 1,
    limit: 10,
  });

  const [deleteCourse] = useDeleteCourseMutation();
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

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this course?")) {
      await deleteCourse(id);
    }
  };

  const handleEdit = (program) => {
    navigate("/add-course", { state: { program } });
  };

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
          notes: "Application submitted via course search"
        }).unwrap();
        alert("✅ Student successfully applied to the course!");
      } catch (error) {
        console.error("Error applying to course:", error);
        alert("❌ Failed to apply to course. Please try again.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug info - remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong>Debug:</strong> Student ID: {studentId || 'Not provided'}
        </div>
      )}

      {/* Student ID warning */}
      {!studentId && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <strong>Note:</strong> No student selected. Please create a student profile first or navigate from the application page.
        </div>
      )}

      <div className="p-4 shadow-lg rounded-lg flex flex-col md:flex-row flex-wrap gap-4 items-center justify-start">
        <input
          type="text"
          placeholder="Search by name..."
          className="border border-gray-300 p-2 rounded-lg w-full md:flex-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <input
          type="text"
          placeholder="Country"
          className="border border-gray-300 p-2 rounded-lg w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
        />

        <select
          className="border border-gray-300 p-2 rounded-lg w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="Bachelors">Bachelors</option>
          <option value="Masters">Masters</option>
          <option value="PhD">PhD</option>
        </select>
      </div>


      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Failed to load courses</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data?.data?.length === 0 && (
          <p className="text-gray-500 col-span-2">No courses found.</p>
        )}

        {data?.data?.map((program) => (
          <div
            key={program._id}
            className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 border border-gray-200 relative"
          >
            {/* Title & University */}
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{program.name}</h2>
                <p className="text-sm text-gray-600">
                  {program.university} • {program.country}
                </p>
                {program.city && (
                  <p className="text-xs text-gray-500">{program.city}</p>
                )}
              </div>

              <div className="flex gap-2">
                {studentId ? (
                  // Show Apply button when in application mode (studentId exists)
                  hasAppliedToCourse(program._id) ? (
                    <button
                      disabled
                      className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg cursor-not-allowed shadow-sm"
                    >
                      ✓ Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApplyToCourse(program._id)}
                      disabled={isLinking}
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                    >
                      {isLinking ? "Applying..." : "Apply to Course"}
                    </button>
                  )
                ) : (
                  // Show admin buttons only when NOT in application mode (no studentId)
                  user?.role === "SuperAdmin" && (
                    <>
                      <button
                        onClick={() => handleEdit(program)}
                        className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(program._id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </>
                  )
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-800">
              {program.department && (
                <div>
                  <p className="font-semibold">Department:</p>
                  <p>{program.department}</p>
                </div>
              )}
              {program.intake && (
                <div>
                  <p className="font-semibold">Intake:</p>
                  <p>{program.intake}</p>
                </div>
              )}
              {program.type && (
                <div>
                  <p className="font-semibold">Type:</p>
                  <p>{program.type}</p>
                </div>
              )}
              {program.fee && (
                <div>
                  <p className="font-semibold">Fee:</p>
                  <p>{program.fee}</p>
                </div>
              )}
              {program.timePeriod && (
                <div>
                  <p className="font-semibold">Time Period:</p>
                  <p>{program.timePeriod}</p>
                </div>
              )}
              {program.percentageRequirement && (
                <div>
                  <p className="font-semibold">Percentage Requirement:</p>
                  <p>{program.percentageRequirement}</p>
                </div>
              )}
              {program.cgpaRequirement && (
                <div>
                  <p className="font-semibold">CGPA Requirement:</p>
                  <p>{program.cgpaRequirement}</p>
                </div>
              )}
              {program.isPrivate && (
                <div>
                  <p className="font-semibold">Private:</p>
                  <p>{program.isPrivate}</p>
                </div>
              )}
              {program.languageTest && (
                <div>
                  <p className="font-semibold">Language Test:</p>
                  <p>{program.languageTest}</p>
                </div>
              )}
              {program.minBands && (
                <div>
                  <p className="font-semibold">Minimum Bands / Score:</p>
                  <p>{program.minBands}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgramCard;
