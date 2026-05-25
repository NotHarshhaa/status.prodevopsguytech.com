import { RefreshCw } from "lucide-react";
import { formatRelativeTime } from "../lib/statusTheme";

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
        {lastUpdated && (
          <span>Updated {formatRelativeTime(lastUpdated)}</span>
        )}
        {source && (
          <span className="hidden sm:inline px-2 py-0.5 rounded border border-[var(--border)]">
            {source === "static" ? "Cached data" : "Live checks"}
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
    <div className="status-container py-20 text-center">
      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[var(--text-muted)] mb-4" />
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </div>
  );
}

export function PageSection({ title, description, children, id }) {
  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-[var(--text-muted)] mt-1">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
