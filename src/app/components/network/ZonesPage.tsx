import { useNetxLiveData } from "../../services/netxApiService";
import { useState, useEffect, useMemo } from "react";
import {
  Layers, MapPin, Users, Plus, Search, ChevronRight, CheckCircle2,
  AlertTriangle, XCircle, X, Shield, Activity, Radio, Server, Trash2,
  ExternalLink, Network, Zap, Wifi, Split, Eye, ArrowUpRight
} from "lucide-react";
import {
  networkStore, type ServiceZone
} from "./networkData";
import { useCustomerContext } from "../../context/CustomerContext";
import { useNetxLiveData as _useNetxLiveData } from "../../services/netxApiService";
import { usePermission } from "../../context/AuthContext";

interface SubZoneCluster {
  id: string;
  name: string;
  splitterBox: string;
  splitRatio: string;
  portsUsed: number;
  totalPorts: number;
  oltPort: string;
  status: "healthy" | "warning" | "offline";
  dropDistance: string;
  powerDbm: string;
  location: string;
}

const DEFAULT_ZONE_CLUSTERS: Record<string, SubZoneCluster[]> = {
  "ZONE-PORT": [
    { id: "CL-PORT-01", name: "Charmuguria Port Terminal Hub", splitterBox: "TJ-PORT-01", splitRatio: "1:8", portsUsed: 6, totalPorts: 8, oltPort: "OLT1 EPON 0/3", status: "healthy", dropDistance: "45-120m", powerDbm: "-18.6 dBm", location: "Charmuguria Launch Ghat Road" },
    { id: "CL-PORT-02", name: "Puran Bazar River Ghat DP", splitterBox: "TJ-PORT-02", splitRatio: "1:16", portsUsed: 12, totalPorts: 16, oltPort: "OLT1 EPON 0/3", status: "healthy", dropDistance: "60-180m", powerDbm: "-19.2 dBm", location: "River Ghat Wholesale Market" },
    { id: "CL-PORT-03", name: "Commercial Road Central DP", splitterBox: "TJ-PORT-03", splitRatio: "1:8", portsUsed: 5, totalPorts: 8, oltPort: "OLT1 EPON 0/4", status: "healthy", dropDistance: "30-90m", powerDbm: "-17.9 dBm", location: "Commercial Bank Corner Pole #12" },
  ],
  "ZONE-SADAR": [
    { id: "CL-SADAR-01", name: "Somitir Hat Central Pole #14", splitterBox: "SP-01", splitRatio: "1:8", portsUsed: 7, totalPorts: 8, oltPort: "OLT1 EPON 0/1", status: "healthy", dropDistance: "45-110m", powerDbm: "-18.4 dBm", location: "Somitir Hat Central Pole #14" },
    { id: "CL-SADAR-02", name: "Puran Bazar Bridge Corner #08", splitterBox: "SP-02", splitRatio: "1:8", portsUsed: 6, totalPorts: 8, oltPort: "OLT1 EPON 0/2", status: "healthy", dropDistance: "50-130m", powerDbm: "-18.2 dBm", location: "Puran Bazar Bridge Corner Pole #08" },
    { id: "CL-SADAR-03", name: "Sadar Hospital Road DP #03", splitterBox: "TJ-SADAR-03", splitRatio: "1:8", portsUsed: 8, totalPorts: 8, oltPort: "OLT1 EPON 0/1", status: "warning", dropDistance: "80-220m", powerDbm: "-21.5 dBm", location: "Sadar Hospital Gate" },
    { id: "CL-SADAR-04", name: "Madaripur Notun Bazar Hub", splitterBox: "TJ-SADAR-04", splitRatio: "1:16", portsUsed: 14, totalPorts: 16, oltPort: "OLT1 EPON 0/2", status: "healthy", dropDistance: "40-150m", powerDbm: "-19.0 dBm", location: "Notun Bazar Overbridge Tower" },
  ],
  "ZONE-KALKINI": [
    { id: "CL-KAL-01", name: "Kalkini Central Thana Rd DP #01", splitterBox: "TJ-KAL-01", splitRatio: "1:8", portsUsed: 8, totalPorts: 8, oltPort: "OLT2 GPON 0/1", status: "healthy", dropDistance: "40-100m", powerDbm: "-18.1 dBm", location: "Thana Road Main Intersection" },
    { id: "CL-KAL-02", name: "Gopalpur High School Rd DP #03", splitterBox: "SP-03", splitRatio: "1:8", portsUsed: 7, totalPorts: 8, oltPort: "OLT2 GPON 0/1", status: "healthy", dropDistance: "35-95m", powerDbm: "-17.9 dBm", location: "Gopalpur High School Rd DP Box" },
    { id: "CL-KAL-03", name: "Kalkini Hospital Road Hub #04", splitterBox: "TJ-KAL-03", splitRatio: "1:8", portsUsed: 6, totalPorts: 8, oltPort: "OLT2 GPON 0/2", status: "healthy", dropDistance: "60-140m", powerDbm: "-18.5 dBm", location: "Kalkini Upazila Health Complex" },
    { id: "CL-KAL-04", name: "Dashar Nabagram Bazar Pole #05", splitterBox: "SP-06", splitRatio: "1:8", portsUsed: 5, totalPorts: 8, oltPort: "OLT1 EPON 0/4", status: "healthy", dropDistance: "75-160m", powerDbm: "-18.5 dBm", location: "Nabagram Bazar Road Side Pole #05" },
    { id: "CL-KAL-05", name: "Rajoir Tekerhat Bandar Gate DP #11", splitterBox: "SP-05", splitRatio: "1:8", portsUsed: 4, totalPorts: 8, oltPort: "OLT2 GPON 0/2", status: "healthy", dropDistance: "55-130m", powerDbm: "-18.3 dBm", location: "Tekerhat Bandar Gate DP Box #11" },
    { id: "CL-KAL-06", name: "Shibchar Pachchar Roundabout #02", splitterBox: "SP-04", splitRatio: "1:8", portsUsed: 8, totalPorts: 8, oltPort: "OLT1 EPON 0/3", status: "healthy", dropDistance: "45-125m", powerDbm: "-19.0 dBm", location: "Pachchar Bazar Roundabout Box #02" },
  ]
};

