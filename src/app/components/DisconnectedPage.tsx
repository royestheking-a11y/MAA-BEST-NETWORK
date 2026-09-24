import { useState, useMemo } from "react";
import {
  WifiOff, Search, Download, Send, Zap, PhoneCall,
  CheckCircle2, X, AlertTriangle, Clock, ChevronLeft, ChevronRight, Circle,
  Filter, Users, DollarSign, ArrowUpDown, ArrowUp, ArrowDown, Ban,
  RefreshCw, Check, Receipt, CreditCard, ShieldAlert, Layers
} from "lucide-react";
import { useCustomerContext, Customer, PaymentTransaction } from "../context/CustomerContext";
import { useLanguage } from "../context/LanguageContext";
import { usePermission } from "../context/AuthContext";

interface DisconnectedPageProps {
  onNavigate?: (page: string) => void;
}

type TabType = "all" | "nonPayment" | "hardware" | "adminSuspended";
type SortDirection = "asc" | "desc";

export function DisconnectedPage({ onNavigate }: DisconnectedPageProps) {
  const {
    customers,
    toggleNetStatus,
    bulkUpdateStatus,
    processPayment,
    setActiveCustomer
  } = useCustomerContext();
  const { t } = useLanguage();
  const { canEdit, canDelete, isReadOnly } = usePermission("disconnected");

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [subZoneFilter, setSubZoneFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [offlineDaysFilter, setOfflineDaysFilter] = useState("all");

  // Selection & Pagination
  const [selected, setSelected] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>("disconnectedDays");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Modals
  const [reconnectModalCust, setReconnectModalCust] = useState<Customer | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const [paymentModalCust, setPaymentModalCust] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction["method"]>("Cash");
  const [paymentTrxId, setPaymentTrxId] = useState<string>("");
  const [autoReconnectOnPayment, setAutoReconnectOnPayment] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [smsModalCust, setSmsModalCust] = useState<Customer | null>(null);
  const [smsText, setSmsText] = useState("");
  const [isSendingSms, setIsSendingSms] = useState(false);

  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // Derive live disconnected / offline / suspended customers from database
  const disconnectedList = useMemo(() => {
    return customers
      .filter(c => c.status === "disconnected" || c.status === "suspended" || c.netStatus === "offline")
      .map(c => {
        const rawDue = c.dueAmount !== undefined ? c.dueAmount : (c.due !== undefined ? c.due : 0);
        const dueAmount = rawDue > 0 ? rawDue : (c.status === "due" || c.status === "suspended" ? (c.price || 0) : 0);

        // Compute disconnected days from daysRemaining or logoutTime
        let disconnectedDays = 1;
        if (c.daysRemaining < 0) {
          disconnectedDays = Math.abs(c.daysRemaining) + 1;
        } else if (c.status === "disconnected" || c.status === "suspended") {
          disconnectedDays = Math.max(2, 30 - c.daysRemaining);
        }

        // Determine specific cause of disconnection
        let reason = "Service Suspended";
        let reasonCategory: "nonPayment" | "hardware" | "adminSuspended" = "nonPayment";

        if (dueAmount > 0) {
          reason = "Non-Payment / Billing Overdue";
          reasonCategory = "nonPayment";
        } else if (c.disabledInMikrotik || c.disabledInSystem || c.status === "suspended") {
          reason = "Admin Manual Suspension";
          reasonCategory = "adminSuspended";
        } else {
          reason = "Fiber Cut / ONU Power Loss";
          reasonCategory = "hardware";
        }

        return {
          id: c.id,
          clientCode: c.clientCode || c.id,
          name: c.name,
          phone: c.phone,
          zone: c.zone || "Main Zone",
          subzone: c.subzone || "General Sub Zone",
          box: c.box || "DP-Main",
          package: c.package || `${c.downloadSpeedMbps || 20} Mbps`,
          speed: c.speed || `${c.downloadSpeedMbps || 20}M/${c.uploadSpeedMbps || 10}M`,
          price: c.price || 800,
          dueAmount,
          disconnectedOn: c.endDate || c.logoutTime || "Recent Offline",
          disconnectedDays,
          reason,
          reasonCategory,
          pppUser: c.pppUser || c.id,
          ipAddress: c.ipAddress || "—",
          mikrotik: c.serverName || c.mikrotik || "MikroTik-01",
          rawCustomer: c
        };
      });
  }, [customers]);

  // Dynamic filter options
  const availableZones = useMemo(() => {
    const set = new Set<string>();
    disconnectedList.forEach(c => { if (c.zone) set.add(c.zone); });
    return ["all", ...Array.from(set).sort()];
  }, [disconnectedList]);

  const availableSubZones = useMemo(() => {
    const set = new Set<string>();
    disconnectedList.forEach(c => { if (c.subzone) set.add(c.subzone); });
    return ["all", ...Array.from(set).sort()];
  }, [disconnectedList]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: disconnectedList.length,
      nonPayment: disconnectedList.filter(c => c.reasonCategory === "nonPayment").length,
      hardware: disconnectedList.filter(c => c.reasonCategory === "hardware").length,
      adminSuspended: disconnectedList.filter(c => c.reasonCategory === "adminSuspended").length,
    };
  }, [disconnectedList]);

  // Filtered dataset
  const filtered = useMemo(() => {
    return disconnectedList.filter(c => {
      // Tab filter
      if (activeTab === "nonPayment" && c.reasonCategory !== "nonPayment") return false;
      if (activeTab === "hardware" && c.reasonCategory !== "hardware") return false;
      if (activeTab === "adminSuspended" && c.reasonCategory !== "adminSuspended") return false;

      // Dropdowns
      if (zoneFilter !== "all" && c.zone !== zoneFilter) return false;
      if (subZoneFilter !== "all" && c.subzone !== subZoneFilter) return false;

      if (reasonFilter !== "all") {
        if (reasonFilter === "nonPayment" && c.reasonCategory !== "nonPayment") return false;
        if (reasonFilter === "hardware" && c.reasonCategory !== "hardware") return false;
        if (reasonFilter === "adminSuspended" && c.reasonCategory !== "adminSuspended") return false;
      }

      if (offlineDaysFilter !== "all") {
        if (offlineDaysFilter === "1to7" && (c.disconnectedDays < 1 || c.disconnectedDays > 7)) return false;
        if (offlineDaysFilter === "8to14" && (c.disconnectedDays < 8 || c.disconnectedDays > 14)) return false;
        if (offlineDaysFilter === "15to30" && (c.disconnectedDays < 15 || c.disconnectedDays > 30)) return false;
        if (offlineDaysFilter === "above30" && c.disconnectedDays <= 30) return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          c.clientCode.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.pppUser.toLowerCase().includes(q) ||
          c.ipAddress.includes(q) ||
          c.zone.toLowerCase().includes(q) ||
          c.subzone.toLowerCase().includes(q) ||
          c.box.toLowerCase().includes(q) ||
          c.package.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    disconnectedList,
    activeTab,
    zoneFilter,
    subZoneFilter,
    reasonFilter,
    offlineDaysFilter,
    search
  ]);

  // Sorting
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const sortedCustomers = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      switch (sortKey) {
        case "clientCode":
          valA = a.clientCode;
          valB = b.clientCode;
          break;
        case "name":
          valA = a.name;
          valB = b.name;
          break;
        case "phone":
          valA = a.phone;
          valB = b.phone;
          break;
        case "pppUser":
          valA = a.pppUser;
          valB = b.pppUser;
          break;
        case "package":
          valA = a.package;
          valB = b.package;
          break;
        case "zone":
          valA = a.zone;
          valB = b.zone;
          break;
        case "disconnectedDays":
          valA = a.disconnectedDays;
          valB = b.disconnectedDays;
          break;
        case "dueAmount":
          valA = a.dueAmount;
          valB = b.dueAmount;
          break;
        case "reason":
          valA = a.reason;
          valB = b.reason;
          break;
        default:
          valA = a.disconnectedDays;
          valB = b.disconnectedDays;
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filtered, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedCustomers.slice(startIdx, startIdx + pageSize);
  }, [sortedCustomers, currentPage, pageSize]);

  // Metrics
  const totalDue = filtered.reduce((s, c) => s + c.dueAmount, 0);
  const grandTotalDue = disconnectedList.reduce((s, c) => s + c.dueAmount, 0);
  const avgDaysOffline = disconnectedList.length > 0
    ? Math.round(disconnectedList.reduce((s, c) => s + c.disconnectedDays, 0) / disconnectedList.length)
    : 0;

  // Selection
  const allChecked = paginatedCustomers.length > 0 && paginatedCustomers.every(c => selected.includes(c.id));

  const toggleAll = () => {
    if (allChecked) {
      const pageIds = new Set(paginatedCustomers.map(c => c.id));
      setSelected(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const newSelected = new Set([...selected, ...paginatedCustomers.map(c => c.id)]);
      setSelected(Array.from(newSelected));
    }
  };

  const toggleOne = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Reconnection Action
  const handleExecuteReconnect = (cust: Customer) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Reconnecting lines is restricted in read-only mode.");
      return;
    }
    setIsReconnecting(true);
    setTimeout(() => {
      toggleNetStatus(cust.id, true);
      setIsReconnecting(false);
      setReconnectModalCust(null);
      showToast(`✓ Reconnected line for ${cust.name} (${cust.clientCode || cust.id}) and synced with ${cust.serverName || "MikroTik"}.`);
    }, 700);
  };

  // Payment Settlement Action
  const openPaymentModal = (cust: Customer) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Collecting payments is restricted in read-only mode.");
      return;
    }
    setPaymentModalCust(cust);
    const due = cust.dueAmount !== undefined && cust.dueAmount > 0 ? cust.dueAmount : (cust.price || 800);
    setPaymentAmount(String(due));
    setPaymentMethod("Cash");
    setPaymentTrxId(`TRX-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleExecutePayment = () => {
    if (!paymentModalCust) return;
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Processing payments is restricted in read-only mode.");
      return;
    }
    const amountNum = Number(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    setIsProcessingPayment(true);
    setTimeout(() => {
      const res = processPayment(paymentModalCust.id, amountNum, paymentMethod, paymentTrxId);
      if (autoReconnectOnPayment) {
        toggleNetStatus(paymentModalCust.id, true);
      }
      setIsProcessingPayment(false);
      setPaymentModalCust(null);
      showToast(`✓ Payment of ৳${amountNum.toLocaleString()} collected & line ${autoReconnectOnPayment ? "reconnected" : "updated"} for ${paymentModalCust.name} (Receipt: ${res.trxId})!`);
    }, 700);
  };

  // SMS Action
  const openSmsModal = (cust: Customer) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Sending SMS is restricted in read-only mode.");
      return;
    }
    setSmsModalCust(cust);
    const due = cust.dueAmount !== undefined && cust.dueAmount > 0 ? cust.dueAmount : (cust.price || 0);
    if (due > 0) {
      setSmsText(
        `Dear ${cust.name}, your ISP line for ID ${cust.clientCode || cust.id} is disconnected due to overdue bill of ৳${due.toLocaleString()}. Pay now to reactivate service immediately.`
      );
    } else {
      setSmsText(
        `Dear ${cust.name}, your ISP internet service for ID ${cust.clientCode || cust.id} has been paused. Please contact our support team at 01700-000000 for quick reactivation.`
      );
    }
  };

  const handleSendSms = () => {
    if (!smsModalCust) return;
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Sending SMS is restricted in read-only mode.");
      return;
    }
    setIsSendingSms(true);
    setTimeout(() => {
      setIsSendingSms(false);
      setSmsModalCust(null);
      showToast(`✓ SMS notice dispatched to ${smsModalCust.phone} successfully.`);
    }, 700);
  };

  // Bulk Actions
  const handleBulkReconnect = () => {
    if (selected.length === 0) return;
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Bulk reconnect is restricted in read-only mode.");
      return;
    }
    bulkUpdateStatus(selected, "active", "online");
    showToast(`✓ Re-authorized and reconnected lines for ${selected.length} selected subscriber(s).`);
    setSelected([]);
  };

  const handleBulkSms = () => {
    if (selected.length === 0) return;
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Bulk SMS is restricted in read-only mode.");
      return;
    }
    showToast(`✓ Dispatched bulk reconnection notices to ${selected.length} selected subscriber(s).`);
  };

  // Export CSV Action
  const handleExportCSV = () => {
    const headers = [
      "Client Code",
      "Customer Name",
      "Mobile Phone",
      "PPPoE Username",
      "Package",
      "Zone",
      "Sub Zone",
      "Box",
      "Disconnected On",
      "Days Offline",
      "Disconnection Reason",
      "Due Amount (BDT)",
      "Server Name"
    ];

    const rows = sortedCustomers.map(c => [
      `"${c.clientCode}"`,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.pppUser}"`,
      `"${c.package}"`,
      `"${c.zone}"`,
      `"${c.subzone}"`,
      `"${c.box}"`,
      `"${c.disconnectedOn}"`,
      `"${c.disconnectedDays}"`,
      `"${c.reason}"`,
      `"${c.dueAmount}"`,
      `"${c.mikrotik}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `disconnected-customers-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 max-w-[1600px] mx-auto min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl bg-slate-900 text-white text-sm font-medium border border-rose-500/40 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <WifiOff size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Disconnected Customers</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                {disconnectedList.length} Offline Accounts
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Client Management</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">Disconnected & Offline</span>
              <span>·</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold font-mono">
                Outstanding: ৳{grandTotalDue.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-card text-foreground border border-border hover:bg-muted shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            title="Export CSV Report"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => onNavigate?.("online-clients")}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Zap size={14} />
            <span>Online Clients</span>
          </button>
        </div>
      </div>

      {/* 4 Real-Time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Disconnected */}
        <div className="rounded-xl p-4 md:p-5 bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 flex items-center justify-center">
              <WifiOff size={22} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600">
              Offline Roster
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-3">Total Disconnected</p>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-mono mt-0.5">
            {disconnectedList.length}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Accounts with no active RouterOS traffic
          </p>
        </div>

        {/* Total Outstanding Due */}
        <div className="rounded-xl p-4 md:p-5 bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
              Overdue
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-3">Total Outstanding Due</p>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 font-mono mt-0.5">
            ৳{totalDue.toLocaleString()}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Pending collection from offline users
          </p>
        </div>

        {/* Avg Days Offline */}
        <div className="rounded-xl p-4 md:p-5 bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Clock size={22} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
              Downtime
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-3">Avg Days Offline</p>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            {avgDaysOffline} Days
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Average elapsed time since disconnect
          </p>
        </div>

        {/* Restorable Lines */}
        <div className="rounded-xl p-4 md:p-5 bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Zap size={22} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
              Ready to Reconnect
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-3">Restorable Lines</p>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {disconnectedList.length}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            1-click instant RouterOS re-authorization
          </p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setActiveTab("all"); setCurrentPage(1); }}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Layers size={13} />
            <span>All Disconnected</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-inherit font-mono">
              {tabCounts.all}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab("nonPayment"); setCurrentPage(1); }}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "nonPayment"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs font-bold"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <AlertTriangle size={13} />
            <span>Non-Payment Due</span>
            {tabCounts.nonPayment > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 text-white font-mono">
                {tabCounts.nonPayment}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("hardware"); setCurrentPage(1); }}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "hardware"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs font-bold"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <WifiOff size={13} />
            <span>Fiber / Power Loss</span>
            {tabCounts.hardware > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 text-white font-mono">
                {tabCounts.hardware}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("adminSuspended"); setCurrentPage(1); }}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "adminSuspended"
                ? "bg-amber-600 text-white border-amber-600 shadow-xs font-bold"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Ban size={13} />
            <span>Admin Suspended</span>
            {tabCounts.adminSuspended > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 text-white font-mono">
                {tabCounts.adminSuspended}
              </span>
            )}
          </button>
        </div>

        {/* Selected Batch Counter */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl animate-in fade-in">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {selected.length} Selected
            </span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-xs font-mono font-bold text-foreground">
              ৳{selected.reduce((s, id) => s + (disconnectedList.find(c => c.id === id)?.dueAmount || 0), 0).toLocaleString()} Due
            </span>
          </div>
        )}
      </div>

      {/* Advanced Filter Box */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Zone Filter</label>
            <select
              value={zoneFilter}
              onChange={e => { setZoneFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Zones</option>
              {availableZones.filter(z => z !== "all").map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Sub Zone Filter</label>
            <select
              value={subZoneFilter}
              onChange={e => { setSubZoneFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Sub Zones</option>
              {availableSubZones.filter(sz => sz !== "all").map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Disconnection Reason</label>
            <select
              value={reasonFilter}
              onChange={e => { setReasonFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Reasons</option>
              <option value="nonPayment">Non-Payment / Billing Overdue</option>
              <option value="hardware">Fiber / Power Loss</option>
              <option value="adminSuspended">Admin Manual Suspension</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Offline Duration</label>
            <select
              value={offlineDaysFilter}
              onChange={e => { setOfflineDaysFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Durations</option>
              <option value="1to7">1 - 7 Days Offline</option>
              <option value="8to14">8 - 14 Days Offline</option>
              <option value="15to30">15 - 30 Days Offline</option>
              <option value="above30">30+ Days Offline (Long-term)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Actions Bar (when 1+ selected, hidden in read-only) */}
      {selected.length > 0 && !isReadOnly && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-foreground">
              Batch Operations for {selected.length} Offline Subscriber(s)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBulkReconnect}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Zap size={14} />
              <span>Bulk Reconnect ({selected.length})</span>
            </button>

            <button
              onClick={handleBulkSms}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send size={13} />
              <span>Bulk Send SMS</span>
            </button>

            <button
              onClick={() => setSelected([])}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table Top Controls: Entries & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>SHOW</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2.5 py-1.5 rounded-md bg-card border border-border text-foreground outline-none text-xs"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
          </select>
          <span>ENTRIES</span>
          <span className="text-muted-foreground/60 hidden sm:inline">|</span>
          <span className="hidden sm:inline font-mono text-[11px]">
            Filtered: <strong className="text-foreground">{sortedCustomers.length}</strong> / {disconnectedList.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground uppercase">Search:</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search code, name, phone, IP..."
              className="w-56 sm:w-72 px-3 py-1.5 text-xs rounded-md bg-card border border-border text-foreground outline-none focus:border-primary placeholder:text-muted-foreground/50"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); setCurrentPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Disconnected Data Table */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/80 text-foreground border-b border-border font-bold select-none">
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                </th>

                {/* Sortable Header Columns */}
                <th
                  onClick={() => handleSort("clientCode")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Subscriber ID / Code</span>
                    {sortKey === "clientCode" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Customer Name</span>
                    {sortKey === "name" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("phone")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Contact & PPPoE</span>
                    {sortKey === "phone" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("package")}
                  className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Package & Rate</span>
                    {sortKey === "package" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("zone")}
                  className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Zone & DP Box</span>
                    {sortKey === "zone" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("disconnectedDays")}
                  className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Disconnected On / Days</span>
                    {sortKey === "disconnectedDays" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("reason")}
                  className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Reason</span>
                    {sortKey === "reason" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("dueAmount")}
                  className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Due Amount</span>
                    {sortKey === "dueAmount" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                <th className="py-3 px-3.5 font-semibold tracking-wider text-center whitespace-nowrap">Instant Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-muted-foreground text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 size={36} className="text-emerald-500 opacity-80" />
                      <p className="font-bold text-foreground">Zero Disconnected Subscribers</p>
                      <p className="text-xs text-muted-foreground">
                        All subscriber accounts in this filter group are online and actively routing traffic.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c, idx) => {
                  const isSelected = selected.includes(c.id);

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isSelected ? "bg-primary/5" : idx % 2 === 1 ? "bg-muted/15" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(c.id)}
                          className="rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                        />
                      </td>

                      {/* Code & ID */}
                      <td className="py-3 px-3.5 font-mono text-foreground font-medium whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActiveCustomer(c.rawCustomer);
                            onNavigate?.("customer-profile");
                          }}
                          className="text-left hover:underline hover:text-primary transition-colors cursor-pointer font-bold"
                          title="Open Subscriber Profile"
                        >
                          {c.clientCode}
                        </button>
                        <p className="text-[10px] text-muted-foreground font-mono">{c.id}</p>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-3.5 font-medium text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-muted border border-border text-foreground font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{c.mikrotik}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact & PPPoE */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <p className="font-mono text-foreground">{c.phone}</p>
                        <p className="font-mono text-teal-600 dark:text-teal-400 text-[11px]">{c.pppUser}</p>
                      </td>

                      {/* Package & Rate */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <p className="font-medium text-foreground">{c.package}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">৳{c.price.toLocaleString()}/mo</p>
                      </td>

                      {/* Zone & DP Box */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <p className="text-foreground">{c.zone}</p>
                        <p className="text-[10px] text-muted-foreground">{c.subzone} · {c.box}</p>
                      </td>

                      {/* Disconnected On / Days */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Circle size={6} className="fill-rose-500 text-rose-500" />
                          <span className="font-medium text-rose-600 dark:text-rose-400">{c.disconnectedOn}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                          {c.disconnectedDays} day(s) offline
                        </p>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.reasonCategory === "nonPayment"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              : c.reasonCategory === "hardware"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {c.reason}
                        </span>
                      </td>

                      {/* Due Amount */}
                      <td className="py-3 px-3.5 font-mono font-bold text-sm text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {c.dueAmount > 0 ? `৳${c.dueAmount.toLocaleString()}` : "৳0"}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Reconnect Button */}
                          <button
                            onClick={() => !isReadOnly && canEdit && setReconnectModalCust(c.rawCustomer)}
                            disabled={isReadOnly || !canEdit}
                            title={isReadOnly || !canEdit ? "Read-only mode: Reconnecting lines is restricted" : "Authorize & Reconnect Line"}
                            className={`px-2.5 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all ${
                              isReadOnly || !canEdit
                                ? "opacity-30 cursor-not-allowed bg-muted/40 text-muted-foreground border border-border"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer border border-emerald-500/20"
                            }`}
                          >
                            <Zap size={13} />
                            <span>Reconnect</span>
                          </button>

                          {/* Collect Payment (if due > 0) */}
                          {c.dueAmount > 0 && (
                            <button
                              onClick={() => !isReadOnly && canEdit && openPaymentModal(c.rawCustomer)}
                              disabled={isReadOnly || !canEdit}
                              title={isReadOnly || !canEdit ? "Read-only mode: Collecting payments is restricted" : "Collect Due & Reconnect"}
                              className={`p-1.5 rounded-lg transition-all ${
                                isReadOnly || !canEdit
                                  ? "opacity-30 cursor-not-allowed bg-muted/40 text-muted-foreground border border-border"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer border border-amber-500/20"
                              }`}
                            >
                              <Receipt size={14} />
                            </button>
                          )}

                          {/* Send SMS Reminder */}
                          <button
                            onClick={() => !isReadOnly && canEdit && openSmsModal(c.rawCustomer)}
                            disabled={isReadOnly || !canEdit}
                            title={isReadOnly || !canEdit ? "Read-only mode: Sending SMS is restricted" : "Send SMS Notice"}
                            className={`p-1.5 rounded-lg transition-all ${
                              isReadOnly || !canEdit
                                ? "opacity-30 cursor-not-allowed bg-muted/40 text-muted-foreground border border-border"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 cursor-pointer border border-blue-500/20"
                            }`}
                          >
                            <Send size={13} />
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

        {/* Footer Pagination & Range summary */}
        <div className="p-3.5 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            Showing {sortedCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedCustomers.length)} of {sortedCustomers.length} offline accounts
            {sortedCustomers.length !== disconnectedList.length && ` (filtered from ${disconnectedList.length} total)`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>

            {/* Page buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((page, index, array) => {
                const prev = array[index - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsis && <span className="px-1 text-muted-foreground">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-2.5 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Confirm Reconnection Modal */}
      {reconnectModalCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Zap size={20} className="text-emerald-500" />
                <h3 className="text-base font-bold text-foreground">Confirm Line Reconnection</h3>
              </div>
              <button
                onClick={() => setReconnectModalCust(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1.5 border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Subscriber:</span> <span className="font-bold text-foreground">{reconnectModalCust.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Client Code:</span> <span className="font-mono text-primary font-bold">{reconnectModalCust.clientCode || reconnectModalCust.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">PPPoE User:</span> <span className="font-mono text-teal-600 dark:text-teal-400">{reconnectModalCust.pppUser || reconnectModalCust.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Server / Router:</span> <span className="font-mono text-foreground">{reconnectModalCust.serverName || reconnectModalCust.mikrotik || "MikroTik-01"}</span></div>
              </div>

              {(reconnectModalCust.dueAmount || 0) > 0 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle size={14} />
                    <span>Outstanding Due Warning</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    This subscriber has an unpaid balance of <strong>৳{(reconnectModalCust.dueAmount || 0).toLocaleString()}</strong>. Reconnecting will re-authorize their internet traffic on MikroTik immediately.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setReconnectModalCust(null)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteReconnect(reconnectModalCust)}
                disabled={isReconnecting || isReadOnly || !canEdit}
                className={`px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 ${
                  isReconnecting || isReadOnly || !canEdit ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground" : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                }`}
              >
                <Zap size={14} />
                <span>{isReconnecting ? "Reconnecting..." : "Reconnect Now"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Payment Collection & Reconnect Modal */}
      {paymentModalCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Receipt size={20} className="text-emerald-500" />
                <h3 className="text-base font-bold text-foreground">Collect Due & Reactivate Line</h3>
              </div>
              <button
                onClick={() => setPaymentModalCust(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1.5 border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Subscriber:</span> <span className="font-bold text-foreground">{paymentModalCust.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Client Code:</span> <span className="font-mono text-primary font-bold">{paymentModalCust.clientCode || paymentModalCust.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Outstanding Due:</span> <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400">৳{(paymentModalCust.dueAmount || paymentModalCust.price || 0).toLocaleString()}</span></div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Collection Amount (BDT)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-muted border border-border text-foreground font-mono font-bold outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Cash", "bKash", "Nagad", "Rocket", "Upay", "Card"] as PaymentTransaction["method"][]).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        paymentMethod === method
                          ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                          : "bg-muted border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Transaction ID / Slip Ref</label>
                <input
                  type="text"
                  value={paymentTrxId}
                  onChange={e => setPaymentTrxId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground font-mono outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoReconnect"
                  checked={autoReconnectOnPayment}
                  onChange={e => setAutoReconnectOnPayment(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <label htmlFor="autoReconnect" className="text-xs text-foreground cursor-pointer font-medium">
                  Automatically Reconnect & Unblock Line on MikroTik
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setPaymentModalCust(null)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePayment}
                disabled={isProcessingPayment || isReadOnly || !canEdit}
                className={`px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 ${
                  isProcessingPayment || isReadOnly || !canEdit ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground" : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                }`}
              >
                <Check size={14} />
                <span>{isProcessingPayment ? "Processing..." : `Collect ৳${Number(paymentAmount || 0).toLocaleString()} & Reactivate`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Send SMS Modal */}
      {smsModalCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Send size={20} className="text-blue-500" />
                <h3 className="text-base font-bold text-foreground">Send SMS Notice</h3>
              </div>
              <button
                onClick={() => setSmsModalCust(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1.5 border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Recipient:</span> <span className="font-bold text-foreground">{smsModalCust.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Mobile Phone:</span> <span className="font-mono text-primary font-bold">{smsModalCust.phone}</span></div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Message Content</label>
                <textarea
                  rows={4}
                  value={smsText}
                  onChange={e => setSmsText(e.target.value)}
                  className="w-full p-3 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setSmsModalCust(null)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSms}
                disabled={isSendingSms || !smsText.trim() || isReadOnly || !canEdit}
                className={`px-5 py-2 rounded-lg font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 ${
                  isSendingSms || !smsText.trim() || isReadOnly || !canEdit ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground" : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                }`}
              >
                <Send size={14} />
                <span>{isSendingSms ? "Dispatching..." : "Send SMS Now"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
