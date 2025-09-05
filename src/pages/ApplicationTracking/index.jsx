// src/pages/ApplicationTracking.jsx
import React, { useState } from "react";
import { Check } from "lucide-react";

const stageTitles = [
  "Initial Payment",
  "Documents",
  "Applications",
  "Offer Letter Secured",
  "Second Payment",
  "Visa Application",
  "Visa Secured",
  "Final Payment",
  "Orientation",
  "Enrollment Complete",
];

const ApplicationTracking = () => {
  const [searchId, setSearchId] = useState("");
  const [searchedApp, setSearchedApp] = useState(null);

  // Dummy applications with name, university, program
  const [applications, setApplications] = useState([
    {
      studentId: "STU001",
      studentName: "Ali Khan",
      university: "University of Oxford",
      program: "MSc Computer Science",
      stages: stageTitles.map((title, i) => ({
        title,
        passed: i < 3, // first 3 passed
        comments:
          i === 0
            ? ["Payment received on Aug 15"]
            : i === 1
            ? ["Passport uploaded", "Transcript submitted"]
            : i === 2
            ? ["Application form submitted"]
            : [],
      })),
    },
    {
      studentId: "STU002",
      studentName: "Sara Ahmed",
      university: "Harvard University",
      program: "MBA",
      stages: stageTitles.map((title, i) => ({
        title,
        passed: i < 5, // first 5 passed
        comments:
          i === 0
            ? ["Initial fee cleared"]
            : i === 4
            ? ["Second payment verified"]
            : [],
      })),
    },
  ]);

  const handleSearch = () => {
    const found = applications.find(
      (app) => app.studentId.toLowerCase() === searchId.toLowerCase()
    );
    setSearchedApp(found || null);
  };

  const handlePassStage = (stageIndex) => {
    if (!searchedApp) return;
    const updated = { ...searchedApp };
    updated.stages[stageIndex].passed = true;

    setApplications((prev) =>
      prev.map((app) =>
        app.studentId === updated.studentId ? updated : app
      )
    );
    setSearchedApp(updated);
  };

  const handleAddComment = (stageIndex, comment) => {
    if (!comment) return;
    const updated = { ...searchedApp };
    updated.stages[stageIndex].comments.push(comment);

    setApplications((prev) =>
      prev.map((app) =>
        app.studentId === updated.studentId ? updated : app
      )
    );
    setSearchedApp(updated);
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      {/* Search Section */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter Student ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Search
        </button>
      </div>

      {/* Show Application */}
      {searchedApp ? (
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
          {/* Student Info */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800">
              {searchedApp.studentName} ({searchedApp.studentId})
            </h2>
            <p className="text-gray-700 text-sm">
              <span className="font-semibold">University:</span>{" "}
              {searchedApp.university}
            </p>
            <p className="text-gray-700 text-sm">
              <span className="font-semibold">Program:</span>{" "}
              {searchedApp.program}
            </p>
          </div>

          {/* Vertical Timeline */}
          <div className="relative border-l-2 border-gray-300 pl-6 space-y-8">
            {searchedApp.stages.map((stage, stageIndex) => (
              <div key={stageIndex} className="relative">
                {/* Circle */}
                <span
                  className={`absolute -left-[22px] flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    stage.passed
                      ? "bg-green-600 border-green-600 text-white"
                      : "border-gray-400 text-gray-600 bg-white"
                  }`}
                >
                  {stage.passed ? <Check size={16} /> : stageIndex + 1}
                </span>

                {/* Stage Content */}
                <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-gray-800">
                    {stage.title}
                  </h3>

                  {/* Comments */}
                  <div className="mt-2 space-y-1">
                    {stage.comments.map((c, i) => (
                      <p
                        key={i}
                        className="text-xs text-gray-600 border-b border-gray-200 pb-1"
                      >
                        {c}
                      </p>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <div className="flex mt-2">
                    <input
                      type="text"
                      placeholder="Add comment..."
                      className="flex-1 border border-gray-300 rounded-l-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddComment(stageIndex, e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousSibling;
                        handleAddComment(stageIndex, input.value);
                        input.value = "";
                      }}
                      className="bg-blue-600 text-white px-3 rounded-r-md text-sm"
                    >
                      Add
                    </button>
                  </div>

                  {/* Pass Stage */}
                  {!stage.passed && (
                    <button
                      onClick={() => handlePassStage(stageIndex)}
                      className="mt-3 text-xs bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
                    >
                      Pass Stage
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10">
          Enter a Student ID and click search.
        </p>
      )}
    </div>
  );
};

export default ApplicationTracking;
