import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Activity, Clock, Gauge, ShieldCheck, Copy, Check, Zap } from "lucide-react";
import StatusLayout from "../../components/StatusLayout";
import UptimeSection from "../../components/UptimeSection";
import RealTimeStatusChart from "../../components/RealTimeStatusChart";
import HistoricalChart from "../../components/HistoricalChart";
import TerminalPanel, { buildSiteTerminalLines } from "../../components/TerminalPanel";
import StatusRing from "../../components/StatusRing";
import CommandPalette from "../../components/CommandPalette";
import BadgeStudioModal from "../../components/BadgeStudioModal";
import SLAExportModal from "../../components/SLAExportModal";
import LatencySparkline from "../../components/LatencySparkline";
import {
  COMPONENT_STATUS,
  generateUptimeHistory,
  getUptimePercent,
  formatRelativeTime,
} from "../../lib/statusTheme";
import { PageLoader } from "../../components/PageToolbar";

export default function SiteDetail({ isDarkMode = false, onThemeToggle }) {
  const router = useRouter();
  const { id } = router.query;
  const [site, setSite] = useState(null);
  const [siteHistory, setSiteHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [badgeCopied, setBadgeCopied] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [badgeStudioOpen, setBadgeStudioOpen] = useState(false);
  const [slaExportOpen, setSLAExportOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchSite = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(
          `/api/status?siteId=${encodeURIComponent(id)}`,
        );
        if (res.data?.site) {
          setSite(res.data.site);
          setSiteHistory(res.data.history || null);
        } else {
          setError("Service not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load service status.");
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
    const interval = setInterval(fetchSite, 30000);
    return () => clearInterval(interval);
  }, [id]);

  const uptime90 = useMemo(() => {
    if (!site) return 100;
    return getUptimePercent(
      generateUptimeHistory(site.id, site.status, 90),
    );
  }, [site]);

  const terminalLines = useMemo(
    () => buildSiteTerminalLines(site, uptime90),
    [site, uptime90],
  );

  if (!id) return null;

  const statusCfg = site
    ? COMPONENT_STATUS[site.status] || COMPONENT_STATUS.unknown
    : null;

  return (
    <>
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        sites={site ? [site] : []}
        onThemeToggle={onThemeToggle}
        isDarkMode={isDarkMode}
        onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
        onOpenSLAExport={() => setSLAExportOpen(true)}
      />

      <BadgeStudioModal
        isOpen={badgeStudioOpen}
        onClose={() => setBadgeStudioOpen(false)}
        sites={site ? [site] : []}
      />

      <SLAExportModal
        isOpen={slaExportOpen}
        onClose={() => setSLAExportOpen(false)}
        sites={site ? [site] : []}
      />

      <StatusLayout
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
        overallStatus={site?.status || "operational"}
        title={
          site
            ? `${site.name} — ProDevOpsGuy Status`
            : "Service Status — ProDevOpsGuy"
        }
        description={
          site
            ? `Status and uptime for ${site.name}`
            : "Loading service status"
        }
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
        onOpenSLAExport={() => setSLAExportOpen(true)}
      >
      <div className="status-container-wide">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm status-link mb-6 font-mono"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          cd ..
        </Link>

        {loading ? (
          <PageLoader message="Loading service details..." />
        ) : error ? (
          <div className="terminal-panel">
            <div className="terminal-body">
              <span className="terminal-error">Error: {error}</span>
            </div>
          </div>
        ) : site ? (
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Terminal header + status ring */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
              <TerminalPanel
                key={site.id + site.status + site.responseTime}
                title={`${site.id}-diagnostics.sh`}
                lines={terminalLines}
              />

              <div className="flex flex-col items-center gap-4 lg:sticky lg:top-24">
                <StatusRing status={site.status} size={140} />
                <div className="text-center">
                  <p className={`text-sm font-bold font-mono ${statusCfg.text}`}>
                    {site.statusText || statusCfg.label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                    {site.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick metrics bar */}
            <div className="terminal-metrics">
              {[
                { icon: Gauge, label: "Response", value: site.responseTime != null ? `${site.responseTime}ms` : "—" },
                { icon: Activity, label: "Uptime 90d", value: `${uptime90}%` },
                { icon: Clock, label: "Last check", value: site.lastChecked ? formatRelativeTime(site.lastChecked) : "—" },
                { icon: ExternalLink, label: "HTTP", value: site.statusCode ? `${site.statusCode}` : "—" },
                ...(site.ssl?.hasSSL
                  ? [{ icon: ShieldCheck, label: "SSL Expiry", value: site.ssl.valid ? `${site.ssl.daysRemaining}d` : "Expired" }]
                  : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="terminal-metric">
                  <Icon className="h-4 w-4 mx-auto mb-1 text-[#00d4aa] opacity-60" />
                  <p className="terminal-metric-value">{value}</p>
                  <p className="terminal-metric-label">{label}</p>
                </div>
              ))}
            </div>

            {site.description && (
              <p className="text-sm text-[var(--text-muted)] font-mono px-1">
                <span className="text-[var(--accent)]"># </span>
                {site.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 status-btn-secondary font-mono text-xs"
              >
                <span className="text-[var(--accent)]">$</span>
                open {site.url}
                <ExternalLink className="h-3 w-3" />
              </a>

              {/* Badge Preview and Copy */}
              <button
                type="button"
                onClick={async () => {
                  const badgeSnippet = `[![Status](https://status.prodevopsguytech.com/api/badge/${site.id}.svg)](https://status.prodevopsguytech.com/site/${site.id})`;
                  try {
                    await navigator.clipboard.writeText(badgeSnippet);
                    setBadgeCopied(true);
                    setTimeout(() => setBadgeCopied(false), 2500);
                  } catch (e) {}
                }}
                className="inline-flex items-center gap-1.5 status-btn-secondary font-mono text-xs"
                title="Copy markdown badge for GitHub README"
              >
                {badgeCopied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    badge copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    copy badge markdown
                  </>
                )}
              </button>
            </div>

            <UptimeSection sites={[site]} days={90} />

            <section className="space-y-4">
              <h2 className="text-lg font-bold font-mono">
                <span className="text-[var(--accent)]">$ </span>
                performance --charts
              </h2>
              <div className="status-card-static p-4 sm:p-5">
                <h3 className="text-sm font-semibold mb-4 font-mono text-[var(--text-muted)]">
                  response_time --range=24h
                </h3>
                <RealTimeStatusChart
                  siteId={String(id)}
                  siteName={site.name}
                  timeRange="24h"
                  embedded
                />
              </div>
              <div className="status-card-static p-4 sm:p-5">
                <h3 className="text-sm font-semibold mb-4 font-mono text-[var(--text-muted)]">
                  historical --trends
                </h3>
                <HistoricalChart
                  siteHistory={siteHistory || {}}
                  siteId={String(id)}
                  siteName={site.name}
                  embedded
                />
              </div>
            </section>
          </motion.div>
        ) : null}
      </div>
    </StatusLayout>
    </>
  );
}