interface ZonesPageProps {
  onNavigate?: (page: string) => void;
}

export function ZonesPage({ onNavigate }: ZonesPageProps) {
  const { canEdit, isReadOnly } = usePermission("zones");
  const { isLoading: isNetxLoading, liveStats } = useNetxLiveData(30000);
  const { customers } = useCustomerContext();
  const [zones, setZones] = useState<ServiceZone[]>(networkStore.getZones());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddZone, setShowAddZone] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ServiceZone | null>(null);
  const [inspectorTab, setInspectorTab] = useState<"clusters" | "subscribers">("clusters");
  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [toast, setToast] = useState("");

  const [newZone, setNewZone] = useState({
    name: "", code: "", subzones: "4", mikrotik: "MikroTik-01", olt: "OLT-Mirpur-01", bandwidth: "1.5 Gbps"
  });

  useEffect(() => {
    return networkStore.subscribe(() => {
      setZones(networkStore.getZones());
    });
  }, []);


  // ── Compute live zone stats from real customer data ──────────────────────
  const zonesWithRealStats = useMemo(() => {
    return zones.map(z => {
      const zoneName = z.name.toLowerCase();
      const zoneCode = z.code.toLowerCase();
      // Match customers to this zone by name or code
      const zoneCustomers = customers.filter(c => {
        const cZone = (c.zone || "").toLowerCase();
        const cSubzone = (c.subzone || "").toLowerCase();
        return (
          cZone.includes(zoneName) || zoneName.includes(cZone) ||
          cZone.includes(zoneCode) || cSubzone.includes(zoneCode)
        );
      });

      // Active = online/connected customers in this zone
      const liveOnlineUsers = liveStats.length > 0
        ? liveStats.filter(l => l.connection_status === "online" && zoneCustomers.some(c =>
            (c.pppUser || c.name || "").toLowerCase() === l.pppoe_username?.toLowerCase()))
        : null;

      const activeCount = liveOnlineUsers !== null
        ? liveOnlineUsers.length
        : zoneCustomers.filter(c => c.netStatus === "online").length;

      const dueCount = zoneCustomers.filter(c =>
        (c.daysRemaining !== undefined && c.daysRemaining <= 3) ||
        c.status === "due" ||
        (c.dueAmount !== undefined && c.dueAmount > 0) ||
        (c.due !== undefined && c.due > 0)
      ).length;

      return {
        ...z,
        customers: zoneCustomers.length,
        active: activeCount,
        due: dueCount,
      };
    });
  }, [zones, customers, liveStats]);

  const totalSubscribers = customers.length;
  const totalActive = zonesWithRealStats.reduce((a, b) => a + b.active, 0);
  const totalSubzones = zones.reduce((a, b) => a + b.subzones, 0);

  const filteredZones = zonesWithRealStats.filter(z => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      z.name.toLowerCase().includes(q) ||
      z.code.toLowerCase().includes(q) ||
      z.mikrotik.toLowerCase().includes(q) ||
      z.olt.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || z.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const selectedZoneClusters = useMemo(() => {
    if (!selectedZone) return [];
    return DEFAULT_ZONE_CLUSTERS[selectedZone.id] || DEFAULT_ZONE_CLUSTERS[`ZONE-${selectedZone.code}`] || [
      { id: `${selectedZone.code}-CL-01`, name: `${selectedZone.name} Central Hub`, splitterBox: "TJ-01", splitRatio: "1:8", portsUsed: 6, totalPorts: 8, oltPort: `${selectedZone.olt} Port 1`, status: "healthy", dropDistance: "50-120m", powerDbm: "-18.5 dBm", location: "Main Center Road" },
      { id: `${selectedZone.code}-CL-02`, name: `${selectedZone.name} Distribution Box 2`, splitterBox: "TJ-02", splitRatio: "1:8", portsUsed: 5, totalPorts: 8, oltPort: `${selectedZone.olt} Port 2`, status: "healthy", dropDistance: "40-100m", powerDbm: "-18.9 dBm", location: "Bazar Corner Pole" },
    ];
  }, [selectedZone]);

  const selectedZoneCustomers = useMemo(() => {
    if (!selectedZone) return [];
    const zName = selectedZone.name.toLowerCase();
    const zCode = selectedZone.code.toLowerCase();

    return customers.filter(c => {
      const cZone = (c.zone || "").toLowerCase();
      const cSubzone = (c.subzone || "").toLowerCase();
      const cBox = (c.box || c.splitterBox || "").toLowerCase();
      
      if (zCode === "port" || zName.includes("charmuguria")) {
        return cZone.includes("port") || cSubzone.includes("charmuguria") || cBox.includes("charmuguria") || cBox.includes("port");
      }
      if (zCode === "sadar" || zName.includes("sadar")) {
        return cZone.includes("sadar") || cSubzone.includes("sadar") || cBox.includes("sadar");
      }
      if (zCode === "kalkini" || zName.includes("kalkini")) {
        return cZone.includes("kalkini") || cSubzone.includes("kalkini") || cBox.includes("kalkini");
      }
      return (
        cZone.includes(zName) || zName.includes(cZone) ||
        cZone.includes(zCode) || cSubzone.includes(zCode)
      );
    });
  }, [selectedZone, customers]);

  const filteredSelectedCustomers = useMemo(() => {
    if (!subscriberSearch.trim()) return selectedZoneCustomers;
    const q = subscriberSearch.toLowerCase().trim();
    return selectedZoneCustomers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.clientCode || c.id).toLowerCase().includes(q) ||
      (c.pppUser || "").toLowerCase().includes(q) ||
      (c.ipAddress || "").includes(q)
    );
  }, [selectedZoneCustomers, subscriberSearch]);

  const handleAddZone = () => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Your role only has Read (View Only) permission for Zones.");
      return;
    }
    if (!newZone.name || !newZone.code) return;
    const zone: ServiceZone = {
      id: `ZN-${Date.now().toString().slice(-4)}`,
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

  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--foreground)",
  };

  if (isNetxLoading) {
    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium">Synchronizing Network Zones...</p>
      </div>
    );
  }

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
          disabled={isReadOnly || !canEdit}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${
            isReadOnly || !canEdit ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground" : "text-white cursor-pointer"
          }`}
          style={isReadOnly || !canEdit ? {} : { background: "var(--primary)", fontSize: 13 }}
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
            {(totalSubscribers || 0).toLocaleString()}
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
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{(totalActive || 0).toLocaleString()} subscribers online</p>
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
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            {zones.some(z => z.status === "down")
              ? `${zones.find(z => z.status === "down")?.name} affected`
              : "All distribution zones normal"}
          </p>
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
                    {(z.customers || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <span className="font-mono text-xs font-bold" style={{ color: hasIssue ? "#DC2626" : "#16A34A" }}>
                        {(z.active || 0).toLocaleString()}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedZone(z);
                          showToast(`Viewing sub-zone details for ${z.name}`);
                        }}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Inspect <ChevronRight size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (isReadOnly || !canEdit) {
                            showToast("Access Restricted: View Only Mode.");
                            return;
                          }
                          if (window.confirm(`Permanently delete coverage zone "${z.name}" (${z.code})?`)) {
                            networkStore.deleteZone(z.id);
                            showToast(`Zone "${z.name}" deleted from database.`);
                          }
                        }}
                        className="p-1 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete zone"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
                disabled={!newZone.name || !newZone.code || isReadOnly || !canEdit}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                {isReadOnly || !canEdit ? "Read-Only: Locked" : "Create Zone"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-Zone & Splitter Cluster Inspector Modal ────────────────────── */}
      {selectedZone && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-5" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
          <div
            className="rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between gap-3 flex-wrap bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-md bg-gradient-to-br from-indigo-500 to-primary">
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--foreground)" }}>
                      {selectedZone.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary border border-primary/20">
                      {selectedZone.code}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      style={{
                        background: selectedZone.status === "healthy" ? "#DCFCE7" : selectedZone.status === "degraded" ? "#FEF3C7" : "#FEE2E2",
                        color: selectedZone.status === "healthy" ? "#16A34A" : selectedZone.status === "degraded" ? "#D97706" : "#DC2626",
                      }}
                    >
                      {selectedZone.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sub-zone coverage, optical splitter clusters & field subscriber distribution
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedZone(null);
                    onNavigate?.("splitters");
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1.5 transition cursor-pointer"
                  title="Open Splitter Ledger"
                >
                  <Split size={14} className="text-primary" />
                  <span>ODN Ledger</span>
                </button>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="p-4 border-b border-border grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/10">
              <div className="p-3 rounded-2xl border border-border bg-card text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Sub-Zone Clusters</div>
                <div className="text-lg font-black text-foreground">{selectedZoneClusters.length} Hubs</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Splitters & DPs</div>
              </div>
              <div className="p-3 rounded-2xl border border-border bg-card text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Subscribers</div>
                <div className="text-lg font-black text-primary">{selectedZoneCustomers.length} Users</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                  {selectedZoneCustomers.filter(c => c.netStatus === "online").length} Online Active
                </div>
              </div>
              <div className="p-3 rounded-2xl border border-border bg-card text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">Bound MikroTik</div>
                <div className="text-sm font-black text-foreground truncate mt-1">{selectedZone.mikrotik}</div>
                <div className="text-[10px] text-muted-foreground">Core RouterOS</div>
              </div>
              <div className="p-3 rounded-2xl border border-border bg-card text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">OLT Chassis & Port</div>
                <div className="text-sm font-black text-foreground truncate mt-1">{selectedZone.olt}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{selectedZone.bandwidth} Cap.</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-5 pt-3 border-b border-border flex items-center justify-between gap-4 flex-wrap bg-muted/5">
              <div className="flex gap-2">
                <button
                  onClick={() => setInspectorTab("clusters")}
                  className={`px-4 py-2 rounded-t-xl text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                    inspectorTab === "clusters"
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Network size={14} />
                  <span>Sub-Zone Splitter Clusters ({selectedZoneClusters.length})</span>
                </button>
                <button
                  onClick={() => setInspectorTab("subscribers")}
                  className={`px-4 py-2 rounded-t-xl text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
                    inspectorTab === "subscribers"
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Users size={14} />
                  <span>Assigned Subscribers ({selectedZoneCustomers.length})</span>
                </button>
              </div>

              {inspectorTab === "subscribers" && selectedZoneCustomers.length > 0 && (
                <div className="relative pb-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 -mt-1 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search subscribers..."
                    value={subscriberSearch}
                    onChange={e => setSubscriberSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            {/* Tab 1: Sub-Zone Splitter Clusters */}
            {inspectorTab === "clusters" && (
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {selectedZoneClusters.map((cl) => {
                    const pct = Math.round((cl.portsUsed / cl.totalPorts) * 100);
                    return (
                      <div
                        key={cl.id}
                        className="p-4 rounded-2xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                              <Split size={16} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">{cl.name}</div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <MapPin size={11} className="text-muted-foreground" />
                                <span className="truncate">{cl.location}</span>
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {cl.powerDbm}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50 text-[11px]">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Splitter Box:</span>
                            <span className="font-mono font-bold text-foreground">{cl.splitterBox}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Ratio:</span>
                            <span className="font-mono font-bold text-foreground">{cl.splitRatio}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Feeder Port:</span>
                            <span className="font-mono font-bold text-primary truncate block">{cl.oltPort}</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] font-medium mb-1">
                            <span className="text-muted-foreground">Port Occupancy</span>
                            <span className="font-mono font-bold text-foreground">{cl.portsUsed} / {cl.totalPorts} Ports ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                          <span>Drop Fiber: <strong className="text-foreground">{cl.dropDistance}</strong></span>
                          <button
                            onClick={() => {
                              setSelectedZone(null);
                              onNavigate?.("splitters");
                            }}
                            className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
                          >
                            Manage Box →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl border border-dashed border-border bg-muted/10 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Shield size={16} className="text-primary" />
                    <span>Optical Distribution Network (ODN) standard insertion loss for {selectedZone.name} is verified within -18 dBm to -24 dBm.</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedZone(null);
                      onNavigate?.("splitters");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add Splitter to {selectedZone.code}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Assigned Subscribers */}
            {inspectorTab === "subscribers" && (
              <div className="overflow-y-auto flex-1 p-5">
                {selectedZoneCustomers.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-14 h-14 rounded-3xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                      <Users size={28} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground text-sm">No direct subscribers currently linked to {selectedZone.name}</h4>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        In the current database import, subscribers are registered under the central Kalkini / Somitir Hat subzone. You can assign clients to this sub-zone or create new connections on its {selectedZoneClusters.length} active splitter hubs.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setSelectedZone(null);
                          onNavigate?.("add-client");
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary shadow-xs hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        <span>Add Client in {selectedZone.code}</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedZone(null);
                          onNavigate?.("customers");
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer"
                      >
                        View All Customers
                      </button>
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-[11px] text-muted-foreground uppercase font-bold">
                        <th className="pb-2.5 px-3">Client Code</th>
                        <th className="pb-2.5 px-3">Subscriber</th>
                        <th className="pb-2.5 px-3">PPPoE User</th>
                        <th className="pb-2.5 px-3">Splitter / Box</th>
                        <th className="pb-2.5 px-3">Signal</th>
                        <th className="pb-2.5 px-3">Status</th>
                        <th className="pb-2.5 px-3 text-right">Package</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredSelectedCustomers.map((c) => {
                        const isOnline = c.netStatus === "online";
                        return (
                          <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-foreground">{c.clientCode || c.id}</td>
                            <td className="py-2.5 px-3 font-medium text-foreground">
                              <div>{c.name}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">{c.phone}</div>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-primary font-bold">{c.pppUser || c.id}</td>
                            <td className="py-2.5 px-3 text-muted-foreground">{c.box || c.splitterBox || "TJ-01"}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-500">{isOnline ? (c.onuSignal || "—") : "LOS / Offline"}</td>
                            <td className="py-2.5 px-3">
                              {isOnline ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Online
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                                  Offline
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-foreground font-mono">{c.package || "20 Mbps"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-3 px-5 border-t border-border flex items-center justify-between text-xs text-muted-foreground bg-muted/10">
              <span>Coverage area: {selectedZone.name} • {selectedZoneClusters.length} Splitter Hubs</span>
              <button
                onClick={() => setSelectedZone(null)}
                className="px-4 py-1.5 rounded-xl border border-border bg-card hover:bg-muted font-bold text-foreground transition cursor-pointer"
              >
                Close
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
