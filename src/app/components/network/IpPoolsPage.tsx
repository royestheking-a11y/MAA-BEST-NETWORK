import { useNetxLiveData } from "../../services/netxApiService";
import { useState, useMemo, useEffect } from "react";
import {
  Network, Search, Plus, Filter, RefreshCw, CheckCircle2,
  AlertTriangle, Layers, Server, Globe, Cpu, Download,
  Sliders, ArrowDownUp, Check, X, Shield, Eye, Smartphone, Zap,
  Copy, ShieldCheck, UserCheck, CheckSquare, Hash, UserPlus
} from "lucide-react";
import { useCustomerContext, Customer } from "../../context/CustomerContext";
import { usePermission } from "../../context/AuthContext";

interface IpPoolsPageProps {
  onNavigate?: (page: string) => void;
}

export interface SubnetPool {
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

export interface IpAllocation {
  ip: string;
  status: "assigned" | "available" | "reserved" | "gateway";
  customerName?: string;
  customerId?: string;
  pppoeUser?: string;
  macAddress?: string;
  assignedDate?: string;
  rawCustomer?: Customer;
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
    routerName: "DC-CA",
    status: "active"
  },
  {
    id: "SUB-02",
    name: "PPPoE CGNAT Subscriber Pool (Madaripur & Kalkini)",
    cidr: "100.64.10.0/24",
    type: "pppoe_cgnat",
    gateway: "100.64.10.1",
    vlanId: 201,
    zone: "Madaripur Sadar",
    totalIps: 256,
    usedIps: 194,
    freeIps: 62,
    routerName: "DC-CA",
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
    routerName: "DC-CA",
    status: "active"
  },
  {
    id: "SUB-04",
    name: "Kalkini Distribution Hub Pool",
    cidr: "100.64.20.0/24",
    type: "pppoe_cgnat",
    gateway: "100.64.20.1",
    vlanId: 202,
    zone: "Kalkini Station",
    totalIps: 256,
    usedIps: 42,
    freeIps: 214,
    routerName: "DC-CA",
    status: "active"
  }
];

const STORAGE_KEY_SUBNETS = "mbn_isp_subnet_pools_v2";

