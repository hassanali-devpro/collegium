import React, { useState } from 'react';
import { useGetStudentByIdQuery } from '../../features/students/studentApi';
import { useGetApplicationsByStudentQuery, useDeleteApplicationMutation } from '../../features/applications/applicationApi';
import { useToastContext } from '../../contexts/ToastContext';
import { useConfirmationModal } from '../../hooks/useConfirmationModal';
import ConfirmationModal from '../ConfirmationModal';
import { CheckCircle, XCircle, Clock, AlertCircle, Trash2, MessageCircle } from 'lucide-react';
import ApplicationComments from '../ApplicationComments';

const AppliedPrograms = ({ studentId }) => {
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Student Info Header */}
      {student && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Applied Programs</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span><strong>Student:</strong> {student.name}</span>
            <span><strong>ID:</strong> {student.studentCode}</span>
            <span><strong>Email:</strong> {student.email}</span>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-500">This student hasn't applied to any programs yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Go to the "Select Program" tab to browse and apply to available courses.
            </p>
          </div>
        ) : (
          applications.map((application, index) => (
            <div key={application._id || index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {application.courseId?.name || 'Unknown Course'}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span><strong>University:</strong> {application.courseId?.university}</span>
                    <span><strong>Country:</strong> {application.courseId?.country}</span>
                    {application.courseId?.city && (
                      <span><strong>City:</strong> {application.courseId?.city}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span><strong>Type:</strong> {application.courseId?.type}</span>
                    <span><strong>Department:</strong> {application.courseId?.department}</span>
                    <span><strong>Intake:</strong> {application.courseId?.intake}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Application Priority */}
                  <div className="flex flex-col gap-2">
                    {application.priority && (
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium ${
                        application.priority === 'urgent' ? 'bg-red-100 text-red-800 border-red-200' :
                        application.priority === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        application.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        Priority: {application.priority}
                      </div>
                    )}
                  </div>
                  
                  {/* Comments Button */}
                  <button
                    onClick={() => setSelectedApplicationId(selectedApplicationId === application._id ? null : application._id)}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedApplicationId === application._id 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title="View Comments"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveApplication(application._id)}
                    disabled={isDeleting}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    title="Remove Application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Course Details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {application.courseId?.fee && (
                  <div>
                    <span className="font-medium text-gray-700">Fee:</span>
                    <span className="ml-2 text-gray-600">{application.courseId.fee}</span>
                  </div>
                )}
                {application.courseId?.timePeriod && (
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-600">{application.courseId.timePeriod}</span>
                  </div>
                )}
                {application.courseId?.languageTest && (
                  <div>
                    <span className="font-medium text-gray-700">Language Test:</span>
                    <span className="ml-2 text-gray-600">{application.courseId.languageTest}</span>
                  </div>
                )}
                {application.courseId?.minBands && (
                  <div>
                    <span className="font-medium text-gray-700">Min. Score:</span>
                    <span className="ml-2 text-gray-600">{application.courseId.minBands}</span>
                  </div>
                )}
                {application.courseId?.percentageRequirement && (
                  <div>
                    <span className="font-medium text-gray-700">Percentage Req:</span>
                    <span className="ml-2 text-gray-600">{application.courseId.percentageRequirement}</span>
                  </div>
                )}
                {application.courseId?.cgpaRequirement && (
                  <div>
                    <span className="font-medium text-gray-700">CGPA Req:</span>
                    <span className="ml-2 text-gray-600">{application.courseId.cgpaRequirement}</span>
                  </div>
                )}
              </div>

              {/* Application Notes */}
              {application.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Notes:</span>
                    <p className="mt-1 text-gray-600">{application.notes}</p>
                  </div>
                </div>
              )}

              {/* Application Info */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Applied on: {new Date(application.createdAt || application.applicationDate).toLocaleDateString()}
                </div>
                {application.applicationNumber && (
                  <div className="text-xs text-gray-500">
                    App #: {application.applicationNumber}
                  </div>
                )}
              </div>

              {/* Comments Section */}
              {selectedApplicationId === application._id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <ApplicationComments 
                    applicationId={application._id} 
                    comments={application.comments || []}
                  />
                </div>
              )}
            </div>
          ))
        )}
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

export default AppliedPrograms;
