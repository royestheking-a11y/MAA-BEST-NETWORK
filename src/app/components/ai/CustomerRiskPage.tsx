import { useState } from "react";
import {
  BrainCircuit, Search, AlertTriangle, CheckCircle2, X,
  Phone, User, ShieldAlert, HeartHandshake, RefreshCw
} from "lucide-react";
import {
  INITIAL_CHURN_RISKS, type ChurnRiskCustomer
} from "./aiData";

interface CustomerRiskPageProps {
  onNavigate?: (page: string) => void;
}

export function CustomerRiskPage({ onNavigate }: CustomerRiskPageProps) {
  const [risks, setRisks] = useState<ChurnRiskCustomer[]>(INITIAL_CHURN_RISKS);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleRetain = (name: string) => {
    showToast(`Retention package and priority support ticket dispatched for ${name}!`);
  };

  const filtered = risks.filter(r => {
    const q = search.toLowerCase();
    return !search ||
      r.customerName.toLowerCase().includes(q) ||
      r.custId.toLowerCase().includes(q) ||
      r.zone.toLowerCase().includes(q) ||
      r.phone.includes(q);
  });

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Customer Churn Risk & Retention Predictor
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#FEE2E2", color: "#DC2626" }}>
              {risks.length} High-Risk Accounts Identified
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Predicts subscriber churn based on repeat optical complaints, peak-hour latency spikes, and payment delay velocity
          </p>
        </div>

        <button
          onClick={() => showToast("AI Churn Model re-scored across all active subscribers!")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors cursor-pointer"
        >
          <RefreshCw size={14} /> Re-Calculate Risk Scores
        </button>
      </div>

      {/* ── Risk Cards Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filtered.map(r => {
          const isExtreme = r.riskScore >= 80;
          return (
            <div
              key={r.id}
              className="rounded-2xl p-5 border shadow-sm space-y-4 bg-card"
              style={{
                borderColor: isExtreme ? "#FECACA" : "#FDE68A",
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm"
                    style={{
                      background: isExtreme ? "#FEE2E2" : "#FEF3C7",
                      color: isExtreme ? "#DC2626" : "#D97706",
                    }}
                  >
                    {r.riskScore}%
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--foreground)" }}>
                      {r.customerName}
                    </h3>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      {r.custId} · <span className="font-mono text-foreground">{r.phone}</span> · {r.zone}
                    </p>
                  </div>
                </div>

                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  style={{
                    background: isExtreme ? "#FEE2E2" : "#FEF3C7",
                    color: isExtreme ? "#DC2626" : "#D97706",
                  }}
                >
                  {isExtreme ? "Critical Risk" : "Elevated Risk"}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Primary Churn Indicator</span>
                  <span className="font-semibold text-red-600">{r.primaryRiskFactor}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">Recent Support Tickets</span>
                  <span className="font-mono font-bold text-foreground">{r.frequentTicketsCount} tickets in 30 days</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Monthly Billing Value</span>
                  <span className="font-mono font-bold text-emerald-600">৳{r.monthlyBill.toLocaleString()} / mo</span>
                </div>

                <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-foreground/90 mt-2">
                  <strong>AI Retention Action:</strong> {r.retentionRecommendation}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => handleRetain(r.customerName)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <HeartHandshake size={14} /> Apply Retention Offer
                </button>
              </div>
            </div>
          );
        })}
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
