import { useState } from "react";
import {
  ShieldAlert, AlertTriangle, CheckCircle2, RefreshCw, X,
  Server, Zap, ArrowRight, ShieldCheck
} from "lucide-react";
import {
  INITIAL_LEAKAGES, type LeakageItem
} from "./aiData";

interface LeakageDetectorPageProps {
  onNavigate?: (page: string) => void;
}

export function LeakageDetectorPage({ onNavigate }: LeakageDetectorPageProps) {
  const [leakages, setLeakages] = useState<LeakageItem[]>(INITIAL_LEAKAGES);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleFix = (id: string) => {
    setLeakages(leakages.filter(l => l.id !== id));
    showToast(`Anomaly #${id} isolated and corrected on MikroTik / RADIUS backend!`);
  };

  const totalLoss = leakages.reduce((a, b) => a + b.estimatedLossPerMonth, 0);

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              AI Revenue Leakage & Rogue Session Detector
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#FEE2E2", color: "#DC2626" }}>
              {leakages.length} Anomalies Detected · Est. Loss: ৳{totalLoss.toLocaleString()} / Mo
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Cross-checks MikroTik live active secrets against CRM billing ledgers to discover unbilled sessions and queue mismatches
          </p>
        </div>

        <button
          onClick={() => showToast("Deep network audit completed. Scanning 12,840 PPPoE secrets...")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors"
        >
          <RefreshCw size={14} /> Scan MikroTik Fleet
        </button>
      </div>

      {/* ── Leakage List Container ───────────────────────────────────────────── */}
      <div className="space-y-4">
        {leakages.map(item => {
          const isCritical = item.severity === "critical";
          return (
            <div
              key={item.id}
              className="rounded-2xl p-5 border shadow-sm transition-colors flex items-start justify-between gap-4 flex-wrap bg-card"
              style={{
                borderColor: isCritical ? "#FECACA" : "#FDE68A",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isCritical ? "#FEE2E2" : "#FEF3C7",
                    color: isCritical ? "#DC2626" : "#D97706",
                  }}
                >
                  <ShieldAlert size={22} />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-primary">{item.id}</span>
                    <span
                      className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase"
                      style={{
                        background: isCritical ? "#FEE2E2" : "#FEF3C7",
                        color: isCritical ? "#DC2626" : "#D97706",
                      }}
                    >
                      {item.severity}
                    </span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>
                      {item.customerName} ({item.custId})
                    </h3>
                  </div>

                  <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 4 }}>
                    Zone: <span className="font-medium text-foreground">{item.zone}</span> · Plan: <span className="font-semibold text-foreground">{item.packageSpeed}</span> · Detected: {item.detectedAt}
                  </p>

                  <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-foreground/90 max-w-2xl">
                    <strong>AI Recommendation:</strong> {item.actionRecommendation}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground block">ESTIMATED REVENUE LOSS</span>
                  <span className="font-mono text-lg font-bold text-red-600">
                    ৳{item.estimatedLossPerMonth.toLocaleString()} / mo
                  </span>
                </div>

                <button
                  onClick={() => handleFix(item.id)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-white hover:opacity-90 transition-opacity shadow-sm flex items-center gap-1.5"
                >
                  <Zap size={13} /> Auto-Isolate Session
                </button>
              </div>
            </div>
          );
        })}

        {leakages.length === 0 && (
          <div className="rounded-2xl p-12 text-center border border-border bg-card shadow-sm space-y-2">
            <ShieldCheck size={36} className="mx-auto text-emerald-600" />
            <h3 className="font-bold text-base text-foreground">Zero Revenue Leakages Detected</h3>
            <p className="text-xs text-muted-foreground">All active PPPoE connections on core routers perfectly match CRM billing status.</p>
          </div>
        )}
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
