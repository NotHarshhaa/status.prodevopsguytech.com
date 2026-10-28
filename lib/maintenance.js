/**
 * Maintenance Data & Management
 *
 * Tracks planned maintenance windows, schedules, affected systems,
 * and generates calendar .ics invites.
 */

export const MAINTENANCE_WINDOWS = [
  {
    id: "MAINT-2026-110",
    title: "Kubernetes Cluster Node Upgrade & Security Patching",
    status: "scheduled", // 'scheduled' | 'in_progress' | 'completed'
    scheduledStart: "2026-11-04T02:00:00Z",
    scheduledEnd: "2026-11-04T04:30:00Z",
    affectedServices: [
      "Real-Time Projects Hub",
      "Repositories Central",
      "Docker to Kubernetes",
    ],
    summary:
      "Rolling upgrade of production worker nodes to Kubernetes 1.32 with kernel security hotfixes. Services may experience brief 30-second failovers.",
    impact: "minor", // 'none' | 'minor' | 'maintenance' | 'major'
    updates: [
      {
        time: "2026-10-25T10:00:00Z",
        status: "scheduled",
        message:
          "Maintenance window scheduled. Traffic will be routed to secondary region during the rolling upgrade.",
      },
    ],
  },
  {
    id: "MAINT-2026-109",
    title: "Global CDN & Edge SSL Certificate Key Rotation",
    status: "completed",
    scheduledStart: "2026-10-18T01:00:00Z",
    scheduledEnd: "2026-10-18T02:00:00Z",
    affectedServices: [
      "ProDevOpsGuyTech Community",
      "Ultimate Docs Portal",
      "DevOps Blog",
    ],
    summary:
      "Automated edge TLS certificate key rotation and HTTP/3 QUIC configuration refresh across Cloudflare & Fastly edge POPs.",
    impact: "none",
    updates: [
      {
        time: "2026-10-18T01:52:00Z",
        status: "completed",
        message:
          "All edge certificate renewals verified across 28 global regions. Zero packet drops observed.",
      },
      {
        time: "2026-10-18T01:00:00Z",
        status: "in_progress",
        message: "Key rotation maintenance initiated.",
      },
    ],
  },
];

/**
 * Generate an .ics calendar file for scheduled maintenance
 */
export function generateICS(maintenance) {
  const formatTime = (isoStr) =>
    isoStr.replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const start = formatTime(maintenance.scheduledStart);
  const end = formatTime(maintenance.scheduledEnd);
  const now = formatTime(new Date().toISOString());

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ProDevOpsGuy//Status Maintenance//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${maintenance.id}@prodevopsguytech.com
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
SUMMARY:[ProDevOpsGuy Maintenance] ${maintenance.title}
DESCRIPTION:${maintenance.summary}\\nAffected Services: ${maintenance.affectedServices.join(
    ", "
  )}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
}

/**
 * Download .ics file in browser
 */
export function downloadICS(maintenance) {
  if (typeof window === "undefined") return;
  const icsData = generateICS(maintenance);
  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${maintenance.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
