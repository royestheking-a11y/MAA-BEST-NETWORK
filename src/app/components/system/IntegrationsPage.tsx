import { useState } from "react";
import {
  Link as LinkIcon, CheckCircle2, AlertTriangle, X,
  Server, Smartphone, Globe, Shield, RefreshCw, Key
} from "lucide-react";

interface IntegrationsPageProps {
  onNavigate?: (page: string) => void;
}

export function IntegrationsPage({ onNavigate }: IntegrationsPageProps) {
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const integrations = [
    { name: "MikroTik RouterOS REST & API", type: "Core Network", status: "connected", icon: Server, desc: "Port 8728 API & SSL REST for PPPoE secret provisioning & dynamic queue control" },
    { name: "Huawei / ZTE SNMP MIB Poller", type: "Optical Infrastructure", status: "connected", icon: Globe, desc: "SNMP v2c/v3 telemetry engine for OLT PON port & subscriber ONT status" },
    { name: "bKash Direct Merchant Checkout", type: "MFS Gateway", status: "connected", icon: Smartphone, desc: "Real-time Instant Payment Notification (IPN) webhook for automated recharge" },
    { name: "Nagad Business Gateway", type: "MFS Gateway", status: "connected", icon: Smartphone, desc: "QR payment & API settlement integration with auto invoice clearance" },
    { name: "SSLCommerz Payment Gateway", type: "Card & Internet Banking", status: "connected", icon: Globe, desc: "Visa, MasterCard, and DBBL Nexus debit card payment gateway" },
    { name: "Greenweb / Teletalk SMS Masking", type: "Telecom Gateway", status: "connected", icon: Smartphone, desc: "BTRC-approved alphanumeric sender masking for transactional customer SMS" },
  ];

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              API & Gateway Integrations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
              6 Active Gateways Connected
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Central connectors for RouterOS, GPON OLT SNMP, MFS payment gateways, and telecommunication SMS hubs
          </p>
        </div>

        <button
          onClick={() => showToast("All 6 integration API health checks verified! (HTTP 200 OK)")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-xs hover:bg-muted transition-colors cursor-pointer"
        >
          <RefreshCw size={14} /> Ping All APIs
        </button>
      </div>

      {/* ── Integrations Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {integrations.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="rounded-xl p-5 border border-border bg-card shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--foreground)" }}>
                        {item.name}
                      </h3>
                      <span className="text-[11px] text-muted-foreground">{item.type}</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={11} /> Connected
                  </span>
                </div>

                <p className="text-xs text-muted-foreground pt-3 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">Latency: 14ms · TLS 1.3</span>
                <button
                  onClick={() => showToast(`Opening credentials manager for ${item.name}`)}
                  className="text-primary font-semibold hover:underline"
                >
                  Configure API Keys →
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
        </div>
      )}
    </div>
  );
}
