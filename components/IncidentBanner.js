import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, XCircle, X, ChevronRight, Info } from "lucide-react";

const IncidentBanner = ({ sites = [] }) => {
  const [dismissed, setDismissed] = useState(false);

  // Find sites with issues
  const outages = sites.filter((s) => s.status === "outage");
  const degraded = sites.filter((s) => s.status === "degraded");

  const hasIssues = outages.length > 0 || degraded.length > 0;

  if (!hasIssues || dismissed) return null;

  const isOutage = outages.length > 0;
  const affectedSites = isOutage ? outages : degraded;
  const issueType = isOutage ? "outage" : "degraded performance";

  const bannerConfig = isOutage
    ? {
        bg: "bg-red-500 dark:bg-red-600",
        border: "border-red-600 dark:border-red-700",
        text: "text-white",
        icon: <XCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />,
        label: "Active Outage",
      }
    : {
        bg: "bg-amber-500 dark:bg-amber-600",
        border: "border-amber-600 dark:border-amber-700",
        text: "text-white",
        icon: (
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
        ),
        label: "Degraded Performance",
      };

  return (
    <AnimatePresence>
      <motion.div
        className={`${bannerConfig.bg} ${bannerConfig.border} border-b`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Pulsing indicator */}
              <div className="relative flex-shrink-0">
                <div className="h-2.5 w-2.5 bg-white rounded-full" />
                <motion.div
                  className="absolute inset-0 h-2.5 w-2.5 bg-white rounded-full"
                  animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>

              {bannerConfig.icon}

              <div className="min-w-0">
                <span className="font-semibold text-xs sm:text-sm text-white">
                  {bannerConfig.label}:{" "}
                </span>
                <span className="text-xs sm:text-sm text-white/90">
                  {affectedSites.length === 1
                    ? affectedSites[0].name
                    : `${affectedSites.length} sites experiencing ${issueType}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href="#site-status"
                className="hidden sm:flex items-center gap-1 text-xs text-white/90 hover:text-white font-medium transition-colors"
              >
                View Details
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncidentBanner;
