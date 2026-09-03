import { useState } from "react";
import {
  TicketCheck, MessageSquare, Clock, Circle, Plus, Search,
  ChevronRight, User, AlertTriangle, CheckCircle2, Pause, X,
  Zap, Send, Phone, ChevronLeft, ArrowLeft
} from "lucide-react";

interface Ticket {
  id: string; subject: string; customer: string; custId: string;
  zone: string; priority: "critical" | "high" | "medium" | "low";
  status: "open" | "assigned" | "in-progress" | "waiting" | "resolved" | "closed";
  assigned: string; created: string; updated: string; category: string;
  description?: string;
}

const initialTickets: Ticket[] = [
  { id: "TKT-1041", subject: "No internet since morning", customer: "Nasrin Begum", custId: "CUST-10003", zone: "Uttara", priority: "critical", status: "in-progress", assigned: "Tanvir Ahmed", created: "19 Aug, 9:14 AM", updated: "19 Aug, 11:22 AM", category: "Connectivity", description: "Customer called in saying internet stopped working around 7 AM. PPPoE shows connected on MikroTik but no traffic passing. OLT port checked — signal OK." },
  { id: "TKT-1040", subject: "Speed very slow — 2 Mbps on 20 Mbps plan", customer: "Rahim Uddin", custId: "CUST-10001", zone: "Mirpur", priority: "high", status: "assigned", assigned: "Rafiqul Islam", created: "19 Aug, 8:30 AM", updated: "19 Aug, 9:00 AM", category: "Speed Issue", description: "Customer reports sustained speed of only 2 Mbps. Speed test confirms issue. MikroTik queue policy under investigation." },
  { id: "TKT-1039", subject: "Cannot login to customer portal", customer: "Fatema Begum", custId: "CUST-10005", zone: "Gulshan", priority: "medium", status: "open", assigned: "Unassigned", created: "18 Aug, 7:41 PM", updated: "18 Aug, 7:41 PM", category: "Account", description: "Portal login fails with incorrect password message. Password reset email not received. Account exists and is active." },
  { id: "TKT-1038", subject: "Wrong invoice amount charged", customer: "Jamal Uddin", custId: "CUST-10004", zone: "Dhanmondi", priority: "medium", status: "waiting", assigned: "Billing Team", created: "18 Aug, 3:12 PM", updated: "19 Aug, 10:00 AM", category: "Billing", description: "Customer charged ৳3,000 instead of ৳2,500. Billing team reviewing transaction logs. Refund may be issued." },
  { id: "TKT-1037", subject: "ONU blinking orange light", customer: "Karim Hossain", custId: "CUST-10002", zone: "Mirpur", priority: "high", status: "in-progress", assigned: "Field Team-02", created: "17 Aug, 11:55 AM", updated: "19 Aug, 8:00 AM", category: "Hardware", description: "ONU device showing abnormal orange blink pattern. Field team dispatched. Possible fiber break on drop cable." },
  { id: "TKT-1036", subject: "Request to change billing date", customer: "Shirin Akter", custId: "CUST-10010", zone: "Mohammadpur", priority: "low", status: "resolved", assigned: "Billing Team", created: "16 Aug, 2:30 PM", updated: "17 Aug, 11:00 AM", category: "Billing", description: "Customer requested billing date change from 1st to 15th of month. Approved and updated in system." },
  { id: "TKT-1035", subject: "WiFi router provided by ISP not working", customer: "Monir Ahmed", custId: "CUST-10009", zone: "Uttara", priority: "medium", status: "closed", assigned: "Field Team-01", created: "15 Aug, 10:00 AM", updated: "16 Aug, 4:00 PM", category: "Hardware", description: "ISP-provided router stopped responding. Field team replaced unit with new device. Customer confirmed working." },
];

const CATEGORIES = ["Connectivity", "Speed Issue", "Account", "Billing", "Hardware", "OLT/GPON", "Other"];
const AGENTS = ["Tanvir Ahmed", "Rafiqul Islam", "Billing Team", "Field Team-01", "Field Team-02", "Support Team"];

