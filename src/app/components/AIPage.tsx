import { useState, useRef, useEffect } from "react";
import {
  TrendingUp, ShieldAlert, AlertCircle, BrainCircuit, Bot,
  Send, Sparkles, ArrowUpRight, ArrowDownRight, MapPin,
  Users, Circle, Clock, RefreshCw, ChevronRight, X,
  CheckCircle2, MessageSquare, PhoneCall, Ban, Zap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

type AITab = "overview" | "leakage" | "risk" | "forecast" | "assistant";

// ─── Data ──────────────────────────────────────────────────────────────────────
const forecastData = [
  { month: "Jun", actual: 4720000, forecast: null },
  { month: "Jul", actual: 4780000, forecast: null },
  { month: "Aug", actual: 4820000, forecast: null },
  { month: "Sep", actual: null, forecast: 5060000 },
  { month: "Oct", actual: null, forecast: 5240000 },
  { month: "Nov", actual: null, forecast: 5420000 },
];

const riskDistribution = [
  { name: "Low Risk",    value: 8920, color: "#16A34A" },
  { name: "Medium Risk", value: 2873, color: "#D97706" },
  { name: "High Risk",   value: 1047, color: "#DC2626" },
];

const zoneIntelligence = [
  { zone: "Kalkini",     customers: 164, outstanding: 24500, riskScore: 72, topIssue: "End of month due collection" },
  { zone: "Somitir Hat", customers: 62,  outstanding: 8500,  riskScore: 45, topIssue: "Late payers" },
  { zone: "Madaripur",   customers: 85,  outstanding: 12000, riskScore: 38, topIssue: "Good collection rate" },
  { zone: "Shibchar",    customers: 48,  outstanding: 6500,  riskScore: 32, topIssue: "Stable fiber line" },
  { zone: "Rajoir",      customers: 34,  outstanding: 4000,  riskScore: 28, topIssue: "High renewal rate" },
];

const leakageItems = [
  { type: "Long-term Non-payer",   customers: 3, amount: 4800, severity: "high",   action: "Disconnect & escalate" },
  { type: "Active No Payment",     customers: 4, amount: 3200, severity: "high",   action: "Suspend accounts" },
  { type: "Consistent Underpay",  customers: 2, amount: 1200, severity: "medium", action: "Collect difference" },
  { type: "Free Usage Gap",        customers: 1, amount:  500, severity: "low",    action: "Update billing date" },
];

const highRiskCustomers = [
  { name: "Suman Bepari",   id: "MBN0002", zone: "Kalkini",     risk: 84, days: 18, due: 1200 },
  { name: "Karim Hossain",  id: "MBN0007", zone: "Somitir Hat", risk: 78, days: 14, due:  800 },
  { name: "Nasrin Begum",   id: "MBN0015", zone: "Madaripur",   risk: 68, days: 12, due: 1500 },
  { name: "Alim Uddin",     id: "MBN0023", zone: "Kalkini",     risk: 63, days: 11, due: 1000 },
  { name: "Faruk Hossain",  id: "MBN0034", zone: "Shibchar",    risk: 55, days: 9,  due: 1200 },
];

const ASSISTANT_RESPONSES: Record<string, string> = {
  default:    "I can help you analyze your ISP business data in Madaripur & Kalkini. Ask me about revenue, collections, customer risk, zone performance, or network health.",
  revenue:    "📊 **September 2026 Revenue Summary**\n\nTotal billed: ৳1,48,200\nCollected so far: ৳1,23,700 (83.5%)\nOutstanding due: ৳24,500\n\nThe main growth driver is Kalkini Somitir Hat (+14%) from new subscriber connections. Collection efficiency across Madaripur Sadar remains strong.",
  due:        "⚠️ **Due Customer Analysis**\n\n45 customers are currently overdue in Kalkini & Madaripur.\nTotal outstanding: ৳24,500\n\nTop zones by outstanding:\n1. Kalkini Somitir Hat — ৳14,500 (14 days avg)\n2. Madaripur Sadar — ৳6,000\n3. Shibchar — ৳4,000\n\n**Recommendation**: Send SMS payment link reminders to Kalkini overdue subscribers.",
  collection: "📈 **Collection Rate Analysis**\n\nSeptember collection rate: **83.5%**\nProjected end-of-month collection: 96.5%\n\n**AI Recommendation**: Automated bKash payment gateway links have reduced manual collection turnaround time by 65%.",
  margin:     "💰 **Package Margin Analysis**\n\nHighest margin: 20 Mbps Fiber Standard (৳1,200/mo)\nMost popular: 20 Mbps Home Fiber (119 subscribers)\n\nConsider promotional upgrades for subscribers on 10 Mbps packages to 20 Mbps.",
  mikrotik:   "🖥️ **MikroTik RouterOS Status**\n\n● MikroTik-01 (Madaripur Core) — Online, CPU 23%\n● MikroTik-02 (Kalkini Hub) — Online, CPU 34%\n● OLT-Madaripur-01 (Huawei GPON) — Online, 31 active sessions\n\n**Action**: All optical links and PON distribution boxes are operating within optimal Rx optical signal margins (-18.4 dBm).",
};

function getResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("revenue")) return ASSISTANT_RESPONSES.revenue;
  if (lower.includes("due") || lower.includes("overdue")) return ASSISTANT_RESPONSES.due;
  if (lower.includes("collection")) return ASSISTANT_RESPONSES.collection;
  if (lower.includes("margin") || lower.includes("package")) return ASSISTANT_RESPONSES.margin;
  if (lower.includes("mikrotik") || lower.includes("cpu") || lower.includes("network")) return ASSISTANT_RESPONSES.mikrotik;
  return ASSISTANT_RESPONSES.default;
}

