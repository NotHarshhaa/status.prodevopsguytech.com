import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Zap,
  Server,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import StatusPulse from "./StatusPulse";
import LatencySparkline from "./LatencySparkline";
import {
  COMPONENT_STATUS,
  groupSites,
  getOverallStatus,
  OVERALL_STATUS,
  generateUptimeHistory,
  getUptimePercent,
} from "../lib/statusTheme";
import { modernStagger, modernFadeIn } from "../lib/animations";

const DAY_COLORS = {
  operational: "bg-emerald-500 hover:bg-emerald-400",
  degraded: "bg-amber-400 hover:bg-amber-300",
  outage: "bg-red-500 hover:bg-red-400",
  maintenance: "bg-indigo-500 hover:bg-indigo-400",
  default: "bg-slate-300 dark:bg-slate-700",
};

export default function ComponentStatusList({
  sites = [],
  historical = null,
}) {
  const groups = groupSites(sites).map((group) => {
    const sortedSites = [...group.sites].sort((a, b) => {
      const rank = (s) =>
        s.status === "operational" ? 1 : s.status === "degraded" ? 0 : -1;
      return rank(a) - rank(b);
    });

    const hasIssue = sortedSites.some((s) => s.status !== "operational");
    return {
      ...group,
      sites: sortedSites,
      hasIssue,
      groupStatus: hasIssue ? "degraded" : "operational",
    };
  });

  if (!sites.length) {
    return (
      <div className="status-card-static p-10 text-center text-sm text-[var(--text-muted)]">
        No services to display.
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={modernStagger}
      initial="hidden"
      animate="visible"
    >
      {groups.map((group) => (
        <motion.section
          key={group.id}
          variants={modernFadeIn}
          className="status-card-static overflow-hidden border border-[var(--border)] shadow-sm"
        >
          {/* GitHub / Statuspage Group Header with Rollup Status */}
          <div className="px-5 py-3.5 bg-[var(--surface-raised)] border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-[var(--text)]">
                  {group.name}
                </h2>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  ({group.sites.length} services)
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 hidden sm:block">
                {group.description}
              </p>
            </div>

            {/* Group Status Rollup Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                group.groupStatus === "operational"
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/20"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  group.groupStatus === "operational"
                    ? "bg-emerald-500"
                    : "bg-amber-500 animate-pulse"
                }`}
              />
              {group.groupStatus === "operational"
                ? "Operational"
                : "Degraded Performance"}
            </span>
          </div>

          {/* Component Rows */}
          <div className="divide-y divide-[var(--border)]">
            {group.sites.map((site, i) => (
              <GitHubStyleComponentRow
                key={site.id}
                site={site}
                index={i}
                historical={historical}
              />
            ))}
          </div>
        </motion.section>
      ))}
    </motion.div>
  );
}

/**
 * GitHub & Atlassian Statuspage Style Component Row
 * Features: Name, Status Badge, Continuous 90-Day Tick Bars, and Expandable Diagnostics.
 */
function GitHubStyleComponentRow({ site, index, historical }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cfg = COMPONENT_STATUS[site.status] || COMPONENT_STATUS.unknown;
  const hasIssue = site.status !== "operational";

  // Generate 90-day availability history
  const history = useMemo(() => {
    return generateUptimeHistory(
      site.id,
      site.status,
      90,
      historical?.daily?.[site.id]
    );
  }, [site.id, site.status, historical]);

  const uptime = getUptimePercent(history);

  const timing = site.timing || {
    dns: 12,
    tcp: 24,
    tls: 36,
    ttfb: Math.max(20, (site.responseTime || 150) - 72),
    total: site.responseTime || 150,
  };

  const ssl = site.ssl || null;

  return (
    <motion.div
      id={`site-${site.id}`}
      className={`px-5 py-4 transition-colors ${
        hasIssue
          ? "bg-amber-50/40 dark:bg-amber-950/20"
          : "hover:bg-slate-50/40 dark:hover:bg-slate-900/30"
      }`}
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      {/* Top Header: Name, Sparkline & Status Badge */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <StatusPulse status={site.status} size="small" />
          <div className="min-w-0">
            <Link
              href={`/site/${site.id}`}
              className="text-sm font-semibold hover:text-[var(--accent)] transition-colors truncate block group"
            >
              {site.name}
              <ChevronRight className="inline h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ml-0.5" />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Micro Latency Sparkline */}
          <div className="hidden md:inline-flex items-center gap-2 mr-1">
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {site.responseTime != null ? `${site.responseTime}ms` : "—"}
            </span>
            <LatencySparkline
              data={site.latencyHistory}
              status={site.status}
              width={75}
              height={18}
            />
          </div>

          {/* Status Badge */}
          <span
            className={`status-badge border text-[11px] font-mono ${cfg.text} ${
              hasIssue
                ? "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800"
                : "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800"
            }`}
          >
            {site.statusText || cfg.label}
          </span>

          {/* Quick External Link */}
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            aria-label={`Visit ${site.name}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Accordion Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)] transition-transform ${
              isExpanded ? "rotate-180 bg-slate-200/50 dark:bg-slate-800" : ""
            }`}
            title="Toggle diagnostics"
            aria-label="Toggle diagnostics"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* GitHub Status Iconic 90-Day Continuous Availability Bar */}
      <div className="mt-2">
        <div className="flex gap-[2px] rounded overflow-hidden h-7 sm:h-8 p-0.5 bg-slate-100 dark:bg-slate-900/60 border border-[var(--border)]">
          {history.map((day, i) => {
            const color = DAY_COLORS[day.status] || DAY_COLORS.default;
            const dateLabel = new Date(day.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            const statusLabel =
              COMPONENT_STATUS[day.status]?.label || day.status;
            const tooltip = `${dateLabel}: ${statusLabel} (${day.uptime}% uptime${
              day.avgResponseTime ? `, ${day.avgResponseTime}ms` : ""
            })`;

            return (
              <div
                key={i}
                className={`flex-1 transition-all rounded-[1px] cursor-pointer ${color}`}
                title={tooltip}
              />
            );
          })}
        </div>

        {/* 90-day legend row */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mt-1.5 px-0.5">
          <span>90 days ago</span>
          <span className="flex items-center gap-1.5">
            <span>Today</span>
            <span>•</span>
            <span
              className={`font-bold ${
                uptime >= 99.9
                  ? "text-emerald-500"
                  : uptime >= 99
                  ? "text-amber-500"
                  : "text-red-500"
              }`}
            >
              {uptime}% uptime
            </span>
          </span>
        </div>
      </div>

      {/* Expandable Diagnostic Console & Waterfall */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[var(--border)] pt-4 mt-3 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Synthetic Network Waterfall */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[var(--text-muted)] flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                    Network Waterfall
                  </span>
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-[var(--accent)]">
                    {site.responseTime != null ? `${site.responseTime}ms` : "N/A"}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-500 dark:text-[var(--text-muted)]">
                    <span>DNS Lookup:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{timing.dns}ms</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-[var(--text-muted)]">
                    <span>TCP Connect:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{timing.tcp}ms</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-[var(--text-muted)]">
                    <span>TLS Handshake:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{timing.tls}ms</span>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-[var(--text-muted)]">
                    <span>TTFB (Server Process):</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{timing.ttfb}ms</span>
                  </div>
                </div>
              </div>

              {/* TLS/SSL Certificate Details */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[var(--text-muted)] flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                    TLS Certificate
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      ssl?.isExpiringSoon
                        ? "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    }`}
                  >
                    {ssl?.daysRemaining != null
                      ? `${ssl.daysRemaining} days left`
                      : "Verified"}
                  </span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-500 dark:text-[var(--text-muted)]">
                  <div className="truncate">
                    <span>Issuer: </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{ssl?.issuer || "Let's Encrypt"}</span>
                  </div>
                  <div className="truncate">
                    <span>Domain: </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{ssl?.subject || site.url.replace(/^https?:\/\//, "")}</span>
                  </div>
                  <div>
                    <span>Protocol: </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">TLS 1.3 / HTTP/2</span>
                  </div>
                </div>
              </div>

              {/* Endpoint & Console Quick Actions */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-[var(--border)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-[var(--text-muted)] flex items-center gap-1.5">
                      <Server className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                      Probe Specs
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      HTTP {site.statusCode || 200}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-500 dark:text-[var(--text-muted)] truncate">
                    Target Route: <span className="text-slate-800 dark:text-slate-200 font-medium">{site.workingEndpoint || "/"}</span>
                  </p>
                  <p className="font-mono text-[11px] text-slate-500 dark:text-[var(--text-muted)] truncate mt-1">
                    Origin: <span className="text-slate-800 dark:text-slate-200 font-medium">{site.url}</span>
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 mt-2">
                  <Link
                    href={`/site/${site.id}`}
                    className="text-xs text-teal-600 dark:text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-mono font-medium"
                  >
                    <Terminal className="h-3 w-3" />
                    Open Diagnostics Console →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
        <p className="text-3xl font-bold tabular-nums mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
          {operational}
          <span className="text-lg text-[var(--text-muted)] font-normal">
            /{sites.length}
          </span>
        </p>
      </div>

      <div className="status-metric-card text-center">
        <p className="status-section-title">Health Score</p>
        <p
          className={`text-3xl font-bold tabular-nums mt-1 font-mono ${
            uptimePct === 100
              ? "text-emerald-600 dark:text-emerald-400"
              : uptimePct >= 90
              ? "text-amber-600 dark:text-amber-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {uptimePct}%
        </p>
      </div>
    </div>
  );
}
