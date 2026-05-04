import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCourseById } from "../utils/coursesApi";
import { enrollCourse } from "../utils/coursesApi";

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [isEnrolled, setisEnrolled] = useState(null);

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getCourseById(courseId);

        setCourse(data);

        if (data.enrolledUsers.includes(user._id)) {
          setisEnrolled(true);
        }
      } catch (err) {
        console.error("Failed to fetch course:", err);
        setError("Unable to load course details right now.");
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center">
        <p className="text-slate-600">Loading course details...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center px-4">
        <div className="rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">
            {error || "Course not found"}
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="mt-4 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const modules = course.modules || [];
  const expectedTime = course.expectedTime || course.duration || "Flexible";
  const level = course.level || "Beginner";
  const category = course.category || "General";

  const handleEnroll = async () => {
    try {
      // 1. Auth guard
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      // 2. API call

      const data = await enrollCourse(course._id);

      // 4. UX feedback
      alert("Successfully enrolled in course");

      // Optional: redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Enrollment error:", error);
      alert(error.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F4] text-slate-800">
      <header className="sticky top-0 z-50 border-b border-orange-100/70 bg-[#FFF9F4]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 shadow-sm"
            >
              <span className="text-lg font-bold">SF</span>
            </button>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">
                Skill Forge
              </p>
              <p className="text-xs text-slate-500">Course Details</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm font-medium text-slate-700 sm:inline">
                  {user?.name || "Learner"}
                </span>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner */}
        <section className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-10 text-white shadow-xl shadow-orange-200 sm:px-10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {category}
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {level}
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                {course.title}
              </h1>

              <p className="mt-4 max-w-3xl text-white/90 leading-7">
                {course.description ||
                  "This course gives learners a structured path with modules, practical content, and clear progress steps."}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate("/courses")}
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Back to Courses
                </button>
                {user?.role === "user" &&
                  (isEnrolled ? (
                    <button
                      onClick={() => navigate(`/courses/${courseId}/modules`)}
                      className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white hover:text-orange-700"
                    >
                      Continue Course
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white hover:text-orange-700"
                    >
                      Enroll
                    </button>
                  ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Course Snapshot
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Expected Time
                  </p>
                  <p className="mt-1 text-xl font-bold">{expectedTime}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Modules
                  </p>
                  <p className="mt-1 text-xl font-bold">{modules.length}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Status
                  </p>
                  <p className="mt-1 text-xl font-bold">
                    {course.isPublished === false ? "Draft" : "Available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Summary cards */}
        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Duration
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {expectedTime}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Estimated time to complete this course.
            </p>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Modules
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {modules.length}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Structured lessons included in the course.
            </p>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Level
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{level}</p>
            <p className="mt-2 text-sm text-slate-600">
              Course difficulty and learning pace.
            </p>
          </div>
        </section>

        {/* Course overview */}
        <section className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Overview
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              What you will learn
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              {course.longDescription ||
                course.description ||
                "This course is designed to guide learners from the fundamentals to practical understanding in a clear sequence."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Step-by-step modules",
                "Practical course structure",
                "Easy to follow learning path",
                "Designed for dashboard tracking",
              ].map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-orange-100 bg-orange-50/60 p-5"
                >
                  <p className="font-medium text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Course Details
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-orange-50/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                  Category
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {category}
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                  Expected Time
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {expectedTime}
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                  Modules Count
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {modules.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="mt-12">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Modules
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Course modules
            </h2>
            <p className="mt-3 text-slate-600">
              A quick look at the module structure for this course.
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">
                No modules available yet
              </p>
              <p className="mt-2 text-slate-600">
                The backend has not provided module data for this course.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {modules.map((module, index) => {
                const title =
                  typeof module === "string"
                    ? module
                    : module.title || module.name || `Module ${index + 1}`;

                const description =
                  typeof module === "string"
                    ? ""
                    : module.description || module.summary || "";

                return (
                  <div
                    key={module._id || index}
                    className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/60"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 font-bold text-orange-700">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {title}
                      </h3>
                    </div>
                    {description && (
                      <p className="text-sm leading-6 text-slate-600">
                        {description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="mt-12 rounded-[2rem] bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-10 text-white shadow-xl shadow-orange-200 sm:px-10">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to start this course?
              </h2>
              <p className="mt-3 max-w-2xl text-white/90">
                Add an enrollment action here later, or connect this to your
                module playback flow.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => navigate("/courses")}
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Browse More
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
