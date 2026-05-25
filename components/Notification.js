import React, { useState, useEffect, useRef } from "react";
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

  // Handle automatic dismissal after duration
  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  // Handle dismiss with animation
  const handleDismiss = () => {
    setIsExiting(true);
    // Wait for exit animation to complete
    setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss();
    }, 300);
  };

  if (!isVisible) return null;

  // Set notification styling based on type
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-300 dark:border-green-800",
          text: "text-green-800 dark:text-green-100",
          iconBg: "bg-green-100 dark:bg-green-800",
        };
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-300 dark:border-red-800",
          text: "text-red-800 dark:text-red-100",
          iconBg: "bg-red-100 dark:bg-red-800",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-300 dark:border-yellow-800",
          text: "text-yellow-800 dark:text-yellow-100",
          iconBg: "bg-yellow-100 dark:bg-yellow-800",
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-300 dark:border-blue-800",
          text: "text-blue-800 dark:text-blue-100",
          iconBg: "bg-blue-100 dark:bg-blue-800",
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
        className={`${typeStyles.bg} ${typeStyles.border} border rounded-lg shadow-lg p-4 flex items-start`}
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
