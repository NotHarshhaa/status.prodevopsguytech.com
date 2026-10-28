import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, XCircle, X, ChevronRight } from "lucide-react";

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
        bg: "bg-red-50 dark:bg-red-950/40",
        border: "border-red-200 dark:border-red-800/60",
        text: "text-red-900 dark:text-red-100",
        icon: (
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 animate-pulse" />
        ),
        label: "Active Outage",
        badgeBg: "bg-red-600 text-white",
        dotBg: "bg-red-500",
      }
    : {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-200 dark:border-amber-800/60",
        text: "text-amber-900 dark:text-amber-100",
        icon: (
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 animate-pulse" />
        ),
        label: "Degraded Performance",
        badgeBg: "bg-amber-500 text-white",
        dotBg: "bg-amber-500",
      };

  return (
    <AnimatePresence>
      <motion.div
        className={`rounded-2xl border ${bannerConfig.bg} ${bannerConfig.border} p-4 sm:p-4.5 shadow-sm transition-all`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Pulsing indicator */}
            <div className="relative flex-shrink-0">
              <div className={`h-2.5 w-2.5 ${bannerConfig.dotBg} rounded-full`} />
              <motion.div
                className={`absolute inset-0 h-2.5 w-2.5 ${bannerConfig.dotBg} rounded-full`}
                animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>

            {bannerConfig.icon}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${bannerConfig.badgeBg}`}
                >
                  {bannerConfig.label}
                </span>
                <span className={`text-xs sm:text-sm font-semibold truncate ${bannerConfig.text}`}>
                  {affectedSites.length === 1
                    ? `${affectedSites[0].name} is experiencing ${issueType}`
                    : `${affectedSites.length} services currently experiencing ${issueType}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="#components"
              className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold hover:underline ${
                isOutage ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"
              }`}
            >
              <span>Inspect</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncidentBanner;
