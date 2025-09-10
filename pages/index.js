import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SystemStatus from "../components/SystemStatus";
import SiteStatusCard from "../components/SiteStatusCard";
import RefreshButton from "../components/RefreshButton";
import StatusFilter from "../components/StatusFilter";
import SearchSites from "../components/SearchSites";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { initializeDarkMode, toggleDarkMode } from "../lib/utils";
import { fetchStatusData } from "../lib/utils/statusData";
import {
  CheckCircle,
  Clock,
  Server,
  AlertTriangle,
  XCircle,
  BarChart2,
  RefreshCw,
  Activity,
} from "lucide-react";
import { useNotification } from "../components/Notification";
import { motion, AnimatePresence } from "framer-motion";
import { pageTransition, staggerContainer, fadeInUp } from "../lib/animations";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [sites, setSites] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [previousSites, setPreviousSites] = useState([]);
  const [filteredSites, setFilteredSites] = useState([]);
  const [statusFilters, setStatusFilters] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);
  const notification = useNotification();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'r' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        fetchData(true);
      }
      if (event.key === 'Escape') {
        setSelectedSite(null);
        setStatusFilters([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch site status data
  const fetchData = async (forceRefresh = false) => {
    try {
      if (!sites.length) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      // Fetch site statuses with fallback to static data if real-time fails
      const data = await fetchStatusData({
        preferStatic: false,
        refresh: forceRefresh,
      });

      // Save current sites for comparison
      if (sites.length > 0) {
        setPreviousSites([...sites]);
      }

      const newSites = data.sites;
      setSites(newSites);

      // Apply any existing filters to the new data
      applyStatusFilters(newSites, statusFilters);
      setMetrics(data.metrics);
      setLastUpdated(new Date(data.timestamp || Date.now()));

      // Check for status changes and notify
      if (previousSites.length > 0 && newSites.length > 0) {
        checkForStatusChanges(previousSites, newSites);
      }
    } catch (error) {
      console.error("Failed to fetch status data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup periodic refresh (every 60 seconds)
    const refreshInterval = setInterval(fetchData, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

  // Apply filters whenever sites or statusFilters change
  useEffect(() => {
    applyStatusFilters(sites, statusFilters);
  }, [sites, statusFilters]);

  // Apply status filters to the sites
  const applyStatusFilters = (sitesToFilter, filters) => {
    if (!filters || filters.length === 0) {
      // No filters, show all sites
      setFilteredSites(sitesToFilter);
    } else {
      // Filter sites by selected statuses
      const filtered = sitesToFilter.filter((site) =>
        filters.includes(site.status),
      );
      setFilteredSites(filtered);
    }
  };

  // Handle filter changes
  const handleFilterChange = (selectedFilters) => {
    setStatusFilters(selectedFilters);
    applyStatusFilters(sites, selectedFilters);
  };

  // Handle search result selection
  const handleSearchResultSelect = (site) => {
    setSelectedSite(site);
    // Scroll to the selected site card with smooth animation
    setTimeout(() => {
      const siteElement = document.getElementById(`site-${site.id}`);
      if (siteElement) {
        siteElement.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight the element temporarily
        siteElement.classList.add("ring-2", "ring-blue-500", "ring-offset-2");
        setTimeout(() => {
          siteElement.classList.remove(
            "ring-2",
            "ring-blue-500",
            "ring-offset-2",
          );
        }, 2000);
      }
    }, 100);
  };

  // Check for status changes and display notifications
  const checkForStatusChanges = (oldSites, newSites) => {
    newSites.forEach((newSite) => {
      const oldSite = oldSites.find((site) => site.id === newSite.id);
      if (oldSite && oldSite.status !== newSite.status) {
        // Status changed - show notification
        if (
          newSite.status === "operational" &&
          oldSite.status !== "operational"
        ) {
          notification.success(`${newSite.name} is now operational`, {
            icon: <CheckCircle className="h-5 w-5" strokeWidth={2} />,
            duration: 8000,
          });
        } else if (newSite.status === "degraded") {
          notification.warning(
            `${newSite.name} is experiencing degraded performance`,
            {
              icon: <AlertTriangle className="h-5 w-5" strokeWidth={2} />,
              duration: 10000,
            },
          );
        } else if (newSite.status === "outage") {
          notification.error(`${newSite.name} is currently down`, {
            icon: <XCircle className="h-5 w-5" strokeWidth={2} />,
            duration: 0, // Won't auto-dismiss
          });
        }
      }
    });
  };

  // Handle dark mode toggle
  const handleToggleDarkMode = (darkModeValue) => {
    // If a specific value is provided, use it, otherwise toggle
    if (typeof darkModeValue === "boolean") {
      const newDarkMode = darkModeValue;
      setDarkMode(newDarkMode);
      // Update localStorage to persist the preference
      localStorage.setItem("darkMode", newDarkMode ? "true" : "false");
      // Update document class for Tailwind
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      localStorage.setItem("darkMode", newDarkMode ? "true" : "false");
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  return (
    <motion.div
      className={`min-h-screen flex flex-col ${darkMode ? "dark" : ""} transition-colors duration-300`}
      initial="hidden"
      animate="visible"
      variants={pageTransition}
    >
      <Head>
        <title>ProDevOpsGuy - Status Dashboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Real-time status of ProDevOpsGuy Tech platforms and websites"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <Header 
        toggleTheme={handleToggleDarkMode} 
        isDarkMode={darkMode} 
        overallStatus={metrics?.status || "operational"} 
      />

      <motion.main
        className="flex-grow py-4 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 bg-gray-50 dark:bg-black transition-colors duration-300"
        variants={fadeInUp}
      >
        <motion.div className="max-w-7xl mx-auto" variants={staggerContainer}>
          {loading ? (
            // Loading skeleton
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* System Status Skeleton */}
              <div className="bg-white dark:bg-black rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 shadow-md">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-2/3 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                  </div>
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                </div>
              </div>
              
              {/* Metrics Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-black rounded-lg shadow p-4 border border-gray-100 dark:border-gray-900">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-4 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4 animate-pulse" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-1 w-1/2 animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Sites Skeleton */}
              <div className="bg-white dark:bg-black shadow-sm rounded-lg p-6 border border-gray-100 dark:border-gray-900">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
                  <div className="flex space-x-2">
                    <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
                <LoadingSkeleton count={6} />
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="content"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={pageTransition}
              >
                {/* System Status Overview */}
                <SystemStatus sites={sites} />

                {/* System Metrics */}
                <AnimatePresence>
                  {metrics && (
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                    >
                      {/* Operational Percentage */}
                      <div className="bg-white dark:bg-black rounded-lg shadow p-3 sm:p-4 flex items-center border border-gray-100 dark:border-gray-900">
                        <div className="bg-green-100 dark:bg-green-900/10 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                          <CheckCircle
                            className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400"
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                            Operational
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {metrics.operationalPercentage}%
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
                            {metrics.totalSites} monitored sites
                          </p>
                        </div>
                      </div>

                      {/* Average Response Time */}
                      <div className="bg-white dark:bg-black rounded-lg shadow p-3 sm:p-4 flex items-center border border-gray-100 dark:border-gray-900">
                        <div className="bg-blue-100 dark:bg-blue-900/10 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                          <Clock
                            className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400"
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                            Avg Response Time
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {metrics.averageResponseTime} ms
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
                            For operational sites
                          </p>
                        </div>
                      </div>

                      {/* Sites with Issues */}
                      <div className="bg-white dark:bg-black rounded-lg shadow p-3 sm:p-4 flex items-center border border-gray-100 dark:border-gray-900">
                        <div className="bg-red-100 dark:bg-red-900/10 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                          <Server
                            className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400"
                            strokeWidth={2}
                          />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
                            Sites with Issues
                          </p>
                          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {metrics.sitesWithIssues.length}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
                            {metrics.sitesWithIssues.length
                              ? "Requires attention"
                              : "All systems operational"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sites Status List */}
                <motion.div
                  className="bg-white dark:bg-black shadow-sm rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100 dark:border-gray-900"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                    <div className="flex items-center mb-3 sm:mb-0">
                      <BarChart2
                        className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 mr-2"
                        strokeWidth={2}
                      />
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                        Site Status
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                      <SearchSites
                        sites={sites}
                        onResultSelect={handleSearchResultSelect}
                      />
                      <StatusFilter onFilterChange={handleFilterChange} />
                      <RefreshButton
                        onRefresh={() => fetchData(true)}
                        lastUpdated={lastUpdated}
                        isRefreshing={refreshing}
                      />
                      {metrics && metrics.source && (
                        <div className="flex items-center text-xs text-gray-400 mt-1.5">
                          {metrics.source === "static" ? (
                            <Server className="h-3 w-3 mr-1" />
                          ) : (
                            <Activity className="h-3 w-3 mr-1" />
                          )}
                          <span>
                            Source:{" "}
                            {metrics.source === "static"
                              ? "Static data"
                              : "Real-time check"}
                          </span>
                        </div>
                      )}
                      <div className="hidden lg:flex items-center text-xs text-gray-400 mt-1.5">
                        <span>Press Ctrl+R to refresh</span>
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="grid grid-cols-1 gap-3 sm:gap-5"
                    variants={staggerContainer}
                  >
                    {sites.length > 0 ? (
                      <AnimatePresence>
                        {(statusFilters.length === 0 ? sites : filteredSites).map(
                          (site, index) => (
                            <SiteStatusCard
                              key={site.id}
                              site={site}
                              id={`site-${site.id}`}
                              className={`${
                                index % 2 === 0
                                  ? "transform hover:-translate-y-1"
                                  : "transform hover:translate-y-1"
                              } ${selectedSite?.id === site.id ? "ring-2 ring-blue-500" : ""}`}
                            />
                          ),
                        )}
                      </AnimatePresence>
                    ) : (
                      <motion.div
                        className="flex flex-col items-center justify-center py-8 sm:py-12 bg-white dark:bg-black rounded-lg shadow-sm"
                        variants={fadeInUp}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <RefreshCw className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                        </motion.div>
                        <motion.p
                          className="text-gray-500 dark:text-gray-500 text-center text-base sm:text-lg"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {statusFilters.length > 0
                            ? "No sites match the selected filters"
                            : "No sites found."}
                        </motion.p>
                        <motion.p
                          className="text-gray-400 dark:text-gray-500 text-center text-xs sm:text-sm mt-1"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {statusFilters.length > 0
                            ? "Try adjusting your filters"
                            : "Try refreshing or check back later"}
                        </motion.p>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </motion.main>

      <Footer />
    </motion.div>
  );
}
