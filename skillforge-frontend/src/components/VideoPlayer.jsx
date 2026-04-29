import React, { useEffect, useRef, useState } from "react";
import { updateVideoProgress } from "../utils/progressApi";

export default function VideoPlayer({
  courseId,
  moduleId,
  video,
  onProgressUpdate,
}) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const trackingTimerRef = useRef(null);

  if (!video || !video.url) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-8 text-center">
        <p className="text-slate-600">No video available for this module</p>
      </div>
    );
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);

      if (dur > 0) {
        const newProgress = Math.round((current / dur) * 100);
        setProgress(newProgress);
      }
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Track progress every 10 seconds
  useEffect(() => {
    if (isPlaying && progress > 0) {
      if (trackingTimerRef.current) {
        clearTimeout(trackingTimerRef.current);
      }

      trackingTimerRef.current = setTimeout(() => {
        updateVideoProgress(courseId, moduleId, progress)
          .then(() => {
            onProgressUpdate?.(progress);
          })
          .catch((error) =>
            console.error("Failed to track video progress:", error),
          );
      }, 10000); // Track every 10 seconds
    }

    return () => {
      if (trackingTimerRef.current) {
        clearTimeout(trackingTimerRef.current);
      }
    };
  }, [isPlaying, progress, courseId, moduleId, onProgressUpdate]);

  // Track on pause/end
  useEffect(() => {
    const handlePause = () => {
      if (progress > 0) {
        updateVideoProgress(courseId, moduleId, progress)
          .then(() => {
            onProgressUpdate?.(progress);
          })
          .catch((error) =>
            console.error("Failed to track video progress:", error),
          );
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener("pause", handlePause);
      video.addEventListener("ended", handlePause);
    }

    return () => {
      if (video) {
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("ended", handlePause);
      }
    };
  }, [progress, courseId, moduleId, onProgressUpdate]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="rounded-2xl border border-orange-100 bg-white overflow-hidden shadow-sm">
      <div className="relative bg-black aspect-video">
        <video
          ref={videoRef}
          src={`/api/media/drive/${video.url}`}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full"
          controlsList="nodownload"
        />

        {/* Custom controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress bar */}
          <div className="mb-3">
            <div className="bg-white/20 rounded-full h-2 cursor-pointer group">
              <div
                className="h-full bg-orange-500 rounded-full transition-all group-hover:h-3"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="hover:text-orange-400 transition"
              >
                {isPlaying ? (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <span className="whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-orange-400 font-semibold">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-900">{video.title}</h3>
        <p className="mt-2 text-sm text-slate-600">
          Duration: {formatTime(duration)}
        </p>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-700">Watch Progress</span>
            <span className="font-semibold text-orange-600">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
