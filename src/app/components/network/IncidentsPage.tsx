import { useState, useEffect } from "react";
import {
  Zap, Search, Plus, AlertTriangle, CheckCircle2, Clock, XCircle,
  X, Check, ShieldAlert, User, MapPin
} from "lucide-react";
import {
  networkStore, type NetworkIncident
} from "./networkData";

interface IncidentsPageProps {
  onNavigate?: (page: string) => void;
}

export function IncidentsPage({ onNavigate }: IncidentsPageProps) {
  const [incidents, setIncidents] = useState<NetworkIncident[]>(networkStore.getIncidents());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddIncident, setShowAddIncident] = useState(false);
  const [toast, setToast] = useState("");

  const [newInc, setNewInc] = useState({
    title: "", zone: "Gulshan", affectedCustomers: "120", severity: "critical" as NetworkIncident["severity"],
    assignee: "Tanvir Hasan", rootCause: ""
  });

  useEffect(() => {
    return networkStore.subscribe(() => {
      setIncidents(networkStore.getIncidents());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const filteredIncidents = incidents.filter(inc => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      inc.id.toLowerCase().includes(q) ||
      inc.title.toLowerCase().includes(q) ||
      inc.zone.toLowerCase().includes(q) ||
      inc.assignee.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || inc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAddIncident = () => {
    if (!newInc.title) return;
    const inc: NetworkIncident = {
      id: `INC-${(incidents.length + 882).toString()}`,
      title: newInc.title,
      zone: newInc.zone,
      affectedCustomers: Number(newInc.affectedCustomers || 0),
      severity: newInc.severity,
      status: "open",
      assignee: newInc.assignee,
      time: "just now",
      createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      rootCause: newInc.rootCause,
    };
    networkStore.addIncident(inc);
    setShowAddIncident(false);
    showToast(`Incident #${inc.id} declared and assigned to ${inc.assignee}!`);
    setNewInc({ title: "", zone: "Gulshan", affectedCustomers: "120", severity: "critical", assignee: "Tanvir Hasan", rootCause: "" });
  };

  const handleResolve = (id: string) => {
    networkStore.resolveIncident(id);
    showToast(`Incident #${id} resolved! Customer SMS status updated.`);
  };

  const openCount = incidents.filter(i => i.status === "open").length;
  const investigatingCount = incidents.filter(i => i.status === "investigating").length;
  const resolvedCount = incidents.filter(i => i.status === "resolved").length;

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
              Network Incidents & Outages
            </h1>
            {openCount > 0 ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white animate-pulse">
                {openCount} Active Outages
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-600 text-white">
                No Critical Outages
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Live fiber cuts, power outages, POP disruptions, technician work orders, and resolution timeline
          </p>
        </div>

        <button
          onClick={() => setShowAddIncident(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
          style={{ background: "#DC2626", fontSize: 13 }}
        >
          <Plus size={14} /> Declare Outage / Incident
        </button>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Open Incidents</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-red-100 text-red-600">
              <AlertTriangle size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "#DC2626" }}>
            {openCount}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Critical backbone or power issues</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Investigating / In Progress</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-amber-100 text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "#D97706" }}>
            {investigatingCount}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Field teams dispatched</p>
        </div>

        <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Resolved Today</span>
            <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "#16A34A" }}>
            {resolvedCount}
          </p>
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Normal traffic restored</p>
        </div>
      </div>

      {/* ── Incident List Container ──────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap border-b border-border">
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search incident ID, title, zone, assignee..."
              className="w-full pl-9 pr-3 py-2 rounded-lg outline-none"
              style={{ background: "var(--muted)", fontSize: 12, color: "var(--foreground)", border: "1px solid transparent" }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "open", "investigating", "resolved"] as const).map(k => (
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

        <div className="divide-y divide-border">
          {filteredIncidents.map(inc => {
            const isCritical = inc.severity === "critical";
            const isOpen = inc.status === "open";
            return (
              <div
                key={inc.id}
                className="p-5 flex items-start justify-between gap-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isCritical ? "#FEE2E2" : "#FEF3C7",
                      color: isCritical ? "#DC2626" : "#D97706",
                    }}
                  >
                    <Zap size={20} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-primary">{inc.id}</span>
                      <span
                        className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase"
                        style={{
                          background: isCritical ? "#FEE2E2" : "#FEF3C7",
                          color: isCritical ? "#DC2626" : "#D97706",
                        }}
                      >
                        {inc.severity}
                      </span>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>
                        {inc.title}
                      </h4>
                    </div>

                    <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 6 }}>
                      Zone: <span className="text-foreground font-semibold">{inc.zone}</span> · Affected: <span className="font-mono text-red-600 font-bold">{inc.affectedCustomers} Subscribers</span> · Logged: {inc.createdAt} ({inc.time})
                    </p>

                    {inc.rootCause && (
                      <div className="p-2.5 rounded-lg bg-muted text-xs text-foreground/80 max-w-2xl border border-border">
                        <strong>Root Cause / Notes:</strong> {inc.rootCause}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-bold uppercase"
                    style={{
                      background: inc.status === "resolved" ? "#DCFCE7" : isOpen ? "#FEE2E2" : "#FEF3C7",
                      color: inc.status === "resolved" ? "#16A34A" : isOpen ? "#DC2626" : "#D97706",
                    }}
                  >
                    {inc.status}
                  </span>

                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                    Lead: <strong className="text-foreground">{inc.assignee}</strong>
                  </span>

                  {inc.status !== "resolved" && (
                    <button
                      onClick={() => handleResolve(inc.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-sm mt-1"
                    >
                      <Check size={12} /> Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredIncidents.length === 0 && (
            <div className="p-12 text-center text-muted-foreground text-xs">
              No incidents found.
            </div>
          )}
        </div>
      </div>

      {/* ── Declare Outage Modal ──────────────────────────────────────────────── */}
      {showAddIncident && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-red-600" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Declare Network Outage
                </h3>
              </div>
              <button onClick={() => setShowAddIncident(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">INCIDENT TITLE</label>
                <input
                  value={newInc.title}
                  onChange={e => setNewInc(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Fiber Core Cut near Rampura Bridge"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">AFFECTED ZONE</label>
                  <select
                    value={newInc.zone}
                    onChange={e => setNewInc(p => ({ ...p, zone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option>Mirpur</option>
                    <option>Uttara</option>
                    <option>Dhanmondi</option>
                    <option>Gulshan</option>
                    <option>Mohammadpur</option>
                    <option>Bashundhara R/A</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">SEVERITY LEVEL</label>
                  <select
                    value={newInc.severity}
                    onChange={e => setNewInc(p => ({ ...p, severity: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="critical">Critical (Down)</option>
                    <option value="warning">Warning (High Latency)</option>
                    <option value="minor">Minor (Single Splitter)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">AFFECTED CUSTOMERS</label>
                  <input
                    type="number"
                    value={newInc.affectedCustomers}
                    onChange={e => setNewInc(p => ({ ...p, affectedCustomers: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">FIELD ENGINEER ASSIGNEE</label>
                  <input
                    value={newInc.assignee}
                    onChange={e => setNewInc(p => ({ ...p, assignee: e.target.value }))}
                    placeholder="Tanvir Hasan"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">ROOT CAUSE / SUMMARY</label>
                <textarea
                  value={newInc.rootCause}
                  onChange={e => setNewInc(p => ({ ...p, rootCause: e.target.value }))}
                  placeholder="Describe details of the failure, OTDR distance, or power outage..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddIncident(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddIncident}
                disabled={!newInc.title}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 disabled:opacity-50"
              >
                Publish Outage Ticket
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
