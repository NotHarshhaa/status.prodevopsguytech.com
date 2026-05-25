import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Bell, Menu, X } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import SubscribeModal from "./SubscribeModal";

const NAV = [
  { href: "/", label: "Status" },
  { href: "/incidents", label: "Incidents" },
  { href: "/uptime", label: "Uptime" },
];

export default function Header({ isDarkMode, onThemeToggle, overallStatus }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const statusDot =
    overallStatus === "outage"
      ? "bg-red-400"
      : overallStatus === "degraded"
        ? "bg-amber-300"
        : overallStatus === "maintenance"
          ? "bg-blue-300"
          : "bg-emerald-300";

  return (
    <>
      <SubscribeModal
        isOpen={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
      />

      <header className="status-header-bar sticky top-0 z-40">
        <div className="status-container-wide">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="h-8 w-8 rounded-md bg-[#0969da] dark:bg-[#238636] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">PD</span>
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#161b22] ${statusDot}`}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">ProDevOpsGuy</p>
                <p className="text-[11px] text-[var(--text-muted)] leading-none hidden sm:block">
                  System Status
                </p>
              </div>
            </Link>

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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSubscribeOpen(true)}
                className="status-btn-secondary hidden sm:inline-flex"
              >
                <Bell className="h-3.5 w-3.5" />
                Subscribe
              </button>
              <ThemeSwitcher
                currentTheme={isDarkMode ? "dark" : "light"}
                onThemeChange={onThemeToggle}
              />
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-[var(--text-muted)] hover:bg-[var(--page-bg)]"
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

          {menuOpen && (
            <nav className="md:hidden pb-3 border-t border-[var(--border)] pt-2 space-y-1">
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
              <button
                type="button"
                onClick={() => {
                  setSubscribeOpen(true);
                  setMenuOpen(false);
                }}
                className="w-full text-left status-nav-link flex items-center gap-2"
              >
                <Bell className="h-3.5 w-3.5" />
                Subscribe to updates
              </button>
            </nav>
          )}
        </div>
      </header>
    </>
  );
}
