import { useState, useMemo } from "react";
import {
  AlertTriangle, Search, Phone, MessageSquare, Clock, Ban, WifiOff,
  ChevronDown, X, CheckCircle2, Send, Filter, Download, Users, DollarSign,
  Inbox
} from "lucide-react";
import { useCustomerContext, Customer } from "../context/CustomerContext";

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  due:       { label: "Due",       color: "#D97706", bg: "#FEF3C7", dot: "#F59E0B" },
  grace:     { label: "Grace",     color: "#2563EB", bg: "#DBEAFE", dot: "#3B82F6" },
  suspended: { label: "Suspended", color: "#DC2626", bg: "#FEE2E2", dot: "#EF4444" },
  active:    { label: "Active",    color: "#16A34A", bg: "#DCFCE7", dot: "#22C55E" },
};

export function DueCustomersPage() {
  const { customers, processPayment, toggleNetStatus } = useCustomerContext();
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("All Zones");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [graceModal, setGraceModal] = useState<string | null>(null);
  const [graceDays, setGraceDays] = useState("3");
  const [graceReason, setGraceReason] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Extract real due customers from live database
  const dueCustomers = useMemo(() => {
    return customers
      .filter(c => (c.dueAmount || 0) > 0 || c.status === "due" || c.status === "suspended")
      .map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        zone: c.subzone || c.zone || "Dhaka",
        package: c.package,
        amount: c.dueAmount || c.price || 0,
        daysOverdue: c.daysRemaining <= 0 ? Math.abs(c.daysRemaining) + 1 : 5,
        status: c.status === "suspended" ? "suspended" : (c.daysRemaining <= 3 ? "grace" : "due"),
        pppoe: c.pppUser,
        rawCustomer: c
      }));
  }, [customers]);

  const zones = useMemo(() => {
    const set = new Set(dueCustomers.map(c => c.zone));
    return ["All Zones", ...Array.from(set)];
  }, [dueCustomers]);

  const filtered = dueCustomers.filter(c => {
    const matchSearch = search === "" || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchZone = zone === "All Zones" || c.zone === zone;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchZone && matchStatus;
  });

  const totalDue = filtered.reduce((s, c) => s + c.amount, 0);
  const allChecked = filtered.length > 0 && filtered.every(c => selected.includes(c.id));

  const toggleAll = () => {
    if (allChecked) setSelected([]);
    else setSelected(filtered.map(c => c.id));
  };

  const toggleOne = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCollect = (cust: Customer) => {
    processPayment(cust.id, cust.dueAmount || cust.price, "Cash");
    showToast(`✓ Payment collected & due cleared for ${cust.name}!`);
  };

  const handleDisconnect = (id: string, name: string) => {
    toggleNetStatus(id, false);
    showToast(`⚠ ONU Line suspended for ${name}.`);
  };

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>
            Due Customers
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            {dueCustomers.length} customers with outstanding payments · Total ৳{totalDue.toLocaleString()} due
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast(`Sent SMS payment links to ${selected.length} subscribers.`)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white cursor-pointer hover:opacity-95"
                style={{ background: "#16A34A", fontSize: 12, fontWeight: 500 }}
              >
                <Send size={13} /> SMS ({selected.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { label: "Total Outstanding", value: `৳${totalDue.toLocaleString()}`, sub: `${dueCustomers.length} accounts`, icon: DollarSign, color: "#D97706", bg: "#FEF3C7" },
          { label: "Due Status", value: `${dueCustomers.filter(c=>c.status==="due").length}`, sub: "Pending invoices", icon: AlertTriangle, color: "#D97706", bg: "#FEF3C7" },
          { label: "Grace Period", value: `${dueCustomers.filter(c=>c.status==="grace").length}`, sub: "Temporary grace", icon: Clock, color: "#2563EB", bg: "#DBEAFE" },
          { label: "Suspended", value: `${dueCustomers.filter(c=>c.status==="suspended").length}`, sub: "Line blocked", icon: Ban, color: "#DC2626", bg: "#FEE2E2" },
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

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID, phone..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg outline-none"
            style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "var(--muted-foreground)" }} />
          <select value={zone} onChange={e => setZone(e.target.value)} className="px-3 py-2.5 rounded-lg outline-none" style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}>
            {zones.map(z => <option key={z}>{z}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 rounded-lg outline-none" style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}>
            <option value="all">All Status</option>
            <option value="due">Due</option>
            <option value="grace">Grace Period</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        {selected.length > 0 && (
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
            {selected.length} selected · ৳{selected.reduce((s, id) => s + (dueCustomers.find(c => c.id === id)?.amount ?? 0), 0).toLocaleString()} due
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
            <CheckCircle2 size={36} className="text-emerald-500 mb-2 opacity-80" />
            <p className="text-sm font-bold text-foreground">Zero Overdue Subscribers</p>
            <p className="text-xs text-muted-foreground">All subscriber accounts are active and up-to-date with billing.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                <th className="px-4 py-3 text-left" style={{ width: 40 }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} style={{ accentColor: "#8B2020" }} />
                </th>
                {["Customer", "PPPoE", "Package", "Zone", "Days Overdue", "Amount Due", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const st = statusConfig[c.status] || statusConfig.due;
                const isSelected = selected.includes(c.id);
                return (
                  <tr key={c.id}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none", background: isSelected ? "rgba(139,32,32,0.03)" : "transparent" }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--muted)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(c.id)} style={{ accentColor: "#8B2020" }} />
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{c.name}</p>
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}>{c.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>{c.pppoe}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontSize: 12, color: "var(--foreground)" }}>{c.package}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{c.zone}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{
                        fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
                        color: c.daysOverdue > 20 ? "#DC2626" : c.daysOverdue > 10 ? "#D97706" : "var(--foreground)"
                      }}>
                        {c.daysOverdue}d
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#8B2020" }}>৳{c.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full" style={{ background: st.bg, border: `1px solid ${st.color}22` }}>
                        <span className="rounded-full" style={{ width: 6, height: 6, background: st.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: st.color }}>{st.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCollect(c.rawCustomer)}
                          className="p-1.5 rounded-md transition-colors cursor-pointer hover:opacity-80"
                          title="Collect Payment & Clear Due"
                          style={{ background: "#DCFCE7" }}>
                          <CheckCircle2 size={13} style={{ color: "#16A34A" }} />
                        </button>
                        <button
                          onClick={() => showToast(`Sent SMS payment reminder to ${c.phone}`)}
                          className="p-1.5 rounded-md transition-colors cursor-pointer hover:opacity-80"
                          title="Send SMS Reminder"
                          style={{ background: "#DBEAFE" }}>
                          <MessageSquare size={13} style={{ color: "#2563EB" }} />
                        </button>
                        <button
                          className="p-1.5 rounded-md transition-colors cursor-pointer hover:opacity-80"
                          title="Grace Period"
                          style={{ background: "#FEF3C7" }}
                          onClick={() => setGraceModal(c.id)}>
                          <Clock size={13} style={{ color: "#D97706" }} />
                        </button>
                        <button
                          onClick={() => handleDisconnect(c.id, c.name)}
                          className="p-1.5 rounded-md transition-colors cursor-pointer hover:opacity-80"
                          title="Disconnect Line"
                          style={{ background: "#FEE2E2" }}>
                          <WifiOff size={13} style={{ color: "#DC2626" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)", background: "var(--muted)" }}>
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Showing {filtered.length} of {dueCustomers.length} due customers</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#8B2020" }}>
            Total: ৳{totalDue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Grace Period Modal */}
      {graceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--foreground)" }}>Grant Grace Period</h3>
              <button onClick={() => setGraceModal(null)}><X size={18} style={{ color: "var(--muted-foreground)" }} /></button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>CUSTOMER</label>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{dueCustomers.find(c => c.id === graceModal)?.name}</p>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>GRACE PERIOD (DAYS)</label>
                <input value={graceDays} onChange={e => setGraceDays(e.target.value)} type="number" min="1" max="30"
                  className="w-full px-3 py-2.5 rounded-lg outline-none"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>REASON</label>
                <input value={graceReason} onChange={e => setGraceReason(e.target.value)}
                  placeholder="Payment commitment..."
                  className="w-full px-3 py-2.5 rounded-lg outline-none"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }} />
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setGraceModal(null)} className="flex-1 py-2.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13 }}>Cancel</button>
                <button
                  onClick={() => {
                    showToast(`Granted ${graceDays} days grace period.`);
                    setGraceModal(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg text-white cursor-pointer" style={{ background: "#8B2020", fontSize: 13, fontWeight: 500 }}>
                  Grant Grace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
