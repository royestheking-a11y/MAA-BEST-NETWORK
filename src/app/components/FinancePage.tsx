import { useState } from "react";
import {
  Building2, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Wallet, CreditCard, Banknote, Smartphone, ArrowLeftRight, Plus,
  Download, Search, X, CheckCircle2, Filter, Edit2, Trash2, RefreshCw
} from "lucide-react";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

type FinTab = "accounts" | "transactions" | "expenses" | "finance-reports";

// ─── Shared data ───────────────────────────────────────────────────────────────
const monthlyData = [
  { month:"Mar", income:4480000, expense:2840000, profit:1640000 },
  { month:"Apr", income:4550000, expense:2910000, profit:1640000 },
  { month:"May", income:4610000, expense:2880000, profit:1730000 },
  { month:"Jun", income:4720000, expense:2950000, profit:1770000 },
  { month:"Jul", income:4780000, expense:2920000, profit:1860000 },
  { month:"Aug", income:4820000, expense:2960000, profit:1860000 },
];

const INITIAL_ACCOUNTS = [
  { id:"ACC-1", name:"bKash Account",      type:"Mobile Banking", balance:284500,  icon:"mobile", color:"#DB2777", bg:"#FCE7F3", bank:"bKash" },
  { id:"ACC-2", name:"Nagad Account",      type:"Mobile Banking", balance:148200,  icon:"mobile", color:"#D97706", bg:"#FEF3C7", bank:"Nagad" },
  { id:"ACC-3", name:"Dutch-Bangla Bank",  type:"Bank Account",   balance:1840000, icon:"bank",   color:"#2563EB", bg:"#DBEAFE", bank:"DBBL" },
  { id:"ACC-4", name:"Islami Bank",        type:"Bank Account",   balance:920000,  icon:"bank",   color:"#16A34A", bg:"#DCFCE7", bank:"IBBL" },
  { id:"ACC-5", name:"Cash in Hand",       type:"Cash",           balance:54200,   icon:"cash",   color:"#6B7280", bg:"#F3F4F6", bank:"" },
];

const INITIAL_TRANSACTIONS = [
  { id:"TXN-2081", type:"income",  desc:"Customer Payments — bKash Gateway",      amount:284500,  date:"19 Aug 2026", cat:"Billing Revenue",  account:"bKash Account"     },
  { id:"TXN-2080", type:"expense", desc:"Monthly Bandwidth — ISP Bandwidth Ltd",   amount:800000,  date:"18 Aug 2026", cat:"Bandwidth",         account:"Islami Bank"       },
  { id:"TXN-2079", type:"income",  desc:"Customer Payments — Bank Transfer",       amount:920000,  date:"17 Aug 2026", cat:"Billing Revenue",  account:"Dutch-Bangla Bank" },
  { id:"TXN-2078", type:"expense", desc:"Staff Salary Disbursement",               amount:680000,  date:"15 Aug 2026", cat:"Payroll",           account:"Dutch-Bangla Bank" },
  { id:"TXN-2077", type:"expense", desc:"Office Rent — Aug 2026",                  amount:340000,  date:"1 Aug 2026",  cat:"Operations",        account:"Islami Bank"       },
  { id:"TXN-2076", type:"income",  desc:"Reseller Payment — Dhaka Resellers",      amount:340000,  date:"1 Aug 2026",  cat:"Reseller Revenue", account:"bKash Account"     },
  { id:"TXN-2075", type:"expense", desc:"Electricity Bill — Jul 2026",             amount:220000,  date:"30 Jul 2026", cat:"Utilities",         account:"Dutch-Bangla Bank" },
  { id:"TXN-2074", type:"income",  desc:"Customer Payments — Nagad Gateway",       amount:148200,  date:"28 Jul 2026", cat:"Billing Revenue",  account:"Nagad Account"     },
  { id:"TXN-2073", type:"expense", desc:"Equipment Purchase — Mikrotik Routers",  amount:180000,  date:"25 Jul 2026", cat:"Equipment",         account:"Dutch-Bangla Bank" },
  { id:"TXN-2072", type:"expense", desc:"Transport & Delivery",                   amount:140000,  date:"22 Jul 2026", cat:"Transport",         account:"Cash in Hand"      },
];

