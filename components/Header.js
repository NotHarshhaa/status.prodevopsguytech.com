import React from "react";
import { useState, useEffect } from "react";
import {
  BarChart2,
  Menu,
  X,
  Activity,
  Bell,
  Clock,
  AlertCircle,
  Home,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import ThemeSwitcher from "./ThemeSwitcher";
import SubscribeModal, { SubscribeButton } from "./SubscribeModal";

const NavLink = ({ href, icon: Icon, label, active }) => (
  <Link
    href={href}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
    }`}
  >
    <Icon className="h-3.5 w-3.5" />
    <span>{label}</span>
  </Link>
);

const Header = ({
  toggleTheme,
  isDarkMode,
  overallStatus = "operational",
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const router = useRouter();

  const handleThemeChange = (isDark) => {
    toggleTheme(isDark);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMobileMenuOpen &&
        !e.target.closest(".mobile-menu") &&
        !e.target.closest(".menu-button")
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/incidents", icon: AlertCircle, label: "Incidents" },
    { href: "/uptime", icon: Clock, label: "Uptime" },
  ];

  const statusBadge = {
    operational: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      dot: "bg-green-500",
      label: "All Systems Operational",
    },
    degraded: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-600 dark:text-yellow-400",
      dot: "bg-yellow-500",
      label: "Degraded Performance",
    },
    outage: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
      dot: "bg-red-500",
      label: "System Issues Detected",
    },
  };

  const badge = statusBadge[overallStatus] || statusBadge.operational;

  return (
    <>
      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
      />

      <motion.header
        className={`glass-header sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? "shadow-glass-lg" : "shadow-glass"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <nav className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <motion.div
                className="relative flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-glow transition-all duration-300">
                  <BarChart2
                    className="h-4 w-4 sm:h-5 sm:w-5 text-white"
                    strokeWidth={2}
                  />
                </div>
                <motion.div
                  className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full shadow-lg ${badge.dot}`}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div className="ml-2.5 sm:ml-3">
                <div className="flex items-center">
                  <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    ProDevOpsGuy
                  </h1>
                  <div className="flex items-center ml-2 sm:ml-2.5">
                    <motion.div
                      className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${badge.dot}`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="ml-1 text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
                      Live
                    </span>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block leading-none">
                  Status Dashboard
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  {...link}
                  active={router.pathname === link.href}
                />
              ))}
            </div>

            {/* Right side controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Status badge */}
              <motion.div
                className={`flex items-center px-2.5 py-1.5 rounded-full ${badge.bg}`}
                whileHover={{ scale: 1.03 }}
              >
                <Activity className={`h-3.5 w-3.5 mr-1.5 ${badge.text}`} />
                <span className={`text-xs font-medium ${badge.text}`}>
                  {badge.label}
                </span>
              </motion.div>

              <SubscribeButton onClick={() => setIsSubscribeOpen(true)} />

              <ThemeSwitcher
                currentTheme={isDarkMode ? "dark" : "light"}
                onThemeChange={handleThemeChange}
              />
            </div>

            {/* Mobile controls */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                onClick={() => setIsSubscribeOpen(true)}
                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Subscribe to updates"
              >
                <Bell className="h-4 w-4" />
              </button>
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
                className="mobile-menu md:hidden border-t border-gray-200/50 dark:border-gray-700/50"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="py-3 space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        router.pathname === link.href
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}

                  <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50 mt-2">
                    <motion.div
                      className={`flex items-center px-3 py-2 rounded-lg ${badge.bg}`}
                    >
                      <Activity className={`h-4 w-4 mr-2 ${badge.text}`} />
                      <span className={`text-sm font-medium ${badge.text}`}>
                        {badge.label}
                      </span>
                    </motion.div>
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
