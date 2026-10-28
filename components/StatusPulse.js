import React from "react";

/**
 * StatusPulse - A lightweight, 60fps GPU-composited visual status indicator.
 * Uses pure CSS animations to avoid JavaScript intervals and Framer Motion re-render lag.
 */
const StatusPulse = ({
  status = "operational",
  size = "medium",
  className = "",
  showLabel = false,
}) => {
  const statusConfig = {
    operational: {
      color: "bg-emerald-500",
      pingColor: "bg-emerald-400",
      label: "Operational",
      shouldPing: false,
    },
    degraded: {
      color: "bg-amber-500",
      pingColor: "bg-amber-400",
      label: "Degraded",
      shouldPing: true,
    },
    outage: {
      color: "bg-red-500",
      pingColor: "bg-red-400",
      label: "Outage",
      shouldPing: true,
    },
    maintenance: {
      color: "bg-indigo-500",
      pingColor: "bg-indigo-400",
      label: "Maintenance",
      shouldPing: false,
    },
    unknown: {
      color: "bg-slate-400 dark:bg-slate-500",
      pingColor: "bg-slate-400",
      label: "Unknown",
      shouldPing: false,
    },
  };

  const sizeConfig = {
    small: {
      dot: "h-2 w-2",
      ping: "h-2 w-2",
      labelText: "text-xs",
      spacing: "gap-1.5",
    },
    medium: {
      dot: "h-2.5 w-2.5",
      ping: "h-2.5 w-2.5",
      labelText: "text-sm",
      spacing: "gap-2",
    },
    large: {
      dot: "h-3.5 w-3.5",
      ping: "h-3.5 w-3.5",
      labelText: "text-base",
      spacing: "gap-2.5",
    },
  };

  const config = statusConfig[status] || statusConfig.unknown;
  const sizeClass = sizeConfig[size] || sizeConfig.medium;

  return (
    <span className={`inline-flex items-center ${sizeClass.spacing} ${className}`}>
      <span className="relative flex shrink-0 items-center justify-center">
        {config.shouldPing && (
          <span
            className={`absolute inline-flex ${sizeClass.ping} rounded-full ${config.pingColor} opacity-75 animate-ping`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${sizeClass.dot} ${config.color} ring-2 ring-white/60 dark:ring-slate-900/60 shadow-xs`}
        />
      </span>

      {showLabel && (
        <span className={`${sizeClass.labelText} text-[var(--text)] font-medium`}>
          {config.label}
        </span>
      )}
    </span>
  );
};

export default StatusPulse;
