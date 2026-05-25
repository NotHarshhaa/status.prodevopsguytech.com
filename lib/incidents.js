/** Incident history data (mock — replace with API when available) */

export const INCIDENTS = [
  {
    id: "INC-2025-001",
    title: "Elevated Response Times on Community Platform",
    status: "resolved",
    severity: "degraded",
    startedAt: "2025-03-20T14:30:00Z",
    resolvedAt: "2025-03-20T16:45:00Z",
    affectedSites: ["ProDevOpsGuyTech Community"],
    updates: [
      {
        time: "2025-03-20T16:45:00Z",
        status: "resolved",
        message:
          "The issue has been fully resolved. Response times are back to normal.",
      },
      {
        time: "2025-03-20T15:30:00Z",
        status: "monitoring",
        message: "A fix has been deployed. We are monitoring the situation.",
      },
      {
        time: "2025-03-20T14:55:00Z",
        status: "identified",
        message:
          "Issue identified as database connection pool exhaustion. Fix in progress.",
      },
      {
        time: "2025-03-20T14:30:00Z",
        status: "investigating",
        message:
          "We are investigating reports of elevated response times.",
      },
    ],
  },
  {
    id: "INC-2025-002",
    title: "DevOps Blog — Partial Outage",
    status: "resolved",
    severity: "outage",
    startedAt: "2025-03-15T09:00:00Z",
    resolvedAt: "2025-03-15T10:30:00Z",
    affectedSites: ["DevOps Blog", "Cloud Blog"],
    updates: [
      {
        time: "2025-03-15T10:30:00Z",
        status: "resolved",
        message:
          "Both blog services are fully operational. Root cause was a misconfigured CDN cache rule.",
      },
      {
        time: "2025-03-15T09:45:00Z",
        status: "identified",
        message: "Issue identified as CDN misconfiguration. Fix in progress.",
      },
      {
        time: "2025-03-15T09:00:00Z",
        status: "investigating",
        message: "Investigating reports of blog services being inaccessible.",
      },
    ],
  },
  {
    id: "INC-2025-003",
    title: "Planned Maintenance — Docs Portal Upgrade",
    status: "resolved",
    severity: "maintenance",
    startedAt: "2025-03-10T02:00:00Z",
    resolvedAt: "2025-03-10T04:00:00Z",
    affectedSites: ["Ultimate Docs Portal"],
    updates: [
      {
        time: "2025-03-10T04:00:00Z",
        status: "resolved",
        message: "Maintenance completed successfully.",
      },
      {
        time: "2025-03-10T02:00:00Z",
        status: "maintenance",
        message: "Scheduled maintenance window has begun.",
      },
    ],
  },
  {
    id: "INC-2025-004",
    title: "Jobs Portal — Slow Search Performance",
    status: "resolved",
    severity: "degraded",
    startedAt: "2025-03-05T11:00:00Z",
    resolvedAt: "2025-03-05T13:15:00Z",
    affectedSites: ["Jobs Portal"],
    updates: [
      {
        time: "2025-03-05T13:15:00Z",
        status: "resolved",
        message: "Search performance restored to normal levels.",
      },
      {
        time: "2025-03-05T12:00:00Z",
        status: "monitoring",
        message: "Search index rebuilt. Monitoring for improvements.",
      },
      {
        time: "2025-03-05T11:00:00Z",
        status: "investigating",
        message: "Users reporting slow search results. Investigating.",
      },
    ],
  },
];

export const INCIDENT_STATUS = {
  resolved: {
    label: "Resolved",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  investigating: {
    label: "Investigating",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  identified: {
    label: "Identified",
    color: "text-orange-700 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/40",
  },
  monitoring: {
    label: "Monitoring",
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  maintenance: {
    label: "Maintenance",
    color: "text-indigo-700 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
  },
};

export const INCIDENT_SEVERITY = {
  outage: {
    label: "Outage",
    badge:
      "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300",
  },
  degraded: {
    label: "Degraded",
    badge:
      "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  },
  maintenance: {
    label: "Maintenance",
    badge:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  },
};
