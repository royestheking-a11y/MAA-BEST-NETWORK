import { useState } from "react";
import {
  Users, Download, TrendingUp, CheckCircle2, MapPin, RefreshCw
} from "lucide-react";
import {
  INITIAL_CUSTOMER_REPORTS, type CustomerReportRow
} from "./reportsData";

interface CustomerReportsPageProps {
  onNavigate?: (page: string) => void;
}

export function CustomerReportsPage({ onNavigate }: CustomerReportsPageProps) {
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const totalActive = INITIAL_CUSTOMER_REPORTS.reduce((a, b) => a + b.activeUsers, 0);
  const totalNew = INITIAL_CUSTOMER_REPORTS.reduce((a, b) => a + b.newAdditions, 0);
  const totalChurn = INITIAL_CUSTOMER_REPORTS.reduce((a, b) => a + b.churnedUsers, 0);
  const netGrowth = totalNew - totalChurn;

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Customer Growth & Churn Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
              +{netGrowth} Net Adds This Month
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Zone-by-zone subscriber acquisition velocity, optical churn rates, and net customer retention
          </p>
        </div>

        <button
          onClick={() => showToast("Subscriber growth report exported to CSV!")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors cursor-pointer"
        >
          <Download size={14} /> Export Customer Report
        </button>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Total Active Subscribers</span>
          <p className="font-mono text-2xl font-bold text-foreground mt-1">
            {totalActive.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Across 6 territory zones</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>New Subscriptions (Gross)</span>
          <p className="font-mono text-2xl font-bold text-emerald-600 mt-1">
            +{totalNew}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>New fiber installs</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Disconnections / Churn</span>
          <p className="font-mono text-2xl font-bold text-red-600 mt-1">
            -{totalChurn}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>0.7% monthly churn rate</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Fastest Growing Zone</span>
          <p className="font-mono text-2xl font-bold text-purple-600 mt-1">
            Bashundhara (+6.5%)
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>New residential high-rises</p>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-card">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "var(--muted)" }}>
              {["Geographic Zone", "Active Subscribers", "New Connected (Gross)", "Disconnected / Churned", "Net Growth", "Monthly Growth Rate"].map(h => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-muted-foreground tracking-wider">
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INITIAL_CUSTOMER_REPORTS.map((row, i) => (
              <tr
                key={row.zone}
                style={{ borderBottom: i < INITIAL_CUSTOMER_REPORTS.length - 1 ? "1px solid var(--border)" : "none" }}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-5 py-4 font-bold text-foreground text-sm flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  {row.zone}
                </td>
                <td className="px-5 py-4 font-mono font-bold text-foreground">{row.activeUsers.toLocaleString()}</td>
                <td className="px-5 py-4 font-mono font-bold text-emerald-600">+{row.newAdditions}</td>
                <td className="px-5 py-4 font-mono text-red-600">-{row.churnedUsers}</td>
                <td className="px-5 py-4 font-mono font-bold text-blue-600">+{row.netGrowth}</td>
                <td className="px-5 py-4 font-mono font-bold text-emerald-600">{row.growthRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
