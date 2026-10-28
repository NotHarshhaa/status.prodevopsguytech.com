/** Shared status page design tokens & helpers (Statuspage / GitHub Status style) */

export const SITE_GROUPS = [
  {
    id: "platform",
    name: "Core Platform",
    description: "Primary community and learning portals",
    siteIds: ["main", "projects", "docs", "repos", "jobs"],
  },
  {
    id: "content",
    name: "Content & Blogs",
    description: "Articles, guides, and interview resources",
    siteIds: ["blog", "cloud", "cheatsheet", "interviews"],
  },
  {
    id: "tools",
    name: "Tools & Labs",
    description: "Engineering labs, utilities, and monitoring",
    siteIds: [
      "docker2k8s",
      "devopstools",
      "monitoring",
    ],
  },
];

export const OVERALL_STATUS = {
  operational: {
    label: "All Systems Operational",
    shortLabel: "Operational",
    description: "All services are running smoothly.",
    hero: "bg-status-operational",
    text: "text-white",
    dot: "bg-white",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  },
  degraded: {
    label: "Degraded Performance",
    shortLabel: "Degraded",
    description: "Some services are experiencing issues.",
    hero: "bg-status-degraded",
    text: "text-white",
    dot: "bg-white",
    badge: "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  },
  outage: {
    label: "Major Service Outage",
    shortLabel: "Outage",
    description: "One or more services are unavailable.",
    hero: "bg-status-outage",
    text: "text-white",
    dot: "bg-white",
    badge: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
  },
  maintenance: {
    label: "Scheduled Maintenance",
    shortLabel: "Maintenance",
    description: "Planned maintenance is in progress.",
    hero: "bg-status-maintenance",
    text: "text-white",
    dot: "bg-white",
    badge: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  },
};

export const COMPONENT_STATUS = {
  operational: {
    label: "Operational",
    dot: "bg-status-dot-operational",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  degraded: {
    label: "Degraded Performance",
    dot: "bg-status-dot-degraded",
    text: "text-amber-700 dark:text-amber-400",
  },
  outage: {
    label: "Major Outage",
    dot: "bg-status-dot-outage",
    text: "text-red-700 dark:text-red-400",
  },
  maintenance: {
    label: "Under Maintenance",
    dot: "bg-status-dot-maintenance",
    text: "text-blue-700 dark:text-blue-400",
  },
  unknown: {
    label: "Unknown",
    dot: "bg-status-dot-unknown",
    text: "text-neutral-500 dark:text-neutral-400",
  },
};

export function getOverallStatus(sites = []) {
  if (!sites.length) return "operational";
  if (sites.some((s) => s.status === "outage")) return "outage";
  if (sites.some((s) => s.status === "maintenance")) return "maintenance";
  if (sites.some((s) => s.status === "degraded")) return "degraded";
  return "operational";
}

export function groupSites(sites = []) {
  const byId = Object.fromEntries(sites.map((s) => [s.id, s]));
  const grouped = SITE_GROUPS.map((group) => ({
    ...group,
    sites: group.siteIds.map((id) => byId[id]).filter(Boolean),
  })).filter((g) => g.sites.length > 0);

  const assigned = new Set(SITE_GROUPS.flatMap((g) => g.siteIds));
  const ungrouped = sites.filter((s) => !assigned.has(s.id));
  if (ungrouped.length) {
    grouped.push({
      id: "other",
      name: "Other Services",
      description: "Additional monitored endpoints",
      sites: ungrouped,
    });
  }

  return grouped;
}

export function generateUptimeHistory(
  siteId,
  currentStatus = "operational",
  days = 90,
  realDailyData = null,
) {
  const history = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split("T")[0];

    let status = "operational";
    let uptime = 100;
    let checks = 0;
    let avgResponseTime = null;

    if (realDailyData && realDailyData[dateKey]) {
      const dayRecord = realDailyData[dateKey];
      checks = dayRecord.checks || 0;
      uptime = dayRecord.uptime != null ? dayRecord.uptime : 100;
      avgResponseTime = dayRecord.avgResponseTime || null;

      if (dayRecord.outage > 0) {
        status = "outage";
      } else if (dayRecord.degraded > 0) {
        status = "degraded";
      } else {
        status = "operational";
      }
    } else if (i === 0 && currentStatus && currentStatus !== "operational") {
      // Today: reflect current live status
      status = currentStatus;
      checks = 1;
      uptime = currentStatus === "outage" ? 0 : 50;
    }

    history.push({
      date: date.toISOString(),
      dateKey,
      status,
      uptime,
      checks,
      avgResponseTime,
    });
  }

  return history;
}

export function getUptimePercent(history = []) {
  if (!history.length) return 100;
  const op = history.filter((d) => d.status === "operational").length;
  return Math.round((op / history.length) * 1000) / 10;
}

export function formatRelativeTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}
