import "../styles/globals.css";
import { NotificationProvider } from "../components/Notification";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toggleDarkMode, applyDarkModeClass } from "../lib/utils";

function readDarkModePreference() {
  if (typeof window === "undefined") return false;
  const savedPreference = localStorage.getItem("darkMode");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  return savedPreference === "true" || (!savedPreference && systemPrefersDark);
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  // Initialize to false on both server and client to avoid SSR hydration mismatch
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync with user's saved preference after hydration
  useEffect(() => {
    const shouldBeDark = readDarkModePreference();
    setIsDarkMode(shouldBeDark);
    applyDarkModeClass(shouldBeDark);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode === null) {
        setIsDarkMode(e.matches);
        applyDarkModeClass(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleThemeToggle = (nextMode) => {
    if (typeof nextMode === "boolean") {
      setIsDarkMode(nextMode);
      applyDarkModeClass(nextMode);
      localStorage.setItem("darkMode", nextMode ? "true" : "false");
    } else {
      setIsDarkMode((prev) => {
        return toggleDarkMode(prev);
      });
    }
  };

  return (
    <NotificationProvider>
      <Component
        key={router.route}
        {...pageProps}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
      />
    </NotificationProvider>
  );
}

export default MyApp;