const priorityConfig = {
  critical: { bg: "#FEE2E2", color: "#DC2626", label: "Critical", icon: Zap },
  high: { bg: "#FEF3C7", color: "#D97706", label: "High", icon: AlertTriangle },
  medium: { bg: "#DBEAFE", color: "#2563EB", label: "Medium", icon: Circle },
  low: { bg: "#F3F4F6", color: "#6B7280", label: "Low", icon: Circle },
};

const statusCfg = {
  "open": { bg: "#FEE2E2", color: "#DC2626", label: "Open", icon: Circle },
  "assigned": { bg: "#FEF3C7", color: "#D97706", label: "Assigned", icon: User },
  "in-progress": { bg: "#DBEAFE", color: "#2563EB", label: "In Progress", icon: Clock },
  "waiting": { bg: "#F3F4F6", color: "#6B7280", label: "Waiting", icon: Pause },
  "resolved": { bg: "#DCFCE7", color: "#16A34A", label: "Resolved", icon: CheckCircle2 },
  "closed": { bg: "#F3F4F6", color: "#374151", label: "Closed", icon: X },
};

const timeline = [
  { event: "Customer Created", time: "12 Jan 2024", color: "#8B2020", fill: true },
  { event: "Package Changed: 10 Mbps → 20 Mbps", time: "3 Apr 2024", color: "#2563EB", fill: true },
  { event: "Invoice #INV-10050 Generated", time: "1 May 2024", color: "#6B7280", fill: false },
  { event: "SMS: Bill reminder sent", time: "4 May 2024", color: "#D97706", fill: false },
  { event: "Payment Received: ৳1,200 via bKash", time: "4 May 2024", color: "#16A34A", fill: true },
  { event: "Internet Enabled (auto reconnect)", time: "4 May 2024", color: "#16A34A", fill: true },
  { event: "Ticket #TKT-0981 Created: Speed issue", time: "12 Jun 2024", color: "#DC2626", fill: true },
  { event: "Ticket Resolved by Tanvir Ahmed", time: "12 Jun 2024", color: "#16A34A", fill: true },
  { event: "Invoice #INV-10111 Generated", time: "1 Jul 2024", color: "#6B7280", fill: false },
  { event: "Payment Received: ৳1,200 via bKash", time: "2 Jul 2024", color: "#16A34A", fill: true },
  { event: "Invoice #INV-10204 Generated", time: "1 Aug 2024", color: "#6B7280", fill: false },
  { event: "Ticket #TKT-1040 Created: Speed very slow", time: "19 Aug 2024", color: "#D97706", fill: true },
];