const INITIAL_EXPENSES = [
  { id:"EXP-1", category:"Bandwidth",       amount:800000, pct:27.0, date:"18 Aug 2026", vendor:"ISP Bandwidth Ltd", recur:true  },
  { id:"EXP-2", category:"Staff Salaries",  amount:680000, pct:23.0, date:"15 Aug 2026", vendor:"Payroll",            recur:true  },
  { id:"EXP-3", category:"Maintenance",     amount:320000, pct:10.8, date:"10 Aug 2026", vendor:"Multiple Vendors",   recur:false },
  { id:"EXP-4", category:"Office Rent",     amount:340000, pct:11.5, date:"1 Aug 2026",  vendor:"Property Owner",     recur:true  },
  { id:"EXP-5", category:"Other",           amount:280000, pct:9.5,  date:"Various",      vendor:"Various",            recur:false },
  { id:"EXP-6", category:"Electricity",     amount:220000, pct:7.4,  date:"30 Jul 2026", vendor:"DESCO",              recur:true  },
  { id:"EXP-7", category:"Equipment",       amount:180000, pct:6.1,  date:"25 Jul 2026", vendor:"Tech Shop BD",       recur:false },
  { id:"EXP-8", category:"Transport",       amount:140000, pct:4.7,  date:"22 Jul 2026", vendor:"Staff",              recur:false },
];

