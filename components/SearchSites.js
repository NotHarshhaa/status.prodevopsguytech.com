import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";

/**
 * SearchSites Component
 *
 * A dynamic search component for finding sites by name or description
 * with keyboard navigation support and smooth animations
 */
const SearchSites = ({ sites = [], onResultSelect, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Open/close the search panel
  const toggleSearch = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
    }
  };

  // Handle input changes
  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    // Search logic
    const searchResults = sites.filter(site => {
      const matchName = site.name.toLowerCase().includes(value.toLowerCase());
      const matchDescription = site.description?.toLowerCase().includes(value.toLowerCase());
      return matchName || matchDescription;
    });

    setResults(searchResults);
    setActiveIndex(0); // Reset active index when results change
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (results.length === 0) return;

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prevIndex =>
        prevIndex < results.length - 1 ? prevIndex + 1 : prevIndex
      );
    }

    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prevIndex =>
        prevIndex > 0 ? prevIndex - 1 : 0
      );
    }

    // Enter to select
    else if (e.key === "Enter" && results.length > 0) {
      selectResult(results[activeIndex]);
    }

    // Escape to close
    else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const activeElement = resultsRef.current.children[activeIndex];
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeIndex, results.length]);

  // Handle result selection
  const selectResult = (site) => {
    if (onResultSelect) {
      onResultSelect(site);
    }
    setIsOpen(false);
    setQuery("");
  };

  // Close search panel when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (!e.target.closest('.search-sites')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Highlight matching text in search results
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => (
      regex.test(part) ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-900 text-black dark:text-yellow-100 px-0.5 rounded">{part}</mark> : part
    ));
  };

  return (
    <div className={`search-sites relative ${className}`}>
      <motion.button
        onClick={toggleSearch}
        className="flex items-center gap-2 bg-white dark:bg-dark-lighter border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors min-w-[32px] sm:min-w-[auto] justify-center sm:justify-start"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-expanded={isOpen}
        aria-label="Search sites"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search Sites</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/20 dark:bg-black/50 cursor-pointer"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-full max-w-2xl bg-white dark:bg-dark-lighter rounded-lg shadow-xl overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -50, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <div className="relative">
                <div className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
                  <Search className="h-5 w-5 text-gray-500 dark:text-gray-500" />
                  <input
                    ref={inputRef}
                    type="text"
                    className="w-full py-4 px-3 text-gray-700 dark:text-gray-200 bg-transparent border-none focus:ring-0 focus:outline-none"
                    placeholder="Search sites by name or description..."
                    value={query}
                    onChange={handleQueryChange}
                    onKeyDown={handleKeyDown}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto py-2" ref={resultsRef}>
                  {results.length > 0 ? (
                    results.map((site, index) => (
                      <motion.button
                        key={site.id}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${
                          index === activeIndex ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        }`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => selectResult(site)}
                        onMouseEnter={() => setActiveIndex(index)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {highlightMatch(site.name, query)}
                            </div>
                            {site.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                                {highlightMatch(site.description, query)}
                              </div>
                            )}
                          </div>
                          <div className={`flex items-center px-2 py-1 rounded text-xs font-medium
                            ${site.status === "operational"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : site.status === "degraded"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                            }`}>
                            {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </div>
                        </div>
                      </motion.button>
                    ))
                  ) : query.length > 1 ? (
                    <div className="px-4 py-6 text-center">
                      <div className="text-gray-500 dark:text-gray-400">No matching sites found</div>
                      <div className="text-sm text-gray-600 dark:text-gray-500 mt-1">Try different keywords</div>
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="text-gray-600 dark:text-gray-400">Type at least 2 characters to search</div>
                      <div className="text-sm text-gray-600 dark:text-gray-500 mt-1">Search by site name or description</div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-dark-light/50 px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div>
                      {results.length > 0 && `${results.length} result${results.length !== 1 ? 's' : ''} found`}
                    </div>
                    <div className="flex space-x-4">
                      <span>↑↓ to navigate</span>
                      <span>↵ to select</span>
                      <span>ESC to close</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchSites;
