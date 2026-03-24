import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, TrendingUp } from "lucide-react";

const DAYS_TO_SHOW = 90;

// Use inline style colors to avoid Tailwind generating 1k+ class combinations at runtime
const STATUS_COLORS = {
  operational: { light: "#22c55e", dark: "#4ade80" },
  degraded: { light: "#facc15", dark: "#fde047" },
  outage: { light: "#ef4444", dark: "#f87171" },
  maintenance: { light: "#3b82f6", dark: "#60a5fa" },
  default: { light: "#e5e7eb", dark: "#374151" },
};

const getStatusTooltip = (status, date) => {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const labels = {
    operational: "Operational",
    degraded: "Degraded",
    outage: "Outage",
    maintenance: "Maintenance",
  };
  return `${formattedDate}: ${labels[status] || "No Data"}`;
};

// Generate simulated history — stable per siteId using a seeded rand
const generateSiteHistory = (siteId, currentStatus) => {
  const history = [];
  const now = new Date();
  // Simple deterministic-ish sequence per site so re-renders are stable
  const seed = siteId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const rand = ((seed * (i + 1) * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    let status;
    if (i < 3 && currentStatus !== "operational") {
      status = currentStatus;
    } else if (rand > 0.97) {
      status = "outage";
    } else if (rand > 0.93) {
      status = "degraded";
    } else if (rand > 0.91) {
      status = "maintenance";
    } else {
      status = "operational";
    }

    history.push({ date: date.toISOString(), status });
  }
  return history;
};

// Pure CSS square — NO framer-motion, NO JS hover listener
const HeatSquare = ({ status, tooltip, isDark }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.default;
  return (
    <div
      title={tooltip}
      style={{
        backgroundColor: isDark ? colors.dark : colors.light,
        flex: "1 1 0",
        height: "16px",
        borderRadius: "2px",
        cursor: "default",
        transition: "opacity 0.15s ease, transform 0.15s ease",
      }}
      className="heat-square"
    />
  );
};

const UptimeHeatmap = ({ sites = [], isDark = false }) => {
  const siteHistories = useMemo(
    () =>
      sites.map((site) => ({
        ...site,
        history: generateSiteHistory(site.id, site.status),
      })),
    // Stable dependency — only regenerate when site IDs or statuses change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sites.map((s) => `${s.id}:${s.status}`).join(",")]
  );

  const overallUptime = useMemo(() => {
    if (!sites.length) return 100;
    const totalOp = sites.filter((s) => s.status === "operational").length;
    return Math.round((totalOp / sites.length) * 100);
  }, [sites]);

  if (!sites.length) return null;

  return (
    <motion.div
      className="glass-card rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      // Hint the browser this element is composited independently
      style={{ willChange: "transform" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center">
          <div className="bg-indigo-100/80 dark:bg-indigo-900/20 p-2 rounded-xl mr-3 border border-indigo-200/50 dark:border-indigo-700/30">
            <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              90-Day Uptime History
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Daily status for all monitored sites
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full border border-green-200/50 dark:border-green-700/30">
          <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">
            {overallUptime}% Uptime
          </span>
        </div>
      </div>

      {/* Legend — plain divs, no motion */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-500 dark:text-gray-400">
        {[
          { label: "Operational", color: "bg-green-500 dark:bg-green-400" },
          { label: "Degraded", color: "bg-yellow-400 dark:bg-yellow-300" },
          { label: "Outage", color: "bg-red-500 dark:bg-red-400" },
          { label: "Maintenance", color: "bg-blue-500 dark:bg-blue-400" },
          { label: "No Data", color: "bg-gray-200 dark:bg-gray-700" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded-sm ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Heatmap — horizontally scrollable, no motion on individual squares */}
      <div className="overflow-x-auto pb-2" style={{ overflowY: "visible" }}>
        <div style={{ minWidth: Math.max(DAYS_TO_SHOW * 10, 400) }}>
          <div className="space-y-[5px]">
            {siteHistories.slice(0, 16).map((site) => {
              const uptimePct = Math.round(
                (site.history.filter((d) => d.status === "operational").length /
                  site.history.length) *
                  100
              );
              return (
                <div key={site.id} className="flex items-center gap-2">
                  {/* Site label */}
                  <div className="w-28 sm:w-36 flex-shrink-0 text-right">
                    <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 truncate block">
                      {site.name.split(" ").slice(0, 2).join(" ")}
                    </span>
                  </div>

                  {/* Squares row — pure CSS, zero JS per square */}
                  <div className="flex gap-[2px] flex-1">
                    {site.history.map((day, di) => (
                      <HeatSquare
                        key={di}
                        status={day.status}
                        tooltip={getStatusTooltip(day.status, day.date)}
                        isDark={isDark}
                      />
                    ))}
                  </div>

                  {/* Uptime % */}
                  <div className="w-12 flex-shrink-0 text-right">
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {uptimePct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Date axis */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-28 sm:w-36 flex-shrink-0" />
            <div className="flex-1 flex justify-between text-[9px] text-gray-400 dark:text-gray-600">
              <span>90 days ago</span>
              <span>60 days ago</span>
              <span>30 days ago</span>
              <span>Today</span>
            </div>
            <div className="w-12 flex-shrink-0" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UptimeHeatmap;
