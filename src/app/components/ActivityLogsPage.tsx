import { useState } from "react";
import { ScrollText, Search, Filter, User, CreditCard, Package, WifiOff, Wifi, Settings, Shield, FileText, AlertTriangle } from "lucide-react";

type LogType = "payment" | "customer" | "network" | "auth" | "billing" | "system" | "package";

interface ActivityLog {
  id: string;
  type: LogType;
  user: string;
  action: string;
  detail: string;
  ip: string;
  time: string;
}

const logs: ActivityLog[] = [];

const typeConfig: Record<LogType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  payment:  { icon: CreditCard, color: "#16A34A", bg: "#DCFCE7", label: "Payment" },
  customer: { icon: User, color: "#2563EB", bg: "#DBEAFE", label: "Customer" },
  network:  { icon: Wifi, color: "#0891B2", bg: "#CFFAFE", label: "Network" },
  auth:     { icon: Shield, color: "#7C3AED", bg: "#EDE9FE", label: "Auth" },
  billing:  { icon: FileText, color: "#8B2020", bg: "#FDF3F3", label: "Billing" },
  package:  { icon: Package, color: "#D97706", bg: "#FEF3C7", label: "Package" },
  system:   { icon: Settings, color: "#6B7280", bg: "#F3F4F6", label: "System" },
};

const types: LogType[] = ["payment", "customer", "network", "auth", "billing", "package", "system"];

export function ActivityLogsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | LogType>("all");

  const filtered = logs.filter(l => {
    const matchSearch = search === "" || l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()) || l.detail.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || l.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-4 sm:gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>Activity Logs</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Full audit trail — every action, payment, login, and system event is recorded</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
          <ScrollText size={13} style={{ color: "var(--muted-foreground)" }} />
          <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{logs.length.toLocaleString()} entries today</span>
        </div>
      </div>

      {/* Type summary */}
      <div className="flex gap-1.5 sm:gap-2 flex-wrap">
        <button onClick={() => setTypeFilter("all")}
          className="px-3 py-1.5 rounded-lg transition-all cursor-pointer"
          style={{ background: typeFilter === "all" ? "#8B2020" : "var(--muted)", color: typeFilter === "all" ? "#fff" : "var(--muted-foreground)", fontSize: 12, fontWeight: typeFilter === "all" ? 600 : 400, border: "1px solid transparent" }}>
          All ({logs.length})
        </button>
        {types.map(t => {
          const cfg = typeConfig[t];
          const count = logs.filter(l => l.type === t).length;
          const Icon = cfg.icon;
          return (
            <button key={t} onClick={() => setTypeFilter(t)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              style={{ background: typeFilter === t ? cfg.bg : "var(--muted)", color: typeFilter === t ? cfg.color : "var(--muted-foreground)", fontSize: 12, fontWeight: typeFilter === t ? 600 : 400, border: typeFilter === t ? `1px solid ${cfg.color}33` : "1px solid transparent" }}>
              <Icon size={12} />
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
          className="w-full pl-9 pr-3 py-2 rounded-lg outline-none"
          style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }} />
      </div>

      {/* Log entries */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-border" style={{ background: "var(--card)" }}>
        <div className="flex flex-col">
          {filtered.map((log, i) => {
            const cfg = typeConfig[log.type];
            const Icon = cfg.icon;
            const isAlert = log.action.includes("failed") || log.action.includes("offline") || log.action.includes("disconnected");
            return (
              <div key={log.id} className="flex items-start gap-3 sm:gap-4 px-3.5 sm:px-5 py-3 sm:py-4 flex-wrap sm:flex-nowrap"
                style={{ borderBottom: i < filtered.length-1 ? "1px solid var(--border)" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <div className="flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5" style={{ width: 34, height: 34, background: isAlert ? "#FEE2E2" : cfg.bg }}>
                  {isAlert ? <AlertTriangle size={15} style={{ color: "#DC2626" }} /> : <Icon size={15} style={{ color: cfg.color }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)" }}>{log.id}</span>
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 600, background: isAlert ? "#FEE2E2" : cfg.bg, color: isAlert ? "#DC2626" : cfg.color }}>{cfg.label}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", marginBottom: 2 }}>{log.action}</p>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 2 }}>{log.detail}</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>By: <span style={{ color: "var(--foreground)" }}>{log.user}</span></span>
                    {log.ip !== "—" && <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted-foreground)" }}>IP: {log.ip}</span>}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "var(--muted-foreground)", whiteSpace: "nowrap", flexShrink: 0 }}>{log.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
