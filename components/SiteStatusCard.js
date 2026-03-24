import React from "react";
import Link from "next/link";
import {
  ExternalLink,
  BarChart2,
  Clock,
  Activity,
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
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import StatusPulse from "./StatusPulse";

// Icon mapping
const ICON_MAP = {
  main: Rocket,
  projects: Monitor,
  docs: BookOpen,
  repos: Package,
  jobs: Compass,
  blog: Newspaper,
  cloud: Cloud,
  docker2k8s: Container,
  devopslab: FlaskConical,
  toolguides: Wrench,
  cheatsheet: FileText,
  monitoring: BarChart3,
  interviews: FileText,
  devopstools: Wrench,
  awesomeui: Monitor,
  resources: BookOpen,
};

const getSiteIcon = (siteId) => ICON_MAP[siteId] || Activity;

const getStatusClasses = (status) => {
  switch (status) {
    case "operational":
      return {
        badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        icon: "text-green-500",
        border: "border-green-200 dark:border-green-700/60",
        bgHover: "hover:bg-green-50/50 dark:hover:bg-green-900/10",
        accent: "bg-green-500",
      };
    case "degraded":
      return {
        badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        icon: "text-yellow-500",
        border: "border-yellow-200 dark:border-yellow-700/60",
        bgHover: "hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10",
        accent: "bg-yellow-500",
      };
    case "outage":
      return {
        badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        icon: "text-red-500",
        border: "border-red-200 dark:border-red-700/60",
        bgHover: "hover:bg-red-50/50 dark:hover:bg-red-900/10",
        accent: "bg-red-500",
      };
    default:
      return {
        badge: "bg-gray-100 text-gray-800 dark:bg-dark-light dark:text-gray-300",
        icon: "text-gray-500",
        border: "border-gray-200 dark:border-gray-700",
        bgHover: "hover:bg-gray-50 dark:hover:bg-dark-lighter/10",
        accent: "bg-gray-400",
      };
  }
};

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const SiteStatusCard = ({ site = {}, className = "", id }) => {
  const {
    id: siteId,
    name,
    description,
    url,
    status,
    statusText,
    lastChecked,
    responseTime,
  } = site || {};

  const sc = getStatusClasses(status);
  const IconComponent = getSiteIcon(siteId);

  return (
    <motion.div
      id={id}
      className={`status-card ${sc.border} ${sc.bgHover} ${className}`}
      // Single card-level animation only — no nested motion elements
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      layout
    >
      {/* Left accent bar */}
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {/* Icon container — plain div, CSS hover */}
          <div
            className={`p-2 rounded-xl bg-white/80 dark:bg-black/30 ${sc.icon} mr-3 flex items-center justify-center shadow-sm border border-gray-200/50 dark:border-gray-800/50 transition-transform duration-150 hover:scale-110`}
          >
            <IconComponent className="h-5 w-5" strokeWidth={2} />
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              {name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-500 mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* Status badge — plain span, CSS only */}
        <span
          className={`status-badge ${sc.badge} flex items-center space-x-1 flex-shrink-0 ml-2`}
        >
          <StatusPulse status={status} size="small" />
          <span>{statusText}</span>
        </span>
      </div>

      {/* Bottom row */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm gap-2 sm:gap-0">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <StatusPulse status={status} size="small" showLabel />
          <a
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center transition-colors"
            onClick={(e) => !url && e.preventDefault()}
          >
            <span>Visit Site</span>
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </a>
          <Link
            href={`/site/${siteId || ""}`}
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center transition-colors"
          >
            <span>View Details</span>
            <BarChart2 className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

        <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-500">
          <span className="flex items-center">
            <Activity className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-1" />
            <span>{responseTime || "--"}ms</span>
          </span>
          <span className="flex items-center">
            <Clock className="h-3 sm:h-3.5 w-3 sm:w-3.5 mr-1" />
            <span>{lastChecked ? formatTime(lastChecked) : "--"}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SiteStatusCard;
