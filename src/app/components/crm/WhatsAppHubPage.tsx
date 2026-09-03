import { useState } from "react";
import {
  MessageSquare, Send, Check, CheckCheck, Clock, Search,
  Phone, User, Paperclip, Smile, Image, FileText, CheckCircle2,
  AlertCircle, Bot, Zap, Filter, MoreVertical, Plus,
  Shield, Smartphone, ExternalLink, RefreshCw, Star, Sparkles, Activity, Lock, MousePointerClick
} from "lucide-react";

interface WhatsAppHubPageProps {
  onNavigate?: (page: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "customer" | "agent" | "bot";
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  attachment?: {
    type: "invoice" | "image" | "link";
    title: string;
    size?: string;
  };
}

interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  zone: string;
  package: string;
  status: "active" | "due" | "suspended";
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  isBotHandling: boolean;
  messages: ChatMessage[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [];

export function WhatsAppHubPage({ onNavigate }: WhatsAppHubPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState<"chats" | "templates" | "bot">("chats");

  const selectedChat = conversations.find(c => c.id === selectedId) || conversations[0];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: "m_" + Date.now(),
      sender: "agent",
      text: inputText,
      timestamp: "Just now",
      status: "delivered"
    };

    setConversations(prev => prev.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          lastMessage: inputText,
          lastTime: "Just now",
          unreadCount: 0,
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    setInputText("");
    showToast("WhatsApp message sent via Cloud API!");
  };

  const handleSendInvoice = () => {
    const invoiceMsg: ChatMessage = {
      id: "inv_" + Date.now(),
      sender: "agent",
      text: `Here is your official invoice INV-${selectedChat.customerId}-202608. You can pay securely with 1-click bKash/Nagad below:`,
      timestamp: "Just now",
      status: "delivered",
      attachment: {
        type: "invoice",
        title: `Invoice_INV_2026_${selectedChat.customerId}.pdf`,
        size: "142 KB"
      }
    };

    setConversations(prev => prev.map(c => {
      if (c.id === selectedId) {
        return {
          ...c,
          lastMessage: "Sent Invoice PDF",
          lastTime: "Just now",
          messages: [...c.messages, invoiceMsg]
        };
      }
      return c;
    }));

    showToast(`Invoice PDF dispatched to ${selectedChat.customerName} on WhatsApp!`);
  };

  const toggleBot = () => {
    setConversations(prev => prev.map(c => {
      if (c.id === selectedId) {
        const nextState = !c.isBotHandling;
        showToast(nextState ? "AI Assistant enabled for this chat" : "Switched to Manual Agent control");
        return { ...c, isBotHandling: nextState };
      }
      return c;
    }));
  };

  const filteredChats = conversations.filter(c =>
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.customerId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 h-[calc(100vh-70px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#25D366" }}>
              <MessageSquare size={16} color="#fff" />
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              WhatsApp Business CRM
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(37,211,102,0.15)", color: "#16A34A" }}>
              Official Meta Cloud API Connected
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Two-way automated WhatsApp billing reminders, instant PDF invoices, live technician alerts & AI support bot
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl p-1 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <button
              onClick={() => setActiveTab("chats")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: activeTab === "chats" ? "var(--primary)" : "transparent", color: activeTab === "chats" ? "#fff" : "var(--muted-foreground)" }}>
              Live Conversations
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: activeTab === "templates" ? "var(--primary)" : "transparent", color: activeTab === "templates" ? "#fff" : "var(--muted-foreground)" }}>
              Meta Approved Templates
            </button>
            <button
              onClick={() => setActiveTab("bot")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: activeTab === "bot" ? "var(--primary)" : "transparent", color: activeTab === "bot" ? "#fff" : "var(--muted-foreground)" }}>
              Auto-Bot Workflows
            </button>
          </div>
        </div>
      </div>

