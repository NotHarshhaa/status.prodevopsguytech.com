import React from "react";
import { RefreshCw, Clock } from "lucide-react";

const RefreshButton = ({
  onRefresh,
  lastUpdated,
  isRefreshing,
  className = "",
}) => {
  const handleRefresh = async () => {
    if (isRefreshing) return;

    try {
      await onRefresh();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Format time nicely
  const formatTime = (date) => {
    if (!date) return "Never";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`inline-flex items-center px-2.5 sm:px-4 py-1.5 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-lg shadow-sm text-white transition-all duration-200 ${
          isRefreshing
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        }`}
        aria-label="Refresh status data"
      >
        <RefreshCw
          className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
        <span className="hidden sm:inline ml-1.5">
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </span>
      </button>
      {lastUpdated && (
        <span className="hidden sm:flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
          <span>Last updated: {formatTime(lastUpdated)}</span>
        </span>
      )}
    </div>
  );
};

export default RefreshButton;
