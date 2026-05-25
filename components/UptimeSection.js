import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  generateUptimeHistory,
  getUptimePercent,
  COMPONENT_STATUS,
} from "../lib/statusTheme";

const DAY_COLORS = {
  operational: "bg-emerald-500 dark:bg-emerald-500",
  degraded: "bg-amber-400 dark:bg-amber-400",
  outage: "bg-red-500 dark:bg-red-500",
  maintenance: "bg-indigo-500 dark:bg-indigo-500",
  default: "bg-slate-200 dark:bg-slate-700",
};

export default function UptimeSection({ sites = [], days = 90, compact = false }) {
  if (!sites.length) return null;

  return (
    <section className="status-card-static overflow-hidden">
      <div className="status-group-header">
        <h2 className="text-base font-bold">Uptime over the past {days} days</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Each bar represents one day. Hover for details.
        </p>
        <div className="flex flex-wrap gap-4 mt-4 text-[11px] font-mono text-[var(--text-muted)]">
          {[
            { label: "Operational", color: DAY_COLORS.operational },
            { label: "Degraded", color: DAY_COLORS.degraded },
            { label: "Outage", color: DAY_COLORS.outage },
            { label: "Maintenance", color: DAY_COLORS.maintenance },
          ].map(({ label, color }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-[3px] ${color}`} />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className={`${compact ? "px-4 sm:px-5" : "px-5"} py-1 divide-y divide-[var(--border)]`}>
        {sites.map((site, i) => (
          <UptimeRow key={site.id} site={site} days={days} compact={compact} index={i} />
        ))}
      </div>
    </section>
  );
}

function UptimeRow({ site, days, compact, index }) {
  const history = useMemo(
    () => generateUptimeHistory(site.id, site.status, days),
    [site.id, site.status, days],
  );
  const uptime = getUptimePercent(history);
  const cfg = COMPONENT_STATUS[site.status] || COMPONENT_STATUS.unknown;

  return (
    <motion.div
      className={`${compact ? "py-4" : "py-5"}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.02 }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`status-dot ${cfg.dot}`} />
          <Link
            href={`/site/${site.id}`}
            className="text-sm font-semibold truncate hover:text-[var(--accent)] transition-colors"
          >
            {site.name}
          </Link>
        </div>
        <span className={`text-sm font-bold tabular-nums font-mono flex-shrink-0 ${
          uptime >= 99.9
            ? "text-emerald-600 dark:text-emerald-400"
            : uptime >= 99
              ? "text-amber-600 dark:text-amber-400"
              : "text-red-600 dark:text-red-400"
        }`}>
          {uptime}%
        </span>
      </div>
      <div className="flex gap-[2px] rounded-lg overflow-hidden">
        {history.map((day, i) => {
          const color = DAY_COLORS[day.status] || DAY_COLORS.default;
          const dateLabel = new Date(day.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const statusLabel =
            COMPONENT_STATUS[day.status]?.label || day.status;
          return (
            <div
              key={i}
              className={`uptime-day ${color}`}
              title={`${dateLabel}: ${statusLabel}`}
            />
          );
        })}
      </div>
      {!compact && (
        <div className="flex justify-between mt-2 text-[10px] font-mono text-[var(--text-muted)]">
          <span>{days} days ago</span>
          <span>Today</span>
        </div>
      )}
    </motion.div>
  );
}

export function UptimeSummaryCards({ sites = [] }) {
  const stats = useMemo(() => {
    const all = sites.map((s) => ({
      ...s,
      uptime: getUptimePercent(
        generateUptimeHistory(s.id, s.status, 90),
      ),
    }));
    const avg =
      all.length > 0
        ? (all.reduce((sum, s) => sum + s.uptime, 0) / all.length).toFixed(2)
        : "100.00";
    const worst = all.length
      ? [...all].sort((a, b) => a.uptime - b.uptime)[0]
      : null;
    return { avg, worst, count: all.length };
  }, [sites]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[
        { label: "Average uptime (90d)", value: `${stats.avg}%`, accent: true },
        { label: "Services monitored", value: stats.count },
        {
          label: "Lowest uptime",
          value: stats.worst ? `${stats.worst.uptime}%` : "—",
          sub: stats.worst?.name,
        },
      ].map((item) => (
        <div key={item.label} className="status-metric-card">
          <p className="status-section-title">{item.label}</p>
          <p className={`text-3xl font-bold mt-2 tabular-nums font-mono ${
            item.accent ? "text-emerald-600 dark:text-emerald-400" : ""
          }`}>
            {item.value}
          </p>
          {item.sub && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5 truncate">
              {item.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
