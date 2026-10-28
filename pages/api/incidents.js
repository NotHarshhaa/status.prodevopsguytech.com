import axios from "axios";
import { INCIDENTS } from "../../lib/incidents";
import { MAINTENANCE_WINDOWS } from "../../lib/maintenance";

/**
 * Dynamic Incidents API
 *
 * Fetches incidents dynamically from GitHub Issues (if configured)
 * or returns structured 2026 incidents with maintenance windows.
 */
export default async function handler(req, res) {
  const repo = process.env.GITHUB_INCIDENTS_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (repo) {
    try {
      const headers = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ProDevOpsGuy-Status-Monitor",
      };
      if (token) headers.Authorization = `token ${token}`;

      const ghRes = await axios.get(
        `https://api.github.com/repos/${repo}/issues?labels=incident&state=all&per_page=20`,
        { headers, timeout: 5000 }
      );

      if (Array.isArray(ghRes.data)) {
        const parsed = ghRes.data.map((issue) => {
          const isClosed = issue.state === "closed";
          return {
            id: `GH-${issue.number}`,
            title: issue.title,
            status: isClosed ? "resolved" : "investigating",
            severity: issue.labels.some((l) => l.name === "major")
              ? "outage"
              : "degraded",
            startedAt: issue.created_at,
            resolvedAt: issue.closed_at || null,
            affectedSites: ["Core Infrastructure"],
            updates: [
              {
                time: issue.updated_at,
                status: isClosed ? "resolved" : "investigating",
                message: issue.body || "Tracking issue via GitHub Issues.",
              },
            ],
            githubUrl: issue.html_url,
          };
        });

        return res.status(200).json({
          source: "github-issues",
          incidents: parsed,
          maintenance: MAINTENANCE_WINDOWS,
        });
      }
    } catch (err) {
      console.warn("GitHub Issues integration fallback:", err.message);
    }
  }

  // Local fallback
  return res.status(200).json({
    source: "local",
    incidents: INCIDENTS,
    maintenance: MAINTENANCE_WINDOWS,
  });
}
