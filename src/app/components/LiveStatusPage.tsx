import { useState, useEffect, useCallback, useMemo } from "react";
import { Circle, Search, RefreshCw, Clock, Wifi, WifiOff, Download, Activity, CheckCircle2 } from "lucide-react";
import { useCustomerContext } from "../context/CustomerContext";

interface Session {
  customer: string; id: string; user: string;
  status: "online" | "offline"; uptime: string;
  ip: string; mac: string; up: string; down: string;
  mikrotik: string; pkg: string;
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
  const headers = ["Customer", "ID", "PPPoE User", "Status", "Uptime", "IP", "MAC", "Download", "Upload", "MikroTik", "Package"];
  const rows = sessions.map(s => [s.customer, s.id, s.user, s.status, s.uptime, s.ip, s.mac, s.down, s.up, s.mikrotik, s.pkg]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `live_status_${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export function LiveStatusPage() {
  const { customers } = useCustomerContext();

  const baseSessions: Session[] = useMemo(() => {
    return customers.map(c => {
      const isOnline = c.netStatus === "online" && c.status === "active";
      return {
        customer: c.name,
        id: c.id,
        user: c.pppUser,
        status: isOnline ? ("online" as const) : ("offline" as const),
        uptime: isOnline ? (c.sessionUptime || "14d 6h 22m") : "—",
        ip: isOnline ? c.ipAddress : "—",
        mac: c.mac,
        up: isOnline ? `${Math.round((c.uploadSpeedMbps || 15) * 0.45)} Mbps` : "—",
        down: isOnline ? `${Math.round((c.downloadSpeedMbps || 30) * 0.72)} Mbps` : "—",
        mikrotik: c.mikrotik || "MikroTik-01",
        pkg: c.package
      };
    });
  }, [customers]);

  const [sessions, setSessions] = useState<Session[]>(baseSessions);

  useEffect(() => {
    setSessions(baseSessions);
  }, [baseSessions]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [mikrotikFilter, setMikrotikFilter] = useState("all");
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

  const mikrotiks = useMemo(() => ["all", ...Array.from(new Set(sessions.map(s => s.mikrotik)))], [sessions]);

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.customer.toLowerCase().includes(q) || s.user.toLowerCase().includes(q) || s.ip.includes(search) || s.id.toLowerCase().includes(q);
    const matchFilter = filter === "all" || s.status === filter;
    const matchMk = mikrotikFilter === "all" || s.mikrotik === mikrotikFilter;
    return matchSearch && matchFilter && matchMk;
  });

  const online = sessions.filter(s => s.status === "online").length;
  const totalBw = sessions.filter(s => s.status === "online").reduce((acc, s) => acc + (parseFloat(s.down) || 0), 0);

  return (
    <div className="p-6">
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 4 }}>Live Status</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Circle size={7} fill="#16A34A" stroke="none" style={{ animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 13, color: "#16A34A", fontWeight: 500 }}>{online} online</span>
            </div>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>·</span>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>{sessions.length - online} offline</span>
            <span style={{ fontSize: 13, color: "#9CA3AF" }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted-foreground)" }}>Last sync: {formatLastRefresh(lastRefresh)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-refresh toggle */}
          <button onClick={() => setAutoRefresh(a => !a)} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
            style={{ background: autoRefresh ? "#DCFCE7" : "var(--card)", border: `1px solid ${autoRefresh?"#16A34A":"var(--border)"}`, fontSize: 12, color: autoRefresh ? "#16A34A" : "var(--foreground)", fontWeight: 500 }}>
            <Activity size={13} />
            {autoRefresh ? `Auto (${countdown}s)` : "Auto-Refresh"}
          </button>
          <button onClick={() => exportCSV(filtered)} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
            style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }}>
            <Download size={13} /> Export CSV
          </button>
          <button onClick={doRefresh} disabled={refreshing} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white cursor-pointer"
            style={{ background: "#8B2020", fontSize: 12, fontWeight: 500 }}>
            <RefreshCw size={13} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
            Refresh
          </button>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {[
          { label: "Online Subscribers", value: online, icon: Wifi, bg: "#DCFCE7", color: "#16A34A", sub: `${sessions.length > 0 ? Math.round((online/sessions.length)*100) : 0}% of subscriber base` },
          { label: "Offline Lines", value: sessions.length - online, icon: WifiOff, bg: "#FEE2E2", color: "#DC2626", sub: "Disconnected or power off" },
          { label: "Active Live Throughput", value: `${totalBw.toFixed(1)} Mbps`, icon: Activity, bg: "#DBEAFE", color: "#2563EB", sub: "Aggregate realtime stream" },
          { label: "Gateway RouterOS", value: mikrotiks.filter(m=>m!=="all").length || 1, icon: RefreshCw, bg: "#FEF3C7", color: "#D97706", sub: "MikroTik sync active" },
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

      {/* Filters Bar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search user, IP, ID…"
            className="w-full pl-8 pr-3 py-2 rounded-lg outline-none" style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }} />
        </div>
        <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {(["all", "online", "offline"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className="px-3 py-2 cursor-pointer capitalize"
              style={{ background: filter === f ? "#8B2020" : "var(--card)", color: filter === f ? "white" : "var(--muted-foreground)", fontSize: 12, fontWeight: filter === f ? 600 : 400 }}>
              {f === "all" ? `All (${sessions.length})` : f === "online" ? `Online (${online})` : `Offline (${sessions.length - online})`}
            </button>
          ))}
        </div>
        <select value={mikrotikFilter} onChange={e => setMikrotikFilter(e.target.value)} className="px-3 py-2 rounded-lg outline-none cursor-pointer"
          style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }}>
          {mikrotiks.map(m => <option key={m} value={m}>{m === "all" ? "All MikroTiks" : m}</option>)}
        </select>
        <span className="ml-auto" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{filtered.length} sessions listed</span>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
            <CheckCircle2 size={36} className="text-emerald-500 mb-2 opacity-80" />
            <p className="text-sm font-bold text-foreground">No Sessions Found</p>
            <p className="text-xs text-muted-foreground">No subscriber match current filters.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                {["Status", "Customer", "PPPoE User", "Package", "IP Address", "MAC Address", "Download", "Upload", "Uptime", "MikroTik"].map(h => (
                  <th key={h} className="text-left px-4 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Circle size={7} fill={s.status === "online" ? "#16A34A" : "#9CA3AF"} stroke="none" />
                      <span style={{ fontSize: 12, fontWeight: 600, color: s.status === "online" ? "#16A34A" : "#9CA3AF" }}>
                        {s.status === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{s.customer}</p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)" }}>{s.id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--foreground)" }}>{s.user}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: 12, color: "var(--foreground)" }}>{s.pkg}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: s.ip === "—" ? "#9CA3AF" : "#2563EB" }}>{s.ip}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>{s.mac}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: s.down === "—" ? "#9CA3AF" : "#16A34A" }}>
                      {s.down}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: s.up === "—" ? "#9CA3AF" : "#2563EB" }}>
                      {s.up}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {s.status === "online" && <Clock size={11} style={{ color: "var(--muted-foreground)" }} />}
                      <span style={{ fontSize: 12, color: s.uptime === "—" ? "#9CA3AF" : "var(--foreground)" }}>{s.uptime}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{s.mikrotik}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
