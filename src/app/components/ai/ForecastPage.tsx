import { useState } from "react";
import {
  TrendingUp, Download, RefreshCw, BarChart3, Users, DollarSign,
  Activity, CheckCircle2, Zap
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";
import {
  INITIAL_FORECASTS, type ForecastPoint
} from "./aiData";

interface ForecastPageProps {
  onNavigate?: (page: string) => void;
}

export function ForecastPage({ onNavigate }: ForecastPageProps) {
  const [data, setData] = useState<ForecastPoint[]>(INITIAL_FORECASTS);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const endRevenue = data[data.length - 1].predictedRevenue;
  const endBandwidth = data[data.length - 1].predictedBandwidthGbps;
  const endSubs = data[data.length - 1].projectedCustomerBase;

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Predictive Bandwidth & Revenue Forecasting
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DBEAFE", color: "#2563EB" }}>
              6-Month Machine Learning Projection
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Deep autoregressive growth modeling for capacity procurement planning and budget forecasting
          </p>
        </div>

        <button
          onClick={() => showToast("Capacity forecast model recalculated with latest population census density!")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors cursor-pointer"
        >
          <RefreshCw size={14} /> Recalculate Forecast
        </button>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Projected Revenue (Feb 2027)</span>
          <p className="font-mono text-2xl font-bold text-emerald-600 mt-1">
            ৳{(endRevenue / 100000).toFixed(2)} Lac / Mo
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>+32.2% forecasted growth</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Required Upstream Capacity</span>
          <p className="font-mono text-2xl font-bold text-blue-600 mt-1">
            {endBandwidth} Gbps
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Plan 10G expansion by Nov 2026</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Forecasted Customer Base</span>
          <p className="font-mono text-2xl font-bold text-purple-600 mt-1">
            {endSubs.toLocaleString()} Subscribers
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>+3,660 net adds projected</p>
        </div>
      </div>

      {/* ── Forecast Projection Chart ────────────────────────────────────────── */}
      <div className="rounded-xl p-5 mb-5 border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
              Revenue (৳) vs Required Bandwidth (Gbps) Trajectory
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>95% confidence interval regression line</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> Monthly Revenue (৳)
            </span>
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Bandwidth (Gbps)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={11} tickFormatter={v => `৳${v / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--muted-foreground)" fontSize={11} unit="G" />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
              />
              <Line yAxisId="left" type="monotone" dataKey="predictedRevenue" stroke="#16A34A" strokeWidth={3} dot={{ r: 4 }} name="Revenue (৳)" />
              <Line yAxisId="right" type="monotone" dataKey="predictedBandwidthGbps" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} name="Bandwidth (Gbps)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
