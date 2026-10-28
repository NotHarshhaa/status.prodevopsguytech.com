import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import StatusLayout from "../components/StatusLayout";
import ComponentStatusList, {
  StatusSummaryBar,
} from "../components/ComponentStatusList";
import UptimeSection, { UptimeSummaryCards } from "../components/UptimeSection";
import SLAGauge from "../components/SLAGauge";
import UptimeHeatmap from "../components/UptimeHeatmap";
import IncidentList from "../components/IncidentList";
import IncidentBanner from "../components/IncidentBanner";
import MaintenanceBanner from "../components/MaintenanceBanner";
import AWSHealthMatrix from "../components/AWSHealthMatrix";
import GitHubIncidentTimeline from "../components/GitHubIncidentTimeline";
import PageToolbar, { PageLoader, PageSection } from "../components/PageToolbar";
import CommandPalette from "../components/CommandPalette";
import BadgeStudioModal from "../components/BadgeStudioModal";
import SLAExportModal from "../components/SLAExportModal";
import SubscribeModal from "../components/SubscribeModal";
import { fetchStatusData } from "../lib/utils/statusData";
import { MAINTENANCE_WINDOWS } from "../lib/maintenance";
import { INCIDENTS } from "../lib/incidents";
import {
  getOverallStatus,
  OVERALL_STATUS,
} from "../lib/statusTheme";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
  Layers,
  Server,
  Calendar,
  BarChart3,
  Globe,
  Radio,
} from "lucide-react";
import { useNotification } from "../components/Notification";

