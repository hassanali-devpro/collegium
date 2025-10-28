import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetApplicationByIdQuery } from '../../features/applications/applicationApi';
import { CheckCircle, XCircle, Clock, AlertCircle, MessageCircle, ArrowLeft, Loader } from 'lucide-react';
import ApplicationComments from '../../components/ApplicationComments';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeCommentTab, setActiveCommentTab] = useState('kcTeam');

  const { data, isLoading, error } = useGetApplicationByIdQuery(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error loading application: {error.message}</div>
      </div>
    );
  }

  const application = data?.data;

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Application not found</div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/applications')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Applications
        </button>

        {/* Application Details Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Application #{application.applicationNumber || application._id}
            </h1>
            <div className="flex items-center gap-2">
              {getStatusIcon(application.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                {application.status || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Application Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">Student</p>
              <p className="font-medium text-gray-900">
                {typeof application.studentId === 'object' 
                  ? application.studentId.name 
                  : application.studentName || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Student Code</p>
              <p className="font-medium text-gray-900">
                {typeof application.studentId === 'object' 
                  ? application.studentId.studentCode 
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Course</p>
              <p className="font-medium text-gray-900">
                {typeof application.courseId === 'object' 
                  ? application.courseId.name 
                  : application.courseName || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">University</p>
              <p className="font-medium text-gray-900">
                {typeof application.courseId === 'object' 
                  ? application.courseId.university 
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Application Date</p>
              <p className="font-medium text-gray-900">
                {application.applicationDate 
                  ? new Date(application.applicationDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            {application.priority && (
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className="font-medium text-gray-900 capitalize">{application.priority}</p>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
          </div>

          <ApplicationComments
            applicationId={application._id}
            activeTab={activeCommentTab}
            setActiveTab={setActiveCommentTab}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;

