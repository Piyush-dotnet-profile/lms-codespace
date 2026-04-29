import React, { useEffect, useState } from "react";
import { checkModuleUnlock } from "../utils/progressApi";
import { useNavigate } from "react-router-dom";

export default function ModuleUnlockCheck({
  courseId,
  moduleId,
  previousModule,
  children,
}) {
  const [isUnlocked, setIsUnlocked] = useState(null);
  const [unlockInfo, setUnlockInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUnlock = async () => {
      try {
        const result = await checkModuleUnlock(courseId, moduleId);
        setIsUnlocked(result.isUnlocked);
        setUnlockInfo(result);
      } catch (error) {
        console.error("Failed to check module unlock status:", error);
        // If check fails, allow access (graceful fallback)
        setIsUnlocked(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkUnlock();
  }, [courseId, moduleId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-slate-600">Checking module access...</p>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 mb-4">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-amber-900 mb-2">
          Module Locked
        </h3>
        <p className="text-amber-800 mb-4">
          Complete the previous module to unlock this one.
        </p>
        {unlockInfo && (
          <div className="space-y-2 text-sm text-amber-700">
            <p>
              Previous module progress:{" "}
              <span className="font-semibold">
                {unlockInfo.currentProgress}%
              </span>
            </p>
            <p>
              Required to unlock:{" "}
              <span className="font-semibold">
                {unlockInfo.requiredProgress}%
              </span>
            </p>
            <div className="mt-3 h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 transition-all"
                style={{
                  width: `${(unlockInfo.currentProgress / unlockInfo.requiredProgress) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
        <div className="border-t border-orange-100 pt-6 flex flex-col gap-3">
          {
            <button
              onClick={() =>
                navigate(`/courses/${courseId}/modules/${previousModule}`)
              }
              className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600"
            >
              ← Previous Module
            </button>
          }
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
