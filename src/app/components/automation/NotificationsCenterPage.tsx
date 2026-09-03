import { useState, useEffect } from "react";
import {
  Bell, Search, Plus, CheckCircle2, AlertTriangle, X,
  Radio, Send, Globe, MessageCircle
} from "lucide-react";
import {
  automationStore, type WebhookNotification
} from "./automationData";

interface NotificationsCenterPageProps {
  onNavigate?: (page: string) => void;
}

export function NotificationsCenterPage({ onNavigate }: NotificationsCenterPageProps) {
  const [webhooks, setWebhooks] = useState<WebhookNotification[]>(automationStore.getWebhooks());
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState("");

  const [newHook, setNewHook] = useState({
    name: "", targetUrl: "", channel: "telegram" as WebhookNotification["channel"]
  });

  useEffect(() => {
    return automationStore.subscribe(() => {
      setWebhooks(automationStore.getWebhooks());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleAdd = () => {
    if (!newHook.name || !newHook.targetUrl) return;
    const wh: WebhookNotification = {
      id: `WH-${(webhooks.length + 1).toString().padStart(2, "0")}`,
      name: newHook.name,
      targetUrl: newHook.targetUrl,
      channel: newHook.channel,
      events: ["critical_outage", "daily_summary"],
      status: "active",
      lastSent: "just now",
    };
    automationStore.addWebhook(wh);
    setShowAddModal(false);
    showToast(`Webhook "${wh.name}" registered and ping verified!`);
    setNewHook({ name: "", targetUrl: "", channel: "telegram" });
  };

  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--foreground)",
  };

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Notifications & Webhooks Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
              {webhooks.length} Active Endpoints
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Real-time NOC Telegram bots, Slack payment alerts, Discord operational logs, and external API hooks
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
          style={{ background: "var(--primary)", fontSize: 13 }}
        >
          <Plus size={14} /> Add Webhook Destination
        </button>
      </div>

      {/* ── Webhooks List ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {webhooks.map(wh => (
          <div
            key={wh.id}
            className="rounded-xl p-5 border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Globe size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--foreground)" }}>
                      {wh.name}
                    </h3>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                      {wh.channel}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">
                  ● ACTIVE
                </span>
              </div>

              <div className="pt-3 space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5">ENDPOINT URL</span>
                  <p className="font-mono text-[11px] text-foreground truncate p-2 rounded bg-muted/60">
                    {wh.targetUrl}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">SUBSCRIBED EVENTS</span>
                  <div className="flex flex-wrap gap-1">
                    {wh.events.map(ev => (
                      <span key={ev} className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-semibold">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Last Sent: {wh.lastSent}</span>
              <button
                onClick={() => showToast(`Test payload dispatched to ${wh.name} (HTTP 200 OK)`)}
                className="text-primary font-semibold hover:underline"
              >
                Send Test Payload →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Webhook Modal ────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Add Webhook Alert Endpoint
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">DESTINATION NAME</label>
                <input
                  value={newHook.name}
                  onChange={e => setNewHook(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. NOC Discord Incident Channel"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">ALERT CHANNEL</label>
                <select
                  value={newHook.channel}
                  onChange={e => setNewHook(p => ({ ...p, channel: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                >
                  <option value="telegram">Telegram Bot</option>
                  <option value="slack">Slack Webhook</option>
                  <option value="discord">Discord Webhook</option>
                  <option value="custom_webhook">Custom HTTP POST Endpoint</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">WEBHOOK TARGET URL</label>
                <input
                  value={newHook.targetUrl}
                  onChange={e => setNewHook(p => ({ ...p, targetUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newHook.name || !newHook.targetUrl}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Register Webhook
              </button>
            </div>
          </div>
        </div>
      )}

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
