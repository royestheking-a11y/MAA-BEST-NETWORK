import { useState } from "react";
import {
  BrainCircuit, TrendingUp, DollarSign, Zap, AlertTriangle,
  CheckCircle2, ArrowUpRight, BarChart3, RefreshCw, X
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const ARPU_BY_ZONE = [
  { zone: "Mirpur", arpu: 980, subscribers: 3240, totalRev: 3175200 },
  { zone: "Uttara", arpu: 1120, subscribers: 2810, totalRev: 3147200 },
  { zone: "Dhanmondi", arpu: 1350, subscribers: 2190, totalRev: 2956500 },
  { zone: "Gulshan", arpu: 1850, subscribers: 1890, totalRev: 3496500 },
  { zone: "Mohammadpur", arpu: 890, subscribers: 1450, totalRev: 1290500 },
  { zone: "Bashundhara", arpu: 1420, subscribers: 1260, totalRev: 1789200 },
];

interface RevenueAnalysisPageProps {
  onNavigate?: (page: string) => void;
}

export function RevenueAnalysisPage({ onNavigate }: RevenueAnalysisPageProps) {
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const totalMonthlyBilled = ARPU_BY_ZONE.reduce((a, b) => a + b.totalRev, 0);
  const avgArpu = Math.round(totalMonthlyBilled / ARPU_BY_ZONE.reduce((a, b) => a + b.subscribers, 0));

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              AI Revenue Optimization & ARPU Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
              Network Average ARPU: ৳{avgArpu} / Sub
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Machine learning package pricing insights, territory yield optimization, and high-margin tier opportunities
          </p>
        </div>

        <button
          onClick={() => showToast("AI Revenue Optimization Model re-trained on August subscriber cohorts!")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors"
        >
          <RefreshCw size={14} /> Re-Train AI Model
        </button>
      </div>

      {/* ── Top Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Monthly Network Yield</span>
          <p className="font-mono text-2xl font-bold text-foreground mt-1">
            ৳{(totalMonthlyBilled / 100000).toFixed(2)} Lac
          </p>
          <p style={{ fontSize: 11, color: "#16A34A" }}>+8.6% AI pricing lift</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Highest Yield Territory</span>
          <p className="font-mono text-2xl font-bold text-purple-600 mt-1">
            Gulshan (৳1,850)
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>High corporate/premium mix</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>AI Upgrade Candidates</span>
          <p className="font-mono text-2xl font-bold text-blue-600 mt-1">
            1,420 Users
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>80%+ daily capacity saturation</p>
        </div>

        <div className="rounded-xl p-4 border border-border bg-card shadow-sm">
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Estimated Upsell Value</span>
          <p className="font-mono text-2xl font-bold text-emerald-600 mt-1">
            +৳4.2 Lac / Mo
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Targeted speed boost campaign</p>
        </div>
      </div>

      {/* ── ARPU by Zone Chart ──────────────────────────────────────────────── */}
      <div className="rounded-xl p-5 mb-5 border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
              Average Revenue Per User (ARPU) by Geographic Zone
            </h3>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Benchmark comparison across regional distribution networks</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ARPU_BY_ZONE} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="zone" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickFormatter={v => `৳${v}`} />
              <Tooltip
                formatter={(v: any) => [`৳${Number(v).toLocaleString()}`, "ARPU"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }}
              />
              <Bar dataKey="arpu" fill="#7C3AED" radius={[4, 4, 0, 0]} name="Average ARPU (৳)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── AI Recommendation Actions ────────────────────────────────────────── */}
      <div className="rounded-xl p-5 border border-border bg-card shadow-sm space-y-3">
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
          Recommended Revenue Actions
        </h3>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <Zap size={14} /> Mirpur Zone 10M to 20M Promo
            </div>
            <p className="text-xs text-muted-foreground">
              840 basic subscribers hit peak bandwidth daily from 8-11 PM. Automated SMS offer for 20 Mbps with 1st month 20% discount.
            </p>
            <button onClick={() => showToast("Campaign scheduled via Automation Engine!")} className="text-xs font-semibold text-primary hover:underline">
              Launch Upsell Campaign →
            </button>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <TrendingUp size={14} /> Annual Advance Incentive
            </div>
            <p className="text-xs text-muted-foreground">
              Offer 2 months complimentary service for upfront 12-month advance subscription. Reduces churn and secures cash reserves.
            </p>
            <button onClick={() => showToast("Annual rule activated in Discount manager!")} className="text-xs font-semibold text-emerald-600 hover:underline">
              Configure Annual Plan →
            </button>
          </div>

          <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
              <DollarSign size={14} /> Corporate SME Bundle
            </div>
            <p className="text-xs text-muted-foreground">
              Introduce 50 Mbps Dedicated lease with Static Real IP in Dhanmondi & Banani commercial clusters for ৳3,500/mo.
            </p>
            <button onClick={() => showToast("Package draft created in Billing Packages!")} className="text-xs font-semibold text-blue-600 hover:underline">
              Publish Package Tier →
            </button>
          </div>
        </div>
      </div>

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500 }}
        >
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 hover:opacity-75">
            <X size={14} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
        </div>
      )}
    </div>
  );
}