interface Message { role: "user" | "assistant"; content: string; time: string; }

const SUGGESTIONS = [
  "How much did we collect this month?",
  "Which zone has the highest due?",
  "Which package makes the highest margin?",
  "Which MikroTik has the highest CPU?",
];

// ─── Action options ────────────────────────────────────────────────────────────
const LEAKAGE_ACTIONS: Record<string, { label:string; icon:React.ElementType; color:string }[]> = {
  "Long-term Non-payer":  [
    { label:"Disconnect all",       icon:Ban,           color:"#DC2626" },
    { label:"Send final notice SMS", icon:MessageSquare, color:"#D97706" },
    { label:"Escalate to manager",  icon:PhoneCall,     color:"#2563EB" },
  ],
  "Active No Payment": [
    { label:"Suspend accounts",     icon:Ban,           color:"#DC2626" },
    { label:"Send payment reminder",icon:MessageSquare, color:"#D97706" },
    { label:"Schedule call",        icon:PhoneCall,     color:"#2563EB" },
  ],
  "Consistent Underpay": [
    { label:"Collect difference",   icon:Zap,           color:"#8B2020" },
    { label:"Send payment link",    icon:MessageSquare, color:"#D97706" },
    { label:"Call customer",        icon:PhoneCall,     color:"#2563EB" },
  ],
  "Free Usage Gap": [
    { label:"Fix billing date",     icon:Zap,           color:"#8B2020" },
    { label:"Notify customer",      icon:MessageSquare, color:"#D97706" },
  ],
};

const RISK_ACTIONS = [
  { label:"Suspend account",        icon:Ban,           color:"#DC2626", desc:"Immediately suspends internet access" },
  { label:"Send payment SMS",       icon:MessageSquare, color:"#D97706", desc:"Auto-sends payment reminder via SMS" },
  { label:"Schedule collection call",icon:PhoneCall,    color:"#2563EB", desc:"Assigns to collection team for follow-up" },
  { label:"Offer payment plan",     icon:Zap,           color:"#16A34A", desc:"Sends instalment plan offer to customer" },
];

