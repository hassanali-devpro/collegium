import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./components/Layout";
import AIChatSupport from "./components/AIChatSupport";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ApplicationTracking from "./pages/ApplicationTracking";
import StudentSearch from "./pages/StudentSearch";
import AddCouse from "./pages/AddCourse";
import AddStudent from "./pages/AddStudent";
import CourseSearch from "./pages/CourseSearch";
import Offices from "./pages/Offices";
import ProtectedRoute from "./components/ProtectedRoute"; 

function App() {
  const userRole = "admin";

  return (
    <>
      <AIChatSupport />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/add-course" element={<AddCouse />} />
          <Route path="/add-student" element={<AddStudent />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout role={userRole}>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/application-tracking"
            element={
              <ProtectedRoute>
                <Layout role={userRole}>
                  <ApplicationTracking />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/course-search"
            element={
              <ProtectedRoute>
                <Layout role={userRole}>
                  <CourseSearch />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/offices"
            element={
              <ProtectedRoute>
                <Layout role={userRole}>
                  <Offices />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
