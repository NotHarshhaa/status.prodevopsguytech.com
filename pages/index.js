import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import StatusLayout from "../components/StatusLayout";
import ComponentStatusList, {
  StatusSummaryBar,
} from "../components/ComponentStatusList";
import UptimeSection from "../components/UptimeSection";
import IncidentList from "../components/IncidentList";
import IncidentBanner from "../components/IncidentBanner";
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
  Filter,
} from "lucide-react";
import { useNotification } from "../components/Notification";

export default function Home({ isDarkMode = false, onThemeToggle }) {
  const [sites, setSites] = useState([]);
  const [historical, setHistorical] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      setHistorical(data.historical || null);
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

  const fetchDataRef = useRef(fetchData);

  useEffect(() => {
    fetchDataRef.current = fetchData;
  });

  useEffect(() => {
    fetchDataRef.current();
    const interval = setInterval(() => fetchDataRef.current(), 60000);
    return () => clearInterval(interval);
  }, []);

  const overall = getOverallStatus(sites);
  const hero = OVERALL_STATUS[overall] || OVERALL_STATUS.operational;

  // Filtered sites based on search and status tabs
  const filteredSites = useMemo(() => {
    let result = sites;

    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.id?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [sites, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    const total = sites.length;
    const operational = sites.filter((s) => s.status === "operational").length;
    const degraded = sites.filter((s) => s.status === "degraded").length;
    const outage = sites.filter((s) => s.status === "outage").length;
    return { total, operational, degraded, outage };
  }, [sites]);

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
      <div className="status-container-wide space-y-6">
        {/* Active Incident Alert Banner */}
        <IncidentBanner sites={sites} />

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
              search={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Filter services by name..."
            />

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5 mr-1 font-mono text-[11px]">
                <Filter className="h-3.5 w-3.5" />
                Filter:
              </span>
              {[
                { id: "all", label: "All", count: counts.total },
                { id: "operational", label: "Operational", count: counts.operational, color: "text-emerald-600 dark:text-emerald-400" },
                { id: "degraded", label: "Degraded", count: counts.degraded, color: "text-amber-600 dark:text-amber-400" },
                { id: "outage", label: "Outages", count: counts.outage, color: "text-red-600 dark:text-red-400" },
              ].map(({ id, label, count, color }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStatusFilter(id)}
                  className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                    statusFilter === id
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                      : "bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <span className={statusFilter === id ? "text-white" : color}>{label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      statusFilter === id
                        ? "bg-white/20 text-white"
                        : "bg-[var(--page-bg)] text-[var(--text-muted)]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            <StatusSummaryBar sites={sites} />

            <PageSection
              id="components"
              title="Current status by service"
              description={`Real-time health of monitored components (${filteredSites.length} showing).`}
            >
              <ComponentStatusList sites={filteredSites} />
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
              <UptimeSection
                sites={sites}
                historical={historical}
                compact
              />
            </PageSection>
          </>
        )}
      </div>
    </StatusLayout>
  );
}
