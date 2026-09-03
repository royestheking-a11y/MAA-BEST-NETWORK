import { useState, useEffect } from "react";
import {
  UserCheck, Users, Search, Plus, CreditCard, Shield,
  CheckCircle2, AlertTriangle, XCircle, X, ChevronRight, RefreshCw, Wallet
} from "lucide-react";
import {
  resellersStore, type MacReseller
} from "./resellersData";

interface MacResellersPageProps {
  onNavigate?: (page: string) => void;
}

export function MacResellersPage({ onNavigate }: MacResellersPageProps) {
  const [resellers, setResellers] = useState<MacReseller[]>(resellersStore.getMacResellers());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState("");

  const [newReseller, setNewReseller] = useState({
    name: "", company: "", phone: "", email: "", zone: "Mirpur-10",
    maxClients: "150", creditLimit: "20000", commission: "20"
  });

  useEffect(() => {
    return resellersStore.subscribe(() => {
      setResellers(resellersStore.getMacResellers());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const filtered = resellers.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.name.toLowerCase().includes(q) ||
      r.company.toLowerCase().includes(q) ||
      r.zone.toLowerCase().includes(q) ||
      r.phone.includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    if (!newReseller.name || !newReseller.company) return;
    const rsl: MacReseller = {
      id: `RSL-${(resellers.length + 101).toString()}`,
      name: newReseller.name,
      company: newReseller.company,
      phone: newReseller.phone || "01700-000000",
      email: newReseller.email || "partner@isp.bd",
      zone: newReseller.zone,
      clients: 0,
      maxClients: Number(newReseller.maxClients),
      creditLimit: Number(newReseller.creditLimit),
      balance: 5000,
      commission: Number(newReseller.commission),
      status: "active",
      joinedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
    resellersStore.addMacReseller(rsl);
    setShowAddModal(false);
    showToast(`MAC Reseller "${rsl.company}" registered successfully!`);
    setNewReseller({ name: "", company: "", phone: "", email: "", zone: "Mirpur-10", maxClients: "150", creditLimit: "20000", commission: "20" });
  };

  const totalClients = resellers.reduce((a, b) => a + b.clients, 0);
  const totalBalance = resellers.reduce((a, b) => a + b.balance, 0);

  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--foreground)",
  };

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              MAC Reseller Partners
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
              {resellers.length} Sub-Operators · {totalClients.toLocaleString()} End Users
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Franchise & local cable operator (LCO) management, prepaid user provisioning, and credit boundaries
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
          style={{ background: "var(--primary)", fontSize: 13 }}
        >
          <Plus size={14} /> Add MAC Reseller
        </button>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Active Resellers</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-emerald-100 text-emerald-600">
              <UserCheck size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)", marginBottom: 2 }}>
            {resellers.filter(r => r.status === "active").length} / {resellers.length}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Operational partner accounts</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Total Sub-Users</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-blue-100 text-blue-600">
              <Users size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#2563EB", marginBottom: 2 }}>
            {totalClients.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Managed under reseller pools</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Combined Wallet Float</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-purple-100 text-purple-600">
              <Wallet size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20, color: "#7C3AED", marginBottom: 2 }}>
            ৳{totalBalance.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Prepaid deposit balances</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Low Float Alert</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-amber-100 text-amber-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#D97706", marginBottom: 2 }}>
            {resellers.filter(r => r.status === "low_balance" || r.balance < 3000).length}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Balance below recharge quota</p>
        </div>
      </div>

      {/* ── Table Container ──────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap border-b border-border">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search partner, company, phone, zone..."
              className="w-full pl-9 pr-3 py-2 rounded-lg outline-none text-xs"
              style={{ background: "var(--muted)", color: "var(--foreground)", border: "1px solid transparent" }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "active", "low_balance", "suspended"] as const).map(k => (
              <button
                key={k}
                onClick={() => setStatusFilter(k)}
                className="px-3 py-1.5 rounded-lg capitalize transition-colors text-xs"
                style={{
                  fontWeight: statusFilter === k ? 600 : 400,
                  background: statusFilter === k ? "var(--primary)" : "var(--muted)",
                  color: statusFilter === k ? "white" : "var(--muted-foreground)",
                }}
              >
                {k.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
              {["Partner & Company", "Zone / POP", "Assigned Users", "Wallet Balance", "Commission", "Credit Limit", "Status", "Action"].map(h => (
                <th key={h} className="text-left px-5 py-3 font-semibold text-muted-foreground tracking-wider">
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={r.id}
                style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-5 py-4">
                  <div>
                    <span className="font-bold text-foreground block text-sm">{r.company}</span>
                    <span className="text-muted-foreground text-[11px]">{r.name} · {r.phone}</span>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-foreground">{r.zone}</td>
                <td className="px-5 py-4">
                  <span className="font-mono font-bold text-foreground">{r.clients}</span>
                  <span className="text-muted-foreground"> / {r.maxClients} max</span>
                </td>
                <td className="px-5 py-4 font-mono font-bold" style={{ color: r.balance < 3000 ? "#DC2626" : "#16A34A" }}>
                  ৳{r.balance.toLocaleString()}
                </td>
                <td className="px-5 py-4 font-mono font-semibold text-purple-600">{r.commission}%</td>
                <td className="px-5 py-4 font-mono text-muted-foreground">৳{r.creditLimit.toLocaleString()}</td>
                <td className="px-5 py-4">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{
                      background: r.status === "active" ? "#DCFCE7" : r.status === "low_balance" ? "#FEF3C7" : "#FEE2E2",
                      color: r.status === "active" ? "#16A34A" : r.status === "low_balance" ? "#D97706" : "#DC2626",
                    }}
                  >
                    {r.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate("reseller-wallets");
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Top-Up <ChevronRight size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* ── Add Reseller Modal ───────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UserCheck size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Register MAC Reseller Partner
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PARTNER NAME</label>
                  <input
                    value={newReseller.name}
                    onChange={e => setNewReseller(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">COMPANY / LCO</label>
                  <input
                    value={newReseller.company}
                    onChange={e => setNewReseller(p => ({ ...p, company: e.target.value }))}
                    placeholder="e.g. CyberNet Mirpur"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">CONTACT PHONE</label>
                  <input
                    value={newReseller.phone}
                    onChange={e => setNewReseller(p => ({ ...p, phone: e.target.value }))}
                    placeholder="01711-000000"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">ASSIGNED ZONE</label>
                  <input
                    value={newReseller.zone}
                    onChange={e => setNewReseller(p => ({ ...p, zone: e.target.value }))}
                    placeholder="Mirpur-10"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">MAX USERS</label>
                  <input
                    type="number"
                    value={newReseller.maxClients}
                    onChange={e => setNewReseller(p => ({ ...p, maxClients: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">CREDIT (৳)</label>
                  <input
                    type="number"
                    value={newReseller.creditLimit}
                    onChange={e => setNewReseller(p => ({ ...p, creditLimit: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">COMM. (%)</label>
                  <input
                    type="number"
                    value={newReseller.commission}
                    onChange={e => setNewReseller(p => ({ ...p, commission: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newReseller.name || !newReseller.company}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Register Partner
              </button>
            </div>
          </div>
        </div>
      )}

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
