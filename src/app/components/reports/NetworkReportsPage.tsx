import { useState } from "react";
import {
  Network, Download, CheckCircle2, AlertTriangle, X,
  Server, Radio, RefreshCw
} from "lucide-react";
import {
  INITIAL_UPTIME_REPORTS, type NetworkUptimeRow
} from "./reportsData";

interface NetworkReportsPageProps {
  onNavigate?: (page: string) => void;
}

export function NetworkReportsPage({ onNavigate }: NetworkReportsPageProps) {
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Network Uptime & SLA Compliance Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
              Core Backbone SLA: 99.92%
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Aggregated uptime reports across core MikroTik routers, GPON OLTs, and BGP upstream transit links
          </p>
        </div>

        <button
          onClick={() => showToast("Network SLA availability report exported to PDF!")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors"
        >
          <Download size={14} /> Export SLA Report
        </button>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-card">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "var(--muted)" }}>
              {["Network Node Element", "Device Class", "Monthly Uptime", "Total Downtime", "Incidents", "99.9% SLA Status"].map(h => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-muted-foreground tracking-wider">
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INITIAL_UPTIME_REPORTS.map((row, i) => (
              <tr
                key={row.element}
                style={{ borderBottom: i < INITIAL_UPTIME_REPORTS.length - 1 ? "1px solid var(--border)" : "none" }}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-5 py-4 font-bold text-foreground text-sm flex items-center gap-2">
                  <Server size={15} className="text-primary" />
                  {row.element}
                </td>
                <td className="px-5 py-4 text-muted-foreground">{row.type}</td>
                <td className="px-5 py-4 font-mono font-bold" style={{ color: row.uptimePercentage >= 99.9 ? "#16A34A" : "#DC2626" }}>
                  {row.uptimePercentage}%
                </td>
                <td className="px-5 py-4 font-mono text-muted-foreground">{row.totalDowntimeMinutes} mins</td>
                <td className="px-5 py-4 font-mono font-semibold text-foreground">{row.incidentsCount} events</td>
                <td className="px-5 py-4">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{
                      background: row.slaStatus === "met" ? "#DCFCE7" : "#FEE2E2",
                      color: row.slaStatus === "met" ? "#16A34A" : "#DC2626",
                    }}
                  >
                    {row.slaStatus === "met" ? "SLA Met" : "SLA Breached"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
