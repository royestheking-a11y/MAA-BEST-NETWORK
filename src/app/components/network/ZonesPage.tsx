import { useState, useEffect } from "react";
import {
  Layers, MapPin, Users, Plus, Search, ChevronRight, CheckCircle2,
  AlertTriangle, XCircle, X, Shield, Activity, Radio, Server
} from "lucide-react";
import {
  networkStore, type ServiceZone
} from "./networkData";

interface ZonesPageProps {
  onNavigate?: (page: string) => void;
}

export function ZonesPage({ onNavigate }: ZonesPageProps) {
  const [zones, setZones] = useState<ServiceZone[]>(networkStore.getZones());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddZone, setShowAddZone] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ServiceZone | null>(null);
  const [toast, setToast] = useState("");

  const [newZone, setNewZone] = useState({
    name: "", code: "", subzones: "4", mikrotik: "MikroTik-01", olt: "OLT-Mirpur-01", bandwidth: "1.5 Gbps"
  });

  useEffect(() => {
    return networkStore.subscribe(() => {
      setZones(networkStore.getZones());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const filteredZones = zones.filter(z => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      z.name.toLowerCase().includes(q) ||
      z.code.toLowerCase().includes(q) ||
      z.mikrotik.toLowerCase().includes(q) ||
      z.olt.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || z.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAddZone = () => {
    if (!newZone.name || !newZone.code) return;
    const zone: ServiceZone = {
      id: `ZN-${(zones.length + 1).toString().padStart(2, "0")}`,
      name: newZone.name,
      code: newZone.code.toUpperCase(),
      subzones: Number(newZone.subzones),
      customers: 0,
      active: 0,
      due: 0,
      mikrotik: newZone.mikrotik,
      olt: newZone.olt,
      bandwidth: newZone.bandwidth,
      status: "healthy",
    };
    networkStore.addZone(zone);
    setShowAddZone(false);
    showToast(`Coverage Zone "${zone.name}" created!`);
    setNewZone({ name: "", code: "", subzones: "4", mikrotik: "MikroTik-01", olt: "OLT-Mirpur-01", bandwidth: "1.5 Gbps" });
  };

  const totalSubscribers = zones.reduce((a, b) => a + b.customers, 0);
  const totalActive = zones.reduce((a, b) => a + b.active, 0);
  const totalSubzones = zones.reduce((a, b) => a + b.subzones, 0);

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
              Coverage Zones & Sub-Zones
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
              {zones.length} Primary Zones · {totalSubzones} Splitter Clusters
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Geographic service distribution, field branch mapping, active client density, and upstream router bindings
          </p>
        </div>

        <button
          onClick={() => setShowAddZone(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
          style={{ background: "var(--primary)", fontSize: 13 }}
        >
          <Plus size={14} /> Add Service Zone
        </button>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Covered Customers</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DCFCE7" }}>
              <Users size={15} style={{ color: "#16A34A" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)", marginBottom: 2 }}>
            {totalSubscribers.toLocaleString()}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Across all active territory zones</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Active Ratio</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DBEAFE" }}>
              <Activity size={15} style={{ color: "#2563EB" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#2563EB", marginBottom: 2 }}>
            {Math.round((totalActive / (totalSubscribers || 1)) * 100)}%
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{totalActive.toLocaleString()} subscribers online</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Sub-Zone Splitters</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#EDE9FE" }}>
              <Layers size={15} style={{ color: "#7C3AED" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#7C3AED", marginBottom: 2 }}>
            {totalSubzones} Hubs
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Optical distribution boxes</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Zone Outages</span>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#FEE2E2" }}>
              <AlertTriangle size={15} style={{ color: "#DC2626" }} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#DC2626", marginBottom: 2 }}>
            {zones.filter(z => z.status === "down").length} Down
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Gulshan POP power incident</p>
        </div>
      </div>

      {/* ── Zones Table ──────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap border-b border-border">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search zone, code, OLT, router..."
              className="w-full pl-9 pr-3 py-2 rounded-lg outline-none"
              style={{ background: "var(--muted)", fontSize: 12, color: "var(--foreground)", border: "1px solid transparent" }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "healthy", "degraded", "down"] as const).map(k => (
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
                {k}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--muted)" }}>
              {["Zone Name & Code", "Sub-zones", "Subscribers", "Active (Online)", "Pending Due", "MikroTik Server", "OLT Chassis", "Health", "Action"].map(h => (
                <th key={h} className="text-left px-5 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em" }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredZones.map((z, i) => {
              const activePct = z.customers > 0 ? Math.round((z.active / z.customers) * 100) : 0;
              const hasIssue = z.status === "down";
              return (
                <tr
                  key={z.id}
                  style={{
                    borderBottom: i < filteredZones.length - 1 ? "1px solid var(--border)" : "none",
                    background: hasIssue ? "rgba(220, 38, 38, 0.05)" : "transparent",
                  }}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <MapPin size={15} style={{ color: hasIssue ? "#DC2626" : "var(--primary)" }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: hasIssue ? "#DC2626" : "var(--foreground)" }}>{z.name}</p>
                        <span className="font-mono text-[10px] text-muted-foreground">{z.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-foreground font-medium">
                    {z.subzones} Clusters
                  </td>
                  <td className="px-5 py-4 font-mono text-xs font-bold text-foreground">
                    {z.customers.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <span className="font-mono text-xs font-bold" style={{ color: hasIssue ? "#DC2626" : "#16A34A" }}>
                        {z.active.toLocaleString()}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginLeft: 4 }}>({activePct}%)</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-medium" style={{ color: z.due > 80 ? "#DC2626" : "var(--muted-foreground)" }}>
                      {z.due}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-foreground font-medium">
                    {z.mikrotik}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {z.olt}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      style={{
                        background: z.status === "healthy" ? "#DCFCE7" : z.status === "degraded" ? "#FEF3C7" : "#FEE2E2",
                        color: z.status === "healthy" ? "#16A34A" : z.status === "degraded" ? "#D97706" : "#DC2626",
                      }}
                    >
                      {z.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => {
                        setSelectedZone(z);
                        showToast(`Viewing sub-zone details for ${z.name}`);
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Inspect <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Add Zone Modal ───────────────────────────────────────────────────── */}
      {showAddZone && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Add Coverage Service Zone
                </h3>
              </div>
              <button onClick={() => setShowAddZone(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">ZONE NAME</label>
                  <input
                    value={newZone.name}
                    onChange={e => setNewZone(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Rampura Zone"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">ZONE CODE</label>
                  <input
                    value={newZone.code}
                    onChange={e => setNewZone(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="Z-RAM"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">BOUND MIKROTIK</label>
                  <select
                    value={newZone.mikrotik}
                    onChange={e => setNewZone(p => ({ ...p, mikrotik: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option>MikroTik-01 (Mirpur DC)</option>
                    <option>MikroTik-02 (Uttara DC)</option>
                    <option>MikroTik-03 (Dhanmondi)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">OLT CHASSIS</label>
                  <select
                    value={newZone.olt}
                    onChange={e => setNewZone(p => ({ ...p, olt: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option>OLT-Mirpur-01</option>
                    <option>OLT-Uttara-01</option>
                    <option>OLT-Dhanmondi-01</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">SUB-ZONES COUNT</label>
                  <input
                    type="number"
                    value={newZone.subzones}
                    onChange={e => setNewZone(p => ({ ...p, subzones: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">BANDWIDTH (GBPS)</label>
                  <input
                    value={newZone.bandwidth}
                    onChange={e => setNewZone(p => ({ ...p, bandwidth: e.target.value }))}
                    placeholder="1.5 Gbps"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddZone(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddZone}
                disabled={!newZone.name || !newZone.code}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Create Zone
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
