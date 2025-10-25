import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * StatusPulse - A visual indicator that shows real-time status updates
 *
 * This component creates a pulsing indicator with dynamic animation based on status
 */
const StatusPulse = ({ status = "operational", size = "medium", className = "", showLabel = false }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  // Status configurations
  const statusConfig = {
    operational: {
      color: "bg-green-500",
      pulseColor: "bg-green-400/30",
      shadowColor: "shadow-green-500/50",
      label: "Operational",
      pulseInterval: 2,
      glowColor: "shadow-green-500/75",
    },
    degraded: {
      color: "bg-yellow-500",
      pulseColor: "bg-yellow-400/30",
      shadowColor: "shadow-yellow-500/50",
      label: "Degraded",
      pulseInterval: 1.2,
      glowColor: "shadow-yellow-500/75",
    },
    outage: {
      color: "bg-red-500",
      pulseColor: "bg-red-400/30",
      shadowColor: "shadow-red-500/50",
      label: "Outage",
      pulseInterval: 0.8,
      glowColor: "shadow-red-500/75",
    },
    maintenance: {
      color: "bg-blue-500",
      pulseColor: "bg-blue-400/30",
      shadowColor: "shadow-blue-500/50",
      label: "Maintenance",
      pulseInterval: 1.5,
      glowColor: "shadow-blue-500/75",
    },
    unknown: {
      color: "bg-gray-500",
      pulseColor: "bg-gray-400/30",
      shadowColor: "shadow-gray-500/50",
      label: "Unknown",
      pulseInterval: 3,
      glowColor: "shadow-gray-500/75",
    },
  };

  // Size configurations
  const sizeConfig = {
    small: {
      dot: "h-2 w-2",
      pulse: "h-2 w-2",
      pulseMax: "h-6 w-6",
      labelText: "text-xs",
      spacing: "gap-1.5",
    },
    medium: {
      dot: "h-3 w-3",
      pulse: "h-3 w-3",
      pulseMax: "h-9 w-9",
      labelText: "text-sm",
      spacing: "gap-2",
    },
    large: {
      dot: "h-4 w-4",
      pulse: "h-4 w-4",
      pulseMax: "h-12 w-12",
      labelText: "text-base",
      spacing: "gap-2.5",
    },
  };

  // Get configuration based on current status and size
  const config = statusConfig[status] || statusConfig.unknown;
  const sizeClass = sizeConfig[size] || sizeConfig.medium;

  // Effect to restart animation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(false);
      setTimeout(() => setIsAnimating(true), 10);
    }, config.pulseInterval * 3000);

    return () => clearInterval(interval);
  }, [config.pulseInterval]);

  return (
    <div className={`flex items-center ${sizeClass.spacing} ${className}`}>
      <div className="relative">
        {/* Static Dot */}
        <motion.div
          className={`${config.color} ${sizeClass.dot} rounded-full ${config.shadowColor} shadow-lg z-10 relative ring-2 ring-white/20 dark:ring-black/20 backdrop-blur-sm`}
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1, 0.8] }}
          transition={{
            duration: config.pulseInterval,
            repeat: Infinity,
            repeatType: "loop",
          }}
          whileHover={{ scale: 1.2 }}
        />

        {/* Pulse Animation */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              className={`${config.pulseColor} ${sizeClass.pulse} rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`}
              initial={{ width: sizeClass.dot, height: sizeClass.dot, opacity: 0.8 }}
              animate={{ width: sizeClass.pulseMax, height: sizeClass.pulseMax, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: config.pulseInterval,
                repeat: 2,
                repeatType: "loop",
                ease: "easeOut",
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Optional Label */}
      {showLabel && (
        <motion.span
          className={`${sizeClass.labelText} text-gray-700 dark:text-gray-300 font-medium`}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {config.label}
        </motion.span>
      )}
    </div>
  );
};

export default StatusPulse;
