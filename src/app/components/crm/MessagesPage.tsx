import { useState, useEffect } from "react";
import {
  MessageSquare, Search, Send, CheckCircle2, Clock, Phone,
  User, Check, X, RefreshCw, MessageCircle
} from "lucide-react";
import {
  crmStore, type CustomerMessage
} from "./crmData";

interface MessagesPageProps {
  onNavigate?: (page: string) => void;
}

export function MessagesPage({ onNavigate }: MessagesPageProps) {
  const [messages, setMessages] = useState<CustomerMessage[]>(crmStore.getMessages());
  const [search, setSearch] = useState("");
  const [selectedCust, setSelectedCust] = useState<string>("CUST-10001");
  const [newText, setNewText] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    return crmStore.subscribe(() => {
      setMessages(crmStore.getMessages());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleSend = () => {
    if (!newText.trim()) return;
    const msg: CustomerMessage = {
      id: `MSG-${Date.now().toString().slice(-4)}`,
      customerName: "Rahim Uddin",
      custId: selectedCust,
      phone: "01712-345678",
      type: "outbound",
      channel: "sms",
      text: newText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "delivered",
    };
    crmStore.sendMessage(msg);
    setNewText("");
    showToast("SMS transmitted via Teletalk / Greenweb Gateway!");
  };

  const conversations = [
    { custId: "CUST-10001", name: "Rahim Uddin", phone: "01712-345678", unread: 0, lastMsg: "Dear Rahim, Ticket #TCK-4421 has been assigned..." },
    { custId: "CUST-10004", name: "Fatema Begum", phone: "01911-556677", unread: 1, lastMsg: "Can you change my wifi name to Fatema_Home?" },
    { custId: "CUST-10002", name: "Karim Hossain", phone: "01819-112233", unread: 0, lastMsg: "Thank you for the quick bill payment confirmation." },
  ];

  const currentChatMessages = messages.filter(m => m.custId === selectedCust);
  const activeCustomer = conversations.find(c => c.custId === selectedCust) || conversations[0];

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Customer Messages & SMS Inbox
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
              Live MFS / SMS Gateway Connected
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Two-way customer SMS communications, OTP alerts, outage broadcasts, and WhatsApp chat desk
          </p>
        </div>
      </div>

      {/* ── Chat Container ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden shadow-sm border border-border bg-card flex h-[580px]">
        {/* Left: Contact List */}
        <div className="w-80 border-r border-border flex flex-col bg-muted/20">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg outline-none text-xs"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {conversations.map(c => (
              <button
                key={c.custId}
                onClick={() => setSelectedCust(c.custId)}
                className="w-full p-3 text-left flex items-start gap-3 transition-colors hover:bg-muted/40"
                style={{
                  background: selectedCust === c.custId ? "var(--muted)" : "transparent",
                  borderLeft: selectedCust === c.custId ? "3px solid var(--primary)" : "3px solid transparent",
                }}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground truncate">{c.name}</span>
                    {c.unread > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono block">{c.phone}</span>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{c.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Message Thread */}
        <div className="flex-1 flex flex-col justify-between bg-card">
          {/* Thread Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-sm">
                {activeCustomer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{activeCustomer.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{activeCustomer.phone} · {activeCustomer.custId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                <CheckCircle2 size={12} /> Masking: ISP-ALERT
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-muted/5">
            {currentChatMessages.map(m => {
              const isOut = m.type === "outbound";
              return (
                <div key={m.id} className={`flex ${isOut ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-md p-3.5 rounded-2xl shadow-sm text-xs space-y-1"
                    style={{
                      background: isOut ? "var(--primary)" : "var(--muted)",
                      color: isOut ? "white" : "var(--foreground)",
                    }}
                  >
                    <p>{m.text}</p>
                    <div className="flex items-center justify-end gap-1 text-[10px] opacity-75">
                      <span>{m.timestamp}</span>
                      {isOut && <Check size={11} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Composer */}
          <div className="p-3 border-t border-border flex items-center gap-2 bg-card">
            <input
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={`Send SMS reply to ${activeCustomer.name}...`}
              className="flex-1 px-4 py-2.5 rounded-xl outline-none text-xs"
              style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
            <button
              onClick={handleSend}
              disabled={!newText.trim()}
              className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Send size={13} /> Send SMS
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
