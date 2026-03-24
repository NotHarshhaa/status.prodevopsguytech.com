import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, pulseAnimation, scaleUp } from "../lib/animations";

const SystemStatus = ({ sites }) => {
  // Calculate overall system status based on all sites
  const calculateOverallStatus = () => {
    if (!sites || sites.length === 0) return "operational";

    // Count sites by status
    const statusCounts = sites.reduce((counts, site) => {
      const status = site.status.toLowerCase();
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});

    // Determine overall status based on the most severe status
    if (statusCounts["outage"] > 0) {
      return "outage";
    } else if (statusCounts["degraded"] > 0) {
      return "degraded";
    } else {
      return "operational";
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "operational":
        return {
          title: "All Systems Operational",
          description: "All sites are up and running normally.",
          icon: (
            <CheckCircle
              className="h-6 w-6 md:h-7 md:w-7 text-green-500"
              strokeWidth={2}
            />
          ),
          bgColor:
            "bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-black",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-800 dark:text-green-100",
        };
      case "degraded":
        return {
          title: "Degraded Performance",
          description: "Some sites are experiencing performance issues.",
          icon: (
            <AlertTriangle
              className="h-6 w-6 md:h-7 md:w-7 text-yellow-500"
              strokeWidth={2}
            />
          ),
          bgColor:
            "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-gray-900 dark:to-black",
          borderColor: "border-yellow-200 dark:border-yellow-800",
          textColor: "text-yellow-800 dark:text-yellow-100",
        };
      case "outage":
        return {
          title: "System Outage Detected",
          description: "One or more sites are currently unavailable.",
          icon: (
            <XCircle
              className="h-6 w-6 md:h-7 md:w-7 text-red-500"
              strokeWidth={2}
            />
          ),
          bgColor:
            "bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-black",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-800 dark:text-red-100",
        };
      default:
        return {
          title: "Status Unknown",
          description: "Unable to determine system status.",
          icon: (
            <HelpCircle
              className="h-6 w-6 md:h-7 md:w-7 text-gray-500"
              strokeWidth={2}
            />
          ),
          bgColor:
            "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black",
          borderColor: "border-gray-200 dark:border-gray-700",
          textColor: "text-gray-800 dark:text-gray-100",
        };
    }
  };

  const overallStatus = calculateOverallStatus();
  const statusConfig = getStatusConfig(overallStatus);

  // Calculate operational percentage
  const calculateOperationalPercentage = () => {
    if (!sites || sites.length === 0) return 100;

    const operationalCount = sites.filter(
      (site) => site.status.toLowerCase() === "operational",
    ).length;
    return Math.round((operationalCount / sites.length) * 100);
  };

  const operationalPercentage = calculateOperationalPercentage();

  return (
    <motion.div
      className={`system-status-card mb-4 md:mb-6`}
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 10 }}
      layout
    >
      <div className="flex items-start md:items-center gap-2.5 md:gap-4">
        {/* Status Icon — plain div, removed motion nesting */}
        <div
          className="p-2 md:p-2.5 bg-white/90 dark:bg-black/40 backdrop-blur-sm rounded-xl shadow-lg flex-shrink-0 border border-gray-200/50 dark:border-gray-800/50"
        >
          {statusConfig.icon}
        </div>

        {/* Status Info — plain divs for text */}
        <div className="flex-1 min-w-0">
          <h2 className={`text-base md:text-xl font-semibold ${statusConfig.textColor} truncate leading-tight`}>
            {statusConfig.title}
          </h2>
          <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mt-0.5 line-clamp-1 md:line-clamp-2">
            {statusConfig.description}
          </p>

          {/* Status Details */}
          <div className="flex flex-wrap items-center mt-1.5 gap-x-3 gap-y-1 text-[10px] md:text-xs text-gray-600 dark:text-gray-500">
            <div className="flex items-center">
              <Activity className="h-3 w-3 mr-1 text-blue-500" />
              <span>{operationalPercentage}% Operational</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span className="truncate">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center">
              <span>{sites.length} sites</span>
            </div>
          </div>
        </div>

        {/* Status Indicator — single motion.div for pulsing */}
        <motion.div
          className="hidden md:flex flex-col items-center justify-center bg-white/90 dark:bg-black/40 backdrop-blur-sm rounded-xl h-16 w-16 md:h-18 md:w-18 shadow-lg flex-shrink-0 relative overflow-hidden border border-gray-200/50 dark:border-gray-800/50"
          variants={pulseAnimation}
          initial="initial"
          animate="animate"
        >
          {/* Top progress bar */}
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{
              width: "100%",
              backgroundColor:
                overallStatus === "operational"
                  ? "#10B981"
                  : overallStatus === "degraded"
                    ? "#F59E0B"
                    : "#EF4444",
            }}
          />
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {operationalPercentage}%
          </span>
          <span className="text-[9px] text-gray-600 dark:text-gray-500">
            Operational
          </span>
          {/* Bottom progress bar */}
          <div
            className="absolute bottom-0 inset-x-0 h-1 transition-all duration-700"
            style={{
              width: `${operationalPercentage}%`,
              backgroundColor:
                overallStatus === "operational"
                  ? "#10B981"
                  : overallStatus === "degraded"
                    ? "#F59E0B"
                    : "#EF4444",
            }}
          />
        </motion.div>
      </div>

      {/* Mobile percentage indicator — unified motion.div usage */}
      <div className="md:hidden mt-2 h-1.5 bg-gray-200 dark:bg-dark-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${operationalPercentage}%`,
            backgroundColor:
              overallStatus === "operational"
                ? "#10B981"
                : overallStatus === "degraded"
                  ? "#F59E0B"
                  : "#EF4444",
          }}
        />
      </div>
    </motion.div>
  );
};

export default SystemStatus;
