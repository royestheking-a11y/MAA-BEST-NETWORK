import { useState } from "react";
import {
  FileText, Download, BarChart3, TrendingUp, CheckCircle2,
  Calendar, CreditCard, RefreshCw
} from "lucide-react";
import {
  INITIAL_REVENUE_REPORTS, type RevenueReportRow
} from "./reportsData";

interface RevenueReportsPageProps {
  onNavigate?: (page: string) => void;
}

export function RevenueReportsPage({ onNavigate }: RevenueReportsPageProps) {
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Revenue & Collection Reports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
              August 2026 Collection Efficiency: 95.3%
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Historical billing vs realization, payment gateway splits (bKash/Nagad/Cash), and overdue receivables
          </p>
        </div>

        <button
          onClick={() => showToast("Revenue statement downloaded as CSV & Excel!")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors"
        >
          <Download size={14} /> Export Revenue Ledger
        </button>
      </div>

      {/* ── Summary Table ────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-card">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: "var(--muted)" }}>
              {["Billing Month", "Invoices Issued", "Total Billed", "Total Realized", "bKash (68%)", "Nagad (22%)", "Cash (10%)", "Outstanding Due", "Efficiency"].map(h => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-muted-foreground tracking-wider">
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INITIAL_REVENUE_REPORTS.map((row, i) => (
              <tr
                key={row.period}
                style={{ borderBottom: i < INITIAL_REVENUE_REPORTS.length - 1 ? "1px solid var(--border)" : "none" }}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-5 py-4 font-bold text-foreground text-sm">{row.period}</td>
                <td className="px-5 py-4 font-mono text-foreground">{row.invoicesGenerated.toLocaleString()}</td>
                <td className="px-5 py-4 font-mono font-semibold text-foreground">৳{(row.totalBilled / 100000).toFixed(2)} Lac</td>
                <td className="px-5 py-4 font-mono font-bold text-emerald-600">৳{(row.totalCollected / 100000).toFixed(2)} Lac</td>
                <td className="px-5 py-4 font-mono text-muted-foreground">৳{(row.bkashCollected / 100000).toFixed(2)} Lac</td>
                <td className="px-5 py-4 font-mono text-muted-foreground">৳{(row.nagadCollected / 100000).toFixed(2)} Lac</td>
                <td className="px-5 py-4 font-mono text-muted-foreground">৳{(row.cashCollected / 100000).toFixed(2)} Lac</td>
                <td className="px-5 py-4 font-mono text-red-600 font-bold">৳{(row.unpaidDue / 100000).toFixed(2)} Lac</td>
                <td className="px-5 py-4 font-mono font-bold text-emerald-600">{row.collectionRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500 }}
        >
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
