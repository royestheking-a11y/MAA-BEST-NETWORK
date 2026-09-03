import { useState } from "react";
import {
  Bot, Send, Sparkles, Zap, Terminal, Server, Shield,
  CheckCircle2, RefreshCw, User, HelpCircle
} from "lucide-react";

interface AiAssistantPageProps {
  onNavigate?: (page: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export function AiAssistantPage({ onNavigate }: AiAssistantPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "M-1",
      sender: "ai",
      text: "Hello! I am your ISP Operating System Copilot. I can analyze MikroTik traffic spikes, detect revenue leakages, generate customer retention SMS, and diagnose OLT optical degradation. How can I assist your NOC or billing team today?",
      timestamp: "Just now",
      suggestions: [
        "Why is Gulshan POP down right now?",
        "Check top 5 customers with optical signal degradation",
        "Generate SMS reminder template for overdue users",
        "Summarize today's bKash vs Nagad collections"
      ]
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `U-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "I analyzed your query against live MikroTik telemetry and the billing ledger.";
      const q = userText.toLowerCase();

      if (q.includes("gulshan") || q.includes("down")) {
        reply = "⚠️ **Gulshan POP Status Alert**:\n- Incident #INC-881 is active (Power Failure).\n- 1,890 customers affected.\n- Generator starter tripped. Technician Tanvir Hasan is on-site with an estimated restoration time of 30 minutes.";
      } else if (q.includes("optical") || q.includes("signal") || q.includes("degradation")) {
        reply = "🔍 **Optical RX Power Diagnostics**:\n- 4 ONUs detected with signal worse than -27 dBm.\n- Worst: CUST-10003 (Nasrin Begum) on EPON 0/2:2 is reading **-27.8 dBm**.\n- Recommended Action: Clean SC/APC patch cord and verify optical splitter insertion loss.";
      } else if (q.includes("sms") || q.includes("reminder")) {
        reply = "✉️ **Generated SMS Template**:\n`Dear [Customer_Name], your ISP bill of ৳[Amount] for [Month] is due. Avoid line suspension by paying today via bKash Merchant 01788-990011.`\nWould you like me to queue this into the Automation Engine?";
      } else if (q.includes("collection") || q.includes("bkash") || q.includes("revenue")) {
        reply = "💰 **Today's Financial Summary**:\n- Total Realized Today: ৳63,200\n- bKash IPN: ৳48,200 (76.2%)\n- Nagad Business: ৳15,000 (23.8%)\n- Unpaid Invoices Remaining: 847 subscribers (৳6.8 Lac).";
      } else {
        reply = `I have cross-checked the database regarding "${userText}". All core systems (CCR2004, CCR2016, Huawei MA5800) are stable, with 12,840 total customers active and 8.84 Gbps aggregate throughput.`;
      }

      const aiMsg: ChatMessage = {
        id: `AI-${Date.now()}`,
        sender: "ai",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              AI Network & Billing Copilot
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-600 text-white">
              <Sparkles size={12} /> Gemini NOC Agent Live
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Natural language network diagnostics, revenue anomaly troubleshooting, and automated CLI command assistance
          </p>
        </div>
      </div>

      {/* ── Chat Container ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-muted/10">
          {messages.map(m => {
            const isAi = m.sender === "ai";
            return (
              <div key={m.id} className={`flex gap-3 ${isAi ? "items-start" : "items-start flex-row-reverse"}`}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm"
                  style={{
                    background: isAi ? "linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)" : "var(--primary)",
                    color: "white",
                  }}
                >
                  {isAi ? <Bot size={16} /> : <User size={16} />}
                </div>

                <div className="space-y-2 max-w-2xl">
                  <div
                    className="p-4 rounded-2xl text-xs space-y-2 leading-relaxed shadow-sm"
                    style={{
                      background: isAi ? "var(--card)" : "var(--primary)",
                      color: isAi ? "var(--foreground)" : "white",
                      border: isAi ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    <span className={`block text-[10px] ${isAi ? "text-muted-foreground" : "text-white/75"} text-right`}>
                      {m.timestamp}
                    </span>
                  </div>

                  {m.suggestions && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(s)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors text-left"
                        >
                          ⚡ {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bot size={16} className="text-purple-600 animate-spin" />
              <span>Analyzing ISP network metrics & generating response...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border bg-card flex items-center gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend(input)}
            placeholder="Ask anything (e.g. 'Why is Mirpur CPU high?' or 'Generate late fee SMS broadcast')..."
            className="flex-1 px-4 py-3 rounded-xl outline-none text-xs"
            style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="px-5 py-3 rounded-xl bg-primary text-white font-semibold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}
