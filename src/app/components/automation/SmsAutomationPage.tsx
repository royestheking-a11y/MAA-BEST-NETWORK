import { useState, useEffect } from "react";
import {
  MessageSquare, Send, Search, Plus, CheckCircle2, AlertTriangle,
  X, RefreshCw, Key, Shield, Radio, Smartphone, Users, Filter,
  Layers, Clock, CheckCheck, FileText, Sparkles, Sliders
} from "lucide-react";
import {
  automationStore, type SmsGatewayConfig
} from "./automationData";

interface SmsAutomationPageProps {
  onNavigate?: (page: string) => void;
}

interface OutboundSmsLog {
  id: string;
  recipient: string;
  customerName: string;
  phone: string;
  message: string;
  smsCount: number;
  provider: string;
  status: "delivered" | "sent" | "failed";
  timestamp: string;
}

const INITIAL_LOGS: OutboundSmsLog[] = [
  { id: "SMS-9921", recipient: "Rahim Uddin", customerName: "Rahim Uddin", phone: "01711-223344", message: "Dear Customer, bill payment of ৳1,200 for Aug 2026 received via bKash. TrxID: TXN-88312. Thank you! - MAA BEST NETWORK", smsCount: 1, provider: "Greenweb", status: "delivered", timestamp: "12 mins ago" },
  { id: "SMS-9920", recipient: "Nasrin Begum", customerName: "Nasrin Begum", phone: "01819-334455", message: "Dear Customer, your internet bill of ৳1,500 for August 2026 is due. Pay via bKash: 01788-990011 to avoid auto-disconnection.", smsCount: 1, provider: "Greenweb", status: "delivered", timestamp: "35 mins ago" },
  { id: "SMS-9919", recipient: "Kalkini Somitir Hat Broadcast", customerName: "164 Subscribers", phone: "Multiple", message: "Notice: Scheduled fiber maintenance in Somitir Hat from 2:00 AM to 4:00 AM tonight. Service will resume shortly. - MAA BEST NETWORK", smsCount: 1, provider: "Greenweb", status: "delivered", timestamp: "2 hours ago" },
  { id: "SMS-9918", recipient: "Karim Hossain", customerName: "Karim Hossain", phone: "01912-887766", message: "Dear Customer, your PPPoE account password has been updated. New credentials sent to email. - MAA BEST NETWORK", smsCount: 1, provider: "Greenweb", status: "delivered", timestamp: "4 hours ago" },
];

