import React from "react";
import { motion } from "framer-motion";
import { Activity, Zap, Shield } from "lucide-react";

const ModernLoader = ({ message = "Loading status data..." }) => {
  const iconVariants = {
    animate: {
      rotate: 360,
      scale: [1, 1.1, 1],
      transition: {
        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
        scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
      }
    }
  };

  const textVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const dotVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-[400px] space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Animated Icon */}
      <motion.div
        className="relative"
        variants={iconVariants}
        animate="animate"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Activity className="h-8 w-8 text-white" strokeWidth={2} />
        </div>
        
        {/* Floating dots */}
        <motion.div
          className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full"
          variants={dotVariants}
          animate="animate"
        />
        <motion.div
          className="absolute -bottom-2 -left-2 w-2 h-2 bg-yellow-500 rounded-full"
          variants={dotVariants}
          animate="animate"
          transition={{ delay: 0.2 }}
        />
        <motion.div
          className="absolute -top-1 -left-2 w-2 h-2 bg-red-500 rounded-full"
          variants={dotVariants}
          animate="animate"
          transition={{ delay: 0.4 }}
        />
      </motion.div>

      {/* Loading Text */}
      <motion.div
        className="text-center space-y-2"
        variants={textVariants}
        animate="animate"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {message}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fetching real-time status updates...
        </p>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Status Icons */}
      <div className="flex space-x-4">
        <motion.div
          className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Zap className="h-4 w-4" />
          <span>Real-time monitoring</span>
        </motion.div>
        <motion.div
          className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Shield className="h-4 w-4" />
          <span>Secure connection</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ModernLoader;
