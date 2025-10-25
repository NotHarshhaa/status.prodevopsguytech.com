import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Check } from "lucide-react";

/**
 * Status filter component that allows filtering sites by their operational status
 * @param {Object} props - Component props
 * @param {Function} props.onFilterChange - Callback function when filters change
 * @returns {JSX.Element} - Rendered component
 */
export default function StatusFilter({ onFilterChange }) {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Status options available for filtering
  const statusOptions = [
    { value: "operational", label: "Operational", color: "status-green" },
    { value: "degraded", label: "Degraded", color: "status-yellow" },
    { value: "outage", label: "Outage", color: "status-red" },
    { value: "maintenance", label: "Maintenance", color: "status-blue" },
    { value: "unknown", label: "Unknown", color: "status-gray" },
  ];

  // Toggle a status filter
  const toggleFilter = (status) => {
    let newFilters;

    if (selectedFilters.includes(status)) {
      // Remove the status if it's already selected
      newFilters = selectedFilters.filter((f) => f !== status);
    } else {
      // Add the status if it's not already selected
      newFilters = [...selectedFilters, status];
    }

    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Clear all selected filters
  const clearFilters = () => {
    setSelectedFilters([]);
    onFilterChange([]);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col">
      <div className="relative z-10" ref={dropdownRef}>
        <motion.div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 relative custom-scrollbar">
          <motion.button
            className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-lighter border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm transition-all duration-200 ${
              isOpen
                ? "ring-2 ring-blue-500 border-transparent"
                : "hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            style={{ zIndex: 20 }}
            type="button"
            id="status-filter-button"
            aria-expanded={isOpen}
            aria-haspopup="true"
            onClick={toggleDropdown}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {selectedFilters.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-500 rounded-full"
              >
                {selectedFilters.length}
              </motion.span>
            )}
          </motion.button>

          {selectedFilters.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-1.5 sm:gap-2 max-w-full sm:max-w-none overflow-x-auto pb-1 custom-scrollbar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {selectedFilters.map((filter) => {
                const option = statusOptions.find(
                  (opt) => opt.value === filter,
                );
                return (
                  <motion.span
                    key={filter}
                    className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 whitespace-nowrap"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {option.label}
                    <button
                      onClick={() => toggleFilter(filter)}
                      className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="filter-dropdown absolute right-0 left-0 sm:left-auto sm:right-0 top-12 sm:top-auto z-[100] mt-2 w-full sm:w-64 origin-top-right rounded-lg focus:outline-none overflow-hidden"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="status-filter-button"
            >
              <div className="p-2 space-y-1 custom-scrollbar" role="none">
                {statusOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    className={`filter-item ${
                      selectedFilters.includes(option.value)
                        ? "filter-item-selected"
                        : "filter-item-normal"
                    }`}
                    role="menuitem"
                    onClick={() => toggleFilter(option.value)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.span
                      className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full ${
                        selectedFilters.includes(option.value)
                          ? "bg-blue-100 dark:bg-blue-900"
                          : "bg-gray-100 dark:bg-dark-light"
                      }`}
                    >
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${
                          option.color === "status-green"
                            ? "bg-green-500"
                            : option.color === "status-yellow"
                              ? "bg-yellow-500"
                              : option.color === "status-red"
                                ? "bg-red-500"
                                : option.color === "status-blue"
                                  ? "bg-blue-500"
                                  : "bg-gray-500"
                        }`}
                      />
                    </motion.span>
                    {option.label}
                    {selectedFilters.includes(option.value) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}

                {selectedFilters.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-600"
                  >
                    <motion.button
                      className="flex w-full items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                      role="menuitem"
                      onClick={clearFilters}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear filters
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
