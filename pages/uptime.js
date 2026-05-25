import { useState, useEffect } from "react";
import StatusLayout from "../components/StatusLayout";
import UptimeSection, { UptimeSummaryCards } from "../components/UptimeSection";
import PageToolbar, { PageLoader, PageSection } from "../components/PageToolbar";
import { fetchStatusData } from "../lib/utils/statusData";
import { getOverallStatus, OVERALL_STATUS } from "../lib/statusTheme";

export default function UptimePage({ isDarkMode = false, onThemeToggle }) {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchStatusData({ preferStatic: false });
        setSites(data.sites || []);
        setLastUpdated(new Date(data.timestamp || Date.now()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const overall = getOverallStatus(sites);
  const hero = OVERALL_STATUS[overall];

  return (
    <StatusLayout
      isDarkMode={isDarkMode}
      onThemeToggle={onThemeToggle}
      overallStatus={overall}
      title="Uptime — ProDevOpsGuy Status"
      description="90-day uptime history for all ProDevOpsGuy Tech services."
      showHero
      heroStatus={overall}
      heroTitle="Uptime History"
      heroDescription={hero.description}
    >
      <div className="status-container-wide">
        {loading ? (
          <PageLoader message="Loading uptime data..." />
        ) : (
          <>
            <PageToolbar lastUpdated={lastUpdated} />

            <UptimeSummaryCards sites={sites} />

            <PageSection
              title="Service uptime"
              description="Hover over each day to see the status for that date."
            >
              <UptimeSection sites={sites} days={90} />
            </PageSection>
          </>
        )}
      </div>
    </StatusLayout>
  );
}
