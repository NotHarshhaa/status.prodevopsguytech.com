import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SiteMetrics from "../../components/SiteMetrics";
import HistoricalChart from "../../components/HistoricalChart";
import RealTimeStatusChart from "../../components/RealTimeStatusChart";
import { getSiteHistory } from "../../lib/services/statusChecker";
import { initializeDarkMode, toggleDarkMode } from "../../lib/utils";
import { 
  ArrowLeft, 
  Rocket, 
  Monitor, 
  BookOpen, 
  Package, 
  Compass, 
  Newspaper, 
  Cloud, 
  Container, 
  FlaskConical, 
  Wrench, 
  FileText, 
  BarChart3 
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Icon mapping for string identifiers to React components
const iconMap = {
  Rocket,
  Monitor,
  BookOpen,
  Package,
  Compass,
  Newspaper,
  Cloud,
  Container,
  FlaskConical,
  Wrench,
  FileText,
  BarChart3
};

export default function SiteDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [darkMode, setDarkMode] = useState(false);
  const [site, setSite] = useState(null);
  const [siteHistory, setSiteHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("realtime");
  const [siteId, setSiteId] = useState(null);

  // Initialize dark mode preference
  useEffect(() => {
    setDarkMode(initializeDarkMode());
  }, []);

  // Set the site ID when the router query changes
  useEffect(() => {
    if (id) {
      setSiteId(id);
    }
  }, [id]);

  // Fetch site data when siteId is available
  useEffect(() => {
    if (!siteId) return;

    const fetchSiteData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch site status from API
        console.log("Fetching site data for ID:", siteId);
        const response = await axios.get(
          `/api/status?siteId=${encodeURIComponent(siteId)}`,
        );

        if (response.data && response.data.site) {
          const siteData = response.data.site;
          console.log("Site data received:", siteData);
          
          // Ensure we have all required fields
          if (!siteData.name || !siteData.description) {
            console.error("Missing required fields:", { 
              name: siteData.name, 
              description: siteData.description, 
              icon: siteData.icon 
            });
            setError("Invalid site data received");
            return;
          }

          setSite(siteData);

          // Get historical data (currently simulated)
          const history = getSiteHistory(siteId);
          setSiteHistory(history);
        } else {
          console.error("Site data not available in response:", response.data);
          setError("Site not found or data unavailable");
        }
      } catch (err) {
        console.error("Error fetching site data:", err);
        setError("Failed to load site data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();

    // Refresh data every 30 seconds
    const refreshInterval = setInterval(fetchSiteData, 30000);
    return () => clearInterval(refreshInterval);
  }, [siteId]);

  // Handle dark mode toggle
  const handleToggleDarkMode = (darkModeValue) => {
    // If a specific value is provided, use it, otherwise toggle
    if (typeof darkModeValue === "boolean") {
      setDarkMode(darkModeValue);
      // Update localStorage to persist the preference
      localStorage.setItem("darkMode", darkModeValue ? "true" : "false");
      // Update document class for Tailwind
      if (darkModeValue) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      toggleDarkMode(setDarkMode);
    }
  };

  if (!id) {
    return null; // Don't render until we have an ID
  }

  return (
    <motion.div
      className={`min-h-screen flex flex-col ${darkMode ? "dark" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Head>
        <title>
          {site
            ? `${site.name} Status - ProDevOpsGuy`
            : "Loading Site Status..."}
        </title>
        <meta
          name="description"
          content={
            site
              ? `Current status and performance metrics for ${site.name}`
              : "Loading site status information"
          }
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <Header toggleTheme={handleToggleDarkMode} isDarkMode={darkMode} />

      <main className="flex-grow py-4 sm:py-8 px-3 sm:px-6 lg:px-8 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Status Dashboard
            </Link>
          </motion.div>

          {loading ? (
            <motion.div
              className="flex justify-center items-center h-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
            </motion.div>
          ) : error ? (
            <motion.div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
              {error}
            </motion.div>
          ) : site ? (
            <>
              {/* Site Header */}
              <motion.div
                className="bg-white dark:bg-black rounded-lg shadow p-4 sm:p-6 mb-3 sm:mb-6 border border-gray-100 dark:border-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center">
                  <motion.span
                    className="text-2xl sm:text-3xl mr-2 sm:mr-3"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  >
                    {React.createElement(iconMap[site.icon] || Monitor, { className: "h-8 w-8" })}
                  </motion.span>
                  <div>
                    <motion.h1
                      className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {site.name}
                    </motion.h1>
                    <motion.p
                      className="text-gray-500 dark:text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {site.description}
                    </motion.p>
                    <motion.a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm inline-block mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {site.url}
                    </motion.a>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="bg-white dark:bg-black rounded-lg shadow p-3 mb-1 border border-gray-100 dark:border-gray-900 overflow-hidden">
                  <div className="flex space-x-2 border-b border-gray-100 dark:border-gray-900">
                    <motion.button
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                        activeTab === "realtime"
                          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                          : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                      onClick={() => setActiveTab("realtime")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Real-Time Performance
                    </motion.button>
                    <motion.button
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                        activeTab === "historical"
                          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                          : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                      onClick={() => setActiveTab("historical")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Historical Data
                    </motion.button>
                    <motion.button
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                        activeTab === "metrics"
                          ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                          : "text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                      onClick={() => setActiveTab("metrics")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Site Metrics
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {activeTab === "realtime" && (
                  <motion.div
                    key="realtime"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <RealTimeStatusChart
                      siteId={siteId ? siteId.toString() : ""}
                      siteName={site?.name || "Unknown Site"}
                      timeRange="24h"
                    />
                  </motion.div>
                )}

                {activeTab === "historical" && (
                  <motion.div
                    key="historical"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HistoricalChart
                      siteHistory={siteHistory || {}}
                      siteId={siteId ? siteId.toString() : ""}
                      siteName={site?.name || "Unknown Site"}
                    />
                  </motion.div>
                )}

                {activeTab === "metrics" && (
                  <motion.div
                    key="metrics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SiteMetrics site={site || {}} />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-800 dark:text-yellow-200">
              Site not found
            </div>
          )}
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
