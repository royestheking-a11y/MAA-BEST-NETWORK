import { useState } from "react";
import {
  Network, Search, Plus, Filter, RefreshCw, CheckCircle2,
  AlertTriangle, Layers, Server, Globe, Cpu, Download,
  Sliders, ArrowDownUp, Check, X, Shield, Eye, Smartphone, Zap
} from "lucide-react";

import { useCustomerContext } from "../../context/CustomerContext";
import { AUTHENTIC_NETX_ONUS } from "../../data/netxOnuData";

interface IpPoolsPageProps {
  onNavigate?: (page: string) => void;
}

interface SubnetPool {
  id: string;
  name: string;
  cidr: string;
  type: "public_static" | "pppoe_cgnat" | "mgmt_vlan" | "hotspot";
  gateway: string;
  vlanId: number;
  zone: string;
  totalIps: number;
  usedIps: number;
  freeIps: number;
  routerName: string;
  status: "active" | "exhausted" | "reserved";
}

interface IpAllocation {
  ip: string;
  status: "assigned" | "available" | "reserved" | "gateway";
  customerName?: string;
  customerId?: string;
  pppoeUser?: string;
  macAddress?: string;
  assignedDate?: string;
}

const INITIAL_SUBNETS: SubnetPool[] = [
  {
    id: "SUB-01",
    name: "MBN Core Public BGP Subnet",
    cidr: "103.12.173.128/26",
    type: "public_static",
    gateway: "103.12.173.129",
    vlanId: 100,
    zone: "Core Infrastructure",
    totalIps: 64,
    usedIps: 18,
    freeIps: 46,
    routerName: "MikroTik-MBN-Core",
    status: "active"
  },
  {
    id: "SUB-02",
    name: "PPPoE CGNAT Subscriber Pool (Madaripur)",
    cidr: "100.64.10.0/22",
    type: "pppoe_cgnat",
    gateway: "100.64.10.1",
    vlanId: 201,
    zone: "Madaripur Sadar",
    totalIps: 1024,
    usedIps: 191,
    freeIps: 833,
    routerName: "MikroTik-MBN-Core",
    status: "active"
  },
  {
    id: "SUB-03",
    name: "BDCOM OLT & Switch Management VLAN",
    cidr: "172.16.50.0/24",
    type: "mgmt_vlan",
    gateway: "172.16.50.1",
    vlanId: 500,
    zone: "NOC & POP Infrastructure",
    totalIps: 256,
    usedIps: 24,
    freeIps: 232,
    routerName: "MikroTik-MBN-Core",
    status: "active"
  },
  {
    id: "SUB-04",
    name: "Kalkini Distribution Hub Pool",
    cidr: "100.64.20.0/23",
    type: "pppoe_cgnat",
    gateway: "100.64.20.1",
    vlanId: 202,
    zone: "Kalkini Station",
    totalIps: 512,
    usedIps: 104,
    freeIps: 408,
    routerName: "MikroTik-MBN-Core",
    status: "active"
  }
];

