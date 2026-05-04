import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ExploreCourses from "./components/Courses";
import CourseDetails from "./components/CourseDetails";
import CourseModules from "./components/CourseModules";
import ModuleDetail from "./components/ModuleDetail";
import QuizPage from "./components/QuizPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <ExploreCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedRoute>
                <CourseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/modules"
            element={
              <ProtectedRoute>
                <CourseModules />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/modules/:moduleId"
            element={
              <ProtectedRoute>
                <ModuleDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses/:courseId/quiz"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