const EXP_COLORS = ["#8B2020","#DC2626","#D97706","#F59E0B","#16A34A","#2563EB","#7C3AED","#6B7280"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const INPUT  = { background:"var(--muted)", border:"1px solid var(--border)", borderRadius:10, padding:"8px 12px", fontSize:13, color:"var(--foreground)", outline:"none", width:"100%" } as const;
const LABEL  = { fontSize:11, fontWeight:600 as const, color:"var(--muted-foreground)", letterSpacing:"0.05em", display:"block" as const, marginBottom:5 };

function exportCSV(filename: string, rows: string[][], headers: string[]) {
  const csv = [headers,...rows].map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = filename; a.click();
}

function Toast({ msg, onClose }: { msg:string; onClose:()=>void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl"
      style={{ background:"#130606", color:"#fff", fontSize:13, fontWeight:500, animation:"fnToast 0.2s ease" }}>
      <style>{`@keyframes fnToast{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <CheckCircle2 size={15} style={{ color:"#4ADE80" }}/>{msg}
      <button onClick={onClose}><X size={13} style={{ color:"rgba(255,255,255,0.5)" }}/></button>
    </div>
  );
}

function Modal({ title, onClose, children, width=480 }: { title:string; onClose:()=>void; children:React.ReactNode; width?:number }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background:"rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="rounded-2xl flex flex-col" style={{ background:"var(--card)", border:"1px solid var(--border)", width, maxHeight:"90vh", overflow:"hidden" }} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
          <h3 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:15, color:"var(--foreground)" }}>{title}</h3>
          <button onClick={onClose}><X size={17} style={{ color:"var(--muted-foreground)" }}/></button>
        </div>
        <div className="overflow-y-auto p-6 flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Account icon helper ───────────────────────────────────────────────────────
function AccIcon({ icon, color, bg }: { icon:string; color:string; bg:string }) {
  const I = icon === "mobile" ? Smartphone : icon === "bank" ? Building2 : icon === "cash" ? Banknote : CreditCard;
  return <div className="flex items-center justify-center rounded-lg" style={{ width:40, height:40, background:bg }}><I size={20} style={{ color }}/></div>;
}

// ─── Tabs config ───────────────────────────────────────────────────────────────
const TABS: { id:FinTab; label:string; icon:React.ElementType }[] = [
  { id:"accounts",        label:"Accounts",        icon:Building2      },
  { id:"transactions",    label:"Transactions",    icon:ArrowLeftRight },
  { id:"expenses",        label:"Expenses",        icon:TrendingDown   },
  { id:"finance-reports", label:"Finance Reports", icon:TrendingUp     },
];

// ─── Page ──────────────────────────────────────────────────────────────────────
export function FinancePage({ initialTab = "accounts" }: { initialTab?: FinTab }) {
  const [tab, setTab]   = useState<FinTab>(initialTab);
  const [toast, setToast] = useState("");
  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  // Accounts state
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [showAddAcc, setShowAddAcc] = useState(false);
  const [newAcc, setNewAcc] = useState({ name:"", type:"Bank Account", balance:"" });

  // Transactions state
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [txSearch, setTxSearch]     = useState("");
  const [txFilter, setTxFilter]     = useState<"all"|"income"|"expense">("all");
  const [showAddTx, setShowAddTx]   = useState(false);
  const [newTx, setNewTx] = useState({ type:"income", desc:"", amount:"", cat:"Billing Revenue", account:"bKash Account", date:"" });

  // Expenses state
  const [expenses, setExpenses]       = useState(INITIAL_EXPENSES);
  const [showAddExp, setShowAddExp]   = useState(false);
  const [newExp, setNewExp] = useState({ category:"", amount:"", vendor:"", date:"", recur:false });
  const [editExpId, setEditExpId]     = useState<string|null>(null);

  const totalBalance = accounts.reduce((a,b)=>a+b.balance,0);

  const filteredTx = transactions.filter(t =>
    (txFilter === "all" || t.type === txFilter) &&
    (t.desc.toLowerCase().includes(txSearch.toLowerCase()) || t.cat.toLowerCase().includes(txSearch.toLowerCase()) || t.id.toLowerCase().includes(txSearch.toLowerCase()))
  );

  const totalExpense = expenses.reduce((a,b)=>a+b.amount,0);

  const saveAccount = () => {
    if (!newAcc.name || !newAcc.balance) { showToast("Name and balance required"); return; }
    const id = `ACC-${accounts.length+1}`;
    setAccounts(p=>[...p,{ id, name:newAcc.name, type:newAcc.type, balance:Number(newAcc.balance), icon: newAcc.type==="Mobile Banking"?"mobile":newAcc.type==="Cash"?"cash":"bank", color:"#6B7280", bg:"#F3F4F6", bank:"" }]);
    setShowAddAcc(false); setNewAcc({ name:"", type:"Bank Account", balance:"" });
    showToast(`Account "${newAcc.name}" added`);
  };

  const saveTransaction = () => {
    if (!newTx.desc || !newTx.amount) { showToast("Description and amount required"); return; }
    const id = `TXN-${2082 + transactions.length}`;
    setTransactions(p=>[{ id, type:newTx.type as "income"|"expense", desc:newTx.desc, amount:Number(newTx.amount), date:newTx.date || "20 Aug 2026", cat:newTx.cat, account:newTx.account },...p]);
    setShowAddTx(false); setNewTx({ type:"income", desc:"", amount:"", cat:"Billing Revenue", account:"bKash Account", date:"" });
    showToast("Transaction recorded");
  };

  const saveExpense = () => {
    if (!newExp.category || !newExp.amount) { showToast("Category and amount required"); return; }
    const total = expenses.reduce((a,b)=>a+b.amount,0) + Number(newExp.amount);
    const pct = Number(((Number(newExp.amount)/total)*100).toFixed(1));
    if (editExpId) {
      setExpenses(p=>p.map(e=>e.id===editExpId?{...e,category:newExp.category,amount:Number(newExp.amount),vendor:newExp.vendor,date:newExp.date||e.date,recur:newExp.recur,pct}:e));
      showToast("Expense updated");
    } else {
      const id = `EXP-${expenses.length+1}`;
      setExpenses(p=>[...p,{ id, category:newExp.category, amount:Number(newExp.amount), pct, date:newExp.date||"20 Aug 2026", vendor:newExp.vendor, recur:newExp.recur }]);
      showToast("Expense added");
    }
    setShowAddExp(false); setEditExpId(null); setNewExp({ category:"", amount:"", vendor:"", date:"", recur:false });
  };

  const deleteExpense = (id:string) => { setExpenses(p=>p.filter(e=>e.id!==id)); showToast("Expense deleted"); };
  const editExpense = (e: typeof expenses[0]) => {
    setEditExpId(e.id);
    setNewExp({ category:e.category, amount:String(e.amount), vendor:e.vendor, date:e.date, recur:e.recur });
    setShowAddExp(true);
  };

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:20, color:"var(--foreground)", marginBottom:3 }}>Finance</h1>
          <p style={{ fontSize:13, color:"var(--muted-foreground)" }}>Accounts, transactions, expenses and financial reporting</p>
        </div>
        <button
          onClick={()=>{ if(tab==="accounts") setShowAddAcc(true); else if(tab==="transactions") setShowAddTx(true); else if(tab==="expenses") setShowAddExp(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
          style={{ background:"var(--primary)", fontSize:13, fontWeight:500 }}>
          <Plus size={14}/>
          {tab==="accounts" ? "Add Account" : tab==="transactions" ? "Add Transaction" : tab==="expenses" ? "Add Expense" : "Export Report"}
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(4,1fr)" }}>
        {[
          { label:"Total Balance",    value:`৳${(totalBalance/100000).toFixed(1)}L`, sub:`${accounts.length} accounts`,  icon:Wallet,       iconBg:"#F3F4F6", iconColor:"#6B7280" },
          { label:"Monthly Income",   value:"৳48.2L",  sub:"Aug 2026",         icon:TrendingUp,   iconBg:"#DCFCE7", iconColor:"#16A34A" },
          { label:"Monthly Expenses", value:"৳29.6L",  sub:"Aug 2026",         icon:TrendingDown, iconBg:"#FEE2E2", iconColor:"#DC2626" },
          { label:"Net Profit",       value:"৳18.6L",  sub:"38.6% margin",     icon:ArrowUpRight, iconBg:"#DBEAFE", iconColor:"#2563EB" },
        ].map(s=>{ const Icon=s.icon; return (
          <div key={s.label} className="rounded-xl p-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center justify-center rounded-lg" style={{ width:32, height:32, background:s.iconBg }}>
                <Icon size={15} style={{ color:s.iconColor }}/>
              </div>
            </div>
            <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:22, color:"var(--foreground)", marginBottom:2 }}>{s.value}</p>
            <p style={{ fontSize:12, fontWeight:500, color:"var(--foreground)", marginBottom:1 }}>{s.label}</p>
            <p style={{ fontSize:11, color:"var(--muted-foreground)" }}>{s.sub}</p>
          </div>
        );})}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background:"var(--muted)" }}>
        {TABS.map(t=>{ const Icon=t.icon; return (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
            style={{ background:tab===t.id?"var(--card)":"transparent", fontSize:13, fontWeight:tab===t.id?600:400, color:tab===t.id?"var(--foreground)":"var(--muted-foreground)", boxShadow:tab===t.id?"0 1px 3px rgba(0,0,0,0.1)":"none" }}>
            <Icon size={14}/>{t.label}
          </button>
        );})}
      </div>

      {/* ══════ ACCOUNTS ══════ */}
      {tab === "accounts" && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(3,1fr)" }}>
            {accounts.map(acc=>(
              <div key={acc.id} className="rounded-xl p-5 flex items-center gap-4" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                <AccIcon icon={acc.icon} color={acc.color} bg={acc.bg}/>
                <div className="flex-1">
                  <p style={{ fontFamily:"var(--font-display)", fontWeight:700, fontSize:18, color:"var(--foreground)", marginBottom:2 }}>৳{(acc.balance/1000).toFixed(1)}K</p>
                  <p style={{ fontSize:13, fontWeight:500, color:"var(--foreground)", marginBottom:1 }}>{acc.name}</p>
                  <p style={{ fontSize:11, color:"var(--muted-foreground)" }}>{acc.type}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={()=>showToast(`${acc.name}: ৳${acc.balance.toLocaleString()}`)} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)" }}>
                    <ArrowUpRight size={12} style={{ color:"var(--muted-foreground)" }}/>
                  </button>
                  <button onClick={()=>{ setAccounts(p=>p.filter(a=>a.id!==acc.id)); showToast(`${acc.name} removed`); }} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background:"#FEE2E2", border:"1px solid #DC262622" }}>
                    <Trash2 size={11} style={{ color:"#DC2626" }}/>
                  </button>
                </div>
              </div>
            ))}
            <button onClick={()=>setShowAddAcc(true)} className="rounded-xl flex items-center justify-center gap-2 border-dashed" style={{ border:"2px dashed var(--border)", minHeight:100, color:"var(--muted-foreground)", fontSize:13 }}>
              <Plus size={16}/> Add Account
            </button>
          </div>

          {/* Income vs Expenses chart */}
          <div className="rounded-xl p-5" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)", marginBottom:4 }}>Income vs Expenses — 6 Months</h3>
            <p style={{ fontSize:12, color:"var(--muted-foreground)", marginBottom:16 }}>Financial performance trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top:0, right:0, left:-16, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>`${(v/100000).toFixed(0)}L`} tick={{ fontSize:11, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12 }} formatter={(v,n)=>[`৳${((v as number)/100000).toFixed(1)}L`,String(n)]}/>
                <Bar key="bar-income"  isAnimationActive={false} dataKey="income"  fill="#8B2020" radius={[3,3,0,0]} name="Income"/>
                <Bar key="bar-expense" isAnimationActive={false} dataKey="expense" fill="#FECACA" radius={[3,3,0,0]} name="Expenses"/>
                <Bar key="bar-profit"  isAnimationActive={false} dataKey="profit"  fill="#DCFCE7" radius={[3,3,0,0]} name="Profit"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ══════ TRANSACTIONS ══════ */}
      {tab === "transactions" && (
        <div className="flex flex-col gap-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
              <Search size={14} style={{ color:"var(--muted-foreground)" }}/>
              <input value={txSearch} onChange={e=>setTxSearch(e.target.value)} placeholder="Search transactions…" className="flex-1 outline-none bg-transparent" style={{ fontSize:13, color:"var(--foreground)" }}/>
              {txSearch && <button onClick={()=>setTxSearch("")}><X size={13} style={{ color:"var(--muted-foreground)" }}/></button>}
            </div>
            <div className="flex gap-1 p-1 rounded-lg" style={{ background:"var(--muted)" }}>
              {(["all","income","expense"] as const).map(f=>(
                <button key={f} onClick={()=>setTxFilter(f)}
                  className="px-3 py-1.5 rounded-md capitalize"
                  style={{ fontSize:12, background:txFilter===f?"var(--card)":"transparent", color:txFilter===f?"var(--foreground)":"var(--muted-foreground)", fontWeight:txFilter===f?600:400 }}>
                  {f}
                </button>
              ))}
            </div>
            <button onClick={()=>{exportCSV("transactions.csv",filteredTx.map(t=>[t.id,t.desc,t.cat,t.date,t.type==="income"?`+${t.amount}`:`-${t.amount}`,t.account]),["ID","Description","Category","Date","Amount","Account"]);showToast("Transactions exported");}}
              className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background:"var(--card)", border:"1px solid var(--border)", fontSize:12 }}>
              <Download size={13}/> Export
            </button>
          </div>

          {/* Summary strip */}
          <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(3,1fr)" }}>
            {[
              { label:"Total Income",   value:`৳${(filteredTx.filter(t=>t.type==="income").reduce((a,b)=>a+b.amount,0)/1000).toFixed(0)}K`, color:"#16A34A" },
              { label:"Total Expenses", value:`৳${(filteredTx.filter(t=>t.type==="expense").reduce((a,b)=>a+b.amount,0)/1000).toFixed(0)}K`, color:"#DC2626" },
              { label:"Transactions",   value:String(filteredTx.length),  color:"var(--foreground)" },
            ].map(s=>(
              <div key={s.label} className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
                <div>
                  <p style={{ fontFamily:"var(--font-mono)", fontWeight:700, fontSize:18, color:s.color }}>{s.value}</p>
                  <p style={{ fontSize:11, color:"var(--muted-foreground)" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <table className="w-full">
              <thead><tr style={{ background:"var(--muted)" }}>
                {["ID","Description","Category","Account","Date","Amount"].map(h=><th key={h} className="text-left px-5 py-3" style={{ fontSize:11, fontWeight:600, color:"var(--muted-foreground)", letterSpacing:"0.04em" }}>{h.toUpperCase()}</th>)}
              </tr></thead>
              <tbody>
                {filteredTx.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-8 text-center" style={{ fontSize:13, color:"var(--muted-foreground)" }}>No transactions match your filter</td></tr>
                )}
                {filteredTx.map((t,i)=>(
                  <tr key={t.id} style={{ borderBottom:i<filteredTx.length-1?"1px solid var(--border)":"none" }}
                    onMouseEnter={e=>(e.currentTarget.style.background="var(--muted)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <td className="px-5 py-3"><span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--primary)" }}>{t.id}</span></td>
                    <td className="px-5 py-3"><p style={{ fontSize:13, fontWeight:500, color:"var(--foreground)" }}>{t.desc}</p></td>
                    <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full" style={{ fontSize:11, background:"var(--muted)", color:"var(--muted-foreground)", border:"1px solid var(--border)" }}>{t.cat}</span></td>
                    <td className="px-5 py-3"><span style={{ fontSize:12, color:"var(--muted-foreground)" }}>{t.account}</span></td>
                    <td className="px-5 py-3"><span style={{ fontSize:12, color:"var(--muted-foreground)" }}>{t.date}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {t.type==="income"?<ArrowUpRight size={14} style={{ color:"#16A34A" }}/>:<ArrowDownRight size={14} style={{ color:"#DC2626" }}/>}
                        <span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:700, color:t.type==="income"?"#16A34A":"#DC2626" }}>
                          {t.type==="income"?"+":"-"}৳{t.amount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════ EXPENSES ══════ */}
      {tab === "expenses" && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-4" style={{ gridTemplateColumns:"1fr 300px" }}>
            {/* Expense list */}
            <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
                <div>
                  <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Expense Categories</h3>
                  <p style={{ fontSize:11, color:"var(--muted-foreground)", marginTop:2 }}>Total: ৳{(totalExpense/100000).toFixed(1)}L — Aug 2026</p>
                </div>
                <button onClick={()=>{ setEditExpId(null); setNewExp({ category:"", amount:"", vendor:"", date:"", recur:false }); setShowAddExp(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white" style={{ background:"#8B2020", fontSize:12 }}>
                  <Plus size={12}/> Add
                </button>
              </div>
              <table className="w-full">
                <thead><tr style={{ background:"var(--muted)" }}>
                  {["Category","Vendor","Amount","Share","Recurring",""].map(h=><th key={h} className="text-left px-5 py-3" style={{ fontSize:11, fontWeight:600, color:"var(--muted-foreground)", letterSpacing:"0.04em" }}>{h.toUpperCase()}</th>)}
                </tr></thead>
                <tbody>
                  {expenses.map((e,i)=>(
                    <tr key={e.id} style={{ borderBottom:i<expenses.length-1?"1px solid var(--border)":"none" }}
                      onMouseEnter={ev=>(ev.currentTarget.style.background="var(--muted)")} onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                      <td className="px-5 py-3"><span style={{ fontSize:13, fontWeight:500, color:"var(--foreground)" }}>{e.category}</span></td>
                      <td className="px-5 py-3"><span style={{ fontSize:12, color:"var(--muted-foreground)" }}>{e.vendor}</span></td>
                      <td className="px-5 py-3"><span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:700, color:"#DC2626" }}>৳{(e.amount/1000).toFixed(0)}K</span></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full" style={{ background:"var(--muted)", width:60 }}>
                            <div className="h-full rounded-full" style={{ width:`${Math.min(e.pct,100)}%`, background:EXP_COLORS[i%EXP_COLORS.length] }}/>
                          </div>
                          <span style={{ fontSize:11, color:"var(--muted-foreground)" }}>{e.pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full" style={{ fontSize:10, fontWeight:600, background:e.recur?"#DBEAFE":"var(--muted)", color:e.recur?"#2563EB":"var(--muted-foreground)" }}>
                          {e.recur?"Monthly":"One-time"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={()=>editExpense(e)} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)" }}>
                            <Edit2 size={11} style={{ color:"var(--muted-foreground)" }}/>
                          </button>
                          <button onClick={()=>deleteExpense(e.id)} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background:"#FEE2E2", border:"1px solid #DC262622" }}>
                            <Trash2 size={11} style={{ color:"#DC2626" }}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expense pie */}
            <div className="rounded-xl p-5" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)", marginBottom:12 }}>Distribution</h3>
              <div className="flex justify-center mb-4">
                <PieChart width={160} height={160}>
                  <Pie data={expenses} dataKey="amount" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {expenses.map((e,i)=><Cell key={`exp-cell-${e.id}`} fill={EXP_COLORS[i%EXP_COLORS.length]}/>)}
                  </Pie>
                </PieChart>
              </div>
              <div className="flex flex-col gap-2">
                {expenses.slice(0,6).map((e,i)=>(
                  <div key={e.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background:EXP_COLORS[i%EXP_COLORS.length] }}/>
                      <span style={{ fontSize:11, color:"var(--foreground)" }}>{e.category}</span>
                    </div>
                    <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--muted-foreground)" }}>{e.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════ FINANCE REPORTS ══════ */}
      {tab === "finance-reports" && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div/>
            <div className="flex items-center gap-2">
              <button onClick={()=>{exportCSV("pl_report.csv",monthlyData.map(m=>[m.month,`৳${(m.income/100000).toFixed(1)}L`,`৳${(m.expense/100000).toFixed(1)}L`,`৳${(m.profit/100000).toFixed(1)}L`]),["Month","Income","Expense","Profit"]);showToast("P&L report exported");}}
                className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background:"var(--card)", border:"1px solid var(--border)", fontSize:12 }}>
                <Download size={13}/> Export CSV
              </button>
              <button onClick={()=>{ showToast("Generating PDF…"); setTimeout(()=>showToast("PDF downloaded"),1200); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white" style={{ background:"#8B2020", fontSize:12 }}>
                <Download size={13}/> Export PDF
              </button>
            </div>
          </div>

          {/* P&L Summary */}
          <div className="rounded-xl overflow-hidden" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <div className="px-5 py-4" style={{ borderBottom:"1px solid var(--border)" }}>
              <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)" }}>Profit & Loss Statement — 2026</h3>
            </div>
            <table className="w-full">
              <thead><tr style={{ background:"var(--muted)" }}>
                {["Month","Income","Expenses","Net Profit","Margin"].map(h=><th key={h} className="text-left px-5 py-3" style={{ fontSize:11, fontWeight:600, color:"var(--muted-foreground)", letterSpacing:"0.04em" }}>{h.toUpperCase()}</th>)}
              </tr></thead>
              <tbody>
                {monthlyData.map((m,i)=>{
                  const margin = Math.round(m.profit/m.income*100);
                  return (
                    <tr key={m.month} style={{ borderBottom:i<monthlyData.length-1?"1px solid var(--border)":"none" }}
                      onMouseEnter={e=>(e.currentTarget.style.background="var(--muted)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                      <td className="px-5 py-3.5"><span style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:13, color:"var(--foreground)" }}>{m.month} 2026</span></td>
                      <td className="px-5 py-3.5"><span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:600, color:"#16A34A" }}>৳{(m.income/100000).toFixed(1)}L</span></td>
                      <td className="px-5 py-3.5"><span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:600, color:"#DC2626" }}>৳{(m.expense/100000).toFixed(1)}L</span></td>
                      <td className="px-5 py-3.5"><span style={{ fontFamily:"var(--font-mono)", fontSize:14, fontWeight:700, color:"#2563EB" }}>৳{(m.profit/100000).toFixed(1)}L</span></td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 rounded-full" style={{ background:"var(--muted)", width:60 }}>
                            <div className="h-full rounded-full" style={{ width:`${margin}%`, background:"#16A34A" }}/>
                          </div>
                          <span style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:600, color:"#16A34A" }}>{margin}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {/* Total row */}
                <tr style={{ background:"var(--muted)" }}>
                  <td className="px-5 py-3.5"><span style={{ fontWeight:700, fontSize:13, color:"var(--foreground)" }}>Total</span></td>
                  <td className="px-5 py-3.5"><span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:700, color:"#16A34A" }}>৳{(monthlyData.reduce((a,b)=>a+b.income,0)/100000).toFixed(1)}L</span></td>
                  <td className="px-5 py-3.5"><span style={{ fontFamily:"var(--font-mono)", fontSize:13, fontWeight:700, color:"#DC2626" }}>৳{(monthlyData.reduce((a,b)=>a+b.expense,0)/100000).toFixed(1)}L</span></td>
                  <td className="px-5 py-3.5"><span style={{ fontFamily:"var(--font-mono)", fontSize:14, fontWeight:700, color:"#2563EB" }}>৳{(monthlyData.reduce((a,b)=>a+b.profit,0)/100000).toFixed(1)}L</span></td>
                  <td className="px-5 py-3.5"><span style={{ fontFamily:"var(--font-mono)", fontSize:12, fontWeight:700, color:"#16A34A" }}>38.4%</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Trend chart */}
          <div className="rounded-xl p-5" style={{ background:"var(--card)", border:"1px solid var(--border)" }}>
            <h3 style={{ fontFamily:"var(--font-display)", fontWeight:600, fontSize:15, color:"var(--foreground)", marginBottom:16 }}>Profit Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData} margin={{ top:4, right:0, left:-10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>`${(v/100000).toFixed(0)}L`} tick={{ fontSize:11, fill:"var(--muted-foreground)" }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, fontSize:12 }} formatter={(v,n)=>[`৳${((v as number)/100000).toFixed(1)}L`,String(n)]}/>
                <Area key="area-income"  isAnimationActive={false} type="monotone" dataKey="income"  stroke="#16A34A" fill="#16A34A" fillOpacity={0.08} name="Income"   strokeWidth={2}/>
                <Area key="area-expense" isAnimationActive={false} type="monotone" dataKey="expense" stroke="#DC2626" fill="#DC2626" fillOpacity={0.06} name="Expenses" strokeWidth={2}/>
                <Area key="area-profit"  isAnimationActive={false} type="monotone" dataKey="profit"  stroke="#2563EB" fill="#2563EB" fillOpacity={0.10} name="Profit"   strokeWidth={2.5}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ══════ MODALS ══════ */}
      {showAddAcc && (
        <Modal title="Add Account" onClose={()=>setShowAddAcc(false)}>
          <div><label style={LABEL}>ACCOUNT NAME</label><input value={newAcc.name} onChange={e=>setNewAcc(p=>({...p,name:e.target.value}))} placeholder="e.g. Sonali Bank" style={INPUT}/></div>
          <div><label style={LABEL}>TYPE</label>
            <select value={newAcc.type} onChange={e=>setNewAcc(p=>({...p,type:e.target.value}))} style={INPUT}>
              {["Bank Account","Mobile Banking","Cash","Other"].map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div><label style={LABEL}>OPENING BALANCE (৳)</label><input type="number" value={newAcc.balance} onChange={e=>setNewAcc(p=>({...p,balance:e.target.value}))} placeholder="0" style={INPUT}/></div>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={()=>setShowAddAcc(false)} className="px-4 py-2 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:13 }}>Cancel</button>
            <button onClick={saveAccount} className="px-5 py-2 rounded-lg text-white" style={{ background:"#8B2020", fontSize:13, fontWeight:600 }}>Add Account</button>
          </div>
        </Modal>
      )}

      {showAddTx && (
        <Modal title="Add Transaction" onClose={()=>setShowAddTx(false)}>
          <div className="flex gap-1 p-1 rounded-lg" style={{ background:"var(--muted)" }}>
            {(["income","expense"] as const).map(tp=>(
              <button key={tp} onClick={()=>setNewTx(p=>({...p,type:tp}))}
                className="flex-1 py-2 rounded-md capitalize"
                style={{ fontSize:13, background:newTx.type===tp?"var(--card)":"transparent", fontWeight:newTx.type===tp?600:400, color:newTx.type===tp?tp==="income"?"#16A34A":"#DC2626":"var(--muted-foreground)" }}>
                {tp}
              </button>
            ))}
          </div>
          <div><label style={LABEL}>DESCRIPTION</label><input value={newTx.desc} onChange={e=>setNewTx(p=>({...p,desc:e.target.value}))} placeholder="e.g. Customer payment — bKash" style={INPUT}/></div>
          <div className="grid gap-3" style={{ gridTemplateColumns:"1fr 1fr" }}>
            <div><label style={LABEL}>AMOUNT (৳)</label><input type="number" value={newTx.amount} onChange={e=>setNewTx(p=>({...p,amount:e.target.value}))} placeholder="0" style={INPUT}/></div>
            <div><label style={LABEL}>DATE</label><input type="date" value={newTx.date} onChange={e=>setNewTx(p=>({...p,date:e.target.value}))} style={INPUT}/></div>
          </div>
          <div><label style={LABEL}>CATEGORY</label>
            <select value={newTx.cat} onChange={e=>setNewTx(p=>({...p,cat:e.target.value}))} style={INPUT}>
              {["Billing Revenue","Reseller Revenue","Bandwidth","Payroll","Operations","Utilities","Equipment","Transport","Other"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div><label style={LABEL}>ACCOUNT</label>
            <select value={newTx.account} onChange={e=>setNewTx(p=>({...p,account:e.target.value}))} style={INPUT}>
              {accounts.map(a=><option key={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={()=>setShowAddTx(false)} className="px-4 py-2 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:13 }}>Cancel</button>
            <button onClick={saveTransaction} className="px-5 py-2 rounded-lg text-white" style={{ background:"#8B2020", fontSize:13, fontWeight:600 }}>Record Transaction</button>
          </div>
        </Modal>
      )}

      {showAddExp && (
        <Modal title={editExpId ? "Edit Expense" : "Add Expense"} onClose={()=>{ setShowAddExp(false); setEditExpId(null); }}>
          <div><label style={LABEL}>CATEGORY</label><input value={newExp.category} onChange={e=>setNewExp(p=>({...p,category:e.target.value}))} placeholder="e.g. Office Supplies" style={INPUT}/></div>
          <div className="grid gap-3" style={{ gridTemplateColumns:"1fr 1fr" }}>
            <div><label style={LABEL}>AMOUNT (৳)</label><input type="number" value={newExp.amount} onChange={e=>setNewExp(p=>({...p,amount:e.target.value}))} placeholder="0" style={INPUT}/></div>
            <div><label style={LABEL}>DATE</label><input type="date" value={newExp.date} onChange={e=>setNewExp(p=>({...p,date:e.target.value}))} style={INPUT}/></div>
          </div>
          <div><label style={LABEL}>VENDOR / PAYEE</label><input value={newExp.vendor} onChange={e=>setNewExp(p=>({...p,vendor:e.target.value}))} placeholder="e.g. DESCO" style={INPUT}/></div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={newExp.recur} onChange={e=>setNewExp(p=>({...p,recur:e.target.checked}))}/>
              <div className="w-9 h-5 rounded-full transition-colors" style={{ background:newExp.recur?"#8B2020":"var(--muted)", border:"1px solid var(--border)" }}/>
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" style={{ transform:newExp.recur?"translateX(16px)":"translateX(0)" }}/>
            </div>
            <span style={{ fontSize:13, color:"var(--foreground)" }}>Recurring monthly expense</span>
          </label>
          <div className="flex gap-2 justify-end pt-1">
            <button onClick={()=>{ setShowAddExp(false); setEditExpId(null); }} className="px-4 py-2 rounded-lg" style={{ background:"var(--muted)", border:"1px solid var(--border)", fontSize:13 }}>Cancel</button>
            <button onClick={saveExpense} className="px-5 py-2 rounded-lg text-white" style={{ background:"#8B2020", fontSize:13, fontWeight:600 }}>{editExpId?"Update":"Add Expense"}</button>
          </div>
        </Modal>
      )}

      {toast && <Toast msg={toast} onClose={()=>setToast("")}/>}
    </div>
  );
}
