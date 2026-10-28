import { useState, useMemo } from "react";
import {
  X,
  Shield,
  Copy,
  Check,
  Code2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function BadgeStudioModal({ isOpen, onClose, sites = [] }) {
  const [selectedSiteId, setSelectedSiteId] = useState("overall");
  const [copiedType, setCopiedType] = useState(null);

  const selectedSite = useMemo(() => {
    if (selectedSiteId === "overall") {
      return {
        id: "overall",
        name: "Overall System Status",
        badgeEndpoint: "/api/badge",
      };
    }
    const found = sites.find((s) => s.id === selectedSiteId);
    return found
      ? { ...found, badgeEndpoint: `/api/badge/${found.id}.svg` }
      : { id: "overall", name: "Overall System Status", badgeEndpoint: "/api/badge" };
  }, [selectedSiteId, sites]);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://status.prodevopsguytech.com";

  const badgeUrl = `${origin}${selectedSite.badgeEndpoint}`;
  const dashboardUrl =
    selectedSiteId === "overall"
      ? origin
      : `${origin}/site/${selectedSite.id}`;

  const markdownSnippet = `[![${selectedSite.name}](${badgeUrl})](${dashboardUrl})`;
  const htmlSnippet = `<a href="${dashboardUrl}" target="_blank" rel="noopener noreferrer"><img src="${badgeUrl}" alt="${selectedSite.name}" /></a>`;
  const svgUrlSnippet = badgeUrl;

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] shadow-2xl p-6 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-[rgba(0,212,170,0.12)] text-[var(--accent)]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Status Badge Studio</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Embed live dynamic SVG status badges in GitHub READMEs, docs, and portals.
            </p>
          </div>
        </div>

        {/* Target Site Selector */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Select Target Service
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="overall">⚡ System-wide (Overall Health)</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>

          {/* Live Preview Box */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-[var(--border)] bg-slate-50 dark:bg-slate-950/60 flex flex-col items-center justify-center text-center gap-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Badge Preview
            </span>
            <div className="p-2 rounded bg-white dark:bg-black/40 border border-slate-200 dark:border-slate-800 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedSite.badgeEndpoint}
                alt={selectedSite.name}
                className="h-6"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
              Auto-refreshes every 30s with live HTTP telemetry
            </span>
          </div>

          {/* Snippets to Copy */}
          <div className="space-y-2.5">
            {/* Markdown */}
            <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                  GitHub Markdown
                </span>
                <code className="text-xs font-mono text-[var(--text)] truncate block mt-0.5">
                  {markdownSnippet}
                </code>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(markdownSnippet, "markdown")}
                className="status-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1 shrink-0"
              >
                {copiedType === "markdown" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* HTML */}
            <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                  HTML Embed
                </span>
                <code className="text-xs font-mono text-[var(--text)] truncate block mt-0.5">
                  {htmlSnippet}
                </code>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(htmlSnippet, "html")}
                className="status-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1 shrink-0"
              >
                {copiedType === "html" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Direct SVG URL */}
            <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                  Direct SVG URL
                </span>
                <code className="text-xs font-mono text-[var(--text)] truncate block mt-0.5">
                  {svgUrlSnippet}
                </code>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(svgUrlSnippet, "url")}
                className="status-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1 shrink-0"
              >
                {copiedType === "url" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
