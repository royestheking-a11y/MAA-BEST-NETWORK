import { useState } from "react";
import { UserCheck, Globe, Wallet, Plus, Users, ArrowUpRight, ArrowDownRight } from "lucide-react";

const macResellers = [
  { id: "RS-001", name: "Kalkini Online Net", contact: "Alam Hossain", phone: "01712-111222", zone: "Kalkini", credit: 15000, used: 9500, commission: 10, customers: 284, status: "active" },
  { id: "RS-002", name: "Madaripur Sadar Link", contact: "Sohel Rana", phone: "01819-333444", zone: "Madaripur Sadar", credit: 25000, used: 18700, commission: 12, customers: 412, status: "active" },
  { id: "RS-003", name: "Shibchar Broadband", contact: "Kamal Ahmed", phone: "01611-555666", zone: "Shibchar", credit: 10000, used: 10000, commission: 8, customers: 198, status: "credit-low" },
  { id: "RS-004", name: "Somitir Hat Fiber", contact: "Faruk Islam", phone: "01914-777888", zone: "Somitir Hat", credit: 50000, used: 22000, commission: 15, customers: 567, status: "active" },
  { id: "RS-005", name: "Rajoir Net Service", contact: "Raju Mia", phone: "01521-999000", zone: "Rajoir", credit: 8000, used: 8000, commission: 7, customers: 143, status: "suspended" },
];

const bwResellers = [
  { id: "BW-001", name: "Kalkini Metro Connect", zone: "Kalkini", allocated: 200, used: 142, price: 250, softLimit: 10, profile: "KALKINI-200M", status: "active" },
  { id: "BW-002", name: "Madaripur Sadar Fiber", zone: "Madaripur Sadar", allocated: 500, used: 387, price: 220, softLimit: 10, profile: "SADAR-500M", status: "active" },
  { id: "BW-003", name: "Shibchar ISP Hub", zone: "Shibchar", allocated: 100, used: 98, price: 270, softLimit: 15, profile: "SHIB-100M", status: "near-limit" },
  { id: "BW-004", name: "Rajoir Net", zone: "Rajoir", allocated: 150, used: 61, price: 240, softLimit: 10, profile: "RAJ-150M", status: "active" },
];

const walletLedger = [
  { id: "WL-1021", reseller: "Madaripur Sadar Link", type: "credit", desc: "Top-up by Admin", amount: 10000, balance: 25000, date: "19 Aug 2026", by: "Admin" },
  { id: "WL-1020", reseller: "Kalkini Online Net", type: "debit", desc: "Customer activation × 3", amount: 1500, balance: 5500, date: "18 Aug 2026", by: "System" },
  { id: "WL-1019", reseller: "Somitir Hat Fiber", type: "credit", desc: "Top-up by Admin", amount: 25000, balance: 28000, date: "17 Aug 2026", by: "Admin" },
  { id: "WL-1018", reseller: "Shibchar Broadband", type: "debit", desc: "Customer activation × 8", amount: 4000, balance: 0, date: "16 Aug 2026", by: "System" },
  { id: "WL-1017", reseller: "Kalkini Online Net", type: "credit", desc: "Commission payment", amount: 2850, balance: 7000, date: "15 Aug 2026", by: "System" },
  { id: "WL-1016", reseller: "Madaripur Sadar Link", type: "debit", desc: "Customer activation × 12", amount: 6000, balance: 15000, date: "14 Aug 2026", by: "System" },
];

type Tab = "mac" | "bandwidth" | "wallets";

const rsStatus: Record<string, { label: string; color: string; bg: string }> = {
  active:      { label: "Active",      color: "#16A34A", bg: "#DCFCE7" },
  "credit-low": { label: "Credit Low",  color: "#D97706", bg: "#FEF3C7" },
  suspended:   { label: "Suspended",   color: "#DC2626", bg: "#FEE2E2" },
  "near-limit": { label: "Near Limit", color: "#D97706", bg: "#FEF3C7" },
};

