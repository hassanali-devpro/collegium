import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useSearchCoursesQuery,
  useDeleteCourseMutation,
} from "../../features/courses/courseApi";
import { useCreateApplicationMutation, useGetApplicationsByStudentQuery } from "../../features/applications/applicationApi";
import { useToast } from "../../hooks/useToast";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import ToastContainer from "../../components/Toast/ToastContainer";
import ConfirmationModal from "../../components/ConfirmationModal";

const ProgramCard = ({ studentId }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  const { modalState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();

  // Debug logging (remove in production)
  console.log('CourseSearch - studentId:', studentId);
  console.log('CourseSearch - user role:', user?.role);

  // 🔎 Form state
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    type: "",
    university: "",
    intake: "",
    feeSort: "", // "high-to-low" or "low-to-high"
  });

  // 📄 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🔍 Debounced search state
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce search input to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1); // Reset to first page when filters change
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters]);

  // API call with debounced filters and pagination
  const { data, error, isLoading } = useSearchCoursesQuery({
    search: debouncedFilters.search,
    country: debouncedFilters.country,
    type: debouncedFilters.type,
    university: debouncedFilters.university,
    intake: debouncedFilters.intake,
    feeSort: debouncedFilters.feeSort,
    page: currentPage,
    limit: itemsPerPage,
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
    showConfirmation({
      title: "Delete Course",
      message: "Are you sure you want to delete this course? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteCourse(id).unwrap();
          success("Course deleted successfully!");
        } catch (error) {
          console.error("Error deleting course:", error);

          // Handle specific error messages from backend
          if (error?.data?.message) {
            showError(error.data.message);
          } else {
            showError("Failed to delete course. Please try again.");
          }
        }
      }
    });
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
      showError("Student ID not found. Please ensure you're on the correct page.");
      return;
    }

    showConfirmation({
      title: "Apply to Course",
      message: "Are you sure you want to apply this student to this course?",
      confirmText: "Apply",
      cancelText: "Cancel",
      type: "info",
      onConfirm: async () => {
        try {
          // Create application using the new Applications API
          await createApplication({
            studentId: studentId,
            courseId: courseId,
            priority: "medium",
            notes: "Application submitted via course search"
          }).unwrap();
          success("Student successfully applied to the course!");
        } catch (error) {
          console.error("Error applying to course:", error);
          showError("Failed to apply to course. Please try again.");
        }
      }
    });
  };

  // Pagination handlers with validation
  const handlePageChange = (page) => {
    // Validate page number
    if (page < 1 || page > totalPages) {
      console.warn(`Invalid page number: ${page}. Valid range: 1-${totalPages}`);
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setFilters({
      search: "",
      country: "",
      type: "",
      university: "",
      intake: "",
      feeSort: "",
    });
  };

  // Calculate pagination info from backend response
  const totalPages = data?.pagination?.totalPages || 1;
  const totalCourses = data?.pagination?.total || 0;

  // Debug logging for API response (remove in production)
  console.log('CourseSearch - API Response:', data);
  console.log('CourseSearch - Pagination:', data?.pagination);
  console.log('CourseSearch - Current Page:', currentPage);
  console.log('CourseSearch - Total Pages:', totalPages);

  return (
    <div className="space-y-4 sm:space-y-6 container mx-auto px-0 lg:px-8">

      <div className="p-3 sm:p-4 lg:p-6 shadow-lg rounded-lg bg-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-3 sm:gap-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Course Filters</h3>

          {/* Add Course Button - Only show for admin users when not in application mode */}
          {!studentId && user?.role && ['SuperAdmin', 'Admin', 'Agent'].includes(user.role) && (
            <button
              onClick={() => navigate("/add-course")}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Course
            </button>
          )}
        </div>

        {/* Search Bar - Full width on mobile */}
        <div className="mb-3 sm:mb-4">
          <input
            type="text"
            placeholder="Search courses..."
            className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Filter Grid - Responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Country"
            className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          />

          <input
            type="text"
            placeholder="University..."
            className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            value={filters.university}
            onChange={(e) => setFilters({ ...filters, university: e.target.value })}
          />

          <select
            className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            value={filters.intake}
            onChange={(e) => setFilters({ ...filters, intake: e.target.value })}
          >
            <option value="">Select Intake Month</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>

          <select
            className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="Bachelors">Bachelors</option>
            <option value="Masters">Masters</option>
            <option value="PhD">PhD</option>
          </select>

        </div>

        {/* Fee Sort - Full width on mobile, half on larger screens */}
        <div className="mt-3 sm:mt-4">
          <select
            className="border border-gray-300 p-2 sm:p-3 rounded-lg w-full sm:w-1/2 lg:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
            value={filters.feeSort}
            onChange={(e) => setFilters({ ...filters, feeSort: e.target.value })}
          >
            <option value="">Fee Sort</option>
            <option value="high-to-low">Fee: High to Low</option>
            <option value="low-to-high">Fee: Low to High</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-center sm:justify-end">
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto"
          >
            Clear All Filters
          </button>
        </div>
      </div>


      {/* Loading and Error States */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm sm:text-base text-gray-600">Loading courses...</p>
          </div>
        </div>
      )}

      {/* Show when filters are being applied (debounced) */}
      {!isLoading && filters !== debouncedFilters && (
        <div className="flex justify-center items-center py-4">
          <div className="text-center">
            <div className="animate-pulse rounded-full h-4 w-4 bg-blue-400 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Applying filters...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-sm sm:text-base text-red-600">Failed to load courses. Please try again.</p>
        </div>
      )}

      {/* Results Summary */}
      {data && !isLoading && (
        <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-1">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCourses)} of {totalCourses} courses
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {data?.data?.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-sm sm:text-base text-gray-500">No courses found.</p>
          </div>
        )}

        {data?.data?.map((program) => (
          <div
            key={program._id}
            className="w-full bg-white shadow-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 relative"
          >
            {/* Title & University */}
            <div className="mb-3 sm:mb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{program.name}</h2>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {program.university} • {program.country}
                  </p>
                  {program.city && (
                    <p className="text-xs text-gray-500 truncate">{program.city}</p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {studentId ? (
                    // Show Apply button when in application mode (studentId exists)
                    hasAppliedToCourse(program._id) ? (
                      <button
                        disabled
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-green-600 text-white rounded-lg cursor-not-allowed shadow-sm"
                      >
                        ✓ Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApplyToCourse(program._id)}
                        disabled={isLinking}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                      >
                        {isLinking ? "Applying..." : "Apply"}
                      </button>
                    )
                  ) : (
                    // Show admin buttons only when NOT in application mode (no studentId)
                    user?.role === "SuperAdmin" && (
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEdit(program)}
                          className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(program._id)}
                          className="px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-800">
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

      {/* Pagination Controls */}
      {data && totalPages > 1 && data?.data?.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 mt-6 sm:mt-8">
          {/* Mobile: Show page info */}
          <div className="text-xs sm:text-sm text-gray-600 sm:hidden">
            Page {currentPage} of {totalPages}
          </div>

          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="px-4 py-2 sm:px-3 sm:py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            ← Previous
          </button>

          {/* Page Numbers - Hide on mobile, show on larger screens */}
          <div className="hidden sm:flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={isLoading}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Mobile: Show current page number */}
          <div className="sm:hidden">
            <button
              disabled
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg"
            >
              {currentPage}
            </button>
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="px-4 py-2 sm:px-3 sm:py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Next →
          </button>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
      />
    </div>
  );
};

export default ProgramCard;
