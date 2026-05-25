import "../styles/globals.css";
import { NotificationProvider } from "../components/Notification";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toggleDarkMode } from "../lib/utils";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedPreference = localStorage.getItem("darkMode");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldBeDark =
      savedPreference === "true" ||
      (!savedPreference && systemPrefersDark);
    setIsDarkMode(shouldBeDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode === null) {
        setIsDarkMode(e.matches);
        document.documentElement.classList.toggle("dark", e.matches);
        document.documentElement.classList.toggle("light", !e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleThemeToggle = (nextMode) => {
    if (typeof nextMode === "boolean") {
      setIsDarkMode(nextMode);
      document.documentElement.classList.toggle("dark", nextMode);
      document.documentElement.classList.toggle("light", !nextMode);
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
