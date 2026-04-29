import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VideoPlayer from "./VideoPlayer";
import DocumentList from "./DocumentList";
import ModuleUnlockCheck from "./ModuleUnlockCheck";
import { getCourseProgress, updateModuleProgress } from "../utils/progressApi";

export default function ModuleDetail() {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [course, setCourse] = useState(null);
  const [module, setModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [moduleProgress, setModuleProgress] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const fetchModule = async () => {
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

        const matchedModule =
          matchedCourse.modules?.find(
            (m, index) => String(m._id || m.id || index) === String(moduleId),
          ) || null;

        if (!matchedModule) {
          setError("Module not found.");
          setCourse(matchedCourse);
          return;
        }

        setCourse(matchedCourse);
        setModule(matchedModule);

        // Fetch progress data from API
        try {
          const progressData = await getCourseProgress(courseId);
          const currentModuleProgress = progressData.modules.find(
            (m) => m.moduleId === matchedModule._id,
          );
          setModuleProgress(currentModuleProgress);
        } catch (progressErr) {
          console.error("Failed to fetch progress:", progressErr);
          // Continue without progress data
        }
      } catch (err) {
        console.error("Failed to fetch module:", err);
        setError("Unable to load module right now.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchModule();
  }, [courseId, moduleId, isAuthenticated, navigate]);

  const moduleIndex = useMemo(() => {
    if (!course?.modules || !module) return -1;
    return course.modules.findIndex(
      (m, index) => String(m._id || m.id || index) === String(moduleId),
    );
  }, [course, module, moduleId]);

  const previousModule = useMemo(() => {
    if (!course?.modules || moduleIndex <= 0) return null;
    return course.modules[moduleIndex - 1];
  }, [course, moduleIndex]);

  const nextModule = useMemo(() => {
    if (
      !course?.modules ||
      moduleIndex < 0 ||
      moduleIndex >= course.modules.length - 1
    ) {
      return null;
    }
    return course.modules[moduleIndex + 1];
  }, [course, moduleIndex]);

  const progress = useMemo(() => {
    if (moduleProgress && typeof moduleProgress.progress === "number") {
      return moduleProgress.progress;
    }
    return 0;
  }, [moduleProgress]);

  const handleCompleteModule = async () => {
    try {
      setIsCompleting(true);
      await updateModuleProgress(courseId, moduleId, { progress: 100 });

      // Refresh progress data
      const progressData = await getCourseProgress(courseId);
      const currentModuleProgress = progressData.modules.find(
        (m) => m.moduleId === module._id,
      );
      setModuleProgress(currentModuleProgress);

      alert("Module marked as completed! 🎉");
    } catch (err) {
      console.error("Failed to complete module:", err);
      alert("Failed to mark module as completed");
    } finally {
      setIsCompleting(false);
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
              <p className="text-xs text-slate-500">Module</p>
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
        <ModuleUnlockCheck
          courseId={courseId}
          moduleId={moduleId}
          previousModule={previousModule?._id || previousModule?.id}
        >
          {/* Hero Section */}
          <section className="rounded-[2rem] bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-10 text-white shadow-xl shadow-orange-200 sm:px-10 mb-10">
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                  {course?.title}
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                  {module?.title || "Module"}
                </h1>
                <p className="mt-4 max-w-3xl text-white/90 leading-7">
                  {module?.description ||
                    "Module details and content are shown below."}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/courses/${courseId}/modules`)}
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                  >
                    Back to Modules
                  </button>
                  <button
                    onClick={() => navigate(`/courses/${courseId}`)}
                    className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    Course Details
                  </button>
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                  Module Progress
                </p>
                <p className="mt-3 text-4xl font-bold">{progress}%</p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8">
              {/* Video Section */}
              {module?.video && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    Video Lesson
                  </h2>
                  <VideoPlayer
                    courseId={courseId}
                    moduleId={moduleId}
                    video={module.video}
                    onProgressUpdate={(videoProgress) => {
                      setModuleProgress((prev) => ({
                        ...prev,
                        videoProgress,
                      }));
                    }}
                  />
                </div>
              )}

              {/* Documents Section */}
              {module?.documents && module.documents.length > 0 && (
                <div>
                  <DocumentList
                    courseId={courseId}
                    moduleId={moduleId}
                    documents={module.documents}
                  />
                </div>
              )}

              {/* Content Section */}
              <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
                  Module Content
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  What this module covers
                </h2>

                <p className="mt-4 leading-7 text-slate-600">
                  {module?.content ||
                    module?.description ||
                    "No module content provided."}
                </p>

                {(module?.topics || module?.outcomes || module?.points) &&
                  (module.topics || module.outcomes || module.points).length >
                    0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Learning Points
                      </h3>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {(
                          module.topics ||
                          module.outcomes ||
                          module.points
                        ).map((item, index) => (
                          <div
                            key={index}
                            className="rounded-2xl border border-orange-100 bg-orange-50/60 p-5"
                          >
                            <p className="font-medium text-slate-800">
                              {typeof item === "string"
                                ? item
                                : item.title ||
                                  item.name ||
                                  `Point ${index + 1}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <div className="rounded-3xl border border-orange-100 bg-white p-8 shadow-sm sticky top-24 space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
                    Progress
                  </p>
                  <p className="mt-3 text-4xl font-bold text-slate-900">
                    {progress}%
                  </p>
                  <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {progress === 100 && (
                    <div className="mt-3 flex items-center gap-2 text-green-700">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold">Completed</span>
                    </div>
                  )}
                </div>

                {progress < 100 && (
                  <button
                    onClick={handleCompleteModule}
                    disabled={isCompleting}
                    className="w-full rounded-full bg-orange-600 px-6 py-3 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 transition"
                  >
                    {isCompleting ? "Marking..." : "Mark as Complete"}
                  </button>
                )}

                <div className="border-t border-orange-100 pt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mb-3">
                    Module Details
                  </p>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-orange-50/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                        Module #
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {moduleIndex >= 0 ? moduleIndex + 1 : "-"}
                      </p>
                    </div>

                    {module?.duration && (
                      <div className="rounded-2xl bg-orange-50/60 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                          Duration
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {module.duration}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-orange-100 pt-6 flex flex-col gap-3">
                  {previousModule && (
                    <button
                      onClick={() =>
                        navigate(
                          `/courses/${courseId}/modules/${
                            previousModule._id ||
                            previousModule.id ||
                            moduleIndex - 1
                          }`,
                        )
                      }
                      className="rounded-full border border-orange-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-orange-50"
                    >
                      ← Previous Module
                    </button>
                  )}
                  {nextModule && (
                    <button
                      onClick={() =>
                        navigate(
                          `/courses/${courseId}/modules/${
                            nextModule._id || nextModule.id || moduleIndex + 1
                          }`,
                        )
                      }
                      className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
                    >
                      Next Module →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </ModuleUnlockCheck>
      </main>
    </div>
  );
}
