import Link from "next/link";
import { motion } from "framer-motion";
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
      <div className="status-card-static p-10 text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 mb-4">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-sm font-bold">No incidents reported</p>
        <p className="text-xs text-[var(--text-muted)] mt-1.5">
          All systems have been running smoothly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {list.map((incident, i) => (
        <motion.div
          key={incident.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
        >
          <IncidentCard
            incident={incident}
            defaultExpanded={expandedDefault}
          />
        </motion.div>
      ))}
      {showViewAll && incidents.length > (limit || 0) && (
        <Link
          href="/incidents"
          className="inline-flex items-center gap-1.5 text-sm font-semibold status-link mt-2 group"
        >
          View all incidents
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function IncidentCard({ incident, defaultExpanded = false }) {
  const severity = INCIDENT_SEVERITY[incident.severity] || INCIDENT_SEVERITY.degraded;
  const isResolved = incident.status === "resolved";

  return (
    <article className="status-card-static overflow-hidden">
      <div className="px-5 py-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="status-badge bg-[var(--page-bg)] border border-[var(--border)] text-[var(--text-muted)]">
            {incident.id}
          </span>
          <span className={`status-badge ${severity.badge}`}>
            {severity.label}
          </span>
          {isResolved && (
            <span className="status-badge bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
              Resolved
            </span>
          )}
        </div>
        <h3 className="text-base font-bold">{incident.title}</h3>
        <p className="text-xs font-mono text-[var(--text-muted)] mt-2">
          {formatDateTime(incident.startedAt)}
          {incident.resolvedAt && ` — Resolved ${formatDateTime(incident.resolvedAt)}`}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {incident.affectedSites.map((site) => (
            <span
              key={site}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-[var(--border)] text-[var(--text-muted)] font-mono bg-[var(--page-bg)]"
            >
              {site}
            </span>
          ))}
        </div>
      </div>

      <details className="group border-t border-[var(--border)]" open={defaultExpanded}>
        <summary className="px-5 py-3.5 text-xs font-semibold cursor-pointer text-[var(--text-muted)] hover:text-[var(--accent)] list-none flex items-center justify-between transition-colors status-shimmer">
          Incident timeline
          <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
        </summary>
        <div className="px-5 pb-6 relative">
          <div className="incident-timeline-line" />
          <ul className="space-y-5">
            {incident.updates.map((update, i) => {
              const st = INCIDENT_STATUS[update.status] || INCIDENT_STATUS.investigating;
              return (
                <li key={i} className="relative pl-8">
                  <span
                    className={`absolute left-0 top-1 h-[22px] w-[22px] rounded-full border-2 border-[var(--surface-solid)] ${st.bg} flex items-center justify-center shadow-sm`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`status-badge ${st.bg} ${st.color}`}>
                      {st.label}
                    </span>
                    <time className="text-[11px] font-mono text-[var(--text-muted)]">
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
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { label: "Total", value: incidents.length },
        { label: "Active", value: active, warn: active > 0 },
        { label: "Resolved", value: resolved, ok: true },
      ].map((s) => (
        <div key={s.label} className="status-metric-card text-center">
          <p
            className={`text-3xl font-bold tabular-nums ${
              s.warn
                ? "text-red-600 dark:text-red-400"
                : s.ok
                  ? "text-emerald-600 dark:text-emerald-400"
                  : ""
            }`}
          >
            {s.value}
          </p>
          <p className="status-section-title mt-2">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
