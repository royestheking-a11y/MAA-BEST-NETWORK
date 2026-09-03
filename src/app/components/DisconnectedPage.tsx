import { useState, useMemo } from "react";
import {
  WifiOff, Search, Download, Send, Zap, PhoneCall,
  CheckCircle2, X, AlertTriangle, Clock, ChevronLeft, ChevronRight, Circle
} from "lucide-react";
import { useCustomerContext } from "../context/CustomerContext";

interface DisconnectedCustomer {
  id: string; name: string; phone: string; zone: string; subzone: string;
  package: string; price: number; dueAmount: number; disconnectedOn: string;
  disconnectedDays: number; reason: string; pppUser: string; mikrotik: string;
}

const ITEMS_PER_PAGE = 6;

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl"
      style={{ background: "#130606", color: "#fff", fontSize: 13, fontWeight: 500, animation: "slideUp 0.2s ease" }}>
      <style>{`@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
      {msg}
      <button onClick={onClose} className="ml-2 cursor-pointer"><X size={14} style={{ color: "rgba(255,255,255,0.5)" }} /></button>
    </div>
  );
}

function exportCSV(customers: DisconnectedCustomer[]) {
  const headers = ["ID", "Name", "Phone", "Zone", "Sub-Zone", "Package", "Price", "Due Amount", "Disconnected On", "Days Disconnected", "Reason", "PPPoE User", "MikroTik"];
  const rows = customers.map(c => [c.id, c.name, c.phone, c.zone, c.subzone, c.package, c.price, c.dueAmount, c.disconnectedOn, c.disconnectedDays, c.reason, c.pppUser, c.mikrotik]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `disconnected_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export function DisconnectedPage() {
  const { customers, toggleNetStatus } = useCustomerContext();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");
  const [reconnectModal, setReconnectModal] = useState<DisconnectedCustomer | null>(null);
  const [smsModal, setSmsModal] = useState<DisconnectedCustomer | null>(null);
  const [smsText, setSmsText] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  // Filter actual disconnected or suspended customers from database
  const disconnectedList: DisconnectedCustomer[] = useMemo(() => {
    return customers
      .filter(c => c.status === "disconnected" || c.status === "suspended" || c.netStatus === "offline")
      .map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        zone: c.zone || "Madaripur",
        subzone: c.subzone || "Kalkini Somitir Hat",
        package: c.package,
        price: c.price,
        dueAmount: c.dueAmount || 0,
        disconnectedOn: c.endDate || "10 Sep 2026",
        disconnectedDays: c.daysRemaining < 0 ? Math.abs(c.daysRemaining) : 3,
        reason: c.dueAmount > 0 ? "Non-payment" : "Service suspended",
        pppUser: c.pppUser,
        mikrotik: c.mikrotik || "MikroTik-01"
      }));
  }, [customers]);

  const filtered = disconnectedList.filter(c => {
    const q = search.toLowerCase();
    return !search || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.phone.includes(search) || c.pppUser.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allSelected = paginated.length > 0 && paginated.every(c => selected.has(c.id));
  const toggleAll = () => setSelected(prev => {
    const n = new Set(prev);
    if (allSelected) { paginated.forEach(c => n.delete(c.id)); } else { paginated.forEach(c => n.add(c.id)); }
    return n;
  });

  const reconnect = (c: DisconnectedCustomer) => {
    setActionId(c.id);
    toggleNetStatus(c.id, true);
    setTimeout(() => {
      setActionId(null);
      setReconnectModal(null);
      showToast(`✓ ${c.name} line reconnected & synchronized with MikroTik.`);
    }, 600);
  };

  const sendSMS = () => {
    if (!smsText.trim() || !smsModal) return;
    setSmsModal(null); setSmsText("");
    showToast(`✓ SMS sent to ${smsModal.name}`);
  };

  const totalDue = disconnectedList.reduce((a, c) => a + c.dueAmount, 0);
  const avgDays = disconnectedList.length > 0 ? Math.round(disconnectedList.reduce((a, c) => a + c.disconnectedDays, 0) / disconnectedList.length) : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>Disconnected Customers</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{disconnectedList.length} customers · ৳{totalDue.toLocaleString()} total outstanding</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <>
              <button onClick={() => { selected.forEach(id => { const c = disconnectedList.find(x=>x.id===id); if(c) showToast(`SMS sent to ${c.name}`); }); setSelected(new Set()); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer" style={{ background: "#DBEAFE", border: "1px solid #93C5FD", fontSize: 13, color: "#2563EB", fontWeight: 500 }}>
                <Send size={14} /> SMS ({selected.size})
              </button>
              <button onClick={() => { selected.forEach(id => { const c = disconnectedList.find(x=>x.id===id); if(c) reconnect(c); }); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer" style={{ background: "#DCFCE7", border: "1px solid #86EFAC", fontSize: 13, color: "#16A34A", fontWeight: 500 }}>
                <Zap size={14} /> Reconnect ({selected.size})
              </button>
            </>
          )}
          <button onClick={() => exportCSV(filtered)} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer" style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { label: "Total Disconnected", value: disconnectedList.length, icon: WifiOff, bg: "#F3F4F6", color: "#374151" },
          { label: "Total Outstanding", value: `৳${totalDue.toLocaleString()}`, icon: AlertTriangle, bg: "#FEE2E2", color: "#DC2626" },
          { label: "Avg Days Offline", value: `${avgDays}d`, icon: Clock, bg: "#FEF3C7", color: "#D97706" },
          { label: "Active Restorable", value: disconnectedList.length, icon: Zap, bg: "#DCFCE7", color: "#16A34A" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl p-4 flex items-start gap-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-center rounded-lg flex-shrink-0" style={{ width: 36, height: 36, background: s.bg }}>
                <Icon size={16} style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--foreground)", lineHeight: 1.2 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="relative w-64">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, ID, phone…"
              className="w-full pl-8 pr-3 py-2 rounded-lg outline-none" style={{ background: "var(--muted)", fontSize: 12, color: "var(--foreground)", border: "1px solid transparent" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(139,32,32,0.3)")}
              onBlur={e => (e.currentTarget.style.borderColor = "transparent")} />
          </div>
          {selected.size > 0 && <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>{selected.size} selected</span>}
          <span className="ml-auto" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{filtered.length} customers</span>
        </div>
        <div className="overflow-x-auto">
          {paginated.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
              <CheckCircle2 size={36} className="text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-bold text-foreground">Zero Disconnected Customers</p>
              <p className="text-xs text-muted-foreground">All subscriber lines are online and actively routing traffic.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
                  </th>
                  {["Customer", "Contact", "Package", "Zone", "Disconnected", "Reason", "Due Amount", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < paginated.length - 1 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center rounded-full text-white flex-shrink-0" style={{ width: 30, height: 30, background: "#6B7280", fontSize: 10, fontWeight: 700 }}>
                          {c.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{c.name}</p>
                          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)" }}>{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ fontSize: 12, color: "var(--foreground)" }}>{c.phone}</p>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)" }}>{c.pppUser}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)" }}>{c.package}</p>
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>৳{c.price.toLocaleString()}/mo</p>
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ fontSize: 12, color: "var(--foreground)" }}>{c.subzone}</p>
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{c.zone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Circle size={6} fill="#9CA3AF" stroke="none" />
                        <span style={{ fontSize: 12, color: "#DC2626", fontWeight: 500 }}>{c.disconnectedOn}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{c.disconnectedDays} days ago</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 500, background: "#FEF3C7", color: "#D97706" }}>{c.reason}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: "#DC2626" }}>৳{c.dueAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button title="Reconnect" onClick={() => setReconnectModal(c)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer" style={{ background: "#DCFCE7", fontSize: 11, color: "#16A34A", fontWeight: 500, border: "1px solid #86EFAC" }}>
                          <Zap size={11} /> Reconnect
                        </button>
                        <button title="Send SMS" onClick={() => { setSmsModal(c); setSmsText(""); }}
                          className="flex items-center justify-center w-7 h-7 rounded-md cursor-pointer"
                          onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <Send size={13} style={{ color: "var(--muted-foreground)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Showing {(page-1)*ITEMS_PER_PAGE+1}–{Math.min(page*ITEMS_PER_PAGE,filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background:"var(--card)",border:"1px solid var(--border)",opacity:page===1 ? 0.4 : 1 }}><ChevronLeft size={13}/></button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background:page===p?"var(--primary)":"var(--card)",border:`1px solid ${page===p?"var(--primary)":"var(--border)"}`,color:page===p?"white":"var(--foreground)",fontSize:12 }}>{p}</button>
              ))}
              <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background:"var(--card)",border:"1px solid var(--border)",opacity:page===totalPages ? 0.4 : 1 }}><ChevronRight size={13}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Reconnect Confirm Modal */}
      {reconnectModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--foreground)" }}>Confirm Reconnection</h3>
              <button onClick={() => setReconnectModal(null)}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
            </div>
            <div className="p-4 rounded-xl mb-4" style={{ background: "var(--muted)" }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>{reconnectModal.name}</p>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 2 }}>{reconnectModal.pppUser} · {reconnectModal.mikrotik}</p>
              {reconnectModal.dueAmount > 0 && (
                <div className="mt-3 p-2.5 rounded-lg" style={{ background: "#FEF3C7", border: "1px solid #FCD34D" }}>
                  <p style={{ fontSize: 12, color: "#D97706", fontWeight: 500 }}>⚠ Outstanding balance: ৳{reconnectModal.dueAmount.toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setReconnectModal(null)} className="flex-1 py-2.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13 }}>Cancel</button>
              <button onClick={() => reconnect(reconnectModal)} disabled={actionId === reconnectModal.id} className="flex-1 py-2.5 rounded-lg text-white flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: "#16A34A", fontSize: 13, fontWeight: 500 }}>
                {actionId === reconnectModal.id ? "Reconnecting…" : "Reconnect Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Modal */}
      {smsModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, color: "var(--foreground)" }}>Send SMS</h3>
              <button onClick={() => setSmsModal(null)}><X size={16} style={{ color: "var(--muted-foreground)" }} /></button>
            </div>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>To: {smsModal.name} · {smsModal.phone}</p>
            <div className="flex flex-col gap-3">
              <textarea value={smsText} onChange={e => setSmsText(e.target.value)} rows={3} placeholder="Type your message…" className="w-full px-3 py-2.5 rounded-lg outline-none resize-none" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }} />
              <div className="flex gap-2">
                <button onClick={() => setSmsModal(null)} className="flex-1 py-2.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13 }}>Cancel</button>
                <button onClick={sendSMS} disabled={!smsText.trim()} className="flex-1 py-2.5 rounded-lg text-white flex items-center justify-center gap-2 cursor-pointer" style={{ background: !smsText.trim() ? "#ccc" : "#2563EB", fontSize: 13, fontWeight: 500 }}>
                  <Send size={14} /> Send
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
