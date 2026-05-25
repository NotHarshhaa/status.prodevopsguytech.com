import Head from "next/head";
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

      <main className="flex-grow py-8 sm:py-10">{children}</main>

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
      <div className="status-container">
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm sm:text-base text-white/85 max-w-xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export { StatusHeroBanner };
