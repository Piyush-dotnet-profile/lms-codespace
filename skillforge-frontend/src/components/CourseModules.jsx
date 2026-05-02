import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCourseProgress } from "../utils/progressApi";

export default function CourseModules() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [courseProgress, setCourseProgress] = useState(null);

  useEffect(() => {
    const fetchEnrolledCourse = async () => {
      try {
        setIsLoading(true);
        setError("");

        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/courses/my-courses/enrolled`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load enrolled courses");
        }

        const data = await response.json();

        const matchedCourse = Array.isArray(data)
          ? data.find((item) => String(item._id) === String(courseId))
          : null;

        if (!matchedCourse) {
          navigate("/login");
          return;
        }

        setCourse(matchedCourse);

        // Fetch progress data from API
        try {
          const progressData = await getCourseProgress(courseId);
          console.log("Course Progress Data:", {
            courseId,
            progressData,
            modules: progressData?.modules,
          });
          setCourseProgress(progressData);
        } catch (progressErr) {
          console.error("Failed to fetch progress:", progressErr);
          // Continue without progress data
        }
      } catch (err) {
        console.error("Failed to fetch course modules:", err);
        setError("Unable to load modules right now.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchEnrolledCourse();
  }, [courseId, isAuthenticated, navigate]);

  const modules = useMemo(() => course?.modules || [], [course]);

  const completedCount = useMemo(() => {
    if (!courseProgress || !courseProgress.modules) return 0;
    return courseProgress.modules.filter((m) => m.completed).length;
  }, [courseProgress]);

  const overallProgress = useMemo(() => {
    if (courseProgress && typeof courseProgress.overallProgress === "number") {
      return courseProgress.overallProgress;
    }
    return 0;
  }, [courseProgress]);

  const getModuleProgress = (module) => {
    if (!courseProgress || !courseProgress.modules) {
      console.log("No course progress available");
      return 0;
    }

    const moduleIdStr = String(module._id || module.id);
    console.log("Looking for progress for module:", moduleIdStr);
    console.log("Available modules in courseProgress:", courseProgress.modules);

    const moduleData = courseProgress.modules.find((m) => {
      const mIdStr = String(m.moduleId);
      console.log(`Comparing: ${mIdStr} === ${moduleIdStr}`, mIdStr === moduleIdStr);
      return mIdStr === moduleIdStr;
    });

    console.log("Found module data:", moduleData);

    if (moduleData && typeof moduleData.progress === "number") {
      return moduleData.progress;
    }

    return 0;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF9F4] flex items-center justify-center">
        <p className="text-slate-600">Loading course modules...</p>
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
            onClick={() => navigate("/dashboard")}
            className="mt-4 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
              <p className="text-xs text-slate-500">Modules</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-slate-700 sm:inline">
              {user?.name || "Learner"}
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
        <section className="rounded-[2rem] bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-10 text-white shadow-xl shadow-orange-200 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Enrolled Course
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                {course.title}
              </h1>
              <p className="mt-4 max-w-3xl text-white/90 leading-7">
                {course.description ||
                  "Track your modules, continue learning, and monitor your course progress from one place."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                >
                  Course Details
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Dashboard
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Progress
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Overall course progress</span>
                    <span className="font-semibold">{overallProgress}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/70">
                      Modules
                    </p>
                    <p className="mt-1 text-xl font-bold">{modules.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/70">
                      Completed
                    </p>
                    <p className="mt-1 text-xl font-bold">{completedCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Total Modules
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {modules.length}
            </p>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Completed
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {completedCount}
            </p>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
              Overall Progress
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-900">
              {overallProgress}%
            </p>
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Course Modules
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Select a module to continue
            </h2>
            <p className="mt-3 text-slate-600">
              Each module shows its own progress so you can continue where you
              left off. Complete at least 50% of the course to unlock the final
              assessment quiz.
            </p>
          </div>

          {modules.length === 0 ? (
            <div className="rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">
                No modules available
              </p>
              <p className="mt-2 text-slate-600">
                This course does not have module data yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {modules.map((module, index) => {
                const moduleId = module._id || module.id || index;
                const title =
                  module.title || module.name || `Module ${index + 1}`;
                const description = module.description || module.summary || "";
                const progress = getModuleProgress(module);

                const moduleIdStr = String(module._id || module.id);
                const moduleData = courseProgress?.modules.find((m) => {
                  const mIdStr = String(m.moduleId);
                  return mIdStr === moduleIdStr;
                });
                const completed = moduleData?.completed || false;

                return (
                  <div
                    key={moduleId}
                    className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/60"
                  >
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl font-bold ${
                            completed
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {completed ? (
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {title}
                          </h3>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            {completed ? "Completed" : "In progress"}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-orange-600">
                        {progress}%
                      </span>
                    </div>

                    {description && (
                      <p className="text-sm leading-6 text-slate-600">
                        {description}
                      </p>
                    )}

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-orange-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          completed ? "bg-green-500" : "bg-orange-500"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <button
                      onClick={() =>
                        navigate(`/courses/${courseId}/modules/${moduleId}`, {
                          state: { course, module },
                        })
                      }
                      className="mt-5 inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
                    >
                      {completed ? "Review Module" : "Open Module"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quiz Section */}
        <section className="mt-16 rounded-[2rem] bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-12 text-white shadow-xl shadow-purple-200 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Assessment
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Course Final Quiz
              </h2>
              <p className="mt-4 text-white/90 leading-7">
                Test your knowledge with our comprehensive assessment. Complete
                at least 50% of the course modules to unlock the quiz.
              </p>
              <p className="mt-4 text-sm font-semibold text-white/80">
                Current Progress:{" "}
                <span className="text-lg">{overallProgress}%</span>
              </p>
              <div className="mt-2 h-2 w-24 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white"
                  style={{ width: `${Math.min(overallProgress, 100)}%` }}
                />
              </div>

              <button
                onClick={() => navigate(`/courses/${courseId}/quiz`)}
                disabled={overallProgress < 50}
                className={`mt-6 px-8 py-3 rounded-full font-semibold transition ${
                  overallProgress >= 50
                    ? "bg-white text-purple-600 hover:bg-purple-50 shadow-lg"
                    : "bg-white/30 text-white cursor-not-allowed opacity-60"
                }`}
              >
                {overallProgress >= 50
                  ? "Take Quiz →"
                  : `Unlock at 50% (${overallProgress}%)`}
              </button>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-6 border border-white/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm font-bold">📝</span>
                  </div>
                  <div>
                    <p className="font-semibold">Multiple Choice Questions</p>
                    <p className="text-sm text-white/80">
                      Comprehensive assessment of all topics
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold">Detailed Feedback</p>
                    <p className="text-sm text-white/80">
                      Get explanations for each answer
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm font-bold">🎯</span>
                  </div>
                  <div>
                    <p className="font-semibold">Instant Results</p>
                    <p className="text-sm text-white/80">
                      Know your score immediately
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
