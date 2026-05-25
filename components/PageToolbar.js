import { RefreshCw, Clock, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { formatRelativeTime } from "../lib/statusTheme";
import ModernLoader from "./ModernLoader";

export default function PageToolbar({
  lastUpdated,
  isRefreshing,
  onRefresh,
  source,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
        {lastUpdated && (
          <span className="inline-flex items-center gap-1.5 font-mono">
            <Clock className="h-3.5 w-3.5" />
            Updated {formatRelativeTime(lastUpdated)}
          </span>
        )}
        {source && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--border)] font-mono text-[10px] uppercase tracking-wider">
            <Radio className={`h-3 w-3 ${source !== "static" ? "text-emerald-500" : "text-amber-500"}`} />
            {source === "static" ? "Cached" : "Live"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onSearchChange && (
          <input
            type="search"
            value={search || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="status-input max-w-xs"
          />
        )}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="status-btn-secondary"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
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

export function PageSection({ title, description, children, id }) {
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
            <p className="text-sm text-[var(--text-muted)] mt-1.5">{description}</p>
          )}
        </div>
        <div className="hidden sm:block h-px flex-1 max-w-[120px] bg-gradient-to-r from-[var(--accent)] to-transparent opacity-40 mb-2" />
      </div>
      {children}
    </motion.section>
  );
}
