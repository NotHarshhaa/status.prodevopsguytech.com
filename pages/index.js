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
import ModernLoader from "../components/ModernLoader";
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
      if (event.key === "r" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        fetchData(true);
      }
      if (event.key === "Escape") {
        setSelectedSite(null);
        setStatusFilters([]);
      }
      // Accessibility: Focus management
      if (event.key === "Tab") {
        // Ensure focus is visible
        document.body.classList.add("keyboard-navigation");
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove("keyboard-navigation");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
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
      className={`min-h-screen flex flex-col ${darkMode ? "dark" : ""} transition-colors duration-300 custom-scrollbar`}
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
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </Head>

      <Header
        toggleTheme={handleToggleDarkMode}
        isDarkMode={darkMode}
        overallStatus={metrics?.status || "operational"}
      />

      <motion.main
        className="flex-grow py-4 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 transition-colors duration-300"
        variants={fadeInUp}
      >
        <motion.div className="max-w-7xl mx-auto" variants={staggerContainer}>
          {loading ? (
            // Modern loading state
            <ModernLoader message="Initializing status dashboard..." />
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
                      <div className="metrics-card flex items-center">
                        <div className="bg-green-100/80 dark:bg-green-900/20 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 backdrop-blur-sm border border-green-200/50 dark:border-green-700/30">
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
                      <div className="metrics-card flex items-center">
                        <div className="bg-blue-100/80 dark:bg-blue-900/20 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/30">
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
                      <div className="metrics-card flex items-center">
                        <div className="bg-red-100/80 dark:bg-red-900/20 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 backdrop-blur-sm border border-red-200/50 dark:border-red-700/30">
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
                  className="glass-card p-4 sm:p-6 mb-4 sm:mb-6"
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2 w-full sm:w-auto overflow-visible">
                        <SearchSites
                          sites={sites}
                          onResultSelect={handleSearchResultSelect}
                          className="flex-grow sm:flex-grow-0"
                        />
                        <StatusFilter onFilterChange={handleFilterChange} />
                      </div>
                      <RefreshButton
                        onRefresh={() => fetchData(true)}
                        lastUpdated={lastUpdated}
                        isRefreshing={refreshing}
                        className="self-end sm:self-auto mt-2 sm:mt-0"
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
                        {(statusFilters.length === 0
                          ? sites
                          : filteredSites
                        ).map((site, index) => (
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
                        ))}
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
