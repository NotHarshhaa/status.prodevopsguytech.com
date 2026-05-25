import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  COMPONENT_STATUS,
  groupSites,
  getOverallStatus,
  OVERALL_STATUS,
} from "../lib/statusTheme";

export default function ComponentStatusList({ sites = [] }) {
  const groups = groupSites(sites);

  if (!sites.length) {
    return (
      <div className="status-card p-8 text-center text-sm text-[var(--text-muted)]">
        No services to display.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.id} className="status-card overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-base font-semibold">{group.name}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {group.description}
            </p>
          </div>
          <div className="px-4 sm:px-5">
            {group.sites.map((site) => (
              <ComponentRow key={site.id} site={site} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ComponentRow({ site }) {
  const cfg = COMPONENT_STATUS[site.status] || COMPONENT_STATUS.unknown;

  return (
    <div id={`site-${site.id}`} className="status-row scroll-mt-28">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <span className={`status-dot ${cfg.dot}`} aria-hidden />
          <div className="min-w-0">
            <Link
              href={`/site/${site.id}`}
              className="text-sm font-medium hover:underline truncate block"
            >
              {site.name}
            </Link>
            {site.responseTime != null && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {site.responseTime}ms response
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs font-medium ${cfg.text} hidden sm:inline`}>
          {site.statusText || cfg.label}
        </span>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--page-bg)] transition-colors"
          aria-label={`Visit ${site.name}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

export function StatusSummaryBar({ sites = [] }) {
  const overall = getOverallStatus(sites);
  const cfg = OVERALL_STATUS[overall] || OVERALL_STATUS.operational;
  const operational = sites.filter((s) => s.status === "operational").length;

  return (
    <div className="status-card p-4 sm:p-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={`status-dot ${COMPONENT_STATUS[overall]?.dot || "bg-status-dot-unknown"}`} />
          <div>
            <p className="text-sm font-semibold">{cfg.label}</p>
            <p className="text-xs text-[var(--text-muted)]">{cfg.description}</p>
          </div>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-lg font-semibold tabular-nums">{operational}/{sites.length}</p>
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Operational</p>
          </div>
        </div>
      </div>
    </div>
  );
}
