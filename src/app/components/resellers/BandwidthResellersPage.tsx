import { useState, useEffect } from "react";
import {
  Globe, Search, Plus, Activity, Zap, CheckCircle2, AlertTriangle,
  XCircle, X, RefreshCw, BarChart3, ChevronRight, Server
} from "lucide-react";
import {
  resellersStore, type BandwidthReseller
} from "./resellersData";

interface BandwidthResellersPageProps {
  onNavigate?: (page: string) => void;
}

export function BandwidthResellersPage({ onNavigate }: BandwidthResellersPageProps) {
  const [resellers, setResellers] = useState<BandwidthReseller[]>(resellersStore.getBwResellers());
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState("");

  const [newBw, setNewBw] = useState({
    name: "", company: "", allocatedBandwidth: "1000", ratePerMbps: "85",
    bgpPeerIp: "103.112.50.20", vlanId: "230"
  });

  useEffect(() => {
    return resellersStore.subscribe(() => {
      setResellers(resellersStore.getBwResellers());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const filtered = resellers.filter(r => {
    const q = search.toLowerCase();
    return !search ||
      r.name.toLowerCase().includes(q) ||
      r.company.toLowerCase().includes(q) ||
      r.bgpPeerIp.includes(q);
  });

  const handleAdd = () => {
    if (!newBw.company || !newBw.allocatedBandwidth) return;
    const bw: BandwidthReseller = {
      id: `BW-${(resellers.length + 201).toString()}`,
      name: newBw.name || newBw.company,
      company: newBw.company,
      allocatedBandwidth: Number(newBw.allocatedBandwidth),
      currentUsage: Math.round(Number(newBw.allocatedBandwidth) * 0.8),
      ratePerMbps: Number(newBw.ratePerMbps),
      monthlyBill: Number(newBw.allocatedBandwidth) * Number(newBw.ratePerMbps),
      bgpPeerIp: newBw.bgpPeerIp,
      vlanId: Number(newBw.vlanId),
      status: "active",
    };
    resellersStore.addBwReseller(bw);
    setShowAddModal(false);
    showToast(`Bandwidth trunk for "${bw.company}" provisioned on VLAN ${bw.vlanId}!`);
    setNewBw({ name: "", company: "", allocatedBandwidth: "1000", ratePerMbps: "85", bgpPeerIp: "", vlanId: "230" });
  };

  const totalAllocated = resellers.reduce((a, b) => a + b.allocatedBandwidth, 0);
  const totalCurrentUsage = resellers.reduce((a, b) => a + b.currentUsage, 0);
  const totalRevenue = resellers.reduce((a, b) => a + b.monthlyBill, 0);

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
              Bandwidth Resellers (Trunk / Wholesale)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DBEAFE", color: "#2563EB" }}>
              {totalAllocated.toLocaleString()} Mbps Dedicated Trunks
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            BGP peering, VLAN sub-interfaces, wholesale Mbps rate cards, and burst usage telemetry
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
          style={{ background: "var(--primary)", fontSize: 13 }}
        >
          <Plus size={14} /> Allocate Bandwidth Trunk
        </button>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Total Allocated Capacity</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-blue-100 text-blue-600">
              <Globe size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 22, color: "#2563EB", marginBottom: 2 }}>
            {(totalAllocated / 1000).toFixed(1)} Gbps
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Wholesale committed bandwidth</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Current Peak Usage</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-purple-100 text-purple-600">
              <Activity size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 22, color: "#7C3AED", marginBottom: 2 }}>
            {(totalCurrentUsage / 1000).toFixed(2)} Gbps
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{Math.round((totalCurrentUsage / totalAllocated) * 100)}% utilization</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Monthly Wholesale MRC</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-emerald-100 text-emerald-600">
              <Zap size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 20, color: "#16A34A", marginBottom: 2 }}>
            ৳{totalRevenue.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Recurring monthly revenue</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Active BGP Peers</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-amber-100 text-amber-600">
              <Server size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)", marginBottom: 2 }}>
            {resellers.length} Uplinks
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>MikroTik BGP ASN peering</p>
        </div>
      </div>

      {/* ── Bandwidth Trunk Cards Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filtered.map(r => {
          const utilPct = Math.round((r.currentUsage / r.allocatedBandwidth) * 100);
          const isExceeded = utilPct >= 100;
          const isWarning = utilPct >= 90 && !isExceeded;
          return (
            <div
              key={r.id}
              className="rounded-xl p-5 shadow-sm space-y-4"
              style={{
                background: "var(--card)",
                border: `1px solid ${isExceeded ? "#FECACA" : isWarning ? "#FDE68A" : "var(--border)"}`,
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                    <Globe size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--foreground)" }}>
                      {r.company}
                    </h3>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                      Peer IP: <span className="font-mono text-foreground font-semibold">{r.bgpPeerIp}</span> · VLAN: {r.vlanId}
                    </p>
                  </div>
                </div>

                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  style={{
                    background: isExceeded ? "#FEE2E2" : isWarning ? "#FEF3C7" : "#DCFCE7",
                    color: isExceeded ? "#DC2626" : isWarning ? "#D97706" : "#16A34A",
                  }}
                >
                  {isExceeded ? "Over Limit" : isWarning ? "Near Limit" : "Normal"}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Bandwidth Consumption</span>
                    <span className="font-mono font-bold text-foreground">
                      {r.currentUsage} Mbps / {r.allocatedBandwidth} Mbps ({utilPct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(utilPct, 100)}%`,
                        background: isExceeded ? "#DC2626" : isWarning ? "#D97706" : "#2563EB",
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">RATE PER MBPS</span>
                    <span className="font-mono font-bold text-foreground">৳{r.ratePerMbps} / Mbps</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">MONTHLY MRC</span>
                    <span className="font-mono font-bold text-emerald-600">৳{r.monthlyBill.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border text-xs">
                <button
                  onClick={() => showToast(`MRTG live bandwidth graph pulled for ${r.company}`)}
                  className="flex-1 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium text-foreground flex items-center justify-center gap-1"
                >
                  <BarChart3 size={13} /> View MRTG Graph
                </button>
                <button
                  onClick={() => showToast(`BGP queue tree reloaded for ${r.company}`)}
                  className="py-2 px-3 rounded-lg border border-border hover:bg-muted text-muted-foreground"
                  title="Reload Queue"
                >
                  <RefreshCw size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add Bandwidth Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Provision Bandwidth Trunk
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">COMPANY / ISP NAME</label>
                <input
                  value={newBw.company}
                  onChange={e => setNewBw(p => ({ ...p, company: e.target.value }))}
                  placeholder="e.g. Apex Data Comm"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">BANDWIDTH (MBPS)</label>
                  <input
                    type="number"
                    value={newBw.allocatedBandwidth}
                    onChange={e => setNewBw(p => ({ ...p, allocatedBandwidth: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">RATE (৳ / MBPS)</label>
                  <input
                    type="number"
                    value={newBw.ratePerMbps}
                    onChange={e => setNewBw(p => ({ ...p, ratePerMbps: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">BGP PEER IP</label>
                  <input
                    value={newBw.bgpPeerIp}
                    onChange={e => setNewBw(p => ({ ...p, bgpPeerIp: e.target.value }))}
                    placeholder="103.112.50.20"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">VLAN TAG ID</label>
                  <input
                    type="number"
                    value={newBw.vlanId}
                    onChange={e => setNewBw(p => ({ ...p, vlanId: e.target.value }))}
                    placeholder="230"
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
                disabled={!newBw.company || !newBw.allocatedBandwidth}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Create Trunk
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
