import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeSwitcher Component
 *
 * A simple theme switcher that toggles between light and dark mode
 */
const ThemeSwitcher = ({ currentTheme, onThemeChange }) => {
  const isDark = currentTheme === "dark";

  const toggleTheme = () => {
    if (onThemeChange) {
      onThemeChange(!isDark);
    }
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`p-2 rounded-xl backdrop-blur-sm border transition-all duration-300 focus-ring ${
        isDark
          ? "bg-white/10 text-yellow-300 hover:bg-white/20 border-white/20"
          : "bg-black/10 text-gray-700 hover:bg-black/20 border-black/20"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </motion.button>
  );
};

export default ThemeSwitcher;
