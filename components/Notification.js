import React, { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Notification Component
 *
 * Displays status change notifications in a toast-like component
 */
const Notification = ({
  message,
  type = "info",
  duration = 5000,
  onDismiss,
  icon,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss();
    }, 300);
  }, [onDismiss]);

  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleDismiss]);

  if (!isVisible) return null;

  // Set notification styling based on type
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-50/90 dark:bg-emerald-950/60 backdrop-blur-xl",
          border: "border-emerald-300/60 dark:border-emerald-700/60",
          text: "text-emerald-800 dark:text-emerald-100",
          iconBg: "bg-emerald-100 dark:bg-emerald-900",
        };
      case "error":
        return {
          bg: "bg-red-50/90 dark:bg-red-950/60 backdrop-blur-xl",
          border: "border-red-300/60 dark:border-red-700/60",
          text: "text-red-800 dark:text-red-100",
          iconBg: "bg-red-100 dark:bg-red-900",
        };
      case "warning":
        return {
          bg: "bg-amber-50/90 dark:bg-amber-950/60 backdrop-blur-xl",
          border: "border-amber-300/60 dark:border-amber-700/60",
          text: "text-amber-800 dark:text-amber-100",
          iconBg: "bg-amber-100 dark:bg-amber-900",
        };
      case "info":
      default:
        return {
          bg: "bg-indigo-50/90 dark:bg-indigo-950/60 backdrop-blur-xl",
          border: "border-indigo-300/60 dark:border-indigo-700/60",
          text: "text-indigo-800 dark:text-indigo-100",
          iconBg: "bg-indigo-100 dark:bg-indigo-900",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: -12, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -12, x: 20 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    >
      <motion.div
        className={`${typeStyles.bg} ${typeStyles.border} border rounded-2xl shadow-card-hover p-4 flex items-start`}
        role="alert"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.02 }}
        layout
      >
        {icon && (
          <motion.div
            className={`flex-shrink-0 ${typeStyles.iconBg} p-2 rounded-full mr-3`}
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
        )}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className={`text-sm font-medium ${typeStyles.text}`}>{message}</p>
        </motion.div>
        <motion.button
          onClick={handleDismiss}
          className="ml-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none"
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

/**
 * NotificationProvider Component
 *
 * Manages multiple notifications in a stack
 */
export const NotificationProvider = ({ children }) => {
  // State to hold all notifications
  const [notifications, setNotifications] = useState([]);
  const notificationLimit = useRef(5); // Maximum number of notifications to show at once

  // Add a new notification
  const addNotification = (notification) => {
    const id = Date.now();
    setNotifications((prev) => {
      // If we already have the max number of notifications, remove the oldest one
      if (prev.length >= notificationLimit.current) {
        return [...prev.slice(1), { ...notification, id }];
      }
      return [...prev, { ...notification, id }];
    });
    return id;
  };

  // Remove a notification by id
  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  };

  const contextValue = {
    addNotification,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-3 flex flex-col items-end pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <div key={notification.id} className="pointer-events-auto">
              <Notification
                {...notification}
                onDismiss={() => removeNotification(notification.id)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

// Create a notification context
export const NotificationContext = React.createContext({
  addNotification: () => {},
  removeNotification: () => {},
});

// Custom hook to use notifications
export const useNotification = () => {
  const context = React.useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }

  return {
    notify: (message, options = {}) => {
      return context.addNotification({
        message,
        ...options,
      });
    },
    success: (message, options = {}) => {
      return context.addNotification({
        message,
        type: "success",
        duration: 5000,
        ...options,
      });
    },
    error: (message, options = {}) => {
      return context.addNotification({
        message,
        type: "error",
        duration: 10000, // Errors stay longer by default
        ...options,
      });
    },
    warning: (message, options = {}) => {
      return context.addNotification({
        message,
        type: "warning",
        duration: 7000, // Warnings stay a bit longer
        ...options,
      });
    },
    info: (message, options = {}) => {
      return context.addNotification({
        message,
        type: "info",
        duration: 5000,
        ...options,
      });
    },
    dismiss: (id) => {
      context.removeNotification(id);
    },
  };
};

export default Notification;