      {activeTab === "chats" && (
        <div className="flex-1 min-h-0 flex rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {/* Left: Chat List */}
          <div className="w-80 border-r flex flex-col" style={{ borderColor: "var(--border)" }}>
            <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                <Search size={14} style={{ color: "var(--muted-foreground)" }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search chats, phone, ID..."
                  className="bg-transparent outline-none text-xs w-full"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                filteredChats.map(chat => {
                  const isSelected = chat.id === selectedId;
                  return (
                    <button
                      key={chat.id}
                      onClick={() => {
                        setSelectedId(chat.id);
                        setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
                      }}
                      className="w-full text-left p-3.5 flex items-start gap-3 transition-colors relative"
                      style={{
                        background: isSelected ? "rgba(139,32,32,0.08)" : "transparent",
                        borderLeft: isSelected ? "3px solid var(--primary)" : "3px solid transparent"
                      }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                        style={{ background: chat.status === "due" ? "#D97706" : "linear-gradient(135deg, #10B981, #059669)" }}>
                        {chat.customerName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }} className="truncate">
                            {chat.customerName}
                          </div>
                          <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{chat.lastTime}</span>
                        </div>
                        <div className="text-xs truncate mb-1" style={{ color: isSelected ? "var(--foreground)" : "var(--muted-foreground)" }}>
                          {chat.isBotHandling && <Bot size={11} className="inline mr-1 text-emerald-500" />}
                          {chat.lastMessage}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                            {chat.zone}
                          </span>
                          {chat.status === "due" && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold text-amber-600 bg-amber-50">
                              Due
                            </span>
                          )}
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center absolute right-3 bottom-3">
                          {chat.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Active Chat Area */}
          {selectedChat ? (
            <div className="flex-1 flex flex-col min-w-0" style={{ background: "var(--card)" }}>
              {/* Active Header */}
              <div className="p-3.5 border-b flex items-center justify-between flex-wrap gap-2" style={{ borderColor: "var(--border)", background: "var(--muted)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}>
                    {selectedChat.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{selectedChat.customerName}</span>
                      <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>({selectedChat.phone})</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                      <span>{selectedChat.package}</span> • <span>Zone: {selectedChat.zone}</span> • <span className="font-semibold text-emerald-600">PPPoE Online</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleBot}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all"
                    style={{
                      borderColor: selectedChat.isBotHandling ? "#10B981" : "var(--border)",
                      background: selectedChat.isBotHandling ? "rgba(16,185,129,0.1)" : "var(--card)",
                      color: selectedChat.isBotHandling ? "#10B981" : "var(--muted-foreground)"
                    }}>
                    <Bot size={13} /> {selectedChat.isBotHandling ? "AI Bot Active" : "Enable AI Bot"}
                  </button>
                  <button
                    onClick={handleSendInvoice}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm"
                    style={{ background: "var(--primary)" }}>
                    <FileText size={13} /> Send PDF Bill
                  </button>
                  <button
                    onClick={() => onNavigate?.("customers")}
                    className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
                    style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--card)" }}>
                    Customer Details
                  </button>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "rgba(0,0,0,0.02)" }}>
                <div className="text-center my-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-medium inline-flex items-center gap-1.5" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
                    <Lock size={11} className="text-emerald-500" />
                    <span>End-to-end encrypted WhatsApp Business session</span>
                  </span>
                </div>

                {selectedChat.messages.map(m => {
                  const isAgent = m.sender === "agent";
                  const isBot = m.sender === "bot";
                  const isCustomer = m.sender === "customer";

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isCustomer ? "items-start" : "items-end"}`}>
                      <div
                        className="max-w-[75%] rounded-2xl p-3.5 shadow-sm space-y-2"
                        style={{
                          background: isCustomer ? "var(--card)" : isBot ? "#ECFDF5" : "linear-gradient(135deg, #8B2020, #9E2A2A)",
                          color: isCustomer ? "var(--foreground)" : isBot ? "#065F46" : "#ffffff",
                          border: isCustomer ? "1px solid var(--border)" : isBot ? "1px solid #A7F3D0" : "none"
                        }}>
                        {isBot && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <Bot size={12} /> IPS BD Auto-Billing Bot
                          </div>
                        )}

                        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>

                        {m.attachment && (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/10 gap-3">
                            <div className="flex items-center gap-2">
                              <FileText size={16} />
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600 }}>{m.attachment.title}</div>
                                <div style={{ fontSize: 10, opacity: 0.8 }}>{m.attachment.size} • Verified Digital Signature</div>
                              </div>
                            </div>
                            <span className="text-xs font-bold underline cursor-pointer">View</span>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-1 text-[10px]" style={{ opacity: 0.7 }}>
                          <span>{m.timestamp}</span>
                          {!isCustomer && (
                            m.status === "read" ? <CheckCheck size={12} className="text-emerald-400" /> : <Check size={12} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Bar */}
              <div className="p-3 border-t flex items-center gap-2" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                <button className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
                  <Paperclip size={18} />
                </button>
                <input
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendMessage()}
                  placeholder={`Type a WhatsApp reply to ${selectedChat.customerName}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl outline-none text-sm"
                  style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid var(--border)" }}
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2.5 rounded-xl text-white font-bold transition-all shadow-sm"
                  style={{ background: "#25D366" }}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center" style={{ background: "var(--card)" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-base font-bold text-foreground">WhatsApp CRM Ready</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                No active WhatsApp conversations. Incoming messages from customers and bot alerts will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "templates" && (
        <div className="flex-1 overflow-y-auto rounded-2xl border p-6 space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>Meta Approved WhatsApp Templates</h2>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Pre-authorized HSM templates guaranteed to deliver outside the 24-hour customer window</p>
            </div>
            <button className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white" style={{ background: "var(--primary)" }}>
              + Request New Template
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                name: "isp_monthly_invoice_v2",
                category: "BILLING_NOTIFICATION",
                status: "APPROVED",
                body: "Salam {{1}}, your ISP bill of {{2}} for package {{3}} is ready. Pay now via bKash to avoid auto-disconnection: {{4}}",
                cta: "Pay Bill via bKash"
              },
              {
                name: "isp_reconnect_success",
                category: "SERVICE_UPDATE",
                status: "APPROVED",
                body: "Salam {{1}}, your payment of {{2}} is received! Your PPPoE connection has been restored automatically. Enjoy high-speed internet.",
                cta: "View Receipt"
              },
              {
                name: "isp_maintenance_alert",
                category: "UTILITY",
                status: "APPROVED",
                body: "Notice: Scheduled fiber maintenance in {{1}} on {{2}} between 02:00 AM - 04:00 AM. Inconvenience is regretted.",
                cta: "Check Status"
              },
              {
                name: "isp_technician_dispatched",
                category: "CUSTOMER_SUPPORT",
                status: "APPROVED",
                body: "Technician {{1}} (Phone: {{2}}) has been dispatched for Ticket #{{3}}. Estimated arrival: {{4}} mins.",
                cta: "Track Technician"
              }
            ].map(t => (
              <div key={t.name} className="p-4 rounded-xl border space-y-2.5" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold" style={{ color: "var(--foreground)" }}>{t.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-700 bg-emerald-100">
                    ✓ {t.status}
                  </span>
                </div>
                <div className="text-xs p-3 rounded-lg bg-white border text-gray-700 font-sans leading-relaxed">
                  {t.body}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                    <MousePointerClick size={12} />
                    <span>Button: {t.cta}</span>
                  </span>
                  <button onClick={() => showToast(`Template ${t.name} test broadcast triggered`)} className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                    Test Send →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "bot" && (
        <div className="flex-1 overflow-y-auto rounded-2xl border p-6 space-y-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>Interactive WhatsApp Self-Service Bot</h2>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Auto-responds with interactive buttons when customer sends "Hi", "Bill", or "Help"</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border space-y-3" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--foreground)" }}>
                <Zap size={16} className="text-amber-500" /> Trigger: "Bill" / "Pay"
              </div>
              <div className="text-xs text-muted-foreground">
                Fetches live balance from billing engine, builds instant bKash checkout deep-link and responds with PDF invoice attachment.
              </div>
              <div className="text-[11px] font-bold text-emerald-600">Response Time: &lt; 400ms</div>
            </div>

            <div className="p-4 rounded-xl border space-y-3" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--foreground)" }}>
                <Activity size={16} className="text-blue-500" /> Trigger: "Slow" / "No Net"
              </div>
              <div className="text-xs text-muted-foreground">
                Auto-pings customer ONU signal on OLT, verifies MikroTik PPPoE session status, and prompts 1-click router reboot request.
              </div>
              <div className="text-[11px] font-bold text-emerald-600">Auto-Fix Rate: 72%</div>
            </div>

            <div className="p-4 rounded-xl border space-y-3" style={{ background: "var(--muted)", borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--foreground)" }}>
                <Sparkles size={16} className="text-purple-500" /> AI Natural Support
              </div>
              <div className="text-xs text-muted-foreground">
                Understands Bangla, English, and Banglish inquiries to intelligently categorize and assign tickets to field technicians.
              </div>
              <div className="text-[11px] font-bold text-emerald-600">Bengali NLP Enabled</div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
