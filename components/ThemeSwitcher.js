import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeSwitcher({ currentTheme, onThemeChange }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => onThemeChange?.(!isDark)}
      className="status-btn-secondary p-2.5 relative overflow-hidden group"
      aria-label={mounted && isDark ? "Switch to light mode" : "Switch to dark mode"}
      suppressHydrationWarning
    >
      <span className="relative z-10 block transition-transform duration-300 group-hover:rotate-12">
        {mounted ? (
          isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-500" />
          )
        ) : (
          <span className="inline-block h-4 w-4" />
        )}
      </span>
    </button>
  );
}