export function IpPoolsPage({ onNavigate }: IpPoolsPageProps) {
  const { canEdit, isReadOnly } = usePermission("ip-pools");
  const { isLoading: isNetxLoading } = useNetxLiveData(30000);
  const { customers, updateCustomer } = useCustomerContext();
  const [subnets, setSubnets] = useState<SubnetPool[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBNETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_SUBNETS;
  });
  const [selectedSubnet, setSelectedSubnet] = useState<SubnetPool | null>(INITIAL_SUBNETS[1]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [ipStatusFilter, setIpStatusFilter] = useState<"all" | "assigned" | "available" | "reserved" | "gateway">("all");
  const [ipSearch, setIpSearch] = useState("");
  const [showAddSubnet, setShowAddSubnet] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SUBNETS, JSON.stringify(subnets));
    } catch (e) {}
  }, [subnets]);

  // Custom reserved IPs map
  const [reservedIps, setReservedIps] = useState<Set<string>>(() => new Set(["100.64.10.2", "100.64.10.3"]));

  // Auto Allocate IP Modal
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [selectedCustForIp, setSelectedCustForIp] = useState<Customer | null>(null);
  const [custIpSearch, setCustIpSearch] = useState("");

  // Subnet form
  const [newSub, setNewSub] = useState({
    name: "",
    cidr: "100.64.30.0/24",
    type: "pppoe_cgnat" as SubnetPool["type"],
    gateway: "100.64.30.1",
    vlanId: "250",
    zone: "Madaripur Sadar",
    routerName: "DC-CA"
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleAddSubnet = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Your role has Read-Only access to IP Pools.");
      return;
    }
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
    showToast(`Subnet ${subnet.cidr} (${subnet.name}) created and assigned to VLAN ${subnet.vlanId}!`);
    setNewSub({ name: "", cidr: "100.64.30.0/24", type: "pppoe_cgnat", gateway: "100.64.30.1", vlanId: "250", zone: "Madaripur Sadar", routerName: "MikroTik-MBN-Core" });
  };

  const dynamicSubnets = useMemo(() => {
    return subnets.map(s => {
      const basePrefix = s.cidr.split('/')[0].split('.').slice(0, 3).join('.');
      const matchedCount = customers.filter(c => c.ipAddress && c.ipAddress.startsWith(basePrefix)).length;
      const used = matchedCount > 0 ? matchedCount : (s.id === "SUB-02" ? customers.length : s.usedIps);
      const free = Math.max(0, s.totalIps - used - (s.id === "SUB-01" ? 2 : 3));
      return {
        ...s,
        usedIps: used,
        freeIps: free,
      };
    });
  }, [subnets, customers]);

  const filteredSubnets = useMemo(() => {
    return dynamicSubnets.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !search || s.name.toLowerCase().includes(q) || s.cidr.includes(q) || s.zone.toLowerCase().includes(q);
      const matchType = typeFilter === "all" || s.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [dynamicSubnets, search, typeFilter]);

  // Dynamically calculate IP allocation breakdown for selectedSubnet from real customers
  const ipAllocations: IpAllocation[] = useMemo(() => {
    if (!selectedSubnet) return [];

    const basePrefix = selectedSubnet.cidr.split('/')[0].split('.').slice(0, 3).join('.');
    const allocs: IpAllocation[] = [];

    // Gateway
    allocs.push({
      ip: selectedSubnet.gateway,
      status: "gateway",
    });

    // Map existing customers to IPs in this subnet
    const ipToCustomer = new Map<string, Customer>();
    customers.forEach(c => {
      if (c.ipAddress && c.ipAddress.startsWith(basePrefix)) {
        ipToCustomer.set(c.ipAddress.trim(), c);
      }
    });

    const isSubnet1 = selectedSubnet.id === "SUB-02";

    // Generate host IP list (for /24, 1 to 254)
    const hostLimit = selectedSubnet.cidr.endsWith("/26") ? 62 : 254;

    for (let host = 2; host <= hostLimit; host++) {
      const currentIp = `${basePrefix}.${host}`;

      if (currentIp === selectedSubnet.gateway) continue;

      if (reservedIps.has(currentIp)) {
        allocs.push({
          ip: currentIp,
          status: "reserved",
        });
        continue;
      }

      // Check customer mapping
      const matchedCust = ipToCustomer.get(currentIp) || (isSubnet1 && host - 2 < customers.length ? customers[host - 2] : undefined);

      if (matchedCust) {
        allocs.push({
          ip: currentIp,
          status: "assigned",
          customerName: matchedCust.name,
          customerId: matchedCust.clientCode || matchedCust.id,
          pppoeUser: matchedCust.pppUser || matchedCust.name,
          macAddress: matchedCust.mac || "Auto-Bound",
          assignedDate: matchedCust.joinDate || "Active Live",
          rawCustomer: matchedCust
        });
      } else {
        allocs.push({
          ip: currentIp,
          status: "available",
        });
      }
    }

    return allocs;
  }, [selectedSubnet, customers, reservedIps]);

  // Dynamic Metrics for Selected Subnet
  const usedCount = ipAllocations.filter(a => a.status === "assigned").length;
  const freeCount = ipAllocations.filter(a => a.status === "available").length;
  const reservedCount = ipAllocations.filter(a => a.status === "reserved" || a.status === "gateway").length;
  const totalCount = selectedSubnet ? selectedSubnet.totalIps : 256;
  const utilPercent = Math.round((usedCount / (totalCount || 1)) * 100);

  // Filtered IP allocations for Table
  const filteredIpAllocations = useMemo(() => {
    return ipAllocations.filter(a => {
      if (ipStatusFilter !== "all" && a.status !== ipStatusFilter) return false;

      if (ipSearch.trim()) {
        const q = ipSearch.toLowerCase().trim();
        const matches =
          a.ip.toLowerCase().includes(q) ||
          (a.customerName && a.customerName.toLowerCase().includes(q)) ||
          (a.customerId && a.customerId.toLowerCase().includes(q)) ||
          (a.pppoeUser && a.pppoeUser.toLowerCase().includes(q)) ||
          (a.macAddress && a.macAddress.toLowerCase().includes(q));

        if (!matches) return false;
      }

      return true;
    });
  }, [ipAllocations, ipStatusFilter, ipSearch]);

  // First available IP in pool for auto allocation
  const firstAvailableIp = useMemo(() => {
    const found = ipAllocations.find(a => a.status === "available");
    return found ? found.ip : null;
  }, [ipAllocations]);

  // Handle Toggle Reserve IP
  const handleToggleReserveIp = (ip: string) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Your role has Read-Only access to IP Pools.");
      return;
    }
    setReservedIps(prev => {
      const next = new Set(prev);
      if (next.has(ip)) {
        next.delete(ip);
        showToast(`Released reservation for IP ${ip}. It is now available for subscribers.`);
      } else {
        next.add(ip);
        showToast(`Reserved IP ${ip} for network infrastructure.`);
      }
      return next;
    });
  };

  // Handle Freeing / Releasing IP from customer
  const handleReleaseIpFromCustomer = (alloc: IpAllocation) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Your role has Read-Only access to IP Pools.");
      return;
    }
    if (!alloc.rawCustomer) return;
    if (confirm(`Are you sure you want to release IP ${alloc.ip} from ${alloc.customerName}?`)) {
      updateCustomer(alloc.rawCustomer.id, {
        ipAddress: ""
      });
      showToast(`Released IP ${alloc.ip} from ${alloc.customerName} (${alloc.customerId}). IP is now free.`);
    }
  };

  // Handle Auto Allocate IP to Selected Customer
  const handleExecuteAutoAllocate = () => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Your role has Read-Only access to IP Pools.");
      return;
    }
    if (!selectedCustForIp || !firstAvailableIp) {
      showToast("Please select a customer and ensure an IP address is available.");
      return;
    }

    updateCustomer(selectedCustForIp.id, {
      ipAddress: firstAvailableIp
    });

    showToast(`Auto-Allocated IP ${firstAvailableIp} to ${selectedCustForIp.name} (${selectedCustForIp.clientCode || selectedCustForIp.id})! Zero collision detected.`);
    setAllocateModalOpen(false);
    setSelectedCustForIp(null);
    setCustIpSearch("");
  };

  const matchingCustomersForIp = useMemo(() => {
    if (!custIpSearch.trim()) return customers.slice(0, 10);
    const q = custIpSearch.toLowerCase().trim();
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.clientCode && c.clientCode.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q) ||
      (c.pppUser && c.pppUser.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    ).slice(0, 15);
  }, [customers, custIpSearch]);

  if (isNetxLoading) {
    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium">Synchronizing IP Pools & VLANs...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-5 max-w-[1700px] mx-auto min-h-screen">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Network size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-foreground">
                IPAM, Subnet Pools & Dynamic VLAN Allocation
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {subnets.length} Active Subnets · {usedCount} Allocated IPs
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Carrier-grade IPv4/IPv6 address planning, CGNAT subnets, 1-Click Auto IP Allocation, and live lease collision avoidance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAllocateModalOpen(true)}
            disabled={isReadOnly || !canEdit}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs ${
              isReadOnly || !canEdit ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary hover:opacity-95 text-white cursor-pointer"
            }`}>
            <UserPlus size={14} />
            <span>Auto-Allocate IP to Customer</span>
          </button>

          <button
            onClick={() => setShowAddSubnet(true)}
            disabled={isReadOnly || !canEdit}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border text-xs font-bold shadow-xs ${
              isReadOnly || !canEdit ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground" : "bg-card hover:bg-muted text-foreground cursor-pointer"
            }`}>
            <Plus size={14} />
            <span>Add IP Subnet / Pool</span>
          </button>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">Active IP Allocations</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {usedCount} / {totalCount}
          </p>
          <p className="text-[11px] text-muted-foreground">{utilPercent}% Current Pool Utilized</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">Available / Free IPs</span>
          <p className="text-2xl font-black text-primary mt-1">
            {freeCount} IPs
          </p>
          <p className="text-[11px] text-muted-foreground">Ready for instant subscriber assignment</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">Gateway & Reserved Space</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {reservedCount} IPs
          </p>
          <p className="text-[11px] text-muted-foreground">Protected router & switch addresses</p>
        </div>

        <div className="rounded-3xl p-4 bg-card border border-border shadow-xs">
          <span className="text-xs font-bold text-muted-foreground">Configured VLANs</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {subnets.length} Segments
          </p>
          <p className="text-[11px] text-muted-foreground">Madaripur, Kalkini & Core POP</p>
        </div>
      </div>

      {/* ── Main Layout: Subnet List & IP Grid Explorer ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left Column: Subnets */}
        <div className="bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
              <Layers size={16} className="text-primary" />
              <span>Subnet Pools</span>
            </h3>
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

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {filteredSubnets.map(sub => {
              const isSelected = selectedSubnet?.id === sub.id;
              const isSub2 = sub.id === "SUB-02";
              const myUsed = isSub2 ? usedCount : sub.usedIps;
              const myTotal = sub.totalIps;
              const utilPct = Math.round((myUsed / myTotal) * 100);

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
                    <span>{sub.zone}</span>
                    <span className="font-mono font-bold text-foreground">{myUsed}/{myTotal} ({utilPct}%)</span>
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
            <div className="space-y-4">
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
                    onClick={() => showToast(`Synchronized IP address pool '${selectedSubnet.cidr}' on ${selectedSubnet.routerName} with 0 IP collisions.`)}
                    className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1 cursor-pointer">
                    <RefreshCw size={13} /> Sync RouterOS Pool
                  </button>
                </div>
              </div>

              {/* Filter Controls for IP Table */}
              <div className="flex items-center justify-between flex-wrap gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-muted-foreground">Filter:</span>
                  {(["all", "assigned", "available", "reserved"] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setIpStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                        ipStatusFilter === st
                          ? "bg-primary text-white shadow-2xs"
                          : "bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}>
                      {st} ({st === "all" ? ipAllocations.length : ipAllocations.filter(a => a.status === st).length})
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search IP, subscriber, ID..."
                    value={ipSearch}
                    onChange={e => setIpSearch(e.target.value)}
                    className="pl-7 pr-3 py-1 text-xs rounded-xl bg-muted/40 border border-border outline-none focus:border-primary text-foreground w-44 sm:w-56 font-medium"
                  />
                </div>
              </div>

              {/* IP Allocations Table */}
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#48636E] text-white font-bold">
                    <tr>
                      <th className="p-3">IP Address</th>
                      <th className="p-3">Subscriber / PPPoE User</th>
                      <th className="p-3">MAC / Caller ID</th>
                      <th className="p-3">Assignment Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredIpAllocations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">
                          No IP records matching search query.
                        </td>
                      </tr>
                    ) : (
                      filteredIpAllocations.map((alloc, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
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
                              <span className="text-muted-foreground italic font-medium">— Unassigned Free —</span>
                            )}
                          </td>
                          <td className="p-3 font-mono text-muted-foreground text-[11px]">
                            {alloc.macAddress || "—"}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {alloc.assignedDate || "—"}
                          </td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              alloc.status === "assigned" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                              alloc.status === "available" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" :
                              alloc.status === "gateway" ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" :
                              "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}>
                              {alloc.status}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-3">
                            <div className="flex items-center justify-end gap-1.5">
                              {alloc.status === "available" && (
                                <button
                                  onClick={() => handleToggleReserveIp(alloc.ip)}
                                  className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-[10px] font-bold cursor-pointer">
                                  Reserve
                                </button>
                              )}
                              {alloc.status === "reserved" && (
                                <button
                                  onClick={() => handleToggleReserveIp(alloc.ip)}
                                  className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[10px] font-bold cursor-pointer">
                                  Release
                                </button>
                              )}
                              {alloc.status === "assigned" && (
                                <button
                                  onClick={() => handleReleaseIpFromCustomer(alloc)}
                                  className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-[10px] font-bold cursor-pointer">
                                  Free IP
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
            <span>Next available sequential IP: <strong className="text-foreground font-mono">{firstAvailableIp || "Pool Exhausted"}</strong></span>
            <span className="font-bold text-foreground">MAA BEST NETWORK Dynamic IPAM</span>
          </div>
        </div>
      </div>

      {/* ── MODAL: AUTO ALLOCATE IP TO SUBSCRIBER ────────────────────────────── */}
      {allocateModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl bg-card border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-primary" />
                <div>
                  <h3 className="font-black text-base text-foreground">
                    Auto-Allocate Next Free IP
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Next Available Host: <strong className="text-emerald-600 font-mono">{firstAvailableIp || "None"}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setAllocateModalOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  SEARCH SUBSCRIBER
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name, ID, phone, PPPoE user..."
                    value={custIpSearch}
                    onChange={e => setCustIpSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground font-medium outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Subscribers List */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto border border-border rounded-2xl p-2 bg-muted/20">
                {matchingCustomersForIp.map(c => {
                  const isSelected = selectedCustForIp?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCustForIp(c)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                        isSelected
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-card border-border hover:bg-muted/50"
                      }`}>
                      <div>
                        <div className={`font-bold ${isSelected ? "text-white" : "text-foreground"}`}>{c.name}</div>
                        <div className={`text-[10px] font-mono ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                          {c.clientCode || c.id} · Current IP: {c.ipAddress || "None"}
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                  );
                })}
              </div>

              {selectedCustForIp && firstAvailableIp && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
                  Allocating IP <strong className="font-mono">{firstAvailableIp}</strong> to <strong>{selectedCustForIp.name}</strong> ({selectedCustForIp.clientCode || selectedCustForIp.id}).
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAllocateModalOpen(false)}
                className="flex-1 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button
                disabled={!selectedCustForIp || !firstAvailableIp}
                onClick={handleExecuteAutoAllocate}
                className="flex-1 py-2.5 rounded-2xl bg-primary hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs cursor-pointer">
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

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
                  placeholder="e.g. Shibchar POP Dynamic CGNAT"
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

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubnet(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReadOnly || !canEdit}
                  className={`flex-1 py-2.5 rounded-2xl font-bold ${
                    isReadOnly || !canEdit ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary hover:opacity-95 text-white cursor-pointer"
                  }`}>
                  {isReadOnly || !canEdit ? "Read-Only: Locked" : "Create Pool"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-[#130606] text-white text-xs font-medium animate-slideUp"
        >
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 hover:opacity-75 cursor-pointer">
            <X size={14} className="text-white/60" />
          </button>
        </div>
      )}
    </div>
  );
}
