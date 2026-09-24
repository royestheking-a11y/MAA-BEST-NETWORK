import { useState, useMemo } from "react";
import {
  AlertTriangle, Search, Phone, MessageSquare, Clock, Ban, WifiOff, Wifi,
  ChevronDown, X, CheckCircle2, Send, Filter, Download, Users, DollarSign,
  ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Check, CreditCard,
  RefreshCw, Eye, ShieldAlert, Sparkles, Layers, SlidersHorizontal, Receipt,
  Edit2, Trash2, Sliders, Power, ShieldCheck
} from "lucide-react";
import { useCustomerContext, Customer, CustomerStatus, PaymentTransaction } from "../context/CustomerContext";
import { useLanguage } from "../context/LanguageContext";
import { usePermission } from "../context/AuthContext";

interface DueCustomersPageProps {
  onNavigate?: (page: string) => void;
}

type TabType = "all" | "critical" | "grace" | "suspended";
type SortDirection = "asc" | "desc";

export function DueCustomersPage({ onNavigate }: DueCustomersPageProps) {
  const {
    customers,
    updateCustomer,
    deleteCustomer,
    processPayment,
    toggleNetStatus,
    grantExtraDays,
    bulkUpdateStatus,
    setActiveCustomer
  } = useCustomerContext();
  const { canEdit, canDelete, isReadOnly } = usePermission("due-customers");
  const { t } = useLanguage();

  // Active Tab & Filters
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [subZoneFilter, setSubZoneFilter] = useState("all");
  const [dueRangeFilter, setDueRangeFilter] = useState("all");
  const [overdueDaysFilter, setOverdueDaysFilter] = useState("all");

  // Selection & Pagination
  const [selected, setSelected] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>("amount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Interactive Action Modals
  const [paymentModalCust, setPaymentModalCust] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentTransaction["method"]>("Cash");
  const [paymentTrxId, setPaymentTrxId] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Edit Due & Status Modal
  const [editDueModalCust, setEditDueModalCust] = useState<Customer | null>(null);
  const [editDueForm, setEditDueForm] = useState({
    dueAmount: "",
    status: "due" as CustomerStatus,
    netStatus: "online" as "online" | "offline",
    note: "",
  });

  // Delete Customer Modal
  const [deleteConfirmCust, setDeleteConfirmCust] = useState<Customer | null>(null);

  const [graceModalCust, setGraceModalCust] = useState<Customer | null>(null);
  const [graceDays, setGraceDays] = useState<string>("3");
  const [graceReason, setGraceReason] = useState<string>("");

  const [smsModalCust, setSmsModalCust] = useState<Customer | null>(null);
  const [smsMessageText, setSmsMessageText] = useState<string>("");
  const [isSendingSms, setIsSendingSms] = useState(false);

  const [bulkGraceModalOpen, setBulkGraceModalOpen] = useState(false);
  const [bulkGraceDays, setBulkGraceDays] = useState("3");

  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const openEditDueModal = (cust: Customer) => {
    if (isReadOnly) {
      showToast("Access Restricted: Your role only has Read (View Only) permission.");
      return;
    }
    setEditDueModalCust(cust);
    const rawAmt = cust.dueAmount !== undefined ? cust.dueAmount : (cust.due !== undefined ? cust.due : (cust.price || 800));
    setEditDueForm({
      dueAmount: String(rawAmt),
      status: cust.status || "due",
      netStatus: cust.netStatus === "offline" ? "offline" : "online",
      note: "",
    });
  };

  const handleSaveEditDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Modifying due details is restricted in read-only mode.");
      return;
    }
    if (!editDueModalCust) return;
    const newAmt = Math.max(0, Number(editDueForm.dueAmount) || 0);
    
    // Auto-adjust status if amount is set to 0
    let finalStatus = editDueForm.status;
    if (newAmt === 0 && finalStatus === "due") {
      finalStatus = "active";
    }

    updateCustomer(editDueModalCust.id, {
      dueAmount: newAmt,
      due: newAmt,
      status: finalStatus,
      netStatus: editDueForm.netStatus,
      disabledInMikrotik: editDueForm.netStatus === "offline",
    });

    showToast(`Updated ${editDueModalCust.name}: Due ৳${newAmt.toLocaleString()} | Status: ${finalStatus.toUpperCase()} (${editDueForm.netStatus})`);
    setEditDueModalCust(null);
  };

  const handleQuickClearDue = (cust: Customer) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Clearing due is restricted in read-only mode.");
      return;
    }
    updateCustomer(cust.id, {
      dueAmount: 0,
      due: 0,
      status: "active",
      netStatus: "online",
      disabledInMikrotik: false,
    });
    showToast(`Cleared due to ৳0 and enabled line (Active) for ${cust.name}`);
  };

  const handleDeleteDueCustomer = () => {
    if (!deleteConfirmCust) return;
    if (isReadOnly || !canDelete) {
      showToast("Access Restricted: Full delete permission is required to delete subscribers.");
      return;
    }
    deleteCustomer(deleteConfirmCust.id);
    showToast(`Removed customer ${deleteConfirmCust.name} (${deleteConfirmCust.id}) from system.`);
    setDeleteConfirmCust(null);
  };

  // Derive live due customer items from Firestore customer roster (Excludes Free Tier subscribers)
  const dueCustomers = useMemo(() => {
    return customers
      .filter(c => {
        if (c.userType === "free") return false;
        const amount = c.dueAmount !== undefined ? c.dueAmount : (c.due !== undefined ? c.due : 0);
        return amount > 0 || c.status === "due" || c.status === "suspended";
      })
      .map(c => {
        const rawAmount = c.dueAmount !== undefined ? c.dueAmount : (c.due !== undefined ? c.due : 0);
        const amount = rawAmount > 0 ? rawAmount : (c.price || 800);
        
        // Compute overdue days
        let daysOverdue = 0;
        if (c.daysRemaining <= 0) {
          daysOverdue = Math.abs(c.daysRemaining) + 1;
        } else if (c.status === "due" || c.status === "suspended") {
          daysOverdue = Math.max(1, 30 - c.daysRemaining);
        }

        // Determine live due status
        let liveStatus: "due" | "grace" | "suspended" = "due";
        if (c.status === "suspended" || (c.netStatus === "offline" && c.disabledInMikrotik)) {
          liveStatus = "suspended";
        } else if (c.daysRemaining > 0 && c.daysRemaining <= 5) {
          liveStatus = "grace";
        } else {
          liveStatus = "due";
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
          amount,
          daysOverdue,
          status: liveStatus,
          netStatus: c.netStatus,
          pppoe: c.pppUser || c.id,
          ipAddress: c.ipAddress || "—",
          rawCustomer: c
        };
      });
  }, [customers]);

  // Dynamic filter options
  const availableZones = useMemo(() => {
    const set = new Set<string>();
    dueCustomers.forEach(c => { if (c.zone) set.add(c.zone); });
    return ["all", ...Array.from(set).sort()];
  }, [dueCustomers]);

  const availableSubZones = useMemo(() => {
    const set = new Set<string>();
    dueCustomers.forEach(c => { if (c.subzone) set.add(c.subzone); });
    return ["all", ...Array.from(set).sort()];
  }, [dueCustomers]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: dueCustomers.length,
      critical: dueCustomers.filter(c => c.daysOverdue >= 15).length,
      grace: dueCustomers.filter(c => c.status === "grace").length,
      suspended: dueCustomers.filter(c => c.status === "suspended").length,
    };
  }, [dueCustomers]);

  // Filtered dataset
  const filtered = useMemo(() => {
    return dueCustomers.filter(c => {
      // Tab filter
      if (activeTab === "critical" && c.daysOverdue < 15) return false;
      if (activeTab === "grace" && c.status !== "grace") return false;
      if (activeTab === "suspended" && c.status !== "suspended") return false;

      // Dropdown filters
      if (zoneFilter !== "all" && c.zone !== zoneFilter) return false;
      if (subZoneFilter !== "all" && c.subzone !== subZoneFilter) return false;

      if (dueRangeFilter !== "all") {
        if (dueRangeFilter === "under1000" && c.amount >= 1000) return false;
        if (dueRangeFilter === "1000to2500" && (c.amount < 1000 || c.amount > 2500)) return false;
        if (dueRangeFilter === "above2500" && c.amount <= 2500) return false;
      }

      if (overdueDaysFilter !== "all") {
        if (overdueDaysFilter === "1to7" && (c.daysOverdue < 1 || c.daysOverdue > 7)) return false;
        if (overdueDaysFilter === "8to14" && (c.daysOverdue < 8 || c.daysOverdue > 14)) return false;
        if (overdueDaysFilter === "15to30" && (c.daysOverdue < 15 || c.daysOverdue > 30)) return false;
        if (overdueDaysFilter === "above30" && c.daysOverdue <= 30) return false;
      }

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          c.clientCode.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.pppoe.toLowerCase().includes(q) ||
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
    dueCustomers,
    activeTab,
    zoneFilter,
    subZoneFilter,
    dueRangeFilter,
    overdueDaysFilter,
    search
  ]);

  // Sorting handlers & sorted dataset
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
        case "pppoe":
          valA = a.pppoe;
          valB = b.pppoe;
          break;
        case "package":
          valA = a.package;
          valB = b.package;
          break;
        case "zone":
          valA = a.zone;
          valB = b.zone;
          break;
        case "daysOverdue":
          valA = a.daysOverdue;
          valB = b.daysOverdue;
          break;
        case "amount":
          valA = a.amount;
          valB = b.amount;
          break;
        case "status":
          valA = a.status;
          valB = b.status;
          break;
        default:
          valA = a.amount;
          valB = b.amount;
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filtered, sortKey, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedCustomers.slice(startIdx, startIdx + pageSize);
  }, [sortedCustomers, currentPage, pageSize]);

  // Metrics
  const totalDue = filtered.reduce((s, c) => s + c.amount, 0);
  const grandTotalDue = dueCustomers.reduce((s, c) => s + c.amount, 0);

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

  // Quick Action Handlers
  const openPaymentModal = (c: Customer) => {
    if (isReadOnly) {
      showToast("Access Restricted: Your role only has Read (View Only) permission.");
      return;
    }
    setPaymentModalCust(c);
    const amount = c.dueAmount !== undefined && c.dueAmount > 0 ? c.dueAmount : (c.price || 800);
    setPaymentAmount(String(amount));
    setPaymentMethod("Cash");
    setPaymentTrxId(`TRX-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleExecutePayment = () => {
    if (!paymentModalCust) return;
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Processing payment is restricted in read-only mode.");
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
      setIsProcessingPayment(false);
      setPaymentModalCust(null);
      showToast(`Payment of ৳${amountNum.toLocaleString()} collected successfully for ${paymentModalCust.name} (Receipt: ${res.trxId})!`);
    }, 600);
  };

  const openGraceModal = (c: Customer) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Your role only has Read (View Only) permission.");
      return;
    }
    setGraceModalCust(c);
    setGraceDays("3");
    setGraceReason("Subscriber promised to clear bill by weekend.");
  };

  const handleExecuteGrace = () => {
    if (!graceModalCust) return;
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Granting grace period is restricted in read-only mode.");
      return;
    }
    const daysNum = Number(graceDays) || 3;
    grantExtraDays(graceModalCust.id, daysNum);
    setGraceModalCust(null);
    showToast(`Granted ${daysNum} days grace period to ${graceModalCust.name}. Line kept active.`);
  };

  const openSmsModal = (c: Customer) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Your role only has Read (View Only) permission.");
      return;
    }
    setSmsModalCust(c);
    const amount = c.dueAmount !== undefined && c.dueAmount > 0 ? c.dueAmount : (c.price || 800);
    setSmsMessageText(
      `Dear ${c.name}, your ISP Internet bill of ৳${amount.toLocaleString()} for ID ${c.clientCode || c.id} is overdue. Please pay via bKash/Nagad to avoid line disconnection. Thank you!`
    );
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
      showToast(`SMS payment reminder dispatched to ${smsModalCust.phone} successfully!`);
    }, 700);
  };

  const handleToggleLine = (cust: Customer) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Toggling subscriber line is restricted in read-only mode.");
      return;
    }
    const nextNetStatus = cust.netStatus === "online" ? false : true;
    toggleNetStatus(cust.id, nextNetStatus);
    showToast(`${nextNetStatus ? "Restored" : "Suspended"} internet service for ${cust.name} (${cust.clientCode || cust.id})`);
  };

  // Bulk Actions
  const handleBulkSms = () => {
    if (selected.length === 0) return;
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Bulk SMS is restricted in read-only mode.");
      return;
    }
    showToast(`Sent automated SMS payment reminders to ${selected.length} selected subscriber(s).`);
  };

  const handleBulkSuspend = () => {
    if (selected.length === 0) return;
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Bulk suspending is restricted in read-only mode.");
      return;
    }
    if (window.confirm(`Are you sure you want to suspend internet service for ${selected.length} overdue subscriber(s)?`)) {
      bulkUpdateStatus(selected, "suspended", "offline");
      showToast(`Suspended internet access for ${selected.length} subscriber(s).`);
      setSelected([]);
    }
  };

  const handleBulkRestore = () => {
    if (selected.length === 0) return;
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Bulk restoring is restricted in read-only mode.");
      return;
    }
    bulkUpdateStatus(selected, "active", "online");
    showToast(`Restored and re-authorized lines for ${selected.length} subscriber(s).`);
    setSelected([]);
  };

  const handleBulkGraceApply = () => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Bulk grace period is restricted in read-only mode.");
      return;
    }
    const daysNum = Number(bulkGraceDays) || 3;
    selected.forEach(id => {
      grantExtraDays(id, daysNum);
    });
    setBulkGraceModalOpen(false);
    showToast(`Granted ${daysNum} days grace period to ${selected.length} selected subscriber(s).`);
    setSelected([]);
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
      "Days Overdue",
      "Due Amount (BDT)",
      "Due Status",
      "Line Status"
    ];

    const rows = sortedCustomers.map(c => [
      `"${c.clientCode}"`,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.pppoe}"`,
      `"${c.package}"`,
      `"${c.zone}"`,
      `"${c.subzone}"`,
      `"${c.box}"`,
      `"${c.daysOverdue}"`,
      `"${c.amount}"`,
      `"${c.status.toUpperCase()}"`,
      `"${c.netStatus === "online" ? "Online" : "Offline"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `due-customers-report-${new Date().toISOString().slice(0, 10)}.csv`);
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
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Due Customers Management</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                {dueCustomers.length} Outstanding Accounts
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Billing & Accounts</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">Due Customers</span>
              <span>·</span>
              <span className="text-rose-600 dark:text-rose-400 font-semibold font-mono">
                Total Due: ৳{grandTotalDue.toLocaleString()}
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
            <span className="hidden sm:inline">Export Due List</span>
          </button>

          <button
            onClick={() => onNavigate?.("store-pos")}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-95 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CreditCard size={14} />
            <span>Open Cash POS</span>
          </button>
        </div>
      </div>

      {/* 4 Large Real-Time KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding */}
        <div className="rounded-xl p-4 md:p-5 bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <DollarSign size={22} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
              Live Total
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-3">Total Outstanding</p>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground font-mono mt-0.5">
            ৳{totalDue.toLocaleString()}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Across {filtered.length} filtered subscriber accounts
          </p>
        </div>

        {/* Due Status (Pending Invoices) */}
        <div className="rounded-xl p-4 md:p-5 bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600">
              Action Req.
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-3">Pending Overdue</p>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 font-mono mt-0.5">
            {dueCustomers.filter(c => c.status === "due").length}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Accounts awaiting billing settlement
          </p>
        </div>

        {/* Grace Period */}
        <div className="rounded-xl p-4 md:p-5 bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Clock size={22} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
              Grace Active
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-3">In Grace Period</p>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400 font-mono mt-0.5">
            {tabCounts.grace}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Temporary line extension authorized
          </p>
        </div>

        {/* Suspended Lines */}
        <div className="rounded-xl p-4 md:p-5 bg-card border border-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 flex items-center justify-center">
              <Ban size={22} />
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
              Blocked
            </span>
          </div>
          <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mt-3">Lines Suspended</p>
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-red-600 dark:text-red-400 font-mono mt-0.5">
            {tabCounts.suspended}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            MikroTik & OLT traffic blocked
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
            <span>All Due Customers</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-inherit font-mono">
              {tabCounts.all}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab("critical"); setCurrentPage(1); }}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "critical"
                ? "bg-rose-600 text-white border-rose-600 shadow-xs font-bold"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <ShieldAlert size={13} />
            <span>Critical Overdue (&gt;15 Days)</span>
            {tabCounts.critical > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 text-white font-mono">
                {tabCounts.critical}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("grace"); setCurrentPage(1); }}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "grace"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs font-bold"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Clock size={13} />
            <span>Grace Period</span>
            {tabCounts.grace > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 text-white font-mono">
                {tabCounts.grace}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("suspended"); setCurrentPage(1); }}
            className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5 ${
              activeTab === "suspended"
                ? "bg-red-700 text-white border-red-700 shadow-xs font-bold"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Ban size={13} />
            <span>Suspended</span>
            {tabCounts.suspended > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 text-white font-mono">
                {tabCounts.suspended}
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
              ৳{selected.reduce((s, id) => s + (dueCustomers.find(c => c.id === id)?.amount || 0), 0).toLocaleString()} Due
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
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Due Amount Range</label>
            <select
              value={dueRangeFilter}
              onChange={e => { setDueRangeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Amounts</option>
              <option value="under1000">Under ৳1,000</option>
              <option value="1000to2500">৳1,000 - ৳2,500</option>
              <option value="above2500">Above ৳2,500 (High Due)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Overdue Duration</label>
            <select
              value={overdueDaysFilter}
              onChange={e => { setOverdueDaysFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">All Overdue Ranges</option>
              <option value="1to7">1 - 7 Days Overdue</option>
              <option value="8to14">8 - 14 Days Overdue</option>
              <option value="15to30">15 - 30 Days Overdue</option>
              <option value="above30">30+ Days Overdue (Severe)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batch Operations Bar (when 1+ clients selected, hidden in read-only) */}
      {selected.length > 0 && !isReadOnly && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            <span className="text-xs font-bold text-foreground">
              Batch Actions for {selected.length} Selected Subscriber(s)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBulkSms}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send size={13} />
              <span>Bulk Send SMS ({selected.length})</span>
            </button>

            <button
              onClick={() => setBulkGraceModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Clock size={13} />
              <span>Bulk Grant Grace</span>
            </button>

            <button
              onClick={handleBulkSuspend}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Ban size={13} />
              <span>Bulk Suspend Lines</span>
            </button>

            <button
              onClick={handleBulkRestore}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Wifi size={13} />
              <span>Bulk Re-Authorize</span>
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
            Filtered: <strong className="text-foreground">{sortedCustomers.length}</strong> / {dueCustomers.length}
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

      {/* Main Due Customers Data Table */}
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
                    <span>Mobile Phone</span>
                    {sortKey === "phone" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("pppoe")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>PPPoE / IP</span>
                    {sortKey === "pppoe" ? (
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
                    <span>Package & Speed</span>
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
                  onClick={() => handleSort("daysOverdue")}
                  className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Overdue</span>
                    {sortKey === "daysOverdue" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("amount")}
                  className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Due Amount</span>
                    {sortKey === "amount" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("status")}
                  className="py-3 px-3.5 font-semibold tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    {sortKey === "status" ? (
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
                  <td colSpan={10} className="py-14 text-center text-muted-foreground text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 size={36} className="text-emerald-500 opacity-80" />
                      <p className="font-bold text-foreground">Zero Overdue Subscribers Found</p>
                      <p className="text-xs text-muted-foreground">
                        All subscriber accounts match the selected filter criteria or are fully up to date with billing.
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{c.name}</span>
                          {c.netStatus === "online" ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="ONU Online" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" title="ONU Offline" />
                          )}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3.5 font-mono text-muted-foreground whitespace-nowrap">
                        <a href={`tel:${c.phone}`} className="hover:text-primary transition-colors">
                          {c.phone}
                        </a>
                      </td>

                      {/* PPPoE & IP */}
                      <td className="py-3 px-3.5 font-mono text-foreground whitespace-nowrap">
                        <div className="font-medium text-teal-600 dark:text-teal-400">{c.pppoe}</div>
                        <div className="text-[10px] text-muted-foreground">{c.ipAddress}</div>
                      </td>

                      {/* Package */}
                      <td className="py-3 px-3.5 text-foreground whitespace-nowrap">
                        <span className="font-medium">{c.package}</span>
                        <span className="text-[10px] text-muted-foreground ml-1 font-mono">({c.speed})</span>
                      </td>

                      {/* Zone & DP Box */}
                      <td className="py-3 px-3.5 text-foreground whitespace-nowrap">
                        <div>{c.zone}</div>
                        <div className="text-[10px] text-muted-foreground">{c.subzone} · {c.box}</div>
                      </td>

                      {/* Days Overdue */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                            c.daysOverdue >= 20
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : c.daysOverdue >= 10
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {c.daysOverdue}d overdue
                        </span>
                      </td>

                      {/* Amount Due */}
                      <td className="py-3 px-3.5 font-mono font-extrabold text-sm text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        ৳{c.amount.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {c.status === "suspended" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20">
                            <Ban size={11} className="mr-1" /> Suspended
                          </span>
                        ) : c.status === "grace" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Clock size={11} className="mr-1" /> Grace Period
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <AlertTriangle size={11} className="mr-1" /> Overdue
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Due & Status */}
                          <button
                            onClick={() => !isReadOnly && canEdit && openEditDueModal(c.rawCustomer)}
                            disabled={isReadOnly || !canEdit}
                            title={isReadOnly || !canEdit ? "Read-only mode: Editing due details is restricted" : "Edit Due Amount & Line Status"}
                            className={`p-1.5 rounded-lg transition-all border ${
                              isReadOnly || !canEdit
                                ? "opacity-30 cursor-not-allowed bg-muted/40 text-muted-foreground border-border"
                                : "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer border-primary/20"
                            }`}
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Quick Clear Due (৳0) */}
                          <button
                            onClick={() => !isReadOnly && canEdit && handleQuickClearDue(c.rawCustomer)}
                            disabled={isReadOnly || !canEdit}
                            title={isReadOnly || !canEdit ? "Read-only mode: Clearing due is restricted" : "Quick Clear Due to ৳0 & Enable Line"}
                            className={`p-1.5 rounded-lg transition-all border ${
                              isReadOnly || !canEdit
                                ? "opacity-30 cursor-not-allowed bg-muted/40 text-muted-foreground border-border"
                                : "bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 cursor-pointer border-teal-500/20"
                            }`}
                          >
                            <DollarSign size={13} />
                          </button>

                          {/* Collect Payment */}
                          <button
                            onClick={() => !isReadOnly && canEdit && openPaymentModal(c.rawCustomer)}
                            disabled={isReadOnly || !canEdit}
                            title={isReadOnly || !canEdit ? "Read-only mode: Collecting payment is restricted" : "Collect Payment (Cash / Mobile Banking)"}
                            className={`p-1.5 rounded-lg transition-all border ${
                              isReadOnly || !canEdit
                                ? "opacity-30 cursor-not-allowed bg-muted/40 text-muted-foreground border-border"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer border-emerald-500/20"
                            }`}
                          >
                            <CheckCircle2 size={13} />
                          </button>

                          {/* Send SMS Reminder */}
                          <button
                            onClick={() => !isReadOnly && canEdit && openSmsModal(c.rawCustomer)}
                            disabled={isReadOnly || !canEdit}
                            title={isReadOnly || !canEdit ? "Read-only mode: Sending SMS is restricted" : "Send SMS Payment Reminder"}
                            className={`p-1.5 rounded-lg transition-all border ${
                              isReadOnly || !canEdit
                                ? "opacity-30 cursor-not-allowed bg-muted/40 text-muted-foreground border-border"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 cursor-pointer border-blue-500/20"
                            }`}
                          >
                            <MessageSquare size={13} />
                          </button>

                          {/* Grant Grace Period */}
                          <button
                            onClick={() => !isReadOnly && canEdit && openGraceModal(c.rawCustomer)}
                            disabled={isReadOnly || !canEdit}
                            title={isReadOnly || !canEdit ? "Read-only mode: Granting grace is restricted" : "Grant Grace Period"}
                            className={`p-1.5 rounded-lg transition-all border ${
                              isReadOnly || !canEdit
                                ? "opacity-30 cursor-not-allowed bg-muted/40 text-muted-foreground border-border"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer border-amber-500/20"
                            }`}
                          >
                            <Clock size={13} />
                          </button>

                          {/* Disconnect / Reconnect Line */}
                          <button
                            onClick={() => !isReadOnly && canEdit && handleToggleLine(c.rawCustomer)}
                            disabled={isReadOnly || !canEdit}
                            title={isReadOnly || !canEdit ? "Read-only mode: Toggling line is restricted" : (c.netStatus === "online" ? "Suspend / Disable Line" : "Enable / Re-authorize Line")}
                            className={`p-1.5 rounded-lg transition-all border ${
                              isReadOnly || !canEdit
                                ? "opacity-30 cursor-not-allowed bg-muted/40 text-muted-foreground border-border"
                                : c.netStatus === "online"
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 cursor-pointer border-rose-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer border-emerald-500/20"
                            }`}
                          >
                            {c.netStatus === "online" ? <WifiOff size={13} /> : <Wifi size={13} />}
                          </button>

                          {/* Delete Customer */}
                          <button
                            onClick={() => !isReadOnly && canDelete && setDeleteConfirmCust(c.rawCustomer)}
                            disabled={isReadOnly || !canDelete}
                            title={isReadOnly || !canDelete ? "Read-only mode: Deleting subscriber is restricted" : "Delete / Remove Subscriber"}
                            className={`p-1.5 rounded-lg transition-all border ${
                              isReadOnly || !canDelete
                                ? "opacity-30 cursor-not-allowed bg-muted/40 text-muted-foreground border-border"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 cursor-pointer border-rose-500/20"
                            }`}
                          >
                            <Trash2 size={13} />
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
            {Math.min(currentPage * pageSize, sortedCustomers.length)} of {sortedCustomers.length} due customers
            {sortedCustomers.length !== dueCustomers.length && ` (filtered from ${dueCustomers.length} total)`}
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

      {/* MODAL 1: Payment Collection Modal */}
      {paymentModalCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Receipt size={20} className="text-emerald-500" />
                <h3 className="text-base font-bold text-foreground">Collect Subscriber Payment</h3>
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
                <div className="flex justify-between"><span className="text-muted-foreground">Customer Name:</span> <span className="font-bold text-foreground">{paymentModalCust.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Subscriber Code:</span> <span className="font-mono text-primary font-bold">{paymentModalCust.clientCode || paymentModalCust.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">PPPoE User:</span> <span className="font-mono text-teal-600 dark:text-teal-400">{paymentModalCust.pppUser || paymentModalCust.id}</span></div>
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
                disabled={isProcessingPayment}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>{isProcessingPayment ? "Processing..." : `Confirm Payment ৳${Number(paymentAmount || 0).toLocaleString()}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Grace Period Modal */}
      {graceModalCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-amber-500" />
                <h3 className="text-base font-bold text-foreground">Grant Grace Extension</h3>
              </div>
              <button
                onClick={() => setGraceModalCust(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1.5 border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground">Subscriber:</span> <span className="font-bold text-foreground">{graceModalCust.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Client Code:</span> <span className="font-mono text-primary">{graceModalCust.clientCode || graceModalCust.id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Due Amount:</span> <span className="font-mono font-bold text-rose-600">৳{(graceModalCust.dueAmount || graceModalCust.price || 0).toLocaleString()}</span></div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Grace Period (Days to extend)</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {["1", "3", "5", "7"].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setGraceDays(d)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        graceDays === d
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-muted border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={graceDays}
                  onChange={e => setGraceDays(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground font-mono outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Reason / Commitment Note</label>
                <input
                  type="text"
                  value={graceReason}
                  onChange={e => setGraceReason(e.target.value)}
                  placeholder="e.g. Promised payment on 15th"
                  className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setGraceModalCust(null)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteGrace}
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                Grant Grace ({graceDays}d)
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
                <MessageSquare size={20} className="text-blue-500" />
                <h3 className="text-base font-bold text-foreground">Send SMS Reminder</h3>
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
                <div className="flex justify-between"><span className="text-muted-foreground">Phone Number:</span> <span className="font-mono text-primary font-bold">{smsModalCust.phone}</span></div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">SMS Message Body</label>
                <textarea
                  rows={4}
                  value={smsMessageText}
                  onChange={e => setSmsMessageText(e.target.value)}
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
                disabled={isSendingSms}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send size={14} />
                <span>{isSendingSms ? "Dispatching..." : "Send SMS Now"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Bulk Grace Days Modal */}
      {bulkGraceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-amber-500" />
                <h3 className="text-base font-bold text-foreground">Bulk Grace Extension</h3>
              </div>
              <button
                onClick={() => setBulkGraceModalOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground">
                Apply a temporary billing grace period for all <strong className="text-foreground">{selected.length}</strong> selected accounts. Lines will stay active without automatic suspension.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Grace Duration</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {["1", "3", "5", "7"].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setBulkGraceDays(d)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        bulkGraceDays === d
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-muted border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setBulkGraceModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkGraceApply}
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                Apply to {selected.length} Subscribers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Edit Due Amount & Line Status Modal */}
      {editDueModalCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Sliders size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Edit Due Amount & Line Status</h3>
                  <p className="text-[11px] text-muted-foreground">{editDueModalCust.name} ({editDueModalCust.clientCode || editDueModalCust.id})</p>
                </div>
              </div>
              <button
                onClick={() => setEditDueModalCust(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditDue} className="space-y-4 text-xs">
              {/* Due Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-foreground uppercase">
                    Due Amount (৳ BDT) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditDueForm(p => ({ ...p, dueAmount: "0" }))}
                    className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Set to ৳0 (Clear Due)
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">৳</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={editDueForm.dueAmount}
                    onChange={e => setEditDueForm(p => ({ ...p, dueAmount: e.target.value }))}
                    placeholder="e.g. 0 or 1200"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-muted border border-border text-foreground font-mono font-bold text-sm outline-none focus:border-primary"
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Setting due amount to ৳0 will automatically clear any arrears and enable account restoration.
                </p>
              </div>

              {/* Account Status Selection */}
              <div>
                <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                  Account Status
                </label>
                <select
                  value={editDueForm.status}
                  onChange={e => setEditDueForm(p => ({ ...p, status: e.target.value as CustomerStatus }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-xs font-semibold outline-none focus:border-primary"
                >
                  <option value="active">Active (Standard Active Subscriber)</option>
                  <option value="due">Due (Outstanding Payment Due)</option>
                  <option value="suspended">Suspended / Disabled (Disconnected)</option>
                  <option value="grace">Grace Period (Temporary Extension)</option>
                  <option value="inactive">Inactive (Account Terminated)</option>
                </select>
              </div>

              {/* Line Enable / Disable Toggle */}
              <div>
                <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                  MikroTik PPPoE Line Authorization
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditDueForm(p => ({ ...p, netStatus: "online" }))}
                    className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editDueForm.netStatus === "online"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-muted border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Wifi size={14} /> Enable Line (Online)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDueForm(p => ({ ...p, netStatus: "offline" }))}
                    className={`py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      editDueForm.netStatus === "offline"
                        ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                        : "bg-muted border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <WifiOff size={14} /> Disable Line (Offline)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditDueModalCust(null)}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReadOnly || !canEdit}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-1.5 ${
                    isReadOnly || !canEdit ? "opacity-40 cursor-not-allowed bg-muted-foreground text-white" : "bg-primary hover:opacity-95 text-white cursor-pointer"
                  }`}
                >
                  <Check size={14} /> Save Due & Status Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: Delete Customer Confirmation Modal */}
      {deleteConfirmCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Confirm Subscriber Deletion</h3>
                <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete subscriber <strong className="text-foreground">{deleteConfirmCust.name}</strong> ({deleteConfirmCust.id})? All credentials, invoices, and due records will be removed.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setDeleteConfirmCust(null)}
                className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDueCustomer}
                disabled={isReadOnly || !canDelete}
                className={`px-5 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
                  isReadOnly || !canDelete ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground" : "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                }`}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
