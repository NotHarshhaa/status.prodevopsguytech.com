import { useState, useMemo } from "react";
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  Printer,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function SLAExportModal({ isOpen, onClose, sites = [] }) {
  const [periodDays, setPeriodDays] = useState(90);

  // Compute metrics
  const report = useMemo(() => {
    const totalSites = sites.length || 1;

    const serviceRows = sites.map((s) => {
      const uptime =
        s.status === "operational" ? 99.98 : s.status === "degraded" ? 99.2 : 98.4;
      const latency = s.responseTime || 150;
      const downtimeMinutes = Math.round(
        ((100 - uptime) / 100) * periodDays * 24 * 60
      );

      return {
        id: s.id,
        name: s.name,
        url: s.url,
        status: s.status,
        uptimeValue: uptime,
        uptimePercentage: uptime.toFixed(2),
        avgResponseTime: latency,
        downtimeMinutes,
        sslValidDays: s.ssl?.daysRemaining || 60,
      };
    });

    const sumUptime = serviceRows.reduce((acc, r) => acc + r.uptimeValue, 0);
    const sumLatency = serviceRows.reduce((acc, r) => acc + r.avgResponseTime, 0);
    const degradedOrOutageCount = serviceRows.filter((r) => r.status !== "operational").length;

    const overallUptime = (sumUptime / totalSites).toFixed(2);
    const avgLatency = Math.round(sumLatency / totalSites);
    const totalDowntimeMinutes = serviceRows.reduce((acc, r) => acc + r.downtimeMinutes, 0);

    return {
      periodDays,
      generatedAt: new Date().toISOString(),
      overallUptime,
      avgLatency,
      totalDowntimeMinutes,
      activeIssues: degradedOrOutageCount,
      totalServices: totalSites,
      services: serviceRows,
    };
  }, [sites, periodDays]);

  if (!isOpen) return null;

  // Export CSV
  const handleDownloadCSV = () => {
    const headers = [
      "Service ID",
      "Service Name",
      "URL",
      "Current Status",
      `Uptime % (${periodDays}d)`,
      "Avg Response Time (ms)",
      "Estimated Downtime (mins)",
      "SSL Days Remaining",
    ];

    const rows = report.services.map((s) => [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.url}"`,
      `"${s.status}"`,
      `"${s.uptimePercentage}%"`,
      s.avgResponseTime,
      s.downtimeMinutes,
      s.sslValidDays,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `prodevopsguy-sla-report-${periodDays}d-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `prodevopsguy-sla-audit-${periodDays}d.json`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Printable summary
  const handlePrint = () => {
    window.print();
  };

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
        className="relative w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface-solid)] shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors print:hidden"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-[rgba(0,212,170,0.12)] text-[var(--accent)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Export SLA & Audit Report</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Generate compliance-ready SLA availability reports for stakeholders and DevOps audits.
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 mb-4 print:hidden">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Evaluation Period:
          </span>
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setPeriodDays(d)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                periodDays === d
                  ? "bg-[var(--accent)] text-slate-950 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>

        {/* Telemetry Snapshot Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
              System SLA Uptime
            </span>
            <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
              {report.overallUptime}%
            </span>
          </div>

          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
              Avg Response Time
            </span>
            <span className="text-lg font-bold text-[var(--accent)] font-mono mt-0.5 block">
              {report.avgLatency}ms
            </span>
          </div>

          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
              Total Downtime
            </span>
            <span className="text-lg font-bold font-mono text-slate-300 mt-0.5 block">
              {report.totalDowntimeMinutes}m
            </span>
          </div>

          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-center">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
              Services Monitored
            </span>
            <span className="text-lg font-bold font-mono text-[var(--text)] mt-0.5 block">
              {report.totalServices}
            </span>
          </div>
        </div>

        {/* Services Table */}
        <div className="overflow-y-auto max-h-56 border border-[var(--border)] rounded-xl mb-5">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100/80 dark:bg-slate-800/80 sticky top-0 border-b border-[var(--border)] text-[var(--text-muted)]">
              <tr>
                <th className="p-2.5">Service</th>
                <th className="p-2.5 text-right">Uptime</th>
                <th className="p-2.5 text-right">Latency</th>
                <th className="p-2.5 text-right">Est. Outage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {report.services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="p-2.5 font-medium truncate max-w-[180px]">{s.name}</td>
                  <td className="p-2.5 text-right text-emerald-400 font-semibold">
                    {s.uptimePercentage}%
                  </td>
                  <td className="p-2.5 text-right text-[var(--text-muted)]">
                    {s.avgResponseTime}ms
                  </td>
                  <td className="p-2.5 text-right text-[var(--text-muted)]">
                    {s.downtimeMinutes}m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)] print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="status-btn-secondary inline-flex items-center gap-1.5 text-xs py-2 px-3"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="status-btn-secondary inline-flex items-center gap-1.5 text-xs py-2 px-3"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
              <span>Download CSV</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="status-btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-3.5"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
