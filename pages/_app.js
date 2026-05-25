import "../styles/globals.css";
import { NotificationProvider } from "../components/Notification";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { toggleDarkMode } from "../lib/utils";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme state from localStorage or system preference
  useEffect(() => {
    const savedPreference = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedPreference === 'true' || (!savedPreference && systemPrefersDark);
    setIsDarkMode(shouldBeDark);
    
    // Set initial theme classes
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode === null) {
        setIsDarkMode(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle route change events for page transitions
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setPageTransitioning(true);
    };

    const handleRouteChangeComplete = () => {
      setPageTransitioning(false);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router]);

  const handleThemeToggle = (nextMode) => {
    if (typeof nextMode === "boolean") {
      setIsDarkMode(nextMode);
      if (nextMode) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
      localStorage.setItem("darkMode", nextMode ? "true" : "false");
    } else {
      setIsDarkMode((prev) => toggleDarkMode(prev));
    }
  };

  return (
    <NotificationProvider>
      <div className="page-transition-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={router.route}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="page-content"
          >
            <Component
              {...pageProps}
              isDarkMode={isDarkMode}
              onThemeToggle={handleThemeToggle}
            />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {pageTransitioning && (
            <motion.div
              className="fixed inset-0 bg-blue-500/10 z-50 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </div>
    </NotificationProvider>
  );
}

export default MyApp;
