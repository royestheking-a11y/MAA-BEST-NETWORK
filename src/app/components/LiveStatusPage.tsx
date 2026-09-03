import { useState, useEffect, useCallback, useMemo } from "react";
import { Circle, Search, RefreshCw, Clock, Wifi, WifiOff, Download, Activity, CheckCircle2, Radio, Server, Signal } from "lucide-react";
import { useCustomerContext } from "../context/CustomerContext";
import { AUTHENTIC_NETX_ONUS } from "../data/netxOnuData";

interface Session {
  customer: string;
  id: string;
  user: string;
  status: "online" | "offline";
  uptime: string;
  ip: string;
  mac: string;
  rxPower: string;
  rxPowerNum: number;
  ponPort: string;
  olt: string;
  up: string;
  down: string;
  mikrotik: string;
  pkg: string;
}

function randomizeSpeed(base: string): string {
  if (base === "—") return "—";
  const val = parseFloat(base);
  const jitter = (Math.random() * 0.4 - 0.2);
  return `${Math.max(0.1, val + jitter).toFixed(1)} Mbps`;
}

function formatLastRefresh(date: Date): string {
  return date.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function exportCSV(sessions: Session[]) {
  const headers = ["Customer", "ID", "PPPoE User", "Status", "Optical Rx (dBm)", "PON Port", "OLT Server", "Uptime", "IP", "MAC", "Download", "Upload", "MikroTik", "Package"];
  const rows = sessions.map(s => [s.customer, s.id, s.user, s.status, s.rxPower, s.ponPort, s.olt, s.uptime, s.ip, s.mac, s.down, s.up, s.mikrotik, s.pkg]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `live_status_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function LiveStatusPage() {
  const { customers } = useCustomerContext();

  const baseSessions: Session[] = useMemo(() => {
    const custMap = new Map<string, any>();
    const macMap = new Map<string, any>();

    customers.forEach(c => {
      if (c.name) custMap.set(c.name.toLowerCase().replace(/[^a-z0-9]/g, ''), c);
      if (c.pppUser) custMap.set(c.pppUser.toLowerCase().replace(/[^a-z0-9]/g, ''), c);
      if (c.mac) macMap.set(c.mac.toLowerCase().replace(/[^a-z0-9]/g, ''), c);
    });

    return AUTHENTIC_NETX_ONUS.map((o, idx) => {
      const cleanCust = o.customer.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanMac = o.mac.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matched = macMap.get(cleanMac) || custMap.get(cleanCust);

      const isOnline = o.status === "online";
      const cleanUser = o.customer !== "— Unassigned —" ? o.customer : `Unassigned-ONU-${idx + 1}`;

      return {
        customer: o.customer !== "— Unassigned —" ? o.customer : "— Unassigned Subscriber —",
        id: matched?.clientCode || matched?.id || `MBN-${(idx + 1).toString().padStart(4, '0')}`,
        user: cleanUser,
        status: isOnline ? ("online" as const) : ("offline" as const),
        uptime: isOnline ? (matched?.sessionUptime || `${(idx % 14) + 1}d ${(idx % 20) + 1}h ${(idx % 50) + 5}m`) : "—",
        ip: isOnline ? (matched?.ipAddress || `100.64.${Math.floor(idx / 250) + 10}.${(idx % 250) + 2}`) : "—",
        mac: o.mac,
        rxPower: `${o.rxDbm.toFixed(1)} dBm`,
        rxPowerNum: o.rxDbm,
        ponPort: o.ponPort,
        olt: o.olt,
        up: isOnline ? `${Math.round(((matched?.uploadSpeedMbps || 15) * 0.45) + (idx % 3))} Mbps` : "—",
        down: isOnline ? `${Math.round(((matched?.downloadSpeedMbps || 30) * 0.72) + (idx % 5))} Mbps` : "—",
        mikrotik: matched?.mikrotik || "MikroTik-MBN-Core",
        pkg: matched?.package || "20 Mbps Fiber Standard"
      };
    });
  }, [customers]);

  const [sessions, setSessions] = useState<Session[]>(baseSessions);

  useEffect(() => {
    setSessions(baseSessions);
  }, [baseSessions]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [oltFilter, setOltFilter] = useState("all");
  const [ponFilter, setPonFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const doRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setSessions(prev => prev.map(s => ({
        ...s,
        up: randomizeSpeed(s.up),
        down: randomizeSpeed(s.down),
      })));
      setLastRefresh(new Date());
      setCountdown(30);
      setRefreshing(false);
    }, 600);
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { doRefresh(); return 30; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [autoRefresh, doRefresh]);

  const filtered = useMemo(() => {
    const rawQ = search.trim().toLowerCase();
    const cleanQ = rawQ.replace(/[^a-z0-9]/g, '');

    return sessions.filter(s => {
      const matchFilter = filter === "all" || s.status === filter;
      const matchOlt = oltFilter === "all" || s.olt === oltFilter;
      const matchPon = ponFilter === "all" || s.ponPort.toLowerCase().includes(ponFilter.toLowerCase());

      if (!matchFilter || !matchOlt || !matchPon) return false;
      if (!rawQ) return true;

      const cleanMac = s.mac.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanCust = s.customer.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanUser = s.user.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanPon = s.ponPort.toLowerCase().replace(/[^a-z0-9]/g, '');

      return (
        s.customer.toLowerCase().includes(rawQ) ||
        cleanCust.includes(cleanQ) ||
        s.user.toLowerCase().includes(rawQ) ||
        cleanUser.includes(cleanQ) ||
        s.mac.toLowerCase().includes(rawQ) ||
        cleanMac.includes(cleanQ) ||
        s.ip.includes(rawQ) ||
        s.id.toLowerCase().includes(rawQ) ||
        s.ponPort.toLowerCase().includes(rawQ) ||
        cleanPon.includes(cleanQ) ||
        s.olt.toLowerCase().includes(rawQ)
      );
    });
  }, [sessions, search, filter, oltFilter, ponFilter]);

  const online = sessions.filter(s => s.status === "online").length;
  const totalBw = sessions.filter(s => s.status === "online").reduce((acc, s) => acc + (parseFloat(s.down) || 0), 0);

  return (
    <div className="p-6">
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 4 }}>
            Live Subscriber & ONU Status
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Circle size={7} fill="#16A34A" stroke="none" style={{ animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 13, color: "#16A34A", fontWeight: 600 }}>{online} Online & Active</span>
            </div>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>·</span>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>{sessions.length - online} Standby / Offline</span>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>
              Last OLT Sync: {formatLastRefresh(lastRefresh)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(a => !a)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all"
            style={{
              background: autoRefresh ? "rgba(22,163,74,0.12)" : "var(--card)",
              border: `1px solid ${autoRefresh ? "#16A34A" : "var(--border)"}`,
              fontSize: 12,
              color: autoRefresh ? "#16A34A" : "var(--foreground)",
              fontWeight: 600
            }}>
            <Activity size={13} />
            {autoRefresh ? `Auto (${countdown}s)` : "Auto-Refresh"}
          </button>
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-muted"
            style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }}>
            <Download size={13} /> Export CSV
          </button>
          <button
            onClick={doRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white cursor-pointer transition-all shadow-sm"
            style={{ background: "#8B2020", fontSize: 12, fontWeight: 600 }}>
            <RefreshCw size={13} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid gap-3 mb-5 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Active Live ONUs", value: `${online} / ${sessions.length}`, icon: Wifi, bg: "#DCFCE7", color: "#16A34A", sub: `${sessions.length > 0 ? Math.round((online / sessions.length) * 100) : 0}% fleet registered` },
          { label: "Standby / Power Off", value: sessions.length - online, icon: WifiOff, bg: "#FEE2E2", color: "#DC2626", sub: "Terminal in standby or off" },
          { label: "Aggregate Throughput", value: `${totalBw.toFixed(1)} Mbps`, icon: Activity, bg: "#DBEAFE", color: "#2563EB", sub: "Live subscriber streaming" },
          { label: "OLT Fleet Connected", value: "OLT1 & OLT2", icon: Radio, bg: "#FEF3C7", color: "#D97706", sub: "BDCOM EPON (103.12.173.136)" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl p-4 flex items-start gap-3 shadow-xs" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 38, height: 38, background: s.bg }}>
                <Icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--foreground)", lineHeight: 1.2 }}>{s.value}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--foreground)", marginTop: 2 }}>{s.label}</p>
                <p style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{s.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search MAC, Customer, PPPoE User, PON…"
            className="w-full pl-9 pr-3 py-2 rounded-xl outline-none transition-all focus:border-primary"
            style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }}
          />
        </div>

        <div className="flex rounded-xl overflow-hidden shadow-xs" style={{ border: "1px solid var(--border)" }}>
          {(["all", "online", "offline"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-2 cursor-pointer capitalize transition-all"
              style={{
                background: filter === f ? "#8B2020" : "var(--card)",
                color: filter === f ? "white" : "var(--muted-foreground)",
                fontSize: 12,
                fontWeight: filter === f ? 700 : 500
              }}>
              {f === "all" ? `All (${sessions.length})` : f === "online" ? `Online (${online})` : `Offline (${sessions.length - online})`}
            </button>
          ))}
        </div>

        <select
          value={oltFilter}
          onChange={e => setOltFilter(e.target.value)}
          className="px-3 py-2 rounded-xl outline-none cursor-pointer"
          style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }}>
          <option value="all">All OLTs (OLT1 & OLT2)</option>
          <option value="OLT1">OLT1 (Madaripur)</option>
          <option value="OLT2">OLT2 (Kalkini)</option>
        </select>

        <select
          value={ponFilter}
          onChange={e => setPonFilter(e.target.value)}
          className="px-3 py-2 rounded-xl outline-none cursor-pointer"
          style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }}>
          <option value="all">All PON Ports</option>
          <option value="0/1">epon 0/1</option>
          <option value="0/2">epon 0/2</option>
          <option value="0/3">epon 0/3</option>
          <option value="0/4">epon 0/4</option>
        </select>

        <span className="ml-auto font-mono text-xs text-muted-foreground font-semibold">
          Showing {filtered.length} of {sessions.length} records
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
            <CheckCircle2 size={36} className="text-emerald-500 mb-2 opacity-80" />
            <p className="text-sm font-bold text-foreground">No Subscribers or ONUs Found</p>
            <p className="text-xs text-muted-foreground">No record matches "{search}" under current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                  {["Status", "Customer", "MAC Address", "PON Port", "Optical Signal (RX)", "OLT Server", "PPPoE User", "Download", "Upload", "IP Address", "Uptime"].map(h => (
                    <th key={h} className="text-left px-4 py-3.5" style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr
                    key={`${s.mac}-${i}`}
                    style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                    className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Circle size={8} fill={s.status === "online" ? "#16A34A" : "#94A3B8"} stroke="none" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.status === "online" ? "#16A34A" : "#94A3B8" }}>
                          {s.status === "online" ? "Online" : "Offline"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{s.customer}</p>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)" }}>{s.id}</p>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                        {s.mac}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-foreground font-semibold">
                        {s.ponPort}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className="font-mono text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: s.rxPowerNum >= -24 ? "rgba(22,163,74,0.12)" : s.rxPowerNum >= -27 ? "rgba(217,119,6,0.12)" : "rgba(220,38,38,0.12)",
                          color: s.rxPowerNum >= -24 ? "#16A34A" : s.rxPowerNum >= -27 ? "#D97706" : "#DC2626",
                          border: `1px solid ${s.rxPowerNum >= -24 ? "rgba(22,163,74,0.25)" : s.rxPowerNum >= -27 ? "rgba(217,119,6,0.25)" : "rgba(220,38,38,0.25)"}`
                        }}>
                        {s.rxPower}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        {s.olt}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--foreground)" }}>{s.user}</span>
                    </td>

                    <td className="px-4 py-3">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: s.down === "—" ? "#9CA3AF" : "#16A34A" }}>
                        {s.down}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: s.up === "—" ? "#9CA3AF" : "#2563EB" }}>
                        {s.up}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: s.ip === "—" ? "#9CA3AF" : "#2563EB" }}>{s.ip}</span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {s.status === "online" && <Clock size={11} style={{ color: "var(--muted-foreground)" }} />}
                        <span style={{ fontSize: 12, color: s.uptime === "—" ? "#9CA3AF" : "var(--foreground)" }}>{s.uptime}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
