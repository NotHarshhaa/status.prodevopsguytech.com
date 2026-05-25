import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, ChevronRight } from "lucide-react";
import StatusPulse from "./StatusPulse";
import {
  COMPONENT_STATUS,
  groupSites,
  getOverallStatus,
  OVERALL_STATUS,
} from "../lib/statusTheme";
import { modernStagger, modernFadeIn } from "../lib/animations";

export default function ComponentStatusList({ sites = [] }) {
  const groups = groupSites(sites).map((group) => ({
    ...group,
    sites: [...group.sites].sort((a, b) => {
      const rank = (s) =>
        s.status === "operational" ? 1 : s.status === "degraded" ? 0 : -1;
      return rank(a) - rank(b);
    }),
  }));

  if (!sites.length) {
    return (
      <div className="status-card-static p-10 text-center text-sm text-[var(--text-muted)]">
        No services to display.
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5"
      variants={modernStagger}
      initial="hidden"
      animate="visible"
    >
      {groups.map((group) => (
        <motion.section
          key={group.id}
          variants={modernFadeIn}
          className="status-card-static overflow-hidden"
        >
          <div className="status-group-header">
            <h2 className="text-base font-bold">{group.name}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {group.description}
            </p>
          </div>
          <div className="px-5">
            {group.sites.map((site, i) => (
              <ComponentRow key={site.id} site={site} index={i} />
            ))}
          </div>
        </motion.section>
      ))}
    </motion.div>
  );
}

function ComponentRow({ site, index }) {
  const cfg = COMPONENT_STATUS[site.status] || COMPONENT_STATUS.unknown;
  const hasIssue = site.status !== "operational";

  return (
    <motion.div
      id={`site-${site.id}`}
      className={`status-row scroll-mt-28 ${
        hasIssue
          ? "bg-amber-50/60 dark:bg-amber-950/20 -mx-5 px-5 rounded-lg my-1"
          : ""
      }`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <StatusPulse status={site.status} size="small" />
          <div className="min-w-0">
            <Link
              href={`/site/${site.id}`}
              className="text-sm font-semibold hover:text-[var(--accent)] transition-colors truncate block group"
            >
              {site.name}
              <ChevronRight className="inline h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ml-0.5" />
            </Link>
            {site.responseTime != null && (
              <p className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                {site.responseTime}ms
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`status-badge border ${cfg.text} ${
          hasIssue
            ? "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800"
            : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800"
        }`}>
          {site.statusText || cfg.label}
        </span>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[rgba(0,212,170,0.08)] transition-all"
          aria-label={`Visit ${site.name}`}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

export function StatusSummaryBar({ sites = [] }) {
  const overall = getOverallStatus(sites);
  const cfg = OVERALL_STATUS[overall] || OVERALL_STATUS.operational;
  const operational = sites.filter((s) => s.status === "operational").length;
  const issues = sites.filter((s) => s.status !== "operational");
  const uptimePct = sites.length
    ? Math.round((operational / sites.length) * 100)
    : 100;

  return (
    <motion.div
      className="space-y-5 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="status-metric-card sm:col-span-1">
          <div className="flex items-center gap-3">
            <StatusPulse status={overall} size="medium" />
            <div>
              <p className="text-sm font-bold">{cfg.label}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {cfg.description}
              </p>
            </div>
          </div>
        </div>

        <div className="status-metric-card text-center">
          <p className="status-section-title">Operational</p>
          <p className="text-3xl font-bold tabular-nums mt-1 text-emerald-600 dark:text-emerald-400">
            {operational}
            <span className="text-lg text-[var(--text-muted)] font-normal">
              /{sites.length}
            </span>
          </p>
        </div>

        <div className="status-metric-card text-center">
          <p className="status-section-title">Health Score</p>
          <p className={`text-3xl font-bold tabular-nums mt-1 ${
            uptimePct === 100
              ? "text-emerald-600 dark:text-emerald-400"
              : uptimePct >= 90
                ? "text-amber-600 dark:text-amber-400"
                : "text-red-600 dark:text-red-400"
          }`}>
            {uptimePct}%
          </p>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="status-card-static overflow-hidden border-amber-300/50 dark:border-amber-700/50">
          <div className="px-5 py-4 border-b border-[var(--border)] bg-gradient-to-r from-amber-50/80 to-transparent dark:from-amber-950/40 dark:to-transparent">
            <div className="flex items-center gap-2">
              <StatusPulse status="degraded" size="small" />
              <div>
                <p className="text-sm font-bold">
                  {issues.length} service{issues.length !== 1 ? "s" : ""} need attention
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Includes slow responses and HTTP errors — not just full outages.
                </p>
              </div>
            </div>
          </div>
          <div className="px-5">
            {issues.map((site, i) => (
              <ComponentRow key={site.id} site={site} index={i} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
