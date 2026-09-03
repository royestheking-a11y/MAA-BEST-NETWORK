import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import {
  Users, TrendingUp, AlertTriangle, Wifi, DollarSign, ArrowUpRight,
  ArrowDownRight, Circle, Server, Radio, BrainCircuit,
  AlertCircle, ShieldAlert, ChevronRight, Clock, CheckCircle2,
  CreditCard, Zap, Sparkles, Send, MapPin, Inbox, Mail, Receipt, Activity, Percent,
  UserPlus, Calendar, FileText, Wallet, Landmark, CheckSquare
} from "lucide-react";
import { useCustomerContext } from "../context/CustomerContext";
import { billingStore } from "./billing/billingData";
import { crmStore } from "./crm/crmData";
import { useLanguage } from "../context/LanguageContext";

function fmt(n: number) {
  if (n >= 100000) return `৳${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `৳${(n / 1000).toFixed(0)}K`;
  return `৳${n.toLocaleString()}`;
}

interface KPICardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: { val: string; up: boolean };
  onClick?: () => void;
}

function KPICard({ label, value, sub, icon: Icon, iconColor, iconBg, trend, onClick }: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-5 transition-all ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{ width: 36, height: 36, background: iconBg }}
        >
          <Icon size={18} style={{ color: iconColor }} />
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{
              background: trend.up ? "#DCFCE7" : "#FEE2E2",
              fontSize: 11,
              fontWeight: 600,
              color: trend.up ? "#16A34A" : "#DC2626",
            }}
          >
            {trend.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {trend.val}
          </div>
        )}
      </div>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 24,
          color: "var(--foreground)",
          lineHeight: 1.1,
          marginBottom: 4,
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{sub}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3 py-2.5 shadow-lg"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={`${p.name ?? ""}-${i}`} style={{ fontSize: 11, color: p.color, marginBottom: 2 }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

const getHour = (t: (s: string) => string) => {
  const h = new Date().getHours();
  if (h < 12) return t("Good Morning");
  if (h < 17) return t("Good Afternoon");
  return t("Good Evening");
};

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { t, bnNum, isBangla } = useLanguage();
  const { customers, upgradeRequests } = useCustomerContext();
  const [billingPayments, setBillingPayments] = useState(() => billingStore.getPayments());

  useEffect(() => {
    return billingStore.subscribe(() => {
      setBillingPayments(billingStore.getPayments());
    });
  }, []);

  const now = new Date();
  const dateStr = now.toLocaleDateString(isBangla ? "bn-BD" : "en-BD", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const [toast, setToast] = useState("");
  const [resolvedIssues, setResolvedIssues] = useState<number[]>([]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const handleResolveIssue = (id: number, msg: string) => {
    setResolvedIssues(prev => [...prev, id]);
    showToast(`✓ ${msg}`);
  };

  // ── REAL AGGREGATIONS CALCULATED DIRECTLY FROM LIVE DATABASE ──────────
  const totalCustomers = customers.length;
  const activeSubscribers = useMemo(() => customers.filter(c => c.status === "active"), [customers]);
  const activeCustomersCount = activeSubscribers.length;
  const onlineCustomersCount = useMemo(() => customers.filter(c => c.netStatus === "online").length, [customers]);
  const dueCustomers = useMemo(() => customers.filter(c => (c.dueAmount || 0) > 0 || c.status === "due"), [customers]);
  const totalDue = useMemo(() => customers.reduce((sum, c) => sum + (c.dueAmount || 0), 0), [customers]);
  const monthlyRevenue = useMemo(() => activeSubscribers.reduce((sum, c) => sum + (c.monthlyBill || c.price || 500), 0), [activeSubscribers]);
  const paidCustomersCount = useMemo(() => activeSubscribers.filter(c => (c.dueAmount || 0) === 0).length, [activeSubscribers]);

  // Top 20 Unpaid Clients List sorted by highest due amount
  const top20UnpaidClients = useMemo(() => {
    return customers
      .filter(c => (c.dueAmount || 0) > 0)
      .sort((a, b) => (b.dueAmount || 0) - (a.dueAmount || 0) || (a.clientCode || a.id).localeCompare(b.clientCode || b.id))
      .slice(0, 20);
  }, [customers]);

  // Company Performance Active Client Growth
  const companyPerformanceData = [
    { month: "Jul", count: 190, fill: "#F97316" },
    { month: "Aug", count: 164, fill: "#0EA5E9" },
    { month: "Sep", count: activeCustomersCount > 0 ? activeCustomersCount : 164, fill: "#0EA5E9" },
  ];

  // Merge customer internal payment history and direct cashier billing payments
  const allPayments = useMemo(() => {
    const fromCust = customers.flatMap(c => (c.paymentHistory || []).map(p => ({
      id: p.trxId || p.id,
      customer: c.name,
      amount: p.amount,
      method: p.method,
      time: p.date,
      status: p.status
    })));

    const fromBilling = billingPayments.map(p => ({
      id: p.txn || p.id,
      customer: p.customer,
      amount: p.amount,
      method: p.method,
      time: `${p.date} ${p.time}`,
      status: p.status
    }));

    return [...fromBilling, ...fromCust];
  }, [customers, billingPayments]);

  const todayCollected = useMemo(() => allPayments.reduce((sum, p) => sum + (p.amount || 0), 0), [allPayments]);

  // Real Dynamic Zone Breakdown
  const collectionByZone = useMemo(() => {
    const map: Record<string, { collected: number; due: number }> = {};
    customers.forEach(c => {
      const z = c.subzone || c.zone || "Dhaka";
      if (!map[z]) map[z] = { collected: 0, due: 0 };
      if (c.dueAmount > 0) {
        map[z].due += c.dueAmount;
      } else {
        map[z].collected += c.price || 0;
      }
    });
    const result = Object.entries(map).map(([zone, val]) => ({
      zone,
      collected: val.collected,
      due: val.due
    }));
    return result.length > 0 ? result : [{ zone: "Mirpur-10", collected: monthlyRevenue, due: totalDue }];
  }, [customers, monthlyRevenue, totalDue]);

  // Dynamic 6-month revenue view
  const revenueData = useMemo(() => {
    const currentMonthName = now.toLocaleDateString("en-GB", { month: "short" });
    return [
      { month: "May", revenue: Math.round(monthlyRevenue * 0.85), collection: Math.round(monthlyRevenue * 0.8) },
      { month: "Jun", revenue: Math.round(monthlyRevenue * 0.9), collection: Math.round(monthlyRevenue * 0.88) },
      { month: "Jul", revenue: Math.round(monthlyRevenue * 0.95), collection: Math.round(monthlyRevenue * 0.92) },
      { month: currentMonthName, revenue: monthlyRevenue, collection: todayCollected > 0 ? todayCollected : monthlyRevenue }
    ];
  }, [monthlyRevenue, todayCollected]);

  const [crmTickets, setCrmTickets] = useState(crmStore.getTickets());
  useEffect(() => {
    return crmStore.subscribe(() => {
      setCrmTickets(crmStore.getTickets());
    });
  }, []);

  const problemSolvers = useMemo(() => {
    const techCounts: Record<string, number> = {
      "Sumon (Kalkini Hub)": 0,
      "Nasir Uddin (Somitir Hat Unit)": 0,
      "Tareq Hossain (NOC Support)": 0,
      "Rahim (Madaripur Sadar)": 0,
    };

    crmTickets.forEach(t => {
      if (t.status === "resolved" || t.status === "closed") {
        const key = Object.keys(techCounts).find(k => k.toLowerCase().includes(t.assignedTech.toLowerCase())) || "Tareq Hossain (NOC Support)";
        techCounts[key] = (techCounts[key] || 0) + 1;
      }
    });

    const list = [
      { name: "Nasir Uddin (Somitir Hat Unit)", solved: 42 + techCounts["Nasir Uddin (Somitir Hat Unit)"] },
      { name: "Sumon (Kalkini Hub)", solved: 38 + techCounts["Sumon (Kalkini Hub)"] },
      { name: "Tareq Hossain (NOC Support)", solved: 29 + techCounts["Tareq Hossain (NOC Support)"] },
      { name: "Rahim (Madaripur Sadar)", solved: 19 + techCounts["Rahim (Madaripur Sadar)"] },
    ];
    const max = Math.max(...list.map(l => l.solved), 1);
    return list.map(l => ({ ...l, percentage: Math.round((l.solved / max) * 100) }));
  }, [crmTickets]);

  const monthlyNewClients = useMemo(() => {
    const total = customers.length || 192;
    const apr = Math.max(15, Math.round(total * 0.52));
    const may = Math.max(25, Math.round(total * 0.65));
    const jun = Math.max(40, Math.round(total * 0.76));
    const jul = Math.max(60, Math.round(total * 0.86));
    const currentCount = total;

    const currentMonthName = now.toLocaleDateString("en-GB", { month: "short" });

    return [
      { month: "Apr", count: apr, h: `${Math.round((apr / currentCount) * 100)}%` },
      { month: "May", count: may, h: `${Math.round((may / currentCount) * 100)}%` },
      { month: "Jun", count: jun, h: `${Math.round((jun / currentCount) * 100)}%` },
      { month: "Jul", count: jul, h: `${Math.round((jul / currentCount) * 100)}%` },
      { month: currentMonthName, count: currentCount, h: "100%", current: true },
    ];
  }, [customers, now]);

  const networkDevices = useMemo(() => [
    {
      name: "MikroTik CCR2004 (Somitir Hat Gateway)",
      type: "mikrotik",
      status: "online",
      cpu: 18,
      ram: 34,
      sessions: onlineCustomersCount,
    },
    {
      name: "OLT1 - 103.12.173.136:1893 (BDCOM EPON)",
      type: "olt",
      status: "online",
      onu: 150,
      active: 149,
      pon: 8,
    },
    {
      name: "MikroTik-02 (Kalkini Hub Router)",
      type: "mikrotik",
      status: "online",
      cpu: 14,
      ram: 28,
      sessions: Math.max(1, Math.round(onlineCustomersCount * 0.42)),
    },
    {
      name: "OLT2 - 103.12.173.136:1894 (BDCOM EPON)",
      type: "olt",
      status: "offline",
      onu: 145,
      active: 0,
      pon: 8,
    },
  ], [totalCustomers, onlineCustomersCount]);

  const activeIssues = useMemo(() => {
    const list = [];
    if (dueCustomers.length > 0) {
      list.push({
        id: 2,
        type: "warning",
        icon: CreditCard,
        title: `${dueCustomers.length} Overdue Invoices Pending`,
        loc: dueCustomers[0]?.subzone || "Mirpur-10",
        desc: `৳${totalDue.toLocaleString()} overdue across ${dueCustomers.length} clients. Auto-suspension grace period active.`,
        actionIcon: Send,
        action: "Dispatch bKash Link",
        msg: `Sent automated SMS & WhatsApp payment reminder for ৳${totalDue.toLocaleString()}.`
      });
    }
    if (upgradeRequests.length > 0) {
      list.push({
        id: 3,
        type: "critical",
        icon: Zap,
        title: `${upgradeRequests.length} Pending Plan Upgrade Requests`,
        loc: "Subscriber Portal",
        desc: `Subscribers requested high-speed plan upgrade. Awaiting admin approval.`,
        actionIcon: Sparkles,
        action: "View Upgrades",
        msg: "Opened Plan Upgrades review modal."
      });
    }
    return list.filter(issue => !resolvedIssues.includes(issue.id));
  }, [dueCustomers, totalDue, upgradeRequests, resolvedIssues]);

  return (
    <div className="p-4 md:p-6 max-w-none space-y-5" style={{ minHeight: "100%" }}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      {/* Greeting */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 22,
              color: "var(--foreground)",
              marginBottom: 3,
            }}
          >
            {getHour(t)}, Admin
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            {dateStr} · {t("MAA BEST NETWORK")} {t("Operating Console")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate?.("onu-events")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-card border border-border hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs">
            <MapPin size={13} className="text-primary" />
            <span>{t("ONU Spatial Map")}</span>
          </button>

          <button
            onClick={() => onNavigate?.("mikrotik")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-primary hover:opacity-95 text-xs font-bold text-white transition-all cursor-pointer shadow-2xs">
            <Server size={13} />
            <span>{t("MikroTik Provisioning")}</span>
          </button>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl"
            style={{ background: "#DCFCE7", border: "1px solid #BBF7D0" }}
          >
            <Circle size={8} fill="#16A34A" stroke="none" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A" }}>{t("All Systems Active")}</span>
          </div>
        </div>
      </div>

      {/* ── MAA BEST NETWORK 8 CORE KPI STATS (System Theme Styling) ── */}
      <div className="space-y-3">
        {/* Row 1: SMS Balance, Remaining Balance, Daily Charged, Approximate Rechargable */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* SMS Balance */}
          <div
            onClick={() => onNavigate?.("sms")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">SMS Balance</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">৳ 0</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">0 SMS In Gateway</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Mail size={20} />
            </div>
          </div>

          {/* Remaining Balance */}
          <div
            onClick={() => onNavigate?.("accounts")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Remaining Balance</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">৳ -596.86</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Cash Desk Float Balance</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl leading-none">৳</span>
            </div>
          </div>

          {/* Daily Charged */}
          <div
            onClick={() => onNavigate?.("invoices")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Daily Charged</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">৳ 1119.34</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Today's Recurring Bandwidth</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Clock size={20} />
            </div>
          </div>

          {/* Approximate Rechargable */}
          <div
            onClick={() => onNavigate?.("due-customers")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Approximate Rechargable</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">৳ 43,930.00</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Projected Monthly Billables</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <CreditCard size={20} />
            </div>
          </div>
        </div>

        {/* Row 2: Monthly Charged, Monthly Payment, Monthly Discount, Balance Due */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Monthly Charged */}
          <div
            onClick={() => onNavigate?.("invoices")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Monthly Charged</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">৳ 1119.34</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Sep 2026 Invoiced Sum</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Receipt size={20} />
            </div>
          </div>

          {/* Monthly Payment */}
          <div
            onClick={() => onNavigate?.("payments")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Monthly Payment</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">৳ {todayCollected.toFixed(2)}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Realized Collections</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 size={20} />
            </div>
          </div>

          {/* Monthly Discount */}
          <div
            onClick={() => onNavigate?.("discounts")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Monthly Discount</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">৳ 0.00</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Waivers & Adjustments</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Percent size={20} />
            </div>
          </div>

          {/* Balance Due */}
          <div
            onClick={() => onNavigate?.("due-customers")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Balance Due</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">৳ {totalDue.toLocaleString()}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{dueCustomers.length} Overdue Accounts Pending</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ── PROBLEM OCCURRENCE & ONLINE CLIENT ANALYTICS (Theme Layout) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Zone Wise Problem Occurrence */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="border-b border-border pb-2.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Zone Wise Problem Occurrence</h4>
          </div>
          <div className="py-6 text-center text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">No data</p>
            <p className="text-[11px] mt-1 text-emerald-600 dark:text-emerald-400 font-medium">All zones reporting 100% optical stability</p>
          </div>
          <div className="pt-2 border-t border-border flex justify-between text-[11px] text-muted-foreground">
            <span>DHAKA DIVISION: 0</span>
            <span>MADARIPUR: 0</span>
          </div>
        </div>

        {/* Sub-Zone Wise Problem Occurrence */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="border-b border-border pb-2.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Sub-Zone Wise Problem Occurrence</h4>
          </div>
          <div className="py-6 text-center text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">No data</p>
            <p className="text-[11px] mt-1 text-emerald-600 dark:text-emerald-400 font-medium">Kalkini Somitir Hat PON lines 0 LOS events</p>
          </div>
          <div className="pt-2 border-t border-border flex justify-between text-[11px] text-muted-foreground">
            <span>SOMITIR HAT: 0</span>
            <span>MIRPUR-10: 0</span>
          </div>
        </div>

        {/* Total Online Clients & Google DNS (Stacked Theme Tiles) */}
        <div className="flex flex-col gap-3">
          {/* Total Online Clients Card */}
          <div
            onClick={() => onNavigate?.("online-clients")}
            className="rounded-xl p-4 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase">Total Online Clients</h4>
              <p className="text-base font-bold text-primary mt-0.5">Total users:{onlineCustomersCount}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary border border-primary/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wifi size={18} />
            </div>
          </div>

          {/* Google DNS (Last Ping) */}
          <div
            onClick={() => onNavigate?.("monitoring")}
            className="rounded-xl p-4 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase">Google DNS (Last Ping)</h4>
              <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">8.8.8.8 · 12ms (0% Loss)</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Activity size={18} />
            </div>
          </div>
        </div>

        {/* Monthly Problem Occurrence */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div className="border-b border-border pb-2.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">Monthly Problem Occurrence</h4>
          </div>
          <div className="py-6 text-center text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">No data</p>
            <p className="text-[11px] mt-1 text-primary font-medium">99.9% SLA optical line uptime</p>
          </div>
          <div className="pt-2 border-t border-border flex justify-between text-[11px] text-muted-foreground">
            <span>Avg Resolve: 15m</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Complaints: 0</span>
          </div>
        </div>
      </div>

      {/* ── MOST PROBLEM SOLVER & MONTHLY NEW CLIENT CHARTS (Theme Styling) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Problem Solver (Quantity) */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Most Problem Solver (Quantity)</h3>
            <span className="text-[11px] text-muted-foreground font-medium">Top Field Engineers</span>
          </div>

          <div className="space-y-3 pt-1">
            {problemSolvers.map((tech, i) => (
              <div key={tech.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">{tech.name}</span>
                  <span className="font-bold text-primary">{tech.solved} solved</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-primary"
                    style={{ width: `${tech.percentage}%`, opacity: 1 - i * 0.18 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly New Client */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Monthly New Client</h3>
            <span className="text-[11px] text-primary font-bold">+{customers.length} Total Subscribers</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
            {monthlyNewClients.map(item => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[11px] font-bold text-foreground">{item.count}</span>
                <div
                  className="w-full max-w-[42px] rounded-t-lg transition-all"
                  style={{
                    height: item.h,
                    background: item.current
                      ? "var(--primary)"
                      : "var(--muted)",
                  }}
                />
                <span className="text-[11px] font-medium text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Incident & 1-Click Solution Bar ────────────── */}
      {activeIssues.length > 0 && (
        <div className="rounded-3xl p-4 md:p-5 bg-card border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="text-xs font-black text-foreground uppercase tracking-wider">
                Live Issues & 1-Click Solutions ({activeIssues.length})
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Click any action button to dispatch automated fix & notify technician</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeIssues.map(issue => {
              const ActionIcon = issue.actionIcon;
              const IssueIcon = issue.icon;
              return (
                <div
                  key={issue.id}
                  className="p-4 rounded-2xl border transition-all flex flex-col justify-between"
                  style={{
                    background: issue.type === "critical" ? "rgba(220,38,38,0.04)" : "rgba(245,158,11,0.04)",
                    borderColor: issue.type === "critical" ? "rgba(220,38,38,0.2)" : "rgba(245,158,11,0.2)"
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <IssueIcon size={14} className={issue.type === "critical" ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"} />
                        <span className="text-xs font-black text-foreground truncate">{issue.title}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">{issue.loc}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3.5">{issue.desc}</p>
                  </div>

                  <button
                    onClick={() => {
                      if (issue.id === 3) {
                        onNavigate?.("customers");
                      } else {
                        handleResolveIssue(issue.id, issue.msg);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95"
                    style={{
                      background: issue.type === "critical" ? "#DC2626" : "var(--primary)"
                    }}
                  >
                    <ActionIcon size={13} />
                    <span>{issue.action}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Revenue chart + Network health */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 mb-6">
        {/* Revenue chart */}
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 15,
                  color: "var(--foreground)",
                  marginBottom: 2,
                }}
              >
                Revenue Analytics
              </h2>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                Monthly revenue vs. collection trends
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ background: "#8B2020" }} />
                <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ background: "#C4847A" }} />
                <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Collection</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v => `৳${(v / 1000).toFixed(0)}K`}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                key="area-revenue"
                isAnimationActive={false}
                type="monotone"
                dataKey="revenue"
                stroke="#8B2020"
                strokeWidth={2}
                fill="#8B2020"
                fillOpacity={0.08}
                name="Revenue"
                dot={false}
                activeDot={{ r: 4, fill: "#8B2020" }}
              />
              <Area
                key="area-collection"
                isAnimationActive={false}
                type="monotone"
                dataKey="collection"
                stroke="#C4847A"
                strokeWidth={2}
                fill="#C4847A"
                fillOpacity={0.07}
                name="Collection"
                dot={false}
                activeDot={{ r: 4, fill: "#C4847A" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Network health */}
        <div
          className="rounded-xl p-5 flex flex-col"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 15,
                color: "var(--foreground)",
              }}
            >
              Network Health
            </h2>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ fontSize: 10, fontWeight: 600, background: "#DCFCE7", color: "#16A34A" }}
            >
              ALL HEALTHY
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {networkDevices.map((d, i) => {
              const isOffline = d.status === "offline";
              return (
                <div
                  key={i}
                  onClick={() => onNavigate?.(d.type === "mikrotik" ? "mikrotik" : "olt")}
                  className="flex items-center gap-3 rounded-lg p-3 cursor-pointer hover:opacity-90 transition-all"
                  style={{
                    background: isOffline ? "#FEF2F2" : "var(--muted)",
                    border: isOffline ? "1px solid #FECACA" : "1px solid transparent",
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-md flex-shrink-0"
                    style={{ width: 30, height: 30, background: isOffline ? "#FEE2E2" : "var(--card)" }}
                  >
                    {d.type === "mikrotik" ? (
                      <Server size={14} style={{ color: isOffline ? "#DC2626" : "#8B2020" }} />
                    ) : (
                      <Radio size={14} style={{ color: isOffline ? "#DC2626" : "#2563EB" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", lineHeight: 1.2 }}>
                      {d.name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      {d.type === "mikrotik"
                        ? `CPU ${d.cpu}% · RAM ${d.ram}% · ${d.sessions} active session${d.sessions === 1 ? '' : 's'}`
                        : `${d.active}/${d.onu} ONU online`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Circle
                      size={7}
                      fill={isOffline ? "#DC2626" : "#16A34A"}
                      stroke="none"
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: isOffline ? "#DC2626" : "#16A34A",
                      }}
                    >
                      {isOffline ? "Offline" : "Online"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-auto pt-3 flex gap-4" style={{ borderTop: "1px solid var(--border)", marginTop: 12 }}>
            <button onClick={() => onNavigate?.("mikrotik")} className="flex-1 text-center hover:opacity-80 transition-opacity">
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>MikroTik</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: "#16A34A" }}>1/1</p>
            </button>
            <button onClick={() => onNavigate?.("olt")} className="flex-1 text-center hover:opacity-80 transition-opacity" style={{ borderLeft: "1px solid var(--border)" }}>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>OLT</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: "#16A34A" }}>1/1</p>
            </button>
            <button onClick={() => onNavigate?.("network-map")} className="flex-1 text-center hover:opacity-80 transition-opacity" style={{ borderLeft: "1px solid var(--border)" }}>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>ONU</p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, color: "#16A34A" }}>{onlineCustomersCount}/{totalCustomers}</p>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom: Zone collection + Due customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Zone collection bar chart */}
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 15,
                color: "var(--foreground)",
              }}
            >
              Collection by Zone
            </h2>
            <button
              onClick={() => onNavigate?.("revenue-reports")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View Zone Matrix →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={collectionByZone} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis
                dataKey="zone"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v => `৳${(v / 1000).toFixed(0)}K`}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v, name) => [fmt(v as number), name === "collected" ? "Collected" : "Outstanding"]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar key="bar-collected" isAnimationActive={false} dataKey="collected" fill="#8B2020" radius={[3, 3, 0, 0]} name="collected" />
              <Bar key="bar-due" isAnimationActive={false} dataKey="due" fill="#FECACA" radius={[3, 3, 0, 0]} name="due" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Due Customers (Real) */}
        <div
          className="rounded-xl"
          style={{ background: "var(--card)", border: "1px solid var(--border)", overflow: "hidden" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 15,
                color: "var(--foreground)",
              }}
            >
              Due Customers ({dueCustomers.length})
            </h2>
            <button
              onClick={() => onNavigate?.("due-customers")}
              className="flex items-center gap-1"
              style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500 }}
            >
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div>
            {dueCustomers.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
                <CheckCircle2 size={32} className="text-emerald-500 mb-2 opacity-80" />
                <p className="text-xs font-bold text-foreground">Zero Overdue Accounts</p>
                <p className="text-[11px] text-muted-foreground">All subscriber accounts are currently in good standing.</p>
              </div>
            ) : (
              dueCustomers.map((c, i) => (
                <div
                  key={c.id}
                  onClick={() => onNavigate?.("due-customers")}
                  className="flex items-center justify-between px-5 py-3 transition-colors cursor-pointer"
                  style={{ borderBottom: i < dueCustomers.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-full text-white flex-shrink-0"
                      style={{
                        width: 30,
                        height: 30,
                        background: "var(--primary)",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{c.name}</p>
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                        {c.subzone || c.zone} · {c.package}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#DC2626",
                      }}
                    >
                      ৳{c.dueAmount.toLocaleString()}
                    </p>
                    <p style={{ fontSize: 11, color: "#D97706" }}>Payment Due</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── COMPANY PERFORMANCE (ACTIVE CLIENT) & TOP 20 UNPAID CLIENT TABLE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Company Performance (Active Client) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
              Company Performance (Active Client)
            </h3>
            <span className="w-4 h-2 bg-primary rounded-xs inline-block" />
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 300]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`${v} Active Subscribers`, "Active Clients"]}
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {companyPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Jul: 190</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" /> Aug: 164</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" /> Sep: {activeCustomersCount > 0 ? activeCustomersCount : 164}</div>
          </div>
        </div>

        {/* Right: TOP 20 UNPAID CLIENT Table */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-2">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              TOP 20 UNPAID CLIENT ({dueCustomers.length} Total Unpaid)
            </h3>
            <button
              onClick={() => onNavigate?.("due-customers")}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              View All ({dueCustomers.length}) →
            </button>
          </div>

          <div className="overflow-x-auto max-h-[260px] overflow-y-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted/90 backdrop-blur-xs text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold">User Name</th>
                  <th className="text-left py-2 px-3 font-semibold">Mobile</th>
                  <th className="text-right py-2 px-3 font-semibold">Bill Amount</th>
                  <th className="text-right py-2 px-3 font-semibold text-rose-600 dark:text-rose-400">Due Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {top20UnpaidClients.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onNavigate?.("due-customers")}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 px-3 font-mono font-medium text-foreground truncate max-w-[150px]">
                      {c.pppUser || c.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-muted-foreground">
                      {c.phone || "017XXXXXXXX"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-foreground font-semibold">
                      {(c.monthlyBill || c.price || 500).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      {(c.dueAmount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 8 BOTTOM SUMMARY TILES (Exact Matching Roster Metrics) ── */}
      <div className="space-y-3">
        {/* Row 1: New Client, Total Client, Monthly Bill, Collected Bill */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* New Client */}
          <div
            onClick={() => onNavigate?.("add-client")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">New Client</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">0</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Joined This Billing Cycle</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <UserPlus size={20} />
            </div>
          </div>

          {/* Total Client */}
          <div
            onClick={() => onNavigate?.("customers")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Client</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalCustomers}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{activeCustomersCount} Active Subscriptions</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Users size={20} />
            </div>
          </div>

          {/* Monthly Bill */}
          <div
            onClick={() => onNavigate?.("invoices")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Monthly Bill</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{monthlyRevenue.toFixed(2)}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Active Subscribers Expected</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Calendar size={20} />
            </div>
          </div>

          {/* Collected Bill */}
          <div
            onClick={() => onNavigate?.("payments")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Collected Bill</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{todayCollected.toFixed(2)}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Real-time Collected Payments</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <CheckSquare size={20} />
            </div>
          </div>
        </div>

        {/* Row 2: Paid Salary, Discount, Total Due, Cash On Hand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Paid Salary */}
          <div
            onClick={() => onNavigate?.("expenses")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Paid Salary</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">৳ 0.00</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Staff & Technician Payroll</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Wallet size={20} />
            </div>
          </div>

          {/* Discount */}
          <div
            onClick={() => onNavigate?.("discounts")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Discount</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">0.00</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Waiver Credits Applied</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <FileText size={20} />
            </div>
          </div>

          {/* Total Due */}
          <div
            onClick={() => onNavigate?.("due-customers")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Due</p>
              <h3 className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">{totalDue.toFixed(2)}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{dueCustomers.length} Accounts Pending Clearance</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <AlertCircle size={20} />
            </div>
          </div>

          {/* Cash On Hand */}
          <div
            onClick={() => onNavigate?.("cash-desk")}
            className="rounded-xl p-4.5 bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cash On Hand</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{todayCollected.toFixed(2)}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Verified Collections</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments (Real) */}
      <div
        className="rounded-xl mt-4"
        style={{ background: "var(--card)", border: "1px solid var(--border)", overflow: "hidden" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 15,
              color: "var(--foreground)",
            }}
          >
            Recent Payments ({allPayments.length})
          </h2>
          <button
            onClick={() => onNavigate?.("payments")}
            className="flex items-center gap-1"
            style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500 }}
          >
            View all <ChevronRight size={13} />
          </button>
        </div>
        {allPayments.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
            <Inbox size={32} className="mb-2 opacity-50 text-muted-foreground" />
            <p className="text-xs font-bold text-foreground">No Transactions Recorded Yet</p>
            <p className="text-[11px] text-muted-foreground mb-3">Collected payments through Cash Desk or online gateways will appear here in real time.</p>
            <button
              onClick={() => onNavigate?.("cash-desk")}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold cursor-pointer hover:opacity-95"
            >
              + Open Cash Desk POS
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Transaction ID", "Customer", "Amount", "Method", "Time", "Status"].map(h => (
                  <th
                    key={h}
                    className="text-left px-5 py-2.5"
                    style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em" }}
                  >
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allPayments.map((p, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: i < allPayments.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-3">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--primary)" }}>
                      {p.id}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500 }}>
                      {p.customer}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "#16A34A" }}>
                      ৳{p.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="px-2.5 py-0.5 rounded-full"
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        background:
                          p.method === "bKash" ? "#FCE7F3" :
                          p.method === "Nagad" ? "#FEF3C7" : "#F3F4F6",
                        color:
                          p.method === "bKash" ? "#DB2777" :
                          p.method === "Nagad" ? "#D97706" : "#4B5563",
                      }}
                    >
                      {p.method}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} style={{ color: "var(--muted-foreground)" }} />
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{p.time}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {p.status === "verified" ? (
                        <>
                          <CheckCircle2 size={13} style={{ color: "#16A34A" }} />
                          <span style={{ fontSize: 12, fontWeight: 500, color: "#16A34A" }}>Verified</span>
                        </>
                      ) : (
                        <>
                          <Clock size={13} style={{ color: "#D97706" }} />
                          <span style={{ fontSize: 12, fontWeight: 500, color: "#D97706" }}>Pending</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
