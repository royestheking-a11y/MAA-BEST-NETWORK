import { useState, useEffect, useMemo } from "react";
import { 
  ScrollText, 
  Search, 
  User, 
  CreditCard, 
  Package, 
  Wifi, 
  Settings, 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Download, 
  Trash2, 
  RefreshCw, 
  Eye, 
  PlusCircle, 
  X, 
  Copy, 
  Check, 
  Terminal,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { activityLogger, ActivityLog, LogType, LogSeverity } from "../services/activityLogger";
import { useCustomerContext } from "../context/CustomerContext";

const typeConfig: Record<LogType, { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  payment:  { icon: CreditCard, color: "#10B981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.25)", label: "Payment" },
  customer: { icon: User, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.25)", label: "Customer" },
  network:  { icon: Wifi, color: "#06B6D4", bg: "rgba(6, 182, 212, 0.12)", border: "rgba(6, 182, 212, 0.25)", label: "Network" },
  security: { icon: Shield, color: "#EC4899", bg: "rgba(236, 72, 153, 0.12)", border: "rgba(236, 72, 153, 0.25)", label: "Security" },
  auth:     { icon: Shield, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.12)", border: "rgba(139, 92, 246, 0.25)", label: "Auth" },
  billing:  { icon: FileText, color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.25)", label: "Billing" },
  package:  { icon: Package, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.12)", border: "rgba(139, 92, 246, 0.25)", label: "Package" },
  system:   { icon: Settings, color: "#64748B", bg: "rgba(100, 116, 139, 0.12)", border: "rgba(100, 116, 139, 0.25)", label: "System" },
};

const severityConfig: Record<LogSeverity, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  info:    { icon: Info, color: "#0284c7", bg: "rgba(2, 132, 199, 0.12)", label: "Info" },
  success: { icon: CheckCircle2, color: "#16a34a", bg: "rgba(22, 163, 74, 0.12)", label: "Success" },
  warning: { icon: AlertTriangle, color: "#d97706", bg: "rgba(217, 119, 6, 0.12)", label: "Warning" },
  error:   { icon: AlertTriangle, color: "#dc2626", bg: "rgba(220, 38, 38, 0.12)", label: "Critical" },
};

const allTypes: LogType[] = ["payment", "customer", "network", "security", "auth", "billing", "package", "system"];

