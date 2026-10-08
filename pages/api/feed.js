/**
 * RSS 2.0 Feed API Endpoint
 *
 * Generates an RSS feed of status incidents and system announcements
 * for subscription via RSS readers, Slack, or Discord integrations.
 */

import { INCIDENTS } from '../../lib/incidents.js';
import fs from 'fs';
import path from 'path';

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req, res) {
  try {
    const siteUrl = 'https://status.prodevopsguytech.com';

    // Check status data for any active issues
    let activeIssues = [];
    try {
      const dataFilePath = path.join(process.cwd(), 'public', 'status-data.json');
      if (fs.existsSync(dataFilePath)) {
        const fileContent = fs.readFileSync(dataFilePath, 'utf8');
        const data = JSON.parse(fileContent);
        if (data?.metrics?.sitesWithIssues?.length > 0) {
          activeIssues = data.metrics.sitesWithIssues;
        }
      }
    } catch (e) {}

    const items = [];

    // Add active issues if any
    for (const issue of activeIssues) {
      items.push(`
    <item>
      <title>${escapeXml(`[Active Alert] ${issue.name} - ${issue.statusText || issue.status}`)}</title>
      <link>${siteUrl}/site/${escapeXml(issue.id)}</link>
      <guid isPermaLink="false">alert-${issue.id}-${new Date().toISOString().slice(0, 10)}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <description>${escapeXml(`Service ${issue.name} is currently in status: ${issue.status}. Detailed message: ${issue.statusText}`)}</description>
    </item>`);
    }

    // Add known incidents
    for (const inc of INCIDENTS) {
      const pubDate = new Date(inc.startedAt).toUTCString();
      const latestUpdate = inc.updates?.[0]?.message || 'No update details.';
      const desc = `Status: ${inc.status} | Severity: ${inc.severity}\nAffected: ${inc.affectedSites.join(', ')}\n\nLatest update: ${latestUpdate}`;

      items.push(`
    <item>
      <title>${escapeXml(`[${inc.severity.toUpperCase()}] ${inc.title}`)}</title>
      <link>${siteUrl}/incidents</link>
      <guid isPermaLink="false">${escapeXml(inc.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(desc)}</description>
    </item>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ProDevOpsGuy System Status</title>
    <link>${siteUrl}</link>
    <description>Status updates, incident reports, and maintenance notices for ProDevOpsGuy platforms.</description>
    <language>en-us</language>
    <atom:link href="${siteUrl}/api/feed" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items.join('')}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return res.status(500).json({ error: 'Failed to generate RSS feed' });
  }
}
