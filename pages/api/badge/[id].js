/**
 * Dynamic SVG Status Badge API Endpoint
 *
 * Produces shields.io-compatible SVG badges for GitHub READMEs, docs, and repositories.
 * Usage:
 *   /api/badge/overall.svg
 *   /api/badge/docs.svg
 *   /api/badge/docs.svg?type=uptime
 *   /api/badge/projects.svg?label=projects+hub
 */

import fs from 'fs';
import path from 'path';

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'operational':
      return '#10b981'; // Green
    case 'degraded':
      return '#f59e0b'; // Amber
    case 'outage':
      return '#ef4444'; // Red
    case 'maintenance':
      return '#6366f1'; // Indigo
    default:
      return '#6b7280'; // Gray
  }
}

function getUptimeColor(pct) {
  if (pct >= 99.5) return '#10b981';
  if (pct >= 98.0) return '#84cc16';
  if (pct >= 95.0) return '#f59e0b';
  return '#ef4444';
}

function approximateTextWidth(text) {
  // Rough estimate: ~6.5px per character in Verdana 11px
  return Math.max(20, Math.round(text.length * 6.8 + 10));
}

function renderBadgeSVG({ label, value, color }) {
  const labelWidth = approximateTextWidth(label);
  const valueWidth = approximateTextWidth(value);
  const totalWidth = labelWidth + valueWidth;

  const labelX = Math.round(labelWidth / 2);
  const valueX = labelWidth + Math.round(valueWidth / 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#2d3748"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text aria-hidden="true" x="${labelX}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelX}" y="14">${label}</text>
    <text aria-hidden="true" x="${valueX}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${valueX}" y="14" font-weight="bold">${value}</text>
  </g>
</svg>`;
}

export default async function handler(req, res) {
  try {
    const rawId = req.query.id || 'overall';
    const siteId = String(rawId).replace(/\.svg$/i, '').trim();
    const type = req.query.type || 'status';
    const customLabel = req.query.label;

    // Load static data
    let statusData = null;
    const dataFilePath = path.join(process.cwd(), 'public', 'status-data.json');
    if (fs.existsSync(dataFilePath)) {
      try {
        const fileContent = fs.readFileSync(dataFilePath, 'utf8');
        statusData = JSON.parse(fileContent);
      } catch (e) {}
    }

    let badgeLabel = customLabel || 'status';
    let badgeValue = 'unknown';
    let badgeColor = '#6b7280';

    if (siteId === 'overall' || siteId === 'all' || siteId === 'system') {
      badgeLabel = customLabel || 'prodevopsguy';
      const overall = statusData?.overall || 'operational';
      badgeValue = overall.charAt(0).toUpperCase() + overall.slice(1);
      badgeColor = getStatusColor(overall);
    } else {
      const site = statusData?.sites?.find(
        (s) => s.id?.toLowerCase() === siteId.toLowerCase(),
      );

      if (!site) {
        badgeLabel = customLabel || siteId;
        badgeValue = 'not found';
        badgeColor = '#9ca3af';
      } else if (type === 'uptime') {
        badgeLabel = customLabel || `${site.name.split(' ')[0]} uptime`;
        // Calculate uptime from daily data
        const siteDaily = statusData?.historical?.daily?.[site.id];
        let uptimePct = 100;
        if (siteDaily) {
          const days = Object.values(siteDaily);
          if (days.length > 0) {
            const totalChecks = days.reduce((sum, d) => sum + (d.checks || 0), 0);
            const totalOp = days.reduce((sum, d) => sum + (d.operational || 0), 0);
            uptimePct = totalChecks > 0 ? Math.round((totalOp / totalChecks) * 1000) / 10 : 100;
          }
        }
        badgeValue = `${uptimePct}%`;
        badgeColor = getUptimeColor(uptimePct);
      } else {
        badgeLabel = customLabel || site.name.split(' ')[0];
        badgeValue = site.status ? site.status.charAt(0).toUpperCase() + site.status.slice(1) : 'Operational';
        badgeColor = getStatusColor(site.status);
      }
    }

    const svg = renderBadgeSVG({
      label: badgeLabel,
      value: badgeValue,
      color: badgeColor,
    });

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
    return res.status(200).send(svg);
  } catch (error) {
    console.error('Error generating status badge:', error);
    const errorSvg = renderBadgeSVG({
      label: 'badge',
      value: 'error',
      color: '#ef4444',
    });
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    return res.status(200).send(errorSvg);
  }
}
