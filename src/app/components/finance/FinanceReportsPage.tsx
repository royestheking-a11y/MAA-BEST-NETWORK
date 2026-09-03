import { useState } from "react";
import {
  FileText, Download, BarChart3, TrendingUp, TrendingDown,
  DollarSign, CheckCircle2, Calendar, Filter, RefreshCw
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";

const MONTHLY_PL_DATA = [
  { month: "Mar 2026", revenue: 1120000, opex: 540000, profit: 580000 },
  { month: "Apr 2026", revenue: 1180000, opex: 560000, profit: 620000 },
  { month: "May 2026", revenue: 1240000, opex: 590000, profit: 650000 },
  { month: "Jun 2026", revenue: 1310000, opex: 610000, profit: 700000 },
  { month: "Jul 2026", revenue: 1380000, opex: 630000, profit: 750000 },
  { month: "Aug 2026", revenue: 1460000, opex: 650000, profit: 810000 },
];

interface FinanceReportsPageProps {
  onNavigate?: (page: string) => void;
}

export function FinanceReportsPage({ onNavigate }: FinanceReportsPageProps) {
  const [period, setPeriod] = useState("Last 6 Months");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const totalRev = MONTHLY_PL_DATA.reduce((a, b) => a + b.revenue, 0);
  const totalExp = MONTHLY_PL_DATA.reduce((a, b) => a + b.opex, 0);
  const totalNet = totalRev - totalExp;
  const netMargin = Math.round((totalNet / totalRev) * 100);

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Financial Statements & P&L Analysis
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
              Net Profit Margin: {netMargin}%
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Monthly profit & loss statement, EBITDA trends, revenue realization, and BTRC revenue sharing breakdown
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast("Financial P&L statement exported to PDF / Excel!")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors cursor-pointer"
          >
            <Download size={14} /> Download P&L PDF
          </button>
        </div>
      </div>

      {/* ── High-Level Financial Summary ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>6-Month Gross Revenue</span>
          <p className="font-mono text-2xl font-bold text-foreground mt-1">
            ৳{(totalRev / 100000).toFixed(2)} Lac
          </p>
          <p style={{ fontSize: 11, color: "#16A34A" }}>+12.4% QoQ organic growth</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Operating Expenditure</span>
          <p className="font-mono text-2xl font-bold text-red-600 mt-1">
            ৳{(totalExp / 100000).toFixed(2)} Lac
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Bandwidth, POP & staff</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Net Operating Profit</span>
          <p className="font-mono text-2xl font-bold text-emerald-600 mt-1">
            ৳{(totalNet / 100000).toFixed(2)} Lac
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Net operating cash profit</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>BTRC 5.5% Revenue Share</span>
          <p className="font-mono text-2xl font-bold text-purple-600 mt-1">
            ৳{Math.round(totalRev * 0.055).toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Statutory annual provision</p>
        </div>
      </div>

      {/* ── Monthly Revenue vs OPEX Chart ────────────────────────────────────── */}
      <div className="rounded-xl p-5 mb-5 border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
              Monthly Revenue vs Operating Cost (OPEX)
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Consistent profit generation over the last two quarters</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Gross Revenue
            </span>
            <span className="flex items-center gap-1.5 text-red-500">
              <span className="w-3 h-3 rounded bg-red-500 inline-block" /> Operating Cost
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> Net Profit
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_PL_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={v => `৳${v / 1000}k`} />
              <Tooltip
                formatter={(v: any) => [`৳${Number(v).toLocaleString()}`, ""]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} name="Gross Revenue" />
              <Bar dataKey="opex" fill="#EF4444" radius={[4, 4, 0, 0]} name="Operating Cost" />
              <Bar dataKey="profit" fill="#16A34A" radius={[4, 4, 0, 0]} name="Net Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Tabular Statement ────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-border bg-card">
        <div className="px-5 py-3.5 border-b border-border font-bold text-sm text-foreground">
          Monthly P&L Realization Matrix
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Month Period", "Total Billed", "Collections Realized", "Upstream Costs", "Staff & Overhead", "Net Profit", "Margin"].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-muted-foreground tracking-wider">
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MONTHLY_PL_DATA.map((row, i) => {
                const margin = Math.round((row.profit / row.revenue) * 100);
                return (
                  <tr
                    key={row.month}
                    style={{ borderBottom: i < MONTHLY_PL_DATA.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-foreground">{row.month}</td>
                    <td className="px-5 py-4 font-mono text-foreground">৳{row.revenue.toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono font-bold text-emerald-600">৳{row.revenue.toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono text-red-600">-৳{Math.round(row.opex * 0.45).toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono text-red-600">-৳{Math.round(row.opex * 0.55).toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono font-bold text-foreground">৳{row.profit.toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono font-bold text-emerald-600">{margin}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
