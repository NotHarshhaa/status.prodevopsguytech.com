import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft, ExternalLink } from "lucide-react";
import StatusLayout from "../../components/StatusLayout";
import UptimeSection from "../../components/UptimeSection";
import RealTimeStatusChart from "../../components/RealTimeStatusChart";
import HistoricalChart from "../../components/HistoricalChart";
import { getSiteHistory } from "../../lib/services/statusChecker";
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
          setSiteHistory(getSiteHistory(id));
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

  if (!id) return null;

  const statusCfg = site
    ? COMPONENT_STATUS[site.status] || COMPONENT_STATUS.unknown
    : null;

  return (
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
    >
      <div className="status-container-wide">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#0969da] dark:text-[#58a6ff] hover:underline mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to status page
        </Link>

        {loading ? (
          <PageLoader message="Loading service details..." />
        ) : error ? (
          <div className="status-card p-6 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        ) : site ? (
          <div className="space-y-8">
            {/* Service header */}
            <div className="status-card p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className={`status-dot ${statusCfg.dot}`} />
                    <span className={`text-sm font-medium ${statusCfg.text}`}>
                      {site.statusText || statusCfg.label}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold">
                    {site.name}
                  </h1>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {site.description}
                  </p>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#0969da] dark:text-[#58a6ff] hover:underline mt-3"
                  >
                    {site.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex gap-6 sm:text-right">
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">
                      {site.responseTime ?? "—"}
                      <span className="text-sm font-normal text-[var(--text-muted)]">
                        ms
                      </span>
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                      Response time
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold tabular-nums">
                      {uptime90}%
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                      90-day uptime
                    </p>
                  </div>
                </div>
              </div>
              {site.lastChecked && (
                <p className="text-xs text-[var(--text-muted)] mt-4 pt-4 border-t border-[var(--border)]">
                  Last checked {formatRelativeTime(site.lastChecked)}
                  {site.statusCode ? ` · HTTP ${site.statusCode}` : ""}
                </p>
              )}
            </div>

            {/* Uptime bar */}
            <UptimeSection sites={[site]} days={90} />

            {/* Charts */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Performance</h2>
              <div className="status-card p-4 sm:p-5">
                <h3 className="text-sm font-medium mb-4">Response time (24h)</h3>
                <RealTimeStatusChart
                  siteId={String(id)}
                  siteName={site.name}
                  timeRange="24h"
                  embedded
                />
              </div>
              <div className="status-card p-4 sm:p-5">
                <h3 className="text-sm font-medium mb-4">Historical trends</h3>
                <HistoricalChart
                  siteHistory={siteHistory || {}}
                  siteId={String(id)}
                  siteName={site.name}
                  embedded
                />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </StatusLayout>
  );
}
