import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminCourses from "./AdminCourses";
import AdminUsers from "./AdminUsers";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("courses");

  if (!isAuthenticated || !user) return null;
  //         <h2 className="text-xl font-bold text-slate-900 mb-2">
  //           Access Denied
  //         </h2>
  //         <p className="text-slate-600">{error}</p>
  //         <p className="text-sm text-slate-500 mt-2">Redirecting...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-[#FFF9F4] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-orange-100/70 bg-[#FFF9F4]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 shadow-sm hover:bg-orange-200 transition"
            >
              <span className="text-lg font-bold">SF</span>
            </button>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                Skill Forge
              </p>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">
              {user?.name || "Admin"}
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-orange-100">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("courses")}
              className={`pb-4 px-1 font-semibold border-b-2 transition ${
                activeTab === "courses"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Courses
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`pb-4 px-1 font-semibold border-b-2 transition ${
                activeTab === "users"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`pb-4 px-1 font-semibold border-b-2 transition ${
                activeTab === "stats"
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Statistics
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "courses" && <AdminCourses />}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "stats" && (
          <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm text-center">
            <p className="text-slate-600">Statistics feature coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
}
