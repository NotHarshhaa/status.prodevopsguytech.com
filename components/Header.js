import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Bell,
  Menu,
  X,
  Activity,
  Search,
  Shield,
  FileSpreadsheet,
} from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import SubscribeModal from "./SubscribeModal";

const NAV = [
  { href: "/", label: "Status" },
  { href: "/incidents", label: "Incidents" },
  { href: "/uptime", label: "Uptime" },
];

export default function Header({
  isDarkMode,
  onThemeToggle,
  overallStatus,
  onOpenCommandPalette,
  onOpenBadgeStudio,
  onOpenSLAExport,
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  // Global keyboard shortcut for Command Palette
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenCommandPalette?.();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenCommandPalette]);

  const statusDot =
    overallStatus === "outage"
      ? "bg-red-400 shadow-red-400/60"
      : overallStatus === "degraded"
      ? "bg-amber-300 shadow-amber-300/60"
      : overallStatus === "maintenance"
      ? "bg-indigo-300 shadow-indigo-300/60"
      : "bg-emerald-300 shadow-emerald-300/60";

  return (
    <>
      <SubscribeModal
        isOpen={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />

      <header className="status-header-bar sticky top-0 z-40">
        <div className="status-container-wide">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 min-w-0 group">
              <div className="relative flex-shrink-0">
                <div className="status-logo">
                  <Activity
                    className="h-4 w-4 text-white relative z-10"
                    strokeWidth={2.5}
                  />
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#0a0e17] shadow-sm ${statusDot}`}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate group-hover:text-[var(--accent)] transition-colors">
                  ProDevOpsGuy
                </p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] leading-none hidden sm:block">
                  Mission Control
                </p>
              </div>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`status-nav-link ${
                    router.pathname === item.href
                      ? "status-nav-link-active"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions & Utilities */}
            <div className="flex items-center gap-2">
              {/* Command Palette Trigger Pill */}
              <button
                type="button"
                onClick={() => onOpenCommandPalette?.()}
                className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-all shadow-sm"
                title="Open Command Palette (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span className="hidden lg:inline text-[11px]">Commands</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-200/60 dark:bg-slate-800 border border-[var(--border)] leading-none">
                  Ctrl K
                </kbd>
              </button>

              {/* Badge Studio Trigger */}
              {onOpenBadgeStudio && (
                <button
                  type="button"
                  onClick={onOpenBadgeStudio}
                  className="hidden md:inline-flex items-center gap-1.5 status-btn-secondary text-xs py-1.5 px-2.5"
                  title="Generate SVG status badges"
                >
                  <Shield className="h-3.5 w-3.5 text-blue-400" />
                  <span>Badges</span>
                </button>
              )}

              {/* SLA Export Trigger */}
              {onOpenSLAExport && (
                <button
                  type="button"
                  onClick={onOpenSLAExport}
                  className="hidden xl:inline-flex items-center gap-1.5 status-btn-secondary text-xs py-1.5 px-2.5"
                  title="Export SLA availability report"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>SLA Report</span>
                </button>
              )}

              {/* Subscribe Modal Trigger */}
              <button
                type="button"
                onClick={() => setSubscribeOpen(true)}
                className="status-btn-primary hidden sm:inline-flex text-xs"
              >
                <Bell className="h-3.5 w-3.5" />
                <span>Subscribe</span>
              </button>

              {/* Theme Toggle */}
              <ThemeSwitcher
                currentTheme={isDarkMode ? "dark" : "light"}
                onThemeChange={onThemeToggle}
              />

              {/* Mobile menu toggle */}
              <button
                type="button"
                className="md:hidden p-2.5 rounded-xl text-[var(--text-muted)] hover:bg-[rgba(0,212,170,0.08)] transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <nav className="md:hidden pb-4 border-t border-[var(--border)] pt-3 space-y-1 animate-in fade-in duration-150">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block status-nav-link ${
                    router.pathname === item.href
                      ? "status-nav-link-active"
                      : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenCommandPalette?.();
                  }}
                  className="flex items-center gap-2 status-btn-secondary text-xs justify-center py-2"
                >
                  <Search className="h-3.5 w-3.5 text-[var(--accent)]" />
                  <span>Command Palette (Search)</span>
                </button>

                {onOpenBadgeStudio && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenBadgeStudio?.();
                    }}
                    className="flex items-center gap-2 status-btn-secondary text-xs justify-center py-2"
                  >
                    <Shield className="h-3.5 w-3.5 text-blue-400" />
                    <span>Status Badge Studio</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSubscribeOpen(true);
                  }}
                  className="status-btn-primary text-xs justify-center py-2"
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span>Subscribe to Alerts</span>
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