export function ActivityLogsPage() {
  const { customers } = useCustomerContext();
  const [logs, setLogs] = useState<ActivityLog[]>(() => activityLogger.getLogs());
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | LogType>("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | LogSeverity>("all");
  const [operatorFilter, setOperatorFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [customAction, setCustomAction] = useState("");
  const [customDetail, setCustomDetail] = useState("");
  const [customType, setCustomType] = useState<LogType>("system");
  const [customSeverity, setCustomSeverity] = useState<LogSeverity>("info");
  const [customTargetId, setCustomTargetId] = useState("");

  // Subscribe to live log updates
  useEffect(() => {
    const unsubscribe = activityLogger.subscribe(() => {
      setLogs(activityLogger.getLogs());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Distinct operators list for filter dropdown
  const operators = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.user) set.add(l.user);
    });
    return Array.from(set);
  }, [logs]);

  // Filtered logs
  const filtered = useMemo(() => {
    return logs
      .filter(l => {
        const query = search.trim().toLowerCase();
        const matchSearch =
          !query ||
          l.action.toLowerCase().includes(query) ||
          l.user.toLowerCase().includes(query) ||
          l.detail.toLowerCase().includes(query) ||
          (l.targetId && l.targetId.toLowerCase().includes(query)) ||
          (l.ip && l.ip.includes(query)) ||
          l.id.toLowerCase().includes(query);

        const matchType = typeFilter === "all" || l.type === typeFilter;
        const matchSeverity = severityFilter === "all" || l.severity === severityFilter;
        const matchOperator = operatorFilter === "all" || l.user === operatorFilter;

        return matchSearch && matchType && matchSeverity && matchOperator;
      })
      .sort((a, b) => (sortOrder === "desc" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp));
  }, [logs, search, typeFilter, severityFilter, operatorFilter, sortOrder]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Log ID", "Date", "Time", "Category", "Severity", "Operator", "Role", "Action", "Details", "Target ID", "IP Address"];
    const rows = filtered.map(l => [
      l.id,
      l.dateStr,
      l.timeStr,
      l.type.toUpperCase(),
      l.severity.toUpperCase(),
      `"${(l.user || "").replace(/"/g, '""')}"`,
      `"${(l.userRole || "").replace(/"/g, '""')}"`,
      `"${(l.action || "").replace(/"/g, '""')}"`,
      `"${(l.detail || "").replace(/"/g, '""')}"`,
      l.targetId || "N/A",
      l.ip || "—"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ISP_Activity_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filtered, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `ISP_Audit_Trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create manual/simulated log
  const handleSimulateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim() || !customDetail.trim()) return;

    activityLogger.log({
      type: customType,
      severity: customSeverity,
      user: "Admin Console",
      userRole: "Administrator",
      action: customAction.trim(),
      detail: customDetail.trim(),
      targetId: customTargetId.trim() || undefined,
      ip: "103.145.60.1",
      metadata: {
        source: "Manual Audit Dispatch",
        timestamp: new Date().toISOString()
      }
    });

    setCustomAction("");
    setCustomDetail("");
    setCustomTargetId("");
    setShowSimulateModal(false);
  };

  // Quick preset simulation using real subscriber data when available
  const handleQuickPreset = (type: "auth" | "payment" | "security" | "network") => {
    const sampleCust = customers.length > 0 ? customers[Math.floor(Math.random() * customers.length)] : null;
    const targetId = sampleCust ? sampleCust.id : "CUST-1001";
    const targetName = sampleCust ? sampleCust.name : "Subscriber";

    if (type === "auth") {
      activityLogger.log({
        type: "auth",
        severity: "info",
        action: "Subscriber Portal Login Verified",
        detail: `Subscriber ${targetName} (${targetId}) authenticated successfully via SMS OTP verification.`,
        targetId,
        ip: "103.145.60.44",
        metadata: { client: "Web Client", method: "OTP_SMS" }
      });
    } else if (type === "payment") {
      const amount = sampleCust?.monthlyBill || 1000;
      activityLogger.log({
        type: "payment",
        severity: "success",
        action: "Nagad Automated Bill Payment",
        detail: `Collected ৳${amount.toLocaleString()} via Nagad Gateway (TrxID: NGD${Math.floor(100000 + Math.random() * 900000)}) for subscriber ${targetName} (${targetId}).`,
        targetId,
        ip: "10.200.1.20",
        metadata: { amount, method: "Nagad", trxId: `NGD${Math.floor(100000 + Math.random() * 900000)}` }
      });
    } else if (type === "security") {
      activityLogger.log({
        type: "security",
        severity: "warning",
        action: "Suspicious ARP Spoofing Detected",
        detail: `Duplicate IP response detected on VLAN 100 for device bound to ${targetId}. Port isolation initiated.`,
        targetId: `Switch-Core-${targetId}`,
        ip: "10.200.201.99",
        metadata: { vlan: 100, port: "GigabitEthernet 0/4", action: "PORT_ISOLATION_TRIGGERED" }
      });
    } else if (type === "network") {
      activityLogger.log({
        type: "network",
        severity: "info",
        action: "BGP Peer Route Refresh",
        detail: "Received 940,210 BGP prefixes from Upstream IIG (Summit Communications). All routing tables updated.",
        ip: "103.145.60.254",
        metadata: { bgpPeer: "AS-58717 Summit", prefixes: 940210, status: "ESTABLISHED" }
      });
    }
  };

  // Counts by category
  const stats = useMemo(() => {
    const total = logs.length;
    const payments = logs.filter(l => l.type === "payment").length;
    const security = logs.filter(l => l.type === "security" || l.severity === "error" || l.severity === "warning").length;
    const network = logs.filter(l => l.type === "network").length;
    const customersCount = logs.filter(l => l.type === "customer").length;
    return { total, payments, security, network, customersCount };
  }, [logs]);

  return (
    <div className="p-3 sm:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto">
      {/* Header Banner - System Theme */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <ScrollText size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Operational Audit Trail & Activity Logs
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Stream Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Real-time tamper-evident system logs: subscriber lifecycle, payments, MAC bindings, network OLT telemetry & security enforcement.
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary hover:opacity-95 text-white transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Create Log Event</span>
          </button>

          <div className="flex items-center bg-muted/60 rounded-xl border border-border p-0.5">
            <button
              onClick={handleExportCSV}
              title="Export as CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-card transition-all cursor-pointer"
            >
              <Download size={13} className="text-emerald-500" />
              <span>CSV</span>
            </button>
            <div className="w-[1px] h-4 bg-border" />
            <button
              onClick={handleExportJSON}
              title="Export complete JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground hover:bg-card transition-all cursor-pointer"
            >
              <Download size={13} className="text-primary" />
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={() => activityLogger.resetToDefault()}
            title="Reset to initial ISP demo logs"
            className="p-2 rounded-xl text-xs font-medium bg-card hover:bg-muted text-foreground border border-border transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear all recorded activity logs? This action cannot be undone.")) {
                activityLogger.clearLogs();
              }
            }}
            title="Clear all logs"
            className="p-2 rounded-xl text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Total Audit Logs</p>
            <h3 className="text-xl font-bold text-foreground mt-0.5">{stats.total.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ScrollText size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Payment Audits</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.payments.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CreditCard size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Security & Alerts</p>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{stats.security.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Shield size={18} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Network & OLT Ops</p>
            <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">{stats.network.toLocaleString()}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Wifi size={18} />
          </div>
        </div>
      </div>

      {/* Quick Test Presets Bar */}
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border overflow-x-auto text-xs shadow-xs">
        <span className="text-muted-foreground flex items-center gap-1.5 font-medium flex-shrink-0 px-2">
          <Terminal size={13} className="text-primary" />
          Test Events Simulator:
        </span>
        <button
          onClick={() => handleQuickPreset("payment")}
          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex-shrink-0 transition-all cursor-pointer font-medium"
        >
          + Simulate Payment
        </button>
        <button
          onClick={() => handleQuickPreset("security")}
          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex-shrink-0 transition-all cursor-pointer font-medium"
        >
          + Simulate Security Alert
        </button>
        <button
          onClick={() => handleQuickPreset("network")}
          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 flex-shrink-0 transition-all cursor-pointer font-medium"
        >
          + Simulate BGP Refresh
        </button>
        <button
          onClick={() => handleQuickPreset("auth")}
          className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 flex-shrink-0 transition-all cursor-pointer font-medium"
        >
          + Simulate Subscriber OTP Login
        </button>
      </div>

      {/* Controls Bar: Category Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <button
          onClick={() => {
            setTypeFilter("all");
            setCurrentPage(1);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            typeFilter === "all"
              ? "bg-primary text-white border-primary shadow-xs"
              : "bg-card hover:bg-muted text-muted-foreground border-border"
          }`}
        >
          All Categories ({logs.length})
        </button>

        {allTypes.map(t => {
          const cfg = typeConfig[t];
          const count = logs.filter(l => l.type === t).length;
          const Icon = cfg.icon;
          const isSelected = typeFilter === t;
          return (
            <button
              key={t}
              onClick={() => {
                setTypeFilter(t);
                setCurrentPage(1);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border"
              style={{
                background: isSelected ? cfg.bg : "transparent",
                color: isSelected ? cfg.color : "var(--muted-foreground)",
                borderColor: isSelected ? cfg.border : "var(--border)",
              }}
            >
              <Icon size={12} style={{ color: cfg.color }} />
              <span>{cfg.label}</span>
              <span
                className="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                style={{
                  background: isSelected ? "rgba(0,0,0,0.08)" : "var(--muted)",
                  color: isSelected ? cfg.color : "var(--muted-foreground)"
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Row: Search & Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search action, detail, IP, subscriber, MAC..."
            className="w-full pl-9 pr-3 py-2 rounded-xl outline-none text-xs bg-card border border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all shadow-xs"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Severity Filter */}
        <div className="relative">
          <select
            value={severityFilter}
            onChange={e => {
              setSeverityFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl text-xs bg-card border border-border text-foreground outline-none cursor-pointer focus:border-primary appearance-none shadow-xs"
          >
            <option value="all">All Severity Levels</option>
            <option value="success">Success Events</option>
            <option value="info">Informational Events</option>
            <option value="warning">Warnings & Changes</option>
            <option value="error">Critical / Security Alerts</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Operator Filter */}
        <div className="relative">
          <select
            value={operatorFilter}
            onChange={e => {
              setOperatorFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl text-xs bg-card border border-border text-foreground outline-none cursor-pointer focus:border-primary appearance-none shadow-xs"
          >
            <option value="all">All Operators & Daemons</option>
            {operators.map(op => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Sort & Page Size */}
        <div className="flex items-center gap-2">
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as any)}
            className="w-1/2 px-2.5 py-2 rounded-xl text-xs bg-card border border-border text-foreground outline-none cursor-pointer focus:border-primary shadow-xs"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="w-1/2 px-2.5 py-2 rounded-xl text-xs bg-card border border-border text-foreground outline-none cursor-pointer focus:border-primary shadow-xs"
          >
            <option value={15}>15 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {/* Log Feed Table / List */}
      <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground mb-3">
              <ScrollText size={28} />
            </div>
            <h3 className="text-base font-semibold text-foreground">No Matching Audit Records Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Try adjusting your search query, clearing filters, or create a simulated test event.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setSeverityFilter("all");
                setOperatorFilter("all");
              }}
              className="mt-4 px-4 py-1.5 rounded-xl text-xs font-medium bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer shadow-xs"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedLogs.map(log => {
              const cfg = typeConfig[log.type] || typeConfig.system;
              const sev = severityConfig[log.severity] || severityConfig.info;
              const Icon = cfg.icon;
              const SevIcon = sev.icon;

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="p-4 sm:p-4.5 hover:bg-muted/40 transition-colors flex items-start gap-3 sm:gap-4 cursor-pointer group"
                >
                  {/* Category Icon Badge */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border shadow-xs transition-transform group-hover:scale-105"
                    style={{ background: cfg.bg, borderColor: cfg.border }}
                  >
                    <Icon size={18} style={{ color: cfg.color }} />
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {/* ID Pill */}
                      <span className="font-mono text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                        {log.id}
                      </span>

                      {/* Category Pill */}
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        {cfg.label}
                      </span>

                      {/* Severity Pill */}
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: sev.bg, color: sev.color }}
                      >
                        <SevIcon size={10} />
                        {sev.label}
                      </span>

                      {/* Target Subscriber Tag */}
                      {log.targetId && (
                        <span className="text-[11px] font-mono font-medium text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          Target: {log.targetId}
                        </span>
                      )}
                    </div>

                    {/* Action Title */}
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {log.action}
                    </h4>

                    {/* Action Detail */}
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {log.detail}
                    </p>

                    {/* Metadata Sub-Bar */}
                    <div className="flex items-center gap-3 sm:gap-5 mt-2 text-[11px] text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <User size={11} className="text-muted-foreground" />
                        <span className="text-foreground font-medium">{log.user}</span>
                        {log.userRole && <span className="text-[10px] text-muted-foreground">({log.userRole})</span>}
                      </span>

                      {log.ip && log.ip !== "—" && (
                        <span className="flex items-center gap-1 font-mono text-muted-foreground">
                          <Terminal size={11} className="text-muted-foreground" />
                          IP: {log.ip}
                        </span>
                      )}

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                          +{Object.keys(log.metadata).length} metadata keys
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Timestamp & View Button */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-xs font-mono font-medium text-foreground whitespace-nowrap">
                      {log.timeStr}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {log.dateStr}
                    </span>
                    <span className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-primary flex items-center gap-0.5 font-medium">
                      Inspect <Eye size={11} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <div className="p-3.5 bg-muted/40 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing <span className="font-semibold text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, filtered.length)}</span> of{" "}
              <span className="font-semibold text-foreground">{filtered.length.toLocaleString()}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-all cursor-pointer shadow-xs"
              >
                Previous
              </button>

              <div className="px-3 py-1 font-semibold text-foreground">
                Page {currentPage} of {totalPages}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-all cursor-pointer shadow-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
                  style={{
                    background: typeConfig[selectedLog.type]?.bg || "rgba(100,116,139,0.1)",
                    borderColor: typeConfig[selectedLog.type]?.border || "rgba(100,116,139,0.2)"
                  }}
                >
                  {(() => {
                    const Icon = typeConfig[selectedLog.type]?.icon || Settings;
                    return <Icon size={20} style={{ color: typeConfig[selectedLog.type]?.color || "var(--primary)" }} />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{selectedLog.action}</h3>
                    <span className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-semibold">
                      {selectedLog.id}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Recorded on {selectedLog.dateStr} at {selectedLog.timeStr}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4 overflow-y-auto pr-1">
              {/* Event Description */}
              <div className="bg-muted/40 p-3.5 rounded-xl border border-border">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                  Event Narrative
                </label>
                <p className="text-sm text-foreground leading-relaxed">{selectedLog.detail}</p>
              </div>

              {/* Grid Properties */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/30 p-3 rounded-xl border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Category</span>
                  <span className="text-foreground font-semibold mt-0.5 block capitalize">{selectedLog.type}</span>
                </div>

                <div className="bg-muted/30 p-3 rounded-xl border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Severity Status</span>
                  <span className="text-foreground font-semibold mt-0.5 capitalize flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: severityConfig[selectedLog.severity]?.color }}
                    />
                    {selectedLog.severity}
                  </span>
                </div>

                <div className="bg-muted/30 p-3 rounded-xl border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Operator & Role</span>
                  <span className="text-foreground font-semibold mt-0.5 block">{selectedLog.user}</span>
                  <span className="text-[10px] text-muted-foreground">{selectedLog.userRole}</span>
                </div>

                <div className="bg-muted/30 p-3 rounded-xl border border-border">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Client IP Address</span>
                  <span className="text-foreground font-mono font-semibold mt-0.5 block">{selectedLog.ip || "—"}</span>
                </div>

                {selectedLog.targetId && (
                  <div className="col-span-2 bg-muted/30 p-3 rounded-xl border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">Target Entity / Subscriber ID</span>
                    <span className="text-primary font-mono font-bold mt-0.5 block">{selectedLog.targetId}</span>
                  </div>
                )}
              </div>

              {/* JSON Metadata Viewer */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="bg-muted/40 p-3.5 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Raw JSON Metadata Payload
                    </label>
                    <button
                      onClick={() => handleCopy(JSON.stringify(selectedLog.metadata, null, 2), "modal-json")}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {copiedId === "modal-json" ? (
                        <>
                          <Check size={12} className="text-emerald-500" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy JSON
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-foreground bg-card p-3 rounded-lg overflow-x-auto max-h-48 border border-border">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
              <button
                onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2), selectedLog.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer shadow-xs"
              >
                {copiedId === selectedLog.id ? (
                  <>
                    <Check size={14} className="text-emerald-500" /> Copied Full Record!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Full Log
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:opacity-95 text-white transition-all cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Simulate / Create Log Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <form
            onSubmit={handleSimulateLog}
            className="bg-card border border-border rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-primary" />
                <h3 className="text-base font-bold text-foreground">Create Custom Activity Log Entry</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Category & Subsystem</label>
                <select
                  value={customType}
                  onChange={e => setCustomType(e.target.value as LogType)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground outline-none focus:border-primary shadow-xs"
                >
                  <option value="payment">Payment & Billing Collection</option>
                  <option value="customer">Customer & Subscriber Profile</option>
                  <option value="network">Network & OLT Operations</option>
                  <option value="security">Security & MAC Binding Policy</option>
                  <option value="auth">Auth & Session Security</option>
                  <option value="billing">Billing & Grace Days</option>
                  <option value="package">Package & Bandwidth Queue</option>
                  <option value="system">System & Database Engine</option>
                </select>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Severity Level</label>
                <select
                  value={customSeverity}
                  onChange={e => setCustomSeverity(e.target.value as LogSeverity)}
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground outline-none focus:border-primary shadow-xs"
                >
                  <option value="info">Info (Standard Event)</option>
                  <option value="success">Success (Completed Action)</option>
                  <option value="warning">Warning (Requires Attention)</option>
                  <option value="error">Error / Security Violation</option>
                </select>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Action Title</label>
                <input
                  required
                  value={customAction}
                  onChange={e => setCustomAction(e.target.value)}
                  placeholder="e.g. Manual Bandwidth Override Applied"
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground outline-none focus:border-primary shadow-xs"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Detailed Log Message</label>
                <textarea
                  required
                  rows={3}
                  value={customDetail}
                  onChange={e => setCustomDetail(e.target.value)}
                  placeholder="e.g. Boosted downlink bandwidth temporarily for video conference event."
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground outline-none focus:border-primary shadow-xs"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Target Subscriber / Device ID (Optional)</label>
                <input
                  value={customTargetId}
                  onChange={e => setCustomTargetId(e.target.value)}
                  placeholder="e.g. CUST-1002 or OLT-01"
                  className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground outline-none focus:border-primary shadow-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary hover:opacity-95 text-white transition-all shadow-xs cursor-pointer"
              >
                Dispatch Log
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
