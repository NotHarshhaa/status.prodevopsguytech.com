import { useState } from "react";
import { Wrench, Calendar, Clock, ChevronDown, ChevronUp, Download, CheckCircle2 } from "lucide-react";
import { downloadICS } from "../lib/maintenance";

export default function MaintenanceBanner({ maintenanceList = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  // Filter for active or scheduled maintenance
  const activeOrUpcoming = maintenanceList.filter(
    (m) => m.status === "in_progress" || m.status === "scheduled"
  );

  if (!activeOrUpcoming.length) return null;

  return (
    <div className="space-y-3 mb-8">
      {activeOrUpcoming.map((item) => {
        const isInProgress = item.status === "in_progress";
        const isExpanded = expandedId === item.id;
        const startDate = new Date(item.scheduledStart);
        const endDate = new Date(item.scheduledEnd);

        // Calculate time until maintenance
        const now = new Date();
        const diffMs = startDate - now;
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffHours / 24);

        const countdownText = isInProgress
          ? "In Progress Now"
          : diffDays > 1
          ? `Starts in ${diffDays} days`
          : diffHours > 0
          ? `Starts in ~${diffHours} hours`
          : "Starting shortly";

        return (
          <div
            key={item.id}
            className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-md ${
              isInProgress
                ? "bg-gradient-to-r from-blue-950/40 via-indigo-950/20 to-transparent border-blue-500/40"
                : "bg-slate-900/40 dark:bg-slate-900/60 border-slate-700/60"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    isInProgress
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse"
                      : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  }`}
                >
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        isInProgress
                          ? "bg-blue-500 text-slate-950"
                          : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      }`}
                    >
                      {item.status.replace("_", " ")}
                    </span>
                    <span className="text-xs font-mono text-[var(--accent)] font-semibold">
                      {countdownText}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      • ID: {item.id}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text)] mt-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
                    {item.summary}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => downloadICS(item)}
                  className="status-btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5"
                  title="Add to Google / Apple / Outlook Calendar"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add to Calendar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-slate-800/40 hover:text-[var(--text)] transition-colors"
                  aria-label="Toggle details"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3 text-xs text-[var(--text)] animate-in fade-in duration-200">
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                  {item.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950/40 border border-[var(--border)]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                      Scheduled Window (UTC)
                    </span>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <Clock className="h-3.5 w-3.5 text-blue-400" />
                      <span>
                        {startDate.toUTCString().slice(0, 22)} — {endDate.toUTCString().slice(17, 22)} UTC
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/40 border border-[var(--border)]">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                      Expected Impact
                    </span>
                    <span className="font-semibold capitalize text-amber-400">
                      {item.impact} impact expected
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                    Affected Components:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.affectedServices.map((srv, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono text-[11px]"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
