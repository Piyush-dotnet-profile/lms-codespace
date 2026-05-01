import React, { useState, useEffect } from "react";
import AdminCourseForm from "./AdminCourseForm";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data);
      setError("");
    } catch (err) {
      console.error("Fetch courses error:", err);
      setError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/courses/${courseId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      setCourses(courses.filter((c) => c._id !== courseId));
    } catch (err) {
      console.error("Delete course error:", err);
      setError(err.message || "Failed to delete course");
    }
  };

  if (showForm) {
    return (
      <AdminCourseForm
        course={editingCourse}
        onSave={() => {
          setShowForm(false);
          setEditingCourse(null);
          fetchCourses();
        }}
        onCancel={() => {
          setShowForm(false);
          setEditingCourse(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
        <svg
          className="w-8 h-8 animate-spin text-orange-600 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 12a8 8 0 018-8V0c4.418 0 8 3.582 8 8h-2z"
          />
        </svg>
        <p className="mt-4 text-slate-600">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Course Management
          </h2>
          <p className="mt-1 text-slate-600">
            Create and manage your LMS courses
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCourse(null);
            setShowForm(true);
          }}
          className="px-6 py-3 rounded-full bg-orange-600 text-white font-semibold hover:bg-orange-700 transition shadow-md"
        >
          + New Course
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <div className="rounded-3xl border border-orange-100 bg-white p-12 text-center shadow-sm">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mb-4">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747C22 10.998 17.5 6.253 12 6.253z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No courses yet
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first course to get started
            </p>
            <button
              onClick={() => {
                setEditingCourse(null);
                setShowForm(true);
              }}
              className="px-6 py-3 rounded-full bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
            >
              Create Course
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((course) => (
              <div
                key={course._id}
                className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {course.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {course.category} • {course.level}
                    </p>
                  </div>
                  {course.isPublished && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Published
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-slate-100">
                  <div>
                    <p className="text-sm text-slate-600">Modules</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {course.modules?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Students</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {course.enrolledUsers?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Rating</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {course.rating?.toFixed(1) || "3.5"}⭐
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingCourse(course);
                      setShowForm(true);
                    }}
                    className="flex-1 px-4 py-2 rounded-full border border-orange-200 text-orange-700 font-semibold hover:border-orange-400 hover:bg-orange-50 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="flex-1 px-4 py-2 rounded-full border border-red-200 text-red-700 font-semibold hover:border-red-400 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
