import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AIChatSupport from "./components/AIChatSupport"
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ApplicationTracking from "./pages/ApplicationTracking";
import StudentSearch from "./pages/StudentSearch"
import AddCouse from "./pages/AddCourse"
import AddStudent from "./pages/AddStudent"
import CourseSearch from "./pages/CourseSearch"

function App() {
  const userRole = "admin";

  return (
    <>
      <AIChatSupport />
      <Router>
        <Routes>
          {/* Public route without Layout */}
          <Route path="/" element={<Login />} />
          <Route path="/add-course" element={<AddCouse />} />
          <Route path="/add-student" element={<AddStudent />} />

          {/* Protected routes with Layout */}
          <Route path="/dashboard" element={
            <Layout role={userRole}>
              <Dashboard />
            </Layout>
          }
          />
          <Route path="/Application-Tracking" element={
            <Layout role={userRole}>
              <ApplicationTracking />
            </Layout>
          }
          />
          <Route path="/course-search" element={
            <Layout role={userRole}>
              <CourseSearch />
            </Layout>
          }
          />
          <Route path="/student-search" element={
            <Layout role={userRole}>
              <StudentSearch />
            </Layout>
          }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
