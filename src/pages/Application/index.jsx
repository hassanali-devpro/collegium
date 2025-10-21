import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import AddStudents from "../AddStudent";
import Doc from "../Doc";
import SearchCourse from "../CourseSearch"
import ApplicationTabLayout from "../../components/ApplicationTabLayout"

const TabsPage = () => {
  const [activeTab, setActiveTab] = useState("application"); // Default to application tab for existing students
  const [studentId, setStudentId] = useState(null);
  const location = useLocation();
  const { studentId: routeStudentId } = useParams(); // Get studentId from route parameter

  // Get student ID from route params, URL params, or location state
  useEffect(() => {
    // Priority: Route param > URL search param > location state
    if (routeStudentId) {
      setStudentId(routeStudentId);
      setActiveTab("application"); // Show application tab for existing students
    } else {
      const urlParams = new URLSearchParams(location.search);
      const idFromUrl = urlParams.get('studentId');
      const idFromState = location.state?.studentId;
      
      if (idFromUrl) {
        setStudentId(idFromUrl);
      } else if (idFromState) {
        setStudentId(idFromState);
      }
    }
  }, [routeStudentId, location]);

  // Function to handle student creation and get the new student ID
  const handleStudentCreated = (newStudentId) => {
    console.log('Application page - Student created with ID:', newStudentId);
    setStudentId(newStudentId);
    setActiveTab("documents"); // Move to documents tab after creating student
  };

  // Debug logging
  console.log('Application page - Route studentId:', routeStudentId);
  console.log('Application page - Current studentId:', studentId);
  console.log('Application page - Active tab:', activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      {/* Student ID Display */}
      {studentId && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
          <strong>Current Student ID:</strong> {studentId}
          <span className="ml-4 text-sm">
            {routeStudentId ? "Viewing existing student applications" : 
             location.state?.studentId ? "Editing existing student" : "New student registration"}
          </span>
        </div>
      )}

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
        {activeTab === "profile" && (
          <AddStudents 
            onStudentCreated={handleStudentCreated}
            existingStudentId={studentId}
          />
        )}
        {activeTab === "documents" && (
          <Doc studentId={studentId} />
        )}
        {activeTab === "programs" && (
          <SearchCourse studentId={studentId} />
        )}
        {activeTab === "application" && (
          <ApplicationTabLayout studentId={studentId} />
        )}
      </div>
    </div>
  );
};

export default TabsPage;
