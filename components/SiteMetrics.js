import React, { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  BarChart2,
  Server,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { scaleUp, fadeInUp, pulseAnimation } from "../lib/animations";

const SiteMetrics = ({ site }) => {
  const [showDetailedView, setShowDetailedView] = useState(false);

  if (!site) return null;

  const { responseTime, status, statusCode, lastChecked } = site;

  // Determine the health indicator icon and color
  const getHealthIndicator = () => {
    switch (status) {
      case "operational":
        return {
          icon: (
            <CheckCircle className="h-8 w-8 text-green-500" strokeWidth={2} />
          ),
          text: "Healthy",
          textColor: "text-green-500",
          bgColor: "bg-green-100 dark:bg-green-900/20",
        };
      case "degraded":
        return {
          icon: (
            <AlertTriangle
              className="h-8 w-8 text-yellow-500"
              strokeWidth={2}
            />
          ),
          text: "Degraded",
          textColor: "text-yellow-500",
          bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
        };
      case "outage":
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" strokeWidth={2} />,
          text: "Outage",
          textColor: "text-red-500",
          bgColor: "bg-red-100 dark:bg-red-900/20",
        };
      default:
        return {
          icon: <Clock className="h-8 w-8 text-gray-500" strokeWidth={2} />,
          text: "Unknown",
          textColor: "text-gray-500",
          bgColor: "bg-gray-100 dark:bg-dark-lighter/50",
        };
    }
  };

  // Determine response time indicator
  const getResponseIndicator = (time) => {
    if (!time)
      return { color: "bg-gray-200 dark:bg-gray-700", text: "Unknown" };

    if (time < 200) return { color: "bg-green-500", text: "Fast" };
    if (time < 500) return { color: "bg-blue-500", text: "Good" };
    if (time < 1000) return { color: "bg-yellow-500", text: "Slow" };
    return { color: "bg-red-500", text: "Very Slow" };
  };

  const health = getHealthIndicator();
  const responseIndicator = getResponseIndicator(responseTime);

  // Format time
  const formatTime = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const toggleDetailedView = () => {
    setShowDetailedView(!showDetailedView);
  };

  // Calculate historical uptime performance (mock data - in a real app this would come from the API)
  const uptimeData = {
    day: 99.9,
    week: 99.7,
    month: 99.5,
    year: 99.8,
  };

  return (
    <motion.div
      className="bg-white dark:bg-dark-lighter rounded-lg shadow p-3 sm:p-4"
      variants={scaleUp}
      initial="hidden"
      animate="visible"
      whileHover={{
        boxShadow:
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      }}
      transition={{ duration: 0.3 }}
      layout
    >
      <motion.div className="flex items-center justify-between mb-4">
        <motion.h3
          className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          Site Metrics
        </motion.h3>
        <motion.button
          onClick={toggleDetailedView}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center text-xs"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showDetailedView ? "Show Less" : "Show More"}
          <BarChart2 className="h-4 w-4 ml-1" />
        </motion.button>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        {/* Health Status */}
        <motion.div
          className={`rounded-lg p-4 ${health.bgColor}`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Health Status
            </span>
          </div>
          <div className="flex items-center">
            <motion.div
              variants={pulseAnimation}
              initial="initial"
              animate="animate"
            >
              {health.icon}
            </motion.div>
            <motion.span
              className={`ml-2 font-semibold ${health.textColor}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {health.text}
            </motion.span>
          </div>
          {statusCode && (
            <motion.div
              className="mt-2 text-xs text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Status Code: {statusCode}
            </motion.div>
          )}
        </motion.div>

        {/* Response Time */}
        <motion.div
          className="bg-gray-50 dark:bg-dark-light/50 rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Response Time
            </span>
          </div>
          <div className="flex items-center">
            <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <motion.div
                className={`absolute top-0 left-0 h-full ${responseIndicator.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, (responseTime || 0) / 10)}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              ></motion.div>
            </div>
            <motion.span
              className="ml-2 font-mono text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[60px] text-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {responseTime ? `${responseTime}ms` : "N/A"}
            </motion.span>
          </div>
          <motion.div
            className="mt-2 text-xs text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {responseIndicator.text}
          </motion.div>
        </motion.div>

        {/* Last Checked */}
        <motion.div
          className="bg-gray-50 dark:bg-dark-light/50 rounded-lg p-4 sm:col-span-2"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Last Checked
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <motion.span
              className="ml-2 font-semibold text-gray-700 dark:text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {formatTime(lastChecked)}
            </motion.span>
          </div>
        </motion.div>

        {/* Detailed View - only shown when expanded */}
        <AnimatePresence>
          {showDetailedView && (
            <>
              {/* Historical Uptime */}
              <motion.div
                className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 sm:col-span-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-3">
                  <Server className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Historical Uptime
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <motion.div
                    className="bg-white dark:bg-dark-lighter rounded p-2 text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      24 Hours
                    </div>
                    <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                      {uptimeData.day}%
                    </div>
                  </motion.div>
                  <motion.div
                    className="bg-white dark:bg-dark-lighter rounded p-2 text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      7 Days
                    </div>
                    <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                      {uptimeData.week}%
                    </div>
                  </motion.div>
                  <motion.div
                    className="bg-white dark:bg-dark-lighter rounded p-2 text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      30 Days
                    </div>
                    <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                      {uptimeData.month}%
                    </div>
                  </motion.div>
                  <motion.div
                    className="bg-white dark:bg-dark-lighter rounded p-2 text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      1 Year
                    </div>
                    <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                      {uptimeData.year}%
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Performance Metrics */}
              <motion.div
                className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 sm:col-span-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center mb-3">
                  <Activity className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Performance Metrics
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    className="bg-white dark:bg-dark-lighter rounded p-3"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Time to First Byte
                    </div>
                    <div className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400">
                      {Math.round(responseTime * 0.4)}ms
                    </div>
                  </motion.div>
                  <motion.div
                    className="bg-white dark:bg-dark-lighter rounded p-3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      DNS Lookup
                    </div>
                    <div className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400">
                      {Math.round(responseTime * 0.15)}ms
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SiteMetrics;
