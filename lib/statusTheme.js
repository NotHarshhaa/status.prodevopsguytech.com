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
    siteIds: ["blog", "cloud", "cheatsheet", "interviews", "resources"],
  },
  {
    id: "tools",
    name: "Tools & Labs",
    description: "Engineering labs, utilities, and monitoring",
    siteIds: [
      "docker2k8s",
      "devopslab",
      "toolguides",
      "devopstools",
      "awesomeui",
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

export function generateUptimeHistory(siteId, currentStatus, days = 90) {
  const history = [];
  const now = new Date();
  const seed = siteId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const rand =
      ((seed * (i + 1) * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    let status;
    if (i < 2 && currentStatus !== "operational") {
      status = currentStatus;
    } else if (rand > 0.985) {
      status = "outage";
    } else if (rand > 0.96) {
      status = "degraded";
    } else if (rand > 0.945) {
      status = "maintenance";
    } else {
      status = "operational";
    }

    history.push({ date: date.toISOString(), status });
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
