import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Users, Search, Filter, Plus, ChevronLeft, ChevronRight,
  Wifi, WifiOff, AlertTriangle, Ban, Circle, Phone, MapPin,
  Package, Eye, MessageSquare, CreditCard, Download,
  X, Check, Clock, CheckCircle2, XCircle, Send, RefreshCw, Zap, FileText,
  Copy, Lock, Unlock, ExternalLink, Key, Smartphone, Sliders, Sparkles,
  Network, Server, Shield, Radio, CheckCheck, Save, ShieldAlert, ArrowRight,
  Edit2, Edit3, Tag, UserCheck, ShieldCheck, ArrowUp, ArrowDown, ArrowUpDown, Trash2, Calendar,
  RotateCcw, Archive, History
} from "lucide-react";
import { useCustomerContext, Customer, CustomerStatus, parseSafeDate } from "../context/CustomerContext";
import { useLanguage } from "../context/LanguageContext";
import { useNetxLiveData, type NetxLiveCustomer } from "../services/netxApiService";
import { usePermission } from "../context/AuthContext";
import { billingStore, type IspPackage } from "./billing/billingData";
import { networkStore } from "./network/networkData";

const statusConfig: Record<CustomerStatus, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  active: { label: "Active", bg: "#DCFCE7", color: "#16A34A", icon: Check },
  offline: { label: "Offline", bg: "#F3F4F6", color: "#6B7280", icon: WifiOff },
  due: { label: "Due", bg: "#FEF3C7", color: "#D97706", icon: AlertTriangle },
  suspended: { label: "Suspended", bg: "#FEE2E2", color: "#DC2626", icon: Ban },
  disconnected: { label: "Disconnected", bg: "#F3F4F6", color: "#374151", icon: WifiOff },
};

const ZONES = ["Madaripur Sadar", "Kalkini", "Shibchar", "Rajoir", "Dashar"];
const SUBZONES: Record<string, string[]> = {
  "Madaripur Sadar": ["Puran Bazar", "Notun Bazar", "Charmuguria", "Mastofapur", "Kulpadia"],
  Kalkini: ["Somitir Hat", "Kalkini Bazar", "Gopalpur", "Sahebrampur", "Enayetnagar"],
  Shibchar: ["Shibchar Bazar", "Pachchar", "Bandarkhola", "Kathalbari", "Utrail"],
  Rajoir: ["Tekerhat", "Rajoir Bazar", "Kadambari", "Khalia"],
  Dashar: ["Dashar Bazar", "Nabagram", "Bakulbari"],
};
const PACKAGES = [
  "35M — ৳500",
  "50M — ৳600",
  "80M — ৳800",
  "100M — ৳1,000",
  "10 Mbps — ৳1,000"
];

export const BANDWIDTH_TIERS = [
  { id: "35m", label: "35M", down: 35, up: 35, price: 500, tag: "35 Mbps Primary Tier" },
  { id: "50m", label: "50M", down: 50, up: 50, price: 600, tag: "50 Mbps Gaming & Stream" },
  { id: "80m", label: "80M", down: 80, up: 80, price: 800, tag: "80 Mbps Power Users" },
  { id: "100m", label: "100M", down: 100, up: 100, price: 1000, tag: "100 Mbps Gigabit Ready" },
  { id: "10m", label: "10 Mbps", down: 10, up: 10, price: 1000, tag: "10 Mbps Corporate Lease" }
];

export const IP_POOLS = [
  { id: "pool-35", name: "Pool-35: 10.215.35.0/24 (Subscribers)", prefix: "10.215.35.", start: 2, startHost: 2 },
  { id: "pool-36", name: "Pool-36: 10.215.36.0/24 (Subscribers)", prefix: "10.215.36.", start: 2, startHost: 2 },
  { id: "pool-37", name: "Pool-37: 10.215.37.0/24 (Subscribers)", prefix: "10.215.37.", start: 2, startHost: 2 },
  { id: "pool-38", name: "Pool-38: 10.215.38.0/24 (Subscribers)", prefix: "10.215.38.", start: 2, startHost: 2 },
  { id: "pool-39", name: "Pool-39: 10.215.39.0/24 (Subscribers)", prefix: "10.215.39.", start: 2, startHost: 2 },
  { id: "pool-pub", name: "Pool-Public: 103.12.173.128/26 (Static IPs)", prefix: "103.12.173.", start: 130, startHost: 130 },
  { id: "pool-corp", name: "Pool-Corporate: 172.16.50.0/24 (Corporate Leased)", prefix: "172.16.50.", start: 2, startHost: 2 }
];

export const AVAILABLE_PACKAGES: IspPackage[] = billingStore.getPackages();
const MIKROTIKS = ["DC-CA"];
const OLTS = ["OLT1", "OLT2"];
const DEFAULT_PAGE_SIZE = 100;