export function IpPoolsPage({ onNavigate }: IpPoolsPageProps) {
  const { customers } = useCustomerContext();
  const [subnets, setSubnets] = useState<SubnetPool[]>(INITIAL_SUBNETS);
  const [selectedSubnet, setSelectedSubnet] = useState<SubnetPool | null>(INITIAL_SUBNETS[1]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showAddSubnet, setShowAddSubnet] = useState(false);
  const [toast, setToast] = useState("");

  // Subnet form
  const [newSub, setNewSub] = useState({
    name: "",
    cidr: "100.64.30.0/24",
    type: "pppoe_cgnat" as SubnetPool["type"],
    gateway: "100.64.30.1",
    vlanId: "250",
    zone: "Madaripur Sadar",
    routerName: "MikroTik-MBN-Core"
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleAddSubnet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.name || !newSub.cidr) return;

    const total = newSub.cidr.endsWith("/24") ? 256 : newSub.cidr.endsWith("/22") ? 1024 : newSub.cidr.endsWith("/26") ? 64 : 128;
    const subnet: SubnetPool = {
      id: `SUB-${(subnets.length + 1).toString().padStart(2, "0")}`,
      name: newSub.name,
      cidr: newSub.cidr,
      type: newSub.type,
      gateway: newSub.gateway,
      vlanId: Number(newSub.vlanId),
      zone: newSub.zone,
      totalIps: total,
      usedIps: 0,
      freeIps: total - 3,
      routerName: newSub.routerName,
      status: "active"
    };

    setSubnets([...subnets, subnet]);
    setSelectedSubnet(subnet);
    setShowAddSubnet(false);
    showToast(`✓ Subnet ${subnet.cidr} (${subnet.name}) created and assigned to VLAN ${subnet.vlanId}!`);
    setNewSub({ name: "", cidr: "100.64.30.0/24", type: "pppoe_cgnat", gateway: "100.64.30.1", vlanId: "250", zone: "Madaripur Sadar", routerName: "MikroTik-MBN-Core" });
  };

  const filteredSubnets = subnets.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.name.toLowerCase().includes(q) || s.cidr.includes(q) || s.zone.toLowerCase().includes(q);
    const matchType = typeFilter === "all" || s.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPublicIps = subnets.filter(s => s.type === "public_static").reduce((a, b) => a + b.totalIps, 0);
  const usedPublicIps = subnets.filter(s => s.type === "public_static").reduce((a, b) => a + b.usedIps, 0);
  const totalCgnatIps = subnets.filter(s => s.type === "pppoe_cgnat").reduce((a, b) => a + b.totalIps, 0);
  const usedCgnatIps = subnets.filter(s => s.type === "pppoe_cgnat").reduce((a, b) => a + b.usedIps, 0);

  // Real IP grid generator for selected subnet
  const sampleIpAllocations: IpAllocation[] = useMemo(() => {
    if (!selectedSubnet) return [];

    const basePrefix = selectedSubnet.cidr.split('/')[0].split('.').slice(0, 3).join('.');
    const allocs: IpAllocation[] = [];

    // Gateway
    allocs.push({
      ip: selectedSubnet.gateway,
      status: "gateway",
    });

    const isCgnat = selectedSubnet.type === "pppoe_cgnat";

    AUTHENTIC_NETX_ONUS.slice(0, 60).forEach((o, i) => {
      const isAssigned = o.customer !== "— Unassigned —";
      allocs.push({
        ip: `${basePrefix}.${i + 2}`,
        status: isAssigned ? "assigned" : "available",
        customerName: isAssigned ? o.customer : undefined,
        customerId: isAssigned ? `MBN-${(i + 1).toString().padStart(4, '0')}` : undefined,
        pppoeUser: isAssigned ? o.customer : undefined,
        macAddress: o.mac,
        assignedDate: isAssigned ? "Active Live" : undefined,
      });
    });

    return allocs;
  }, [selectedSubnet, customers]);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-3xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Network size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-foreground">
                IPAM, Subnet Pools & VLAN Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {subnets.length} Active Subnets · {totalPublicIps} Public IPv4
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Carrier-grade IPv4/IPv6 address planning, CGNAT subnets, VLAN segment routing & IP address pool allocation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddSubnet(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-primary hover:opacity-95 text-xs font-bold text-white shadow-xs cursor-pointer">
          <Plus size={14} />
          <span>Add IP Subnet / Pool</span>
        </button>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">Public IPv4 Allocation</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {usedPublicIps} / {totalPublicIps}
          </p>
          <p className="text-[11px] text-muted-foreground">{Math.round((usedPublicIps / (totalPublicIps || 1)) * 100)}% Public Pool Utilized</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">CGNAT PPPoE Subnets</span>
          <p className="text-2xl font-black text-primary mt-1">
            {usedCgnatIps} / {totalCgnatIps}
          </p>
          <p className="text-[11px] text-muted-foreground">Carrier-Grade RFC 6598 Space</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">Configured VLANs</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {subnets.length} Segments
          </p>
          <p className="text-[11px] text-muted-foreground">Mirpur, Uttara, Gulshan & Dhanmondi</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">Free IP Addresses</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {subnets.reduce((a, b) => a + b.freeIps, 0).toLocaleString()} IPs
          </p>
          <p className="text-[11px] text-muted-foreground">Ready for new subscriber activations</p>
        </div>
      </div>

      {/* ── Main Layout: Subnet List & IP Grid Explorer ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Subnets */}
        <div className="bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-foreground">Subnet Pools</h3>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-2.5 py-1 rounded-xl border border-border bg-muted/40 text-[11px] font-bold text-foreground outline-none cursor-pointer">
              <option value="all">All Types</option>
              <option value="public_static">Public Static</option>
              <option value="pppoe_cgnat">PPPoE CGNAT</option>
              <option value="mgmt_vlan">Management</option>
            </select>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto">
            {filteredSubnets.map(sub => {
              const isSelected = selectedSubnet?.id === sub.id;
              const utilPct = Math.round((sub.usedIps / sub.totalIps) * 100);
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubnet(sub)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary shadow-xs"
                      : "bg-muted/30 border-border hover:bg-muted/60"
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-black text-foreground">{sub.cidr}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-card border border-border text-muted-foreground">
                      VLAN {sub.vlanId}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-foreground truncate">{sub.name}</p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                    <span>{sub.zone} ({sub.routerName})</span>
                    <span className="font-mono font-bold text-foreground">{sub.usedIps}/{sub.totalIps} ({utilPct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${utilPct > 85 ? "bg-rose-500" : "bg-emerald-500"}`}
                      style={{ width: `${utilPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Subnet IP Allocations */}
        <div className="lg:col-span-2 bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs space-y-4 flex flex-col justify-between">
          {selectedSubnet ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-foreground">{selectedSubnet.cidr}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/20">
                      VLAN {selectedSubnet.vlanId}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Gateway: <strong className="text-foreground font-mono">{selectedSubnet.gateway}</strong> · Router: <strong className="text-foreground">{selectedSubnet.routerName}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast(`Synchronized IP address pool '${selectedSubnet.cidr}' on ${selectedSubnet.routerName}`)}
                    className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1 cursor-pointer">
                    <RefreshCw size={13} /> Sync RouterOS Pool
                  </button>
                </div>
              </div>

              {/* IP Allocations Table */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground">Framed IP Allocation Breakdown</span>
                  <span className="text-[11px] text-muted-foreground">Class C /24 IPv4 Block</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">Subscriber / PPPoE User</th>
                        <th className="p-3">MAC / Caller ID</th>
                        <th className="p-3">Assignment Date</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sampleIpAllocations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground text-xs">
                            No IP lease records in this pool yet.
                          </td>
                        </tr>
                      ) : (
                        sampleIpAllocations.map((alloc, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="p-3 font-mono font-bold text-foreground">
                              {alloc.ip}
                            </td>
                            <td className="p-3">
                              {alloc.customerName ? (
                                <div>
                                  <div className="font-bold text-foreground">{alloc.customerName}</div>
                                  <div className="text-[10px] text-muted-foreground font-mono">{alloc.pppoeUser} ({alloc.customerId})</div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">—</span>
                              )}
                            </td>
                            <td className="p-3 font-mono text-muted-foreground text-[11px]">
                              {alloc.macAddress || "—"}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {alloc.assignedDate || "—"}
                            </td>
                            <td className="p-3 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                alloc.status === "assigned" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                                alloc.status === "available" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" :
                                alloc.status === "gateway" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {alloc.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Network size={36} className="opacity-30 text-primary" />
              <p className="font-bold text-foreground text-sm">No IP Subnet Selected</p>
              <p>Create a new IP pool or select one from the left to view lease allocations.</p>
            </div>
          )}

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Automatic IP recycling enabled for disconnected accounts after 7 days.</span>
            <span className="font-bold text-foreground">MAA BEST NETWORK IPAM Core</span>
          </div>
        </div>
      </div>

      {/* ── ADD SUBNET MODAL ─────────────────────────────────────────────────── */}
      {showAddSubnet && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl bg-card border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Network size={18} className="text-primary" />
                <h3 className="font-black text-base text-foreground">
                  Create IP Subnet / Pool
                </h3>
              </div>
              <button onClick={() => setShowAddSubnet(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubnet} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">POOL NAME</label>
                <input
                  required
                  value={newSub.name}
                  onChange={e => setNewSub({ ...newSub, name: e.target.value })}
                  placeholder="e.g. Dhanmondi POP Dynamic CGNAT"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">SUBNET (CIDR)</label>
                  <input
                    required
                    value={newSub.cidr}
                    onChange={e => setNewSub({ ...newSub, cidr: e.target.value })}
                    placeholder="100.64.30.0/24"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">DEFAULT GATEWAY</label>
                  <input
                    required
                    value={newSub.gateway}
                    onChange={e => setNewSub({ ...newSub, gateway: e.target.value })}
                    placeholder="100.64.30.1"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">VLAN ID</label>
                  <input
                    type="number"
                    value={newSub.vlanId}
                    onChange={e => setNewSub({ ...newSub, vlanId: e.target.value })}
                    placeholder="250"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">POOL TYPE</label>
                  <select
                    value={newSub.type}
                    onChange={e => setNewSub({ ...newSub, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option value="pppoe_cgnat">PPPoE CGNAT</option>
                    <option value="public_static">Public Static IPv4</option>
                    <option value="mgmt_vlan">Management VLAN</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">ROUTER</label>
                  <select
                    value={newSub.routerName}
                    onChange={e => setNewSub({ ...newSub, routerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option value="MikroTik-01">MikroTik-01 (Mirpur)</option>
                    <option value="MikroTik-02">MikroTik-02 (Uttara)</option>
                    <option value="MikroTik-03">MikroTik-03 (Gulshan)</option>
                    <option value="MikroTik-04">MikroTik-04 (Dhanmondi)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">ZONE</label>
                  <input
                    value={newSub.zone}
                    onChange={e => setNewSub({ ...newSub, zone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubnet(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-primary hover:opacity-95 text-white font-bold cursor-pointer">
                  Add Subnet Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-[#130606] text-white text-xs font-semibold animate-slideUp"
        >
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 hover:opacity-75 cursor-pointer">
            <X size={14} className="text-white/60" />
          </button>
        </div>
      )}
    </div>
  );
}
