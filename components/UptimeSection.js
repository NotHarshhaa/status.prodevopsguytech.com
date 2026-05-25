import { useMemo } from "react";
import Link from "next/link";
import {
  generateUptimeHistory,
  getUptimePercent,
  COMPONENT_STATUS,
} from "../lib/statusTheme";

const DAY_COLORS = {
  operational: "bg-emerald-500 dark:bg-emerald-600",
  degraded: "bg-amber-400 dark:bg-amber-500",
  outage: "bg-red-500 dark:bg-red-600",
  maintenance: "bg-blue-500 dark:bg-blue-600",
  default: "bg-neutral-200 dark:bg-neutral-700",
};

export default function UptimeSection({ sites = [], days = 90, compact = false }) {
  if (!sites.length) return null;

  return (
    <section className="status-card overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-[var(--border)]">
        <h2 className="text-base font-semibold">Uptime over the past {days} days</h2>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Each bar represents one day. Hover for details.
        </p>
        <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-[var(--text-muted)]">
          {[
            { label: "Operational", color: DAY_COLORS.operational },
            { label: "Degraded", color: DAY_COLORS.degraded },
            { label: "Outage", color: DAY_COLORS.outage },
            { label: "Maintenance", color: DAY_COLORS.maintenance },
          ].map(({ label, color }) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className={`${compact ? "px-3 sm:px-4" : "px-4 sm:px-5"} py-2 divide-y divide-[var(--border)]`}>
        {sites.map((site) => (
          <UptimeRow key={site.id} site={site} days={days} compact={compact} />
        ))}
      </div>
    </section>
  );
}

function UptimeRow({ site, days, compact }) {
  const history = useMemo(
    () => generateUptimeHistory(site.id, site.status, days),
    [site.id, site.status, days],
  );
  const uptime = getUptimePercent(history);
  const cfg = COMPONENT_STATUS[site.status] || COMPONENT_STATUS.unknown;

  return (
    <div className={`${compact ? "py-3" : "py-4"}`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`status-dot ${cfg.dot}`} />
          <Link
            href={`/site/${site.id}`}
            className="text-sm font-medium truncate hover:underline"
          >
            {site.name}
          </Link>
        </div>
        <span className="text-xs font-semibold tabular-nums text-[var(--text-muted)] flex-shrink-0">
          {uptime}%
        </span>
      </div>
      <div className="flex gap-[2px]">
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
              className={`uptime-day ${color} opacity-90 hover:opacity-100 transition-opacity`}
              title={`${dateLabel}: ${statusLabel}`}
            />
          );
        })}
      </div>
      {!compact && (
        <div className="flex justify-between mt-1.5 text-[10px] text-[var(--text-muted)]">
          <span>{days} days ago</span>
          <span>Today</span>
        </div>
      )}
    </div>
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {[
        { label: "Average uptime (90d)", value: `${stats.avg}%` },
        { label: "Services monitored", value: stats.count },
        {
          label: "Lowest uptime",
          value: stats.worst ? `${stats.worst.uptime}%` : "—",
          sub: stats.worst?.name,
        },
      ].map((item) => (
        <div key={item.label} className="status-card p-4">
          <p className="status-section-title">{item.label}</p>
          <p className="text-2xl font-semibold mt-1 tabular-nums">{item.value}</p>
          {item.sub && (
            <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
              {item.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