export default function Home({ isDarkMode = false, onThemeToggle, initialData = null }) {
  const [sites, setSites] = useState(initialData?.sites || []);
  const [historical, setHistorical] = useState(initialData?.historical || null);
  const [metrics, setMetrics] = useState(initialData?.metrics || null);
  const [loading, setLoading] = useState(!initialData?.sites?.length);
  const [lastUpdated, setLastUpdated] = useState(
    initialData?.timestamp ? new Date(initialData.timestamp) : new Date()
  );
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeView, setActiveView] = useState("github"); // 'github' | 'aws' | 'incidents' | 'metrics'

  // Modern feature modals
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [badgeStudioOpen, setBadgeStudioOpen] = useState(false);
  const [slaExportOpen, setSLAExportOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const notification = useNotification();
  const sitesRef = useRef(initialData?.sites || []);

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
    <>
      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        sites={sites}
        onRefresh={() => fetchData(true)}
        onThemeToggle={onThemeToggle}
        isDarkMode={isDarkMode}
        onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
        onOpenSLAExport={() => setSLAExportOpen(true)}
        onOpenSubscribe={() => setSubscribeOpen(true)}
      />

      {/* Badge Studio Modal */}
      <BadgeStudioModal
        isOpen={badgeStudioOpen}
        onClose={() => setBadgeStudioOpen(false)}
        sites={sites}
      />

      {/* SLA Export Modal */}
      <SLAExportModal
        isOpen={slaExportOpen}
        onClose={() => setSLAExportOpen(false)}
        sites={sites}
      />

      {/* Notification Webhook Subscription Modal */}
      <SubscribeModal
        isOpen={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />

      <StatusLayout
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
        overallStatus={metrics?.status || overall}
        title="ProDevOpsGuy Status — Systems & Cloud Health"
        description="Real-time availability and 90-day SLA performance across ProDevOpsGuy Tech platforms."
        showHero
        heroStatus={overall}
        heroTitle={hero.label}
        heroDescription={hero.description}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
        onOpenSLAExport={() => setSLAExportOpen(true)}
      >
        <div className="status-container-wide space-y-6">
          {/* Active Outage Banner */}
          <IncidentBanner sites={sites} />

          {/* Scheduled & Active Maintenance Banner */}
          <MaintenanceBanner maintenanceList={MAINTENANCE_WINDOWS} />

          {loading ? (
            <PageLoader message="Querying live edge probes across 16 global endpoints..." />
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

              {/* View Switcher: Top Companies Layout (GitHub Status vs AWS Matrix vs Incident Timeline vs Telemetry) */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-[var(--border)] text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveView("github")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeView === "github"
                        ? "bg-[var(--surface-solid)] text-[var(--accent)] font-semibold shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>GitHub Status View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView("aws")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeView === "aws"
                        ? "bg-[var(--surface-solid)] text-[var(--accent)] font-semibold shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    <Server className="h-3.5 w-3.5" />
                    <span>AWS Health Matrix</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView("incidents")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeView === "incidents"
                        ? "bg-[var(--surface-solid)] text-[var(--accent)] font-semibold shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Daily Incident Log</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveView("metrics")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      activeView === "metrics"
                        ? "bg-[var(--surface-solid)] text-[var(--accent)] font-semibold shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Telemetry & Metrics</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSLAExportOpen(true)}
                    className="status-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1.5"
                  >
                    <span>Export SLA</span>
                  </button>
                </div>
              </div>

              {/* View 1: GitHub Status View (The iconic 90-day bars directly on every service) */}
              {activeView === "github" && (
                <div className="space-y-6">
                  <PageToolbar
                    lastUpdated={lastUpdated}
                    isRefreshing={refreshing}
                    onRefresh={() => fetchData(true)}
                    source={metrics?.source}
                    search={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Filter services by name..."
                    onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
                    onOpenSLAExport={() => setSLAExportOpen(true)}
                  />

                  {/* Operational Status Filter Chips */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="text-[var(--text-muted)] flex items-center gap-1.5 mr-1 font-mono text-[11px]">
                      <Filter className="h-3.5 w-3.5" />
                      Filter:
                    </span>
                    {[
                      { id: "all", label: "All", count: counts.total },
                      {
                        id: "operational",
                        label: "Operational",
                        count: counts.operational,
                        color: "text-emerald-600 dark:text-emerald-400",
                      },
                      {
                        id: "degraded",
                        label: "Degraded",
                        count: counts.degraded,
                        color: "text-amber-600 dark:text-amber-400",
                      },
                      {
                        id: "outage",
                        label: "Outages",
                        count: counts.outage,
                        color: "text-red-600 dark:text-red-400",
                      },
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
                        <span className={statusFilter === id ? "text-white" : color}>
                          {label}
                        </span>
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
                    title="Services & 90-Day Uptime Telemetry"
                    description={`GitHub Status style breakdown. Each vertical bar represents one day of availability. Hover any bar to view timestamp and response time.`}
                  >
                    <ComponentStatusList
                      sites={filteredSites}
                      historical={historical}
                    />
                  </PageSection>

                  <PageSection
                    title="Recent Postmortems & Incident History"
                    description="Verified timeline of past resolved service disruptions."
                  >
                    <IncidentList limit={3} showViewAll />
                  </PageSection>
                </div>
              )}

              {/* View 2: AWS Cloud Health Matrix */}
              {activeView === "aws" && (
                <div className="space-y-6">
                  <PageToolbar
                    lastUpdated={lastUpdated}
                    isRefreshing={refreshing}
                    onRefresh={() => fetchData(true)}
                    source={metrics?.source}
                    onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
                    onOpenSLAExport={() => setSLAExportOpen(true)}
                  />

                  <AWSHealthMatrix sites={sites} />
                </div>
              )}

              {/* View 3: Daily Incident Log (GitHub / GitLab Style) */}
              {activeView === "incidents" && (
                <div className="space-y-6">
                  <GitHubIncidentTimeline incidents={INCIDENTS} daysToShow={14} />
                </div>
              )}

              {/* View 4: Telemetry & Metrics */}
              {activeView === "metrics" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-1">
                      <SLAGauge sites={sites} />
                    </div>
                    <div className="lg:col-span-2">
                      <UptimeSummaryCards sites={sites} />
                    </div>
                  </div>

                  <PageSection
                    title="90-Day System Availability Heatmap"
                    description="Chronological status matrix across all endpoints."
                  >
                    <UptimeHeatmap
                      sites={sites}
                      historical={historical}
                      isDarkMode={isDarkMode}
                    />
                  </PageSection>
                </div>
              )}
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
