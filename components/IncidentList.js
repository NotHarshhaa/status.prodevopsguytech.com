import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  INCIDENTS,
  INCIDENT_SEVERITY,
  INCIDENT_STATUS,
} from "../lib/incidents";
import { formatDateTime } from "../lib/statusTheme";

export default function IncidentList({
  incidents = INCIDENTS,
  limit,
  showViewAll = false,
  expandedDefault = false,
}) {
  const list = limit ? incidents.slice(0, limit) : incidents;

  if (!list.length) {
    return (
      <div className="status-card p-8 text-center">
        <p className="text-sm font-medium">No incidents reported</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          All systems have been running smoothly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {list.map((incident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          defaultExpanded={expandedDefault}
        />
      ))}
      {showViewAll && incidents.length > (limit || 0) && (
        <Link
          href="/incidents"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#0969da] dark:text-[#58a6ff] hover:underline mt-2"
        >
          View all incidents
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function IncidentCard({ incident, defaultExpanded = false }) {
  const severity = INCIDENT_SEVERITY[incident.severity] || INCIDENT_SEVERITY.degraded;
  const isResolved = incident.status === "resolved";

  return (
    <article className="status-card overflow-hidden">
      <div className="px-4 sm:px-5 py-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-[11px] font-mono text-[var(--text-muted)]">
            {incident.id}
          </span>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${severity.badge}`}>
            {severity.label}
          </span>
          {isResolved && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              Resolved
            </span>
          )}
        </div>
        <h3 className="text-sm sm:text-base font-semibold">{incident.title}</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {formatDateTime(incident.startedAt)}
          {incident.resolvedAt && ` — Resolved ${formatDateTime(incident.resolvedAt)}`}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {incident.affectedSites.map((site) => (
            <span
              key={site}
              className="text-[11px] px-2 py-0.5 rounded border border-[var(--border)] text-[var(--text-muted)]"
            >
              {site}
            </span>
          ))}
        </div>
      </div>

      <details className="group border-t border-[var(--border)]" open={defaultExpanded}>
        <summary className="px-4 sm:px-5 py-3 text-xs font-medium cursor-pointer text-[var(--text-muted)] hover:text-[var(--text)] list-none flex items-center justify-between">
          Incident timeline
          <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
        </summary>
        <div className="px-4 sm:px-5 pb-5 relative">
          <div className="incident-timeline-line" />
          <ul className="space-y-4">
            {incident.updates.map((update, i) => {
              const st = INCIDENT_STATUS[update.status] || INCIDENT_STATUS.investigating;
              return (
                <li key={i} className="relative pl-8">
                  <span
                    className={`absolute left-0 top-1 h-[22px] w-[22px] rounded-full border-2 border-[var(--surface)] ${st.bg} flex items-center justify-center`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                    <time className="text-[11px] text-[var(--text-muted)]">
                      {formatDateTime(update.time)}
                    </time>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {update.message}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </details>
    </article>
  );
}

export function IncidentStats({ incidents = INCIDENTS }) {
  const active = incidents.filter((i) => i.status !== "resolved").length;
  const resolved = incidents.filter((i) => i.status === "resolved").length;

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[
        { label: "Total", value: incidents.length },
        { label: "Active", value: active, warn: active > 0 },
        { label: "Resolved", value: resolved, ok: true },
      ].map((s) => (
        <div key={s.label} className="status-card p-4 text-center">
          <p
            className={`text-2xl font-semibold tabular-nums ${
              s.warn
                ? "text-red-600 dark:text-red-400"
                : s.ok
                  ? "text-emerald-600 dark:text-emerald-400"
                  : ""
            }`}
          >
            {s.value}
          </p>
          <p className="status-section-title mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
