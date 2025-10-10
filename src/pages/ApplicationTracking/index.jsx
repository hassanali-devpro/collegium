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

  const [applications, setApplications] = useState([
    {
      studentId: "STU001",
      studentName: "Ali Khan",
      university: "University of Oxford",
      program: "MSc Computer Science",
      stages: stageTitles.map((title, i) => ({
        title,
        passed: i < 3,
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
        passed: i < 5,
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
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition"
          >
            Search
          </button>
        </div>

        {/* 🧾 Search Result */}
        {searchedApp ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-md">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-bold text-gray-800">
                {searchedApp.studentName} ({searchedApp.studentId})
              </h3>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">University:</span> {searchedApp.university}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Program:</span> {searchedApp.program}
              </p>
            </div>

            <div className="relative border-l-2 border-gray-300 pl-6 space-y-8">
              {searchedApp.stages.map((stage, stageIndex) => (
                <div key={stageIndex} className="relative">
                  <span
                    className={`absolute -left-[22px] flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      stage.passed
                        ? "bg-green-600 border-green-600 text-white"
                        : "border-gray-400 text-gray-600 bg-white"
                    }`}
                  >
                    {stage.passed ? <Check size={16} /> : stageIndex + 1}
                  </span>

                  <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
                    <h3 className="font-semibold text-gray-800">{stage.title}</h3>

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

                    {/* Comment Input */}
                    <div className="flex mt-3">
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
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 rounded-r-md text-sm font-medium transition"
                      >
                        Add
                      </button>
                    </div>

                    {/* Pass Stage Button */}
                    {!stage.passed && (
                      <button
                        onClick={() => handlePassStage(stageIndex)}
                        className="mt-3 text-xs bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 px-3 py-1 font-medium transition"
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
            {/* Enter a Student ID above to view application progress. */}
          </p>
        )}
      </div>
    </section>
  );
};

export default ApplicationTracking;
