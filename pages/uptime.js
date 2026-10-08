import { useState, useEffect } from "react";
import StatusLayout from "../components/StatusLayout";
import UptimeSection, { UptimeSummaryCards } from "../components/UptimeSection";
import SLAGauge from "../components/SLAGauge";
import UptimeHeatmap from "../components/UptimeHeatmap";
import PageToolbar, { PageLoader, PageSection } from "../components/PageToolbar";
import { fetchStatusData } from "../lib/utils/statusData";
import { getOverallStatus, OVERALL_STATUS } from "../lib/statusTheme";

export default function UptimePage({ isDarkMode = false, onThemeToggle }) {
  const [sites, setSites] = useState([]);
  const [historical, setHistorical] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (forceRefresh = false) => {
    try {
      if (sites.length > 0) setRefreshing(true);
      else setLoading(true);

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
  };

  useEffect(() => {
    loadData();
  }, []);

  const overall = getOverallStatus(sites);
  const hero = OVERALL_STATUS[overall] || OVERALL_STATUS.operational;

  return (
    <StatusLayout
      isDarkMode={isDarkMode}
      onThemeToggle={onThemeToggle}
      overallStatus={overall}
      title="Uptime — ProDevOpsGuy Status"
      description="90-day uptime history and SLA metrics for all ProDevOpsGuy Tech services."
      showHero
      heroStatus={overall}
      heroTitle="Uptime & SLA Performance"
      heroDescription="Transparent 90-day availability telemetry across all monitored endpoints."
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
  );
}
