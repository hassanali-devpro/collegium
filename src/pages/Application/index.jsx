import React, { useState } from "react";
import AddStudents from "../AddStudent";
import Doc from "../Doc";
import SearchCourse from "../CourseSearch"
import AppliedPrograms from "../../components/AppliedPrograms"

const TabsPage = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-300 mb-6">
        {[
          { id: "profile", label: "Profile" },
          { id: "documents", label: "Documents" },
          { id: "programs", label: "Select Program" },
          { id: "application", label: "Application" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 px-4 text-lg font-medium transition border-b-2 ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "profile" && <AddStudents />}
        {activeTab === "documents" && <Doc />}
        {activeTab === "programs" && <SearchCourse />}
        {activeTab === "application" && <AppliedPrograms />}
      </div>
    </div>
  );
};

export default TabsPage;
