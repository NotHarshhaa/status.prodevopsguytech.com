import React from "react";
import { useState, useEffect } from "react";
import { BarChart2, Menu, X, Activity, Globe2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSwitcher from "./ThemeSwitcher";

const Header = ({ toggleTheme, isDarkMode, overallStatus = "operational" }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle theme change from the ThemeSwitcher component
  const handleThemeChange = (isDark) => {
    toggleTheme(isDark);
  };

  // Handle scroll events to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobileMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        className={`glass-header sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-glass-lg" : "shadow-glass"
        } ${isMobileMenuOpen ? "h-screen md:h-auto" : ""}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <nav className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Title - More compact on mobile */}
            <Link href="/" className="flex items-center group">
              <motion.div 
                className="relative flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-glow transition-all duration-300">
                  <BarChart2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" strokeWidth={2} />
                </div>
                <motion.div 
                  className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full shadow-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div className="ml-2.5 sm:ml-3">
                <div className="flex items-center">
                  <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                    ProDevOpsGuy
                  </h1>
                  <div className="flex items-center ml-2 sm:ml-3">
                    <motion.div
                      className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="ml-1 text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
                      Live
                    </span>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Status Dashboard
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeSwitcher
                currentTheme={isDarkMode ? "dark" : "light"}
                onThemeChange={handleThemeChange}
              />
              <motion.div
                className={`flex items-center px-3 py-1.5 rounded-full ${
                  overallStatus === "operational" 
                    ? "bg-green-50 dark:bg-green-900/20" 
                    : overallStatus === "degraded"
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <Activity className={`h-4 w-4 mr-1.5 ${
                  overallStatus === "operational" 
                    ? "text-green-500 dark:text-green-400" 
                    : overallStatus === "degraded"
                    ? "text-yellow-500 dark:text-yellow-400"
                    : "text-red-500 dark:text-red-400"
                }`} />
                <span className={`text-xs font-medium ${
                  overallStatus === "operational" 
                    ? "text-green-600 dark:text-green-400" 
                    : overallStatus === "degraded"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {overallStatus === "operational" 
                    ? "All Systems Operational" 
                    : overallStatus === "degraded"
                    ? "Degraded Performance"
                    : "System Issues Detected"}
                </span>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 md:hidden">
              <ThemeSwitcher
                currentTheme={isDarkMode ? "dark" : "light"}
                onThemeChange={handleThemeChange}
              />
              <motion.button
                className="menu-button p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" strokeWidth={2} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={2} />
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="mobile-menu md:hidden fixed inset-x-0 top-14 bottom-0 glass-header z-40 overflow-y-auto border-t border-white/20 dark:border-gray-800/50 backdrop-blur-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-4 space-y-4">
                  <motion.div
                    className="flex items-center justify-center p-3 rounded-xl bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/30"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                  >
                    <Activity className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      All Systems Operational
                    </span>
                  </motion.div>
                  
                  <div className="pt-4 border-t border-white/20 dark:border-gray-700/50">
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Real-time monitoring and status updates
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>
    </>
  );
};

export default Header;
