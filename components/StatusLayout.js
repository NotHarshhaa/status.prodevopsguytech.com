import Head from "next/head";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import StatusRing from "./StatusRing";

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
}) {
  const status = heroStatus || overallStatus;

  return (
    <div className={`status-page ${isDarkMode ? "dark" : ""}`}>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <Header
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
        overallStatus={overallStatus}
      />

      {showHero && (
        <StatusHeroBanner
          status={status}
          title={heroTitle}
          description={heroDescription}
        />
      )}

      <main className="flex-grow py-8 sm:py-12">{children}</main>

      <Footer />
    </div>
  );
}

function StatusHeroBanner({ status, title, description }) {
  const heroClass = {
    operational: "status-hero-operational",
    degraded: "status-hero-degraded",
    outage: "status-hero-outage",
    maintenance: "status-hero-maintenance",
  }[status] || "status-hero-operational";

  return (
    <div className={`status-hero ${heroClass}`}>
      <div className="status-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center"
        >
          <div className="mb-5">
            <StatusRing status={status} size={100} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-sm sm:text-base text-white/80 max-w-lg mx-auto leading-relaxed">
              {description}
            </p>
          )}
          <motion.div
            className="mt-6 flex items-center gap-2 text-xs font-mono text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
            Live monitoring active
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export { StatusHeroBanner };
