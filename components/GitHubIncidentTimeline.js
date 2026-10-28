import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { formatDateTime } from "../lib/statusTheme";
import { INCIDENT_SEVERITY, INCIDENT_STATUS } from "../lib/incidents";

/**
 * GitHubIncidentTimeline
 *
 * Renders past incidents in the iconic GitHub Status & GitLab Status daily format:
 * Grouped day-by-day with "No incidents reported today" on clean days, and detailed
 * incident postmortem logs on days with outages.
 */
export default function GitHubIncidentTimeline({
  incidents = [],
  daysToShow = 14,
}) {
  const [expandedIncidentId, setExpandedIncidentId] = useState(null);

  // Group incidents by calendar day
  const dailyTimeline = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dayStr = d.toISOString().split("T")[0];
      const isToday = i === 0;
      const isYesterday = i === 1;

      const dayIncidents = incidents.filter((inc) => {
        const incDate = new Date(inc.startedAt).toISOString().split("T")[0];
        return incDate === dayStr;
      });

      const formattedHeader = isToday
        ? `Today — ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
        : isYesterday
        ? `Yesterday — ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
        : d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

      days.push({
        date: d,
        dayStr,
        formattedHeader,
        incidents: dayIncidents,
      });
    }

    return days;
  }, [incidents, daysToShow]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--accent)]" />
            GitHub-Style Daily Incident & Postmortem Log
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Chronological system availability and postmortem history for the past {daysToShow} days.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {dailyTimeline.map((day) => (
          <div
            key={day.dayStr}
            className="status-card-static overflow-hidden border border-[var(--border)]"
          >
            {/* Day Header */}
            <div className="px-4 py-3 bg-[var(--surface-raised)] border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-[var(--text)]">
                {day.formattedHeader}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {day.incidents.length > 0
                  ? `${day.incidents.length} event${day.incidents.length > 1 ? "s" : ""}`
                  : "Normal Operations"}
              </span>
            </div>

            {/* Day Body */}
            <div className="p-4">
              {day.incidents.length === 0 ? (
                <div className="text-xs text-[var(--text-muted)] font-mono py-1 flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>No incidents reported today.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {day.incidents.map((inc) => {
                    const isExpanded = expandedIncidentId === inc.id;
                    const sev =
                      INCIDENT_SEVERITY[inc.severity] ||
                      INCIDENT_SEVERITY.degraded;
                    const isResolved = inc.status === "resolved";

                    return (
                      <div
                        key={inc.id}
                        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/50 dark:bg-slate-800 text-[var(--text-muted)] border border-[var(--border)]">
                                {inc.id}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${sev.badge}`}>
                                {sev.label}
                              </span>
                              {isResolved && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                  Resolved
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-[var(--text)]">
                              {inc.title}
                            </h3>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedIncidentId(
                                isExpanded ? null : inc.id
                              )
                            }
                            className="status-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1 self-start sm:self-auto font-mono"
                          >
                            <span>Timeline</span>
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 rotate-180" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Affected Services */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {inc.affectedSites.map((site) => (
                            <span
                              key={site}
                              className="text-[11px] px-2 py-0.5 rounded-md border border-[var(--border)] bg-slate-100 dark:bg-slate-800/80 font-mono text-[var(--text-muted)]"
                            >
                              {site}
                            </span>
                          ))}
                        </div>

                        {/* Incident Timeline Steps */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-[var(--border)] space-y-3 animate-in fade-in duration-150">
                            {inc.updates.map((update, idx) => {
                              const st =
                                INCIDENT_STATUS[update.status] ||
                                INCIDENT_STATUS.investigating;

                              return (
                                <div
                                  key={idx}
                                  className="relative pl-6 text-xs space-y-1"
                                >
                                  <div className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[10px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${st.bg} ${st.color}`}
                                    >
                                      {st.label}
                                    </span>
                                    <span className="font-mono text-[11px] text-[var(--text-muted)]">
                                      {formatDateTime(update.time)}
                                    </span>
                                  </div>
                                  <p className="text-[var(--text-muted)] leading-relaxed">
                                    {update.message}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
