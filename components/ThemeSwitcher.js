import { Sun, Moon } from "lucide-react";

export default function ThemeSwitcher({ currentTheme, onThemeChange }) {
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => onThemeChange?.(!isDark)}
      className="status-btn-secondary p-2"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
