import { useState, useCallback } from "react";
import {
  MessageCircle, Workflow, Bell, Plus, CheckCircle2, Clock, AlertTriangle,
  Zap, ChevronRight, ToggleLeft, ToggleRight, Settings, Send, Search,
  Edit2, Copy, Trash2, Play, X, Eye, History, PhoneCall, RefreshCw
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Tab = "sms" | "workflows" | "notifications";

interface SmsTemplate {
  id: string; name: string; trigger: string;
  vars: string[]; status: "active" | "inactive"; body: string;
  sent: number; deliveryRate: number;
}

interface Workflow {
  id: string; name: string; trigger: string; condition: string;
  action: string; enabled: boolean; runs: number; lastRun: string;
}

interface AlertRule {
  id: string; name: string; threshold: string; channel: string;
  severity: "critical" | "warning" | "info"; enabled: boolean; fired: number;
}

interface SmsLog {
  id: string; template: string; recipient: string; phone: string;
  status: "delivered" | "failed" | "pending"; time: string;
}

// ─── Seed Data ─────────────────────────────────────────────────────────────────
const INITIAL_TEMPLATES: SmsTemplate[] = [
  { id:"TPL-01", name:"Welcome",              trigger:"Customer Created",    vars:["customer_name","isp_name","package","pppoe_user"], status:"active",   body:"Welcome to {{isp_name}}! Dear {{customer_name}}, your internet is active. Package: {{package}}. PPPoE: {{pppoe_user}}. Enjoy!",                                           sent:412, deliveryRate:98.3 },
  { id:"TPL-02", name:"Invoice Generated",    trigger:"Invoice Created",     vars:["customer_name","invoice_amount","due_date"],        status:"active",   body:"Dear {{customer_name}}, invoice of ৳{{invoice_amount}} generated. Due: {{due_date}}. Pay online or visit our office. Thank you — {{isp_name}}.",                        sent:1284, deliveryRate:97.1 },
  { id:"TPL-03", name:"Bill Reminder",        trigger:"7 Days Before Due",   vars:["customer_name","invoice_amount","due_date"],        status:"active",   body:"Reminder: Dear {{customer_name}}, your bill of ৳{{invoice_amount}} is due on {{due_date}}. Please pay to avoid disconnection.",                                        sent:2841, deliveryRate:96.5 },
  { id:"TPL-04", name:"Payment Confirmed",    trigger:"Payment Received",    vars:["customer_name","amount","transaction_id"],          status:"active",   body:"Dear {{customer_name}}, payment of ৳{{amount}} received. TxID: {{transaction_id}}. Service is active. Thank you!",                                                    sent:3219, deliveryRate:99.1 },
  { id:"TPL-05", name:"Disconnection Warning",trigger:"Grace Period End",    vars:["customer_name","invoice_amount","grace_end"],       status:"active",   body:"Dear {{customer_name}}, grace ends {{grace_end}}. Pay ৳{{invoice_amount}} immediately to avoid disconnection.",                                                          sent:847, deliveryRate:95.8 },
  { id:"TPL-06", name:"Reconnected",          trigger:"Service Restored",    vars:["customer_name"],                                   status:"active",   body:"Dear {{customer_name}}, your internet is restored. Thank you for your payment!",                                                                                            sent:621, deliveryRate:98.7 },
  { id:"TPL-07", name:"OTP Verification",     trigger:"Login / Portal",      vars:["customer_name","otp","expiry"],                    status:"inactive", body:"Your MAA BEST NETWORK OTP is {{otp}}. Valid for {{expiry}} minutes. Do not share this code with anyone.",                                                                           sent:0, deliveryRate:0 },
];

const INITIAL_WORKFLOWS: Workflow[] = [
  { id:"WF-001", name:"Auto Disconnect on Overdue",    trigger:"Invoice overdue",          condition:"Grace period expired",              action:"Disconnect → Send SMS",                             enabled:true,  runs:847,  lastRun:"19 Aug, 02:30 AM" },
  { id:"WF-002", name:"Payment → Auto Reconnect",      trigger:"Payment received",          condition:"Customer suspended",                action:"Reconnect → Update invoice → Send confirmation",    enabled:true,  runs:1284, lastRun:"19 Aug, 11:42 AM" },
  { id:"WF-003", name:"7-Day Bill Reminder",           trigger:"7 days before due date",    condition:"Invoice unpaid",                    action:"Send SMS reminder",                                 enabled:true,  runs:2841, lastRun:"19 Aug, 09:00 AM" },
  { id:"WF-004", name:"Welcome New Customer",          trigger:"Customer created",           condition:"Status = Active",                   action:"Send welcome SMS + Create activity log",            enabled:true,  runs:412,  lastRun:"18 Aug, 04:17 PM" },
  { id:"WF-005", name:"Network Outage Alert",          trigger:"OLT offline detected",      condition:"Affected customers > 10",           action:"Notify admin + Log incident + SMS customers",       enabled:false, runs:12,   lastRun:"12 Aug, 08:22 PM" },
  { id:"WF-006", name:"High CPU Alert",                trigger:"MikroTik CPU > 80%",        condition:"Sustained for 5 min",               action:"Notify admin via SMS + Create alert",               enabled:true,  runs:28,   lastRun:"17 Aug, 03:15 PM" },
];

const INITIAL_ALERTS: AlertRule[] = [
  { id:"ALR-01", name:"MikroTik CPU Critical", threshold:"CPU > 90%",                channel:"SMS + Email",        severity:"critical", enabled:true,  fired:3  },
  { id:"ALR-02", name:"MikroTik High RAM",     threshold:"RAM > 80%",                channel:"Email",              severity:"warning",  enabled:true,  fired:7  },
  { id:"ALR-03", name:"OLT Offline",           threshold:"Device unreachable",       channel:"SMS + Email + Push", severity:"critical", enabled:true,  fired:2  },
  { id:"ALR-04", name:"ONU Signal Low",        threshold:"RX Power < -25 dBm",      channel:"Email",              severity:"warning",  enabled:true,  fired:14 },
  { id:"ALR-05", name:"Backup Failed",         threshold:"Auto backup failed",       channel:"Email",              severity:"warning",  enabled:true,  fired:0  },
  { id:"ALR-06", name:"SMS Gateway Error",     threshold:"Delivery rate < 80%",     channel:"Email",              severity:"warning",  enabled:false, fired:1  },
  { id:"ALR-07", name:"Revenue Anomaly",       threshold:"Daily collection < 50%",  channel:"SMS + Email",        severity:"warning",  enabled:true,  fired:0  },
  { id:"ALR-08", name:"Login Brute Force",     threshold:"> 5 failed attempts/min", channel:"Email + Push",       severity:"critical", enabled:true,  fired:1  },
];

const SMS_LOGS: SmsLog[] = [
  { id:"LOG-001", template:"Payment Confirmed",    recipient:"Rahim Uddin",   phone:"01712-345678", status:"delivered", time:"Today 11:42 AM" },
  { id:"LOG-002", template:"Bill Reminder",        recipient:"Nasrin Begum",  phone:"01812-567890", status:"delivered", time:"Today 09:00 AM" },
  { id:"LOG-003", template:"Bill Reminder",        recipient:"Karim Hossain", phone:"01711-234567", status:"failed",    time:"Today 09:00 AM" },
  { id:"LOG-004", template:"Disconnection Warning",recipient:"Alim Uddin",    phone:"01613-456789", status:"delivered", time:"Yesterday 10:15 PM" },
  { id:"LOG-005", template:"Welcome",              recipient:"Sultana Khatun",phone:"01912-678901", status:"pending",   time:"Yesterday 04:17 PM" },
];

const TRIGGER_OPTIONS = ["Customer Created","Invoice Created","Payment Received","7 Days Before Due","Grace Period End","Service Restored","Service Suspended","Login / Portal","Manual Send","Scheduled (Daily)","Scheduled (Monthly)"];
const CHANNEL_OPTIONS = ["SMS","Email","Push","SMS + Email","Email + Push","SMS + Email + Push"];
const SEVERITY_OPTIONS: AlertRule["severity"][] = ["critical","warning","info"];

const SC: Record<AlertRule["severity"],{bg:string;color:string}> = {
  critical: { bg:"#FEE2E2", color:"#DC2626" },
  warning:  { bg:"#FEF3C7", color:"#D97706" },
  info:     { bg:"#DBEAFE", color:"#2563EB" },
};

// ─── Shared styles ─────────────────────────────────────────────────────────────
const INPUT = { background:"var(--muted)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 12px", fontSize:13, color:"var(--foreground)", outline:"none", width:"100%" } as const;
const LABEL = { fontSize:11, fontWeight:600 as const, color:"var(--muted-foreground)", letterSpacing:"0.05em", display:"block" as const, marginBottom:5 };

// ─── Sub-components ────────────────────────────────────────────────────────────
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl"
      style={{ background:"#130606", color:"#fff", fontSize:13, fontWeight:500, animation:"toastSlide 0.2s ease" }}>
      <style>{`@keyframes toastSlide{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <CheckCircle2 size={15} style={{ color:"#4ADE80" }}/>{msg}
      <button onClick={onClose}><X size={13} style={{ color:"rgba(255,255,255,0.5)" }}/></button>
    </div>
  );
}

function Modal({ title, onClose, children, width=480 }: { title:string; onClose:()=>void; children:React.ReactNode; width?:number }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background:"rgba(0,0,0,0.45)" }}
      onClick={onClose}>
      <div className="rounded-2xl flex flex-col" style={{ background:"var(--card)", border:"1px solid var(--border)", width, maxWidth:"95vw", maxHeight:"90vh", overflow:"hidden" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
          <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:16, color:"var(--foreground)" }}>{title}</h3>
          <button onClick={onClose}><X size={18} style={{ color:"var(--muted-foreground)" }}/></button>
        </div>
        <div className="overflow-y-auto p-6 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function AutomationPage({ initialTab = "sms" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [templates,  setTemplates]  = useState<SmsTemplate[]>(INITIAL_TEMPLATES);
  const [workflows,  setWorkflows]  = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [alerts,     setAlerts]     = useState<AlertRule[]>(INITIAL_ALERTS);
  const [toast,      setToast]      = useState("");
  const [search,     setSearch]     = useState("");
  const [expanded,   setExpanded]   = useState<string|null>(null);
  const [runningId,  setRunningId]  = useState<string|null>(null);

  // Modals
  const [showNewTpl,   setShowNewTpl]   = useState(false);
  const [editTpl,      setEditTpl]      = useState<SmsTemplate|null>(null);
  const [testSendTpl,  setTestSendTpl]  = useState<SmsTemplate|null>(null);
  const [showNewWf,    setShowNewWf]    = useState(false);
  const [showNewRule,  setShowNewRule]  = useState(false);
  const [editRule,     setEditRule]     = useState<AlertRule|null>(null);
  const [showLogs,     setShowLogs]     = useState(false);

  // New template form state
  const [newTpl, setNewTpl] = useState({ name:"", trigger:TRIGGER_OPTIONS[0], body:"" });
  const [testPhone, setTestPhone] = useState("01712-345678");

  // New workflow form state
  const [newWf, setNewWf] = useState({ name:"", trigger:"", condition:"", action:"" });

  // New rule form state
  const [newRule, setNewRule] = useState({ name:"", threshold:"", severity:"warning" as AlertRule["severity"], channel:"Email" });

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }, []);

  const filteredTpl = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.trigger.toLowerCase().includes(search.toLowerCase())
  );

  const activeTplCount = templates.filter(t => t.status === "active").length;
  const totalSent = templates.reduce((s, t) => s + t.sent, 0);
  const avgDelivery = templates.filter(t=>t.sent>0).reduce((s,t,_,a) => s + t.deliveryRate/a.length, 0).toFixed(1);

  const insertVar = (v: string, body: string, setter: (b:string)=>void) => {
    setter(body + `{{${v}}}`);
  };

  const saveTpl = () => {
    if (!newTpl.name || !newTpl.body) { showToast("Name and body are required"); return; }
    const id = `TPL-${String(templates.length+1).padStart(2,"0")}`;
    setTemplates(p => [...p, { ...newTpl, id, vars:[], status:"active", sent:0, deliveryRate:0 }]);
    setShowNewTpl(false);
    setNewTpl({ name:"", trigger:TRIGGER_OPTIONS[0], body:"" });
    showToast(`Template "${newTpl.name}" created`);
  };

  const updateTpl = () => {
    if (!editTpl) return;
    setTemplates(p => p.map(t => t.id === editTpl.id ? editTpl : t));
    setEditTpl(null);
    showToast("Template updated");
  };

  const deleteTpl = (id: string) => {
    setTemplates(p => p.filter(t => t.id !== id));
    setExpanded(null);
    showToast("Template deleted");
  };

  const runWorkflow = (wf: Workflow) => {
    setRunningId(wf.id);
    setTimeout(() => {
      setRunningId(null);
      setWorkflows(p => p.map(w => w.id === wf.id ? { ...w, runs: w.runs+1, lastRun:"Just now" } : w));
      showToast(`"${wf.name}" executed successfully`);
    }, 1800);
  };

  const saveWorkflow = () => {
    if (!newWf.name || !newWf.trigger) { showToast("Name and trigger are required"); return; }
    const id = `WF-${String(workflows.length+1).padStart(3,"0")}`;
    setWorkflows(p => [...p, { ...newWf, id, enabled:true, runs:0, lastRun:"Never" }]);
    setShowNewWf(false);
    setNewWf({ name:"", trigger:"", condition:"", action:"" });
    showToast(`Workflow "${newWf.name}" created`);
  };

  const saveRule = () => {
    if (!newRule.name || !newRule.threshold) { showToast("Name and threshold are required"); return; }
    const id = `ALR-${String(alerts.length+1).padStart(2,"0")}`;
    setAlerts(p => [...p, { ...newRule, id, enabled:true, fired:0 }]);
    setShowNewRule(false);
    setNewRule({ name:"", threshold:"", severity:"warning", channel:"Email" });
    showToast(`Alert rule "${newRule.name}" created`);
  };

  const updateRule = () => {
    if (!editRule) return;
    setAlerts(p => p.map(a => a.id === editRule.id ? editRule : a));
    setEditRule(null);
    showToast("Alert rule updated");
  };

  const tabs = [
    { id:"sms"           as const, label:"SMS Templates",   icon:MessageCircle },
    { id:"workflows"     as const, label:"Workflows",        icon:Workflow      },
    { id:"notifications" as const, label:"Alert Rules",      icon:Bell          },
  ];

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:20, color:"var(--foreground)", marginBottom:3 }}>Automation</h1>
          <p style={{ fontSize:13, color:"var(--muted-foreground)" }}>SMS templates, billing workflows, and network alert rules</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background:"#DCFCE7", border:"1px solid #16A34A22" }}>
            <Zap size={12} style={{ color:"#16A34A" }}/>
            <span style={{ fontSize:12, fontWeight:600, color:"#16A34A" }}>{workflows.filter(w=>w.enabled).length} workflows active</span>
          </div>
          <button onClick={() => tab==="sms" ? setShowNewTpl(true) : tab==="workflows" ? setShowNewWf(true) : setShowNewRule(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
            style={{ background:"var(--primary)", fontSize:13, fontWeight:500 }}>
            <Plus size={14}/>
            {tab==="sms" ? "New Template" : tab==="workflows" ? "New Workflow" : "New Rule"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background:"var(--muted)", width:"fit-content" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ background:tab===t.id?"var(--card)":"transparent", fontSize:13, fontWeight:tab===t.id?600:400, color:tab===t.id?"var(--foreground)":"var(--muted-foreground)", boxShadow:tab===t.id?"0 1px 3px rgba(0,0,0,0.1)":"none" }}>
              <Icon size={14}/> {t.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════ SMS Templates ══════════════ */}
      {tab === "sms" && (
        <div className="flex flex-col gap-4">
          {/* KPI strip */}
          <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
            {[
              { label:"Total Templates", value:templates.length, sub:`${activeTplCount} active`, color:"#8B2020" },
              { label:"Total SMS Sent",  value:totalSent.toLocaleString(), sub:"All time", color:"#2563EB" },
              { label:"Avg Delivery",    value:`${avgDelivery}%`, sub:"Last 30 days", color:"#16A34A" },
              { label:"Today Sent",      value:"284", sub:"8 templates triggered", color:"#7C3AED" },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:22, color:k.color, marginBottom:2 }}>{k.value}</p>
                <p style={{ fontSize:13, fontWeight:500, color:"var(--foreground)", marginBottom:1 }}>{k.label}</p>
                <p style={{ fontSize:11, color:"var(--muted-foreground)" }}>{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Search + logs button */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"var(--muted-foreground)" }}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search templates…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none"
                style={{ background:"var(--card)", border:"1px solid var(--border)", fontSize:13, color:"var(--foreground)" }}/>
            </div>
            <button onClick={() => setShowLogs(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
              style={{ background:"var(--card)", border:"1px solid var(--border)", fontSize:13, color:"var(--foreground)" }}>
              <History size={14}/> Send Logs
            </button>
          </div>

          {/* Template cards */}
          {filteredTpl.map(tpl => (
            <div key={tpl.id} className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
              <button className="w-full flex items-center gap-4 px-5 py-4" onClick={() => setExpanded(expanded===tpl.id?null:tpl.id)}>
                <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width:36, height:36, background:"#FDF3F3" }}>
                  <MessageCircle size={16} style={{ color:"#8B2020" }}/>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:14, color:"var(--foreground)" }}>{tpl.name}</span>
                    <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted-foreground)" }}>{tpl.id}</span>
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize:10, fontWeight:600, background:tpl.status==="active"?"#DCFCE7":"var(--muted)", color:tpl.status==="active"?"#16A34A":"var(--muted-foreground)" }}>{tpl.status}</span>
                  </div>
                  <span style={{ fontSize:12, color:"var(--muted-foreground)" }}>Trigger: {tpl.trigger} · Sent: {tpl.sent.toLocaleString()} · Delivery: {tpl.deliveryRate>0?`${tpl.deliveryRate}%`:"—"}</span>
                </div>
                <ChevronRight size={14} style={{ color:"var(--muted-foreground)", transform:expanded===tpl.id?"rotate(90deg)":"none", transition:"0.15s", flexShrink:0 }}/>
              </button>

              {expanded === tpl.id && (
                <div className="px-5 pb-5" style={{ borderTop:"1px solid var(--border)" }}>
                  <p style={{ fontSize:11, fontWeight:600, color:"var(--muted-foreground)", marginTop:12, marginBottom:6, letterSpacing:"0.05em" }}>MESSAGE PREVIEW</p>
                  <div className="p-3 rounded-lg mb-4" style={{ background:"var(--muted)", fontFamily:"var(--font-mono)", fontSize:12, color:"var(--foreground)", lineHeight:1.6 }}>
                    {tpl.body}
                  </div>
                  <div className="flex gap-1 flex-wrap mb-4">
                    {tpl.vars.map(v => (
                      <span key={v} className="px-2 py-0.5 rounded" style={{ fontSize:10, fontFamily:"var(--font-mono)", background:"#DBEAFE", color:"#2563EB" }}>{`{{${v}}}`}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditTpl(tpl)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white" style={{ background:"var(--primary)", fontSize:12, fontWeight:500 }}>
                      <Edit2 size={12}/> Edit
                    </button>
                    <button onClick={() => setTestSendTpl(tpl)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background:"#DBEAFE", border:"1px solid #3B82F620", fontSize:12, color:"#2563EB" }}>
                      <PhoneCall size={12}/> Test Send
                    </button>
                    <button onClick={() => { setTemplates(p=>[...p,{...tpl,id:`TPL-${String(templates.length+1).padStart(2,"0")}`,name:`${tpl.name} (Copy)`,sent:0}]); showToast("Template duplicated"); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:12 }}>
                      <Copy size={12}/> Duplicate
                    </button>
                    <button onClick={() => { setTemplates(p=>p.map(t=>t.id===tpl.id?{...t,status:t.status==="active"?"inactive":"active"}:t)); showToast(`Template ${tpl.status==="active"?"deactivated":"activated"}`); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:12 }}>
                      {tpl.status==="active" ? <ToggleRight size={12} style={{ color:"#16A34A" }}/> : <ToggleLeft size={12}/>} {tpl.status==="active"?"Deactivate":"Activate"}
                    </button>
                    <button onClick={() => deleteTpl(tpl.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg ml-auto" style={{ background:"#FEE2E2", border:"1px solid #DC262622", fontSize:12, color:"#DC2626" }}>
                      <Trash2 size={12}/> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════ Workflows ══════════════ */}
      {tab === "workflows" && (
        <div className="flex flex-col gap-4">
          {/* KPI strip */}
          <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
            {[
              { label:"Total Workflows",  value:workflows.length,                                  sub:`${workflows.filter(w=>w.enabled).length} enabled`, color:"#8B2020" },
              { label:"Total Runs",       value:workflows.reduce((s,w)=>s+w.runs,0).toLocaleString(), sub:"All time",                                      color:"#2563EB" },
              { label:"Runs Today",       value:"284",                                              sub:"Across all workflows",                             color:"#16A34A" },
              { label:"Failed Runs",      value:"3",                                                sub:"Last 7 days",                                      color:"#DC2626" },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:22, color:k.color, marginBottom:2 }}>{k.value}</p>
                <p style={{ fontSize:13, fontWeight:500, color:"var(--foreground)", marginBottom:1 }}>{k.label}</p>
                <p style={{ fontSize:11, color:"var(--muted-foreground)" }}>{k.sub}</p>
              </div>
            ))}
          </div>

          {workflows.map(wf => (
            <div key={wf.id} className="rounded-xl p-5" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted-foreground)" }}>{wf.id}</span>
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize:10, fontWeight:600, background:wf.enabled?"#DCFCE7":"var(--muted)", color:wf.enabled?"#16A34A":"var(--muted-foreground)" }}>
                      {wf.enabled?"Active":"Disabled"}
                    </span>
                  </div>
                  <p style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:14, color:"var(--foreground)" }}>{wf.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-2">
                    <p style={{ fontSize:11, color:"var(--muted-foreground)" }}>Runs: <span style={{ fontFamily:"var(--font-mono)", fontWeight:600, color:"var(--foreground)" }}>{wf.runs.toLocaleString()}</span></p>
                    <p style={{ fontSize:10, color:"var(--muted-foreground)" }}>Last: {wf.lastRun}</p>
                  </div>
                  {/* Run Now */}
                  <button onClick={() => runWorkflow(wf)} disabled={!wf.enabled || runningId===wf.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background:wf.enabled?"#DCFCE7":"var(--muted)", border:`1px solid ${wf.enabled?"#16A34A22":"var(--border)"}`, fontSize:12, color:wf.enabled?"#16A34A":"var(--muted-foreground)", cursor:wf.enabled?"pointer":"not-allowed" }}>
                    {runningId===wf.id ? <RefreshCw size={12} style={{ animation:"spin2 0.8s linear infinite" }}/> : <Play size={12}/>}
                    {runningId===wf.id ? "Running…" : "Run Now"}
                  </button>
                  {/* Toggle */}
                  <button onClick={() => { setWorkflows(p=>p.map(w=>w.id===wf.id?{...w,enabled:!w.enabled}:w)); showToast(`"${wf.name}" ${wf.enabled?"disabled":"enabled"}`); }}>
                    {wf.enabled ? <ToggleRight size={24} style={{ color:"#16A34A" }}/> : <ToggleLeft size={24} style={{ color:"var(--muted-foreground)" }}/>}
                  </button>
                  <button onClick={() => showToast(`Editing "${wf.name}"`)}>
                    <Edit2 size={15} style={{ color:"var(--muted-foreground)" }}/>
                  </button>
                </div>
              </div>
              {/* WHEN → IF → THEN */}
              <div className="flex items-stretch gap-2">
                {[
                  { label:"WHEN", text:wf.trigger,   bg:"#DBEAFE", tc:"#2563EB", dc:"#1E40AF" },
                  { label:"IF",   text:wf.condition, bg:"#FEF3C7", tc:"#D97706", dc:"#92400E" },
                  { label:"THEN", text:wf.action,    bg:"#DCFCE7", tc:"#16A34A", dc:"#14532D" },
                ].map((s, si) => (
                  <div key={si} className="flex-1 flex items-center gap-2">
                    <div className="flex-1 p-3 rounded-lg h-full" style={{ background:s.bg, border:`1px solid ${s.tc}22` }}>
                      <p style={{ fontSize:10, fontWeight:700, color:s.tc, marginBottom:3, letterSpacing:"0.06em" }}>{s.label}</p>
                      <p style={{ fontSize:12, color:s.dc }}>{s.text}</p>
                    </div>
                    {si < 2 && <ChevronRight size={14} style={{ color:"var(--muted-foreground)", flexShrink:0 }}/>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════ Alert Rules ══════════════ */}
      {tab === "notifications" && (
        <div className="flex flex-col gap-4">
          {/* KPI strip */}
          <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
            {[
              { label:"Total Rules",    value:alerts.length,                                      sub:`${alerts.filter(a=>a.enabled).length} enabled`,   color:"#8B2020" },
              { label:"Critical Rules", value:alerts.filter(a=>a.severity==="critical").length,   sub:"Highest priority",                                color:"#DC2626" },
              { label:"Total Fired",    value:alerts.reduce((s,a)=>s+a.fired,0),                  sub:"All time",                                        color:"#D97706" },
              { label:"This Month",     value:"8",                                                 sub:"Alert notifications sent",                        color:"#7C3AED" },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:22, color:k.color, marginBottom:2 }}>{k.value}</p>
                <p style={{ fontSize:13, fontWeight:500, color:"var(--foreground)", marginBottom:1 }}>{k.label}</p>
                <p style={{ fontSize:11, color:"var(--muted-foreground)" }}>{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Network & System Alert Rules</h3>
              <span style={{ fontSize:12, color:"var(--muted-foreground)" }}>{alerts.filter(a=>a.enabled).length} of {alerts.length} enabled</span>
            </div>
            {alerts.map((a, i) => {
              const sev = SC[a.severity];
              return (
                <div key={a.id} className="flex items-center gap-4 px-5 py-4"
                  style={{ borderBottom:i<alerts.length-1?"1px solid var(--border)":"none" }}>
                  <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width:34, height:34, background:sev.bg }}>
                    {a.severity==="critical" ? <AlertTriangle size={15} style={{ color:sev.color }}/> : <Bell size={15} style={{ color:sev.color }}/>}
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize:13, fontWeight:500, color:"var(--foreground)", marginBottom:2 }}>{a.name}</p>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize:11, color:"var(--muted-foreground)" }}>Threshold: <span style={{ fontFamily:"var(--font-mono)", color:"var(--foreground)" }}>{a.threshold}</span></span>
                      <span style={{ fontSize:11, color:"var(--muted-foreground)" }}>· {a.channel}</span>
                      {a.fired>0 && <span style={{ fontSize:11, color:sev.color, fontWeight:600 }}>Fired {a.fired}×</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full capitalize" style={{ fontSize:10, fontWeight:600, background:sev.bg, color:sev.color }}>{a.severity}</span>
                    <button onClick={() => setEditRule(a)} title="Configure rule">
                      <Settings size={14} style={{ color:"var(--muted-foreground)" }}/>
                    </button>
                    <button onClick={() => { showToast(`Test notification sent for "${a.name}"`); }} title="Test alert">
                      <Eye size={14} style={{ color:"var(--muted-foreground)" }}/>
                    </button>
                    <button onClick={() => { setAlerts(p=>p.map(r=>r.id===a.id?{...r,enabled:!r.enabled}:r)); showToast(`"${a.name}" ${a.enabled?"disabled":"enabled"}`); }}>
                      {a.enabled ? <ToggleRight size={22} style={{ color:"#16A34A" }}/> : <ToggleLeft size={22} style={{ color:"var(--muted-foreground)" }}/>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent alerts */}
          <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="px-5 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Recent Alerts Fired</h3>
            </div>
            {[
              { name:"OLT Offline",           time:"19 Aug, 08:14 AM", severity:"critical" as const, resolved:true  },
              { name:"MikroTik CPU Critical",  time:"17 Aug, 03:15 PM", severity:"critical" as const, resolved:true  },
              { name:"ONU Signal Low (×4)",    time:"17 Aug, 11:00 AM", severity:"warning"  as const, resolved:true  },
              { name:"MikroTik High RAM",      time:"16 Aug, 07:22 PM", severity:"warning"  as const, resolved:false },
              { name:"Login Brute Force",      time:"12 Aug, 02:34 AM", severity:"critical" as const, resolved:true  },
            ].map((al, i) => {
              const sev = SC[al.severity];
              return (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5" style={{ borderBottom:i<4?"1px solid var(--border)":"none" }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:sev.color }}/>
                  <div className="flex-1">
                    <span style={{ fontSize:13, fontWeight:500, color:"var(--foreground)" }}>{al.name}</span>
                  </div>
                  <span style={{ fontSize:11, color:"var(--muted-foreground)", fontFamily:"var(--font-mono)" }}>{al.time}</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize:10, fontWeight:600, background:al.resolved?"#DCFCE7":"#FEE2E2", color:al.resolved?"#16A34A":"#DC2626" }}>{al.resolved?"Resolved":"Active"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════ Modals ══════════════ */}

      {/* New / Edit Template */}
      {(showNewTpl || editTpl) && (
        <Modal title={editTpl?"Edit Template":"New SMS Template"} onClose={() => { setShowNewTpl(false); setEditTpl(null); }} width={560}>
          <div>
            <label style={LABEL}>TEMPLATE NAME</label>
            <input value={editTpl?editTpl.name:newTpl.name} onChange={e=>editTpl?setEditTpl({...editTpl,name:e.target.value}):setNewTpl(p=>({...p,name:e.target.value}))} placeholder="e.g. Payment Reminder" style={INPUT}/>
          </div>
          <div>
            <label style={LABEL}>TRIGGER EVENT</label>
            <select value={editTpl?editTpl.trigger:newTpl.trigger} onChange={e=>editTpl?setEditTpl({...editTpl,trigger:e.target.value}):setNewTpl(p=>({...p,trigger:e.target.value}))} style={INPUT}>
              {TRIGGER_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>MESSAGE BODY</label>
            <textarea value={editTpl?editTpl.body:newTpl.body} onChange={e=>editTpl?setEditTpl({...editTpl,body:e.target.value}):setNewTpl(p=>({...p,body:e.target.value}))} rows={4} placeholder="Dear {{customer_name}}, …"
              style={{ ...INPUT, resize:"vertical", lineHeight:1.6 }}/>
            <div className="flex flex-wrap gap-1 mt-2">
              <p style={{ fontSize:11, color:"var(--muted-foreground)", width:"100%", marginBottom:3 }}>Insert variable:</p>
              {["customer_name","isp_name","package","invoice_amount","due_date","pppoe_user","amount","transaction_id"].map(v=>(
                <button key={v} onClick={()=>editTpl?setEditTpl({...editTpl,body:editTpl.body+`{{${v}}}`}):setNewTpl(p=>({...p,body:p.body+`{{${v}}}`}))}
                  className="px-2 py-0.5 rounded" style={{ fontSize:10, fontFamily:"var(--font-mono)", background:"#DBEAFE", color:"#2563EB" }}>
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>
          {(editTpl?editTpl.body:newTpl.body) && (
            <div className="p-3 rounded-lg" style={{ background:"#F0FDF4", border:"1px solid #16A34A22" }}>
              <p style={{ fontSize:10, fontWeight:600, color:"#16A34A", marginBottom:4 }}>PREVIEW</p>
              <p style={{ fontSize:12, color:"#14532D", lineHeight:1.6, fontFamily:"var(--font-mono)" }}>{(editTpl?editTpl.body:newTpl.body).replace(/\{\{customer_name\}\}/g,"Rahim Uddin").replace(/\{\{isp_name\}\}/g,"MAA BEST NETWORK").replace(/\{\{package\}\}/g,"20 Mbps").replace(/\{\{invoice_amount\}\}/g,"800").replace(/\{\{due_date\}\}/g,"25 Aug").replace(/\{\{amount\}\}/g,"800").replace(/\{\{transaction_id\}\}/g,"TXN-84921")}</p>
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={()=>{setShowNewTpl(false);setEditTpl(null);}} className="px-4 py-2 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:13 }}>Cancel</button>
            <button onClick={editTpl?updateTpl:saveTpl} className="px-4 py-2 rounded-lg text-white" style={{ background:"var(--primary)", fontSize:13, fontWeight:600 }}>
              {editTpl?"Save Changes":"Create Template"}
            </button>
          </div>
        </Modal>
      )}

      {/* Test Send */}
      {testSendTpl && (
        <Modal title={`Test Send — ${testSendTpl.name}`} onClose={()=>setTestSendTpl(null)} width={460}>
          <div className="p-3 rounded-lg" style={{ background:"var(--muted)" }}>
            <p style={{ fontSize:11, fontWeight:600, color:"var(--muted-foreground)", marginBottom:4 }}>MESSAGE PREVIEW</p>
            <p style={{ fontSize:12, color:"var(--foreground)", lineHeight:1.6, fontFamily:"var(--font-mono)" }}>
              {testSendTpl.body.replace(/\{\{customer_name\}\}/g,"Test User").replace(/\{\{isp_name\}\}/g,"MAA BEST NETWORK").replace(/\{\{invoice_amount\}\}/g,"800").replace(/\{\{due_date\}\}/g,"25 Aug").replace(/\{\{amount\}\}/g,"800").replace(/\{\{transaction_id\}\}/g,"TXN-TEST")}
            </p>
          </div>
          <div>
            <label style={LABEL}>SEND TO (PHONE NUMBER)</label>
            <input value={testPhone} onChange={e=>setTestPhone(e.target.value)} placeholder="01712-345678" style={INPUT}/>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={()=>setTestSendTpl(null)} className="px-4 py-2 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:13 }}>Cancel</button>
            <button onClick={()=>{setTestSendTpl(null);showToast(`Test SMS sent to ${testPhone}`);}} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white" style={{ background:"#2563EB", fontSize:13, fontWeight:600 }}>
              <Send size={14}/> Send Test SMS
            </button>
          </div>
        </Modal>
      )}

      {/* New Workflow */}
      {showNewWf && (
        <Modal title="New Workflow" onClose={()=>setShowNewWf(false)} width={520}>
          <div>
            <label style={LABEL}>WORKFLOW NAME</label>
            <input value={newWf.name} onChange={e=>setNewWf(p=>({...p,name:e.target.value}))} placeholder="e.g. Auto SMS on Overdue" style={INPUT}/>
          </div>
          {[
            { key:"trigger"  as const, label:"WHEN (TRIGGER EVENT)", ph:"e.g. Invoice overdue by 3 days" },
            { key:"condition"as const, label:"IF (CONDITION)",        ph:"e.g. Customer has active PPPoE" },
            { key:"action"   as const, label:"THEN (ACTION)",         ph:"e.g. Disconnect + Send SMS"     },
          ].map(f => (
            <div key={f.key}>
              <label style={LABEL}>{f.label}</label>
              <input value={newWf[f.key]} onChange={e=>setNewWf(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={INPUT}/>
            </div>
          ))}
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={()=>setShowNewWf(false)} className="px-4 py-2 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:13 }}>Cancel</button>
            <button onClick={saveWorkflow} className="px-4 py-2 rounded-lg text-white" style={{ background:"var(--primary)", fontSize:13, fontWeight:600 }}>Create Workflow</button>
          </div>
        </Modal>
      )}

      {/* New / Edit Alert Rule */}
      {(showNewRule || editRule) && (
        <Modal title={editRule?"Edit Alert Rule":"New Alert Rule"} onClose={()=>{setShowNewRule(false);setEditRule(null);}}>
          {[
            { key:"name"      as const, label:"RULE NAME",   ph:"e.g. MikroTik CPU Critical" },
            { key:"threshold" as const, label:"THRESHOLD",   ph:"e.g. CPU > 90% for 5 min"   },
          ].map(f => (
            <div key={f.key}>
              <label style={LABEL}>{f.label}</label>
              <input value={editRule?(editRule as any)[f.key]:(newRule as any)[f.key]} onChange={e=>editRule?setEditRule({...editRule,[f.key]:e.target.value}):setNewRule(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={INPUT}/>
            </div>
          ))}
          <div className="grid gap-3" style={{ gridTemplateColumns:"1fr 1fr" }}>
            <div>
              <label style={LABEL}>SEVERITY</label>
              <select value={editRule?editRule.severity:newRule.severity} onChange={e=>editRule?setEditRule({...editRule,severity:e.target.value as AlertRule["severity"]}):setNewRule(p=>({...p,severity:e.target.value as AlertRule["severity"]}))} style={INPUT}>
                {SEVERITY_OPTIONS.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>NOTIFICATION CHANNEL</label>
              <select value={editRule?editRule.channel:newRule.channel} onChange={e=>editRule?setEditRule({...editRule,channel:e.target.value}):setNewRule(p=>({...p,channel:e.target.value}))} style={INPUT}>
                {CHANNEL_OPTIONS.map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={()=>{setShowNewRule(false);setEditRule(null);}} className="px-4 py-2 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:13 }}>Cancel</button>
            <button onClick={editRule?updateRule:saveRule} className="px-4 py-2 rounded-lg text-white" style={{ background:"var(--primary)", fontSize:13, fontWeight:600 }}>
              {editRule?"Save Changes":"Create Rule"}
            </button>
          </div>
        </Modal>
      )}

      {/* SMS Send Logs */}
      {showLogs && (
        <Modal title="SMS Send Logs" onClose={()=>setShowLogs(false)} width={600}>
          <div className="rounded-xl overflow-hidden" style={{ border:"1px solid var(--border)" }}>
            {SMS_LOGS.map((log,i)=>(
              <div key={log.id} className="flex items-center gap-4 px-4 py-3.5" style={{ borderBottom:i<SMS_LOGS.length-1?"1px solid var(--border)":"none" }}>
                <div className="flex-1">
                  <p style={{ fontSize:13, fontWeight:500, color:"var(--foreground)", marginBottom:1 }}>{log.recipient}</p>
                  <p style={{ fontSize:11, color:"var(--muted-foreground)" }}>{log.template} · {log.phone}</p>
                </div>
                <span style={{ fontSize:11, color:"var(--muted-foreground)", fontFamily:"var(--font-mono)" }}>{log.time}</span>
                <span className="px-2 py-0.5 rounded-full" style={{ fontSize:10, fontWeight:700, background:log.status==="delivered"?"#DCFCE7":log.status==="failed"?"#FEE2E2":"#FEF3C7", color:log.status==="delivered"?"#16A34A":log.status==="failed"?"#DC2626":"#D97706" }}>
                  {log.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:12, color:"var(--muted-foreground)", textAlign:"center" }}>Showing last 5 sends · <button onClick={()=>showToast("Full log exported")} style={{ color:"var(--primary)", fontWeight:500 }}>Export All</button></p>
        </Modal>
      )}

      {toast && <Toast msg={toast} onClose={()=>setToast("")}/>}
      <style>{`@keyframes spin2{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
