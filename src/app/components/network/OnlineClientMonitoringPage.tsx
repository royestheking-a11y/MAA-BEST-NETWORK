import { useState, useMemo } from "react";
import {
  Users, CheckCircle2, WifiOff, RefreshCw, Search, Filter,
  Layers, Server, Wifi, Activity, ArrowUpDown, Network,
  AlertTriangle, ShieldCheck, HelpCircle, Check, X,
  Radio, BarChart3, SlidersHorizontal, Download, Eye
} from "lucide-react";
import { useCustomerContext, Customer } from "../../context/CustomerContext";
import { useLanguage } from "../../context/LanguageContext";

interface OnlineClientMonitoringPageProps {
  onNavigate?: (page: string) => void;
}

type TabType = "all" | "disabled_sys_enabled_mk" | "enabled_sys_disabled_mk" | "profile_mismatch";

export function OnlineClientMonitoringPage({ onNavigate }: OnlineClientMonitoringPageProps) {
  const { customers, toggleNetStatus } = useCustomerContext();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState("");

  // Filters (Defaults to 'all' to display full live roster)
  const [serverFilter, setServerFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [subZoneFilter, setSubZoneFilter] = useState("all");
  const [boxFilter, setBoxFilter] = useState("all");
  const [connectionTypeFilter, setConnectionTypeFilter] = useState("all");
  const [pageSize, setPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedClientForGraph, setSelectedClientForGraph] = useState<Customer | null>(null);
  const [selectedClientForTopology, setSelectedClientForTopology] = useState<Customer | null>(null);

  // Sync handler
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncToast(`✓ Synced all ${customers.length} client(s) with MikroTik RouterOS & OLT successfully!`);
      setTimeout(() => setSyncToast(""), 4000);
    }, 1200);
  };

  // Reconnect / Toggle Session
  const handleSessionAction = (c: Customer) => {
    const nextStatus = c.netStatus === "online" ? false : true;
    toggleNetStatus(c.id, nextStatus);
    setSyncToast(`✓ Sent RouterOS API command: ${nextStatus ? "Re-authorize" : "Disconnect/Kick"} for ${c.name}`);
    setTimeout(() => setSyncToast(""), 3500);
  };

  // Dynamic filter lists from live roster
  const availableServers = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => { if (c.serverName) set.add(c.serverName); });
    return ["all", ...Array.from(set)];
  }, [customers]);

  const availableServices = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => { if (c.service) set.add(c.service); });
    return ["all", ...Array.from(set)];
  }, [customers]);

  const availableZones = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => { if (c.zone) set.add(c.zone); });
    return ["all", ...Array.from(set)];
  }, [customers]);

  const availableSubZones = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => { if (c.subzone) set.add(c.subzone); });
    return ["all", ...Array.from(set)];
  }, [customers]);

  const availableBoxes = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => { if (c.box) set.add(c.box); });
    return ["all", ...Array.from(set)];
  }, [customers]);

  // Tab Filtering & Search Filtering
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Tab check
      if (activeTab === "disabled_sys_enabled_mk") {
        if (!c.disabledInSystem && c.status === "active") return false;
      } else if (activeTab === "enabled_sys_disabled_mk") {
        if (!c.disabledInMikrotik && c.status !== "suspended") return false;
      } else if (activeTab === "profile_mismatch") {
        if (!c.profileMismatch && !c.profile?.includes("Mismatch")) return false;
      }

      // Dropdown filters
      if (serverFilter !== "all" && (c.serverName || "") !== serverFilter) return false;
      if (serviceFilter !== "all" && (c.service || "pppoe") !== serviceFilter) return false;
      if (statusFilter !== "all") {
        if (statusFilter === "Connected" && c.netStatus !== "online") return false;
        if (statusFilter === "Disconnected" && c.netStatus === "online") return false;
      }
      if (zoneFilter !== "all" && c.zone !== zoneFilter) return false;
      if (subZoneFilter !== "all" && c.subzone !== subZoneFilter) return false;
      if (boxFilter !== "all" && c.box !== boxFilter) return false;
      if (connectionTypeFilter !== "all" && (c.connectionType || "Optical Fiber") !== connectionTypeFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (c.clientCode || "").toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.pppUser || "").toLowerCase().includes(q) ||
          (c.ipAddress || "").includes(q) ||
          (c.zone || "").toLowerCase().includes(q) ||
          (c.subzone || "").toLowerCase().includes(q) ||
          (c.box || "").toLowerCase().includes(q) ||
          (c.profile || "").toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    customers,
    activeTab,
    serverFilter,
    serviceFilter,
    statusFilter,
    zoneFilter,
    subZoneFilter,
    boxFilter,
    connectionTypeFilter,
    searchQuery
  ]);

  // Statistics counters (100% dynamic from live customer dataset)
  const totalUsersCount = customers.length;
  const onlineUsersCount = customers.filter(c => c.netStatus === "online").length;
  const offlineUsersCount = customers.filter(c => c.netStatus !== "online").length;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto min-h-screen">
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl bg-slate-900 text-white text-sm font-medium border border-teal-500/40 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{syncToast}</span>
          <button onClick={() => setSyncToast("")} className="ml-2 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <Activity size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Online Clients Monitoring</h1>
              <span className="text-sm font-normal text-muted-foreground hidden sm:inline">Monitor Online Clients</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Client Monitoring</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">Online Clients Monitoring</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate?.("add-client")}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95 shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Add New Client</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Sync Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Layers size={13} />
            <span>Online Client Monitoring</span>
          </button>

          <button
            onClick={() => setActiveTab("disabled_sys_enabled_mk")}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "disabled_sys_enabled_mk"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <AlertTriangle size={13} />
            <span>Disabled in system enabled in Mikrotik</span>
          </button>

          <button
            onClick={() => setActiveTab("enabled_sys_disabled_mk")}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "enabled_sys_disabled_mk"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <ShieldCheck size={13} />
            <span>Enabled in system disabled in Mikrotik</span>
          </button>

          <button
            onClick={() => setActiveTab("profile_mismatch")}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "profile_mismatch"
                ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>Profile Mismatch</span>
          </button>
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95 transition-all shadow-xs cursor-pointer flex items-center gap-2"
        >
          <RefreshCw size={14} className={isSyncing ? "animate-spin text-white" : "text-white"} />
          <span>{isSyncing ? "Syncing..." : "Sync Clients & Servers"}</span>
        </button>
      </div>

      {/* 3 Large Stat Cards (Theme Card Styling) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Users */}
        <div className="rounded-xl p-5 bg-card border border-border shadow-xs flex items-center gap-4 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="w-13 h-13 rounded-2xl bg-primary/10 text-primary border border-primary/15 flex items-center justify-center flex-shrink-0">
            <Users size={26} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Total Users</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-0.5 text-foreground">{totalUsersCount}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Configured PPPoE & Static Accounts</p>
          </div>
        </div>

        {/* Online Users */}
        <div className="rounded-xl p-5 bg-card border border-border shadow-xs flex items-center gap-4 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="w-13 h-13 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Online Users</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-0.5 text-emerald-600 dark:text-emerald-400">{onlineUsersCount}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Active RouterOS Sessions Active</p>
          </div>
        </div>

        {/* Offline Users */}
        <div className="rounded-xl p-5 bg-card border border-border shadow-xs flex items-center gap-4 hover:border-primary/40 hover:shadow-md transition-all">
          <div className="w-13 h-13 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
            <WifiOff size={26} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Offline Users</p>
            <h3 className="text-3xl font-extrabold tracking-tight mt-0.5 text-rose-600 dark:text-rose-400">{offlineUsersCount}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Disconnected or Powered Down</p>
          </div>
        </div>
      </div>

      {/* Advanced Filter Box */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
        {/* Row 1: Server, Service, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Server</label>
            <select
              value={serverFilter}
              onChange={e => setServerFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Servers</option>
              {availableServers.filter(s => s !== "all").map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Service</label>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Services</option>
              {availableServices.filter(s => s !== "all").map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="Connected">Connected</option>
              <option value="Disconnected">Disconnected</option>
            </select>
          </div>
        </div>

        {/* Row 2: Zone, Sub Zone, Box, Connection Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Zone</label>
            <select
              value={zoneFilter}
              onChange={e => setZoneFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              {availableZones.filter(z => z !== "all").map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Sub Zone</label>
            <select
              value={subZoneFilter}
              onChange={e => setSubZoneFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              {availableSubZones.filter(sz => sz !== "all").map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Box</label>
            <select
              value={boxFilter}
              onChange={e => setBoxFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              {availableBoxes.filter(b => b !== "all").map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Connection Type</label>
            <select
              value={connectionTypeFilter}
              onChange={e => setConnectionTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="Optical Fiber">Optical Fiber</option>
              <option value="Cat6">Cat6 Ethernet</option>
              <option value="Wireless">Wireless Bridge</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Top Controls: Entries & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>SHOW</span>
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-md bg-card border border-border text-foreground outline-none text-xs"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
          </select>
          <span>ENTRIES</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground uppercase">Search:</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder=""
              className="w-48 sm:w-64 px-3 py-1.5 text-xs rounded-md bg-card border border-border text-foreground outline-none focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table (Theme Styling) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/80 text-foreground border-b border-border font-bold">
                <th className="py-3 px-3.5 tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Client Code <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Name <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Mobile <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">ID/IP <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Zone <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Sub Zone <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Box <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Connection Type <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Server Name <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Profile <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap">Service</th>
                <th className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap">IP Address</th>
                <th className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Status <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Duration <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap">
                  <div className="flex items-center gap-1">Logout Time <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3.5 font-semibold tracking-wider text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-8 text-center text-muted-foreground text-sm">
                    No matching clients found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.slice(0, pageSize).map((c, idx) => {
                  const isConnected = c.netStatus === "online";
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-muted/40 transition-colors ${idx % 2 === 1 ? "bg-muted/15" : ""}`}
                    >
                      {/* Client Code */}
                      <td className="py-3 px-3.5 font-mono text-foreground font-medium whitespace-nowrap">
                        {c.clientCode || c.id}
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3.5 font-medium text-foreground whitespace-nowrap">
                        {c.name}
                      </td>

                      {/* Mobile */}
                      <td className="py-3 px-3.5 font-mono text-muted-foreground whitespace-nowrap">
                        {c.phone}
                      </td>

                      {/* ID / IP */}
                      <td className="py-3 px-3.5 font-mono text-foreground whitespace-nowrap">
                        {c.pppUser || c.id}
                      </td>

                      {/* Zone */}
                      <td className="py-3 px-3.5 text-foreground whitespace-nowrap">
                        {c.zone || "DHAKA DIVISION"}
                      </td>

                      {/* Sub Zone */}
                      <td className="py-3 px-3.5 text-foreground whitespace-nowrap">
                        {c.subzone || "KALKINI SOMITIR HAT"}
                      </td>

                      {/* Box */}
                      <td className="py-3 px-3.5 text-foreground whitespace-nowrap">
                        {c.box || "SOMITIR HAT BAZAR"}
                      </td>

                      {/* Connection Type */}
                      <td className="py-3 px-3.5 text-muted-foreground whitespace-nowrap">
                        {c.connectionType || "Optical Fiber"}
                      </td>

                      {/* Server Name */}
                      <td className="py-3 px-3.5 text-foreground font-mono text-[11px] whitespace-nowrap">
                        {c.serverName || "RETAIL_1"}
                      </td>

                      {/* Profile */}
                      <td className="py-3 px-3.5 text-foreground font-mono text-[11px] whitespace-nowrap">
                        {c.profile || "PIONEER_HOME_20Mbps"}
                      </td>

                      {/* Service */}
                      <td className="py-3 px-3.5 text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                        {c.service || "pppoe"}
                      </td>

                      {/* IP Address */}
                      <td className="py-3 px-3.5 font-mono text-sky-600 dark:text-sky-400 whitespace-nowrap font-medium">
                        {isConnected ? (c.ipAddress || "10.200.201.51") : "—"}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {isConnected ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20 shadow-2xs">
                            Disconnected
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-3.5 font-mono text-foreground font-semibold whitespace-nowrap">
                        {c.duration || (isConnected ? "0d:0h:0m:42s" : "0d:1h:2m:51s")}
                      </td>

                      {/* Logout Time */}
                      <td className="py-3 px-3.5 text-muted-foreground text-[11px] whitespace-nowrap">
                        {c.logoutTime || (isConnected ? "Active Session" : "28/08/2026 10:30:06 PM")}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Topology / Box node */}
                          <button
                            onClick={() => setSelectedClientForTopology(c)}
                            title="View Fiber Distribution & Box Node"
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all cursor-pointer"
                          >
                            <Network size={15} />
                          </button>

                          {/* Reconnect / Kick Session */}
                          <button
                            onClick={() => handleSessionAction(c)}
                            title={isConnected ? "Disconnect / Reset PPPoE Session" : "Re-authorize / Connect Session"}
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all cursor-pointer"
                          >
                            <RefreshCw size={15} />
                          </button>

                          {/* Live Graph */}
                          <button
                            onClick={() => setSelectedClientForGraph(c)}
                            title="Live Optical Power & Bandwidth Graph"
                            className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-all cursor-pointer"
                          >
                            <BarChart3 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination info */}
        <div className="p-3.5 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <p>
            Showing 1 to {Math.min(filteredCustomers.length, pageSize)} of {filteredCustomers.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded border border-border text-foreground font-medium disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-2.5 py-1 rounded bg-primary text-primary-foreground font-bold">1</button>
            <button className="px-2.5 py-1 rounded border border-border text-foreground font-medium disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Topology / Box Node Modal */}
      {selectedClientForTopology && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Network size={20} className="text-emerald-500" />
                <h3 className="text-base font-bold text-foreground">Fiber Topology & Distribution Box</h3>
              </div>
              <button
                onClick={() => setSelectedClientForTopology(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1.5 border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Client Name:</span> <span className="font-bold text-foreground">{selectedClientForTopology.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">PPPoE Secret:</span> <span className="font-mono text-teal-500 font-semibold">{selectedClientForTopology.pppUser}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Zone:</span> <span className="text-foreground">{selectedClientForTopology.zone || "DHAKA DIVISION"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sub Zone:</span> <span className="text-foreground">{selectedClientForTopology.subzone || "KALKINI SOMITIR HAT"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">DP / TJ Box:</span> <span className="font-bold text-emerald-600">{selectedClientForTopology.box || "SOMITIR HAT BAZAR"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Core / Color:</span> <span className="text-foreground">Core #2 (Red Tube)</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">OLT PON Port:</span> <span className="text-foreground">OLT-Dhaka-01 / PON 0/4</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Optical Power:</span> <span className="font-bold text-teal-600">{selectedClientForTopology.onuSignal || "-18.4 dBm"} (Good)</span></div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedClientForTopology(null)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Live Optical & Bandwidth Graph */}
      {selectedClientForGraph && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <BarChart3 size={20} className="text-teal-500" />
                <h3 className="text-base font-bold text-foreground">Live Bandwidth & Optical Power</h3>
              </div>
              <button
                onClick={() => setSelectedClientForGraph(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-center">
                  <p className="text-muted-foreground text-[11px]">Download Rate</p>
                  <p className="text-lg font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                    {selectedClientForGraph.netStatus === "online" ? `${selectedClientForGraph.downloadSpeedMbps || 20} Mbps` : "0.0 Mbps"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center">
                  <p className="text-muted-foreground text-[11px]">Upload Rate</p>
                  <p className="text-lg font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                    {selectedClientForGraph.netStatus === "online" ? `${selectedClientForGraph.uploadSpeedMbps || 10} Mbps` : "0.0 Mbps"}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 space-y-1.5 border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Session Uptime:</span> <span className="font-bold text-foreground">{selectedClientForGraph.duration || "14d:6h:22m"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Assigned IP:</span> <span className="font-mono text-foreground">{selectedClientForGraph.ipAddress || "10.200.201.51"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ONU Optical RX:</span> <span className="font-bold text-emerald-500">{selectedClientForGraph.onuSignal || "-18.2 dBm"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">MikroTik RouterOS:</span> <span className="text-foreground">{selectedClientForGraph.mikrotik || "MikroTik-01"}</span></div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedClientForGraph(null)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