function StatusBadge({ status }: { status: CustomerStatus }) {
  const { t } = useLanguage();
  const cfg = statusConfig[status] || statusConfig.active;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: cfg.bg, fontSize: 11, fontWeight: 600, color: cfg.color }}>
      <Icon size={10} /> {t(cfg.label)}
    </span>
  );
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl"
      style={{ background: "#130606", color: "#fff", fontSize: 13, fontWeight: 500, animation: "slideUp 0.2s ease" }}>
      <style>{`@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <CheckCircle2 size={16} style={{ color: "#4ADE80", flexShrink: 0 }} />
      {msg}
      <button onClick={onClose} className="ml-2"><X size={14} style={{ color: "rgba(255,255,255,0.5)" }} /></button>
    </div>
  );
}

function exportCSV(customers: Customer[]) {
  const headers = ["ID", "Passcode", "Name", "Phone", "Email", "Zone", "Sub-Zone", "Package", "Price", "Status", "PPPoE User", "IP Address", "MAC Address", "MAC Bound", "MikroTik", "OLT", "Join Date", "Due Amount"];
  const rows = customers.map(c => [c.id, c.passcode, c.name, c.phone, c.email, c.zone, c.subzone, c.package, c.price, c.status, c.pppUser, c.ipAddress, c.mac, c.macBound !== false ? "YES" : "NO", c.mikrotik, c.olt, c.joinDate, c.dueAmount]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `customers_export_${new Date().toISOString().split("T")[0]}.csv`; a.click();
  URL.revokeObjectURL(url);
}

const DRAWER_TABS = ["Overview", "Identity & ID", "Network & Product", "Service Info", "Credentials", "Billing", "Payments", "Activity"] as const;
type DrawerTab = typeof DRAWER_TABS[number];

interface CustomersPageProps {
  onNavigate?: (page: string) => void;
}

export function CustomersPage({ onNavigate }: CustomersPageProps) {
  const {
    customers,
    deletedCustomers,
    setActiveCustomer,
    addCustomer,
    toggleNetStatus,
    processPayment,
    updateCustomer,
    generateDefaultPasscode,
    changePackage,
    upgradeRequests,
    approveUpgradeRequest,
    rejectUpgradeRequest,
    bulkUpdateStatus,
    grantExtraDays,
    bindMac,
    unbindMac,
    setUserType,
    bulkSetUserType,
    deleteCustomer,
    restoreCustomer,
    permanentlyPurgeCustomer,
  } = useCustomerContext();
  const { t, bnNum, isBangla } = useLanguage();
  const { liveStats } = useNetxLiveData(30000);

  const liveStatsMap = useMemo(() => {
    const map = new Map<string, NetxLiveCustomer>();
    if (Array.isArray(liveStats)) {
      liveStats.forEach(ls => {
        const candidates = [ls.pppoe_username, ls.full_name, ls.user_id];
        candidates.forEach(cand => {
          if (cand) {
            const clean = String(cand).toLowerCase().trim();
            map.set(clean, ls);
            map.set(clean.replace(/@/g, ""), ls);
            map.set(clean.replace(/[^a-z0-9]/g, ""), ls);
            if (clean.startsWith("mbn") && !clean.startsWith("mbn@")) {
              map.set("mbn@" + clean.slice(3), ls);
            }
          }
        });
      });
    }
    return map;
  }, [liveStats]);

  // ── Search & Premium Filter State ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all" | "deleted">("all");
  const [netStatusFilter, setNetStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [macBindFilter, setMacBindFilter] = useState<"all" | "bound" | "unbound">("all");
  const [userTypeFilter, setUserTypeFilter] = useState<"all" | "normal" | "free" | "unlimited">("all");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");
  const [dueFilter, setDueFilter] = useState<"all" | "has_due" | "paid">("all");
  const [itemsPerPage, setItemsPerPage] = useState<number>(100);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string>("clientCode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setPage(1);
  };

  // ── Top Horizontal Scroll Bar: Zero-Rerender Hardware-Accelerated Controller ──
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  const updateScrollBounds = useCallback(() => {
    if (tableScrollRef.current && sliderRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = tableScrollRef.current;
      const max = Math.max(1, scrollWidth - clientWidth);
      sliderRef.current.max = String(max);
      sliderRef.current.value = String(scrollLeft);
    }
  }, []);

  const handleTableScroll = () => {
    if (tableScrollRef.current && sliderRef.current) {
      sliderRef.current.value = String(tableScrollRef.current.scrollLeft);
    }
  };

  const handleSliderInput = (e: React.FormEvent<HTMLInputElement>) => {
    const val = Number((e.target as HTMLInputElement).value);
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = val;
    }
  };

  useEffect(() => {
    updateScrollBounds();
    const timer = setTimeout(updateScrollBounds, 150);
    window.addEventListener("resize", updateScrollBounds);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScrollBounds);
    };
  }, [customers, statusFilter, itemsPerPage, page, updateScrollBounds]);

  // Dynamic filter lists
  const allZones = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => {
      if (c.zone) set.add(c.zone);
      if (c.subzone) set.add(c.subzone);
    });
    return Array.from(set).filter(Boolean).sort();
  }, [customers]);

  const allPackages = useMemo(() => {
    const set = new Set<string>();
    customers.forEach(c => {
      if (c.package) set.add(c.package);
    });
    return Array.from(set).filter(Boolean).sort();
  }, [customers]);

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-xs outline-none transition-all";
  const inputStyle = { background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" };

  const { canEdit, isReadOnly } = usePermission("customers");

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("Overview");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [smsModal, setSmsModal] = useState(false);
  const [smsText, setSmsText] = useState("");
  const [paymentModal, setPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"bKash" | "Nagad" | "Rocket" | "Upay" | "Card" | "Cash">("bKash");
  const [payTxId, setPayTxId] = useState("");

  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [rechargeDate, setRechargeDate] = useState("");

  // ── Quick Edit Subscriber Modal State ──
  const [editModalCustomer, setEditModalCustomer] = useState<Customer | null>(null);
  const [editSubForm, setEditSubForm] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    userType: "normal" as "normal" | "free" | "unlimited",
    package: "35M — ৳500",
    price: 500,
    speed: "35/35",
    pppUser: "",
    pppPass: "",
    passcode: "",
    mac: "",
    macBound: true,
    zone: "Madaripur Sadar",
    subzone: "Somitir Hat",
    status: "active" as CustomerStatus,
  });

  const [deleteConfirmCust, setDeleteConfirmCust] = useState<Customer | null>(null);
  const [deleteReason, setDeleteReason] = useState<string>("Customer relocation / service discontinued");
  const [restoreConfirmCust, setRestoreConfirmCust] = useState<Customer | null>(null);
  const [purgeConfirmCust, setPurgeConfirmCust] = useState<Customer | null>(null);

  const handleDeleteCustomer = (c: Customer) => {
    deleteCustomer(c.id, deleteReason || "Customer relocation / service discontinued");
    if (selectedCustomer?.id === c.id || selectedCustomer?.clientCode === c.clientCode) setSelectedCustomer(null);
    if (editModalCustomer?.id === c.id || editModalCustomer?.clientCode === c.clientCode) setEditModalCustomer(null);
    setDeleteConfirmCust(null);
    setToast(`✓ Subscriber "${c.name}" (${c.clientCode || c.id}) moved to Deleted Accounts Archive. Secret de-provisioned from MikroTik.`);
    setTimeout(() => setToast(""), 4000);
  };

  const handleRestoreCustomer = (c: Customer) => {
    restoreCustomer(c.id);
    if (selectedCustomer?.id === c.id || selectedCustomer?.clientCode === c.clientCode) setSelectedCustomer(null);
    setRestoreConfirmCust(null);
    setToast(`✓ Subscriber "${c.name}" (${c.clientCode || c.id}) restored to Active Subscribers and re-provisioned on MikroTik.`);
    setTimeout(() => setToast(""), 4000);
  };

  const handlePurgeCustomer = (c: Customer) => {
    permanentlyPurgeCustomer(c.id);
    if (selectedCustomer?.id === c.id || selectedCustomer?.clientCode === c.clientCode) setSelectedCustomer(null);
    setPurgeConfirmCust(null);
    setToast(`✓ Subscriber record "${c.name}" (${c.clientCode || c.id}) permanently removed from system.`);
    setTimeout(() => setToast(""), 4000);
  };

  const openEditSubscriberModal = (c: Customer) => {
    if (isReadOnly || !canEdit) {
      setToast("Access Restricted: View Only Mode. Modifying subscriber details is restricted.");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    setEditModalCustomer(c);
    const resolvedMac = c.mac || c.callingStationId || "";
    setEditSubForm({
      id: c.clientCode || c.id || "",
      name: c.name || "",
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      userType: c.userType || "normal",
      package: c.package || "35M — ৳500",
      price: c.price || c.monthlyBill || 500,
      speed: c.speed || "35/35",
      pppUser: c.pppUser || "",
      pppPass: c.pppPass || "",
      passcode: c.passcode || `mbn@${(c.clientCode || c.id).replace(/\D/g, "")}`,
      mac: resolvedMac,
      macBound: c.macBound !== false && Boolean(resolvedMac && resolvedMac.trim()),
      zone: c.zone || "Madaripur Sadar",
      subzone: c.subzone || "Somitir Hat",
      status: c.status || "active",
    });
  };

  const handleSaveEditSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !canEdit) {
      setToast("Access Restricted: View Only Mode. Modifying subscriber details is restricted.");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    if (!editModalCustomer) return;
    const targetId = editModalCustomer.id;
    const newId = (editSubForm.id || targetId).trim().toUpperCase();
    if (!newId) {
      setToast("Error: Subscriber ID cannot be empty.");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    const cleanMac = editSubForm.mac.trim().toLowerCase();
    const isFree = editSubForm.userType === "free";
    const updates: Partial<Customer> = {
      id: newId,
      clientCode: newId,
      name: editSubForm.name.trim(),
      phone: editSubForm.phone.trim(),
      email: editSubForm.email.trim(),
      address: editSubForm.address.trim(),
      userType: editSubForm.userType,
      package: editSubForm.package,
      profile: editSubForm.package.split(/[—\-]/)[0].trim() || "35M",
      price: isFree ? 0 : (Number(editSubForm.price) || editModalCustomer.price || 500),
      monthlyBill: isFree ? 0 : (Number(editSubForm.price) || editModalCustomer.monthlyBill || 500),
      speed: editSubForm.speed || "35/35",
      pppUser: editSubForm.pppUser.trim(),
      pppPass: editSubForm.pppPass.trim(),
      passcode: editSubForm.passcode.trim(),
      mac: cleanMac,
      boundMac: editSubForm.macBound ? cleanMac : "",
      callingStationId: editSubForm.macBound ? cleanMac : "",
      macBound: editSubForm.macBound,
      zone: editSubForm.zone,
      subzone: editSubForm.subzone,
      status: isFree ? "active" : editSubForm.status,
      ...(isFree ? { dueAmount: 0, due: 0, netStatus: "online" as const } : {}),
    };

    updateCustomer(targetId, updates);
    if (selectedCustomer && selectedCustomer.id === targetId) {
      setSelectedCustomer(prev => prev ? { ...prev, ...updates, id: newId, clientCode: newId } : null);
    }
    setEditModalCustomer(null);
    setToast(`Subscriber ID & profile (${editSubForm.userType.toUpperCase()}) updated successfully as ${newId}!`);
    setTimeout(() => setToast(""), 3500);
  };

  // ── Technical & Service Drawer Edit Form State ──
  const [netForm, setNetForm] = useState<Partial<Customer>>({});
  const [serviceForm, setServiceForm] = useState<Partial<Customer>>({});
  const [isSavingDrawer, setIsSavingDrawer] = useState(false);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [personalForm, setPersonalForm] = useState<Partial<Customer>>({});
  const [extraDays, setExtraDays] = useState("3");
  const [credForm, setCredForm] = useState({ pppUser: "", pppPass: "", passcode: "" });
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);

  useEffect(() => {
    if (selectedCustomer) {
      setPersonalForm({
        id: selectedCustomer.clientCode || selectedCustomer.id || "",
        clientCode: selectedCustomer.clientCode || selectedCustomer.id || "",
        name: selectedCustomer.name || "",
        phone: selectedCustomer.phone || "",
        email: selectedCustomer.email || "",
        address: selectedCustomer.address || "",
        zone: selectedCustomer.zone || "",
        subzone: selectedCustomer.subzone || "",
        passcode: selectedCustomer.passcode || "",
      });
      setNetForm({
        package: selectedCustomer.package || "",
        serverName: selectedCustomer.serverName || "",
        protocolType: selectedCustomer.protocolType || selectedCustomer.service || "pppoe",
        profile: selectedCustomer.profile || selectedCustomer.package || "",
        ipAddress: selectedCustomer.ipAddress || "",
        zone: selectedCustomer.zone || "",
        subzone: selectedCustomer.subzone || "",
        box: selectedCustomer.box || "",
        connectionType: (selectedCustomer.connectionType || "") as any,
        splitterBox: selectedCustomer.splitterBox || "",
        splitterPort: selectedCustomer.splitterPort || "",
        cableMetre: selectedCustomer.cableMetre || 0,
        fiberCode: selectedCustomer.fiberCode || "",
        coreNumber: selectedCustomer.coreNumber || "",
        coreColor: selectedCustomer.coreColor || "",
        deviceType: selectedCustomer.deviceType || "",
        deviceSerial: selectedCustomer.deviceSerial || selectedCustomer.mac || "",
        deviceVendor: selectedCustomer.deviceVendor || "",
        purchaseDate: selectedCustomer.purchaseDate || selectedCustomer.joinDate || "",
      });

      setServiceForm({
        disabledInMikrotik: selectedCustomer.disabledInMikrotik || selectedCustomer.status === "suspended",
        disabledInSystem: selectedCustomer.disabledInSystem || false,
        pppUser: selectedCustomer.pppUser || "",
        pppPass: selectedCustomer.pppPass || "",
        billingStartMonth: selectedCustomer.billingStartMonth || (() => { const d = new Date(); return `${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })(),
        monthlyBill: selectedCustomer.monthlyBill !== undefined ? selectedCustomer.monthlyBill : (selectedCustomer.price ?? 500),
        clientType: selectedCustomer.clientType || "Home",
        billingStatus: selectedCustomer.billingStatus || "Monthly",
        expireDate: selectedCustomer.expireDate || selectedCustomer.endDate || (() => { const d = new Date(); d.setMonth(d.getMonth()+1); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })(),
        joinDate: selectedCustomer.joinDate || (() => { const d = new Date(); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; })(),
      });

      setCredForm({
        pppUser: selectedCustomer.pppUser || "",
        pppPass: selectedCustomer.pppPass || "",
        passcode: (selectedCustomer.passcode || "").replace(/^isp@/i, "mbn@") || `mbn@${(selectedCustomer.clientCode || selectedCustomer.id).replace(/\D/g, "")}`,
      });
      setIsEditingCredentials(false);
    }
  }, [selectedCustomer]);

  
  const handleSavePersonalInfo = () => {
    if (isReadOnly || !canEdit) {
      setToast("Access Restricted: View Only Mode. Modifying subscriber details is restricted.");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    if (!selectedCustomer) return;
    setIsSavingDrawer(true);
    const targetId = selectedCustomer.id;
    const newId = (personalForm.id || personalForm.clientCode || targetId).trim().toUpperCase();
    const updates: Partial<Customer> = {
      ...personalForm,
      id: newId,
      clientCode: newId,
    };
    updateCustomer(targetId, updates);
    setSelectedCustomer(prev => prev ? { ...prev, ...updates, id: newId, clientCode: newId } : null);
    setTimeout(() => {
      setIsSavingDrawer(false);
      setToast(`Subscriber ID & Identity updated for ${updates.name || selectedCustomer.name}!`);
      setTimeout(() => setToast(""), 3500);
    }, 400);
  };

  const handleGrantExtraDays = () => {
    if (isReadOnly || !canEdit) {
      setToast("Access Restricted: View Only Mode. Extending grace period is restricted.");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    const days = parseInt(extraDays) || 3;
    grantExtraDays(selectedCustomer.id, days);
    
    // update local modal state without modifying the base billing cycle expired date
    const baseEnd = selectedCustomer.endDate ? parseSafeDate(selectedCustomer.endDate) : new Date();
    const graceBase = new Date(Math.max(Date.now(), (baseEnd || new Date()).getTime()));
    graceBase.setDate(graceBase.getDate() + days);
    const graceEndDateStr = graceBase.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const newDays = Math.max(days, Math.ceil((graceBase.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    
    setSelectedCustomer(prev => prev ? {
      ...prev,
      // Base billing cycle expireDate / endDate remains untouched!
      graceDays: (prev.graceDays || 0) + days,
      graceExpiryDate: graceEndDateStr,
      daysRemaining: newDays,
      status: "active",
      netStatus: "online",
      disabledInMikrotik: false,
      disabledInSystem: false,
    } : null);
    
    setToast(`✓ Granted +${days} bonus gift days to ${selectedCustomer.name} (Base billing expiry: ${selectedCustomer.expireDate || selectedCustomer.endDate})!`);
    setTimeout(() => setToast(""), 3500);
  };

  const handleSaveNetworkInfo = () => {
    if (isReadOnly || !canEdit) {
      setToast("Access Restricted: View Only Mode. Modifying network configuration is restricted.");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    if (!selectedCustomer) return;
    setIsSavingDrawer(true);
    const chosenPkg = livePackages.find(p => p.name === netForm.package || p.name.split("—")[0].trim() === (netForm.package || "").split("—")[0].trim());
    const updates: Partial<Customer> = {
      ...netForm,
      ipAddress: (netForm.ipAddress || "").trim(),
      profile: chosenPkg?.mikrotikProfile || (netForm.package ? netForm.package.split(/[—\-]/)[0].trim() : selectedCustomer.profile),
      speed: chosenPkg ? `${chosenPkg.down}/${chosenPkg.up}` : selectedCustomer.speed,
      downloadSpeedMbps: chosenPkg?.down || selectedCustomer.downloadSpeedMbps,
      uploadSpeedMbps: chosenPkg?.up || selectedCustomer.uploadSpeedMbps,
      price: chosenPkg?.price !== undefined ? chosenPkg.price : selectedCustomer.price,
      monthlyBill: chosenPkg?.price !== undefined ? chosenPkg.price : selectedCustomer.monthlyBill,
    };
    updateCustomer(selectedCustomer.id, updates);
    setSelectedCustomer(prev => prev ? { ...prev, ...updates } : null);
    setTimeout(() => {
      setIsSavingDrawer(false);
      setToast(`Network & Product Info updated and saved for ${selectedCustomer.name}!`);
      setTimeout(() => setToast(""), 3500);
    }, 400);
  };

  const handleSaveServiceInfo = () => {
    if (isReadOnly || !canEdit) {
      setToast("Access Restricted: View Only Mode. Modifying service info is restricted.");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    if (!selectedCustomer) return;
    setIsSavingDrawer(true);
    const updates: Partial<Customer> = {
      ...serviceForm,
      price: Number(serviceForm.monthlyBill) !== undefined && !isNaN(Number(serviceForm.monthlyBill)) ? Number(serviceForm.monthlyBill) : selectedCustomer.price,
      monthlyBill: Number(serviceForm.monthlyBill) !== undefined && !isNaN(Number(serviceForm.monthlyBill)) ? Number(serviceForm.monthlyBill) : selectedCustomer.monthlyBill,
      status: serviceForm.disabledInMikrotik ? "suspended" : "active",
      netStatus: serviceForm.disabledInMikrotik ? "offline" : selectedCustomer.netStatus,
      endDate: serviceForm.expireDate || selectedCustomer.endDate,
      expireDate: serviceForm.expireDate || selectedCustomer.expireDate,
    };
    updateCustomer(selectedCustomer.id, updates);
    setSelectedCustomer(prev => prev ? { ...prev, ...updates } : null);
    setTimeout(() => {
      setIsSavingDrawer(false);
      setToast(`Service Information updated and saved for ${selectedCustomer.name}!`);
      setTimeout(() => setToast(""), 3500);
    }, 400);
  };

  const handleSaveCredentials = () => {
    if (isReadOnly || !canEdit) {
      setToast("Access Restricted: View Only Mode. Modifying credentials is restricted.");
      setTimeout(() => setToast(""), 3000);
      return;
    }
    if (!selectedCustomer) return;
    setIsSavingDrawer(true);
    const updates: Partial<Customer> = {
      pppUser: credForm.pppUser.trim(),
      pppPass: credForm.pppPass.trim(),
      passcode: credForm.passcode.trim(),
    };
    updateCustomer(selectedCustomer.id, updates);
    setSelectedCustomer(prev => prev ? { ...prev, ...updates } : null);
    setTimeout(() => {
      setIsSavingDrawer(false);
      setIsEditingCredentials(false);
      setToast(`Credentials successfully updated and saved for ${selectedCustomer.name}!`);
      setTimeout(() => setToast(""), 3500);
    }, 400);
  };

  // ── Plan Upgrade Approvals Modal State ──
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFilter, setUpgradeFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // ── Package Change Modal State ──
  const [packageModal, setPackageModal] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<Customer | null>(null);
  const [livePackages, setLivePackages] = useState<IspPackage[]>(() => billingStore.getPackages());
  const [liveMikrotiks, setLiveMikrotiks] = useState<string[]>(() => {
    const s = networkStore.getMikrotik().map(m => m.name);
    return s.length > 0 ? s : ["DC-CA"];
  });
  const [liveOlts, setLiveOlts] = useState<string[]>(() => {
    const o = networkStore.getOlts().map(x => x.name);
    return o.length > 0 ? o : ["OLT1", "OLT2"];
  });

  useEffect(() => {
    billingStore.syncLivePackages();
    const unsubB = billingStore.subscribe(() => setLivePackages(billingStore.getPackages()));
    const unsubN = networkStore.subscribe(() => {
      const s = networkStore.getMikrotik().map(m => m.name);
      if (s.length > 0) setLiveMikrotiks(s);
      const o = networkStore.getOlts().map(x => x.name);
      if (o.length > 0) setLiveOlts(o);
    });
    return () => {
      unsubB();
      unsubN();
    };
  }, []);

  // Keep selectedCustomer reactive to live updates and edits
  useEffect(() => {
    if (selectedCustomer) {
      const match = customers.find(c => c.id === selectedCustomer.id || c.clientCode === selectedCustomer.clientCode);
      if (match && (
        match.name !== selectedCustomer.name ||
        match.phone !== selectedCustomer.phone ||
        match.email !== selectedCustomer.email ||
        match.address !== selectedCustomer.address ||
        match.package !== selectedCustomer.package ||
        match.price !== selectedCustomer.price ||
        match.monthlyBill !== selectedCustomer.monthlyBill ||
        match.status !== selectedCustomer.status ||
        match.netStatus !== selectedCustomer.netStatus ||
        match.dueAmount !== selectedCustomer.dueAmount ||
        match.endDate !== selectedCustomer.endDate ||
        match.expireDate !== selectedCustomer.expireDate ||
        match.pppUser !== selectedCustomer.pppUser ||
        match.pppPass !== selectedCustomer.pppPass ||
        match.passcode !== selectedCustomer.passcode ||
        match.mac !== selectedCustomer.mac ||
        match.macBound !== selectedCustomer.macBound ||
        match.zone !== selectedCustomer.zone ||
        match.subzone !== selectedCustomer.subzone ||
        match.box !== selectedCustomer.box ||
        match.connectionType !== selectedCustomer.connectionType ||
        match.splitterBox !== selectedCustomer.splitterBox ||
        match.splitterPort !== selectedCustomer.splitterPort ||
        match.cableMetre !== selectedCustomer.cableMetre ||
        match.fiberCode !== selectedCustomer.fiberCode ||
        match.coreNumber !== selectedCustomer.coreNumber ||
        match.coreColor !== selectedCustomer.coreColor ||
        match.deviceType !== selectedCustomer.deviceType ||
        match.deviceSerial !== selectedCustomer.deviceSerial ||
        match.deviceVendor !== selectedCustomer.deviceVendor
      )) {
        setSelectedCustomer(match);
      }
    }
  }, [customers, selectedCustomer]);

  const [selectedNewPkg, setSelectedNewPkg] = useState<IspPackage | null>(() => billingStore.getPackages()[0] || null);
  const [applyImmediately, setApplyImmediately] = useState(true);
  const [syncMikrotik, setSyncMikrotik] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [packageCustomPrice, setPackageCustomPrice] = useState("");
  const [selectedPoolId, setSelectedPoolId] = useState(IP_POOLS[0].id);
  const [selectedTierId, setSelectedTierId] = useState(BANDWIDTH_TIERS[0].id);

  const nextSequentialCode = useMemo(() => {
    const maxExistingNum = customers.reduce((max, c) => {
      const match = (c.clientCode || c.id).match(/MBN(\d+)/i);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    return `MBN${String(maxExistingNum + 1).padStart(4, "0")}`;
  }, [customers]);

  const [addForm, setAddForm] = useState({
    id: "",
    name: "", phone: "", email: "", address: "", zone: "Madaripur Sadar", subzone: "Puran Bazar",
    pppUser: "mbn_10012", pppPass: "mbn@8492", passcode: "mbn@8492", mac: "",
    ipAddress: "10.215.35.2",
    package: "8 Mbps Economy — ৳600",
    speed: "8/4",
    price: 600,
    billingDate: "10",
    mikrotik: "MikroTik-01 (Madaripur Core)", olt: "OLT-Madaripur-01",
    autoProvisionMikrotik: true,
  });

  const generateNextSequentialIp = useCallback((poolPrefix: string, startHost: number) => {
    const usedHosts = new Set<number>();
    customers.forEach(c => {
      if (c.ipAddress && c.ipAddress.startsWith(poolPrefix)) {
        const lastPart = c.ipAddress.replace(poolPrefix, "");
        const num = parseInt(lastPart);
        if (!isNaN(num)) usedHosts.add(num);
      }
    });

    let host = startHost;
    while (usedHosts.has(host) && host < 254) {
      host++;
    }
    return `${poolPrefix}${host}`;
  }, [customers]);

  const generatePppoeCredentials = (name: string, phone: string) => {
    const cleanName = (name || "user").trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 7);
    const suffix = phone && phone.length >= 4 ? phone.replace(/\D/g, "").slice(-4) : "01";
    const pppUser = cleanName ? `${cleanName}_${suffix}` : `mbn_${suffix}`;
    const pppPass = `mbn@${suffix}`;
    const passcode = `mbn@${suffix}`;
    return { pppUser, pppPass, passcode };
  };

  const handleSelectBandwidthTier = (tier: typeof BANDWIDTH_TIERS[0]) => {
    setSelectedTierId(tier.id);
    setAddForm(p => ({
      ...p,
      package: `${tier.label} (${tier.tag}) — ৳${tier.price.toLocaleString()}`,
      speed: `${tier.down}/${tier.up}`,
      price: tier.price
    }));
  };

  const handleAutoAssignIp = (poolId?: string) => {
    const pool = IP_POOLS.find(p => p.id === (poolId || selectedPoolId)) || IP_POOLS[0];
    const nextIp = generateNextSequentialIp(pool.prefix, pool.startHost);
    setAddForm(p => ({ ...p, ipAddress: nextIp }));
    showToast(`Auto-allocated next available IP: ${nextIp} (Zero collision in ${pool.name})`);
  };

  const handleAutoGeneratePppoe = () => {
    const creds = generatePppoeCredentials(addForm.name, addForm.phone);
    setAddForm(p => ({ ...p, ...creds }));
    showToast(`Auto-generated PPPoE User: ${creds.pppUser} & Passcode: ${creds.passcode}`);
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  const openChangePackageModal = (c: Customer) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Changing packages is restricted.");
      return;
    }
    setTargetCustomer(c);
    const pkgs = livePackages.length > 0 ? livePackages : billingStore.getPackages();
    const matched = pkgs.find(p => p.name === c.package || c.package.includes(p.name)) || pkgs[0] || null;
    setSelectedNewPkg(matched);
    setPackageCustomPrice(String(c.price || (matched ? matched.price : 0)));
    setPackageModal(true);
  };

  const handleApplyPackageChange = () => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Changing packages is restricted.");
      return;
    }
    if (!targetCustomer || !selectedNewPkg) return;

    const finalPrice = Number(packageCustomPrice) || selectedNewPkg.price;
    changePackage(
      targetCustomer.id,
      selectedNewPkg.name,
      `${selectedNewPkg.down}/${selectedNewPkg.up}`,
      finalPrice
    );

    if (selectedCustomer && selectedCustomer.id === targetCustomer.id) {
      setSelectedCustomer({
        ...selectedCustomer,
        package: selectedNewPkg.name,
        speed: `${selectedNewPkg.down}/${selectedNewPkg.up}`,
        downloadSpeedMbps: selectedNewPkg.down,
        uploadSpeedMbps: selectedNewPkg.up,
        price: finalPrice,
      });
    }

    showToast(`Package updated to ${selectedNewPkg.name} (৳${finalPrice.toLocaleString()}/mo) for ${targetCustomer.name}`);
    setPackageModal(false);
    setTargetCustomer(null);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const copyLoginBundle = (c: Customer) => {
    const bundle = `=== MAA BEST NETWORK Subscriber Login ===\nPortal: portal.maabestnetwork.com\nUser ID: ${c.clientCode || c.id}\nDefault Passcode: ${c.passcode}\nPhone: ${c.phone}\nPackage: ${c.package}\nPayment Method: bKash / Nagad Direct`;
    navigator.clipboard.writeText(bundle);
    setCopiedKey(`bundle-${c.id}`);
    showToast(`Copied Login Bundle for ${c.name}`);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const loginAsSubscriber = (c: Customer) => {
    setActiveCustomer(c);
    showToast(`Switching to ${c.name}'s Subscriber Portal...`);
    if (onNavigate) {
      onNavigate("customer-portal");
    }
  };

  const handleToggleMacBinding = (c: Customer) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Modifying MAC binding is restricted.");
      return;
    }
    const cleanUser = (c.pppUser || c.name || "").toLowerCase();
    const liveMatch = liveStatsMap.get(cleanUser) || liveStatsMap.get((c.name || "").toLowerCase());
    const realMac = liveMatch?.live_mac || c.mac || c.callingStationId || "";
    const isCurrentlyBound = c.macBound !== false && Boolean(realMac && realMac.trim() && realMac !== "—");

    if (isCurrentlyBound) {
      unbindMac(c.id);
      showToast(`MAC lock released (Unbound) for ${c.name} (${c.id}). Router change now permitted.`);
      if (selectedCustomer && selectedCustomer.id === c.id) {
        setSelectedCustomer(prev => prev ? { ...prev, macBound: false, boundMac: undefined, callingStationId: undefined } : null);
      }
    } else {
      const res = bindMac(c.id, realMac);
      showToast(`MAC [${res.mac}] securely locked & bound to ${c.name} (${c.id})!`);
      if (selectedCustomer && selectedCustomer.id === c.id) {
        setSelectedCustomer(prev => prev ? { ...prev, mac: res.mac, boundMac: res.mac, callingStationId: res.mac, macBound: true } : null);
      }
    }
  };

  const handleBulkBindMac = () => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Modifying MAC binding is restricted.");
      return;
    }
    if (selectedCustomerIds.length === 0) return;
    selectedCustomerIds.forEach(id => {
      const cust = customers.find(c => c.id === id);
      const cleanUser = (cust?.pppUser || cust?.name || "").toLowerCase();
      const liveMatch = liveStatsMap.get(cleanUser) || liveStatsMap.get((cust?.name || "").toLowerCase());
      const activeMac = liveMatch?.live_mac || cust?.mac || cust?.callingStationId;
      bindMac(id, activeMac);
    });
    showToast(`Successfully bound MAC addresses for ${selectedCustomerIds.length} subscriber(s)!`);
    setSelectedCustomerIds([]);
  };

  const handleBulkUnbindMac = () => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Modifying MAC binding is restricted.");
      return;
    }
    if (selectedCustomerIds.length === 0) return;
    selectedCustomerIds.forEach(id => {
      unbindMac(id);
    });
    showToast(`Successfully released (unbound) MAC lock for ${selectedCustomerIds.length} subscriber(s)!`);
    setSelectedCustomerIds([]);
  };

  const filtered = customers.filter(c => {
    const q = search.toLowerCase().trim();
    const cleanUser = (c.pppUser || c.name || "").toLowerCase();
    const liveMatch = liveStatsMap.get(cleanUser) || liveStatsMap.get((c.name || "").toLowerCase());
    const isCustomerDisabled = c.disabledInMikrotik || c.disabledInSystem || c.netStatus === "offline" || c.status === "suspended";
    const isOnline = isCustomerDisabled ? false : (liveMatch ? (liveMatch.connection_status === "online") : (c.netStatus === "online"));
    const activeMac = (liveMatch?.live_mac || c.mac || c.callingStationId || "").toLowerCase();
    const isBound = c.macBound !== false && Boolean(activeMac && activeMac.trim() && activeMac !== "—");

    const matchSearch =
      !q ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.id || "").toLowerCase().includes(q) ||
      (c.clientCode || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(q) ||
      (c.pppUser || "").toLowerCase().includes(q) ||
      (c.passcode || "").toLowerCase().includes(q) ||
      (c.ipAddress || "").includes(q) ||
      (liveMatch?.live_ip || "").includes(q) ||
      (c.mac || "").toLowerCase().includes(q) ||
      activeMac.includes(q) ||
      (c.zone || "").toLowerCase().includes(q) ||
      (c.subzone || "").toLowerCase().includes(q);

    const userType = c.userType || "normal";
    const matchUserType = userTypeFilter === "all" || userType === userTypeFilter;
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchNetStatus =
      netStatusFilter === "all" ||
      (netStatusFilter === "online" && isOnline) ||
      (netStatusFilter === "offline" && !isOnline);
    const matchMacBind =
      macBindFilter === "all" ||
      (macBindFilter === "bound" && isBound) ||
      (macBindFilter === "unbound" && !isBound);
    const matchZone =
      zoneFilter === "all" || c.zone === zoneFilter || c.subzone === zoneFilter;
    const matchPackage = packageFilter === "all" || c.package === packageFilter;
    const matchDue =
      dueFilter === "all" ||
      (dueFilter === "has_due" && (c.dueAmount || 0) > 0) ||
      (dueFilter === "paid" && (c.dueAmount || 0) <= 0);

    return matchSearch && matchUserType && matchStatus && matchNetStatus && matchMacBind && matchZone && matchPackage && matchDue;
  });

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      const cleanUserA = (a.pppUser || a.name || "").toLowerCase();
      const liveMatchA = liveStatsMap.get(cleanUserA) || liveStatsMap.get((a.name || "").toLowerCase());
      const isDisA = a.disabledInMikrotik || a.disabledInSystem || a.netStatus === "offline" || a.status === "suspended";
      const isOnlineA = isDisA ? false : (liveMatchA ? (liveMatchA.connection_status === "online") : (a.netStatus === "online"));

      const cleanUserB = (b.pppUser || b.name || "").toLowerCase();
      const liveMatchB = liveStatsMap.get(cleanUserB) || liveStatsMap.get((b.name || "").toLowerCase());
      const isDisB = b.disabledInMikrotik || b.disabledInSystem || b.netStatus === "offline" || b.status === "suspended";
      const isOnlineB = isDisB ? false : (liveMatchB ? (liveMatchB.connection_status === "online") : (b.netStatus === "online"));

      switch (sortKey) {
        case "clientCode":
          valA = a.clientCode || a.id || "";
          valB = b.clientCode || b.id || "";
          break;
        case "name":
          valA = a.name || "";
          valB = b.name || "";
          break;
        case "phone":
          valA = a.phone || "";
          valB = b.phone || "";
          break;
        case "id":
          valA = a.pppUser || a.id || "";
          valB = b.pppUser || b.id || "";
          break;
        case "zone":
          valA = a.zone || "";
          valB = b.zone || "";
          break;
        case "subzone":
          valA = a.subzone || "";
          valB = b.subzone || "";
          break;
        case "box":
          valA = a.box || a.tjBox || "";
          valB = b.box || b.tjBox || "";
          break;
        case "createdAt":
          valA = a.createdAt || 0;
          valB = b.createdAt || 0;
          break;
        case "dueDate": {
          const parseDate = (d: string | undefined) => {
            if (!d) return 0;
            const parts = d.split('/');
            if (parts.length === 3) {
              const dt = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
              if (!isNaN(dt.getTime())) return dt.getTime();
            }
            const dt2 = new Date(d);
            return isNaN(dt2.getTime()) ? 0 : dt2.getTime();
          };
          valA = parseDate(a.expireDate || a.endDate);
          valB = parseDate(b.expireDate || b.endDate);
          break;
        }
        case "package":
          valA = a.package || "";
          valB = b.package || "";
          break;
        case "ipAddress":
          valA = liveMatchA?.live_ip || a.ipAddress || "";
          valB = liveMatchB?.live_ip || b.ipAddress || "";
          break;
        case "status":
          valA = isOnlineA ? 1 : 0;
          valB = isOnlineB ? 1 : 0;
          break;
        case "dueAmount":
          valA = a.dueAmount || 0;
          valB = b.dueAmount || 0;
          break;
        default:
          valA = a.clientCode || a.id || "";
          valB = b.clientCode || b.id || "";
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filtered, liveStatsMap, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / (itemsPerPage >= 9999 ? sorted.length || 1 : itemsPerPage)));
  const paginated = itemsPerPage >= 9999 ? sorted : sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // ── Deleted Customers Filtering & Pagination ──
  const filteredDeleted = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deletedCustomers.filter(c => {
      const matchSearch =
        !q ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.clientCode || "").toLowerCase().includes(q) ||
        (c.id || "").toLowerCase().includes(q) ||
        (c.phone || "").includes(q) ||
        (c.pppUser || "").toLowerCase().includes(q) ||
        (c.mac || "").toLowerCase().includes(q) ||
        (c.zone || "").toLowerCase().includes(q) ||
        (c.subzone || "").toLowerCase().includes(q) ||
        (c.deletionReason || "").toLowerCase().includes(q);

      const matchZone = zoneFilter === "all" || c.zone === zoneFilter || c.subzone === zoneFilter;
      const matchPackage = packageFilter === "all" || c.package === packageFilter;

      return matchSearch && matchZone && matchPackage;
    });
  }, [deletedCustomers, search, zoneFilter, packageFilter]);

  const totalDeletedPages = Math.max(1, Math.ceil(filteredDeleted.length / (itemsPerPage >= 9999 ? filteredDeleted.length || 1 : itemsPerPage)));
  const paginatedDeleted = itemsPerPage >= 9999 ? filteredDeleted : filteredDeleted.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleAction = async (label: string, action: () => void) => {
    setActionLoading(label);
    await new Promise(r => setTimeout(r, 800));
    action();
    setActionLoading(null);
    showToast(`${label} completed successfully`);
  };

  const toggleNet = (c: Customer, enable: boolean) => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Modifying customer connection status is restricted.");
      return;
    }
    toggleNetStatus(c.id, enable);
    setSelectedCustomer(prev => prev && prev.id === c.id ? { ...prev, netStatus: enable ? "online" : "offline", status: enable ? "active" : "suspended" } : prev);
    showToast(`Network ${enable ? "Enabled (Online)" : "Disabled (Offline)"} for ${c.name}`);
  };

  const sendSMS = () => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Sending SMS is restricted.");
      return;
    }
    if (!smsText.trim()) return;
    setSmsModal(false);
    setSmsText("");
    showToast(`SMS sent to ${selectedCustomer?.name} (${selectedCustomer?.phone})`);
  };

  const recordPay = () => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Recording payments is restricted.");
      return;
    }
    if (!payAmount || !selectedCustomer) return;
    const amt = Number(payAmount);
    if (isNaN(amt) || amt <= 0 || amt > 500000) {
      showToast("Security Alert: Invalid payment amount. Please enter an amount between ৳1 and ৳5,00,000.");
      return;
    }
    const res = processPayment(selectedCustomer.id, amt, payMethod, payTxId);
    setPaymentModal(false);
    setPayAmount("");
    setPayTxId("");
    showToast(`Payment of ৳${amt.toLocaleString()} recorded via ${payMethod}! (Trx: ${res.trxId})`);
  };

  const handleCreateCustomer = () => {
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: View Only Mode. Registering new clients is restricted.");
      return;
    }
    const cleanPhone = addForm.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 11) {
      showToast("Validation Error: Please enter a valid 11-digit mobile number (e.g. 01712345678).");
      return;
    }

    // PPPoE username security sanitation (alphanumeric, dot, underscore, dash only)
    const cleanPppUser = addForm.pppUser.trim();
    if (!/^[a-zA-Z0-9_\-.]{3,32}$/.test(cleanPppUser)) {
      showToast("Security Alert: PPPoE username can only contain letters, numbers, dots, and hyphens (3-32 characters).");
      return;
    }

    // IP Address Format Validation
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(addForm.ipAddress.trim())) {
      showToast("Validation Error: Please enter a valid IPv4 address (e.g. 10.215.35.15).");
      return;
    }

    const pkgPrice = addForm.price || parseInt(addForm.package.split("৳")[1]?.replace(",", "") || "600");
    if (isNaN(pkgPrice) || pkgPrice <= 0) {
      showToast("Validation Error: Package price must be a valid positive amount.");
      return;
    }

    const pkgName = addForm.package.split(" — ")[0];
    const finalCode = (addForm.id.trim() || nextSequentialCode).toUpperCase();
    const cleanMac = addForm.mac.trim().toLowerCase();

    const nc = addCustomer({
      id: finalCode,
      clientCode: finalCode,
      name: addForm.name.trim(),
      phone: cleanPhone,
      email: addForm.email.trim(),
      address: addForm.address.trim(),
      zone: addForm.zone,
      subzone: addForm.subzone,
      package: pkgName,
      speed: addForm.speed,
      price: pkgPrice,
      billingDate: parseInt(addForm.billingDate) || 10,
      ipAddress: addForm.ipAddress.trim(),
      pppUser: cleanPppUser,
      pppPass: addForm.pppPass.trim(),
      passcode: addForm.passcode?.trim() || undefined,
      mac: cleanMac,
      boundMac: cleanMac,
      callingStationId: cleanMac,
      macBound: Boolean(cleanMac),
      mikrotik: addForm.mikrotik,
      olt: addForm.olt,
    });

    setShowAdd(false);
    showToast(`Subscriber "${nc.name}" (${finalCode}) created successfully! IP: ${nc.ipAddress} · MAC: ${cleanMac || "Auto"} · PPPoE: ${nc.pppUser}`);
  };

  const counts = {
    all: customers.length,
    active: customers.filter(c => c.status === "active").length,
    due: customers.filter(c => c.status === "due" && c.userType !== "free").length,
    suspended: customers.filter(c => c.status === "suspended").length,
    disconnected: customers.filter(c => c.status === "disconnected").length,
    deleted: deletedCustomers.length,
    free: customers.filter(c => c.userType === "free").length,
    unlimited: customers.filter(c => c.userType === "unlimited").length,
  };

  const isAnyFilterActive = Boolean(
    search ||
    statusFilter !== "all" ||
    netStatusFilter !== "all" ||
    macBindFilter !== "all" ||
    userTypeFilter !== "all" ||
    zoneFilter !== "all" ||
    packageFilter !== "all" ||
    dueFilter !== "all"
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--foreground)", marginBottom: 3 }}>
            {t("All Customers & Subscriber Credentials")}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            {bnNum(customers.length)} {t("subscribers registered · Real MAC Address Inspection · 1-Click MAC Bind & Security Lock")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Plan Upgrade Requests Modal Trigger */}
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-500/20 cursor-pointer relative shadow-2xs">
            <Sparkles size={14} className="text-amber-500" />
            <span>Plan Upgrades</span>
            {upgradeRequests.filter(r => r.status === "pending").length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                {upgradeRequests.filter(r => r.status === "pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => exportCSV(statusFilter === "deleted" ? filteredDeleted : filtered)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border bg-card text-foreground text-xs font-bold hover:bg-muted cursor-pointer"
            style={{ borderColor: "var(--border)" }}>
            <Download size={14} /> {t("Export CSV")}
          </button>
          <button
            disabled={isReadOnly}
            onClick={() => {
              if (isReadOnly) return;
              onNavigate ? onNavigate("add-client") : setShowAdd(true);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
              isReadOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-95"
            }`}
            style={{ background: isReadOnly ? "#64748B" : "var(--primary)" }}
            title={isReadOnly ? "View Only: You cannot add new clients" : "Register New Client"}
          >
            <Plus size={14} /> + Client Add New Client
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid gap-3 mb-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {([
          ["all", "Total Subscribers", customers.length, "#8B2020"],
          ["active", "Active Connected", counts.active, "#16A34A"],
          ["due", "Payment Due", counts.due, "#D97706"],
          ["suspended", "Suspended Lines", counts.suspended, "#DC2626"],
          ["disconnected", "Disconnected", counts.disconnected, "#6B7280"],
          ["deleted", "Deleted Archive", counts.deleted, "#E11D48"],
        ] as const).map(([key, label, val, color]) => (
          <button
            key={key}
            onClick={() => { setStatusFilter(key as any); setPage(1); }}
            className="rounded-2xl p-4 text-left transition-all border cursor-pointer relative"
            style={{
              background: statusFilter === key ? "var(--primary)" : "var(--card)",
              borderColor: statusFilter === key ? "var(--primary)" : "var(--border)",
              boxShadow: statusFilter === key ? "0 4px 14px rgba(139,32,32,0.25)" : "none"
            }}>
            <div className="flex items-center justify-between">
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: statusFilter === key ? "#fff" : color, lineHeight: 1.1 }}>
                {bnNum(val.toLocaleString())}
              </p>
              {key === "deleted" && (
                <Archive size={16} className={statusFilter === key ? "text-white/80" : "text-rose-500"} />
              )}
            </div>
            <p style={{ fontSize: 12, fontWeight: 500, color: statusFilter === key ? "rgba(255,255,255,0.8)" : "var(--muted-foreground)", marginTop: 4 }}>
              {t(label)}
            </p>
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        
        {/* ── PREMIUM FILTER & ENTRIES HEADER (SHOW 100 ENTRIES | Filtered: 194 / 194) ── */}
        <div className="p-4 border-b space-y-3 bg-muted/20" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Left Controls: Search + Entries dropdown + Filter stats badge */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search Bar */}
              <div className="relative w-72 sm:w-80">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder={t("Search Name, ID, Phone, MAC, IP, PPPoE…")}
                  className="w-full pl-9 pr-7 py-2 rounded-xl outline-none text-xs text-foreground bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-2xs"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); setPage(1); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Show Entries Dropdown */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground shadow-2xs">
                <span className="text-muted-foreground uppercase text-[10px] font-extrabold tracking-wider">SHOW</span>
                <select
                  value={itemsPerPage}
                  onChange={e => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                  className="bg-muted px-2 py-0.5 rounded-md border border-border text-foreground font-black text-xs cursor-pointer outline-none focus:border-primary"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={9999}>All ({customers.length})</option>
                </select>
                <span className="text-muted-foreground uppercase text-[10px] font-extrabold tracking-wider">ENTRIES</span>
              </div>

              {/* Live Filter Indicator Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary shadow-2xs">
                <Filter size={12} />
                <span>Filtered: <span className="font-mono font-black">{statusFilter === "deleted" ? filteredDeleted.length : filtered.length}</span> / <span className="font-mono">{statusFilter === "deleted" ? deletedCustomers.length : customers.length}</span></span>
              </div>
            </div>

            {/* Right Controls: Filter dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* User Type Filter */}
              <select
                value={userTypeFilter}
                onChange={e => { setUserTypeFilter(e.target.value as any); setPage(1); }}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground cursor-pointer outline-none focus:border-primary shadow-2xs"
              >
                <option value="all">Type: All Users</option>
                <option value="normal">Normal Users</option>
                <option value="free">Free Users (No Cutoff)</option>
                <option value="unlimited">VIP Unlimited (Permanent)</option>
              </select>

              {/* Live Status Filter */}
              <select
                value={netStatusFilter}
                onChange={e => { setNetStatusFilter(e.target.value as any); setPage(1); }}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground cursor-pointer outline-none focus:border-primary shadow-2xs"
              >
                <option value="all">Live: All Status</option>
                <option value="online">Online Now</option>
                <option value="offline">Offline Now</option>
              </select>

              {/* MAC Binding Filter */}
              <select
                value={macBindFilter}
                onChange={e => { setMacBindFilter(e.target.value as any); setPage(1); }}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground cursor-pointer outline-none focus:border-primary shadow-2xs"
              >
                <option value="all">All MAC Bindings</option>
                <option value="bound">MAC Bound (Locked)</option>
                <option value="unbound">MAC Unbound (Open)</option>
              </select>

              {/* Zone Filter */}
              {allZones.length > 0 && (
                <select
                  value={zoneFilter}
                  onChange={e => { setZoneFilter(e.target.value); setPage(1); }}
                  className="px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground cursor-pointer outline-none focus:border-primary max-w-[140px] truncate shadow-2xs"
                >
                  <option value="all">All Zones</option>
                  {allZones.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              )}

              {/* Due Filter */}
              <select
                value={dueFilter}
                onChange={e => { setDueFilter(e.target.value as any); setPage(1); }}
                className="px-2.5 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground cursor-pointer outline-none focus:border-primary shadow-2xs"
              >
                <option value="all">Payment: All</option>
                <option value="has_due">Has Overdue</option>
                <option value="paid">Fully Paid</option>
              </select>

              {/* Reset Filters button */}
              {isAnyFilterActive && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setNetStatusFilter("all");
                    setMacBindFilter("all");
                    setUserTypeFilter("all");
                    setZoneFilter("all");
                    setPackageFilter("all");
                    setDueFilter("all");
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                >
                  <X size={12} /> Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedCustomerIds.length > 0 && !isReadOnly && (
          <div className="flex items-center justify-between px-5 py-3 bg-muted/50 border-b border-border flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span className="text-xs font-bold text-foreground">
                {selectedCustomerIds.length} subscriber(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Set User Type in Bulk */}
              <button
                onClick={() => {
                  bulkSetUserType(selectedCustomerIds, "free");
                  setSelectedCustomerIds([]);
                  showToast(`Converted ${selectedCustomerIds.length} subscriber(s) to Free User (Never Cutoff / 0 Due).`);
                }}
                title="Set selected subscribers as Free Users (Exempt from bills & cutoff)"
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={12} /> Set Free User
              </button>
              <button
                onClick={() => {
                  bulkSetUserType(selectedCustomerIds, "unlimited");
                  setSelectedCustomerIds([]);
                  showToast(`Converted ${selectedCustomerIds.length} subscriber(s) to VIP Unlimited (Permanent).`);
                }}
                title="Set selected subscribers as VIP Unlimited (Permanent connection & priority)"
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600/90 hover:bg-amber-600 text-white shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} /> Set VIP Unlimited
              </button>
              <button
                onClick={() => {
                  bulkSetUserType(selectedCustomerIds, "normal");
                  setSelectedCustomerIds([]);
                  showToast(`Reset ${selectedCustomerIds.length} subscriber(s) to Normal User.`);
                }}
                title="Reset selected subscribers to standard billing cycle"
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-600 hover:bg-slate-700 text-white shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Users size={12} /> Set Normal
              </button>

              <div className="h-4 w-[1px] bg-border mx-1" />

              <button
                onClick={handleBulkBindMac}
                title="Lock PPPoE session to current MAC address for selected subscribers"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Lock size={12} /> Bind MAC
              </button>
              <button
                onClick={handleBulkUnbindMac}
                title="Release MAC lock for selected subscribers to allow new router connections"
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Unlock size={12} /> Unbind MAC
              </button>
              <button
                onClick={() => {
                  bulkUpdateStatus(selectedCustomerIds, "suspended", "offline");
                  setSelectedCustomerIds([]);
                  showToast(`Suspended ${selectedCustomerIds.length} customers.`);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs cursor-pointer"
              >
                Suspend
              </button>
              <button
                onClick={() => {
                  bulkUpdateStatus(selectedCustomerIds, "active", "online");
                  setSelectedCustomerIds([]);
                  showToast(`Activated ${selectedCustomerIds.length} customers.`);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary hover:opacity-95 text-white shadow-2xs cursor-pointer"
              >
                Activate
              </button>
            </div>
          </div>
        )}

        {/* ── TOP FULL-WIDTH HORIZONTAL SCROLL BAR ── */}
        <div className="px-4 py-2.5 bg-muted/40 border-b flex items-center select-none" style={{ borderColor: "var(--border)" }}>
          <input
            ref={sliderRef}
            type="range"
            min={0}
            defaultValue={0}
            onInput={handleSliderInput}
            className="w-full table-scroll-slider cursor-pointer"
            title="Drag or click to scroll table sideways"
          />
        </div>

        {statusFilter === "deleted" ? (
          /* ── DELETED ACCOUNTS ARCHIVE VIEW ── */
          <div>
            <div className="p-4 bg-rose-500/5 border-b flex items-center justify-between flex-wrap gap-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <Archive size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                    <span>Deleted Accounts Archive</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                      {deletedCustomers.length} Archived
                    </span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Subscribers terminated & de-provisioned from MikroTik/OLT. Data is securely retained for audit and full 1-click restoration.
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto" ref={tableScrollRef} onScroll={handleTableScroll}>
              <table className="w-full text-left text-xs text-foreground">
                <thead className="border-b bg-muted/40 font-semibold" style={{ borderColor: "var(--border)" }}>
                  <tr>
                    <th className="py-3 px-3.5 tracking-wider whitespace-nowrap font-bold text-foreground">Client ID</th>
                    <th className="py-3 px-3.5 tracking-wider whitespace-nowrap font-bold text-foreground">Subscriber Name & Contact</th>
                    <th className="py-3 px-3.5 tracking-wider whitespace-nowrap font-bold text-foreground">PPPoE Username</th>
                    <th className="py-3 px-3.5 tracking-wider whitespace-nowrap font-bold text-foreground">Former Package & Rate</th>
                    <th className="py-3 px-3.5 tracking-wider whitespace-nowrap font-bold text-foreground">Zone & Splitter Box</th>
                    <th className="py-3 px-3.5 tracking-wider whitespace-nowrap font-bold text-foreground">Deleted On</th>
                    <th className="py-3 px-3.5 tracking-wider whitespace-nowrap font-bold text-foreground">Deletion Reason</th>
                    <th className="py-3 px-3.5 tracking-wider whitespace-nowrap text-right font-bold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDeleted.map((c, i) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: i < paginatedDeleted.length - 1 ? "1px solid var(--border)" : "none" }}
                      className="hover:bg-muted/40 transition-colors">
                      {/* Client Code */}
                      <td className="px-3.5 py-3 whitespace-nowrap font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                        {c.clientCode || c.id}
                      </td>

                      {/* Name & Phone */}
                      <td className="px-3.5 py-3">
                        <div>
                          <p className="text-xs font-bold text-foreground">{c.name}</p>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                            <Phone size={10} />
                            <span>{c.phone || "—"}</span>
                          </div>
                          {c.address && (
                            <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{c.address}</p>
                          )}
                        </div>
                      </td>

                      {/* PPPoE User */}
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono text-xs font-semibold text-foreground">
                          <span>{c.pppUser || "—"}</span>
                          {c.pppUser && (
                            <button
                              onClick={() => copyToClipboard(c.pppUser, `del-user-${c.id}`)}
                              className="text-muted-foreground hover:text-foreground">
                              {copiedKey === `del-user-${c.id}` ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Package */}
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="font-semibold text-foreground">{c.package}</span>
                        <span className="text-muted-foreground text-[11px] block font-mono">৳{c.price || c.monthlyBill || 500}/mo</span>
                      </td>

                      {/* Zone & Box */}
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="text-xs text-foreground font-medium">{c.zone}</div>
                        <div className="text-[11px] text-muted-foreground">{c.subzone || "—"} {c.splitterBox ? `· Box: ${c.splitterBox}` : (c.box ? `· Box: ${c.box}` : "")}</div>
                      </td>

                      {/* Deleted Date */}
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <div className="text-xs text-foreground font-medium flex items-center gap-1">
                          <Clock size={11} className="text-muted-foreground" />
                          <span>{c.deletedDate || (c.deletedAt ? new Date(c.deletedAt).toLocaleDateString() : "—")}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block">By: {c.deletedBy || "Admin"}</span>
                      </td>

                      {/* Reason */}
                      <td className="px-3.5 py-3">
                        <span className="inline-block max-w-[200px] truncate px-2 py-0.5 rounded bg-muted text-[11px] text-foreground font-medium border border-border" title={c.deletionReason}>
                          {c.deletionReason || "Admin manual deletion"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            disabled={isReadOnly}
                            onClick={() => setRestoreConfirmCust(c)}
                            title={isReadOnly ? "View Only: Restoration restricted" : "Restore Account to Active & MikroTik"}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer shadow-2xs">
                            <RotateCcw size={12} />
                            <span>Restore</span>
                          </button>

                          <button
                            onClick={() => { setSelectedCustomer(c); setDrawerTab("Overview"); }}
                            title="View Full Profile Details"
                            className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs">
                            <Eye size={13} />
                          </button>

                          <button
                            disabled={isReadOnly}
                            onClick={() => setPurgeConfirmCust(c)}
                            title={isReadOnly ? "View Only: Permanent delete restricted" : "Permanently Purge Record"}
                            className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer shadow-2xs">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paginatedDeleted.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Archive size={32} className="opacity-30" />
                          <p className="font-semibold text-sm">No Deleted Accounts Found</p>
                          <p className="text-[11px] max-w-sm">When an account is deleted from the active list, it is de-provisioned from MikroTik and safely stored here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Deleted Pagination Footer */}
            {filteredDeleted.length > 0 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t flex-wrap gap-3" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs text-muted-foreground font-medium">
                  Showing <span className="font-bold text-foreground">{(page - 1) * (itemsPerPage >= 9999 ? filteredDeleted.length : itemsPerPage) + 1}</span>–<span className="font-bold text-foreground">{Math.min(page * (itemsPerPage >= 9999 ? filteredDeleted.length : itemsPerPage), filteredDeleted.length)}</span> of <span className="font-bold text-foreground">{filteredDeleted.length}</span> archived accounts (Total {deletedCustomers.length})
                </span>
                {totalDeletedPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-2.5 py-1.5 flex items-center gap-1 rounded-lg border bg-card text-xs font-semibold text-foreground disabled:opacity-40 hover:bg-muted cursor-pointer shadow-2xs"
                      style={{ borderColor: "var(--border)" }}>
                      <ChevronLeft size={13} /> Prev
                    </button>
                    {Array.from({ length: Math.min(7, totalDeletedPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            page === pageNum ? "bg-primary text-white border-primary shadow-2xs" : "bg-card text-foreground border-border hover:bg-muted"
                          }`}>
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      disabled={page === totalDeletedPages}
                      onClick={() => setPage(p => Math.min(totalDeletedPages, p + 1))}
                      className="px-2.5 py-1.5 flex items-center gap-1 rounded-lg border bg-card text-xs font-semibold text-foreground disabled:opacity-40 hover:bg-muted cursor-pointer shadow-2xs"
                      style={{ borderColor: "var(--border)" }}>
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Table Contents */
          <>
          <div className="overflow-x-auto" ref={tableScrollRef} onScroll={handleTableScroll}>
            <table className="w-full">
            <thead>
              <tr className="bg-muted/80 text-foreground border-b border-border font-bold select-none text-xs">
                <th className="px-3.5 py-3 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                    checked={paginated.length > 0 && selectedCustomerIds.length === paginated.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCustomerIds(paginated.map(c => c.id));
                      } else {
                        setSelectedCustomerIds([]);
                      }
                    }}
                  />
                </th>

                {/* Client Code */}
                <th
                  onClick={() => handleSort("clientCode")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>Client Code</span>
                    {sortKey === "clientCode" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Name */}
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>Name</span>
                    {sortKey === "name" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Mobile */}
                <th
                  onClick={() => handleSort("phone")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>Mobile</span>
                    {sortKey === "phone" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* ID / PPPoE */}
                <th
                  onClick={() => handleSort("id")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>ID / PPPoE</span>
                    {sortKey === "id" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Zone */}
                <th
                  onClick={() => handleSort("zone")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>Zone</span>
                    {sortKey === "zone" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Sub Zone */}
                <th
                  onClick={() => handleSort("subzone")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>Sub Zone</span>
                    {sortKey === "subzone" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Box */}
                <th
                  onClick={() => handleSort("box")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>Box</span>
                    {sortKey === "box" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Start Date */}
                <th
                  onClick={() => handleSort("createdAt")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>Start Date</span>
                    {sortKey === "createdAt" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Expired Date */}
                <th
                  onClick={() => handleSort("dueDate")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>Expired Date</span>
                    {sortKey === "dueDate" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Package & Speed */}
                <th
                  onClick={() => handleSort("package")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>Package & Speed</span>
                    {sortKey === "package" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Status & Signal */}
                <th
                  onClick={() => handleSort("status")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>Live & IP</span>
                    {sortKey === "status" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Status Badge */}
                <th className="py-3 px-3.5 tracking-wider whitespace-nowrap font-bold text-foreground">
                  Status
                </th>

                {/* Due / Bill */}
                <th
                  onClick={() => handleSort("dueAmount")}
                  className="py-3 px-3.5 tracking-wider whitespace-nowrap cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <span>Due / Bill</span>
                    {sortKey === "dueAmount" ? (
                      sortDirection === "asc" ? <ArrowUp size={12} className="text-primary font-bold" /> : <ArrowDown size={12} className="text-primary font-bold" />
                    ) : (
                      <ArrowUpDown size={11} className="opacity-40" />
                    )}
                  </div>
                </th>

                {/* Actions */}
                <th className="py-3 px-3.5 tracking-wider whitespace-nowrap text-right font-bold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, i) => {
                const cleanUser = (c.pppUser || c.name || "").toLowerCase();
                const liveMatch = liveStatsMap.get(cleanUser) || liveStatsMap.get((c.name || "").toLowerCase());
                const isCustDis = c.disabledInMikrotik || c.disabledInSystem || c.netStatus === "offline" || c.status === "suspended";
                const isOnline = isCustDis ? false : (liveMatch ? (liveMatch.connection_status === "online") : (c.netStatus === "online"));
                const displayIp = liveMatch?.live_ip || c.ipAddress || "—";
                const rawRx = (liveMatch?.onu_rx_power !== null && liveMatch?.onu_rx_power !== undefined)
                  ? `${liveMatch.onu_rx_power} dBm`
                  : (c.onuSignal && c.onuSignal.toLowerCase() !== "offline" && c.onuSignal !== "—" ? c.onuSignal : "");
                const displayRx = isOnline && rawRx && rawRx.toLowerCase() !== "offline" && rawRx !== "—" ? rawRx : (isOnline ? "—" : "Offline");
                const realMac = (liveMatch?.live_mac || c.mac || c.callingStationId || c.boundMac || "—").toLowerCase();
                const isBound = c.macBound !== false && Boolean(realMac && realMac.trim() && realMac !== "—");

                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: i < paginated.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}
                    className="hover:bg-muted/40 transition-colors"
                    onClick={() => { setSelectedCustomer(c); setDrawerTab("Overview"); }}>
                    <td className="px-3.5 py-3" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                        checked={selectedCustomerIds.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomerIds(prev => [...prev, c.id]);
                          } else {
                            setSelectedCustomerIds(prev => prev.filter(id => id !== c.id));
                          }
                        }}
                      />
                    </td>

                    {/* Client Code */}
                    <td className="px-3.5 py-3 whitespace-nowrap font-mono text-xs font-bold text-primary">
                      {c.clientCode || c.id}
                    </td>

                    {/* Name */}
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 shadow-xs">
                          {c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer">{c.name}</p>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {c.userType === "free" && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" title="Free Tier: Never cutoff, ৳0 bill">
                                <ShieldCheck size={9} /> Free
                              </span>
                            )}
                            {c.userType === "unlimited" && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" title="VIP Unlimited: Permanent VIP connection">
                                <Sparkles size={9} /> VIP
                              </span>
                            )}
                            <button
                              disabled={isReadOnly}
                              onClick={e => { e.stopPropagation(); openEditSubscriberModal(c); }}
                              title={isReadOnly ? "View Only: Editing restricted" : "Edit Subscriber ID & Details"}
                              className={`p-0.5 rounded transition-colors ${isReadOnly ? "opacity-30 cursor-not-allowed text-muted-foreground" : "hover:bg-muted text-muted-foreground hover:text-primary cursor-pointer"}`}>
                              <Edit2 size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Mobile */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-foreground font-medium">
                        <Phone size={11} className="text-muted-foreground" />
                        <span>{c.phone || "—"}</span>
                      </div>
                    </td>

                    {/* ID / PPPoE */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-foreground">{c.pppUser || c.id}</span>
                        <button
                          onClick={e => { e.stopPropagation(); copyToClipboard(c.pppUser || c.id, `tbl-id-${c.id}`); }}
                          title="Copy PPPoE ID"
                          className="text-muted-foreground hover:text-foreground">
                          {copiedKey === `tbl-id-${c.id}` ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                        </button>
                      </div>
                    </td>

                    {/* Zone */}
                    <td className="px-3.5 py-3 whitespace-nowrap text-xs text-foreground font-medium">
                      {c.zone || "—"}
                    </td>

                    {/* Sub Zone */}
                    <td className="px-3.5 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {c.subzone || "—"}
                    </td>

                    {/* Box */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted/60 border border-border/40">
                        {c.box || c.tjBox || "TJ-01"}
                      </span>
                    </td>

                    {/* Start Date */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs text-muted-foreground">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </td>

                    {/* Expired Date & Recharge */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-foreground">
                            {c.expireDate || c.endDate || "—"}
                          </span>
                          {!isReadOnly && (
                            <button
                              title="Recharge / Extend Date Manually"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(c);
                                // Convert existing date to YYYY-MM-DD for input[type="date"] if possible
                                let initDate = "";
                                const existingDate = c.expireDate || c.endDate;
                                if (existingDate) {
                                  const parts = existingDate.split('/');
                                  if (parts.length === 3) {
                                    initDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // assuming DD/MM/YYYY
                                  } else {
                                    try {
                                      const d = new Date(existingDate);
                                      if (!isNaN(d.getTime())) {
                                        initDate = d.toISOString().split('T')[0];
                                      }
                                    } catch (e) {}
                                  }
                                }
                                setRechargeDate(initDate || new Date().toISOString().split('T')[0]);
                                setRechargeModalOpen(true);
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold shadow-sm transition-colors cursor-pointer"
                            >
                              Recharge
                            </button>
                          )}
                        </div>
                        {c.graceDays && c.graceExpiryDate && (
                          <div className="flex items-center gap-1 text-[10px] font-extrabold text-cyan-700 dark:text-cyan-400">
                            <span>🎁 +{c.graceDays}d Bonus Gift (until {c.graceExpiryDate})</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Package & Speed */}
                    <td className="px-3.5 py-3 whitespace-nowrap" onClick={e => { e.stopPropagation(); openChangePackageModal(c); }}>
                      <div className="group cursor-pointer">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          <Package size={12} className="text-primary" />
                          <span className="truncate max-w-[120px]">{c.package}</span>
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                          {c.userType === "free" ? "৳0 / mo (Free Tier)" : `৳${(c.price ?? 0).toLocaleString()}/mo`} · {c.speed || 0} Mbps
                        </p>
                      </div>
                    </td>

                    {/* Live Status & IP */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-medium">
                        <Circle size={7} fill={isOnline ? "#16A34A" : "#9CA3AF"} stroke="none" />
                        <span style={{ color: isOnline ? "#16A34A" : "#9CA3AF", fontWeight: 700 }}>
                          {isOnline ? "Online" : "Offline"}
                        </span>
                        {isOnline && Boolean(displayRx) && displayRx !== "—" && displayRx.toLowerCase() !== "offline" && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                            {displayRx}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate max-w-[110px]">{displayIp || "—"}</p>
                    </td>

                    {/* Status */}
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1 items-start">
                        <StatusBadge status={c.status} />
                        {c.userType === "free" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-black tracking-wider uppercase border border-emerald-500/20">NEVER CUTOFF</span>
                        ) : c.userType === "unlimited" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[9px] font-black tracking-wider uppercase border border-amber-500/20">VIP PERMANENT</span>
                        ) : (() => {
                          const endDateStr = c.endDate || c.expireDate;
                          let isExpired = false;
                          let expDateObj: Date | null = null;
                          if (c.expireDate) {
                            const expParts = c.expireDate.split('/');
                            if (expParts.length === 3) {
                              expDateObj = new Date(`${expParts[2]}-${expParts[1]}-${expParts[0]}`);
                              if (!isNaN(expDateObj.getTime()) && expDateObj < new Date()) {
                                isExpired = true;
                              }
                            }
                          } else if (c.endDate) {
                             expDateObj = new Date(c.endDate);
                             if (!isNaN(expDateObj.getTime()) && expDateObj < new Date()) {
                               isExpired = true;
                             }
                          }
                          return (
                            <>
                              {isExpired && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black tracking-widest uppercase shadow-sm">EXPIRED</span>
                              )}
                              {endDateStr && endDateStr !== "Permanent / Lifetime" && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  isExpired
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                }`}>
                                  <Calendar size={8} />
                                  {endDateStr}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>

                    {/* Due / Bill */}
                    <td className="px-4 py-3">
                      {c.userType === "free" ? (
                        <div>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">৳0 / mo</span>
                          <p className="text-[10px] font-bold text-emerald-600/70">Exempt (Free)</p>
                        </div>
                      ) : c.userType === "unlimited" ? (
                        <div>
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                            {(c.dueAmount ?? 0) > 0 ? `৳${(c.dueAmount ?? 0).toLocaleString()}` : "VIP Active"}
                          </span>
                          <p className="text-[10px] font-bold text-amber-600/70">VIP Permanent</p>
                        </div>
                      ) : (c.dueAmount ?? 0) > 0 ? (
                        <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400">
                          ৳{(c.dueAmount ?? 0).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600">Paid</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          disabled={isReadOnly}
                          title={isReadOnly ? "View Only: Editing restricted" : "Edit Subscriber ID & Profile"}
                          onClick={() => openEditSubscriberModal(c)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isReadOnly ? "opacity-30 cursor-not-allowed text-muted-foreground" : "hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-600 dark:text-amber-400 cursor-pointer"}`}>
                          <Edit3 size={13} />
                        </button>

                        <button
                          title="Copy Login Bundle"
                          onClick={() => copyLoginBundle(c)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground">
                          {copiedKey === `bundle-${c.id}` ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        </button>

                        <button
                          title="Login as Customer in User Panel"
                          onClick={() => loginAsSubscriber(c)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950 text-primary">
                          <ExternalLink size={13} />
                        </button>

                        <button
                          disabled={isReadOnly}
                          title={isReadOnly ? "View Only: SMS restricted" : "Send SMS"}
                          onClick={() => { setSelectedCustomer(c); setSmsModal(true); }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isReadOnly ? "opacity-30 cursor-not-allowed text-muted-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"}`}>
                          <MessageSquare size={13} />
                        </button>

                        <button
                          disabled={isReadOnly}
                          title={isReadOnly ? "View Only: Package modification restricted" : "Change / Upgrade Package"}
                          onClick={() => openChangePackageModal(c)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isReadOnly ? "opacity-30 cursor-not-allowed text-muted-foreground" : "hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 cursor-pointer"}`}>
                          <Sliders size={13} />
                        </button>

                        <button
                          disabled={isReadOnly}
                          title={isReadOnly ? "View Only: Payment collection restricted" : "Record Payment"}
                          onClick={() => { setSelectedCustomer(c); setPaymentModal(true); setPayAmount(String(c.dueAmount || c.price)); }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isReadOnly ? "opacity-30 cursor-not-allowed text-muted-foreground" : "hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"}`}>
                          <CreditCard size={13} />
                        </button>

                        <button
                          disabled={isReadOnly}
                          title={isReadOnly ? "View Only: Deletion restricted" : "Delete / Terminate Subscriber"}
                          onClick={() => setDeleteConfirmCust(c)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isReadOnly ? "opacity-30 cursor-not-allowed text-muted-foreground" : "hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-500 hover:text-rose-700 cursor-pointer"}`}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground text-xs">
                    No customers found matching your criteria. Try resetting filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t flex-wrap gap-3" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs text-muted-foreground font-medium">
              Showing <span className="font-bold text-foreground">{(page - 1) * (itemsPerPage >= 9999 ? filtered.length : itemsPerPage) + 1}</span>–<span className="font-bold text-foreground">{Math.min(page * (itemsPerPage >= 9999 ? filtered.length : itemsPerPage), filtered.length)}</span> of <span className="font-bold text-foreground">{filtered.length}</span> subscribers (Total {customers.length})
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 flex items-center gap-1 rounded-lg border bg-card text-xs font-semibold text-foreground disabled:opacity-40 hover:bg-muted cursor-pointer shadow-2xs"
                  style={{ borderColor: "var(--border)" }}>
                  <ChevronLeft size={13} /> Prev
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 7) {
                    if (page > 4 && page < totalPages - 2) {
                      pageNum = page - 3 + i;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 6 + i;
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        page === pageNum ? "bg-primary text-white border-primary shadow-2xs" : "bg-card text-foreground border-border hover:bg-muted"
                      }`}>
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1.5 flex items-center gap-1 rounded-lg border bg-card text-xs font-semibold text-foreground disabled:opacity-40 hover:bg-muted cursor-pointer shadow-2xs"
                  style={{ borderColor: "var(--border)" }}>
                  Next <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        )}
        </>
      )}
      </div>

      {/* ── CUSTOMER DRAWER ── */}
      {selectedCustomer && !smsModal && !paymentModal && (
        <div className="fixed inset-0 flex justify-end z-[100] bg-black/40 backdrop-blur-xs" onClick={() => setSelectedCustomer(null)}>
          <div
            className="h-full overflow-y-auto flex flex-col w-full max-w-lg bg-card shadow-2xl border-l animate-slideIn"
            style={{ borderColor: "var(--border)" }}
            onClick={e => e.stopPropagation()}>
            <style>{`@keyframes slideIn{from{transform:translateX(24px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md">
                  {selectedCustomer.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-foreground">{selectedCustomer.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs font-bold text-primary">{selectedCustomer.clientCode || selectedCustomer.id}</span>
                    <button
                      onClick={() => setDrawerTab("Identity & ID")}
                      title="Edit Subscriber ID"
                      className="px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors">
                      <Edit2 size={10} /> Edit ID
                    </button>
                    <span className="text-xs text-muted-foreground">· {selectedCustomer.phone}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded-full text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            {/* Quick Action Top Bar */}
            <div className="p-4 bg-muted/40 border-b flex items-center justify-between gap-2" style={{ borderColor: "var(--border)" }}>
              <StatusBadge status={selectedCustomer.status} />

              <div className="flex items-center gap-2">
                <button
                  disabled={isReadOnly}
                  onClick={() => openEditSubscriberModal(selectedCustomer)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-xs border flex items-center gap-1.5 ${isReadOnly ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground" : "bg-card hover:bg-muted text-foreground cursor-pointer"}`}
                  title={isReadOnly ? "View Only: Editing restricted" : "Edit Details"}>
                  <Edit3 size={12} /> Edit Details
                </button>
                <button
                  onClick={() => loginAsSubscriber(selectedCustomer)}
                  className="px-3 py-1.5 rounded-xl font-bold text-xs text-white bg-primary hover:opacity-95 shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <ExternalLink size={13} /> Login as User
                </button>
                <button
                  onClick={() => copyLoginBundle(selectedCustomer)}
                  className="px-2.5 py-1.5 rounded-xl font-bold text-xs border bg-card hover:bg-muted text-foreground flex items-center gap-1.5">
                  <Copy size={12} /> Copy Credentials
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b overflow-x-auto scrollbar-thin" style={{ borderColor: "var(--border)" }}>
              {DRAWER_TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setDrawerTab(t)}
                  className={`flex-1 py-3 px-2 text-xs font-bold transition-colors border-b-2 whitespace-nowrap ${
                    drawerTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {drawerTab === "Overview" && (() => {
                const cleanUser = (selectedCustomer.pppUser || selectedCustomer.name || "").toLowerCase();
                const liveMatch = liveStatsMap.get(cleanUser) || liveStatsMap.get((selectedCustomer.name || "").toLowerCase());
                const activeMac = liveMatch?.live_mac || selectedCustomer.mac || selectedCustomer.callingStationId || "";
                const isBound = selectedCustomer.macBound !== false && Boolean(activeMac && activeMac.trim() && activeMac !== "—");

                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "User ID", value: selectedCustomer.clientCode || selectedCustomer.id, mono: true, copyKey: "id" },
                        { label: "Default Passcode", value: selectedCustomer.passcode, mono: true, copyKey: "pass" },
                        { label: "Phone", value: selectedCustomer.phone },
                        { label: "Email", value: selectedCustomer.email },
                        { label: "Zone", value: `${selectedCustomer.subzone}, ${selectedCustomer.zone}` },
                        { label: "Address", value: selectedCustomer.address },
                        { label: "Package", value: selectedCustomer.package },
                        { label: "Monthly Fee", value: `৳${(selectedCustomer.price ?? 0).toLocaleString()}/mo` },
                        { label: "PPPoE Username", value: selectedCustomer.pppUser, mono: true },
                        { label: "Live IP Address", value: liveMatch?.live_ip || selectedCustomer.ipAddress || "—", mono: true },
                        { label: "Real MAC Address", value: activeMac || "—", mono: true, copyKey: "mac" },
                        { label: "MAC Lock Status", value: isBound ? "Bound (Protected)" : "Unbound", mono: false },
                        { label: "Assigned OLT", value: selectedCustomer.olt },
                        { label: "Optical Rx", value: (selectedCustomer.onuSignal && selectedCustomer.onuSignal.toLowerCase() !== "offline" && selectedCustomer.onuSignal !== "—") ? selectedCustomer.onuSignal : "—" },
                      ].map(item => (
                        <div key={item.label} className="rounded-xl p-3 bg-muted/40 border border-border/40 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                            {item.copyKey && (
                              <button
                                onClick={() => copyToClipboard(item.value, `item-${item.copyKey}`)}
                                className="text-muted-foreground hover:text-foreground">
                                {copiedKey === `item-${item.copyKey}` ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                              </button>
                            )}
                          </div>
                          <p className={`text-xs font-bold text-foreground mt-1 ${item.mono ? "font-mono" : ""}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Subscriber Management Actions</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          disabled={isReadOnly}
                          onClick={() => handleToggleMacBinding(selectedCustomer)}
                          className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 col-span-2 border transition-all ${
                            isReadOnly ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-border" : isBound ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:opacity-95 cursor-pointer" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:opacity-95 cursor-pointer"
                          }`}>
                          {isBound ? <Unlock size={14} /> : <Lock size={14} />}
                          <span>{isBound ? `Release MAC Lock (Unbind ${activeMac || "MAC"})` : `Lock & Bind Router MAC (${activeMac || "Calling-ID"})`}</span>
                        </button>
                        <button
                          disabled={isReadOnly}
                          onClick={() => openChangePackageModal(selectedCustomer)}
                          className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 col-span-2 border transition-all ${
                            isReadOnly ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-border" : "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:opacity-95 cursor-pointer"
                          }`}>
                          <Sliders size={14} /> Change / Upgrade Package Plan
                        </button>
                        <button
                          disabled={isReadOnly}
                          onClick={() => toggleNet(selectedCustomer, true)}
                          className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                            isReadOnly ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:opacity-95 cursor-pointer"
                          }`}>
                          <Wifi size={14} /> Enable Line
                        </button>
                        <button
                          disabled={isReadOnly}
                          onClick={() => toggleNet(selectedCustomer, false)}
                          className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                            isReadOnly ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground" : "bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:opacity-95 cursor-pointer"
                          }`}>
                          <WifiOff size={14} /> Disable Line
                        </button>
                        <button
                          disabled={isReadOnly}
                          onClick={() => setSmsModal(true)}
                          className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                            isReadOnly ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground" : "bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300 hover:opacity-95 cursor-pointer"
                          }`}>
                          <Send size={14} /> Send SMS Notice
                        </button>
                        <button
                          disabled={isReadOnly}
                          onClick={() => { setPaymentModal(true); setPayAmount(String(selectedCustomer.dueAmount || selectedCustomer.price)); }}
                          className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                            isReadOnly ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary/10 text-primary hover:opacity-95 cursor-pointer"
                          }`}>
                          <CreditCard size={14} /> Record Payment
                        </button>
                        <button
                          disabled={isReadOnly}
                          onClick={() => setDeleteConfirmCust(selectedCustomer)}
                          className={`p-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 col-span-2 border transition-all ${
                            isReadOnly ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-border" : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-900 hover:bg-rose-100 cursor-pointer"
                          }`}>
                          <Trash2 size={14} /> Terminate & Delete Subscriber Account
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* ── 1. SUBSCRIBER IDENTITY & ID EDIT TAB ── */}
              {drawerTab === "Identity & ID" && (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <Tag size={16} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Subscriber ID & Personal Identity</h3>
                          <p className="text-[11px] text-muted-foreground">Admin edit access for Subscriber ID, profile, contact and portal security</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-xs">
                      {/* Subscriber ID / Client Code */}
                      <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5">
                        <label className="text-[11px] font-bold text-foreground uppercase flex items-center justify-between">
                          <span>Subscriber ID / Client Code <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">Primary Unique Identifier</span>
                        </label>
                        <input
                          type="text"
                          value={personalForm.id || personalForm.clientCode || ""}
                          onChange={e => {
                            const val = e.target.value.toUpperCase().replace(/\s/g, "");
                            setPersonalForm(prev => ({ ...prev, id: val, clientCode: val }));
                          }}
                          placeholder="e.g. MBN0001 or CUST-1002"
                          className="w-full px-3 py-2.5 text-xs rounded-lg bg-card border border-border text-foreground font-mono font-bold outline-none focus:border-primary transition-all tracking-wider uppercase"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          Note: Modifying the Subscriber ID will automatically migrate the cloud database record and portal login ID.
                        </p>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={personalForm.name || ""}
                          onChange={e => setPersonalForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Subscriber full name"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
                        />
                      </div>

                      {/* Phone & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                            Mobile Phone <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={personalForm.phone || ""}
                            onChange={e => setPersonalForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="017xxxxxxxx"
                            className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-mono font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Email Address</label>
                          <input
                            type="email"
                            value={personalForm.email || ""}
                            onChange={e => setPersonalForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@example.com"
                            className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* Zone & Sub-Zone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Zone</label>
                          <input
                            type="text"
                            value={personalForm.zone || ""}
                            onChange={e => setPersonalForm(prev => ({ ...prev, zone: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Sub Zone</label>
                          <input
                            type="text"
                            value={personalForm.subzone || ""}
                            onChange={e => setPersonalForm(prev => ({ ...prev, subzone: e.target.value }))}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* Installation Address */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Installation Address</label>
                        <input
                          type="text"
                          value={personalForm.address || ""}
                          onChange={e => setPersonalForm(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="House, Road, Area"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        />
                      </div>

                      {/* Portal Passcode */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Portal Login Passcode</label>
                        <input
                          type="text"
                          value={personalForm.passcode || ""}
                          onChange={e => setPersonalForm(prev => ({ ...prev, passcode: e.target.value }))}
                          placeholder="e.g. mbn@0001"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border font-mono font-bold text-primary outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSavePersonalInfo}
                      disabled={isSavingDrawer || isReadOnly}
                      className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                        isReadOnly ? "bg-muted-foreground opacity-50 cursor-not-allowed" : "bg-primary hover:opacity-95 cursor-pointer"
                      }`}
                      title={isReadOnly ? "View Only: Saving changes is restricted" : "Save Subscriber ID & Identity"}
                    >
                      <Save size={14} />
                      <span>{isSavingDrawer ? "Saving Changes..." : isReadOnly ? "View Only (Modifications Restricted)" : "Save Subscriber ID & Identity"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── 2. NETWORK & PRODUCT INFO TAB ── */}
              {drawerTab === "Network & Product" && (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                          <Network size={16} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Network & Product Info</h3>
                          <p className="text-[11px] text-muted-foreground">Manage subscriber port, optical splitter, OLT and fiber details</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Package */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Package <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={netForm.package || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, package: e.target.value, profile: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
                        >
                          {livePackages.map(p => (
                            <option key={p.id} value={p.name}>{p.name} (৳{p.price}/mo)</option>
                          ))}
                        </select>
                      </div>

                      {/* Server */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Server</label>
                        <select
                          value={netForm.serverName || (liveMikrotiks[0] || "")}
                          onChange={e => setNetForm(prev => ({ ...prev, serverName: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none font-mono"
                        >
                          {liveMikrotiks.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      {/* Protocol Type */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Protocol Type</label>
                        <input
                          type="text"
                          value={netForm.protocolType || "pppoe"}
                          onChange={e => setNetForm(prev => ({ ...prev, protocolType: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none font-mono"
                        />
                      </div>

                      {/* Profile */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Profile</label>
                        <input
                          type="text"
                          value={netForm.profile || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, profile: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none font-mono"
                        />
                      </div>

                      {/* Framed / Static IP Address (MikroTik Remote Address) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-foreground uppercase">
                            IP Address / Remote Address
                          </label>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Pool-35 / Static
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={netForm.ipAddress || ""}
                            onChange={e => setNetForm(prev => ({ ...prev, ipAddress: e.target.value.trim() }))}
                            placeholder="e.g. 10.215.35.15"
                            className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none font-mono focus:border-primary font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const pool = IP_POOLS[0];
                              const nextIp = generateNextSequentialIp(pool.prefix, pool.startHost);
                              setNetForm(prev => ({ ...prev, ipAddress: nextIp }));
                              setToast(`✓ Auto-assigned next IP from ${pool.name}: ${nextIp}`);
                              setTimeout(() => setToast(""), 3500);
                            }}
                            className="px-2.5 py-1 text-[10px] rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground font-bold flex items-center gap-1 cursor-pointer shrink-0"
                            title="Auto-assign next free IP in Pool-35">
                            <RefreshCw size={11} /> Auto
                          </button>
                        </div>
                      </div>

                      {/* Connection Type */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Connection Type <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={netForm.connectionType || "Optical Fiber"}
                          onChange={e => setNetForm(prev => ({ ...prev, connectionType: e.target.value as any }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        >
                          <option value="Optical Fiber">Optical Fiber</option>
                          <option value="Cat6">Cat6 Ethernet</option>
                          <option value="Wireless">Wireless Bridge</option>
                        </select>
                      </div>

                      {/* Zone */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Zone <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={netForm.zone || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, zone: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        />
                      </div>

                      {/* Sub Zone */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Sub Zone</label>
                        <input
                          type="text"
                          value={netForm.subzone || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, subzone: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        />
                      </div>

                      {/* Box */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Distribution Box</label>
                        <input
                          type="text"
                          value={netForm.box || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, box: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        />
                      </div>

                      {/* Splitter Box / ODB */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Splitter Box / ODB
                        </label>
                        <input
                          type="text"
                          value={netForm.splitterBox || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, splitterBox: e.target.value }))}
                          placeholder="e.g. Splitter-01 (1:8)"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
                        />
                      </div>

                      {/* Splitter Port */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Splitter Port / Core
                        </label>
                        <select
                          value={netForm.splitterPort || "Port 1"}
                          onChange={e => setNetForm(prev => ({ ...prev, splitterPort: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
                        >
                          <option value="Port 1">Port 1 (Free)</option>
                          <option value="Port 2">Port 2</option>
                          <option value="Port 3">Port 3</option>
                          <option value="Port 4">Port 4</option>
                          <option value="Port 5">Port 5</option>
                          <option value="Port 6">Port 6</option>
                          <option value="Port 7">Port 7</option>
                          <option value="Port 8">Port 8</option>
                          <option value="Port 9">Port 9 (1:16)</option>
                          <option value="Port 10">Port 10 (1:16)</option>
                          <option value="Port 11">Port 11 (1:16)</option>
                          <option value="Port 12">Port 12 (1:16)</option>
                          <option value="Port 13">Port 13 (1:16)</option>
                          <option value="Port 14">Port 14 (1:16)</option>
                          <option value="Port 15">Port 15 (1:16)</option>
                          <option value="Port 16">Port 16 (1:16)</option>
                        </select>
                      </div>

                      {/* Cable Required in Metre */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Cable Required in Metre</label>
                        <input
                          type="number"
                          value={netForm.cableMetre || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, cableMetre: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        />
                      </div>

                      {/* Fiber Code */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Fiber Code</label>
                        <input
                          type="text"
                          value={netForm.fiberCode || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, fiberCode: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none font-mono"
                        />
                      </div>

                      {/* Number of Core */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Number of Core</label>
                        <input
                          type="text"
                          value={netForm.coreNumber || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, coreNumber: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none font-mono"
                        />
                      </div>

                      {/* Core Color */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Core Color</label>
                        <input
                          type="text"
                          value={netForm.coreColor || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, coreColor: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        />
                      </div>

                      {/* Device */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Device</label>
                        <select
                          value={netForm.deviceType || "ONU Dual Band XPON (Gigabit)"}
                          onChange={e => setNetForm(prev => ({ ...prev, deviceType: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        >
                          <option value="ONU Dual Band XPON (Gigabit)">ONU Dual Band XPON (Gigabit)</option>
                          <option value="ONU Single Band EPON">ONU Single Band EPON</option>
                          <option value="Wi-Fi 6 Router (AX1800)">Wi-Fi 6 Router (AX1800)</option>
                          <option value="Direct Media Converter">Direct Media Converter</option>
                        </select>
                      </div>

                      {/* Device MAC/Serial No */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Device MAC/Serial No</label>
                        <input
                          type="text"
                          value={netForm.deviceSerial || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, deviceSerial: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none font-mono"
                        />
                      </div>

                      {/* Vendor */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Vendor</label>
                        <select
                          value={netForm.deviceVendor || "VSOL"}
                          onChange={e => setNetForm(prev => ({ ...prev, deviceVendor: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        >
                          <option value="VSOL">VSOL</option>
                          <option value="Huawei">Huawei</option>
                          <option value="ZTE">ZTE</option>
                          <option value="BDCOM">BDCOM</option>
                          <option value="TP-Link">TP-Link</option>
                          <option value="Realtek">Realtek</option>
                        </select>
                      </div>

                      {/* Purchase Date */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Purchase Date</label>
                        <input
                          type="text"
                          value={netForm.purchaseDate || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                          placeholder="DD/MM/YYYY"
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveNetworkInfo}
                      disabled={isSavingDrawer || isReadOnly}
                      className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                        isReadOnly ? "bg-muted-foreground opacity-50 cursor-not-allowed" : "bg-primary hover:opacity-95 cursor-pointer"
                      }`}
                      title={isReadOnly ? "View Only: Saving changes is restricted" : "Save Network & Product Info"}
                    >
                      <Save size={14} />
                      <span>{isSavingDrawer ? "Saving Changes..." : isReadOnly ? "View Only (Modifications Restricted)" : "Save Network & Product Info"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── 3. SERVICE INFORMATION TAB ── */}
              {drawerTab === "Service Info" && (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <Sliders size={16} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Service Information</h3>
                          <p className="text-[11px] text-muted-foreground">Manage PPPoE credentials, billing cycles & activation status</p>
                        </div>
                      </div>

                      {/* Disable Client Toggle */}
                      <label className="flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-4 py-2.5 rounded-xl cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
                        <ShieldAlert size={14} className="text-rose-600 dark:text-rose-400 flex-shrink-0" />
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase leading-tight">
                          WANT TO CREATE<br />AS DISABLE CLIENT?
                        </span>
                        <input
                          type="checkbox"
                          checked={!!serviceForm.disabledInMikrotik}
                          onChange={e => setServiceForm(prev => ({ ...prev, disabledInMikrotik: e.target.checked }))}
                          className="w-4 h-4 ml-2 rounded text-rose-600 focus:ring-rose-500 border-rose-300 bg-white dark:bg-transparent"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Username/IP */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Username/IP <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={serviceForm.pppUser || ""}
                          onChange={e => setServiceForm(prev => ({ ...prev, pppUser: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none font-mono focus:border-primary"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={serviceForm.pppPass || ""}
                          onChange={e => setServiceForm(prev => ({ ...prev, pppPass: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none font-mono focus:border-primary"
                        />
                      </div>

                      {/* Billing Start Month */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Billing Start Month <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={serviceForm.billingStartMonth || `${String(new Date().getMonth() + 1).padStart(2, "0")}/${new Date().getFullYear()}`}
                          onChange={e => setServiceForm(prev => ({ ...prev, billingStartMonth: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-mono"
                        />
                      </div>

                      {/* Monthly Bill */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Monthly Bill (৳) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={serviceForm.monthlyBill || ""}
                          onChange={e => setServiceForm(prev => ({ ...prev, monthlyBill: Number(e.target.value) }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-bold font-mono"
                        />
                      </div>

                      {/* Client Type */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Client Type <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={serviceForm.clientType || "Home"}
                          onChange={e => setServiceForm(prev => ({ ...prev, clientType: e.target.value as any }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        >
                          <option value="Home">Home</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Reseller">Reseller</option>
                          <option value="Corporate">Corporate</option>
                        </select>
                      </div>

                      {/* Billing Status */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Billing Status <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={serviceForm.billingStatus || "Monthly"}
                          onChange={e => setServiceForm(prev => ({ ...prev, billingStatus: e.target.value as any }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        >
                          <option value="Monthly">Monthly</option>
                          <option value="Prepaid">Prepaid</option>
                          <option value="Daily">Daily</option>
                          <option value="Postpaid">Postpaid</option>
                        </select>
                      </div>

                      {/* Expire Date */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Expire Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={serviceForm.expireDate || ""}
                          onChange={e => setServiceForm(prev => ({ ...prev, expireDate: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        />
                      </div>

                      {/* Grant Extra Days (Bonus Gift Matrix) */}
                      <div className="col-span-2 p-3 mt-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                            Bonus Gift / Emergency Extension
                          </label>
                          <p className="text-[10px] text-muted-foreground">Grant extra days to keep line active without changing the base monthly billing expired date (Bonus Gift Matrix).</p>
                          {selectedCustomer.graceDays && selectedCustomer.graceExpiryDate && (
                            <p className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 mt-0.5">
                              🎁 Active Gift: +{selectedCustomer.graceDays} days grace (Access permitted until {selectedCustomer.graceExpiryDate})
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={extraDays}
                            onChange={e => setExtraDays(e.target.value)}
                            className="w-20 px-3 py-1.5 text-xs rounded-lg bg-card border border-border text-foreground outline-none focus:border-indigo-500 font-bold font-mono"
                          />
                          <button
                            disabled={isReadOnly}
                            onClick={handleGrantExtraDays}
                            className={`px-4 py-1.5 rounded-lg font-bold text-xs text-white shadow-sm flex items-center gap-1 transition-all ${
                              isReadOnly ? "bg-muted-foreground opacity-50 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                            }`}
                            title={isReadOnly ? "View Only: Extending grace period is restricted" : "Grant Bonus Extra Days"}
                          >
                            <Clock size={12} />
                            Grant Extra Days
                          </button>
                        </div>
                      </div>

                      {/* Joining Date */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                          Joining Date (No relation in billing) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={serviceForm.joinDate || ""}
                          onChange={e => setServiceForm(prev => ({ ...prev, joinDate: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveServiceInfo}
                      disabled={isSavingDrawer || isReadOnly}
                      className={`w-full mt-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                        isReadOnly ? "bg-muted-foreground opacity-50 cursor-not-allowed" : "bg-primary hover:opacity-95 cursor-pointer"
                      }`}
                      title={isReadOnly ? "View Only: Saving changes is restricted" : "Save Service Information"}
                    >
                      <Save size={14} />
                      <span>{isSavingDrawer ? "Saving Changes..." : isReadOnly ? "View Only (Modifications Restricted)" : "Save Service Information"}</span>
                    </button>
                  </div>
                </div>
              )}

              {drawerTab === "Credentials" && (() => {
                const cleanUser = (selectedCustomer.pppUser || selectedCustomer.name || "").toLowerCase();
                const liveMatch = liveStatsMap.get(cleanUser) || liveStatsMap.get((selectedCustomer.name || "").toLowerCase());
                const activeMac = liveMatch?.live_mac || selectedCustomer.mac || selectedCustomer.callingStationId || "";
                const isBound = selectedCustomer.macBound !== false && Boolean(activeMac && activeMac.trim() && activeMac !== "—");

                return (
                  <div className="space-y-4">
                    {/* Subscriber Login Passcode & PPPoE */}
                    <div className="p-5 rounded-2xl border bg-muted/30 space-y-3" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Lock size={16} className="text-primary" /> Subscriber Login Passcode & PPPoE
                        </h3>
                        <div className="flex items-center gap-2">
                          {!isEditingCredentials ? (
                            <button
                              onClick={() => {
                                if (isReadOnly || !canEdit) {
                                  setToast("Access Restricted: View Only Mode. Modifying credentials is restricted.");
                                  setTimeout(() => setToast(""), 3000);
                                  return;
                                }
                                setIsEditingCredentials(true);
                              }}
                              className="px-2.5 py-1 rounded-lg border text-xs font-semibold bg-card hover:bg-muted flex items-center gap-1.5 shadow-sm transition-all"
                              style={{ borderColor: "var(--border)" }}>
                              <Edit2 size={12} className="text-primary" /> Edit Credentials
                            </button>
                          ) : (
                            <button
                              onClick={() => setIsEditingCredentials(false)}
                              className="px-2.5 py-1 rounded-lg border text-xs font-semibold bg-muted hover:bg-muted/80 flex items-center gap-1"
                              style={{ borderColor: "var(--border)" }}>
                              <X size={12} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditingCredentials ? (
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="text-[11px] font-bold text-muted-foreground block mb-1">PORTAL PASSCODE</label>
                            <input
                              type="text"
                              value={credForm.passcode}
                              onChange={e => setCredForm(p => ({ ...p, passcode: e.target.value }))}
                              placeholder="e.g. mbn@10001"
                              className="w-full px-3 py-2 rounded-xl bg-card border font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              style={{ borderColor: "var(--border)" }}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-muted-foreground block mb-1">PPPOE CONNECTION USERNAME</label>
                            <input
                              type="text"
                              value={credForm.pppUser}
                              onChange={e => setCredForm(p => ({ ...p, pppUser: e.target.value }))}
                              placeholder="e.g. mbn0001"
                              className="w-full px-3 py-2 rounded-xl bg-card border font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              style={{ borderColor: "var(--border)" }}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-muted-foreground block mb-1">PPPOE CONNECTION PASSWORD</label>
                            <input
                              type="text"
                              value={credForm.pppPass}
                              onChange={e => setCredForm(p => ({ ...p, pppPass: e.target.value }))}
                              placeholder="PPPoE secret password"
                              className="w-full px-3 py-2 rounded-xl bg-card border font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                              style={{ borderColor: "var(--border)" }}
                            />
                          </div>

                          <div className="pt-2 flex justify-end gap-2">
                            <button
                              onClick={() => setIsEditingCredentials(false)}
                              className="px-4 py-2 rounded-xl border text-xs font-bold hover:bg-muted transition-all"
                              style={{ borderColor: "var(--border)" }}>
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveCredentials}
                              disabled={isSavingDrawer}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-95 shadow-sm flex items-center gap-1.5 transition-all">
                              <Save size={14} />
                              <span>{isSavingDrawer ? "Saving..." : "Save Credentials"}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-[11px] font-bold text-muted-foreground block mb-1">USER / CUSTOMER ID</label>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-card border font-mono font-bold text-foreground text-sm" style={{ borderColor: "var(--border)" }}>
                              <span>{selectedCustomer.id}</span>
                              <button
                                onClick={() => copyToClipboard(selectedCustomer.id, "drawer-cust-id")}
                                className="px-2.5 py-1 rounded-lg border text-xs bg-muted hover:bg-muted/80 flex items-center gap-1 font-sans">
                                {copiedKey === "drawer-cust-id" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Copy ID
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-muted-foreground block mb-1">DEFAULT PORTAL PASSCODE</label>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-card border font-mono font-bold text-foreground text-sm" style={{ borderColor: "var(--border)" }}>
                              <span>{(selectedCustomer.passcode || "").replace(/^isp@/i, "mbn@") || `mbn@${(selectedCustomer.clientCode || selectedCustomer.id).replace(/\D/g, "")}`}</span>
                              <button
                                onClick={() => copyToClipboard((selectedCustomer.passcode || "").replace(/^isp@/i, "mbn@") || `mbn@${(selectedCustomer.clientCode || selectedCustomer.id).replace(/\D/g, "")}`, "drawer-cust-pass")}
                                className="px-2.5 py-1 rounded-lg border text-xs bg-muted hover:bg-muted/80 flex items-center gap-1 font-sans">
                                {copiedKey === "drawer-cust-pass" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Copy Passcode
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-muted-foreground block mb-1">PPPOE CONNECTION USERNAME</label>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-card border font-mono font-bold text-foreground text-sm" style={{ borderColor: "var(--border)" }}>
                              <span>{selectedCustomer.pppUser || selectedCustomer.name}</span>
                              <button
                                onClick={() => copyToClipboard(selectedCustomer.pppUser || selectedCustomer.name, "drawer-cust-pppuser")}
                                className="px-2.5 py-1 rounded-lg border text-xs bg-muted hover:bg-muted/80 flex items-center gap-1 font-sans">
                                {copiedKey === "drawer-cust-pppuser" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Copy Username
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-muted-foreground block mb-1">PPPOE CONNECTION PASSWORD</label>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-card border font-mono font-bold text-foreground text-sm" style={{ borderColor: "var(--border)" }}>
                              <span>{selectedCustomer.pppPass}</span>
                              <button
                                onClick={() => copyToClipboard(selectedCustomer.pppPass, "drawer-cust-pppoe")}
                                className="px-2.5 py-1 rounded-lg border text-xs bg-muted hover:bg-muted/80 flex items-center gap-1 font-sans">
                                {copiedKey === "drawer-cust-pppoe" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Copy PPPoE
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* MAC Address & PPPoE Calling-Station-Id Lock */}
                    <div className="p-5 rounded-2xl border bg-card space-y-3.5 shadow-sm" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <Shield size={16} className={isBound ? "text-emerald-500" : "text-amber-500"} /> MAC Binding & Hardware Lock
                        </h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${isBound ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"}`}>
                          {isBound ? <Lock size={10} /> : <Unlock size={10} />}
                          {isBound ? "MAC BOUND & LOCKED" : "UNBOUND (OPEN ROUTER)"}
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-muted-foreground block mb-1">DETECTED ROUTER MAC / CALLING-STATION-ID</label>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border font-mono font-bold text-foreground text-sm" style={{ borderColor: "var(--border)" }}>
                          <span>{activeMac || "Not Detected"}</span>
                          {activeMac && (
                            <button
                              onClick={() => copyToClipboard(activeMac, "drawer-cust-mac")}
                              className="px-2.5 py-1 rounded-lg border text-xs bg-card hover:bg-muted flex items-center gap-1 font-sans">
                              {copiedKey === "drawer-cust-mac" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />} Copy MAC
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-muted/30 border text-xs flex items-start gap-2" style={{ borderColor: "var(--border)" }}>
                        {isBound ? <ShieldCheck size={15} className="text-emerald-500 mt-0.5 shrink-0" /> : <AlertTriangle size={15} className="text-amber-500 mt-0.5 shrink-0" />}
                        <p className="font-medium text-foreground">
                          {isBound
                            ? "Security Active: PPPoE authentication is strictly locked to this physical router hardware MAC. Unauthorized clone routers will be blocked."
                            : "Security Warning: MAC is currently unbound. PPPoE user can connect from any router or network adapter."}
                        </p>
                      </div>

                      <button
                        onClick={() => handleToggleMacBinding(selectedCustomer)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm ${isBound ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
                        {isBound ? <Unlock size={14} /> : <Lock size={14} />}
                        <span>{isBound ? "Release MAC Lock (Unbind for Router Replacement)" : `Lock & Bind Current MAC (${activeMac || "Calling-ID"})`}</span>
                      </button>
                    </div>

                    {/* Share Box */}
                    <div className="p-5 rounded-2xl border space-y-3 bg-card" style={{ borderColor: "var(--border)" }}>
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Share Credentials with User</h4>
                      <p className="text-xs text-muted-foreground">
                        Click below to copy formatted SMS/WhatsApp text to send to the subscriber:
                      </p>

                      <button
                        onClick={() => copyLoginBundle(selectedCustomer)}
                        className="w-full py-3 rounded-xl font-bold text-xs text-white bg-primary shadow-md hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer">
                        <Copy size={14} />
                        <span>{copiedKey === `bundle-${selectedCustomer.id}` ? "Copied to Clipboard!" : "Copy Full SMS / WhatsApp Message"}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {drawerTab === "Billing" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-muted/40 border flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="text-xs font-bold text-foreground">{selectedCustomer.package}</div>
                      <div className="text-[11px] text-muted-foreground">Billing Cycle: {selectedCustomer.billingDate}th of every month · ৳{selectedCustomer.price}/mo</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-sm font-black ${(selectedCustomer.dueAmount ?? 0) > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {(selectedCustomer.dueAmount ?? 0) > 0 ? `৳${(selectedCustomer.dueAmount ?? 0).toLocaleString()} DUE` : "PAID"}
                      </span>
                      <button
                        onClick={() => openChangePackageModal(selectedCustomer)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 flex items-center gap-1 shadow-sm cursor-pointer">
                        <Sliders size={12} /> Change Plan
                      </button>
                    </div>
                  </div>

                  {(selectedCustomer.invoices || []).map(inv => (
                    <div key={inv.id} className="p-4 rounded-2xl border flex items-center justify-between" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                      <div>
                        <div className="text-xs font-bold text-foreground">{inv.month} ({inv.id})</div>
                        <div className="text-[11px] text-muted-foreground">{inv.paidDate ? `Paid on ${inv.paidDate}` : `Due: ${inv.dueDate}`}</div>
                      </div>
                      <span className="font-mono text-xs font-bold">৳{(inv.amount ?? 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === "Payments" && (
                <div className="space-y-3">
                  <button
                    onClick={() => { setPaymentModal(true); setPayAmount(String(selectedCustomer.dueAmount || selectedCustomer.price || 0)); }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-primary shadow-md flex items-center justify-center gap-2">
                    <Plus size={14} /> Record Manual Payment
                  </button>

                  {(selectedCustomer.paymentHistory || []).map(p => (
                    <div key={p.id} className="p-4 rounded-2xl border flex items-center justify-between" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                      <div>
                        <div className="text-xs font-bold font-mono text-primary">{p.trxId} ({p.method})</div>
                        <div className="text-[11px] text-muted-foreground">{p.date} · {p.collectedBy}</div>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-600">+৳{(p.amount ?? 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === "Activity" && (
                <div className="space-y-2">
                  {[
                    ...(selectedCustomer.netStatus === "online"
                      ? [{ icon: Zap, label: "Live Active Session", time: selectedCustomer.sessionUptime ? `Up for ${selectedCustomer.sessionUptime}` : "Dialed & Online", desc: `PPPoE session authenticated on ${selectedCustomer.serverName || selectedCustomer.mikrotik || "MikroTik-01"}` }]
                      : [{ icon: WifiOff, label: "Line Suspended / Offline", time: selectedCustomer.logoutTime || "Disconnected", desc: "Session offline or disabled by administrator." }]),
                    ...(selectedCustomer.paymentHistory && selectedCustomer.paymentHistory.length > 0
                      ? selectedCustomer.paymentHistory.slice(0, 3).map(p => ({
                          icon: CreditCard,
                          label: `Payment Logged (+৳${(p.amount ?? 0).toLocaleString()})`,
                          time: p.date,
                          desc: `Trx ${p.trxId} verified via ${p.method} (${p.collectedBy})`,
                        }))
                      : [{ icon: CreditCard, label: "Billing Cycle Recorded", time: `Due: ${selectedCustomer.endDate || "End of Month"}`, desc: `Monthly fee ৳${(selectedCustomer.price ?? 0).toLocaleString()}/mo for ${selectedCustomer.package}` }]),
                    { icon: Lock, label: "Portal Passcode Active", time: selectedCustomer.joinDate || "Active", desc: `Subscriber credentials: ${(selectedCustomer.passcode || "").replace(/^isp@/i, "mbn@") || `mbn@${(selectedCustomer.clientCode || selectedCustomer.id).replace(/\D/g, "")}`}` },
                    { icon: UserCheck, label: "Subscriber Account Created", time: selectedCustomer.joinDate || "Registered", desc: `Registered in ${selectedCustomer.subzone || "Somitir Hat"}, ${selectedCustomer.zone || "Madaripur"}` },
                  ].map((act, idx) => {
                    const Icon = act.icon;
                    return (
                      <div key={idx} className="p-3 rounded-xl bg-muted/40 border border-border/40 flex items-start gap-3 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                          <Icon size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{act.label}</div>
                          <div className="text-[11px] text-muted-foreground">{act.desc}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{act.time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD CUSTOMER MODAL WITH SMART AUTO-PROVISIONING ── */}
      {showAdd && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[92vh]"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-primary/10 text-primary">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Provision New Subscriber</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Bandwidth division (8/12/16 bit), auto-sequential IP allocation & PPPoE creation</p>
                </div>
              </div>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Section 1: Basic Profile */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-black text-primary uppercase tracking-wider">1. Subscriber Profile & ID</span>
                  <span className="text-[11px] text-muted-foreground">General Info</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 p-3 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                        <Tag size={12} className="text-primary" />
                        <span>SUBSCRIBER ID / CLIENT CODE</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                          {addForm.id.trim() ? "Custom" : "Auto-Sequential"}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAddForm(p => ({ ...p, id: nextSequentialCode }));
                          showToast(`Set to sequential ID: ${nextSequentialCode}`);
                        }}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
                        <RefreshCw size={10} /> Reset to Auto ({nextSequentialCode})
                      </button>
                    </div>
                    <input
                      value={addForm.id || nextSequentialCode}
                      onChange={e => {
                        const val = e.target.value.toUpperCase().replace(/\s/g, "");
                        setAddForm(p => ({ ...p, id: val }));
                      }}
                      placeholder="e.g. MBN0034 or CUST-1002"
                      className={`${inputCls} font-mono font-bold text-foreground uppercase tracking-wider`}
                      style={inputStyle}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">FULL NAME *</label>
                    <input
                      value={addForm.name}
                      onChange={e => {
                        const val = e.target.value;
                        setAddForm(p => ({ ...p, name: val }));
                      }}
                      placeholder="e.g. Tanvir Ahmed"
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">MOBILE NUMBER *</label>
                    <input
                      value={addForm.phone}
                      onChange={e => {
                        const val = e.target.value;
                        setAddForm(p => ({ ...p, phone: val }));
                      }}
                      placeholder="017xxxxxxxx"
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">EMAIL ADDRESS</label>
                    <input
                      value={addForm.email}
                      onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="tanvir@gmail.com"
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">INSTALLATION ADDRESS</label>
                    <input
                      value={addForm.address}
                      onChange={e => setAddForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="Somitir Hat Bazar, Kalkini, Madaripur"
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">ZONE</label>
                    <select
                      value={addForm.zone}
                      onChange={e => setAddForm(p => ({ ...p, zone: e.target.value, subzone: SUBZONES[e.target.value][0] }))}
                      className={inputCls}
                      style={inputStyle}>
                      {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">SUB-ZONE</label>
                    <select
                      value={addForm.subzone}
                      onChange={e => setAddForm(p => ({ ...p, subzone: e.target.value }))}
                      className={inputCls}
                      style={inputStyle}>
                      {(SUBZONES[addForm.zone] || []).map(sz => <option key={sz} value={sz}>{sz}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Bandwidth Division (8, 10, 12, 16, 20, 30, 50 Mbps) */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders size={13} />
                    <span>2. Bandwidth Speed Division (Bits / Rate)</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Selected: {addForm.speed} Mbps (৳{addForm.price}/mo)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BANDWIDTH_TIERS.map(tier => {
                    const isSelected = selectedTierId === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => handleSelectBandwidthTier(tier)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-card border-border hover:bg-muted/80 text-foreground"
                        }`}>
                        <div className="font-extrabold text-xs">{tier.label}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? "text-white/80" : "text-muted-foreground"}`}>
                          ৳{tier.price.toLocaleString()} · {tier.tag}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Subnet Pool & Sequential IP Auto-Generator */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Network size={13} />
                    <span>3. IP Subnet Pool & Auto-Sequential Allocation</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAutoAssignIp()}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
                    <Zap size={11} /> Auto-Allocate Next IP
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">SELECT SUBNET POOL</label>
                    <select
                      value={selectedPoolId}
                      onChange={e => {
                        setSelectedPoolId(e.target.value);
                        handleAutoAssignIp(e.target.value);
                      }}
                      className={inputCls}
                      style={inputStyle}>
                      {IP_POOLS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-muted-foreground">FRAMED / STATIC IP</label>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">● Sequential (No Collision)</span>
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        value={addForm.ipAddress}
                        onChange={e => setAddForm(p => ({ ...p, ipAddress: e.target.value }))}
                        placeholder="10.215.35.2"
                        className={`${inputCls} font-mono font-bold text-foreground`}
                        style={inputStyle}
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoAssignIp()}
                        className="px-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Re-generate Next Free IP">
                        <RefreshCw size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Auto-Generated PPPoE Credentials & Router */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={13} />
                    <span>4. PPPoE Credentials & MikroTik Sync</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoGeneratePppoe}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer">
                    <RefreshCw size={11} /> Auto-Generate PPPoE
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">PPPOE USERNAME *</label>
                    <input
                      value={addForm.pppUser}
                      onChange={e => setAddForm(p => ({ ...p, pppUser: e.target.value }))}
                      placeholder="user_10012"
                      className={`${inputCls} font-mono font-bold text-foreground`}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">PPPOE PASSWORD</label>
                    <input
                      value={addForm.pppPass}
                      onChange={e => setAddForm(p => ({ ...p, pppPass: e.target.value }))}
                      placeholder="mbn@8492"
                      className={`${inputCls} font-mono font-semibold text-foreground`}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">PORTAL PASSCODE</label>
                    <input
                      value={addForm.passcode}
                      onChange={e => setAddForm(p => ({ ...p, passcode: e.target.value }))}
                      placeholder="mbn@8492"
                      className={`${inputCls} font-mono font-bold text-primary`}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">CORE MIKROTIK ROUTER</label>
                    <select
                      value={addForm.mikrotik}
                      onChange={e => setAddForm(p => ({ ...p, mikrotik: e.target.value }))}
                      className={inputCls}
                      style={inputStyle}>
                      {liveMikrotiks.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">OPTICAL OLT CHASSIS</label>
                    <select
                      value={addForm.olt}
                      onChange={e => setAddForm(p => ({ ...p, olt: e.target.value }))}
                      className={inputCls}
                      style={inputStyle}>
                      {liveOlts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs border bg-card text-foreground hover:bg-muted cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCustomer}
                disabled={!addForm.name || !addForm.phone || !addForm.pppUser}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:opacity-95 shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer">
                <CheckCircle2 size={14} />
                <span>Create & Provision Subscriber</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SMS MODAL ── */}
      {smsModal && selectedCustomer && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border p-6 space-y-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-foreground">Send SMS / WhatsApp Notice</h3>
              <button onClick={() => setSmsModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-muted-foreground">
              To: <strong>{selectedCustomer.name}</strong> ({selectedCustomer.phone})
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Login Credentials", text: `Your MAA BEST NETWORK Login:\nPortal: portal.maabestnetwork.com\nUser ID: ${selectedCustomer.clientCode || selectedCustomer.id}\nPasscode: ${selectedCustomer.passcode}` },
                { label: "Bill Due Reminder", text: `Dear ${selectedCustomer.name}, your monthly bill of ৳${selectedCustomer.price} is due. Please pay via bKash to avoid disconnection.` },
                { label: "Payment Received", text: `Payment of ৳${selectedCustomer.price} received successfully! Your account is active. Thank you for choosing MAA BEST NETWORK.` }
              ].map(tpl => (
                <button
                  key={tpl.label}
                  onClick={() => setSmsText(tpl.text)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-muted hover:bg-muted/80 text-foreground">
                  {tpl.label}
                </button>
              ))}
            </div>

            <textarea
              value={smsText}
              onChange={e => setSmsText(e.target.value)}
              rows={4}
              placeholder="Type message content..."
              className="w-full p-3 rounded-xl border bg-muted/40 outline-none text-xs text-foreground resize-none"
              style={{ borderColor: "var(--border)" }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setSmsModal(false)}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs border bg-card text-foreground">
                Cancel
              </button>
              <button
                onClick={sendSMS}
                disabled={!smsText.trim()}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs text-white bg-primary shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-1.5">
                <Send size={13} /> Send SMS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RECORD PAYMENT MODAL ── */}
      {paymentModal && selectedCustomer && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border p-6 space-y-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-foreground">Record Subscriber Payment</h3>
              <button onClick={() => setPaymentModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border text-xs" style={{ borderColor: "var(--border)" }}>
              <div>Subscriber: <strong className="text-foreground">{selectedCustomer.name}</strong></div>
              <div className="text-muted-foreground">User ID: {selectedCustomer.clientCode || selectedCustomer.id} · Due: ৳{selectedCustomer.dueAmount}</div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">PAYMENT AMOUNT (৳)</label>
              <input
                type="number"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border bg-muted/40 outline-none text-sm font-mono font-bold text-foreground"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">PAYMENT METHOD</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["bKash", "Nagad", "Cash", "Rocket", "Upay", "Card"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setPayMethod(m)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      payMethod === m ? "bg-primary text-white border-primary" : "bg-card text-foreground border-border"
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">TRANSACTION ID (OPTIONAL)</label>
              <input
                value={payTxId}
                onChange={e => setPayTxId(e.target.value)}
                placeholder="e.g. TRX8829104"
                className="w-full px-3 py-2.5 rounded-xl border bg-muted/40 outline-none text-xs font-mono text-foreground"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPaymentModal(false)}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs border bg-card text-foreground">
                Cancel
              </button>
              <button
                onClick={recordPay}
                disabled={!payAmount}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:opacity-95 shadow-md disabled:opacity-50">
                Confirm ৳{Number(payAmount || 0).toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RECHARGE DATE EXTENSION MODAL ── */}
      {rechargeModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border p-6 space-y-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-foreground">Recharge Account</h3>
              <button onClick={() => setRechargeModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border text-xs" style={{ borderColor: "var(--border)" }}>
              <div>Subscriber: <strong className="text-foreground">{selectedCustomer.name}</strong></div>
              <div className="text-muted-foreground">User ID: {selectedCustomer.clientCode || selectedCustomer.id} · Package: {selectedCustomer.package}</div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-2">SELECT NEW EXPIRATION DATE</label>
              <input
                type="date"
                value={rechargeDate}
                onChange={e => setRechargeDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border bg-muted/40 outline-none text-sm font-bold text-foreground cursor-pointer focus:border-primary transition-colors"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-2">ADD CUSTOM DAYS</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="e.g. 5"
                  min="1"
                  className="w-24 px-3 py-2 rounded-xl border bg-muted/40 outline-none text-sm font-bold text-foreground focus:border-primary transition-colors"
                  style={{ borderColor: "var(--border)" }}
                  onChange={(e) => {
                    const days = parseInt(e.target.value);
                    if (!isNaN(days) && days > 0) {
                      const d = new Date();
                      d.setDate(d.getDate() + days);
                      setRechargeDate(d.toISOString().split('T')[0]);
                    }
                  }}
                />
                <span className="text-sm font-bold text-muted-foreground">days from today</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRechargeModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs border bg-card text-foreground transition-colors hover:bg-muted">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (rechargeDate) {
                    // Convert back to DD/MM/YYYY for consistency with existing data format
                    const parts = rechargeDate.split('-');
                    let formattedDate = rechargeDate;
                    if (parts.length === 3) {
                      formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                    }
                    const updatedCust = { ...selectedCustomer, expireDate: formattedDate, endDate: formattedDate, dueAmount: 0, status: "active" as any };
                    updateCustomer(selectedCustomer.id, updatedCust);
                    showToast(`Recharged and extended date to ${formattedDate} for ${selectedCustomer.name}`);
                  }
                  setRechargeModalOpen(false);
                }}
                disabled={!rechargeDate}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:opacity-95 shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 transition-opacity">
                Confirm Recharge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHANGE PACKAGE MODAL ── */}
      {packageModal && targetCustomer && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setPackageModal(false)}>
          <div
            className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh] bg-card"
            style={{ borderColor: "var(--border)" }}
            onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Sliders size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Change Subscriber Package</h3>
                  <p className="text-xs text-muted-foreground">
                    Modifying subscription plan for <strong className="text-foreground">{targetCustomer.name}</strong> ({targetCustomer.id})
                  </p>
                </div>
              </div>
              <button onClick={() => setPackageModal(false)} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Current vs New Banner */}
            <div className="p-4 bg-muted/40 border-b flex items-center justify-between gap-4 text-xs" style={{ borderColor: "var(--border)" }}>
              <div>
                <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">Current Package</span>
                <span className="font-bold text-foreground">{targetCustomer.package}</span>
                <span className="text-muted-foreground block text-[11px] font-mono">৳{targetCustomer.price}/mo · {targetCustomer.speed} Mbps</span>
              </div>
              <div className="text-primary font-bold text-sm">→</div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">New Selected Plan</span>
                <span className="font-bold text-primary">{selectedNewPkg?.name || "None"}</span>
                <span className="text-emerald-600 block text-[11px] font-mono font-bold">৳{packageCustomPrice || selectedNewPkg?.price || 0}/mo · {selectedNewPkg?.down || 0}/{selectedNewPkg?.up || 0} Mbps</span>
              </div>
            </div>

            {/* Package Selection Grid */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Select Target Plan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(livePackages.length > 0 ? livePackages : billingStore.getPackages()).map(pkg => {
                    const isSelected = selectedNewPkg?.id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => {
                          setSelectedNewPkg(pkg);
                          setPackageCustomPrice(String(pkg.price));
                        }}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? "bg-rose-50/80 border-rose-400 dark:bg-rose-950/40 dark:border-rose-700 shadow-sm ring-1 ring-rose-400"
                            : "bg-card border-border hover:border-muted-foreground/40"
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-foreground">{pkg.name}</span>
                          <span className="font-mono font-black text-xs text-primary">৳{pkg.price}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                          <span className="flex items-center gap-1"><Zap size={11} className="text-primary" /> {pkg.down}M Down / {pkg.up}M Up</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{pkg.desc}</p>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Rate Override */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Monthly Bill Amount (৳)
                  </label>
                  <input
                    type="number"
                    value={packageCustomPrice}
                    onChange={e => setPackageCustomPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border bg-muted/30 outline-none text-sm font-mono font-bold text-foreground"
                    style={{ borderColor: "var(--border)" }}
                  />
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Standard catalog rate: ৳{selectedNewPkg?.price || 0}</span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Target Bandwidth Limit
                  </label>
                  <div className="px-3 py-2.5 rounded-xl border bg-muted/20 font-mono text-xs font-bold text-foreground flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                    <span>{selectedNewPkg?.down || 0} Mbps / {selectedNewPkg?.up || 0} Mbps</span>
                    <Zap size={14} className="text-amber-500" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Profile: profile-{selectedNewPkg?.down || 0}M-{selectedNewPkg?.up || 0}M</span>
                </div>
              </div>

              {/* Execution Options */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-2.5 text-xs" style={{ borderColor: "var(--border)" }}>
                <div className="text-[11px] font-bold text-foreground uppercase tracking-wider">Execution & Telemetry Settings</div>
                
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyImmediately}
                    onChange={e => setApplyImmediately(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span className="text-foreground font-medium">Apply immediately & reset active connection on MikroTik-01</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={syncMikrotik}
                    onChange={e => setSyncMikrotik(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span className="text-foreground font-medium">Sync PPPoE Queue & Simple Queue limits via API</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifySms}
                    onChange={e => setNotifySms(e.target.checked)}
                    className="rounded text-primary focus:ring-0"
                  />
                  <span className="text-foreground font-medium">Send SMS confirmation to subscriber ({targetCustomer.phone})</span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t flex gap-3 bg-muted/20" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={() => setPackageModal(false)}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs border bg-card text-foreground hover:bg-muted">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyPackageChange}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:opacity-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                <Check size={14} />
                <span>Confirm & Apply Plan</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── PLAN UPGRADE REQUESTS & APPROVALS MODAL ── */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh]"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between bg-muted/20" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Subscriber Plan Upgrade Requests</h3>
                  <p className="text-xs text-muted-foreground">Review, authorize, and sync MikroTik speed queues for self-service subscriber requests.</p>
                </div>
              </div>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-3 border-b flex items-center gap-2 bg-muted/10 flex-wrap" style={{ borderColor: "var(--border)" }}>
              {(["pending", "approved", "rejected", "all"] as const).map(tab => {
                const count = tab === "all" ? upgradeRequests.length : upgradeRequests.filter(r => r.status === tab).length;
                const isSelected = upgradeFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setUpgradeFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-primary text-white shadow-xs"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground"
                    }`}>
                    <span className="capitalize">{tab}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Requests List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {upgradeRequests.filter(r => upgradeFilter === "all" || r.status === upgradeFilter).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="font-bold text-foreground">No {upgradeFilter} upgrade requests</div>
                  <div>All subscriber plan upgrade requests are up to date.</div>
                </div>
              ) : (
                upgradeRequests
                  .filter(r => upgradeFilter === "all" || r.status === upgradeFilter)
                  .map(req => {
                    const isPending = req.status === "pending";
                    return (
                      <div
                        key={req.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          isPending
                            ? "bg-amber-500/5 border-amber-500/30"
                            : req.status === "approved"
                            ? "bg-emerald-500/5 border-emerald-500/30"
                            : "bg-muted/30 border-border"
                        }`}>
                        
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                              {req.customerName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-extrabold text-foreground flex items-center gap-2">
                                <span>{req.customerName}</span>
                                <span className="font-mono text-xs text-primary">({req.customerId})</span>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>Phone: {req.phone}</span>
                                <span>•</span>
                                <span>Requested: {req.requestDate}</span>
                              </div>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1.5 ${
                              req.status === "approved"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : req.status === "rejected"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}>
                            {req.status === "approved" ? <CheckCircle2 size={11} /> : req.status === "rejected" ? <XCircle size={11} /> : <Clock size={11} />}
                            {req.status === "approved" ? "Approved" : req.status === "rejected" ? "Declined" : "Pending Review"}
                          </span>
                        </div>

                        {/* Plan Comparison Bar */}
                        <div className="p-3 rounded-xl bg-card border flex items-center justify-between flex-wrap gap-3 text-xs" style={{ borderColor: "var(--border)" }}>
                          <div>
                            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Current Plan</span>
                            <span className="font-bold text-foreground">{req.currentPackage}</span>
                            <span className="font-mono text-muted-foreground ml-1.5">(৳{(req.currentPrice ?? 0).toLocaleString()}/mo)</span>
                          </div>

                          <div className="text-primary font-black">
                            <ArrowRight size={16} />
                          </div>

                          <div>
                            <span className="text-primary text-[10px] uppercase font-bold block">Requested Upgrade</span>
                            <span className="font-extrabold text-foreground">{req.requestedPackage}</span>
                            <span className="font-mono font-bold text-primary ml-1.5">(৳{(req.requestedPrice ?? 0).toLocaleString()}/mo)</span>
                          </div>

                          <div className="text-right">
                            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold block">Monthly Diff</span>
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                              +৳{(req.priceDifference ?? 0).toLocaleString()}/mo
                            </span>
                          </div>
                        </div>

                        {/* Note & Admin Actions */}
                        {(req.userNote || req.notes) && (
                          <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-lg border border-border/40">
                            "{req.userNote || req.notes}"
                          </p>
                        )}

                        {/* Admin Action Buttons if Pending */}
                        {isPending && (
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={() => {
                                rejectUpgradeRequest(req.id, "Declined by Admin");
                                showToast(`Declined upgrade request #${req.id} for ${req.customerName}`);
                              }}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold border bg-card text-foreground hover:bg-muted cursor-pointer"
                              style={{ borderColor: "var(--border)" }}>
                              Decline
                            </button>
                            <button
                              onClick={() => {
                                approveUpgradeRequest(req.id);
                                showToast(`Approved & Upgraded ${req.customerName} to ${req.requestedPackage} (৳${req.requestedPrice}/mo)! MikroTik queue synchronized.`);
                              }}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 cursor-pointer">
                              <Check size={14} />
                              <span>Approve & Sync MikroTik</span>
                            </button>
                          </div>
                        )}

                        {!isPending && req.adminResponseDate && (
                          <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                            <span>Processed by Admin on {req.adminResponseDate}</span>
                            {req.rejectionReason && <span className="text-rose-600 font-semibold">{req.rejectionReason}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t flex justify-between items-center bg-muted/10 text-xs" style={{ borderColor: "var(--border)" }}>
              <span className="text-muted-foreground font-medium">
                Auto-syncs customer speed profiles and generates billing adjustments upon approval.
              </span>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                className="px-4 py-2 rounded-xl font-bold border bg-card text-foreground hover:bg-muted cursor-pointer"
                style={{ borderColor: "var(--border)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT SUBSCRIBER ID & PROFILE MODAL ── */}
      {editModalCustomer && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setEditModalCustomer(null)}>
          <div
            className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh] bg-card"
            style={{ borderColor: "var(--border)" }}
            onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Edit Subscriber ID & Profile</h3>
                  <p className="text-xs text-muted-foreground">
                    Modifying credentials for <strong className="text-foreground">{editModalCustomer.name}</strong> ({editModalCustomer.id})
                  </p>
                </div>
              </div>
              <button onClick={() => setEditModalCustomer(null)} className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveEditSubscriber} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Primary Subscriber ID */}
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={13} className="text-primary" />
                    <span>Subscriber ID / Client Code <span className="text-rose-500">*</span></span>
                  </label>
                  <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                    Primary Unique Key
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={editSubForm.id}
                  onChange={e => setEditSubForm(p => ({ ...p, id: e.target.value.toUpperCase().replace(/\s/g, "") }))}
                  placeholder="e.g. MBN0001 or CUST-1002"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-card border border-border text-foreground font-mono font-bold outline-none focus:border-primary transition-all tracking-wider uppercase"
                />
                <p className="text-[10px] text-muted-foreground">
                  Admin Note: Changing the Subscriber ID will safely migrate all Firestore cloud references and update their portal login identity.
                </p>
              </div>

              {/* User Account Type Selector */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-primary" />
                    <span>User Account Type & Policy</span>
                  </label>
                  <span className="text-[10px] font-bold text-muted-foreground">Admin Selection</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Normal User */}
                  <div
                    onClick={() => setEditSubForm(p => ({ ...p, userType: "normal" }))}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      editSubForm.userType === "normal"
                        ? "border-primary bg-primary/10 shadow-xs"
                        : "border-border bg-card hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                      <Users size={13} className={editSubForm.userType === "normal" ? "text-primary" : "text-muted-foreground"} />
                      <span>Normal User</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                      Monthly cycle, normal overdue/due & disconnect rules
                    </p>
                  </div>

                  {/* Free User */}
                  <div
                    onClick={() => setEditSubForm(p => ({ ...p, userType: "free", price: 0 }))}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      editSubForm.userType === "free"
                        ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
                        : "border-border bg-card hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={13} />
                      <span>Free User</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                      ৳0 bill · Never cutoff · Never counted as due/disconnect
                    </p>
                  </div>

                  {/* VIP Unlimited */}
                  <div
                    onClick={() => setEditSubForm(p => ({ ...p, userType: "unlimited" }))}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      editSubForm.userType === "unlimited"
                        ? "border-amber-500 bg-amber-500/10 shadow-xs"
                        : "border-border bg-card hover:bg-muted/60"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-600 dark:text-amber-400">
                      <Sparkles size={13} />
                      <span>VIP Unlimited</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                      Permanent VIP line · Never cutoff · High priority
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                    Subscriber Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editSubForm.name}
                    onChange={e => setEditSubForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">
                    Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editSubForm.phone}
                    onChange={e => setEditSubForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary font-mono font-medium"
                  />
                </div>
              </div>

              {/* Email & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editSubForm.email}
                    onChange={e => setEditSubForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Account Status</label>
                  <select
                    value={editSubForm.status}
                    onChange={e => setEditSubForm(p => ({ ...p, status: e.target.value as CustomerStatus }))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary">
                    <option value="active">Active</option>
                    <option value="due">Due</option>
                    <option value="suspended">Suspended</option>
                    <option value="disconnected">Disconnected</option>
                  </select>
                </div>
              </div>

              {/* PPPoE Credentials */}
              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border space-y-2 text-xs">
                <div className="text-[11px] font-bold text-foreground uppercase tracking-wider">Network & PPPoE Credentials</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">PPPoE Username</label>
                    <input
                      type="text"
                      value={editSubForm.pppUser}
                      onChange={e => setEditSubForm(p => ({ ...p, pppUser: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-card border border-border text-foreground font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">PPPoE Password</label>
                    <input
                      type="text"
                      value={editSubForm.pppPass}
                      onChange={e => setEditSubForm(p => ({ ...p, pppPass: e.target.value }))}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-card border border-border text-foreground font-mono font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Portal Login Passcode</label>
                  <input
                    type="text"
                    value={editSubForm.passcode}
                    onChange={e => setEditSubForm(p => ({ ...p, passcode: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-card border border-border font-mono font-bold text-primary outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Zone & Subzone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Zone</label>
                  <input
                    type="text"
                    value={editSubForm.zone}
                    onChange={e => setEditSubForm(p => ({ ...p, zone: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Sub Zone</label>
                  <input
                    type="text"
                    value={editSubForm.subzone}
                    onChange={e => setEditSubForm(p => ({ ...p, subzone: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="text-xs">
                <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Installation Address</label>
                <input
                  type="text"
                  value={editSubForm.address}
                  onChange={e => setEditSubForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Package & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Package Plan</label>
                  <input
                    type="text"
                    value={editSubForm.package}
                    onChange={e => setEditSubForm(p => ({ ...p, package: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Monthly Fee (৳)</label>
                  <input
                    type="number"
                    value={editSubForm.price}
                    onChange={e => setEditSubForm(p => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground font-mono font-bold"
                  />
                </div>
              </div>

              {/* Real MAC Address & PPPoE Binding Security */}
              <div className="p-3.5 rounded-xl border bg-muted/40 space-y-2.5" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-foreground uppercase flex items-center gap-1.5">
                    <Shield size={13} className="text-primary" /> Real MAC Address (Calling-Station-Id)
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${editSubForm.macBound ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"}`}>
                    {editSubForm.macBound ? <Lock size={10} /> : <Unlock size={10} />}
                    {editSubForm.macBound ? "MAC Bound / Locked" : "Unbound"}
                  </span>
                </div>
                <input
                  type="text"
                  value={editSubForm.mac}
                  onChange={e => setEditSubForm(p => ({ ...p, mac: e.target.value }))}
                  placeholder="e.g. 4c:46:d1:0d:1d:49"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-card border border-border text-foreground font-mono font-bold outline-none focus:border-primary"
                />
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={editSubForm.macBound}
                    onChange={e => setEditSubForm(p => ({ ...p, macBound: e.target.checked }))}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-foreground">
                    Enforce Router MAC Lock (Bind Calling-Station-Id to this user)
                  </span>
                </label>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  When enabled, PPPoE server strictly verifies that authentication originates from this physical router MAC address.
                </p>
              </div>

              {/* Modal Buttons */}
              <div className="p-4 border-t flex items-center justify-between gap-3 pt-3" style={{ borderColor: "var(--border)" }}>
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => {
                    if (editModalCustomer) {
                      setDeleteConfirmCust(editModalCustomer);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
                    isReadOnly ? "opacity-30 cursor-not-allowed text-muted-foreground border-border" : "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 border-rose-200 dark:border-rose-900 cursor-pointer"
                  }`}>
                  <Trash2 size={13} /> Delete
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModalCustomer(null)}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs border bg-card text-foreground hover:bg-muted cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReadOnly}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-1.5 transition-all ${
                      isReadOnly ? "bg-muted-foreground opacity-50 cursor-not-allowed" : "bg-primary hover:opacity-95 cursor-pointer"
                    }`}>
                    <Save size={14} />
                    <span>{isReadOnly ? "View Only (Edit Disabled)" : "Save Subscriber Changes"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Delete Subscriber ──────────────────────────── */}
      {deleteConfirmCust && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-rose-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Terminate & Delete Subscriber?</h3>
                <p className="text-xs text-muted-foreground">De-provision from MikroTik & move to Archive</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscriber Name:</span>
                <strong className="text-foreground">{deleteConfirmCust.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client ID:</span>
                <strong className="font-mono text-primary">{deleteConfirmCust.clientCode || deleteConfirmCust.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PPPoE Username:</span>
                <strong className="font-mono text-foreground">{deleteConfirmCust.pppUser || "—"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package / Rate:</span>
                <span className="text-foreground">{deleteConfirmCust.package} (৳{deleteConfirmCust.price || deleteConfirmCust.monthlyBill || 500})</span>
              </div>
            </div>

            {/* Deletion Reason Selector / Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground block">Reason for Deletion / Disconnection:</label>
              <select
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-muted/50 text-xs font-medium text-foreground outline-none focus:border-primary">
                <option value="Customer relocation / service discontinued">Customer relocation / service discontinued</option>
                <option value="Non-payment default / overdue cutoff">Non-payment default / overdue cutoff</option>
                <option value="Customer request for line termination">Customer request for line termination</option>
                <option value="Switched to different ISP provider">Switched to different ISP provider</option>
                <option value="Temporary hold / Seasonal disconnection">Temporary hold / Seasonal disconnection</option>
                <option value="Duplicate or test account cleanup">Duplicate or test account cleanup</option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert size={14} className="shrink-0" />
                <span>MikroTik & OLT Action:</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                The PPPoE secret will be deleted from MikroTik DC-CA RouterOS, optical splitter port released, and customer profile preserved safely inside the <strong>Deleted Accounts Archive</strong> for full restoration anytime.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmCust(null)}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs border border-border bg-card text-foreground hover:bg-muted cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCustomer(deleteConfirmCust)}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                <Trash2 size={14} />
                <span>Confirm & Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Restore Subscriber ──────────────────────────── */}
      {restoreConfirmCust && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-emerald-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-emerald-500">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <RotateCcw size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Restore Subscriber Account?</h3>
                <p className="text-xs text-muted-foreground">Re-provision on MikroTik & restore active status</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscriber Name:</span>
                <strong className="text-foreground">{restoreConfirmCust.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client ID:</span>
                <strong className="font-mono text-primary">{restoreConfirmCust.clientCode || restoreConfirmCust.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PPPoE User:</span>
                <strong className="font-mono text-foreground">{restoreConfirmCust.pppUser || "—"}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package / Rate:</span>
                <span className="text-foreground">{restoreConfirmCust.package} (৳{restoreConfirmCust.price || restoreConfirmCust.monthlyBill || 500})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Zone:</span>
                <span className="text-foreground">{restoreConfirmCust.zone} · {restoreConfirmCust.subzone}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Automatic Re-provisioning:</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                The account will be moved back to the Active Subscribers pool, secret enabled on MikroTik DC-CA RouterOS, and billing schedule restored.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setRestoreConfirmCust(null)}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs border border-border bg-card text-foreground hover:bg-muted cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRestoreCustomer(restoreConfirmCust)}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                <RotateCcw size={14} />
                <span>Confirm & Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Confirm Permanent Purge ─────────────────────────────── */}
      {purgeConfirmCust && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-rose-600/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-600/20 flex items-center justify-center">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-foreground">Permanently Purge Record?</h3>
                <p className="text-xs text-muted-foreground">Irreversible database record removal</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscriber:</span>
                <strong className="text-foreground">{purgeConfirmCust.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client ID:</span>
                <strong className="font-mono text-primary">{purgeConfirmCust.clientCode || purgeConfirmCust.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PPPoE User:</span>
                <span className="font-mono text-foreground">{purgeConfirmCust.pppUser || "—"}</span>
              </div>
            </div>

            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium leading-relaxed flex items-start gap-1.5">
              <AlertTriangle size={15} className="text-rose-500 shrink-0 mt-0.5" />
              <span>Warning: This will permanently delete this subscriber record from the archive database. This action CANNOT be undone.</span>
            </p>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPurgeConfirmCust(null)}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs border border-border bg-card text-foreground hover:bg-muted cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handlePurgeCustomer(purgeConfirmCust)}
                className="w-1/2 py-2.5 rounded-xl font-bold text-xs bg-rose-700 hover:bg-rose-800 text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                <Trash2 size={14} />
                <span>Permanently Purge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}
