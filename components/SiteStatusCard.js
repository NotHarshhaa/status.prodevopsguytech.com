import React from "react";
import Link from "next/link";
import { ExternalLink, BarChart2, Clock, Activity, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, cardHover, scaleUp } from "../lib/animations";
import StatusPulse from "./StatusPulse";

const SiteStatusCard = ({ site = {}, className = "", id }) => {
  const {
    id: siteId,
    name,
    description,
    url,
    icon,
    status,
    statusText,
    lastChecked,
    responseTime,
  } = site || {};

  const getStatusClasses = (status) => {
    switch (status) {
      case "operational":
        return {
          badge:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
          icon: "text-green-500",
          border: "border-green-200 dark:border-green-700",
          bgHover: "hover:bg-green-50 dark:hover:bg-green-900/10",
        };
      case "degraded":
        return {
          badge:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
          icon: "text-yellow-500",
          border: "border-yellow-200 dark:border-yellow-700",
          bgHover: "hover:bg-yellow-50 dark:hover:bg-yellow-900/10",
        };
      case "outage":
        return {
          badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
          icon: "text-red-500",
          border: "border-red-200 dark:border-red-700",
          bgHover: "hover:bg-red-50 dark:hover:bg-red-900/10",
        };
      default:
        return {
          badge:
            "bg-gray-100 text-gray-800 dark:bg-dark-light dark:text-gray-300",
          icon: "text-gray-500",
          border: "border-gray-200 dark:border-gray-700",
          bgHover: "hover:bg-gray-50 dark:hover:bg-dark-lighter/10",
        };
    }
  };

  const statusClasses = getStatusClasses(status);
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      id={id}
      className={`bg-white dark:bg-black rounded-lg shadow-sm p-5 sm:p-5 p-3 flex flex-col border-l-4 border border-gray-100 dark:border-gray-900 ${statusClasses.border} ${statusClasses.bgHover} ${className}`}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 10 }}
      whileHover="hover"
      whileTap="tap"
      variants={cardHover}
      layout
    >
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center">
          <motion.div
            className={`p-2 rounded-lg bg-gray-100 dark:bg-dark-light ${statusClasses.icon} mr-3 flex items-center justify-center`}
            variants={scaleUp}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {icon ? (
              <span className="text-lg">{icon}</span>
            ) : status === "operational" ? (
              <Activity className="h-5 w-5" strokeWidth={2.5} />
            ) : status === "degraded" ? (
              <Wifi className="h-5 w-5" strokeWidth={2.5} />
            ) : (
              <Wifi className="h-5 w-5" strokeWidth={2.5} off={true} />
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h3
              className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {name}
            </motion.h3>
            <motion.p
              className="text-xs sm:text-sm text-gray-500 dark:text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {description}
            </motion.p>
          </motion.div>
        </div>
        <motion.span
          className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusClasses.badge}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 15,
            delay: 0.3,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <StatusPulse status={status} size="small" />
          <span>{statusText}</span>
        </motion.span>
      </motion.div>

      <motion.div
        className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm gap-3 sm:gap-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <StatusPulse
            status={status}
            size="small"
            showLabel={true}
            className="mr-1"
          />
          <a
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center text-xs sm:text-sm"
            onClick={(e) => {
              if (!url) {
                e.preventDefault();
              }
            }}
          >
            <span>Visit Site</span>
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </a>
          <Link
            href={`/site/${siteId || site?.id || ""}`}
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center text-xs sm:text-sm"
          >
            <span>View Details</span>
            <BarChart2 className="h-3.5 w-3.5 ml-1" />
          </Link>
        </motion.div>
        <motion.div
          className="flex items-center space-x-2 sm:space-x-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-gray-500 dark:text-gray-500 flex items-center text-xs sm:text-sm">
            <Activity className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-1" />
            <span>{responseTime || "--"}ms</span>
          </span>
          <span className="text-gray-500 dark:text-gray-500 flex items-center text-xs sm:text-sm">
            <Clock className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-1" />
            <span>{lastChecked ? formatTime(lastChecked) : "--"}</span>
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default SiteStatusCard;