// ─── Components ────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg:string; onClose:()=>void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl"
      style={{ background:"#130606", color:"#fff", fontSize:13, fontWeight:500, animation:"aiToast 0.2s ease" }}>
      <style>{`@keyframes aiToast{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <CheckCircle2 size={15} style={{ color:"#4ADE80" }}/>{msg}
      <button onClick={onClose}><X size={13} style={{ color:"rgba(255,255,255,0.5)" }}/></button>
    </div>
  );
}

interface ActionModal {
  title: string;
  subtitle: string;
  actions: { label:string; icon:React.ElementType; color:string; desc?:string }[];
  onConfirm: (action:string)=>void;
  onClose: ()=>void;
}

function ActionModal({ title, subtitle, actions, onConfirm, onClose }: ActionModal) {
  const [selected, setSelected] = useState(actions[0]?.label ?? "");
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background:"rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="rounded-2xl flex flex-col" style={{ background:"var(--card)", border:"1px solid var(--border)", width:460, overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
          <div>
            <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:15, color:"var(--foreground)" }}>{title}</p>
            <p style={{ fontSize:12, color:"var(--muted-foreground)", marginTop:2 }}>{subtitle}</p>
          </div>
          <button onClick={onClose}><X size={16} style={{ color:"var(--muted-foreground)" }}/></button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {actions.map(a=>{
            const Icon = a.icon;
            const active = selected === a.label;
            return (
              <button key={a.label} onClick={()=>setSelected(a.label)}
                className="flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                style={{ background:active?"var(--muted)":"transparent", border:`1px solid ${active?a.color:"var(--border)"}` }}>
                <div className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0" style={{ background:`${a.color}18` }}>
                  <Icon size={16} style={{ color:a.color }}/>
                </div>
                <div className="flex-1">
                  <p style={{ fontSize:13, fontWeight:600, color:"var(--foreground)" }}>{a.label}</p>
                  {a.desc && <p style={{ fontSize:11, color:"var(--muted-foreground)", marginTop:2 }}>{a.desc}</p>}
                </div>
                {active && <CheckCircle2 size={16} style={{ color:a.color, flexShrink:0 }}/>}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 px-5 pb-5 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:13 }}>Cancel</button>
          <button onClick={()=>onConfirm(selected)} className="px-5 py-2 rounded-lg text-white" style={{ background:"#8B2020", fontSize:13, fontWeight:600 }}>Execute Action</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
const tabs = [
  { id: "overview"   as const, label: "Overview",         icon: BrainCircuit },
  { id: "leakage"    as const, label: "Leakage Detector", icon: ShieldAlert  },
  { id: "risk"       as const, label: "Customer Risk",    icon: AlertCircle  },
  { id: "forecast"   as const, label: "Forecast",         icon: TrendingUp   },
  { id: "assistant"  as const, label: "AI Assistant",     icon: Bot          },
];

export function AIPage({ initialTab = "overview" }: { initialTab?: AITab }) {
  const [tab, setTab]           = useState<AITab>(initialTab);
  const [messages, setMessages] = useState<Message[]>([
    { role:"assistant", content:ASSISTANT_RESPONSES.default, time:"Just now" }
  ]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const messagesEndRef          = useRef<HTMLDivElement>(null);

  // leakage tab
  const [reanalyzing, setReanalyzing]   = useState(false);
  const [reanalyzeDone, setReanalyzeDone] = useState(false);
  const [leakageModal, setLeakageModal] = useState<{ item: typeof leakageItems[0] } | null>(null);
  const [executedLeakage, setExecutedLeakage] = useState<Set<string>>(new Set());

  // risk tab
  const [riskModal, setRiskModal]   = useState<{ customer: typeof highRiskCustomers[0] } | null>(null);
  const [executedRisk, setExecutedRisk] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const sendMessage = (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role:"user", content:msg, time:"Just now" }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role:"assistant", content:getResponse(msg), time:"Just now" }]);
      setLoading(false);
    }, 800);
  };

  const doReanalyze = () => {
    setReanalyzing(true);
    setReanalyzeDone(false);
    setTimeout(() => { setReanalyzing(false); setReanalyzeDone(true); showToast("Re-analysis complete — 36 customers, ৳71,540 leakage confirmed"); }, 2200);
  };

  const executeLeakageAction = (action: string) => {
    if (!leakageModal) return;
    const key = leakageModal.item.type;
    setLeakageModal(null);
    setExecutedLeakage(prev => new Set([...prev, key]));
    showToast(`"${action}" executed for ${leakageModal.item.customers} customers`);
  };

  const executeRiskAction = (action: string) => {
    if (!riskModal) return;
    const key = riskModal.customer.id;
    setRiskModal(null);
    setExecutedRisk(prev => new Set([...prev, key]));
    showToast(`"${action}" applied to ${riskModal.customer.name}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} style={{ color:"var(--primary)" }}/>
            <h1 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:20, color:"var(--foreground)" }}>AI Intelligence</h1>
          </div>
          <p style={{ fontSize:13, color:"var(--muted-foreground)" }}>Revenue analysis, risk scoring, forecasting and AI-powered business insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Circle size={8} fill="#16A34A" stroke="none"/>
          <span style={{ fontSize:12, color:"#16A34A", fontWeight:500 }}>AI Model Active</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ background:tab===t.id?"var(--primary)":"transparent", color:tab===t.id?"white":"var(--muted-foreground)", fontSize:13, fontWeight:tab===t.id?600:400 }}>
              <Icon size={14}/>{t.label}
            </button>
          );
        })}
      </div>

      {/* ══ Overview ══ */}
      {tab === "overview" && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
            {[
              { label:"Revenue Forecast",      value:"৳52.4L", sub:"Next month",          trend:"+8.7%", up:true,  color:"#16A34A", bg:"#DCFCE7", icon:TrendingUp   },
              { label:"Collection Rate",        value:"72%",    sub:"Aug projected",        trend:"-24.5%",up:false, color:"#D97706", bg:"#FEF3C7", icon:ArrowDownRight},
              { label:"Revenue Leakage",        value:"৳71.5K", sub:"Detected this month",  trend:"New",  up:false, color:"#DC2626", bg:"#FEE2E2", icon:ShieldAlert  },
              { label:"High-Risk Customers",    value:"47",     sub:"Risk score >80%",       trend:"+3",   up:false, color:"#7C3AED", bg:"#EDE9FE", icon:AlertCircle  },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl p-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center justify-center rounded-lg" style={{ width:32, height:32, background:s.bg }}>
                      <Icon size={15} style={{ color:s.color }}/>
                    </div>
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize:10, fontWeight:700, background:s.up?"#DCFCE7":"#FEE2E2", color:s.up?"#16A34A":"#DC2626" }}>{s.trend}</span>
                  </div>
                  <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:24, color:"var(--foreground)", lineHeight:1.1, marginBottom:4 }}>{s.value}</p>
                  <p style={{ fontSize:13, fontWeight:500, color:"var(--foreground)", marginBottom:2 }}>{s.label}</p>
                  <p style={{ fontSize:11, color:"var(--muted-foreground)" }}>{s.sub}</p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns:"1fr 320px" }}>
            <div className="rounded-xl p-5" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)", marginBottom:4 }}>Zone Intelligence</h3>
              <p style={{ fontSize:12, color:"var(--muted-foreground)", marginBottom:16 }}>Zones ranked by risk score — AI analysis of payment behavior, collection patterns, and network health</p>
              <div className="flex flex-col gap-3">
                {zoneIntelligence.map((z,i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ background:"var(--muted)" }}>
                    <div className="flex items-center gap-2 flex-shrink-0" style={{ minWidth:110 }}>
                      <MapPin size={13} style={{ color:z.riskScore>70?"#DC2626":z.riskScore>50?"#D97706":"#16A34A" }}/>
                      <span style={{ fontSize:13, fontWeight:600, color:"var(--foreground)" }}>{z.zone}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontSize:11, color:"var(--muted-foreground)" }}>Risk Score</span>
                        <span style={{ fontSize:11, fontWeight:700, color:z.riskScore>70?"#DC2626":z.riskScore>50?"#D97706":"#16A34A" }}>{z.riskScore}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background:"var(--border)" }}>
                        <div className="h-full rounded-full" style={{ width:`${z.riskScore}%`, background:z.riskScore>70?"#DC2626":z.riskScore>50?"#D97706":"#16A34A" }}/>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0" style={{ minWidth:80 }}>
                      <p style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:700, color:"#DC2626" }}>৳{(z.outstanding/1000).toFixed(0)}K</p>
                      <p style={{ fontSize:10, color:"var(--muted-foreground)" }}>outstanding</p>
                    </div>
                    <div style={{ minWidth:180 }}>
                      <p style={{ fontSize:11, color:"var(--muted-foreground)", lineHeight:1.3 }}>{z.topIssue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-5" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)", marginBottom:4 }}>Risk Distribution</h3>
              <p style={{ fontSize:12, color:"var(--muted-foreground)", marginBottom:12 }}>Customer risk score breakdown</p>
              <div className="flex justify-center mb-4">
                <PieChart width={180} height={180}>
                  <Pie key="pie-risk" data={riskDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {riskDistribution.map((entry,i) => <Cell key={`cell-${i}`} fill={entry.color}/>)}
                  </Pie>
                </PieChart>
              </div>
              <div className="flex flex-col gap-2.5">
                {riskDistribution.map((r,i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background:r.color }}/>
                      <span style={{ fontSize:12, color:"var(--foreground)" }}>{r.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:600, color:"var(--foreground)" }}>{r.value.toLocaleString()}</span>
                      <span style={{ fontSize:11, color:"var(--muted-foreground)" }}>({Math.round(r.value/riskDistribution.reduce((a,b)=>a+b.value,0)*100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ Leakage ══ */}
      {tab === "leakage" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-5 flex items-center gap-4" style={{ background:"#FFF7ED", border:"1px solid #FED7AA" }}>
            <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width:48, height:48, background:"#FFEDD5" }}>
              <ShieldAlert size={24} style={{ color:"#D97706" }}/>
            </div>
            <div className="flex-1">
              <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:18, color:"#92400E" }}>
                {reanalyzeDone ? "Re-analysis Complete — ৳71,540 Confirmed" : "৳71,540 Revenue Leakage Detected"}
              </p>
              <p style={{ fontSize:13, color:"#B45309" }}>36 customers contributing to revenue loss across 4 leakage categories · {reanalyzeDone ? "Just now" : "Last analyzed 6 hours ago"}</p>
            </div>
            <button onClick={doReanalyze} disabled={reanalyzing}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg flex-shrink-0"
              style={{ background:reanalyzeDone?"#16A34A":"#D97706", color:"white", fontSize:12, fontWeight:500, opacity:reanalyzing?0.7:1 }}>
              {reanalyzing
                ? <><RefreshCw size={13} style={{ animation:"aiSpin 0.7s linear infinite" }}/> Analyzing…</>
                : reanalyzeDone
                  ? <><CheckCircle2 size={13}/> Done</>
                  : <><RefreshCw size={13}/> Re-analyze</>
              }
            </button>
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(2,1fr)" }}>
            {leakageItems.map((item,i) => {
              const done = executedLeakage.has(item.type);
              return (
                <div key={i} className="rounded-xl p-5" style={{ background:"var(--card)", border:`1px solid ${done?"#86EFAC":item.severity==="high"?"#FECACA":item.severity==="medium"?"#FDE68A":"var(--border)"}` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:15, color:"var(--foreground)" }}>{item.type}</p>
                      <p style={{ fontSize:12, color:"var(--muted-foreground)", marginTop:3 }}>{item.customers} customers identified</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize:11, fontWeight:600, background:done?"#DCFCE7":item.severity==="high"?"#FEE2E2":item.severity==="medium"?"#FEF3C7":"#F0F9FF", color:done?"#16A34A":item.severity==="high"?"#DC2626":item.severity==="medium"?"#D97706":"#2563EB" }}>
                      {done ? "DONE" : item.severity.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontFamily:"var(--font-mono)", fontWeight:700, fontSize:22, color:"#DC2626", marginBottom:8 }}>৳{item.amount.toLocaleString()}</p>
                  <div className="flex items-center justify-between">
                    <p style={{ fontSize:12, color:"var(--muted-foreground)" }}>Recommended: <span style={{ color:"var(--foreground)", fontWeight:500 }}>{item.action}</span></p>
                    {done
                      ? <span className="flex items-center gap-1 text-xs font-semibold" style={{ color:"#16A34A" }}><CheckCircle2 size={12}/> Action taken</span>
                      : <button onClick={()=>setLeakageModal({ item })} className="flex items-center gap-1" style={{ fontSize:12, color:"var(--primary)", fontWeight:500 }}>
                          Act <ChevronRight size={13}/>
                        </button>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ Risk ══ */}
      {tab === "risk" && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 mb-2" style={{ gridTemplateColumns:"repeat(3,1fr)" }}>
            {riskDistribution.map(r => (
              <div key={r.name} className="rounded-xl p-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:28, color:r.color }}>{r.value.toLocaleString()}</p>
                <p style={{ fontSize:13, color:"var(--muted-foreground)" }}>{r.name}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="px-5 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Highest Risk Customers</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background:"var(--muted)" }}>
                  {["Customer","Zone","Risk Score","Days Overdue","Due Amount","Action"].map(h => (
                    <th key={h} className="text-left px-5 py-3" style={{ fontSize:11, fontWeight:600, color:"var(--muted-foreground)", letterSpacing:"0.04em" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {highRiskCustomers.map((c,i) => {
                  const done = executedRisk.has(c.id);
                  return (
                    <tr key={i} style={{ borderBottom:i<highRiskCustomers.length-1?"1px solid var(--border)":"none" }}
                      onMouseEnter={e=>(e.currentTarget.style.background="var(--muted)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                      <td className="px-5 py-3.5">
                        <p style={{ fontSize:13, fontWeight:500, color:"var(--foreground)" }}>{c.name}</p>
                        <p style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted-foreground)" }}>{c.id}</p>
                      </td>
                      <td className="px-5 py-3.5"><span style={{ fontSize:12, color:"var(--muted-foreground)" }}>{c.zone}</span></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full" style={{ background:"var(--muted)" }}>
                            <div className="h-full rounded-full" style={{ width:`${c.risk}%`, background:c.risk>80?"#DC2626":c.risk>60?"#D97706":"#16A34A" }}/>
                          </div>
                          <span style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:700, color:c.risk>80?"#DC2626":"#D97706" }}>{c.risk}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span style={{ fontSize:12, color:"#D97706", fontWeight:600 }}>{c.days} days</span></td>
                      <td className="px-5 py-3.5"><span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:700, color:"#DC2626" }}>৳{c.due.toLocaleString()}</span></td>
                      <td className="px-5 py-3.5">
                        {done
                          ? <span className="flex items-center gap-1 text-xs font-semibold" style={{ color:"#16A34A" }}><CheckCircle2 size={12}/> Done</span>
                          : <button onClick={()=>setRiskModal({ customer:c })} className="px-3 py-1 rounded-lg text-white" style={{ background:"var(--primary)", fontSize:11, fontWeight:600 }}>Take Action</button>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ Forecast ══ */}
      {tab === "forecast" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-6" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:16, color:"var(--foreground)", marginBottom:3 }}>Revenue Forecast — Next 3 Months</h3>
                <p style={{ fontSize:12, color:"var(--muted-foreground)" }}>AI-powered prediction based on historical trends, payment behavior, and seasonal patterns</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5" style={{ background:"#8B2020" }}/><span style={{ fontSize:11, color:"var(--muted-foreground)" }}>Actual</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-0.5" style={{ background:"#2563EB" }}/><span style={{ fontSize:11, color:"var(--muted-foreground)" }}>Forecast</span></div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={forecastData} margin={{ top:4, right:4, left:-8, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>v?`${(v/100000).toFixed(0)}L`:""} tick={{ fontSize:11, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12 }} formatter={(v,name)=>v?[`৳${((v as number)/100000).toFixed(1)}L`,name]:[null,name]}/>
                <Area key="area-actual"   isAnimationActive={false} type="monotone" dataKey="actual"   stroke="#8B2020" strokeWidth={2.5} fill="#8B2020" fillOpacity={0.09} name="Actual"   dot={false} activeDot={{ r:4 }}/>
                <Area key="area-forecast" isAnimationActive={false} type="monotone" dataKey="forecast" stroke="#2563EB" strokeWidth={2}   fill="#2563EB" fillOpacity={0.07} name="Forecast" dot={false} activeDot={{ r:4 }} strokeDasharray="6 4"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(3,1fr)" }}>
            {[
              { month:"Sep 2026", revenue:5060000, growth:"+8.7%", confidence:92, risk:"Low"    },
              { month:"Oct 2026", revenue:5240000, growth:"+3.6%", confidence:84, risk:"Low"    },
              { month:"Nov 2026", revenue:5420000, growth:"+3.4%", confidence:71, risk:"Medium" },
            ].map(f => (
              <div key={f.month} className="rounded-xl p-5" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                <p style={{ fontSize:12, color:"var(--muted-foreground)", marginBottom:8 }}>{f.month}</p>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:24, color:"var(--foreground)", marginBottom:4 }}>৳{(f.revenue/100000).toFixed(1)}L</p>
                <div className="flex items-center gap-2 mb-4">
                  <ArrowUpRight size={14} style={{ color:"#16A34A" }}/>
                  <span style={{ fontSize:12, fontWeight:600, color:"#16A34A" }}>{f.growth} vs prior month</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color:"var(--muted-foreground)" }}>Confidence</span>
                  <span style={{ fontWeight:600, color:f.confidence>85?"#16A34A":"#D97706" }}>{f.confidence}%</span>
                </div>
                <div className="h-1.5 rounded-full mt-1 mb-3" style={{ background:"var(--muted)" }}>
                  <div className="h-full rounded-full" style={{ width:`${f.confidence}%`, background:f.confidence>85?"#16A34A":"#D97706" }}/>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color:"var(--muted-foreground)" }}>Cash Flow Risk</span>
                  <span style={{ fontWeight:600, color:f.risk==="Low"?"#16A34A":"#D97706" }}>{f.risk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ AI Assistant ══ */}
      {tab === "assistant" && (
        <div className="rounded-xl overflow-hidden flex flex-col" style={{ background:"var(--card)", border:"1px solid var(--border)", height:"calc(100vh - 280px)", minHeight:520 }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom:"1px solid var(--border)", background:"var(--muted)" }}>
            <div className="flex items-center justify-center rounded-xl" style={{ width:36, height:36, background:"var(--primary)" }}>
              <Bot size={18} className="text-white"/>
            </div>
            <div>
              <p style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:14, color:"var(--foreground)" }}>MAA BEST NETWORK AI Assistant</p>
              <p style={{ fontSize:11, color:"#16A34A", fontWeight:500 }}>● Active · Analyzing your ISP data</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {messages.map((msg,i) => (
              <div key={i} className={`flex ${msg.role==="user"?"justify-end":"justify-start"}`}>
                <div style={{ maxWidth:"75%", padding:"12px 16px", borderRadius:14, borderBottomRightRadius:msg.role==="user"?4:14, borderBottomLeftRadius:msg.role==="assistant"?4:14, background:msg.role==="user"?"var(--primary)":"var(--muted)", fontSize:13, color:msg.role==="user"?"white":"var(--foreground)", lineHeight:1.6, whiteSpace:"pre-line" }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl" style={{ background:"var(--muted)" }}>
                  {[0,1,2].map(j=><div key={j} className="w-1.5 h-1.5 rounded-full" style={{ background:"var(--muted-foreground)", animation:`bounce 1s ${j*0.15}s infinite` }}/>)}
                </div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          <div className="px-5 py-3 flex flex-wrap gap-2" style={{ borderTop:"1px solid var(--border)" }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={()=>sendMessage(s)}
                className="px-3 py-1.5 rounded-full"
                style={{ fontSize:11, background:"var(--accent)", color:"var(--primary)", border:"1px solid rgba(139,32,32,0.15)", fontWeight:500 }}>
                {s}
              </button>
            ))}
          </div>

          <div className="px-5 py-4" style={{ borderTop:"1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}
                placeholder="Ask anything about your ISP business…"
                className="flex-1 px-4 py-2.5 rounded-xl outline-none"
                style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:13, color:"var(--foreground)" }}/>
              <button onClick={()=>sendMessage()} className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background:input.trim()?"var(--primary)":"var(--muted)" }}>
                <Send size={16} style={{ color:input.trim()?"white":"var(--muted-foreground)" }}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modals ══ */}
      {leakageModal && (
        <ActionModal
          title={`Act on: ${leakageModal.item.type}`}
          subtitle={`${leakageModal.item.customers} customers · ৳${leakageModal.item.amount.toLocaleString()} leakage`}
          actions={LEAKAGE_ACTIONS[leakageModal.item.type] ?? []}
          onConfirm={executeLeakageAction}
          onClose={()=>setLeakageModal(null)}
        />
      )}
      {riskModal && (
        <ActionModal
          title={`Take Action: ${riskModal.customer.name}`}
          subtitle={`Risk ${riskModal.customer.risk}% · ${riskModal.customer.days} days overdue · ৳${riskModal.customer.due.toLocaleString()} due`}
          actions={RISK_ACTIONS}
          onConfirm={executeRiskAction}
          onClose={()=>setRiskModal(null)}
        />
      )}
      {toast && <Toast msg={toast} onClose={()=>setToast("")}/>}

      <style>{`
        @keyframes aiSpin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>
    </div>
  );
}
