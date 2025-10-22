import React, { useState, useEffect } from 'react';
import { useGetStudentByIdQuery } from '../../features/students/studentApi';
import { useGetApplicationsByStudentQuery, useDeleteApplicationMutation } from '../../features/applications/applicationApi';
import { useToastContext } from '../../contexts/ToastContext';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import ConfirmationModal from '../ConfirmationModal';
import { CheckCircle, XCircle, Clock, AlertCircle, Trash2, MessageCircle, Eye, Plus } from 'lucide-react';
import ApplicationComments from '../ApplicationComments';

const ApplicationTabLayout = ({ studentId, onNavigateToPrograms, initialSelectedApplicationId }) => {
  const [selectedApplicationId, setSelectedApplicationId] = useState(initialSelectedApplicationId || null);
  const [activeCommentTab, setActiveCommentTab] = useState('kcTeam');
  const { success, error: showError } = useToastContext();
  const { modalState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();

  const { data: studentData, isLoading: studentLoading } = useGetStudentByIdQuery(studentId, {
    skip: !studentId
  });

  const { data: applicationsData, isLoading: applicationsLoading, refetch } = useGetApplicationsByStudentQuery({
    studentId,
    page: 1,
    limit: 50,
    sortBy: 'applicationDate',
    sortOrder: 'desc'
  }, {
    skip: !studentId
  });

  const [deleteApplication, { isLoading: isDeleting }] = useDeleteApplicationMutation();

  // Auto-select first application if no initial selection and applications are loaded
  useEffect(() => {
    if (applicationsData?.data && applicationsData.data.length > 0 && !selectedApplicationId) {
      // If we have an initial selection, use it; otherwise select the first application
      const firstApplication = applicationsData.data[0];
      setSelectedApplicationId(firstApplication._id);
    }
  }, [applicationsData?.data, selectedApplicationId]);

  // Update selection when initialSelectedApplicationId changes
  useEffect(() => {
    if (initialSelectedApplicationId) {
      setSelectedApplicationId(initialSelectedApplicationId);
    }
  }, [initialSelectedApplicationId]);

  const handleRemoveApplication = async (applicationId) => {
    const application = applications.find(app => app._id === applicationId);
    const courseName = application?.courseId?.name || 'this course';
    
    showConfirmation({
      title: "Remove Application",
      message: `Are you sure you want to remove the application for ${courseName}? This action cannot be undone.`,
      confirmText: "Remove",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteApplication(applicationId).unwrap();
          success("Application removed successfully!");
          refetch(); // Refresh the applications list
          // If the removed application was selected, clear selection
          if (selectedApplicationId === applicationId) {
            setSelectedApplicationId(null);
          }
        } catch (error) {
          console.error("Error removing application:", error);
          showError("Failed to remove application. Please try again.");
        }
      }
    });
  };

  if (!studentId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Selected</h3>
          <p className="text-gray-500">Please navigate to this page with a valid student ID.</p>
        </div>
      </div>
    );
  }

  if (studentLoading || applicationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const student = studentData?.data;
  const applications = applicationsData?.data || [];
  const selectedApplication = applications.find(app => app._id === selectedApplicationId);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityTagColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Student Info Header */}
      {student && (
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Applied Programs</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToPrograms}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                Apply to Course
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span><strong>Student:</strong> {student.name}</span>
            <span><strong>ID:</strong> {student.studentCode}</span>
            <span><strong>Email:</strong> {student.email}</span>
          </div>
        </div>
      )}

      {/* Main Content Area - Applied Programs Only */}
      <div className="flex-1">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 min-h-0 h-full">
          {/* Left Panel - Applications List */}
          <div className="w-full lg:w-1/3 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Applications ({applications.length})</h3>
                <div className="lg:hidden text-xs text-gray-500 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Swipe to see more
                </div>
              </div>
            </div>
            
            {/* Mobile/Tablet: Horizontal scrolling list */}
            <div className="lg:hidden flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="flex space-x-3 p-3 min-w-max">
                {applications.length === 0 ? (
                  <div className="flex-shrink-0 w-64 p-4 text-center bg-gray-50 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-sm font-medium text-gray-900 mb-1">No Applications</h3>
                    <p className="text-gray-500 text-xs">No programs applied yet</p>
                  </div>
                ) : (
                  applications.map((application, index) => (
                    <div 
                      key={application._id || index} 
                      className={`flex-shrink-0 w-64 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedApplicationId === application._id
                          ? 'bg-blue-50 border-blue-300 shadow-md'
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedApplicationId(application._id)}
                    >
                      {/* Compact Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {application.courseId?.name || 'Unknown Course'}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {application.courseId?.university || 'N/A'}
                          </div>
                        </div>
                        {application.priority && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityTagColor(application.priority)} flex-shrink-0 ml-2`}>
                            {application.priority === 'urgent' ? '1st' : application.priority}
                          </span>
                        )}
                      </div>

                      {/* Minimal Info */}
                      <div className="text-xs text-gray-500 mb-2">
                        <div>Ack: {application.applicationNumber || `APP-${application._id?.slice(-6)}`}</div>
                        <div>{new Date(application.createdAt || application.applicationDate).toLocaleDateString()}</div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApplicationId(selectedApplicationId === application._id ? null : application._id);
                            }}
                            className={`p-1 rounded transition-colors ${
                              selectedApplicationId === application._id 
                                ? 'text-blue-600 bg-blue-100' 
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="View Details"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveApplication(application._id);
                            }}
                            disabled={isDeleting}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                            title="Remove Application"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* Status Indicator */}
                        <div className="text-xs">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Desktop: Vertical scrolling list */}
            <div className="hidden lg:flex flex-1 overflow-y-auto">
              {applications.length === 0 ? (
                <div className="p-4 sm:p-6 text-center">
                  <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No Applications Yet</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">This student hasn't applied to any programs yet.</p>
                </div>
              ) : (
                <div className="p-1 sm:p-2 space-y-1 sm:space-y-2 w-full">
                  {applications.map((application, index) => (
                    <div 
                      key={application._id || index} 
                      className={`p-2 sm:p-3 lg:p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedApplicationId === application._id
                          ? 'bg-blue-50 border-blue-300 shadow-md'
                          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedApplicationId(application._id)}
                    >
                      {/* Application Header */}
                      <div className="flex items-start justify-between mb-1 sm:mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1 truncate">
                            Ack. No: {application.applicationNumber || `APP-${application._id?.slice(-6)}`}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            Date: {new Date(application.createdAt || application.applicationDate).toLocaleDateString()}
                          </div>
                        </div>
                        {application.priority && (
                          <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${getPriorityTagColor(application.priority)} flex-shrink-0 ml-2`}>
                            {application.priority === 'urgent' ? '1st' : application.priority}
                          </span>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="text-xs sm:text-sm text-gray-700 mb-1">
                        <div className="font-medium truncate">Course: {application.courseId?.name || 'Unknown Course'}</div>
                        <div className="text-gray-600 truncate">University: {application.courseId?.university || 'N/A'}</div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-2 sm:mt-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedApplicationId(selectedApplicationId === application._id ? null : application._id);
                            }}
                            className={`p-1 rounded transition-colors ${
                              selectedApplicationId === application._id 
                                ? 'text-blue-600 bg-blue-100' 
                                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveApplication(application._id);
                            }}
                            disabled={isDeleting}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                            title="Remove Application"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        
                        {/* Application Fee Status */}
                        <div className="text-xs">
                          <span className="px-1 sm:px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            No Fee
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Application Details and Comments */}
          <div className="flex-1 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col">
            {selectedApplication ? (
              <>
                {/* Application Details Header */}
                <div className="p-3 sm:p-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                      <span className="font-medium text-gray-700">Ack. No:</span>
                      <span className="ml-1 sm:ml-2 text-blue-600 font-semibold underline">
                        {selectedApplication.applicationNumber || `APP-${selectedApplication._id?.slice(-6)}`}
                      </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Date: {new Date(selectedApplication.createdAt || selectedApplication.applicationDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">
                        View Program Details
                      </button>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="space-y-1 sm:space-y-2">
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">Course:</span>
                      <span className="ml-1 sm:ml-2 text-gray-900">{selectedApplication.courseId?.name || 'Unknown Course'}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">University:</span>
                      <span className="ml-1 sm:ml-2 text-gray-900">{selectedApplication.courseId?.university || 'N/A'}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">Start Month:</span>
                      <span className="ml-1 sm:ml-2 text-gray-900">{selectedApplication.courseId?.intake || 'N/A'}</span>
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium text-gray-700">Application Fee Status:</span>
                      <span className="ml-1 sm:ml-2 px-1 sm:px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        No Application Fee
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="p-3 sm:p-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Comments</h3>
                    
                  </div>

                  {/* Comments Component */}
                  <div className="flex-1 min-h-0">
                    <ApplicationComments 
                      applicationId={selectedApplication._id} 
                      comments={selectedApplication.comments || []}
                      activeTab={activeCommentTab}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-4 sm:p-6">
                  <Eye className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Select an Application</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">Choose an application from the left panel to view its details and comments.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        type={modalState.type}
        onConfirm={handleConfirm}
        onCancel={hideConfirmation}
      />
    </div>
  );
};

export default ApplicationTabLayout;