export function SmsAutomationPage({ onNavigate }: SmsAutomationPageProps) {
  const [config, setConfig] = useState<SmsGatewayConfig>(automationStore.getSms());
  const [logs, setLogs] = useState<OutboundSmsLog[]>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState<"broadcast" | "logs" | "settings">("broadcast");
  const [toast, setToast] = useState("");

  // Broadcast state
  const [targetAudience, setTargetAudience] = useState<"all" | "due" | "kalkini" | "sadar" | "custom">("due");
  const [broadcastMsg, setBroadcastMsg] = useState("Dear {name}, your MAA BEST NETWORK bill of ৳{due_amount} for August 2026 is due. Pay easily via bKash: https://pay.maabestnetwork.com/{cust_id}");
  const [customPhoneList, setCustomPhoneList] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Test SMS State
  const [testPhone, setTestPhone] = useState("01712345678");
  const [testText, setTestText] = useState("Dear Customer, your internet bill of ৳1,000 for August 2026 is due. Pay via bKash: 01788-990011. - MAA BEST NETWORK");

  useEffect(() => {
    return automationStore.subscribe(() => {
      setConfig(automationStore.getSms());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleTestSms = () => {
    if (!testPhone || !testText) return;
    const newLog: OutboundSmsLog = {
      id: `SMS-${Math.floor(1000 + Math.random() * 9000)}`,
      recipient: "Test Subscriber",
      customerName: "Test Subscriber",
      phone: testPhone,
      message: testText,
      smsCount: Math.ceil(testText.length / 160) || 1,
      provider: config.provider.toUpperCase(),
      status: "delivered",
      timestamp: "Just now"
    };
    setLogs([newLog, ...logs]);
    automationStore.updateSms({ ...config, balance: Math.max(0, config.balance - config.ratePerSms) });
    showToast(`✓ Test SMS transmitted to ${testPhone} via ${config.provider.toUpperCase()} Gateway!`);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;

    setIsSending(true);
    setTimeout(() => {
      const recipientLabel =
        targetAudience === "all" ? "All 191 Subscribers" :
        targetAudience === "due" ? "45 Overdue Subscribers" :
        targetAudience === "kalkini" ? "Kalkini Somitir Hat Subscribers (164)" :
        targetAudience === "sadar" ? "Madaripur Sadar Subscribers" :
        "Custom Recipient List";

      const count = targetAudience === "due" ? 847 : targetAudience === "all" ? 12840 : 420;

      const newLog: OutboundSmsLog = {
        id: `SMS-${Math.floor(1000 + Math.random() * 9000)}`,
        recipient: recipientLabel,
        customerName: `${count} Recipients`,
        phone: targetAudience === "custom" ? customPhoneList : "Bulk Masking Queue",
        message: broadcastMsg,
        smsCount: Math.ceil(broadcastMsg.length / 160) || 1,
        provider: config.provider.toUpperCase(),
        status: "delivered",
        timestamp: "Just now"
      };

      setLogs([newLog, ...logs]);
      setIsSending(false);
      showToast(`✓ Broadcast campaign queued & dispatched to ${recipientLabel} via Sender ID '${config.senderId}'!`);
    }, 1000);
  };

  const handleSaveConfig = () => {
    automationStore.updateSms(config);
    showToast("✓ SMS Gateway credentials & Sender ID updated successfully!");
  };

  const smsChars = broadcastMsg.length;
  const smsSegments = Math.ceil(smsChars / 160) || 1;

  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--foreground)",
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-3xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Smartphone size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-foreground">
                SMS Gateway & Automated Notifications
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Gateway Balance: ৳{config.balance.toLocaleString()} ({Math.round(config.balance / config.ratePerSms).toLocaleString()} SMS Credits)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              BTRC-approved sender masking ({config.senderId}), automated billing reminders, payment receipts & bulk outage campaigns.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-primary hover:opacity-95 text-xs font-bold text-white shadow-xs cursor-pointer">
          <Key size={14} />
          <span>Save Gateway Settings</span>
        </button>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("broadcast")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "broadcast" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground bg-card border border-border"
          }`}>
          <Send size={14} />
          <span>SMS Broadcast Campaign</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "logs" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground bg-card border border-border"
          }`}>
          <Clock size={14} />
          <span>Outbound SMS Transmission Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "settings" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground bg-card border border-border"
          }`}>
          <Key size={14} />
          <span>Gateway Provider & API Config</span>
        </button>
      </div>

      {/* ── TAB 1: BROADCAST CAMPAIGN DISPATCHER ─────────────────────────────── */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-card p-5 rounded-3xl border border-border shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-foreground">Compose Broadcast Campaign</h3>
              <p className="text-xs text-muted-foreground">Send transactional bill reminders, maintenance notices, or special greetings to subscribers.</p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1.5">TARGET RECIPIENT AUDIENCE</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: "due", label: "45 Overdue Due Only", sub: "Aug 2026 Invoices" },
                    { id: "all", label: "All Active Subscribers", sub: "191 Clients" },
                    { id: "kalkini", label: "Kalkini POP Subscribers", sub: "Zone Outage Notice" },
                    { id: "custom", label: "Custom Phone List", sub: "Comma separated" },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTargetAudience(opt.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        targetAudience === opt.id
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-2xs"
                          : "bg-muted/40 border-border text-foreground hover:bg-muted font-medium"
                      }`}>
                      <div className="text-xs font-bold truncate">{opt.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {targetAudience === "custom" && (
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">PHONE NUMBERS (COMMA SEPARATED)</label>
                  <input
                    value={customPhoneList}
                    onChange={e => setCustomPhoneList(e.target.value)}
                    placeholder="01711223344, 01819223344, 01912334455"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-muted-foreground">MESSAGE CONTENT</label>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {smsChars} chars · <strong>{smsSegments} SMS Credit(s)</strong> per user
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-border bg-muted/40 text-foreground font-medium outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Dynamic Tags */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-1.5">
                <div className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles size={13} className="text-primary" />
                  <span>Insert Dynamic Personalization Placeholders:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {["{name}", "{due_amount}", "{due_date}", "{package}", "{cust_id}", "{bkash_link}"].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setBroadcastMsg(prev => `${prev} ${tag}`)}
                      className="px-2 py-0.5 rounded-lg bg-card border border-border hover:bg-muted text-primary font-mono font-bold cursor-pointer">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-muted-foreground font-medium">
                  Sender Masking: <strong className="text-foreground">{config.senderId}</strong> via {config.provider.toUpperCase()}
                </div>
                <button
                  type="submit"
                  disabled={isSending || !broadcastMsg.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-primary hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer">
                  <Send size={14} />
                  <span>{isSending ? "Dispatching Queue..." : "Dispatch SMS Broadcast"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Test Card */}
          <div className="bg-card p-5 rounded-3xl border border-border shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-foreground">Live Gateway Test Probe</h3>
            <p className="text-xs text-muted-foreground">Send a real test SMS to your mobile phone right now to verify gateway connectivity.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">TEST MOBILE NUMBER</label>
                <input
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">TEST SMS MESSAGE</label>
                <textarea
                  rows={3}
                  value={testText}
                  onChange={e => setTestText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-xs outline-none resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleTestSms}
                className="w-full py-2.5 rounded-2xl bg-primary hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                <Send size={14} />
                <span>Send 1x Test SMS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: OUTBOUND TRANSMISSION LOGS ────────────────────────────────── */}
      {activeTab === "logs" && (
        <div className="bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-extrabold text-foreground">Outbound SMS Transmission Logs</h3>
              <p className="text-xs text-muted-foreground">Live delivery audit trail for transactional billing notifications and SMS campaigns.</p>
            </div>
            <button
              onClick={() => showToast("Refreshed outbound SMS transmission queue.")}
              className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1 cursor-pointer">
              <RefreshCw size={13} /> Refresh Logs
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">SMS ID / Recipient</th>
                  <th className="p-3.5">Phone Number</th>
                  <th className="p-3.5">Message Excerpt</th>
                  <th className="p-3.5">Credits</th>
                  <th className="p-3.5">Gateway Provider</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-foreground">{log.recipient}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{log.id}</div>
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-foreground">
                      {log.phone}
                    </td>
                    <td className="p-3.5 text-muted-foreground max-w-xs truncate">
                      {log.message}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-foreground">
                      {log.smsCount} SMS
                    </td>
                    <td className="p-3.5 font-semibold text-foreground">
                      {log.provider}
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {log.timestamp}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: GATEWAY SETTINGS & CREDENTIALS ────────────────────────────── */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-card p-5 rounded-3xl border border-border shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-foreground">SMS Gateway Configuration</h3>
            <p className="text-xs text-muted-foreground">Manage your aggregator API credentials and approved BTRC Sender ID.</p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">SMS AGGREGATOR PROVIDER</label>
                <select
                  value={config.provider}
                  onChange={e => setConfig({ ...config, provider: e.target.value as any })}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                  <option value="greenweb">Greenweb Bangladesh (Tier-1 Dedicated)</option>
                  <option value="teletalk">Teletalk SMS Masking Gateway</option>
                  <option value="infobip">Infobip Enterprise</option>
                  <option value="onnorokom">Onnorokom SMS</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">APPROVED SENDER MASK ID</label>
                <input
                  value={config.senderId}
                  onChange={e => setConfig({ ...config, senderId: e.target.value })}
                  placeholder="MAA_BEST"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-bold font-mono outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">API KEY / TOKEN</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">PER SMS RATE (BDT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.ratePerSms}
                  onChange={e => setConfig({ ...config, ratePerSms: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-card p-5 rounded-3xl border border-border shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-foreground">Auto-Trigger Rules</h3>
            <p className="text-xs text-muted-foreground">Automated event webhooks that fire SMS without manual intervention.</p>

            <div className="space-y-3 text-xs">
              {[
                { title: "Auto-Send Payment Received Receipt", desc: "Instant SMS receipt whenever a payment is confirmed via bKash/Nagad/Cash.", active: true },
                { title: "Monthly Invoice Generation Notice", desc: "Sent on the 1st of every month with total amount and due date.", active: true },
                { title: "Pre-Suspension Reminder (48h)", desc: "Sent 2 days before account isolation for unpaid invoices.", active: true },
                { title: "Service Re-activation Confirmation", desc: "Sent immediately when PPPoE session is unblocked.", active: true },
              ].map((rule, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">{rule.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{rule.desc}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-[#130606] text-white text-xs font-semibold animate-slideUp"
        >
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 hover:opacity-75 cursor-pointer">
            <X size={14} className="text-white/60" />
          </button>
        </div>
      )}
    </div>
  );
}
