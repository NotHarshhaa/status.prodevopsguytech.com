import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import StatusLayout from "../components/StatusLayout";
import IncidentList, { IncidentStats } from "../components/IncidentList";
import PageToolbar, { PageSection } from "../components/PageToolbar";
import CommandPalette from "../components/CommandPalette";
import BadgeStudioModal from "../components/BadgeStudioModal";
import SLAExportModal from "../components/SLAExportModal";
import MaintenanceBanner from "../components/MaintenanceBanner";
import { INCIDENTS } from "../lib/incidents";
import { MAINTENANCE_WINDOWS, downloadICS } from "../lib/maintenance";
import {
  Calendar,
  Wrench,
  Clock,
  Download,
  AlertTriangle,
  CheckCircle2,
  Filter,
} from "lucide-react";

export default function IncidentsPage({ isDarkMode = false, onThemeToggle }) {
  const [activeTab, setActiveTab] = useState("incidents"); // 'incidents' | 'maintenance'
  const [search, setSearch] = useState("");
  const [incidentsList, setIncidentsList] = useState(INCIDENTS);
  const [maintenanceList, setMaintenanceList] = useState(MAINTENANCE_WINDOWS);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [badgeStudioOpen, setBadgeStudioOpen] = useState(false);
  const [slaExportOpen, setSLAExportOpen] = useState(false);

  // Load dynamic incidents from API
  useEffect(() => {
    async function loadIncidents() {
      try {
        const res = await axios.get("/api/incidents");
        if (res.data?.incidents) setIncidentsList(res.data.incidents);
        if (res.data?.maintenance) setMaintenanceList(res.data.maintenance);
      } catch (e) {
        // Fallback already set
      }
    }
    loadIncidents();
  }, []);

  const filteredIncidents = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return incidentsList;
    return incidentsList.filter(
      (inc) =>
        inc.title.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q) ||
        inc.affectedSites.some((s) => s.toLowerCase().includes(q))
    );
  }, [search, incidentsList]);

  const active = filteredIncidents.filter((i) => i.status !== "resolved");
  const resolved = filteredIncidents.filter((i) => i.status === "resolved");

  const filteredMaintenance = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return maintenanceList;
    return maintenanceList.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.affectedServices.some((s) => s.toLowerCase().includes(q))
    );
  }, [search, maintenanceList]);

  return (
    <>
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onThemeToggle={onThemeToggle}
        isDarkMode={isDarkMode}
        onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
        onOpenSLAExport={() => setSLAExportOpen(true)}
      />

      <BadgeStudioModal
        isOpen={badgeStudioOpen}
        onClose={() => setBadgeStudioOpen(false)}
      />

      <SLAExportModal
        isOpen={slaExportOpen}
        onClose={() => setSLAExportOpen(false)}
      />

      <StatusLayout
        isDarkMode={isDarkMode}
        onThemeToggle={onThemeToggle}
        title="Incidents & Maintenance — ProDevOpsGuy Status"
        description="Incident history, maintenance windows, and postmortems for ProDevOpsGuy Tech services."
        showHero
        heroStatus={active.length ? "degraded" : "operational"}
        heroTitle={
          active.length
            ? `${active.length} active incident${active.length > 1 ? "s" : ""}`
            : "All Systems Operational"
        }
        heroDescription={
          active.length
            ? "We are actively mitigating ongoing service degradation."
            : "No active outages. Review past postmortems and scheduled maintenance."
        }
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
        onOpenSLAExport={() => setSLAExportOpen(true)}
      >
        <div className="status-container space-y-6">
          <PageToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search incidents & maintenance..."
            onOpenBadgeStudio={() => setBadgeStudioOpen(true)}
            onOpenSLAExport={() => setSLAExportOpen(true)}
          />

          {/* Tab Switcher: Incidents vs Maintenance */}
          <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("incidents")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "incidents"
                  ? "bg-[var(--accent)] text-slate-950 shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Incident History ({incidentsList.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("maintenance")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === "maintenance"
                  ? "bg-[var(--accent)] text-slate-950 shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Wrench className="h-4 w-4" />
              <span>Scheduled Maintenance ({maintenanceList.length})</span>
            </button>
          </div>

          {activeTab === "incidents" ? (
            <>
              <IncidentStats incidents={incidentsList} />

              {active.length > 0 && (
                <PageSection title="Active Incidents">
                  <IncidentList incidents={active} />
                </PageSection>
              )}

              <PageSection
                title="Past Incidents & Postmortems"
                description="Chronological log of resolved outages and technical mitigation notes."
              >
                {resolved.length === 0 ? (
                  <div className="status-card-static p-8 text-center text-sm text-[var(--text-muted)]">
                    {search
                      ? "No incidents match your search query."
                      : "No past incidents recorded in the telemetry window."}
                  </div>
                ) : (
                  <IncidentList incidents={resolved} />
                )}
              </PageSection>
            </>
          ) : (
            <div className="space-y-6">
              <MaintenanceBanner maintenanceList={maintenanceList} />

              <PageSection
                title="All Maintenance Windows"
                description="Planned infrastructure upgrades, database migrations, and edge key rotations."
              >
                <div className="space-y-4">
                  {filteredMaintenance.map((m) => (
                    <div
                      key={m.id}
                      className="status-card-static p-5 rounded-2xl border border-[var(--border)]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                              m.status === "in_progress"
                                ? "bg-blue-500 text-slate-950"
                                : m.status === "scheduled"
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {m.status.replace("_", " ")}
                          </span>
                          <span className="text-xs font-mono text-[var(--text-muted)]">
                            ID: {m.id}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => downloadICS(m)}
                          className="status-btn-secondary py-1 px-2.5 text-xs inline-flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download .ICS Calendar Event</span>
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-[var(--text)] mb-1">
                        {m.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">
                        {m.summary}
                      </p>

                      <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[var(--text-muted)]">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                          <span>
                            {new Date(m.scheduledStart).toUTCString().slice(0, 22)} UTC
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>Impact:</span>
                          <span className="font-semibold text-slate-300 capitalize">
                            {m.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </PageSection>
            </div>
          )}
        </div>
      </StatusLayout>
    </>
  );
}
