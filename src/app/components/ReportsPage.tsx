import { useState } from "react";
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, Users, Network, ClipboardList, FileText,
  Download, Calendar, Plus, X, CheckCircle2, Search,
  RefreshCw, Play, Trash2
} from "lucide-react";

type Tab = "revenue" | "customer" | "network" | "btrc" | "custom";

// ─── Data ──────────────────────────────────────────────────────────────────────
const revenueData = [
  { month:"Mar", collected:4100000, due:380000 },
  { month:"Apr", collected:4280000, due:420000 },
  { month:"May", collected:4450000, due:360000 },
  { month:"Jun", collected:4620000, due:400000 },
  { month:"Jul", collected:4750000, due:430000 },
  { month:"Aug", collected:4820000, due:390000 },
];

const zoneRevenue = [
  { zone:"Mirpur",     collected:1420000, customers:3847, collection:87 },
  { zone:"Uttara",     collected:1180000, customers:2914, collection:91 },
  { zone:"Dhanmondi",  collected:820000,  customers:2108, collection:84 },
  { zone:"Gulshan",    collected:680000,  customers:1204, collection:94 },
  { zone:"Chittagong", collected:520000,  customers:1841, collection:82 },
  { zone:"Sylhet",     collected:200000,  customers:926,  collection:78 },
];

const packageStats = [
  { pkg:"10 Mbps",  customers:4812, revenue:4812000, pct:37.4 },
  { pkg:"20 Mbps",  customers:3941, revenue:7882000, pct:30.6 },
  { pkg:"30 Mbps",  customers:2108, revenue:6324000, pct:16.4 },
  { pkg:"50 Mbps",  customers:1247, revenue:6235000, pct:9.7  },
  { pkg:"100 Mbps", customers:732,  revenue:7320000, pct:5.7  },
];

const customerGrowth = [
  { month:"Mar", total:11420, new:284, churned:48 },
  { month:"Apr", total:11640, new:268, churned:42 },
  { month:"May", total:11924, new:327, churned:43 },
  { month:"Jun", total:12180, new:298, churned:42 },
  { month:"Jul", total:12504, new:371, churned:47 },
  { month:"Aug", total:12840, new:382, churned:46 },
];

const networkUptimeData = [
  { day:"13 Aug", mikrotik:99.9, olt:99.8, sessions:9240 },
  { day:"14 Aug", mikrotik:99.9, olt:98.1, sessions:9410 },
  { day:"15 Aug", mikrotik:99.4, olt:97.2, sessions:9180 },
  { day:"16 Aug", mikrotik:99.8, olt:99.1, sessions:9580 },
  { day:"17 Aug", mikrotik:99.9, olt:99.4, sessions:9620 },
  { day:"18 Aug", mikrotik:99.9, olt:99.6, sessions:9841 },
  { day:"19 Aug", mikrotik:99.7, olt:99.5, sessions:9720 },
];

const deviceUptime = [
  { name:"MikroTik-01 (Mirpur)", type:"MikroTik", uptime:"99.9%", downtime:"0h 4m", incidents:0, status:"online"  },
  { name:"MikroTik-02 (Uttara)", type:"MikroTik", uptime:"99.9%", downtime:"0h 4m", incidents:0, status:"online"  },
  { name:"MikroTik-03 (Ctg)",    type:"MikroTik", uptime:"98.7%", downtime:"3h 20m",incidents:2, status:"warning" },
  { name:"MikroTik-04 (Sylhet)", type:"MikroTik", uptime:"0%",    downtime:"48h+",  incidents:1, status:"offline" },
  { name:"OLT-Mirpur-01",        type:"OLT",      uptime:"99.8%", downtime:"0h 8m", incidents:0, status:"online"  },
  { name:"OLT-Mirpur-02",        type:"OLT",      uptime:"99.6%", downtime:"0h 14m",incidents:0, status:"online"  },
  { name:"OLT-Uttara-01",        type:"OLT",      uptime:"99.4%", downtime:"0h 22m",incidents:0, status:"online"  },
  { name:"OLT-Banani-01",        type:"OLT",      uptime:"0%",    downtime:"12h+",  incidents:1, status:"offline" },
];

