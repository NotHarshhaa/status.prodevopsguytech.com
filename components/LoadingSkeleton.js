import React from "react";
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";

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
          className="status-card"
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center flex-1">
              {/* Icon skeleton */}
              <div className="w-10 h-10 skeleton rounded-xl mr-3" />
              
              <div className="flex-1 min-w-0">
                {/* Title skeleton */}
                <div className="h-5 skeleton rounded mb-2 w-3/4" />
                {/* Description skeleton */}
                <div className="h-4 skeleton rounded w-1/2" />
              </div>
            </div>
            
            {/* Status badge skeleton */}
            <div className="w-20 h-6 skeleton rounded-full" />
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="w-16 h-4 skeleton rounded" />
              <div className="w-20 h-4 skeleton rounded" />
            </div>
            <div className="flex space-x-4">
              <div className="w-12 h-4 skeleton rounded" />
              <div className="w-12 h-4 skeleton rounded" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
