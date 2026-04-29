import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import Dashboard from "./components/Dashboard";
import { AuthProvider } from "./context/AuthContext";
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<ExploreCourses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route
            path="/courses/:courseId/modules"
            element={<CourseModules />}
          />
          <Route
            path="/courses/:courseId/modules/:moduleId"
            element={<ModuleDetail />}
          />
          <Route path="/courses/:courseId/quiz" element={<QuizPage />} />
        </Routes>
        <Route path="/courses/:courseId"  } />
      </Router>
    </AuthProvider>
  );
}

export default App;
