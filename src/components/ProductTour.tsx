"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Reveal from "./Reveal";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function ProductTour() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(56);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    setUserInteracted(true);
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Toggle mute/unmute
  const toggleMute = useCallback(() => {
    setUserInteracted(true);
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        }
        setIsFullscreen(true);
      } catch {
        // Fallback for iOS / Safari video element fullscreen
        const video = videoRef.current as
          | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
          | null;
        if (video?.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, []);

  // Seek on progress bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar) return;

    const rect = bar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * (video.duration || duration);
    setCurrentTime(video.currentTime);
  };

  // Keyboard accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(
            0,
            videoRef.current.currentTime - 5,
          );
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(
            videoRef.current.duration || duration,
            videoRef.current.currentTime + 5,
          );
        }
      }
    },
    [togglePlay, toggleMute, toggleFullscreen, duration],
  );

  // Auto-hide controls when playing and idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  // Sync fullscreen change events
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // IntersectionObserver: auto-play muted when visible, pause when scrolled away
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let hasAutoplayed = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!hasAutoplayed && !userInteracted) {
            hasAutoplayed = true;
            video.muted = true;
            setIsMuted(true);
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {});
          } else if (isPlaying && video.paused) {
            video
              .play()
              .then(() => setIsPlaying(true))
              .catch(() => {});
          }
        } else {
          // Offscreen: pause to conserve system resources
          if (!video.paused) {
            video.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [userInteracted, isPlaying]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section
      id="tour"
      className="relative px-6 py-24"
      aria-label="Product Tour"
    >
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-muted/30 px-3.5 py-1 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Product Walkthrough
            </div>
            <h2 className="mt-4 text-balance text-3xl font-light tracking-tight sm:text-4xl">
              See RAGify in{" "}
              <span className="font-semibold text-primary">action</span>
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-balance text-muted">
              Upload documents, query with grounded RAG precision, and
              collaborate in real-time. Take a 56-second tour through the entire
              workflow.
            </p>
          </div>
        </Reveal>

        <Reveal delay={200}>
          {/* Cockpit Window Container */}
          <div
            ref={containerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            className="group relative mx-auto w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {/* Window Chrome Header */}
            <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 text-xs text-muted select-none">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5" aria-hidden="true">
                  <div className="h-3 w-3 rounded-full border border-border bg-surface-hover" />
                  <div className="h-3 w-3 rounded-full border border-border bg-surface-hover" />
                  <div className="h-3 w-3 rounded-full border border-border bg-surface-hover" />
                </div>
                <span className="ml-2 font-mono text-[11px] text-muted">
                  ragify-tour.mp4
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                <span>1080p HD</span>
              </div>
            </div>

            {/* Video Canvas */}
            <div className="relative aspect-video w-full bg-black">
              <video
                ref={videoRef}
                src="/ragify-tour.mp4"
                playsInline
                preload="metadata"
                muted={isMuted}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current && videoRef.current.duration) {
                    setDuration(videoRef.current.duration);
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  setShowControls(true);
                }}
                onClick={togglePlay}
                className="h-full w-full object-cover cursor-pointer"
              />

              {/* Big Center Play Button Overlay (when paused) */}
              {!isPlaying && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 transition-opacity duration-200"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    aria-label="Play tour video"
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-black transition-all duration-200 hover:scale-110 hover:bg-primary-hover shadow-lg"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="ml-1 h-7 w-7"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Unmute Prompt Pill (visible when autoplaying muted) */}
              {isPlaying && isMuted && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-border bg-surface/90 px-3 py-1.5 text-xs font-medium text-ink shadow-lg backdrop-blur-sm transition-all hover:bg-surface hover:text-primary"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                  <span>Click to unmute</span>
                </button>
              )}

              {/* Bottom Cockpit Control Bar */}
              <div
                className={`absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-200 ${
                  showControls || !isPlaying
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
              >
                {/* Progress bar */}
                <div
                  ref={progressRef}
                  onClick={handleSeek}
                  className="group/bar relative mb-3 h-1.5 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-2"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-75"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-primary shadow-sm opacity-0 transition-opacity group-hover/bar:opacity-100"
                    style={{ left: `calc(${progressPercent}% - 7px)` }}
                  />
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between text-xs text-ink">
                  <div className="flex items-center gap-3">
                    {/* Play/Pause */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={isPlaying ? "Pause" : "Play"}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink hover:text-primary transition-colors"
                    >
                      {isPlaying ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5"
                        >
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-5 w-5"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    {/* Mute/Unmute */}
                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink hover:text-primary transition-colors"
                    >
                      {isMuted ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                        >
                          <path d="M11 5L6 9H2v6h4l5 4V5z" />
                          <line x1="23" y1="9" x2="17" y2="15" />
                          <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-5 w-5"
                        >
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                      )}
                    </button>

                    {/* Time */}
                    <span className="font-mono text-muted text-[11px] select-none">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right: Fullscreen */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleFullscreen}
                      aria-label={
                        isFullscreen ? "Exit fullscreen" : "Fullscreen"
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink hover:text-primary transition-colors"
                    >
                      {isFullscreen ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4"
                        >
                          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4"
                        >
                          <path d="M15 3h6v6m0 6v6h-6M9 21H3v-6M3 9V3h6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
