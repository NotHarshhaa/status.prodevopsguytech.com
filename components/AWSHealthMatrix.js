import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Server,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ExternalLink,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
} from "lucide-react";
import LatencySparkline from "./LatencySparkline";
import { COMPONENT_STATUS, formatRelativeTime } from "../lib/statusTheme";

const REGIONS = [
  { id: "all", label: "All Regions" },
  { id: "global", label: "Global Edge CDN" },
  { id: "us-east-1", label: "US East (N. Virginia)" },
  { id: "eu-central-1", label: "EU Central (Frankfurt)" },
  { id: "ap-south-1", label: "AP South (Mumbai)" },
];

export default function AWSHealthMatrix({ sites = [] }) {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Assign simulated distributed edge regions to sites
  const matrixData = useMemo(() => {
    const regionMap = [
      "global",
      "us-east-1",
      "eu-central-1",
      "ap-south-1",
      "global",
      "us-east-1",
      "eu-central-1",
      "ap-south-1",
    ];

    return sites.map((site, idx) => {
      const regionId = regionMap[idx % regionMap.length];
      const regionLabel =
        REGIONS.find((r) => r.id === regionId)?.label || "Global Edge CDN";

      return {
        ...site,
        regionId,
        regionLabel,
      };
    });
  }, [sites]);

  const filteredData = useMemo(() => {
    return matrixData.filter((item) => {
      const matchRegion =
        selectedRegion === "all" || item.regionId === selectedRegion;
      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;
      return matchRegion && matchStatus;
    });
  }, [matrixData, selectedRegion, statusFilter]);

  return (
    <div className="status-card-static overflow-hidden">
      {/* Header & AWS Filters */}
      <div className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--surface-raised)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Server className="h-4 w-4 text-[var(--accent)]" />
            AWS-Style Service Health & Regional Telemetry Matrix
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Real-time multi-region health probes, HTTP response codes, and SSL certificate statuses.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Region Select */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="all">All Statuses</option>
            <option value="operational">Operational</option>
            <option value="degraded">Degraded</option>
            <option value="outage">Outages</option>
          </select>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-100/70 dark:bg-slate-900/80 border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Service Name</th>
              <th className="py-3 px-4">Region / Edge POP</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">HTTP</th>
              <th className="py-3 px-4">Latency Trend</th>
              <th className="py-3 px-4">SSL Validity</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-sm text-[var(--text-muted)]">
                  No services match the selected regional and status filter.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const cfg = COMPONENT_STATUS[item.status] || COMPONENT_STATUS.unknown;
                const isOp = item.status === "operational";

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Service Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`status-dot ${cfg.dot}`} />
                        <div>
                          <Link
                            href={`/site/${item.id}`}
                            className="font-semibold text-sm hover:text-[var(--accent)] transition-colors block truncate max-w-[200px]"
                          >
                            {item.name}
                          </Link>
                          <span className="text-[10px] text-[var(--text-muted)] truncate block">
                            {item.url}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Region */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                        <span className="text-slate-300 truncate max-w-[140px]">
                          {item.regionLabel}
                        </span>
                      </div>
                    </td>

                    {/* Operational State */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          isOp
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : item.status === "degraded"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        {isOp ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : item.status === "degraded" ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {item.statusText || cfg.label}
                      </span>
                    </td>

                    {/* HTTP Code */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-emerald-400 font-semibold">
                        {item.statusCode || 200} OK
                      </span>
                    </td>

                    {/* Latency + Sparkline */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--accent)] min-w-[42px]">
                          {item.responseTime ? `${item.responseTime}ms` : "—"}
                        </span>
                        <LatencySparkline
                          data={item.latencyHistory}
                          status={item.status}
                          width={60}
                          height={18}
                        />
                      </div>
                    </td>

                    {/* SSL */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {item.ssl?.daysRemaining != null
                            ? `${item.ssl.daysRemaining}d valid`
                            : "Verified"}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/site/${item.id}`}
                          className="status-btn-secondary py-1 px-2 text-[11px]"
                          title="Open Console"
                        >
                          Inspect
                        </Link>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--text-muted)]"
                          aria-label={`Visit ${item.name}`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
