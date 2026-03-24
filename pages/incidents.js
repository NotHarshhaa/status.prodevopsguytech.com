import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { initializeDarkMode } from "../lib/utils";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Simulated incident data
const MOCK_INCIDENTS = [
  {
    id: "INC-2025-001",
    title: "ProDevOpsGuyTech Community - Elevated Response Times",
    status: "resolved",
    severity: "degraded",
    startedAt: "2025-03-20T14:30:00Z",
    resolvedAt: "2025-03-20T16:45:00Z",
    affectedSites: ["ProDevOpsGuyTech Community"],
    updates: [
      {
        time: "2025-03-20T16:45:00Z",
        status: "resolved",
        message:
          "The issue has been fully resolved. Response times are back to normal. We apologize for any inconvenience.",
      },
      {
        time: "2025-03-20T15:30:00Z",
        status: "monitoring",
        message:
          "A fix has been deployed. We are monitoring to confirm the issue is resolved.",
      },
      {
        time: "2025-03-20T14:55:00Z",
        status: "identified",
        message:
          "The issue has been identified as a database connection pool exhaustion. Engineers are working on a fix.",
      },
      {
        time: "2025-03-20T14:30:00Z",
        status: "investigating",
        message:
          "We are investigating reports of elevated response times on the main community platform.",
      },
    ],
  },
  {
    id: "INC-2025-002",
    title: "DevOps Blog - Partial Outage",
    status: "resolved",
    severity: "outage",
    startedAt: "2025-03-15T09:00:00Z",
    resolvedAt: "2025-03-15T10:30:00Z",
    affectedSites: ["DevOps Blog", "Cloud Blog"],
    updates: [
      {
        time: "2025-03-15T10:30:00Z",
        status: "resolved",
        message:
          "Both blog services are now fully operational. The root cause was a misconfigured CDN cache rule which has been corrected.",
      },
      {
        time: "2025-03-15T09:45:00Z",
        status: "identified",
        message: "Issue identified as a CDN misconfiguration. Fix in progress.",
      },
      {
        time: "2025-03-15T09:00:00Z",
        status: "investigating",
        message:
          "We are investigating reports of the blog and cloud blog being inaccessible.",
      },
    ],
  },
  {
    id: "INC-2025-003",
    title: "Planned Maintenance - Docs Portal Upgrade",
    status: "resolved",
    severity: "maintenance",
    startedAt: "2025-03-10T02:00:00Z",
    resolvedAt: "2025-03-10T04:00:00Z",
    affectedSites: ["Ultimate Docs Portal"],
    updates: [
      {
        time: "2025-03-10T04:00:00Z",
        status: "resolved",
        message:
          "Maintenance completed successfully. The Docs Portal has been upgraded to the latest version.",
      },
      {
        time: "2025-03-10T02:00:00Z",
        status: "maintenance",
        message:
          "Scheduled maintenance window has begun. The Docs Portal will be temporarily unavailable.",
      },
    ],
  },
  {
    id: "INC-2025-004",
    title: "Jobs Portal - Slow Search Performance",
    status: "resolved",
    severity: "degraded",
    startedAt: "2025-03-05T11:00:00Z",
    resolvedAt: "2025-03-05T13:15:00Z",
    affectedSites: ["Jobs Portal"],
    updates: [
      {
        time: "2025-03-05T13:15:00Z",
        status: "resolved",
        message: "Search performance has been restored to normal levels.",
      },
      {
        time: "2025-03-05T12:00:00Z",
        status: "monitoring",
        message:
          "Search index has been rebuilt. Monitoring for improvements.",
      },
      {
        time: "2025-03-05T11:00:00Z",
        status: "investigating",
        message:
          "Users are reporting slow search results. Investigating the cause.",
      },
    ],
  },
];

const statusConfig = {
  resolved: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-200 dark:border-green-700/50",
    label: "Resolved",
  },
  investigating: {
    icon: AlertTriangle,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    border: "border-yellow-200 dark:border-yellow-700/50",
    label: "Investigating",
  },
  identified: {
    icon: AlertTriangle,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    border: "border-orange-200 dark:border-orange-700/50",
    label: "Identified",
  },
  monitoring: {
    icon: Clock,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-700/50",
    label: "Monitoring",
  },
  maintenance: {
    icon: Clock,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    border: "border-indigo-200 dark:border-indigo-700/50",
    label: "Maintenance",
  },
};

