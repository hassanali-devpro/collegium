import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ToastContainer from "./components/Toast/ToastContainer";
import { ToastProvider, useToastContext } from "./contexts/ToastContext";

import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ApplicationTracking from "./pages/ApplicationTracking";
import StudentSearch from "./pages/StudentSearch";
import AddCourse from "./pages/AddCourse";
import AddStudent from "./pages/AddStudent";
import UpdateStudent from "./pages/UpdateStudent";
import CourseSearch from "./pages/CourseSearch";
import Offices from "./pages/Offices";
import Agents from "./pages/Agents";
import Doc from "./pages/Doc";
import AIChatSupport from "./components/AIChatSupport";
import Resource from "./pages/Resources"
import AgentStudents from "./pages/AgentStudents";

// New restructured components
import StudentPage from "./pages/Student";
import StudentForm from "./pages/Student/StudentForm";
import ApplicationList from "./pages/Application/ApplicationList";
import ApplicationDetail from "./pages/ApplicationDetail";
import ChatPage from "./pages/Chats/ChatPage";

function AppContent() {
  const userRole = "admin";
  const { toasts, removeToast } = useToastContext();

  const protectedRoutes = [
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/student-search", element: <StudentSearch /> },
    { path: "/application-tracking", element: <ApplicationTracking /> },
    { path: "/course-search", element: <CourseSearch /> },
    { path: "/offices", element: <Offices /> },
    { path: "/manage-users", element: <Agents /> },
    { path:"/agent-students", element: <AgentStudents />},
    
    // New restructured routes
    { path: "/student", element: <StudentPage /> },
    { path: "/student/add", element: <StudentForm /> },
    { path: "/student/edit/:studentId", element: <StudentForm /> },
    
    // Application routes
    { path: "/applications", element: <ApplicationList /> },
    {path:"/add-course", element:<AddCourse />},
    {path:"/add-student", element:<AddStudent />},
    {path:"/chats", element:<ChatPage />},
    {path:"/learning-resource", element:<Resource />}
  ];

  return (
    <Router>
      <AIChatSupport />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student-documents" element={<Doc />} />

        {protectedRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute>
                <Layout role={userRole}>{element}</Layout>
              </ProtectedRoute>
            }
          />
        ))}
      </Routes>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </Router>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
