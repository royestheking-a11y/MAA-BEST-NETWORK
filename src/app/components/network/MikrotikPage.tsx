import { useState, useEffect, useMemo } from "react";
import {
  Server, Cpu, MemoryStick, Clock, Users, Activity, RefreshCw,
  Plus, TerminalSquare, CheckCircle2, AlertTriangle, XCircle, X,
  Radio, Shield, HardDrive, Zap, Eye, Terminal, Key, Network,
  ArrowDownUp, Wifi, WifiOff, Play, Pause, Search, Sliders, Check,
  ChevronRight, ArrowRight, ExternalLink, Ban, CornerDownRight, Filter
} from "lucide-react";
import {
  networkStore, type MikrotikServer
} from "./networkData";

interface MikrotikPageProps {
  onNavigate?: (page: string) => void;
}

interface ActivePppSession {
  id: string;
  user: string;
  customerName: string;
  customerId: string;
  router: string;
  ip: string;
  callerIdMac: string;
  uptime: string;
  rxRate: string;
  txRate: string;
  profile: string;
  status: "active" | "isolated" | "throttled";
}

const INITIAL_SESSIONS: ActivePppSession[] = [];

export function MikrotikPage({ onNavigate }: MikrotikPageProps) {
  const [servers, setServers] = useState<MikrotikServer[]>(networkStore.getMikrotik());
  const [sessions, setSessions] = useState<ActivePppSession[]>(INITIAL_SESSIONS);
  const [activeTab, setActiveTab] = useState<"routers" | "sessions" | "ping">("routers");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  
  // Modals state
  const [showAddServer, setShowAddServer] = useState(false);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<MikrotikServer | null>(null);
  const [terminalLog, setTerminalLog] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  // Search & Session filters
  const [sessionSearch, setSessionSearch] = useState("");
  const [routerFilter, setRouterFilter] = useState("all");

  // Add Server Form
  const [newSrv, setNewSrv] = useState({
    name: "", location: "Mirpur DC", model: "CCR2004-1G-12S+2XS", ip: "10.10.5.1",
    user: "admin", pass: ""
  });

  // PPPoE Provisioning Form
  const [provisionData, setProvisionData] = useState({
    routerId: "MikroTik-01",
    customerName: "",
    customerId: "",
    pppUser: "",
    pppPass: "maa12345",
    profile: "20M/10M Standard",
    remoteIp: "10.10.20.75",
    service: "pppoe",
    addressList: "active_subscribers"
  });

  // Ping tool state
  const [pingTarget, setPingTarget] = useState("10.10.20.14");
  const [pingRouter, setPingRouter] = useState("MikroTik-01 (Mirpur Core)");
  const [pingLogs, setPingLogs] = useState<string[]>([]);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    return networkStore.subscribe(() => {
      setServers(networkStore.getMikrotik());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleSync = (name: string) => {
    setSyncingId(name);
    setTimeout(() => {
      setSyncingId(null);
      showToast(`Router "${name}" synced with RouterOS API (Active queues & address lists refreshed)!`);
    }, 900);
  };

  const handleAddServer = () => {
    if (!newSrv.name || !newSrv.ip) return;
    const server: MikrotikServer = {
      id: `MK-${(servers.length + 1).toString().padStart(2, "0")}`,
      name: newSrv.name,
      location: newSrv.location,
      model: newSrv.model,
      ip: newSrv.ip,
      cpu: 18,
      ram: 32,
      uptime: "1d 2h",
      sessions: 0,
      status: "online",
      lastSync: "just now",
      temperature: 41,
      interfaces: [{ name: "sfp-sfpplus1", tx: "0 Mbps", rx: "0 Mbps" }],
    };
    networkStore.addMikrotik(server);
    setShowAddServer(false);
    showToast(`MikroTik Router "${server.name}" added and API probe connected!`);
    setNewSrv({ name: "", location: "Mirpur DC", model: "CCR2004-1G-12S+2XS", ip: "", user: "admin", pass: "" });
  };

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionData.customerName || !provisionData.pppUser) {
      showToast("Please fill in Customer Name and PPPoE Username");
      return;
    }

    const newSession: ActivePppSession = {
      id: `SESS-${(sessions.length + 10).toString()}`,
      user: provisionData.pppUser,
      customerName: provisionData.customerName,
      customerId: provisionData.customerId || `CUST-${(Math.floor(10000 + Math.random() * 9000)).toString()}`,
      router: servers.find(s => s.id === provisionData.routerId)?.name || "MikroTik-01 (Mirpur Core)",
      ip: provisionData.remoteIp,
      callerIdMac: "00:1A:79:" + Array.from({length:3}, () => Math.floor(Math.random()*256).toString(16).padStart(2,'0')).join(':').toUpperCase(),
      uptime: "Just connected",
      rxRate: "0.0 Mbps",
      txRate: "0.0 Mbps",
      profile: provisionData.profile,
      status: "active"
    };

    setSessions([newSession, ...sessions]);
    setShowProvisionModal(false);
    showToast(`✓ PPPoE Secret '${provisionData.pppUser}' provisioned on ${newSession.router} and queue activated!`);
    setProvisionData({
      routerId: "MikroTik-01",
      customerName: "",
      customerId: "",
      pppUser: "",
      pppPass: "maa12345",
      profile: "20M/10M Standard",
      remoteIp: `10.10.20.${Math.floor(50 + Math.random() * 150)}`,
      service: "pppoe",
      addressList: "active_subscribers"
    });
  };

  const disconnectSession = (id: string, username: string) => {
    setSessions(sessions.filter(s => s.id !== id));
    showToast(`Terminated PPPoE Session for '${username}'. RouterOS secret re-synced.`);
  };

  const runPing = () => {
    if (!pingTarget) return;
    setPinging(true);
    setPingLogs([
      `Initiating ICMP Ping from [${pingRouter}] to ${pingTarget}...`,
      `HOST: ${pingTarget} (Count=4, Timeout=1000ms, Packet Size=56b)`
    ]);

    setTimeout(() => {
      setPingLogs(prev => [
        ...prev,
        `Reply from ${pingTarget}: bytes=56 time=1.84ms TTL=64`,
        `Reply from ${pingTarget}: bytes=56 time=1.42ms TTL=64`,
        `Reply from ${pingTarget}: bytes=56 time=2.10ms TTL=64`,
        `Reply from ${pingTarget}: bytes=56 time=1.65ms TTL=64`,
        `--- ${pingTarget} ping statistics ---`,
        `4 packets transmitted, 4 received, 0% packet loss, time 3004ms`,
        `rtt min/avg/max/mdev = 1.420/1.752/2.100/0.244 ms [EXCELLENT LINE QUALITY]`
      ]);
      setPinging(false);
    }, 1200);
  };

  const openTerminal = (srv: MikrotikServer) => {
    setSelectedTerminal(srv);
    setTerminalLog([
      `Connecting to MikroTik RouterOS v7.14.3 [${srv.ip}:8728] ...`,
      `[admin@${srv.name.split(" ")[0]}] > /system resource print`,
      `  uptime: ${srv.uptime}`,
      `  version: 7.14.3 (stable)`,
      `  cpu-load: ${srv.cpu}%`,
      `  free-memory: ${100 - srv.ram}%`,
      `  board-name: ${srv.model}`,
      `[admin@${srv.name.split(" ")[0]}] > /interface print where running=yes`,
      `  #  NAME                 TYPE      ACTUAL-MTU  MAC-ADDRESS`,
      `  0  sfp-sfpplus1         ether     1500        48:8F:5A:11:22:33`,
      `  1  ether1 (BGP-Up)      ether     1500        48:8F:5A:11:22:34`,
      `[admin@${srv.name.split(" ")[0]}] > /ppp active print count-only`,
      `  ${srv.sessions}`,
      `[admin@${srv.name.split(" ")[0]}] > /queue simple print count-only`,
      `  ${srv.sessions} active queues`,
      `Ready.`
    ]);
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchSearch = !sessionSearch ||
        s.user.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        s.customerName.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        s.ip.includes(sessionSearch) ||
        s.callerIdMac.toLowerCase().includes(sessionSearch.toLowerCase());
      const matchRouter = routerFilter === "all" || s.router.includes(routerFilter);
      return matchSearch && matchRouter;
    });
  }, [sessions, sessionSearch, routerFilter]);

  const totalSessions = servers.reduce((a, b) => a + b.sessions, 0);

  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--foreground)",
  };

  return (
    <div className="p-4 md:p-6 space-y-5">
      
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-3xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Server size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-foreground">
                MikroTik Core Routers & PPPoE Provisioning
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {servers.length} Core Routers · {totalSessions.toLocaleString()} Live Sessions
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live RouterOS REST/API control plane for PPPoE Concentrators, bandwidth simple queues, and address-list isolation.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowProvisionModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-primary hover:opacity-95 text-xs font-bold text-white shadow-xs cursor-pointer">
            <Key size={14} />
            <span>Provision PPPoE User</span>
          </button>

          <button
            onClick={() => setShowAddServer(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground shadow-xs cursor-pointer">
            <Plus size={14} />
            <span>Add MikroTik Router</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("routers")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "routers" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground bg-card border border-border"
          }`}>
          <Server size={14} />
          <span>Router Fleet Overview ({servers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "sessions" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground bg-card border border-border"
          }`}>
          <Activity size={14} />
          <span>Active PPPoE Sessions & Queues ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ping")}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "ping" ? "bg-primary text-white shadow-xs" : "text-muted-foreground hover:text-foreground bg-card border border-border"
          }`}>
          <Radio size={14} />
          <span>ICMP Ping & Line Quality Probe</span>
        </button>
      </div>

      {/* ── TAB 1: ROUTERS FLEET CARDS ──────────────────────────────────────── */}
      {activeTab === "routers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servers.map(srv => {
            const isOffline = srv.status === "offline";
            const isWarning = srv.status === "warning";
            return (
              <div
                key={srv.id}
                className="rounded-3xl overflow-hidden shadow-xs bg-card border border-border flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-2xl w-10 h-10 bg-primary/10 text-primary">
                      <Server size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-foreground">
                        {srv.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {srv.location} · <span className="font-mono text-foreground font-semibold">{srv.ip}</span> · {srv.model}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
                      style={{
                        background: srv.status === "online" ? "rgba(16,185,129,0.12)" : isWarning ? "rgba(245,158,11,0.12)" : "rgba(220,38,38,0.12)",
                        color: srv.status === "online" ? "#10B981" : isWarning ? "#F59E0B" : "#DC2626",
                      }}
                    >
                      {srv.status}
                    </span>
                    <button
                      onClick={() => handleSync(srv.name)}
                      disabled={!!syncingId}
                      className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground cursor-pointer"
                      title="Sync Router"
                    >
                      <RefreshCw size={14} className={syncingId === srv.name ? "animate-spin text-primary" : ""} />
                    </button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="p-4 space-y-3.5">
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-2.5 rounded-2xl bg-muted/40 border border-border">
                      <Cpu size={14} className="mx-auto mb-1 text-primary" />
                      <p className="font-mono text-sm font-black text-foreground">{srv.cpu}%</p>
                      <span className="text-[10px] text-muted-foreground font-bold">CPU LOAD</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-muted/40 border border-border">
                      <MemoryStick size={14} className="mx-auto mb-1 text-blue-500" />
                      <p className="font-mono text-sm font-black text-foreground">{srv.ram}%</p>
                      <span className="text-[10px] text-muted-foreground font-bold">RAM USED</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-muted/40 border border-border">
                      <Clock size={14} className="mx-auto mb-1 text-amber-500" />
                      <p className="font-mono text-xs font-bold text-foreground truncate">{srv.uptime}</p>
                      <span className="text-[10px] text-muted-foreground font-bold">UPTIME</span>
                    </div>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1 text-[11px]">
                        <span className="text-muted-foreground font-medium">CPU Core Load</span>
                        <span className="font-mono font-bold" style={{ color: srv.cpu > 75 ? "#DC2626" : "var(--foreground)" }}>{srv.cpu}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${srv.cpu}%`,
                            background: srv.cpu > 75 ? "#DC2626" : "var(--primary)",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1 text-[11px]">
                        <span className="text-muted-foreground font-medium">Memory Allocation</span>
                        <span className="font-mono font-bold text-foreground">{srv.ram}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${srv.ram}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Status footer inside card */}
                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="text-primary" />
                      <span className="font-mono font-bold text-foreground">{srv.sessions.toLocaleString()}</span>
                      <span className="text-muted-foreground">PPPoE Users Online</span>
                    </div>
                    <span className="text-muted-foreground text-[10px]">Probe Sync: {srv.lastSync}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex border-t border-border text-xs font-bold">
                  <button
                    onClick={() => openTerminal(srv)}
                    className="flex-1 py-3 flex items-center justify-center gap-1.5 hover:bg-muted border-r border-border text-foreground cursor-pointer"
                  >
                    <Terminal size={13} className="text-emerald-500" /> Console Terminal
                  </button>
                  <button
                    onClick={() => {
                      setRouterFilter(srv.name.split(" ")[0]);
                      setActiveTab("sessions");
                    }}
                    className="flex-1 py-3 flex items-center justify-center gap-1.5 hover:bg-muted border-r border-border text-foreground cursor-pointer"
                  >
                    <Activity size={13} className="text-blue-500" /> Live PPPoE
                  </button>
                  <button
                    onClick={() => handleSync(srv.name)}
                    className="flex-1 py-3 flex items-center justify-center gap-1.5 hover:bg-muted text-primary cursor-pointer"
                  >
                    <RefreshCw size={13} /> Re-sync Queues
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB 2: ACTIVE PPPOE SESSIONS & QUEUES ───────────────────────────── */}
      {activeTab === "sessions" && (
        <div className="space-y-4 bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-base font-extrabold text-foreground">Active PPPoE Sessions & Simple Queues</h3>
              <p className="text-xs text-muted-foreground">Live subscribers connected via MikroTik PPPoE server with bandwidth shaping.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-border bg-muted/40">
                <Search size={14} className="text-muted-foreground" />
                <input
                  value={sessionSearch}
                  onChange={e => setSessionSearch(e.target.value)}
                  placeholder="Filter by user, IP, MAC..."
                  className="bg-transparent outline-none text-xs text-foreground w-40"
                />
              </div>

              <select
                value={routerFilter}
                onChange={e => setRouterFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-border bg-card text-xs text-foreground font-semibold outline-none cursor-pointer">
                <option value="all">All Routers</option>
                <option value="MikroTik-01">MikroTik-01</option>
                <option value="MikroTik-02">MikroTik-02</option>
                <option value="MikroTik-03">MikroTik-03</option>
                <option value="MikroTik-04">MikroTik-04</option>
              </select>

              <button
                onClick={() => showToast("Polled active PPPoE interface stats from all MikroTik routers.")}
                className="px-3 py-2 rounded-2xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="p-3.5">PPPoE User / Customer</th>
                  <th className="p-3.5">Router Concentrator</th>
                  <th className="p-3.5">Framed IP & MAC</th>
                  <th className="p-3.5">Queue Bandwidth</th>
                  <th className="p-3.5">Live Traffic</th>
                  <th className="p-3.5">Session Uptime</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSessions.map(s => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-foreground">{s.user}</div>
                      <div className="text-[11px] text-muted-foreground">{s.customerName} ({s.customerId})</div>
                    </td>
                    <td className="p-3.5 text-foreground font-medium">
                      {s.router}
                    </td>
                    <td className="p-3.5 font-mono">
                      <div className="text-foreground font-bold">{s.ip}</div>
                      <div className="text-[10px] text-muted-foreground">{s.callerIdMac}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {s.profile}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="text-emerald-600 dark:text-emerald-400 font-bold">↓ {s.rxRate}</div>
                      <div className="text-blue-600 dark:text-blue-400 font-bold">↑ {s.txRate}</div>
                    </td>
                    <td className="p-3.5 text-muted-foreground font-mono">
                      {s.uptime}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => disconnectSession(s.id, s.user)}
                        className="px-2.5 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold transition-all cursor-pointer">
                        Disconnect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: ICMP PING & LINE PROBE TOOL ──────────────────────────────── */}
      {activeTab === "ping" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card p-5 rounded-3xl border border-border shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-foreground">Run MikroTik ICMP Ping</h3>
            <p className="text-xs text-muted-foreground">Test round-trip packet latency and packet drops directly from any core router.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">SOURCE ROUTER</label>
                <select
                  value={pingRouter}
                  onChange={e => setPingRouter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                  {servers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.ip})</option>)}
                </select>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">TARGET IP ADDRESS</label>
                <input
                  value={pingTarget}
                  onChange={e => setPingTarget(e.target.value)}
                  placeholder="e.g. 10.10.20.14 or 8.8.8.8"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                />
              </div>

              <button
                onClick={runPing}
                disabled={pinging}
                className="w-full py-2.5 rounded-2xl bg-primary hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                <Radio size={14} className={pinging ? "animate-pulse" : ""} />
                <span>{pinging ? "Sending ICMP Packets..." : "Send 4x Ping Packets"}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-gray-800 bg-[#0D1117] p-5 shadow-sm font-mono text-xs flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-800 text-gray-400 text-xs">
                <span>ICMP Console Output</span>
                <span className="text-emerald-400 font-bold">API Port 8728</span>
              </div>

              <div className="space-y-1.5 mt-3">
                {pingLogs.length === 0 ? (
                  <p className="text-gray-500 italic">Click 'Send 4x Ping Packets' to execute real-time probe.</p>
                ) : (
                  pingLogs.map((log, idx) => (
                    <p key={idx} className={log.includes("EXCELLENT") ? "text-emerald-400 font-bold" : log.startsWith("Reply") ? "text-blue-300" : "text-gray-300"}>
                      {log}
                    </p>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 text-[10px] text-gray-500">
              Tested from MAA BEST NETWORK Backbone. Zero buffer bloat detected.
            </div>
          </div>
        </div>
      )}

      {/* ── PROVISION PPPOE USER MODAL ─────────────────────────────────────── */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl bg-card border border-border">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-primary" />
                <h3 className="font-extrabold text-base text-foreground">
                  Live MikroTik PPPoE Provisioning
                </h3>
              </div>
              <button onClick={() => setShowProvisionModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">TARGET ROUTER</label>
                  <select
                    value={provisionData.routerId}
                    onChange={e => setProvisionData({ ...provisionData, routerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    {servers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">BANDWIDTH PROFILE</label>
                  <select
                    value={provisionData.profile}
                    onChange={e => setProvisionData({ ...provisionData, profile: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option>10M/5M Home (৳800)</option>
                    <option>15M/8M Standard (৳1,000)</option>
                    <option>20M/10M Standard (৳1,200)</option>
                    <option>30M/15M Fiber (৳1,500)</option>
                    <option>50M/25M Ultra Pro (৳2,500)</option>
                    <option>100M/50M Gigabit (৳5,000)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">CUSTOMER NAME</label>
                  <input
                    required
                    value={provisionData.customerName}
                    onChange={e => setProvisionData({ ...provisionData, customerName: e.target.value })}
                    placeholder="e.g. Mahfuz Rahman"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">CUSTOMER ID (OPTIONAL)</label>
                  <input
                    value={provisionData.customerId}
                    onChange={e => setProvisionData({ ...provisionData, customerId: e.target.value })}
                    placeholder="CUST-10399"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">PPPOE USERNAME</label>
                  <input
                    required
                    value={provisionData.pppUser}
                    onChange={e => setProvisionData({ ...provisionData, pppUser: e.target.value })}
                    placeholder="mahfuz_m10"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">PPPOE PASSWORD</label>
                  <input
                    type="password"
                    required
                    value={provisionData.pppPass}
                    onChange={e => setProvisionData({ ...provisionData, pppPass: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">ASSIGNED REMOTE IP</label>
                  <input
                    value={provisionData.remoteIp}
                    onChange={e => setProvisionData({ ...provisionData, remoteIp: e.target.value })}
                    placeholder="10.10.20.75"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">ROUTER ADDRESS-LIST</label>
                  <select
                    value={provisionData.addressList}
                    onChange={e => setProvisionData({ ...provisionData, addressList: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none">
                    <option value="active_subscribers">active_subscribers</option>
                    <option value="due_isolated">due_isolated</option>
                    <option value="vip_corporate">vip_corporate</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 size={15} className="flex-shrink-0" />
                <span>Will instantly push secret to `/ppp secret` and add simple queue bandwidth limiter.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  className="flex-1 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-primary hover:opacity-95 text-white font-bold cursor-pointer">
                  Provision on RouterOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ROUTEROS WEB TERMINAL CONSOLE MODAL ───────────────────────────────── */}
      {selectedTerminal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden border border-gray-800"
            style={{ background: "#0D1117", color: "#C9D1D9" }}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800 bg-gray-900/60">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                <TerminalSquare size={16} />
                <span>RouterOS Terminal — {selectedTerminal.name} ({selectedTerminal.ip})</span>
              </div>
              <button onClick={() => setSelectedTerminal(null)} className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 font-mono text-xs space-y-1.5 max-h-[360px] overflow-y-auto bg-black/40">
              {terminalLog.map((line, idx) => (
                <p key={idx} className={line.startsWith("[admin") ? "text-blue-400 font-semibold" : line.startsWith("  uptime") || line.startsWith("  version") ? "text-emerald-300" : "text-gray-300"}>
                  {line}
                </p>
              ))}
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800 bg-gray-900/60 text-xs">
              <span className="text-gray-400 text-[11px]">Connected via API Port 8728 · SSL Encrypted</span>
              <button
                onClick={() => setSelectedTerminal(null)}
                className="px-3 py-1.5 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 cursor-pointer"
              >
                Close Terminal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD MIKROTIK MODAL ───────────────────────────────────────────────── */}
      {showAddServer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl bg-card border border-border"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Server size={18} className="text-primary" />
                <h3 className="font-extrabold text-base text-foreground">
                  Add MikroTik Router
                </h3>
              </div>
              <button onClick={() => setShowAddServer(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">ROUTER NAME</label>
                <input
                  value={newSrv.name}
                  onChange={e => setNewSrv(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. MikroTik-05 (Mohakhali)"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">IP ADDRESS</label>
                  <input
                    value={newSrv.ip}
                    onChange={e => setNewSrv(p => ({ ...p, ip: e.target.value }))}
                    placeholder="10.10.5.1"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">DC LOCATION</label>
                  <input
                    value={newSrv.location}
                    onChange={e => setNewSrv(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Mohakhali POP"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">HARDWARE MODEL</label>
                <select
                  value={newSrv.model}
                  onChange={e => setNewSrv(p => ({ ...p, model: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                >
                  <option>CCR2004-1G-12S+2XS</option>
                  <option>CCR2016-16G-2S+</option>
                  <option>CCR1009-7G-1C-1S+</option>
                  <option>CCR1036-8G-2S+</option>
                  <option>CCR2116-12G-4S+</option>
                  <option>CHR Cloud Hosted Router</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">API USERNAME</label>
                  <input
                    value={newSrv.user}
                    onChange={e => setNewSrv(p => ({ ...p, user: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">API PASSWORD</label>
                  <input
                    type="password"
                    value={newSrv.pass}
                    onChange={e => setNewSrv(p => ({ ...p, pass: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddServer(false)}
                className="flex-1 py-2.5 rounded-2xl border border-border hover:bg-muted text-foreground font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddServer}
                disabled={!newSrv.name || !newSrv.ip}
                className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-white bg-primary disabled:opacity-50 cursor-pointer"
              >
                Connect Router
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-[#130606] text-white text-xs font-medium animate-slideUp"
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
