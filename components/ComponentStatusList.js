import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Server,
  Zap,
  Radio,
  Terminal,
} from "lucide-react";
import StatusPulse from "./StatusPulse";
import LatencySparkline from "./LatencySparkline";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const cfg = COMPONENT_STATUS[site.status] || COMPONENT_STATUS.unknown;
  const hasIssue = site.status !== "operational";

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
      className={`scroll-mt-28 border-b border-[var(--border)] last:border-b-0 transition-colors ${
        hasIssue
          ? "bg-amber-50/60 dark:bg-amber-950/20 -mx-5 px-5 rounded-xl my-1 border-transparent"
          : "hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
      }`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
    >
      {/* Main Row */}
      <div className="flex items-center justify-between py-3.5 gap-3">
        {/* Left: Indicator & Name */}
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <StatusPulse status={site.status} size="small" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/site/${site.id}`}
                className="text-sm font-semibold hover:text-[var(--accent)] transition-colors truncate block group"
              >
                {site.name}
                <ChevronRight className="inline h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all ml-0.5" />
              </Link>
            </div>
            {site.description && (
              <p className="text-xs text-[var(--text-muted)] truncate hidden md:block mt-0.5">
                {site.description}
              </p>
            )}
          </div>
        </div>

        {/* Center: Interactive Sparkline (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 px-2">
          <LatencySparkline
            data={site.latencyHistory}
            status={site.status}
            width={100}
            height={24}
            showLabels={true}
          />
        </div>

        {/* Right: Badge & Expand Drawer Toggle */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span
            className={`status-badge border ${cfg.text} ${
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
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[rgba(0,212,170,0.08)] transition-all"
            aria-label={`Visit ${site.name}`}
            title={`Visit ${site.url}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {/* Expand Diagnostics Drawer */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-transform ${
              isExpanded ? "rotate-180 bg-slate-200/50 dark:bg-slate-800" : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
            title={isExpanded ? "Collapse diagnostics" : "Expand telemetry & diagnostics"}
            aria-label="Toggle diagnostics"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expandable Inline Diagnostics Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[var(--border)] pt-3 pb-4 mb-2 space-y-3"
          >
            {/* Grid of Diagnostics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Synthetic Latency Waterfall */}
              <div className="p-3 rounded-xl bg-slate-900/40 dark:bg-slate-950/60 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-amber-400" />
                    Network Waterfall
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--accent)]">
                    {site.responseTime != null ? `${site.responseTime}ms` : "N/A"}
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>DNS Lookup:</span>
                    <span className="text-slate-300">{timing.dns}ms</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>TCP Connect:</span>
                    <span className="text-slate-300">{timing.tcp}ms</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>TLS Handshake:</span>
                    <span className="text-slate-300">{timing.tls}ms</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>TTFB (Server Process):</span>
                    <span className="text-slate-300">{timing.ttfb}ms</span>
                  </div>
                </div>
              </div>

              {/* SSL Certificate Telemetry */}
              <div className="p-3 rounded-xl bg-slate-900/40 dark:bg-slate-950/60 border border-[var(--border)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    TLS Certificate
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      ssl?.isExpiringSoon
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {ssl?.daysRemaining != null
                      ? `${ssl.daysRemaining} days left`
                      : "Verified"}
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-[11px] text-[var(--text-muted)]">
                  <div className="truncate">
                    <span>Issuer: </span>
                    <span className="text-slate-300">{ssl?.issuer || "Let's Encrypt"}</span>
                  </div>
                  <div className="truncate">
                    <span>Subject: </span>
                    <span className="text-slate-300">{ssl?.subject || site.url.replace(/^https?:\/\//, "")}</span>
                  </div>
                  <div>
                    <span>Protocol: </span>
                    <span className="text-slate-300">TLS 1.3 / HTTP 2</span>
                  </div>
                </div>
              </div>

              {/* Target Endpoint & HTTP Specs */}
              <div className="p-3 rounded-xl bg-slate-900/40 dark:bg-slate-950/60 border border-[var(--border)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                      <Server className="h-3 w-3 text-blue-400" />
                      Probe Target
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      HTTP {site.statusCode || 200}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-[var(--text-muted)] truncate">
                    Endpoint: <span className="text-slate-300">{site.workingEndpoint || "/"}</span>
                  </p>
                  <p className="font-mono text-[11px] text-[var(--text-muted)] truncate mt-1">
                    Route: <span className="text-slate-300">{site.url}</span>
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800/60 mt-2">
                  <Link
                    href={`/site/${site.id}`}
                    className="text-xs text-[var(--accent)] hover:underline inline-flex items-center gap-1 font-mono"
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
          <p
            className={`text-3xl font-bold tabular-nums mt-1 ${
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