const incidentLog = [
  { id:"INC-014", device:"OLT-Banani-01",  issue:"Device unreachable",      start:"19 Aug 08:14",  duration:"4h 22m", status:"open"     },
  { id:"INC-013", device:"MikroTik-04",    issue:"Power failure",           start:"18 Aug 14:00",  duration:"48h+",   status:"open"     },
  { id:"INC-012", device:"MikroTik-03",    issue:"CPU sustained >80%",      start:"17 Aug 15:00",  duration:"2h 10m", status:"resolved" },
  { id:"INC-011", device:"OLT-Mirpur-01",  issue:"Fiber cut (upstream)",    start:"15 Aug 09:22",  duration:"1h 14m", status:"resolved" },
  { id:"INC-010", device:"MikroTik-02",    issue:"Config backup failed",    start:"14 Aug 02:30",  duration:"0h 5m",  status:"resolved" },
];

const btrcFields = [
  { field:"Total Subscribers",           value:"12,840" },
  { field:"Active Subscribers",           value:"11,993" },
  { field:"New Subscribers (Month)",       value:"382"    },
  { field:"Churned Subscribers (Month)",   value:"46"     },
  { field:"Broadband Connections",         value:"12,840" },
  { field:"FTTH Connections",              value:"8,412"  },
  { field:"Wireless Connections",          value:"4,428"  },
  { field:"Avg Download Speed (Mbps)",     value:"24.6"   },
  { field:"Total Bandwidth Capacity (Gbps)",value:"10"    },
  { field:"Total Bandwidth Used (Gbps)",   value:"4.8"    },
  { field:"Coverage Area (km²)",           value:"124"    },
  { field:"Reporting Period",              value:"Aug 2026"},
];

interface CustomReport {
  id: string; name: string; module: string; created: string; rows: number; lastRun: string;
}

const INITIAL_CUSTOM: CustomReport[] = [
  { id:"CR-001", name:"High Risk Customers — Mirpur",       module:"Customers", created:"15 Aug 2026", rows:142,  lastRun:"15 Aug 2026" },
  { id:"CR-002", name:"Monthly Revenue by Zone",            module:"Finance",   created:"1 Aug 2026",  rows:8,    lastRun:"19 Aug 2026" },
  { id:"CR-003", name:"Unpaid Invoices > 30 Days",          module:"Billing",   created:"1 Aug 2026",  rows:847,  lastRun:"19 Aug 2026" },
  { id:"CR-004", name:"Package Performance Summary",        module:"Billing",   created:"1 Aug 2026",  rows:5,    lastRun:"1 Aug 2026"  },
  { id:"CR-005", name:"Employee Collection Report — Jul",   module:"Finance",   created:"31 Jul 2026", rows:12,   lastRun:"31 Jul 2026" },
];

