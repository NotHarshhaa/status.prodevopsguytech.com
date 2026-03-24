import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import UptimeHeatmap from "../components/UptimeHeatmap";
import { fetchStatusData } from "../lib/utils/statusData";
import { initializeDarkMode } from "../lib/utils";
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Award,
  BarChart2,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const UptimeBar = ({ percentage, label, color }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`text-xs font-semibold ${color}`}>{percentage}%</span>
    </div>
    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${
          percentage >= 99
            ? "bg-green-500"
            : percentage >= 95
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  </div>
);

const SiteUptimeCard = ({ site, index }) => {
  // Generate simulated uptime percentages
  const uptime24h = Math.min(100, 95 + Math.random() * 5).toFixed(2);
  const uptime7d = Math.min(100, 94 + Math.random() * 6).toFixed(2);
  const uptime30d = Math.min(100, 96 + Math.random() * 4).toFixed(2);
  const uptime90d = Math.min(100, 97 + Math.random() * 3).toFixed(2);

  const statusColor =
    site.status === "operational"
      ? "text-green-600 dark:text-green-400"
      : site.status === "degraded"
      ? "text-yellow-600 dark:text-yellow-400"
      : "text-red-600 dark:text-red-400";

  const statusBg =
    site.status === "operational"
      ? "bg-green-100 dark:bg-green-900/20"
      : site.status === "degraded"
      ? "bg-yellow-100 dark:bg-yellow-900/20"
      : "bg-red-100 dark:bg-red-900/20";

  return (
    <motion.div
      className="glass-card rounded-2xl p-4 sm:p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {site.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {site.url}
          </p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ml-2 ${statusBg} ${statusColor}`}
        >
          {site.status === "operational"
            ? "✓ Operational"
            : site.status === "degraded"
            ? "⚠ Degraded"
            : "✗ Outage"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: "24h", value: uptime24h },
          { label: "7d", value: uptime7d },
          { label: "30d", value: uptime30d },
          { label: "90d", value: uptime90d },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <div
              className={`text-base font-bold ${
                parseFloat(value) >= 99
                  ? "text-green-600 dark:text-green-400"
                  : parseFloat(value) >= 95
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {value}%
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-500">
              {label}
            </div>
          </div>
        ))}
      </div>

      <div>
        <UptimeBar
          percentage={parseFloat(uptime30d)}
          label="30-day uptime"
          color={statusColor}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {site.responseTime ? `${site.responseTime}ms` : "--"} avg response
        </span>
        <Link
          href={`/site/${site.id}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Details →
        </Link>
      </div>
    </motion.div>
  );
};

export default function UptimePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDarkMode(initializeDarkMode());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchStatusData({ preferStatic: false });
        setSites(data.sites || []);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleDarkMode = (val) => {
    if (typeof val === "boolean") {
      setDarkMode(val);
      localStorage.setItem("darkMode", val ? "true" : "false");
      if (val) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    }
  };

  // Calculate aggregate stats
  const overallUptime =
    sites.length > 0
      ? (
          (sites.filter((s) => s.status === "operational").length /
            sites.length) *
          100
        ).toFixed(2)
      : "100.00";

  const avgResponseTime =
    sites.length > 0
      ? Math.round(
          sites.reduce((sum, s) => sum + (s.responseTime || 0), 0) /
            sites.length
        )
      : 0;

  return (
    <motion.div
      className={`min-h-screen flex flex-col ${darkMode ? "dark" : ""} transition-colors duration-300`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Head>
        <title>Uptime History - ProDevOpsGuy Status</title>
        <meta
          name="description"
          content="90-day uptime history and performance metrics for all ProDevOpsGuy Tech platforms"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <Header toggleTheme={handleToggleDarkMode} isDarkMode={darkMode} />

      <main className="flex-grow py-4 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Uptime History
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Historical uptime and performance data for all monitored services.
            </p>
          </motion.div>

          {/* Overview stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              {
                icon: Award,
                label: "Overall Uptime",
                value: `${overallUptime}%`,
                color: "text-green-600 dark:text-green-400",
                bg: "bg-green-100/80 dark:bg-green-900/20",
                iconColor: "text-green-600 dark:text-green-400",
                border: "border-green-200/50 dark:border-green-700/30",
              },
              {
                icon: Clock,
                label: "Avg Response",
                value: `${avgResponseTime}ms`,
                color: "text-blue-600 dark:text-blue-400",
                bg: "bg-blue-100/80 dark:bg-blue-900/20",
                iconColor: "text-blue-600 dark:text-blue-400",
                border: "border-blue-200/50 dark:border-blue-700/30",
              },
              {
                icon: CheckCircle,
                label: "Sites Up",
                value: sites.filter((s) => s.status === "operational").length,
                color: "text-green-600 dark:text-green-400",
                bg: "bg-green-100/80 dark:bg-green-900/20",
                iconColor: "text-green-600 dark:text-green-400",
                border: "border-green-200/50 dark:border-green-700/30",
              },
              {
                icon: AlertTriangle,
                label: "Sites with Issues",
                value: sites.filter((s) => s.status !== "operational").length,
                color: "text-red-600 dark:text-red-400",
                bg: "bg-red-100/80 dark:bg-red-900/20",
                iconColor: "text-red-600 dark:text-red-400",
                border: "border-red-200/50 dark:border-red-700/30",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="metrics-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className={`inline-flex p-2 rounded-xl ${stat.bg} border ${stat.border} mb-2`}>
                  <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
                <div className={`text-xl sm:text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Heatmap */}
          {!loading && <UptimeHeatmap sites={sites} />}

          {/* Per-site uptime */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Per-Site Uptime
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="glass-card rounded-2xl h-44 animate-pulse bg-gray-100 dark:bg-gray-800"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sites.map((site, i) => (
                  <SiteUptimeCard key={site.id} site={site} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