function PriorityBadge({ priority }: { priority: Ticket["priority"] }) {
  const cfg = priorityConfig[priority];
  const Icon = cfg.icon;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: cfg.bg, fontSize: 10, fontWeight: 700, color: cfg.color, letterSpacing: "0.03em" }}><Icon size={9} />{cfg.label.toUpperCase()}</span>;
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const cfg = statusCfg[status];
  const Icon = cfg.icon;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: cfg.bg, fontSize: 11, fontWeight: 600, color: cfg.color }}><Icon size={10} />{cfg.label}</span>;
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl"
      style={{ background: "#130606", color: "#fff", fontSize: 13, fontWeight: 500, animation: "toastIn 0.2s ease" }}>
      <style>{`@keyframes toastIn{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />{msg}
      <button onClick={onClose} className="ml-2"><X size={14} style={{ color: "rgba(255,255,255,0.5)" }} /></button>
    </div>
  );
}

export function CRMPage({ initialTab = "tickets" }: { initialTab?: "tickets" | "timeline" }) {
  const [tab, setTab] = useState<"tickets" | "timeline">(initialTab === "timeline" ? "timeline" : "tickets");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [toast, setToast] = useState("");
  const [reply, setReply] = useState("");

  const [newTkt, setNewTkt] = useState({
    subject: "", customer: "", custId: "", category: "Connectivity",
    priority: "medium" as Ticket["priority"], description: "", assigned: "Unassigned",
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.subject.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const createTicket = () => {
    if (!newTkt.subject || !newTkt.customer) return;
    const id = `TKT-${(tickets.length + 1042).toString()}`;
    const now = `${new Date().getDate()} Aug, ${new Date().toLocaleTimeString("en-BD",{hour:"2-digit",minute:"2-digit"})}`;
    const ticket: Ticket = { ...newTkt, id, zone: "—", status: "open", created: now, updated: now };
    setTickets(prev => [ticket, ...prev]);
    setShowNewTicket(false);
    setNewTkt({ subject:"",customer:"",custId:"",category:"Connectivity",priority:"medium",description:"",assigned:"Unassigned" });
    showToast(`Ticket ${id} created`);
  };

  const updateStatus = (t: Ticket, status: Ticket["status"]) => {
    setTickets(prev => prev.map(x => x.id===t.id?{...x,status}:x));
    setSelectedTicket(prev => prev?{...prev,status}:null);
    showToast(`Ticket ${t.id} marked as ${statusCfg[status].label}`);
  };

  const sendReply = () => {
    if (!reply.trim()) return;
    setReply("");
    showToast("Reply sent to customer");
  };

  const counts = {
    open: tickets.filter(t=>t.status==="open").length,
    "in-progress": tickets.filter(t=>t.status==="in-progress").length,
    resolved: tickets.filter(t=>t.status==="resolved").length,
    closed: tickets.filter(t=>t.status==="closed").length,
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg outline-none";
  const inputStyle = { background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>CRM & Support</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Tickets, customer timeline and support operations</p>
        </div>
        <button onClick={() => setShowNewTicket(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white" style={{ background: "var(--primary)", fontSize: 13, fontWeight: 500 }}>
          <Plus size={14} /> New Ticket
        </button>
      </div>

      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {[{id:"tickets",label:"Tickets",icon:TicketCheck},{id:"timeline",label:"Customer Timeline",icon:Clock}].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id as any); setSelectedTicket(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ background: tab===t.id?"var(--primary)":"transparent", color: tab===t.id?"white":"var(--muted-foreground)", fontSize: 13, fontWeight: tab===t.id?600:400 }}>
              <Icon size={14} />{t.label}
            </button>
          );
        })}
      </div>

      {tab === "tickets" && (
        <>
          {/* Ticket detail view */}
          {selectedTicket ? (
            <div className="flex flex-col gap-4">
              <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 w-fit" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                <ArrowLeft size={14} /> Back to tickets
              </button>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 320px" }}>
                {/* Main ticket */}
                <div className="flex flex-col gap-4">
                  <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>{selectedTicket.id}</span>
                          <PriorityBadge priority={selectedTicket.priority} />
                          <StatusBadge status={selectedTicket.status} />
                        </div>
                        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--foreground)" }}>{selectedTicket.subject}</h2>
                        <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>Category: {selectedTicket.category} · Created: {selectedTicket.created}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: "var(--muted)" }}>
                      <p style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.7 }}>{selectedTicket.description || "No description provided."}</p>
                    </div>
                  </div>
                  {/* Reply */}
                  <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", marginBottom: 10 }}>REPLY TO CUSTOMER</p>
                    <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4} placeholder="Type your reply or update…" className="w-full px-3 py-2.5 rounded-lg outline-none resize-none mb-3" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }} />
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => showToast("Reminder SMS sent to customer")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: "#DBEAFE", border: "1px solid #93C5FD", fontSize: 12, color: "#2563EB", fontWeight: 500 }}><Phone size={13} /> Call/SMS</button>
                      <button onClick={sendReply} disabled={!reply.trim()} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white" style={{ background: !reply.trim()?"#ccc":"var(--primary)", fontSize: 13, fontWeight: 500 }}><Send size={14} /> Send Reply</button>
                    </div>
                  </div>
                </div>
                {/* Sidebar */}
                <div className="flex flex-col gap-3">
                  <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", marginBottom: 12 }}>CUSTOMER</p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center justify-center rounded-full text-white" style={{ width: 32, height: 32, background: "var(--primary)", fontSize: 11, fontWeight: 700 }}>
                        {selectedTicket.customer.split(" ").map(w=>w[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{selectedTicket.customer}</p>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)" }}>{selectedTicket.custId}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Zone: {selectedTicket.zone}</p>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", marginBottom: 10 }}>UPDATE STATUS</p>
                    <div className="flex flex-col gap-1.5">
                      {(["in-progress","waiting","resolved","closed"] as Ticket["status"][]).map(s => (
                        <button key={s} onClick={() => updateStatus(selectedTicket, s)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors"
                          style={{ background: selectedTicket.status===s?statusCfg[s].bg:"var(--muted)", border: `1px solid ${selectedTicket.status===s?statusCfg[s].color+"40":"var(--border)"}` }}>
                          {(() => { const Icon = statusCfg[s].icon; return <Icon size={12} style={{ color: statusCfg[s].color }} />; })()}
                          <span style={{ fontSize: 12, fontWeight: 500, color: statusCfg[s].color }}>{statusCfg[s].label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", marginBottom: 8 }}>ASSIGNED TO</p>
                    <select value={selectedTicket.assigned} onChange={e => { setTickets(prev=>prev.map(x=>x.id===selectedTicket.id?{...x,assigned:e.target.value}:x)); setSelectedTicket(prev=>prev?{...prev,assigned:e.target.value}:null); showToast(`Assigned to ${e.target.value}`); }} className="w-full px-3 py-2.5 rounded-lg outline-none" style={inputStyle}>
                      <option>Unassigned</option>
                      {AGENTS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                {[{label:"Open",value:counts.open,color:"#DC2626",bg:"#FEE2E2"},{label:"In Progress",value:counts["in-progress"],color:"#2563EB",bg:"#DBEAFE"},{label:"Resolved",value:counts.resolved,color:"#16A34A",bg:"#DCFCE7"},{label:"Closed",value:counts.closed,color:"#6B7280",bg:"#F3F4F6"}].map(s => (
                  <div key={s.label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: s.color }}>{s.value}</p>
                    <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="relative w-64">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…"
                      className="w-full pl-8 pr-3 py-2 rounded-lg outline-none" style={{ background: "var(--muted)", fontSize: 12, color: "var(--foreground)", border: "1px solid transparent" }}
                      onFocus={e => (e.currentTarget.style.borderColor="rgba(139,32,32,0.3)")}
                      onBlur={e => (e.currentTarget.style.borderColor="transparent")} />
                  </div>
                  <div className="flex gap-1.5 ml-auto">
                    {["all","open","in-progress","resolved"].map(f => (
                      <button key={f} onClick={() => setStatusFilter(f)} className="px-3 py-1.5 rounded-lg capitalize"
                        style={{ fontSize: 11, fontWeight: statusFilter===f?600:400, background: statusFilter===f?"var(--primary)":"var(--muted)", color: statusFilter===f?"white":"var(--muted-foreground)" }}>
                        {f==="all"?"All":f.replace("-"," ")}
                      </button>
                    ))}
                  </div>
                </div>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "var(--muted)" }}>
                      {["Ticket","Subject","Customer","Category","Priority","Status","Assigned","Updated",""].map(h => (
                        <th key={h} className="text-left px-4 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t, i) => (
                      <tr key={t.id} style={{ borderBottom: i<filtered.length-1?"1px solid var(--border)":"none", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget.style.background="var(--muted)")}
                        onMouseLeave={e => (e.currentTarget.style.background="transparent")}
                        onClick={() => setSelectedTicket(t)}>
                        <td className="px-4 py-3.5"><span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--primary)", fontWeight: 600 }}>{t.id}</span></td>
                        <td className="px-4 py-3.5"><p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", maxWidth: 200 }}>{t.subject}</p></td>
                        <td className="px-4 py-3.5">
                          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{t.customer}</p>
                          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{t.zone}</p>
                        </td>
                        <td className="px-4 py-3.5"><span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, background: "var(--muted)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>{t.category}</span></td>
                        <td className="px-4 py-3.5"><PriorityBadge priority={t.priority} /></td>
                        <td className="px-4 py-3.5"><StatusBadge status={t.status} /></td>
                        <td className="px-4 py-3.5"><span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{t.assigned}</span></td>
                        <td className="px-4 py-3.5"><span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{t.updated}</span></td>
                        <td className="px-4 py-3.5"><ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} /></td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-10 text-center" style={{ color: "var(--muted-foreground)", fontSize: 13 }}>No tickets found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "timeline" && (
        <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center rounded-full text-white" style={{ width: 40, height: 40, background: "var(--primary)", fontSize: 14, fontWeight: 700 }}>RU</div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>Rahim Uddin</h3>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>CUST-10001 · 20 Mbps Plus · Member since Jan 2024</p>
            </div>
          </div>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-0.5" style={{ background: "var(--border)" }} />
            {timeline.map((item, i) => (
              <div key={i} className="flex items-start gap-4 py-2.5 relative">
                <div className="absolute left-0 top-3.5 -translate-x-[5px] z-10" style={{ width: 10, height: 10, borderRadius: "50%", background: item.fill?item.color:"white", border: `2px solid ${item.color}` }} />
                <div className="flex-1 flex items-start justify-between">
                  <p style={{ fontSize: 13, color: "var(--foreground)", fontWeight: item.fill?500:400 }}>{item.event}</p>
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0, marginLeft: 16 }}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-full max-w-lg" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--foreground)" }}>New Ticket</h3>
              <button onClick={() => setShowNewTicket(false)}><X size={18} style={{ color: "var(--muted-foreground)" }} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>CUSTOMER NAME</label>
                  <input value={newTkt.customer} onChange={e => setNewTkt(p=>({...p,customer:e.target.value}))} className={inputCls} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>CUSTOMER ID</label>
                  <input value={newTkt.custId} onChange={e => setNewTkt(p=>({...p,custId:e.target.value}))} placeholder="e.g. CUST-10001" className={inputCls} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>SUBJECT</label>
                <input value={newTkt.subject} onChange={e => setNewTkt(p=>({...p,subject:e.target.value}))} className={inputCls} style={inputStyle} />
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>CATEGORY</label>
                  <select value={newTkt.category} onChange={e => setNewTkt(p=>({...p,category:e.target.value}))} className={inputCls} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>PRIORITY</label>
                  <select value={newTkt.priority} onChange={e => setNewTkt(p=>({...p,priority:e.target.value as any}))} className={inputCls} style={inputStyle}>
                    {(["critical","high","medium","low"] as const).map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>ASSIGN TO</label>
                  <select value={newTkt.assigned} onChange={e => setNewTkt(p=>({...p,assigned:e.target.value}))} className={inputCls} style={inputStyle}>
                    <option>Unassigned</option>
                    {AGENTS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5, letterSpacing: "0.04em" }}>DESCRIPTION</label>
                <textarea value={newTkt.description} onChange={e => setNewTkt(p=>({...p,description:e.target.value}))} rows={3} className="w-full px-3 py-2.5 rounded-lg outline-none resize-none" style={inputStyle} />
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setShowNewTicket(false)} className="flex-1 py-2.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13 }}>Cancel</button>
                <button onClick={createTicket} disabled={!newTkt.subject||!newTkt.customer} className="flex-1 py-2.5 rounded-lg text-white" style={{ background: !newTkt.subject||!newTkt.customer?"#ccc":"var(--primary)", fontSize: 13, fontWeight: 500 }}>
                  Create Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}
