import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Search,
  Activity,
  Calendar,
  FileText,
  RefreshCw,
  Sun,
  Moon,
  ExternalLink,
  Shield,
  Download,
  Bell,
  Check,
  ChevronRight,
  Terminal,
} from "lucide-react";
import { COMPONENT_STATUS } from "../lib/statusTheme";

export default function CommandPalette({
  isOpen,
  onClose,
  sites = [],
  onRefresh,
  onThemeToggle,
  isDarkMode = false,
  onOpenBadgeStudio,
  onOpenSLAExport,
  onOpenSubscribe,
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build items list
  const actions = useMemo(() => {
    return [
      {
        id: "nav-home",
        category: "Navigation",
        title: "Status Overview",
        subtitle: "Main system health and service overview",
        icon: Activity,
        perform: () => router.push("/"),
      },
      {
        id: "nav-uptime",
        category: "Navigation",
        title: "90-Day Uptime Telemetry",
        subtitle: "SLA metrics, heatmap, and historical availability",
        icon: FileText,
        perform: () => router.push("/uptime"),
      },
      {
        id: "nav-incidents",
        category: "Navigation",
        title: "Incidents & Postmortems",
        subtitle: "Active outages, incident history, and resolution notes",
        icon: Calendar,
        perform: () => router.push("/incidents"),
      },
      {
        id: "act-refresh",
        category: "Quick Actions",
        title: "Force Refresh Status",
        subtitle: "Trigger immediate live health probe across all endpoints",
        icon: RefreshCw,
        shortcut: "R",
        perform: () => {
          onRefresh?.();
        },
      },
      {
        id: "act-theme",
        category: "Quick Actions",
        title: isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme",
        subtitle: "Toggle visual color mode",
        icon: isDarkMode ? Sun : Moon,
        shortcut: "T",
        perform: () => {
          onThemeToggle?.();
        },
      },
      {
        id: "act-badge",
        category: "Tools & Integrations",
        title: "Status Badge Studio",
        subtitle: "Generate dynamic SVG badges for GitHub READMEs & docs",
        icon: Shield,
        shortcut: "B",
        perform: () => {
          onOpenBadgeStudio?.();
        },
      },
      {
        id: "act-export",
        category: "Tools & Integrations",
        title: "Export SLA & Audit Report",
        subtitle: "Download CSV, JSON, or executive audit summary",
        icon: Download,
        shortcut: "E",
        perform: () => {
          onOpenSLAExport?.();
        },
      },
      {
        id: "act-subscribe",
        category: "Tools & Integrations",
        title: "Notification Webhooks & Alerts",
        subtitle: "Configure Discord, Slack, email & RSS notifications",
        icon: Bell,
        shortcut: "S",
        perform: () => {
          onOpenSubscribe?.();
        },
      },
    ];
  }, [router, onRefresh, onThemeToggle, isDarkMode, onOpenBadgeStudio, onOpenSLAExport, onOpenSubscribe]);

  // Service items
  const serviceItems = useMemo(() => {
    return sites.map((site) => ({
      id: `site-${site.id}`,
      category: "Services",
      title: site.name,
      subtitle: `${site.url} • ${site.status} ${
        site.responseTime ? `• ${site.responseTime}ms` : ""
      }`,
      icon: Terminal,
      status: site.status,
      responseTime: site.responseTime,
      siteUrl: site.url,
      perform: () => router.push(`/site/${site.id}`),
    }));
  }, [sites, router]);

  // Filtered items based on query
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return [...actions, ...serviceItems];
    }
    return [...actions, ...serviceItems].filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, actions, serviceItems]);

  // Keyboard navigation inside modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].perform();
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Command Palette Modal */}
      <div
        className="relative w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)] bg-[var(--surface)]">
          <Search className="h-5 w-5 text-[var(--accent)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search services..."
            className="w-full bg-transparent text-sm placeholder:text-[var(--text-muted)] focus:outline-none text-[var(--text)]"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-[var(--text-muted)] bg-slate-200/50 dark:bg-slate-800/80 rounded border border-[var(--border)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-[var(--border)]">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-muted)]">
              No matching commands or services found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="py-1">
              {filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const IconComponent = item.icon;
                const statusCfg = item.status ? COMPONENT_STATUS[item.status] : null;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      item.perform();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[rgba(0,212,170,0.12)] text-[var(--accent)] shadow-sm"
                        : "text-[var(--text)] hover:bg-slate-100/60 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected
                            ? "bg-[var(--accent)] text-slate-950"
                            : "bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]"
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{item.title}</span>
                          {statusCfg && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                                item.status === "operational"
                                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                  : item.status === "degraded"
                                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                  : "bg-red-500/10 text-red-500 border border-red-500/20"
                              }`}
                            >
                              {statusCfg.label}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {item.shortcut && (
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-200/50 dark:bg-slate-800/80 border border-[var(--border)] text-[var(--text-muted)]">
                          {item.shortcut}
                        </kbd>
                      )}
                      <ChevronRight
                        className={`h-4 w-4 text-[var(--text-muted)] transition-transform ${
                          isSelected ? "translate-x-0.5 text-[var(--accent)]" : "opacity-40"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-[var(--surface)] border-t border-[var(--border)] text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 border border-[var(--border)]">
                ↑
              </kbd>{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 border border-[var(--border)]">
                ↓
              </kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 border border-[var(--border)]">
                ↵
              </kbd>{" "}
              select
            </span>
          </div>
          <span>ProDevOpsGuy Command Palette</span>
        </div>
      </div>
    </div>
  );
}
