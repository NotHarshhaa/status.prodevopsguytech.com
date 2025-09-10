import React from "react";
import { motion } from "framer-motion";

const LoadingSkeleton = ({ count = 6 }) => {
  const shimmerVariants = {
    initial: { opacity: 0.6 },
    animate: { 
      opacity: [0.6, 1, 0.6],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className="bg-white dark:bg-black rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-900"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center flex-1">
              {/* Icon skeleton */}
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mr-3 animate-pulse" />
              
              <div className="flex-1 min-w-0">
                {/* Title skeleton */}
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4 animate-pulse" />
                {/* Description skeleton */}
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
              </div>
            </div>
            
            {/* Status badge skeleton */}
            <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="flex space-x-4">
              <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
