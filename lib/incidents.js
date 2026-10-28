/**
 * Incident History & Postmortems Telemetry
 *
 * Tracks historical incidents, root cause analyses, recovery timelines,
 * and postmortems across ProDevOpsGuy Tech infrastructure.
 */

export const INCIDENTS = [
  {
    id: "INC-2026-088",
    title: "Edge CDN DNS Resolver Latency Spike",
    status: "resolved", // 'investigating' | 'identified' | 'monitoring' | 'resolved'
    severity: "degraded", // 'operational' | 'degraded' | 'outage' | 'maintenance'
    startedAt: "2026-10-22T08:15:00Z",
    resolvedAt: "2026-10-22T09:40:00Z",
    affectedSites: [
      "ProDevOpsGuyTech Community",
      "Ultimate Docs Portal",
      "DevOps Blog",
    ],
    updates: [
      {
        time: "2026-10-22T09:40:00Z",
        status: "resolved",
        message:
          "DNS Anycast routing has stabilized globally. All edge response times have returned to normal nominal baseline (<150ms).",
      },
      {
        time: "2026-10-22T09:10:00Z",
        status: "monitoring",
        message:
          "Upstream authoritative nameservers rerouted traffic away from congested Frankfurt edge node. Latency metrics recovering.",
      },
      {
        time: "2026-10-22T08:35:00Z",
        status: "identified",
        message:
          "Identified elevated DNS lookup times originating from upstream carrier transit peering in Central Europe.",
      },
      {
        time: "2026-10-22T08:15:00Z",
        status: "investigating",
        message:
          "Automated synthetic monitoring detected elevated TTFB and slow response times across multiple European edge locations.",
      },
    ],
  },
  {
    id: "INC-2026-082",
    title: "Docker to Kubernetes Lab Cluster Provisioning Delay",
    status: "resolved",
    severity: "degraded",
    startedAt: "2026-10-09T14:10:00Z",
    resolvedAt: "2026-10-09T15:45:00Z",
    affectedSites: ["Docker to Kubernetes", "Real-Time Projects Hub"],
    updates: [
      {
        time: "2026-10-09T15:45:00Z",
        status: "resolved",
        message:
          "Container daemon storage pool cleaned up and autoscaling limits adjusted. Sandbox container boot time reduced back to <12 seconds.",
      },
      {
        time: "2026-10-09T14:50:00Z",
        status: "identified",
        message:
          "Identified disk inode exhaustion on ephemeral container host clusters. Cleanup cron job triggered.",
      },
      {
        time: "2026-10-09T14:10:00Z",
        status: "investigating",
        message:
          "Investigating reports of temporary delays when spawning interactive hands-on lab environments.",
      },
    ],
  },
  {
    id: "INC-2026-074",
    title: "Repositories Central Webhook Delivery Lag",
    status: "resolved",
    severity: "degraded",
    startedAt: "2026-09-28T11:00:00Z",
    resolvedAt: "2026-09-28T12:15:00Z",
    affectedSites: ["Repositories Central"],
    updates: [
      {
        time: "2026-09-28T12:15:00Z",
        status: "resolved",
        message:
          "Redis queue backlog drained successfully. Webhook delivery latency restored to <200ms.",
      },
      {
        time: "2026-09-28T11:30:00Z",
        status: "identified",
        message:
          "High event volume caused temporary Redis consumer concurrency saturation. Worker scale increased by 3x.",
      },
      {
        time: "2026-09-28T11:00:00Z",
        status: "investigating",
        message:
          "Investigating delayed webhook notifications for newly pushed infrastructure templates.",
      },
    ],
  },
  {
    id: "INC-2026-061",
    title: "Scheduled Maintenance — Core Ingress Controller Upgrade",
    status: "resolved",
    severity: "maintenance",
    startedAt: "2026-09-14T03:00:00Z",
    resolvedAt: "2026-09-14T04:30:00Z",
    affectedSites: [
      "ProDevOpsGuyTech Community",
      "Ultimate Docs Portal",
      "Real-Time Projects Hub",
    ],
    updates: [
      {
        time: "2026-09-14T04:30:00Z",
        status: "resolved",
        message:
          "Traefik / NGINX Ingress controller upgrade completed with zero unplanned packet drops.",
      },
      {
        time: "2026-09-14T03:00:00Z",
        status: "maintenance",
        message: "Planned maintenance window started.",
      },
    ],
  },
];

export const INCIDENT_SEVERITY = {
  operational: {
    label: "Notice",
    badge:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  },
  degraded: {
    label: "Degraded Performance",
    badge:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  },
  outage: {
    label: "Major Outage",
    badge:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
  },
  maintenance: {
    label: "Scheduled Maintenance",
    badge:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
  },
};

export const INCIDENT_STATUS = {
  investigating: {
    label: "Investigating",
    color: "text-amber-800 dark:text-amber-300",
    bg: "bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800",
  },
  identified: {
    label: "Identified",
    color: "text-blue-800 dark:text-blue-300",
    bg: "bg-blue-100 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800",
  },
  monitoring: {
    label: "Monitoring",
    color: "text-indigo-800 dark:text-indigo-300",
    bg: "bg-indigo-100 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800",
  },
  resolved: {
    label: "Resolved",
    color: "text-emerald-800 dark:text-emerald-300",
    bg: "bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800",
  },
  maintenance: {
    label: "In Progress",
    color: "text-purple-800 dark:text-purple-300",
    bg: "bg-purple-100 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800",
  },
};
