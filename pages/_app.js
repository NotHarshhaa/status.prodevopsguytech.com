import "../styles/globals.css";
import { NotificationProvider } from "../components/Notification";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toggleDarkMode } from "../lib/utils";

function readDarkModePreference() {
  if (typeof window === "undefined") return false;
  const savedPreference = localStorage.getItem("darkMode");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;
  return savedPreference === "true" || (!savedPreference && systemPrefersDark);
}

function applyDarkModeClass(isDark) {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const shouldBeDark = readDarkModePreference();
    if (typeof window !== "undefined") {
      applyDarkModeClass(shouldBeDark);
    }
    return shouldBeDark;
  });

  useEffect(() => {
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
      setIsDarkMode((prev) => toggleDarkMode(prev));
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