const severityConfig = {
  outage: {
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    dot: "bg-red-500",
    label: "Outage",
  },
  degraded: {
    badge:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    dot: "bg-yellow-500",
    label: "Degraded",
  },
  maintenance: {
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    dot: "bg-blue-500",
    label: "Maintenance",
  },
};

const IncidentCard = ({ incident }) => {
  const [expanded, setExpanded] = useState(false);
  const severity = severityConfig[incident.severity] || severityConfig.degraded;
  const statusCfg = statusConfig[incident.status] || statusConfig.investigating;
  const StatusIcon = statusCfg.icon;

  const duration = incident.resolvedAt
    ? dayjs(incident.resolvedAt).diff(dayjs(incident.startedAt), "minute")
    : null;

  return (
    <motion.div
      className={`glass-card rounded-2xl overflow-hidden mb-4 border ${statusCfg.border}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Header */}
      <div
        className="p-4 sm:p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`p-2 rounded-xl ${statusCfg.bg} flex-shrink-0 mt-0.5`}>
              <StatusIcon className={`h-4 w-4 ${statusCfg.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                  {incident.id}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severity.badge}`}>
                  {severity.label}
                </span>
                {incident.status === "resolved" && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    ✓ Resolved
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                {incident.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {dayjs(incident.startedAt).format("MMM D, YYYY HH:mm")} UTC
                </span>
                {duration !== null && (
                  <span>Duration: {duration}m</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {incident.affectedSites.map((site) => (
                  <span
                    key={site}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                  >
                    {site}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Incident Timeline */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="border-t border-gray-100 dark:border-gray-800 px-4 sm:px-5 py-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              Incident Timeline
            </h4>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-4">
                {incident.updates.map((update, index) => {
                  const updateCfg =
                    statusConfig[update.status] || statusConfig.investigating;
                  const UpdateIcon = updateCfg.icon;
                  return (
                    <motion.div
                      key={index}
                      className="flex gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`relative z-10 flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full ${updateCfg.bg} border-2 border-white dark:border-gray-900`}>
                        <UpdateIcon className={`h-3.5 w-3.5 ${updateCfg.color}`} />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${updateCfg.bg} ${updateCfg.color}`}>
                            {updateCfg.label}
                          </span>
                          <span className="text-[11px] text-gray-400 dark:text-gray-500">
                            {dayjs(update.time).format("HH:mm")} UTC
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {update.message}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function IncidentsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setDarkMode(initializeDarkMode());
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

  const filteredIncidents = MOCK_INCIDENTS.filter(
    (inc) =>
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.affectedSites.some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      )
  );

  const activeIncidents = filteredIncidents.filter(
    (i) => i.status !== "resolved"
  );
  const resolvedIncidents = filteredIncidents.filter(
    (i) => i.status === "resolved"
  );

  return (
    <motion.div
      className={`min-h-screen flex flex-col ${darkMode ? "dark" : ""} transition-colors duration-300`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Head>
        <title>Incidents - ProDevOpsGuy Status</title>
        <meta
          name="description"
          content="Incident history and status updates for ProDevOpsGuy Tech platforms"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <Header
        toggleTheme={handleToggleDarkMode}
        isDarkMode={darkMode}
        overallStatus="operational"
      />

      <main className="flex-grow py-4 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
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
              Incident History
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              A record of all past and current incidents, maintenance windows, and service disruptions.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            {[
              {
                label: "Total Incidents",
                value: MOCK_INCIDENTS.length,
                color: "text-gray-900 dark:text-white",
              },
              {
                label: "Active",
                value: MOCK_INCIDENTS.filter((i) => i.status !== "resolved").length,
                color: "text-red-600 dark:text-red-400",
              },
              {
                label: "Resolved",
                value: MOCK_INCIDENTS.filter((i) => i.status === "resolved").length,
                color: "text-green-600 dark:text-green-400",
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="glass-card rounded-xl p-3 sm:p-4 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search incidents..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Active Incidents */}
          {activeIncidents.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3">
                🔴 Active Incidents
              </h2>
              {activeIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}

          {/* Resolved Incidents */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              ✓ Resolved Incidents (Last 90 Days)
            </h2>
            {resolvedIncidents.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  No incidents found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {search ? "Try adjusting your search" : "All systems have been operational"}
                </p>
              </div>
            ) : (
              resolvedIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
