import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, Play, Pause, ChevronDown, Check } from "lucide-react";

/**
 * LiveAutoRefresh
 *
 * Provides a modern real-time polling countdown ring, pause/resume capability,
 * and selectable intervals (15s, 30s, 60s, Manual).
 */
export default function LiveAutoRefresh({
  onRefresh,
  isRefreshing = false,
  defaultInterval = 60,
}) {
  const [intervalSec, setIntervalSec] = useState(defaultInterval);
  const [timeLeft, setTimeLeft] = useState(defaultInterval);
  const [isPaused, setIsPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const triggerRefresh = useCallback(() => {
    if (onRefresh && !isRefreshing) {
      onRefresh();
      setTimeLeft(intervalSec);
    }
  }, [onRefresh, isRefreshing, intervalSec]);

  // Click outside to close menu
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (isPaused || intervalSec === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          triggerRefresh();
          return intervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, intervalSec, triggerRefresh]);

  // Reset countdown if interval changed
  const handleSelectInterval = (sec) => {
    setIntervalSec(sec);
    setTimeLeft(sec);
    setIsPaused(sec === 0);
    setMenuOpen(false);
  };

  const circumference = 2 * Math.PI * 8; // radius 8
  const strokeDashoffset =
    intervalSec > 0
      ? circumference - (timeLeft / intervalSec) * circumference
      : circumference;

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={menuRef}>
      {/* Countdown Pill & Trigger */}
      <div className="inline-flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm px-2.5 py-1 text-xs font-mono">
        {/* Circular Progress Ring */}
        <div className="relative flex items-center justify-center mr-2">
          {intervalSec > 0 && !isPaused ? (
            <svg className="h-5 w-5 -rotate-90" viewBox="0 0 20 20">
              <circle
                cx="10"
                cy="10"
                r="8"
                className="stroke-slate-200 dark:stroke-slate-800"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                className="stroke-emerald-500 transition-all duration-1000 ease-linear"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          ) : (
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </div>

        {/* Status text */}
        <span className="text-[11px] font-medium text-[var(--text-muted)] min-w-[55px]">
          {isPaused
            ? "Paused"
            : intervalSec === 0
            ? "Manual"
            : `${timeLeft}s sync`}
        </span>

        {/* Pause / Resume Button */}
        {intervalSec > 0 && (
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800/60 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors ml-1"
            title={isPaused ? "Resume auto-refresh" : "Pause auto-refresh"}
          >
            {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          </button>
        )}

        {/* Dropdown toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800/60 text-[var(--text-muted)] transition-colors"
          title="Change interval"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Manual Refresh Button */}
      <button
        type="button"
        onClick={() => {
          triggerRefresh();
        }}
        disabled={isRefreshing}
        className="status-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1.5"
        title="Force refresh now"
      >
        <RefreshCw
          className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`}
        />
        <span className="hidden sm:inline">Refresh</span>
      </button>

      {/* Interval Menu Dropdown */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-[var(--border)] bg-[var(--surface-solid)] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] mb-1">
            Auto-refresh rate
          </div>
          {[
            { label: "Every 15s (Aggressive)", value: 15 },
            { label: "Every 30s (Recommended)", value: 30 },
            { label: "Every 60s (Standard)", value: 60 },
            { label: "Manual only", value: 0 },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelectInterval(opt.value)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                intervalSec === opt.value
                  ? "bg-[rgba(0,212,170,0.1)] text-[var(--accent)] font-medium"
                  : "text-[var(--text)] hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>{opt.label}</span>
              {intervalSec === opt.value && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
