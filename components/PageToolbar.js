import { RefreshCw, Clock, Radio, Shield, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import { formatRelativeTime } from "../lib/statusTheme";
import ModernLoader from "./ModernLoader";
import LiveAutoRefresh from "./LiveAutoRefresh";

export default function PageToolbar({
  lastUpdated,
  isRefreshing,
  onRefresh,
  source,
  search,
  onSearchChange,
  searchPlaceholder = "Search services...",
  onOpenBadgeStudio,
  onOpenSLAExport,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      {/* Left Metadata */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
        {lastUpdated && (
          <span className="inline-flex items-center gap-1.5 font-mono" suppressHydrationWarning>
            <Clock className="h-3.5 w-3.5 text-[var(--accent)]" />
            Updated {formatRelativeTime(lastUpdated)}
          </span>
        )}
        {source && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[var(--border)] font-mono text-[10px] uppercase tracking-wider bg-[var(--surface)]">
            <Radio
              className={`h-3 w-3 ${
                source !== "static" ? "text-emerald-500 animate-pulse" : "text-amber-500"
              }`}
            />
            {source === "static" ? "CDN Cached" : "Live Edge Probe"}
          </span>
        )}
      </div>

      {/* Right Controls & Search */}
      <div className="flex flex-wrap items-center gap-2">
        {onSearchChange && (
          <div className="relative">
            <input
              type="search"
              value={search || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="status-input py-1.5 px-3 text-xs max-w-xs"
            />
          </div>
        )}

        {/* Badge Studio Trigger */}
        {onOpenBadgeStudio && (
          <button
            type="button"
            onClick={onOpenBadgeStudio}
            className="status-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1"
            title="Open Status Badge Studio"
          >
            <Shield className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden md:inline">Badges</span>
          </button>
        )}

        {/* SLA Export Trigger */}
        {onOpenSLAExport && (
          <button
            type="button"
            onClick={onOpenSLAExport}
            className="status-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1"
            title="Export SLA Telemetry"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">SLA</span>
          </button>
        )}

        {/* Live Auto-Refresh Controller */}
        {onRefresh && (
          <LiveAutoRefresh
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            defaultInterval={60}
          />
        )}
      </div>
    </div>
  );
}

export function PageLoader({ message = "Loading status..." }) {
  return (
    <div className="status-container py-12">
      <ModernLoader message={message} />
    </div>
  );
}

export function PageSection({ title, description, children, id, action }) {
  return (
    <motion.section
      id={id}
      className="mb-10 scroll-mt-28"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-[var(--text-muted)] mt-1.5">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action}
          <div className="hidden sm:block h-px flex-1 w-24 bg-gradient-to-r from-[var(--accent)] to-transparent opacity-40 mb-2" />
        </div>
      </div>
      {children}
    </motion.section>
  );
}
