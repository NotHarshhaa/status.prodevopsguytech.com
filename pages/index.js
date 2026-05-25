import { useState, useEffect, useCallback, useRef } from "react";
import StatusLayout from "../components/StatusLayout";
import ComponentStatusList, {
  StatusSummaryBar,
} from "../components/ComponentStatusList";
import UptimeSection from "../components/UptimeSection";
import IncidentList from "../components/IncidentList";
import PageToolbar, { PageLoader, PageSection } from "../components/PageToolbar";
import { fetchStatusData } from "../lib/utils/statusData";
import {
  getOverallStatus,
  OVERALL_STATUS,
} from "../lib/statusTheme";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useNotification } from "../components/Notification";

export default function Home({ isDarkMode = false, onThemeToggle }) {
  const [sites, setSites] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const notification = useNotification();
  const sitesRef = useRef([]);

  const checkForStatusChanges = useCallback((oldSites, newSites) => {
    newSites.forEach((newSite) => {
      const oldSite = oldSites.find((s) => s.id === newSite.id);
      if (oldSite && oldSite.status !== newSite.status) {
        if (
          newSite.status === "operational" &&
          oldSite.status !== "operational"
        ) {
          notification.success(`${newSite.name} is now operational`, {
            icon: <CheckCircle className="h-5 w-5" />,
            duration: 8000,
          });
        } else if (newSite.status === "degraded") {
          notification.warning(
            `${newSite.name} is experiencing degraded performance`,
            {
              icon: <AlertTriangle className="h-5 w-5" />,
              duration: 10000,
            },
          );
        } else if (newSite.status === "outage") {
          notification.error(`${newSite.name} is currently down`, {
            icon: <XCircle className="h-5 w-5" />,
            duration: 0,
          });
        }
      }
    });
  }, [notification]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setFetchError(null);
      if (!sitesRef.current.length) setLoading(true);
      else setRefreshing(true);

      const data = await fetchStatusData({
        preferStatic: false,
        refresh: forceRefresh,
      });

      const previousSites = sitesRef.current;
      const newSites = data.sites || [];

      if (previousSites.length > 0 && newSites.length > 0) {
        checkForStatusChanges(previousSites, newSites);
      }

      sitesRef.current = newSites;
      setSites(newSites);
      setMetrics(data.metrics);
      setLastUpdated(new Date(data.timestamp || Date.now()));
    } catch (error) {
      console.error("Failed to fetch status data:", error);
      setFetchError(
        "Unable to load latest status. Showing last known data if available.",
      );
      notification.error("Failed to refresh status data", { duration: 6000 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [checkForStatusChanges, notification]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const overall = getOverallStatus(sites);
  const hero = OVERALL_STATUS[overall] || OVERALL_STATUS.operational;

  return (
    <StatusLayout
      isDarkMode={isDarkMode}
      onThemeToggle={onThemeToggle}
      overallStatus={metrics?.status || overall}
      title="ProDevOpsGuy Status"
      description="Current status of ProDevOpsGuy Tech platforms and services."
      showHero
      heroStatus={overall}
      heroTitle={hero.label}
      heroDescription={hero.description}
    >
      <div className="status-container-wide space-y-8">
        {loading ? (
          <PageLoader message="Checking all services..." />
        ) : (
          <>
            {fetchError && (
              <div
                role="alert"
                className="status-card-static border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200"
              >
                {fetchError}
              </div>
            )}

            <PageToolbar
              lastUpdated={lastUpdated}
              isRefreshing={refreshing}
              onRefresh={() => fetchData(true)}
              source={metrics?.source}
            />

            <StatusSummaryBar sites={sites} />

            <PageSection
              id="components"
              title="Current status by service"
              description="Real-time health of all monitored components."
            >
              <ComponentStatusList sites={sites} />
            </PageSection>

            <PageSection
              title="Past incidents"
              description="Recent incidents and maintenance windows."
            >
              <IncidentList limit={3} showViewAll />
            </PageSection>

            <PageSection
              title="Uptime history"
              description="Daily status for each service over the last 90 days."
            >
              <UptimeSection sites={sites} compact />
            </PageSection>
          </>
        )}
      </div>
    </StatusLayout>
  );
}
