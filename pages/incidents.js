import { useState, useMemo } from "react";
import StatusLayout from "../components/StatusLayout";
import IncidentList, { IncidentStats } from "../components/IncidentList";
import PageToolbar, { PageSection } from "../components/PageToolbar";
import { INCIDENTS } from "../lib/incidents";

export default function IncidentsPage({ isDarkMode = false, onThemeToggle }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return INCIDENTS;
    return INCIDENTS.filter(
      (inc) =>
        inc.title.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q) ||
        inc.affectedSites.some((s) => s.toLowerCase().includes(q)),
    );
  }, [search]);

  const active = filtered.filter((i) => i.status !== "resolved");
  const resolved = filtered.filter((i) => i.status === "resolved");

  return (
    <StatusLayout
      isDarkMode={isDarkMode}
      onThemeToggle={onThemeToggle}
      title="Incidents — ProDevOpsGuy Status"
      description="Incident history and postmortems for ProDevOpsGuy Tech services."
      showHero
      heroStatus={active.length ? "degraded" : "operational"}
      heroTitle={
        active.length
          ? `${active.length} active incident${active.length > 1 ? "s" : ""}`
          : "No active incidents"
      }
      heroDescription={
        active.length
          ? "We are aware of ongoing issues and are working on a resolution."
          : "All recent incidents have been resolved."
      }
    >
      <div className="status-container">
        <PageToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search incidents..."
        />

        <IncidentStats incidents={INCIDENTS} />

        {active.length > 0 && (
          <PageSection title="Active incidents">
            <IncidentList incidents={active} />
          </PageSection>
        )}

        <PageSection
          title="Past incidents"
          description="Resolved incidents from the last 90 days."
        >
          {resolved.length === 0 ? (
            <div className="status-card p-8 text-center text-sm text-[var(--text-muted)]">
              {search ? "No incidents match your search." : "No past incidents."}
            </div>
          ) : (
            <IncidentList incidents={resolved} />
          )}
        </PageSection>
      </div>
    </StatusLayout>
  );
}
