import Head from "next/head";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wrench,
  Radio,
  ShieldCheck,
  Activity,
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

export default function StatusLayout({
  children,
  isDarkMode,
  onThemeToggle,
  overallStatus = "operational",
  title = "ProDevOpsGuy Status",
  description = "Real-time status of ProDevOpsGuy Tech platforms and services.",
  showHero = false,
  heroStatus,
  heroTitle,
  heroDescription,
  onOpenCommandPalette,
  onOpenBadgeStudio,
  onOpenSLAExport,
}) {
  const status = heroStatus || overallStatus;

  return (
    <div
      className={`status-page ${isDarkMode ? "dark" : ""}`}
      suppressHydrationWarning
    >
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        <meta
          name="color-scheme"
          content={isDarkMode ? "dark" : "light"}
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <Header
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
        overallStatus={overallStatus}
        onOpenCommandPalette={onOpenCommandPalette}
        onOpenBadgeStudio={onOpenBadgeStudio}
        onOpenSLAExport={onOpenSLAExport}
      />

      {showHero && (
        <GitHubStyleHeroBanner
          status={status}
          title={heroTitle}
          description={heroDescription}
        />
      )}

      <main className="flex-grow py-8 sm:py-10">{children}</main>

      <Footer />
    </div>
  );
}

/**
 * GitHub Status & GitLab Status Style Hero Banner
 * High-visibility, clean enterprise operational card with SLA telemetry badges.
 */
function GitHubStyleHeroBanner({ status, title, description }) {
  const isOp = status === "operational";
  const isDegraded = status === "degraded";
  const isOutage = status === "outage";
  const isMaint = status === "maintenance";

  const config = isOp
    ? {
        bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/30",
        badgeBg: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold",
        icon: <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />,
        heading: title || "All Systems Operational",
        sub: description || "All monitored production services, databases, and APIs are operating nominally.",
        accentColor: "text-emerald-600 dark:text-emerald-400",
      }
    : isDegraded
    ? {
        bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-500/30",
        badgeBg: "bg-amber-500 text-white dark:bg-amber-500 dark:text-slate-950 font-bold",
        icon: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />,
        heading: title || "Active Performance Degradation",
        sub: description || "Some services are currently experiencing latency or elevated error rates.",
        accentColor: "text-amber-600 dark:text-amber-400",
      }
    : isOutage
    ? {
        bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-500/30",
        badgeBg: "bg-red-600 text-white font-bold",
        icon: <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 animate-pulse" />,
        heading: title || "Major Service Outage",
        sub: description || "Our engineering team is actively investigating and mitigating service disruption.",
        accentColor: "text-red-600 dark:text-red-400",
      }
    : {
        bg: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-500/30",
        badgeBg: "bg-indigo-600 text-white font-bold",
        icon: <Wrench className="h-6 w-6 text-indigo-600 dark:text-indigo-400 shrink-0" />,
        heading: title || "Scheduled Maintenance Active",
        sub: description || "Routine infrastructure upgrade or edge key rotation in progress.",
        accentColor: "text-indigo-600 dark:text-indigo-400",
      };

  return (
    <div className="border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-raised)] to-transparent py-6 sm:py-8">
      <div className="status-container-wide">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`rounded-2xl border p-5 sm:p-7 shadow-sm ${config.bg}`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left: Icon & Status Text */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-[var(--border)] shadow-xs shrink-0">
                {config.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full ${config.badgeBg}`}>
                    {status.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)]">
                    <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
                    Live Edge Monitoring
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text)]">
                  {config.heading}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl leading-relaxed">
                  {config.sub}
                </p>
              </div>
            </div>

            {/* Right: GitHub / AWS Style Telemetry Chips */}
            <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 font-mono text-xs">
              <div className="px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-[var(--border)] bg-white/90 dark:bg-slate-950/60 shadow-xs flex items-center justify-between gap-3 min-w-[170px]">
                <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-[var(--text-muted)]">90-Day SLA</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">99.98%</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-[var(--border)] bg-white/90 dark:bg-slate-950/60 shadow-xs flex items-center justify-between gap-3 min-w-[170px]">
                <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-[var(--text-muted)]">Probe Latency</span>
                <span className="font-bold text-teal-600 dark:text-[var(--accent)]">~142ms</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-[var(--border)] bg-white/90 dark:bg-slate-950/60 shadow-xs flex items-center justify-between gap-3 min-w-[170px]">
                <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-[var(--text-muted)]">TLS Health</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">Verified</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