export function ResellersPage({ initialTab = "mac" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "mac", label: "MAC Resellers", icon: UserCheck },
    { id: "bandwidth", label: "Bandwidth Resellers", icon: Globe },
    { id: "wallets", label: "Wallets", icon: Wallet },
  ];

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>Reseller Management</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Manage reseller accounts, credit wallets, commissions, and bandwidth allocation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white" style={{ background: "var(--primary)", fontSize: 13, fontWeight: 500 }}>
          <Plus size={14} /> Add Reseller
        </button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { label: "Total Resellers", value: `${macResellers.length + bwResellers.length}`, sub: "Active + Bandwidth", icon: Users, color: "#8B2020", bg: "#FDF3F3" },
          { label: "Total Customers", value: `${macResellers.reduce((s,r)=>s+r.customers,0).toLocaleString()}`, sub: "Under resellers", icon: UserCheck, color: "#2563EB", bg: "#DBEAFE" },
          { label: "Bandwidth Sold", value: `${bwResellers.reduce((s,r)=>s+r.allocated,0)} Mbps`, sub: "Total allocated", icon: Globe, color: "#7C3AED", bg: "#EDE9FE" },
          { label: "Total Credit", value: `৳${(macResellers.reduce((s,r)=>s+r.credit,0)/1000).toFixed(0)}K`, sub: "Wallet balance", icon: Wallet, color: "#16A34A", bg: "#DCFCE7" },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center rounded-lg" style={{ width: 34, height: 34, background: k.bg }}>
                  <Icon size={16} style={{ color: k.color }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)", marginBottom: 2 }}>{k.value}</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", marginBottom: 1 }}>{k.label}</p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{k.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--muted)", width: "fit-content" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ background: tab === t.id ? "var(--card)" : "transparent", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? "var(--foreground)" : "var(--muted-foreground)", boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* MAC Resellers */}
      {tab === "mac" && (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--foreground)" }}>MAC Resellers</h3>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{macResellers.length} resellers</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["ID", "Reseller", "Zone", "Credit Balance", "Commission", "Customers", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {macResellers.map((r, i) => {
                const st = rsStatus[r.status];
                const creditPct = Math.round((r.credit - r.used) / r.credit * 100);
                return (
                  <tr key={r.id} style={{ borderBottom: i < macResellers.length - 1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-5 py-3.5"><span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--primary)" }}>{r.id}</span></td>
                    <td className="px-5 py-3.5">
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{r.name}</p>
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{r.contact} · {r.phone}</p>
                    </td>
                    <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{r.zone}</span></td>
                    <td className="px-5 py-3.5">
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>
                        ৳{(r.credit - r.used).toLocaleString()} <span style={{ fontWeight: 400, fontSize: 11, color: "var(--muted-foreground)" }}>/ ৳{r.credit.toLocaleString()}</span>
                      </p>
                      <div className="h-1.5 rounded-full" style={{ background: "var(--muted)", width: 120 }}>
                        <div className="h-full rounded-full" style={{ width: `${creditPct}%`, background: creditPct < 20 ? "#DC2626" : creditPct < 40 ? "#D97706" : "#16A34A" }} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><span style={{ fontSize: 12, fontWeight: 600, color: "#16A34A" }}>{r.commission}%</span></td>
                    <td className="px-5 py-3.5"><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--foreground)" }}>{r.customers.toLocaleString()}</span></td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full" style={{ fontSize: 11, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button className="px-2.5 py-1 rounded-md text-white" style={{ background: "#8B2020", fontSize: 11, fontWeight: 500 }}>Top-up</button>
                        <button className="px-2.5 py-1 rounded-md" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 11 }}>View</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bandwidth Resellers */}
      {tab === "bandwidth" && (
        <div className="flex flex-col gap-4">
          {bwResellers.map(r => {
            const st = rsStatus[r.status];
            const usedPct = Math.round(r.used / r.allocated * 100);
            const softLimitPct = 100 + r.softLimit;
            return (
              <div key={r.id} className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>{r.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 600, background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--foreground)", marginBottom: 3 }}>{r.name}</p>
                    <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{r.zone} · Profile: <span style={{ fontFamily: "var(--font-mono)", color: "var(--foreground)" }}>{r.profile}</span></p>
                  </div>
                  <div className="text-right">
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)" }}>{r.used} <span style={{ fontWeight: 400, fontSize: 13 }}>/ {r.allocated} Mbps</span></p>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>৳{r.price}/Mbps · Soft limit +{r.softLimit}%</p>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between mb-1.5">
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Usage {usedPct}%</span>
                    <span style={{ fontSize: 11, color: usedPct > 90 ? "#D97706" : "var(--muted-foreground)" }}>Soft limit at {softLimitPct}%</span>
                  </div>
                  <div className="h-2 rounded-full relative" style={{ background: "var(--muted)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(usedPct, 100)}%`, background: usedPct > 90 ? "#D97706" : usedPct > 70 ? "#8B2020" : "#16A34A" }} />
                    <div className="absolute top-0 h-full w-0.5" style={{ left: `${100/softLimitPct*100}%`, background: "#D97706", opacity: 0.6 }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1 rounded-lg p-3" style={{ background: "var(--muted)" }}>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 2 }}>Monthly Invoice</p>
                    <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>৳{(r.allocated * r.price).toLocaleString()}</p>
                  </div>
                  <div className="flex-1 rounded-lg p-3" style={{ background: "var(--muted)" }}>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 2 }}>Available</p>
                    <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "#16A34A" }}>{r.allocated - r.used} Mbps</p>
                  </div>
                  <button className="px-4 py-2 rounded-lg text-white" style={{ background: "#8B2020", fontSize: 12, fontWeight: 500 }}>Manage</button>
                  <button className="px-4 py-2 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 12 }}>Invoice</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Wallets */}
      {tab === "wallets" && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
            {macResellers.slice(0,3).map(r => (
              <div key={r.id} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6 }}>{r.name}</p>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>৳{(r.credit - r.used).toLocaleString()}</p>
                <div className="flex justify-between text-xs" style={{ color: "var(--muted-foreground)" }}>
                  <span>Total: ৳{r.credit.toLocaleString()}</span>
                  <span style={{ color: "#DC2626" }}>Used: ৳{r.used.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--foreground)" }}>Wallet Ledger</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  {["ID", "Reseller", "Description", "Date", "By", "Amount", "Balance"].map(h => (
                    <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {walletLedger.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: i < walletLedger.length-1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-5 py-3"><span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--primary)" }}>{t.id}</span></td>
                    <td className="px-5 py-3"><span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{t.reseller}</span></td>
                    <td className="px-5 py-3"><span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{t.desc}</span></td>
                    <td className="px-5 py-3"><span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{t.date}</span></td>
                    <td className="px-5 py-3"><span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{t.by}</span></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {t.type === "credit" ? <ArrowUpRight size={13} style={{ color: "#16A34A" }} /> : <ArrowDownRight size={13} style={{ color: "#DC2626" }} />}
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, color: t.type === "credit" ? "#16A34A" : "#DC2626" }}>
                          {t.type === "credit" ? "+" : "-"}৳{t.amount.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>৳{t.balance.toLocaleString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
