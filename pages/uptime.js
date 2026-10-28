import { useState, useEffect, useCallback } from "react";
import StatusLayout from "../components/StatusLayout";
import UptimeSection, { UptimeSummaryCards } from "../components/UptimeSection";
import SLAGauge from "../components/SLAGauge";
import UptimeHeatmap from "../components/UptimeHeatmap";
import PageToolbar, { PageLoader, PageSection } from "../components/PageToolbar";
import CommandPalette from "../components/CommandPalette";
import BadgeStudioModal from "../components/BadgeStudioModal";
import SLAExportModal from "../components/SLAExportModal";
import { fetchStatusData } from "../lib/utils/statusData";
import { getOverallStatus, OVERALL_STATUS } from "../lib/statusTheme";
import { Download, FileSpreadsheet } from "lucide-react";

export default function UptimePage({ isDarkMode = false, onThemeToggle, initialData = null }) {
  const [sites, setSites] = useState(initialData?.sites || []);
  const [historical, setHistorical] = useState(initialData?.historical || null);
  const [loading, setLoading] = useState(!initialData?.sites?.length);
  const [lastUpdated, setLastUpdated] = useState(
    initialData?.timestamp ? new Date(initialData.timestamp) : null
  );
  const [refreshing, setRefreshing] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [badgeStudioOpen, setBadgeStudioOpen] = useState(false);
  const [slaExportOpen, setSLAExportOpen] = useState(false);

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setRefreshing((prev) => (sites.length > 0 ? true : prev));
      if (!sites.length) setLoading(true);

      const data = await fetchStatusData({
        preferStatic: false,
        refresh: forceRefresh,
      });

      setSites(data.sites || []);
      setHistorical(data.historical || null);
      setLastUpdated(new Date(data.timestamp || Date.now()));
    } catch (err) {
      console.error("Failed to load uptime data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sites.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const overall = getOverallStatus(sites);
  const hero = OVERALL_STATUS[overall] || OVERALL_STATUS.operational;

  return (
    <>
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        sites={sites}
        onRefresh={() => loadData(true)}
        onThemeToggle={onThemeToggle}
        isDarkMode={isDarkMode}
        onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
        onOpenSLAExport={() => setSLAExportOpen(true)}
      />

      <BadgeStudioModal
        isOpen={badgeStudioOpen}
        onClose={() => setBadgeStudioOpen(false)}
        sites={sites}
      />

      <SLAExportModal
        isOpen={slaExportOpen}
        onClose={() => setSLAExportOpen(false)}
        sites={sites}
      />

      <StatusLayout
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
        overallStatus={overall}
        title="Uptime & SLA — ProDevOpsGuy Status"
        description="90-day uptime history and SLA metrics for all ProDevOpsGuy Tech services."
        showHero
        heroStatus={overall}
        heroTitle="Uptime & SLA Telemetry"
        heroDescription="Transparent 90-day availability telemetry and SLA audit reports across all monitored endpoints."
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
        onOpenSLAExport={() => setSLAExportOpen(true)}
      >
        <div className="status-container-wide space-y-8">
          {loading ? (
            <PageLoader message="Loading uptime telemetry..." />
          ) : (
            <>
              <PageToolbar
                lastUpdated={lastUpdated}
                isRefreshing={refreshing}
                onRefresh={() => loadData(true)}
                onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
                onOpenSLAExport={() => setSLAExportOpen(true)}
              />

              {/* SLA Gauge and Summary Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1">
                  <SLAGauge sites={sites} />
                </div>
                <div className="lg:col-span-2">
                  <UptimeSummaryCards sites={sites} />
                </div>
              </div>

              {/* 90-Day Contribution Style Heatmap */}
              <PageSection
                title="System-wide Availability Heatmap"
                description="Chronological status matrix for all services across the past 90 days."
                action={
                  <button
                    type="button"
                    onClick={() => setSLAExportOpen(true)}
                    className="status-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Export Audit</span>
                  </button>
                }
              >
                <UptimeHeatmap
                  sites={sites}
                  historical={historical}
                  isDarkMode={isDarkMode}
                />
              </PageSection>

              {/* Individual Service 90-day breakdown */}
              <PageSection
                title="Individual Service Uptime Breakdown"
                description="Detailed day-by-day availability bars. Hover each block to inspect timestamp and latency."
              >
                <UptimeSection
                  sites={sites}
                  historical={historical}
                  days={90}
                />
              </PageSection>
            </>
          )}
        </div>
      </StatusLayout>
    </>
  );
}

export async function getStaticProps() {
  try {
    const fs = require("fs");
    const path = require("path");
    const dataFilePath = path.join(process.cwd(), "public", "status-data.json");
    if (fs.existsSync(dataFilePath)) {
      const initialData = JSON.parse(fs.readFileSync(dataFilePath, "utf8"));
      return {
        props: {
          initialData,
        },
        revalidate: 60,
      };
    }
  } catch (e) {
    console.error("Failed to load initial status data:", e);
  }

  return {
    props: {
      initialData: null,
    },
    revalidate: 60,
  };
}
