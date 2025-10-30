import React, { useState, useEffect } from "react";
import { Check, Loader2, Pencil, Search, User, FileText, AlertCircle } from "lucide-react";
import {
  useGetStudentOptionQuery,
  useUpdateStudentOptionMutation,
  useGetStudentByIdQuery,
} from "../../features/students/studentApi";
import { useUnifiedSearchQuery } from "../../features/applications/applicationApi";
import { useConfirmationModal } from "../../hooks/useConfirmationModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import ApplicationTabLayout from "../../components/ApplicationTabLayout";

const stageTitles = [
  { key: "clients", label: "Taking Client Requirements" },
  { key: "initialPayment", label: "Initial Payment" },
  { key: "documents", label: "Documents" },
  { key: "applications", label: "Applications" },
  { key: "offerLetterSecured", label: "Offer Letter Secured" },
  { key: "secondPaymentDone", label: "Second Payment" },
  { key: "visaApplication", label: "Visa Application" },
  { key: "visaSecured", label: "Visa Secured" },
  { key: "finalPayment", label: "Final Payment" },
];

const ApplicationTracking = () => {
  const [searchId, setSearchId] = useState("");
  const [debouncedSearchId, setDebouncedSearchId] = useState("");
  const [studentId, setStudentId] = useState(null);
  const [localOptions, setLocalOptions] = useState(null);
  const [editedComments, setEditedComments] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [activeTab, setActiveTab] = useState("tracking");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const { modalState, showConfirmation, hideConfirmation, handleConfirm } = useConfirmationModal();

  const { data, isFetching, isError } = useGetStudentOptionQuery(studentId, {
    skip: !studentId,
  });

  const { data: studentData, isLoading: studentLoading } = useGetStudentByIdQuery(studentId, {
    skip: !studentId,
  });

  const { data: unifiedSearchData, isLoading: isUnifiedSearching, error: unifiedSearchError } =
    useUnifiedSearchQuery(
      {
        q: debouncedSearchId,
        limit: 10,
      },
      {
        skip: !debouncedSearchId || debouncedSearchId.length < 2,
      }
    );

  const [updateStudentOption, { isLoading: isUpdating }] = useUpdateStudentOptionMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchId(searchId);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchId]);

  const handleSearch = () => {
    if (searchId.trim()) {
      setShowDropdown(true);
    }
  };

  const handleSearchResultSelect = (result) => {
    if (result.type === "student") {
      setStudentId(result._id);
      setActiveTab("tracking");
      setShowDropdown(false);
      setSearchId("");
      setSearchResults(null);
    } else if (result.type === "application") {
      const studentIdValue =
        typeof result.studentId === "object" ? result.studentId._id : result.studentId;
      setStudentId(studentIdValue);
      setSelectedApplicationId(result._id);
      setActiveTab("applications");
      setShowDropdown(false);
      setSearchId("");
      setSearchResults(null);
    }
  };

  const handleExactMatch = (data, type) => {
    if (type === "exact_student") {
      setStudentId(data._id);
      setActiveTab("tracking");
      setSearchId("");
      setSearchResults(null);
    } else if (type === "exact_application") {
      const studentIdValue =
        typeof data.studentId === "object" ? data.studentId._id : data.studentId;
      setStudentId(studentIdValue);
      setSelectedApplicationId(data._id);
      setActiveTab("applications");
      setSearchId("");
      setSearchResults(null);
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

  useEffect(() => {
    if (data?.data?.studentOptions) {
      setLocalOptions(data.data.studentOptions);
      setEditedComments(
        Object.fromEntries(
          Object.entries(data.data.studentOptions)
            .filter(([key]) => key.endsWith("Comment"))
            .map(([key, value]) => [key, value || ""])
        )
      );
    }
  }, [data]);

  useEffect(() => {
    if (unifiedSearchData) {
      if (
        unifiedSearchData.type === "exact_student" ||
        unifiedSearchData.type === "exact_application"
      ) {
        handleExactMatch(unifiedSearchData.data, unifiedSearchData.type);
        setShowDropdown(false);
      } else if (unifiedSearchData.type === "multiple_results") {
        setSearchResults(unifiedSearchData.data);
        setShowDropdown(true);
      }
    }
  }, [unifiedSearchData, unifiedSearchError, isUnifiedSearching]);

  const student = studentData?.data || data?.data;

  const handleToggleStage = async (key) => {
    if (!student || !localOptions) return;
    const updated = { ...localOptions, [key]: !localOptions[key] };
    setLocalOptions(updated);

    try {
      await updateStudentOption({ id: student._id, ...updated }).unwrap();
    } catch (error) {
      console.error("Stage update failed:", error);
    }
  };

  const handleCommentChange = (key, value) => {
    setEditedComments((prev) => ({ ...prev, [`${key}Comment`]: value }));
  };

  const handleSaveComment = async (key) => {
    if (!student) return;
    const commentKey = `${key}Comment`;
    const updated = { ...localOptions, [commentKey]: editedComments[commentKey] };
    setLocalOptions(updated);
    setEditingComment(null);
    try {
      await updateStudentOption({ id: student._id, ...updated }).unwrap();
    } catch (error) {
      console.error("Comment update failed:", error);
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 flex flex-col py-6 px-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
            Application Tracking & Management
          </h2>

          {/* Unified Search Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by Student ID, Student Code, Email, Application Number..."
                  value={searchId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchId(value);
                    if (value.length >= 2) {
                      setShowDropdown(true);
                    } else {
                      setShowDropdown(false);
                      setSearchResults(null);
                      setDebouncedSearchId("");
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isUnifiedSearching || !searchId.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                {isUnifiedSearching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
            <p className="text-red-600">Failed to fetch student information. Please try again.</p>
          </div>
        ) : student && localOptions ? (
          <div className="space-y-6">
            {/* Student Info Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {student.name} ({student.studentCode || student._id})
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                    <span>
                      <strong>Email:</strong> {student.email}
                    </span>
                    <span>
                      <strong>Phone:</strong> {student.phone || "N/A"}
                    </span>
                    <span>
                      <strong>Agent:</strong> {student.agentId?.name || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("tracking")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "tracking"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <Check className="w-4 h-4 inline mr-2" />
                    Progress Tracking
                  </button>
                  <button
                    onClick={() => setActiveTab("applications")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "applications"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Applications
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "tracking" ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Application Progress</h3>
                <div className="relative border-l-2 border-gray-300 pl-6 space-y-10">
                  {stageTitles.map((stage, index) => {
                    const done = localOptions[stage.key];
                    const commentKey = `${stage.key}Comment`;
                    const commentValue = editedComments[commentKey] || "";

                    return (
                      <div key={stage.key} className="relative">
                        {/* Stage Circle */}
                        <span
                          className={`absolute -left-[22px] flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                            done
                              ? "bg-green-600 border-green-600 text-white"
                              : "border-gray-400 text-gray-600 bg-white"
                          }`}
                        >
                          {done ? <Check size={16} /> : index + 1}
                        </span>

                        {/* Stage Content */}
                        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                          <h3 className="font-semibold text-gray-800 mb-3">{stage.label}</h3>

                          <div className="mb-3">
                            {commentValue && editingComment !== stage.key ? (
                              <div className="flex justify-between items-center bg-white border border-gray-300 rounded-md px-3 py-2">
                                <p className="text-sm text-gray-700 flex-1">{commentValue}</p>
                                <button
                                  onClick={() => setEditingComment(stage.key)}
                                  className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
                                >
                                  <Pencil size={14} /> Update
                                </button>
                              </div>
                            ) : (
                              <div className="flex">
                                <input
                                  type="text"
                                  placeholder="Add comment..."
                                  value={commentValue}
                                  onChange={(e) => handleCommentChange(stage.key, e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleSaveComment(stage.key)}
                                  className="flex-1 border border-gray-300 rounded-l-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => handleSaveComment(stage.key)}
                                  disabled={isUpdating}
                                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 rounded-r-md text-sm font-medium transition disabled:opacity-50"
                                >
                                  {isUpdating ? (
                                    <Loader2 size={14} className="animate-spin inline" />
                                  ) : commentValue ? (
                                    "Save Update"
                                  ) : (
                                    "Add Comment"
                                  )}
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleToggleStage(stage.key)}
                            disabled={isUpdating}
                            className={`text-xs px-3 py-1 rounded-lg font-medium transition disabled:opacity-50 ${
                              done
                                ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                                : "bg-green-100 hover:bg-green-200 text-green-800"
                            }`}
                          >
                            {isUpdating ? (
                              <Loader2 size={14} className="animate-spin inline" />
                            ) : done ? (
                              "Undone"
                            ) : (
                              "Mark as Done"
                            )}
                          </button>
                        </div>

                        {/* Down Arrow between stages */}
                        {index < stageTitles.length - 1 && (
                          <div className="absolute -left-[13px] top-full mt-1 text-gray-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <ApplicationTabLayout
                studentId={studentId}
                initialSelectedApplicationId={selectedApplicationId}
                onNavigateToPrograms={() => setActiveTab("tracking")}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search for Applications</h3>
            <p className="text-gray-500">
              Enter a Student ID, Student Code, Email, or Application Number above to view
              application progress and details.
            </p>
          </div>
        )}
      </div>

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
    </section>
  );
};

export default ApplicationTracking;
