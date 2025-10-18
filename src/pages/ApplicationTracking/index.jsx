import React, { useState, useEffect } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import {
  useGetStudentOptionQuery,
  useUpdateStudentOptionMutation,
} from "../../features/students/studentApi";

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
  const [studentId, setStudentId] = useState(null);
  const [localOptions, setLocalOptions] = useState(null);
  const [editedComments, setEditedComments] = useState({});
  const [editingComment, setEditingComment] = useState(null);

  const { data, isFetching, isError } = useGetStudentOptionQuery(studentId, {
    skip: !studentId,
  });

  const [updateStudentOption, { isLoading: isUpdating }] =
    useUpdateStudentOptionMutation();

  const handleSearch = () => {
    if (searchId.trim()) {
      setStudentId(searchId.trim());
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

  const student = data?.data;

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
    <section className="min-h-screen bg-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl p-8 border border-gray-100 bg-white">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
          Application Tracking
        </h2>

        {/* 🔍 Search Section */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Enter Student ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={isFetching}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition disabled:opacity-50"
          >
            {isFetching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* 🧾 Results */}
        {isFetching ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : isError ? (
          <p className="text-center text-red-500">Error fetching data.</p>
        ) : student && localOptions ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-bold text-gray-800">
                {student.name} ({student._id})
              </h3>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Email:</span> {student.email}
              </p>
            </div>

            <div className="relative border-l-2 border-gray-300 pl-6 space-y-8">
              {stageTitles.map((stage, index) => {
                const done = localOptions[stage.key];
                const commentKey = `${stage.key}Comment`;
                const commentValue = editedComments[commentKey] || "";

                return (
                  <div key={stage.key} className="relative">
                    <span
                      className={`absolute -left-[22px] flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        done
                          ? "bg-green-600 border-green-600 text-white"
                          : "border-gray-400 text-gray-600 bg-white"
                      }`}
                    >
                      {done ? <Check size={16} /> : index + 1}
                    </span>

                    <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                      <h3 className="font-semibold text-gray-800">
                        {stage.label}
                      </h3>

                      {/* Comment UI */}
                      <div className="mt-3">
                        {commentValue && editingComment !== stage.key ? (
                          <div className="flex justify-between items-center bg-white border border-gray-300 rounded-md px-3 py-2">
                            <p className="text-sm text-gray-700 flex-1">
                              {commentValue}
                            </p>
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
                              onChange={(e) =>
                                handleCommentChange(stage.key, e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleSaveComment(stage.key);
                              }}
                              className="flex-1 border border-gray-300 rounded-l-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleSaveComment(stage.key)}
                              disabled={isUpdating}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 rounded-r-md text-sm font-medium transition disabled:opacity-50"
                            >
                              {isUpdating ? (
                                <Loader2
                                  size={14}
                                  className="animate-spin inline"
                                />
                              ) : (
                                commentValue
                                  ? "Save Update"
                                  : "Add Comment"
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Stage Button */}
                      <button
                        onClick={() => handleToggleStage(stage.key)}
                        disabled={isUpdating}
                        className={`mt-3 text-xs px-3 py-1 rounded-lg font-medium transition disabled:opacity-50 ${
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
                          "Done"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-10">
            Enter a Student ID above to view application progress.
          </p>
        )}
      </div>
    </section>
  );
};

export default ApplicationTracking;