const MODULES = ["Customers","Billing","Finance","Network","CRM","Resellers"];
const FIELDS_BY_MODULE: Record<string,string[]> = {
  Customers: ["Name","Phone","Zone","Package","Status","Due Amount","Days Overdue"],
  Billing:   ["Invoice ID","Customer","Amount","Status","Due Date","Paid Date"],
  Finance:   ["Transaction ID","Type","Amount","Method","Date","Employee"],
  Network:   ["Device","Type","Uptime","Sessions","Incidents"],
  CRM:       ["Ticket ID","Customer","Subject","Status","Priority","Assigned To"],
  Resellers: ["Reseller","Balance","Customers","Commission","Status"],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const INPUT  = { background:"var(--muted)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 12px", fontSize:13, color:"var(--foreground)", outline:"none", width:"100%" } as const;
const LABEL  = { fontSize:11, fontWeight:600 as const, color:"var(--muted-foreground)", letterSpacing:"0.05em", display:"block" as const, marginBottom:5 };

function exportCSV(filename: string, rows: string[][], headers: string[]) {
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
  a.download = filename;
  a.click();
}

function Toast({ msg, onClose }: { msg:string; onClose:()=>void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl"
      style={{ background:"#130606", color:"#fff", fontSize:13, fontWeight:500, animation:"rpToast 0.2s ease" }}>
      <style>{`@keyframes rpToast{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <CheckCircle2 size={15} style={{ color:"#4ADE80" }}/>{msg}
      <button onClick={onClose}><X size={13} style={{ color:"rgba(255,255,255,0.5)" }}/></button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const tabs: { id:Tab; label:string; icon:React.ElementType }[] = [
  { id:"revenue",  label:"Revenue",         icon:TrendingUp   },
  { id:"customer", label:"Customer",         icon:Users        },
  { id:"network",  label:"Network",          icon:Network      },
  { id:"btrc",     label:"BTRC Regulatory",  icon:ClipboardList},
  { id:"custom",   label:"Custom Reports",   icon:FileText     },
];

export function ReportsPage({ initialTab = "revenue" }: { initialTab?: Tab }) {
  const [tab, setTab]             = useState<Tab>(initialTab);
  const [dateRange, setDateRange] = useState("This Month");
  const [toast, setToast]         = useState("");
  const [customReports, setCustomReports] = useState<CustomReport[]>(INITIAL_CUSTOM);
  const [runningId, setRunningId] = useState<string|null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  // Custom report builder form
  const [builder, setBuilder] = useState({
    name:"", module:"Customers", selectedFields:[] as string[],
    filterField:"", filterOp:"equals", filterValue:"", dateFrom:"", dateTo:""
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(()=>setToast(""),3200); };

  const doExportRevenue = () => {
    exportCSV("revenue_report.csv",
      zoneRevenue.map(z=>[z.zone, String(z.customers), `৳${(z.collected/100000).toFixed(1)}L`, `${z.collection}%`]),
      ["Zone","Customers","Collected","Collection Rate"]
    );
    showToast("Revenue report exported as CSV");
  };

  const doExportBTRC = () => {
    exportCSV("btrc_report_aug2026.csv",
      btrcFields.map(f=>[f.field, f.value]),
      ["Field","Value"]
    );
    showToast("BTRC report exported as CSV");
  };

  const doExportNetworkDevices = () => {
    exportCSV("network_uptime_report.csv",
      deviceUptime.map(d=>[d.name, d.type, d.uptime, d.downtime, String(d.incidents), d.status]),
      ["Device","Type","Uptime","Downtime","Incidents","Status"]
    );
    showToast("Network report exported as CSV");
  };

  const runReport = (r: CustomReport) => {
    setRunningId(r.id);
    setTimeout(() => {
      setRunningId(null);
      setCustomReports(p=>p.map(cr=>cr.id===r.id?{...cr,lastRun:"Just now"}:cr));
      showToast(`"${r.name}" generated — ${r.rows} rows`);
    }, 1400);
  };

  const deleteReport = (id: string) => {
    setCustomReports(p=>p.filter(r=>r.id!==id));
    showToast("Report deleted");
  };

  const saveBuilder = () => {
    if (!builder.name || builder.selectedFields.length === 0) { showToast("Report name and at least one field required"); return; }
    const id = `CR-${String(customReports.length+1).padStart(3,"0")}`;
    setCustomReports(p=>[...p,{ id, name:builder.name, module:builder.module, created:"20 Aug 2026", rows:0, lastRun:"Never" }]);
    setShowBuilder(false);
    setBuilder({ name:"", module:"Customers", selectedFields:[], filterField:"", filterOp:"equals", filterValue:"", dateFrom:"", dateTo:"" });
    showToast(`"${builder.name}" report created`);
  };

  const toggleField = (f: string) => {
    setBuilder(p=>({...p, selectedFields:p.selectedFields.includes(f)?p.selectedFields.filter(x=>x!==f):[...p.selectedFields,f]}));
  };

  const statusDot = (status: string) =>
    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:status==="online"?"#16A34A":status==="warning"?"#D97706":"#DC2626" }}/>;

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:20, color:"var(--foreground)", marginBottom:3 }}>Reports Center</h1>
          <p style={{ fontSize:13, color:"var(--muted-foreground)" }}>Revenue, customer, network, and BTRC regulatory reports</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <Calendar size={14} style={{ color:"var(--muted-foreground)" }}/>
            <select value={dateRange} onChange={e=>setDateRange(e.target.value)} className="outline-none" style={{ background:"transparent", fontSize:13, color:"var(--foreground)" }}>
              {["Today","This Week","This Month","Last 3 Months","This Year"].map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <button onClick={() => { showToast("Generating PDF…"); setTimeout(()=>showToast("PDF downloaded"),1200); }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white" style={{ background:"#8B2020", fontSize:13, fontWeight:500 }}>
            <Download size={14}/> Export PDF
          </button>
          <button onClick={() => {
            if (tab==="revenue") doExportRevenue();
            else if (tab==="btrc") doExportBTRC();
            else if (tab==="network") doExportNetworkDevices();
            else showToast("Exporting report as Excel…");
          }} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:13, color:"var(--foreground)" }}>
            <Download size={14}/> Export Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background:"var(--muted)", width:"fit-content" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
              style={{ background:tab===t.id?"var(--card)":"transparent", fontSize:13, fontWeight:tab===t.id?600:400, color:tab===t.id?"var(--foreground)":"var(--muted-foreground)", boxShadow:tab===t.id?"0 1px 3px rgba(0,0,0,0.1)":"none" }}>
              <Icon size={14}/> {t.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════ Revenue ══════════════ */}
      {tab === "revenue" && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
            {[
              { label:"Monthly Revenue",  value:"৳48.2L", trend:"+3.4%",      up:true  },
              { label:"Collected",        value:"৳44.8L", trend:"93.0% rate",  up:true  },
              { label:"Outstanding",      value:"৳3.4L",  trend:"7.0% unpaid", up:false },
              { label:"MRR Growth",       value:"+৳1.8L", trend:"vs last month",up:true },
            ].map(k=>(
              <div key={k.label} className="rounded-xl p-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                <p style={{ fontSize:12, color:"var(--muted-foreground)", marginBottom:6 }}>{k.label}</p>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:22, color:"var(--foreground)", marginBottom:4 }}>{k.value}</p>
                <span style={{ fontSize:11, fontWeight:600, color:k.up?"#16A34A":"#DC2626" }}>{k.trend}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-5" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)", marginBottom:16 }}>Monthly Collection vs Outstanding</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} margin={{ top:0, right:0, left:-10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>`${(v/100000).toFixed(0)}L`} tick={{ fontSize:11, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12 }} formatter={(v,n)=>[`৳${((v as number)/100000).toFixed(1)}L`,String(n)]}/>
                <Bar key="bar-collected" isAnimationActive={false} dataKey="collected" fill="#8B2020" radius={[3,3,0,0]} name="Collected"/>
                <Bar key="bar-due" isAnimationActive={false} dataKey="due" fill="#FECACA" radius={[3,3,0,0]} name="Outstanding"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Zone-wise Revenue</h3>
              <button onClick={doExportRevenue} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:12 }}>
                <Download size={13}/> Export CSV
              </button>
            </div>
            <table className="w-full">
              <thead><tr style={{ background:"var(--muted)" }}>
                {["Zone","Customers","Collected","Collection Rate","Actions"].map(h=><th key={h} className="px-5 py-3 text-left" style={{ fontSize:11, fontWeight:600, color:"var(--muted-foreground)", letterSpacing:"0.05em" }}>{h === "Actions" ? "" : h.toUpperCase()}</th>)}
              </tr></thead>
              <tbody>
                {zoneRevenue.map((z,i)=>(
                  <tr key={z.zone} style={{ borderBottom:i<zoneRevenue.length-1?"1px solid var(--border)":"none" }}
                    onMouseEnter={e=>(e.currentTarget.style.background="var(--muted)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <td className="px-5 py-3"><span style={{ fontSize:13, fontWeight:500, color:"var(--foreground)" }}>{z.zone}</span></td>
                    <td className="px-5 py-3"><span style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>{z.customers.toLocaleString()}</span></td>
                    <td className="px-5 py-3"><span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:600, color:"#8B2020" }}>৳{(z.collected/100000).toFixed(1)}L</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 rounded-full flex-1" style={{ background:"var(--muted)", maxWidth:120 }}>
                          <div className="h-full rounded-full" style={{ width:`${z.collection}%`, background:z.collection>=90?"#16A34A":z.collection>=80?"#D97706":"#DC2626" }}/>
                        </div>
                        <span style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:600, color:z.collection>=90?"#16A34A":"#D97706", width:36 }}>{z.collection}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={()=>showToast(`Zone detail — ${z.zone}: ৳${(z.collected/100000).toFixed(1)}L from ${z.customers.toLocaleString()} customers`)} style={{ fontSize:11, color:"var(--primary)", fontWeight:500 }}>Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════ Customer ══════════════ */}
      {tab === "customer" && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
            {[
              { label:"Total Customers", value:"12,840", trend:"+382 this month", up:true },
              { label:"Net New (Month)", value:"336",    trend:"382 new − 46 churned", up:true },
              { label:"Churn Rate",      value:"0.36%",  trend:"vs 0.39% last month", up:true },
              { label:"Avg LTV",         value:"৳9,840", trend:"Per subscriber",      up:true },
            ].map(k=>(
              <div key={k.label} className="rounded-xl p-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                <p style={{ fontSize:12, color:"var(--muted-foreground)", marginBottom:6 }}>{k.label}</p>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:22, color:"var(--foreground)", marginBottom:4 }}>{k.value}</p>
                <span style={{ fontSize:11, fontWeight:600, color:k.up?"#16A34A":"#DC2626" }}>{k.trend}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-5" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)", marginBottom:16 }}>Customer Growth Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={customerGrowth} margin={{ top:4, right:0, left:-10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12 }}/>
                <Area key="area-total"   isAnimationActive={false} type="monotone" dataKey="total"   stroke="#8B2020" fill="#8B2020" fillOpacity={0.08} name="Total"   strokeWidth={2}/>
                <Area key="area-new"     isAnimationActive={false} type="monotone" dataKey="new"     stroke="#16A34A" fill="#16A34A" fillOpacity={0.10} name="New"     strokeWidth={2}/>
                <Area key="area-churned" isAnimationActive={false} type="monotone" dataKey="churned" stroke="#DC2626" fill="#DC2626" fillOpacity={0.06} name="Churned" strokeWidth={1.5} strokeDasharray="4 3"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Package Distribution</h3>
              <button onClick={()=>{exportCSV("package_report.csv",packageStats.map(p=>[p.pkg,String(p.customers),`৳${(p.revenue/100000).toFixed(1)}L`,`${p.pct}%`]),["Package","Subscribers","Revenue","Share"]);showToast("Package report exported");}}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:12 }}>
                <Download size={13}/> Export
              </button>
            </div>
            <table className="w-full">
              <thead><tr style={{ background:"var(--muted)" }}>
                {["Package","Subscribers","Revenue","Share","Actions"].map(h=><th key={h} className="px-5 py-3 text-left" style={{ fontSize:11, fontWeight:600, color:"var(--muted-foreground)", letterSpacing:"0.05em" }}>{h === "Actions" ? "" : h.toUpperCase()}</th>)}
              </tr></thead>
              <tbody>
                {packageStats.map((p,i)=>(
                  <tr key={p.pkg} style={{ borderBottom:i<packageStats.length-1?"1px solid var(--border)":"none" }}
                    onMouseEnter={e=>(e.currentTarget.style.background="var(--muted)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <td className="px-5 py-3"><span style={{ fontSize:13, fontWeight:500, color:"var(--foreground)" }}>{p.pkg}</span></td>
                    <td className="px-5 py-3"><span style={{ fontFamily:"var(--font-mono)", fontSize:12 }}>{p.customers.toLocaleString()}</span></td>
                    <td className="px-5 py-3"><span style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:600, color:"#8B2020" }}>৳{(p.revenue/100000).toFixed(1)}L</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 rounded-full" style={{ background:"var(--muted)", width:100 }}>
                          <div className="h-full rounded-full" style={{ width:`${p.pct}%`, background:"#8B2020" }}/>
                        </div>
                        <span style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"var(--muted-foreground)" }}>{p.pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><button onClick={()=>showToast(`${p.pkg}: ${p.customers.toLocaleString()} subscribers · ৳${(p.revenue/100000).toFixed(1)}L revenue`)} style={{ fontSize:11, color:"var(--primary)", fontWeight:500 }}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════ Network ══════════════ */}
      {tab === "network" && (
        <div className="flex flex-col gap-5">
          {/* KPI cards */}
          <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
            {[
              { label:"Avg MikroTik Uptime", value:"99.4%", color:"#16A34A" },
              { label:"Avg OLT Uptime",       value:"98.1%", color:"#16A34A" },
              { label:"Total Incidents",       value:"5",     color:"#D97706" },
              { label:"Peak Sessions (Day)",   value:"9,841", color:"#8B2020" },
            ].map(s=>(
              <div key={s.label} className="rounded-xl p-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                <p style={{ fontSize:12, color:"var(--muted-foreground)", marginBottom:6 }}>{s.label}</p>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:24, color:s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Uptime chart */}
          <div className="rounded-xl p-5" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Device Uptime & Sessions — Last 7 Days</h3>
              <div className="flex items-center gap-4">
                {[{color:"#8B2020",label:"MikroTik"},{color:"#0F766E",label:"OLT"}].map(l=>(
                  <div key={l.label} className="flex items-center gap-1.5"><div className="w-3 h-0.5" style={{ background:l.color }}/><span style={{ fontSize:11, color:"var(--muted-foreground)" }}>{l.label}</span></div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={networkUptimeData} margin={{ top:4, right:0, left:-10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
                <XAxis dataKey="day" tick={{ fontSize:10, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis domain={[95,100]} tickFormatter={v=>`${v}%`} tick={{ fontSize:10, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12 }} formatter={(v)=>[`${v}%`]}/>
                <Line key="line-mikrotik" isAnimationActive={false} type="monotone" dataKey="mikrotik" stroke="#8B2020" strokeWidth={2.5} dot={{ r:3, fill:"#8B2020" }} name="MikroTik"/>
                <Line key="line-olt"     isAnimationActive={false} type="monotone" dataKey="olt"      stroke="#0F766E" strokeWidth={2}   dot={{ r:3, fill:"#0F766E" }} name="OLT"/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Device uptime table */}
          <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Device Uptime Summary</h3>
              <button onClick={doExportNetworkDevices} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:12 }}>
                <Download size={13}/> Export CSV
              </button>
            </div>
            <table className="w-full">
              <thead><tr style={{ background:"var(--muted)" }}>
                {["Device","Type","Uptime","Downtime","Incidents","Status"].map(h=><th key={h} className="px-5 py-3 text-left" style={{ fontSize:11, fontWeight:600, color:"var(--muted-foreground)", letterSpacing:"0.04em" }}>{h.toUpperCase()}</th>)}
              </tr></thead>
              <tbody>
                {deviceUptime.map((d,i)=>(
                  <tr key={d.name} style={{ borderBottom:i<deviceUptime.length-1?"1px solid var(--border)":"none" }}
                    onMouseEnter={e=>(e.currentTarget.style.background="var(--muted)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <td className="px-5 py-3"><span style={{ fontSize:13, fontWeight:500, color:"var(--foreground)" }}>{d.name}</span></td>
                    <td className="px-5 py-3"><span style={{ fontSize:12, color:"var(--muted-foreground)" }}>{d.type}</span></td>
                    <td className="px-5 py-3"><span style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:600, color:d.status==="online"?"#16A34A":d.status==="warning"?"#D97706":"#DC2626" }}>{d.uptime}</span></td>
                    <td className="px-5 py-3"><span style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"var(--muted-foreground)" }}>{d.downtime}</span></td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize:11, fontWeight:600, background:d.incidents>0?"#FEE2E2":"#DCFCE7", color:d.incidents>0?"#DC2626":"#16A34A" }}>{d.incidents}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {statusDot(d.status)}
                        <span style={{ fontSize:12, textTransform:"capitalize", color:"var(--foreground)" }}>{d.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Incident log */}
          <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="px-5 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Incident Log — This Month</h3>
            </div>
            {incidentLog.map((inc,i)=>(
              <div key={inc.id} className="flex items-center gap-4 px-5 py-4" style={{ borderBottom:i<incidentLog.length-1?"1px solid var(--border)":"none" }}
                onMouseEnter={e=>(e.currentTarget.style.background="var(--muted)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted-foreground)", flexShrink:0 }}>{inc.id}</span>
                <div className="flex-1">
                  <p style={{ fontSize:13, fontWeight:500, color:"var(--foreground)", marginBottom:1 }}>{inc.device}</p>
                  <p style={{ fontSize:11, color:"var(--muted-foreground)" }}>{inc.issue}</p>
                </div>
                <span style={{ fontSize:11, color:"var(--muted-foreground)", fontFamily:"var(--font-mono)" }}>{inc.start}</span>
                <span style={{ fontSize:11, color:"var(--muted-foreground)" }}>Duration: {inc.duration}</span>
                <span className="px-2 py-0.5 rounded-full" style={{ fontSize:10, fontWeight:600, background:inc.status==="open"?"#FEE2E2":"#DCFCE7", color:inc.status==="open"?"#DC2626":"#16A34A", textTransform:"capitalize" }}>{inc.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ BTRC ══════════════ */}
      {tab === "btrc" && (
        <div className="flex flex-col gap-5">
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background:"#FEF3C7", border:"1px solid #D97706aa" }}>
            <ClipboardList size={18} style={{ color:"#D97706", flexShrink:0 }}/>
            <p style={{ fontSize:13, color:"#92400E" }}>BTRC regulatory report for August 2026. Verify all fields against current BTRC submission requirements before filing.</p>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Subscriber Statistics · August 2026</h3>
              <div className="flex items-center gap-2">
                <button onClick={doExportBTRC} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white" style={{ background:"#8B2020", fontSize:12, fontWeight:500 }}>
                  <Download size={12}/> Export CSV
                </button>
                <button onClick={()=>showToast("BTRC XML package generated — ready to submit")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:12 }}>
                  Submit to BTRC
                </button>
              </div>
            </div>
            {btrcFields.map((f,i)=>(
              <div key={f.field} className="flex items-center justify-between px-5 py-3.5"
                style={{ borderBottom:i<btrcFields.length-1?"1px solid var(--border)":"none", background:i%2===0?"transparent":"var(--muted)" }}>
                <span style={{ fontSize:13, color:"var(--foreground)" }}>{f.field}</span>
                <span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:600, color:"#8B2020" }}>{f.value}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(3,1fr)" }}>
            {[
              { label:"Submission Deadline", value:"31 Aug 2026", ok:true },
              { label:"Last Submitted",       value:"30 Jul 2026", ok:true },
              { label:"Compliance Status",    value:"In Progress", ok:false },
            ].map(s=>(
              <div key={s.label} className="rounded-xl p-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                <p style={{ fontSize:12, color:"var(--muted-foreground)", marginBottom:6 }}>{s.label}</p>
                <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:16, color:s.ok?"#16A34A":"#D97706" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ Custom Reports ══════════════ */}
      {tab === "custom" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl p-5 flex items-center justify-between" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div>
              <p style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:14, color:"var(--foreground)", marginBottom:3 }}>Build Custom Report</p>
              <p style={{ fontSize:12, color:"var(--muted-foreground)" }}>Select module, pick fields, add filters, and generate your report</p>
            </div>
            <button onClick={()=>setShowBuilder(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white" style={{ background:"#8B2020", fontSize:13, fontWeight:500 }}>
              <Plus size={14}/> New Report
            </button>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Saved Reports</h3>
              <span style={{ fontSize:12, color:"var(--muted-foreground)" }}>{customReports.length} reports</span>
            </div>
            {customReports.map((r,i)=>(
              <div key={r.id} className="flex items-center gap-4 px-5 py-4"
                style={{ borderBottom:i<customReports.length-1?"1px solid var(--border)":"none" }}
                onMouseEnter={e=>(e.currentTarget.style.background="var(--muted)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <div className="flex-1">
                  <p style={{ fontSize:13, fontWeight:500, color:"var(--foreground)", marginBottom:2 }}>{r.name}</p>
                  <p style={{ fontSize:11, color:"var(--muted-foreground)" }}>Module: {r.module} · Created: {r.created} · {r.rows>0?`${r.rows.toLocaleString()} rows`:"Not run yet"} · Last run: {r.lastRun}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>runReport(r)} disabled={runningId===r.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:12, cursor:"pointer" }}>
                    {runningId===r.id ? <RefreshCw size={12} style={{ animation:"spin3 0.8s linear infinite" }}/> : <Play size={12}/>}
                    {runningId===r.id ? "Running…" : "Run"}
                  </button>
                  <button onClick={()=>{exportCSV(`${r.name}.csv`,[["Sample","Data","Row"]],["Col A","Col B","Col C"]);showToast(`"${r.name}" exported`);}}
                    className="px-3 py-1.5 rounded-lg" style={{ background:"#DBEAFE", border:"1px solid #3B82F620", fontSize:12, color:"#2563EB" }}>
                    Export
                  </button>
                  <button onClick={()=>deleteReport(r.id)} className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background:"#FEE2E2", border:"1px solid #DC262622" }}>
                    <Trash2 size={12} style={{ color:"#DC2626" }}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ Custom Report Builder Modal ══════════════ */}
      {showBuilder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background:"rgba(0,0,0,0.45)" }} onClick={()=>setShowBuilder(false)}>
          <div className="rounded-2xl flex flex-col" style={{ background:"var(--card)", border:"1px solid var(--border)", width:600, maxHeight:"90vh", overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:16, color:"var(--foreground)" }}>Build Custom Report</h3>
              <button onClick={()=>setShowBuilder(false)}><X size={18} style={{ color:"var(--muted-foreground)" }}/></button>
            </div>
            <div className="overflow-y-auto p-6 flex flex-col gap-5">
              <div>
                <label style={LABEL}>REPORT NAME</label>
                <input value={builder.name} onChange={e=>setBuilder(p=>({...p,name:e.target.value}))} placeholder="e.g. Overdue Customers by Zone" style={INPUT}/>
              </div>
              <div>
                <label style={LABEL}>MODULE / DATA SOURCE</label>
                <select value={builder.module} onChange={e=>setBuilder(p=>({...p,module:e.target.value,selectedFields:[]}))} style={INPUT}>
                  {MODULES.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={LABEL}>SELECT FIELDS ({builder.selectedFields.length} selected)</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {(FIELDS_BY_MODULE[builder.module]||[]).map(f=>(
                    <button key={f} onClick={()=>toggleField(f)}
                      className="px-3 py-1.5 rounded-lg"
                      style={{ fontSize:12, background:builder.selectedFields.includes(f)?"#8B2020":"var(--muted)", color:builder.selectedFields.includes(f)?"white":"var(--foreground)", border:`1px solid ${builder.selectedFields.includes(f)?"#8B2020":"var(--border)"}` }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns:"1fr 1fr 1fr" }}>
                <div>
                  <label style={LABEL}>FILTER BY FIELD</label>
                  <select value={builder.filterField} onChange={e=>setBuilder(p=>({...p,filterField:e.target.value}))} style={INPUT}>
                    <option value="">None</option>
                    {(FIELDS_BY_MODULE[builder.module]||[]).map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LABEL}>OPERATOR</label>
                  <select value={builder.filterOp} onChange={e=>setBuilder(p=>({...p,filterOp:e.target.value}))} style={INPUT}>
                    {["equals","not equals","greater than","less than","contains","starts with"].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LABEL}>VALUE</label>
                  <input value={builder.filterValue} onChange={e=>setBuilder(p=>({...p,filterValue:e.target.value}))} placeholder="e.g. Mirpur" style={INPUT}/>
                </div>
              </div>
              <div className="grid gap-3" style={{ gridTemplateColumns:"1fr 1fr" }}>
                <div>
                  <label style={LABEL}>DATE FROM</label>
                  <input type="date" value={builder.dateFrom} onChange={e=>setBuilder(p=>({...p,dateFrom:e.target.value}))} style={INPUT}/>
                </div>
                <div>
                  <label style={LABEL}>DATE TO</label>
                  <input type="date" value={builder.dateTo} onChange={e=>setBuilder(p=>({...p,dateTo:e.target.value}))} style={INPUT}/>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={()=>setShowBuilder(false)} className="px-4 py-2 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:13 }}>Cancel</button>
                <button onClick={saveBuilder} className="px-4 py-2 rounded-lg text-white" style={{ background:"#8B2020", fontSize:13, fontWeight:600 }}>Create Report</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={()=>setToast("")}/>}
      <style>{`@keyframes spin3{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
