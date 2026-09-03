import { useState, useCallback, useEffect } from "react";
import {
  Search, Filter, Plus, ChevronLeft, ChevronRight,
  Wifi, WifiOff, AlertTriangle, Ban, Circle, Phone, MapPin,
  Package, Eye, MessageSquare, CreditCard, Download,
  X, Check, Clock, CheckCircle2, Send, RefreshCw, Zap, FileText,
  Copy, Lock, ExternalLink, Key, Smartphone, Sliders, Sparkles,
  Network, Server, Shield, Radio, CheckCheck, Save, ShieldAlert, ArrowRight
} from "lucide-react";
import { useCustomerContext, Customer, CustomerStatus } from "../context/CustomerContext";
import { useLanguage } from "../context/LanguageContext";

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
  "10 Mbps — ৳800",
  "15 Mbps — ৳1,000",
  "20 Mbps Fiber Standard — ৳1,200",
  "30 Mbps Home Fiber — ৳1,500",
  "50 Mbps Ultra Fiber Pro — ৳2,500",
  "100 Mbps Gigabit Fiber — ৳5,000"
];

export const BANDWIDTH_TIERS = [
  { id: "8m", label: "8 Mbps", down: 8, up: 4, price: 600, tag: "8 Bit Economy" },
  { id: "10m", label: "10 Mbps", down: 10, up: 5, price: 800, tag: "10 Bit Standard" },
  { id: "12m", label: "12 Mbps", down: 12, up: 6, price: 1000, tag: "12 Bit Turbo" },
  { id: "16m", label: "16 Mbps", down: 16, up: 8, price: 1200, tag: "16 Bit Ultra" },
  { id: "20m", label: "20 Mbps", down: 20, up: 10, price: 1400, tag: "20 Bit Fiber Pro" },
  { id: "30m", label: "30 Mbps", down: 30, up: 15, price: 1800, tag: "30 Bit Heavy" },
  { id: "50m", label: "50 Mbps", down: 50, up: 25, price: 2500, tag: "50 Bit Studio" },
];

export const IP_POOLS = [
  { id: "madaripur-cgnat", name: "192.10.10.0/24 (Madaripur Core CGNAT)", prefix: "192.10.10.", startHost: 100 },
  { id: "kalkini-cgnat", name: "100.64.10.0/22 (Kalkini PPPoE Pool)", prefix: "100.64.10.", startHost: 50 },
  { id: "shibchar-pub", name: "103.145.60.0/24 (Public / Live IP)", prefix: "103.145.60.", startHost: 10 },
];

export const AVAILABLE_PACKAGES = [
  { id: "PKG-01", name: "8 Mbps Economy", down: 8, up: 4, price: 600, desc: "Economy 8 Mbps browsing & light streaming" },
  { id: "PKG-02", name: "10 Mbps Home", down: 10, up: 5, price: 800, desc: "Standard family browsing, HD video & social" },
  { id: "PKG-03", name: "12 Mbps Standard", down: 12, up: 6, price: 1000, desc: "12 Mbps HD streaming & smooth work-from-home" },
  { id: "PKG-04", name: "16 Mbps Turbo", down: 16, up: 8, price: 1200, desc: "16 Mbps turbo fiber for multi-device gaming" },
  { id: "PKG-05", name: "20 Mbps Fiber Standard", down: 20, up: 10, price: 1400, desc: "4K streaming, low latency & gaming" },
  { id: "PKG-06", name: "30 Mbps Home Fiber", down: 30, up: 15, price: 1800, desc: "Multi-device heavy home broadband" },
  { id: "PKG-07", name: "50 Mbps Ultra Fiber Pro", down: 50, up: 25, price: 2500, desc: "High-speed SME, office & studio line" },
  { id: "PKG-08", name: "100 Mbps Gigabit Fiber", down: 100, up: 50, price: 5000, desc: "Dedicated high priority fiber bandwidth" },
];

const MIKROTIKS = ["MikroTik-01", "MikroTik-02", "MikroTik-03", "MikroTik-04"];
const OLTS = ["OLT-Dhaka-01", "OLT-Uttara-01", "OLT-Ctg-01", "OLT-Syl-01"];
const ITEMS_PER_PAGE = 8;

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
  const headers = ["ID", "Passcode", "Name", "Phone", "Email", "Zone", "Sub-Zone", "Package", "Price", "Status", "PPPoE User", "IP Address", "MikroTik", "OLT", "Join Date", "Due Amount"];
  const rows = customers.map(c => [c.id, c.passcode, c.name, c.phone, c.email, c.zone, c.subzone, c.package, c.price, c.status, c.pppUser, c.ipAddress, c.mikrotik, c.olt, c.joinDate, c.dueAmount]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `customers_export_${new Date().toISOString().split("T")[0]}.csv`; a.click();
  URL.revokeObjectURL(url);
}

const DRAWER_TABS = ["Overview", "Network & Product", "Service Info", "Credentials", "Billing", "Payments", "Activity"] as const;
type DrawerTab = typeof DRAWER_TABS[number];

interface CustomersPageProps {
  onNavigate?: (page: string) => void;
}

export function CustomersPage({ onNavigate }: CustomersPageProps) {
  const {
    customers,
    setActiveCustomer,
    addCustomer,
    toggleNetStatus,
    processPayment,
    updateCustomer,
    generateDefaultPasscode,
    changePackage,
    upgradeRequests,
    approveUpgradeRequest,
    rejectUpgradeRequest
  } = useCustomerContext();
  const { t, bnNum, isBangla } = useLanguage();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all">("all");
  const [page, setPage] = useState(1);
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

  // ── Technical & Service Drawer Edit Form State ──
  const [netForm, setNetForm] = useState<Partial<Customer>>({});
  const [serviceForm, setServiceForm] = useState<Partial<Customer>>({});
  const [isSavingDrawer, setIsSavingDrawer] = useState(false);

  useEffect(() => {
    if (selectedCustomer) {
      setNetForm({
        package: selectedCustomer.package || "20 Mbps Fiber Standard",
        serverName: selectedCustomer.serverName || "Active",
        protocolType: selectedCustomer.protocolType || selectedCustomer.service || "pppoe",
        profile: selectedCustomer.profile || "PIONEER_HOME_20Mbps",
        zone: selectedCustomer.zone || "DHAKA DIVISION",
        subzone: selectedCustomer.subzone || "KALKINI SOMITIR HAT",
        box: selectedCustomer.box || "SOMITIR HAT BAZAR",
        connectionType: selectedCustomer.connectionType || "Optical Fiber",
        splitterBox: selectedCustomer.splitterBox || "SOMITIR HAT BAZAR - Splitter 1 (1:8)",
        splitterPort: selectedCustomer.splitterPort || "Port 1",
        cableMetre: selectedCustomer.cableMetre || 100,
        fiberCode: selectedCustomer.fiberCode || "f3kugd",
        coreNumber: selectedCustomer.coreNumber || "2",
        coreColor: selectedCustomer.coreColor || "Red",
        deviceType: selectedCustomer.deviceType || "ONU Dual Band XPON (Gigabit)",
        deviceSerial: selectedCustomer.deviceSerial || "VSOL-99882201",
        deviceVendor: selectedCustomer.deviceVendor || "VSOL",
        purchaseDate: selectedCustomer.purchaseDate || "28/08/2026",
      });

      setServiceForm({
        disabledInMikrotik: selectedCustomer.disabledInMikrotik || selectedCustomer.status === "suspended",
        disabledInSystem: selectedCustomer.disabledInSystem || false,
        pppUser: selectedCustomer.pppUser || "",
        pppPass: selectedCustomer.pppPass || "",
        billingStartMonth: selectedCustomer.billingStartMonth || "08/2026",
        monthlyBill: selectedCustomer.monthlyBill || selectedCustomer.price || 1200,
        clientType: selectedCustomer.clientType || "Home",
        billingStatus: selectedCustomer.billingStatus || "Monthly",
        expireDate: selectedCustomer.expireDate || "10/09/2026",
        joinDate: selectedCustomer.joinDate || "28/08/2026",
      });
    }
  }, [selectedCustomer]);

  const handleSaveNetworkInfo = () => {
    if (!selectedCustomer) return;
    setIsSavingDrawer(true);
    updateCustomer(selectedCustomer.id, netForm);
    setSelectedCustomer(prev => prev ? { ...prev, ...netForm } : null);
    setTimeout(() => {
      setIsSavingDrawer(false);
      setToast(`✓ Network & Product Info updated and saved for ${selectedCustomer.name}!`);
      setTimeout(() => setToast(""), 3500);
    }, 400);
  };

  const handleSaveServiceInfo = () => {
    if (!selectedCustomer) return;
    setIsSavingDrawer(true);
    const updates: Partial<Customer> = {
      ...serviceForm,
      price: Number(serviceForm.monthlyBill) || selectedCustomer.price,
      status: serviceForm.disabledInMikrotik ? "suspended" : "active",
      netStatus: serviceForm.disabledInMikrotik ? "offline" : "online",
    };
    updateCustomer(selectedCustomer.id, updates);
    setSelectedCustomer(prev => prev ? { ...prev, ...updates } : null);
    setTimeout(() => {
      setIsSavingDrawer(false);
      setToast(`✓ Service Information updated and saved for ${selectedCustomer.name}!`);
      setTimeout(() => setToast(""), 3500);
    }, 400);
  };

  // ── Plan Upgrade Approvals Modal State ──
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFilter, setUpgradeFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // ── Package Change Modal State ──
  const [packageModal, setPackageModal] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<Customer | null>(null);
  const [selectedNewPkg, setSelectedNewPkg] = useState(AVAILABLE_PACKAGES[3]);
  const [applyImmediately, setApplyImmediately] = useState(true);
  const [syncMikrotik, setSyncMikrotik] = useState(true);
  const [notifySms, setNotifySms] = useState(true);
  const [packageCustomPrice, setPackageCustomPrice] = useState("");
  const [selectedPoolId, setSelectedPoolId] = useState(IP_POOLS[0].id);
  const [selectedTierId, setSelectedTierId] = useState(BANDWIDTH_TIERS[0].id);

  const [addForm, setAddForm] = useState({
    name: "", phone: "", email: "", address: "", zone: "Madaripur Sadar", subzone: "Puran Bazar",
    pppUser: "mbn_10012", pppPass: "mbn@8492", passcode: "mbn@8492", mac: "",
    ipAddress: "192.10.10.100",
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
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const pppUser = cleanName ? `${cleanName}_${randNum.toString().slice(-2)}` : `mbn_${randNum}`;
    const pppPass = `mbn@${randNum}`;
    const passcode = `mbn@${randNum}`;
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
    showToast(`✓ Auto-allocated next available IP: ${nextIp} (Zero collision in ${pool.name})`);
  };

  const handleAutoGeneratePppoe = () => {
    const creds = generatePppoeCredentials(addForm.name, addForm.phone);
    setAddForm(p => ({ ...p, ...creds }));
    showToast(`✓ Auto-generated PPPoE User: ${creds.pppUser} & Passcode: ${creds.passcode}`);
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  const openChangePackageModal = (c: Customer) => {
    setTargetCustomer(c);
    const matched = AVAILABLE_PACKAGES.find(p => p.name === c.package || c.package.includes(p.name)) || AVAILABLE_PACKAGES[3];
    setSelectedNewPkg(matched);
    setPackageCustomPrice(String(c.price || matched.price));
    setPackageModal(true);
  };

  const handleApplyPackageChange = () => {
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

    showToast(`✓ Package updated to ${selectedNewPkg.name} (৳${finalPrice.toLocaleString()}/mo) for ${targetCustomer.name}`);
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
    const bundle = `=== MAA BEST NETWORK Subscriber Login ===\nPortal: portal.maabestnetwork.com\nUser ID: ${c.id}\nDefault Passcode: ${c.passcode}\nPhone: ${c.phone}\nPackage: ${c.package}\nPayment Method: bKash / Nagad Direct`;
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

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      (c.clientCode || "").toLowerCase().includes(q) ||
      (c.phone || "").includes(search) ||
      (c.pppUser || "").toLowerCase().includes(q) ||
      (c.passcode || "").toLowerCase().includes(q) ||
      (c.ipAddress || "").includes(search) ||
      (c.mac || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleAction = async (label: string, action: () => void) => {
    setActionLoading(label);
    await new Promise(r => setTimeout(r, 800));
    action();
    setActionLoading(null);
    showToast(`${label} completed successfully`);
  };

  const toggleNet = (c: Customer, enable: boolean) => {
    toggleNetStatus(c.id, enable);
    setSelectedCustomer(prev => prev && prev.id === c.id ? { ...prev, netStatus: enable ? "online" : "offline", status: enable ? "active" : "suspended" } : prev);
  };

  const sendSMS = () => {
    if (!smsText.trim()) return;
    setSmsModal(false);
    setSmsText("");
    showToast(`SMS sent to ${selectedCustomer?.name} (${selectedCustomer?.phone})`);
  };

  const recordPay = () => {
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
      showToast("Validation Error: Please enter a valid IPv4 address (e.g. 192.10.10.100).");
      return;
    }

    const pkgPrice = addForm.price || parseInt(addForm.package.split("৳")[1]?.replace(",", "") || "600");
    if (isNaN(pkgPrice) || pkgPrice <= 0) {
      showToast("Validation Error: Package price must be a valid positive amount.");
      return;
    }

    const pkgName = addForm.package.split(" — ")[0];

    const nc = addCustomer({
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
      mac: addForm.mac.trim(),
      mikrotik: addForm.mikrotik,
      olt: addForm.olt,
    });

    setShowAdd(false);
    showToast(`✓ Customer ${nc.name} created! IP: ${nc.ipAddress} · PPPoE: ${nc.pppUser} · Speed: ${nc.speed || "8/4"} Mbps`);
  };

  const counts = {
    all: customers.length,
    active: customers.filter(c => c.status === "active").length,
    due: customers.filter(c => c.status === "due").length,
    suspended: customers.filter(c => c.status === "suspended").length,
    disconnected: customers.filter(c => c.status === "disconnected").length,
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl outline-none";
  const inputStyle = { background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--foreground)", marginBottom: 3 }}>
            {t("All Customers & Subscriber Credentials")}
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            {bnNum(customers.length)} {t("subscribers registered · Auto-generated User ID & Passcodes with 1-click sharing")}
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
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border bg-card text-foreground text-xs font-bold hover:bg-muted cursor-pointer"
            style={{ borderColor: "var(--border)" }}>
            <Download size={14} /> {t("Export CSV")}
          </button>
          <button
            onClick={() => onNavigate ? onNavigate("add-client") : setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer hover:opacity-95"
            style={{ background: "var(--primary)" }}>
            <Plus size={14} /> + Client Add New Client
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid gap-3 mb-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {([["all", "Total Subscribers", customers.length, "#8B2020"], ["active", "Active Connected", counts.active, "#16A34A"], ["due", "Payment Due", counts.due, "#D97706"], ["suspended", "Suspended Lines", counts.suspended, "#DC2626"], ["disconnected", "Disconnected", counts.disconnected, "#6B7280"]] as const).map(([key, label, val, color]) => (
          <button
            key={key}
            onClick={() => { setStatusFilter(key as any); setPage(1); }}
            className="rounded-2xl p-4 text-left transition-all border cursor-pointer"
            style={{
              background: statusFilter === key ? "var(--primary)" : "var(--card)",
              borderColor: statusFilter === key ? "var(--primary)" : "var(--border)",
              boxShadow: statusFilter === key ? "0 4px 14px rgba(139,32,32,0.25)" : "none"
            }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: statusFilter === key ? "#fff" : color, lineHeight: 1.1 }}>
              {bnNum(val.toLocaleString())}
            </p>
            <p style={{ fontSize: 12, fontWeight: 500, color: statusFilter === key ? "rgba(255,255,255,0.8)" : "var(--muted-foreground)", marginTop: 4 }}>
              {t(label)}
            </p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border shadow-sm" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-3.5 flex-wrap gap-3 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="relative w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder={t("Search Name, ID, Phone, Passcode, PPPoE…")}
              className="w-full pl-9 pr-4 py-2 rounded-xl outline-none text-xs text-foreground bg-muted/60 border border-transparent focus:border-primary/40"
            />
          </div>
          <span className="text-xs text-muted-foreground font-semibold">{bnNum(filtered.length)} {t("customers found")}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Subscriber & ID", "Portal Passcode", "Contact & PPPoE", "Package & Speed", "Zone", "Network", "Status", "Due / Bill", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    {t(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((c, i) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: i < paginated.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer" }}
                  className="hover:bg-muted/40 transition-colors"
                  onClick={() => { setSelectedCustomer(c); setDrawerTab("Overview"); }}>
                  {/* Subscriber & ID */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                        {c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{c.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[11px] font-bold text-primary">{c.id}</span>
                          <button
                            onClick={e => { e.stopPropagation(); copyToClipboard(c.id, `tbl-id-${c.id}`); }}
                            title="Copy User ID"
                            className="text-muted-foreground hover:text-foreground">
                            {copiedKey === `tbl-id-${c.id}` ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Portal Passcode */}
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/50">
                        {(c.passcode || "").replace(/^isp@/i, "mbn@") || `mbn@${(c.clientCode || c.id).replace(/\D/g, "")}`}
                      </span>
                      <button
                        onClick={() => copyToClipboard((c.passcode || "").replace(/^isp@/i, "mbn@") || `mbn@${(c.clientCode || c.id).replace(/\D/g, "")}`, `tbl-pass-${c.id}`)}
                        title="Copy Portal Passcode"
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                        {copiedKey === `tbl-pass-${c.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>

                  {/* Contact & PPPoE */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                      <Phone size={11} className="text-muted-foreground" />
                      <span>{c.phone}</span>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{c.pppUser}</p>
                  </td>

                  {/* Package */}
                  <td className="px-4 py-3" onClick={e => { e.stopPropagation(); openChangePackageModal(c); }}>
                    <div className="group cursor-pointer">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        <Package size={12} className="text-primary" />
                        <span className="truncate max-w-[130px]">{c.package}</span>
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-primary bg-primary/10 px-1 py-0.5 rounded transition-all">Change</span>
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5">৳{c.price.toLocaleString()}/mo · {c.speed} Mbps</p>
                    </div>
                  </td>

                  {/* Zone */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-xs text-foreground">
                      <MapPin size={11} className="text-muted-foreground" />
                      <span>{c.subzone}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{c.zone}</p>
                  </td>

                  {/* Network Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <Circle size={7} fill={c.netStatus === "online" ? "#16A34A" : "#9CA3AF"} stroke="none" />
                      <span style={{ color: c.netStatus === "online" ? "#16A34A" : "#9CA3AF" }}>
                        {c.netStatus === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate max-w-[100px]">{c.ipAddress}</p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>

                  {/* Due / Bill */}
                  <td className="px-4 py-3">
                    {c.dueAmount > 0 ? (
                      <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400">
                        ৳{c.dueAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600">Paid</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
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
                        title="Send SMS"
                        onClick={() => { setSelectedCustomer(c); setSmsModal(true); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground">
                        <MessageSquare size={13} />
                      </button>

                      <button
                        title="Change / Upgrade Package"
                        onClick={() => openChangePackageModal(c)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 cursor-pointer">
                        <Sliders size={13} />
                      </button>

                      <button
                        title="Record Payment"
                        onClick={() => { setSelectedCustomer(c); setPaymentModal(true); setPayAmount(String(c.dueAmount || c.price)); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground">
                        <CreditCard size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-xs">
                    No customers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs text-muted-foreground">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border bg-card disabled:opacity-40"
                style={{ borderColor: "var(--border)" }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold border transition-all ${
                    page === p ? "bg-primary text-white border-primary" : "bg-card text-foreground border-border"
                  }`}>
                  {p}
                </button>
              ))}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border bg-card disabled:opacity-40"
                style={{ borderColor: "var(--border)" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
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
                    <span className="font-mono text-xs font-bold text-primary">{selectedCustomer.id}</span>
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
            <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
              {DRAWER_TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setDrawerTab(t)}
                  className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${
                    drawerTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {drawerTab === "Overview" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "User ID", value: selectedCustomer.id, mono: true, copyKey: "id" },
                      { label: "Default Passcode", value: selectedCustomer.passcode, mono: true, copyKey: "pass" },
                      { label: "Phone", value: selectedCustomer.phone },
                      { label: "Email", value: selectedCustomer.email },
                      { label: "Zone", value: `${selectedCustomer.subzone}, ${selectedCustomer.zone}` },
                      { label: "Address", value: selectedCustomer.address },
                      { label: "Package", value: selectedCustomer.package },
                      { label: "Monthly Fee", value: `৳${selectedCustomer.price.toLocaleString()}/mo` },
                      { label: "PPPoE Username", value: selectedCustomer.pppUser, mono: true },
                      { label: "IP Address", value: selectedCustomer.ipAddress, mono: true },
                      { label: "Assigned OLT", value: selectedCustomer.olt },
                      { label: "Optical Rx", value: selectedCustomer.onuSignal },
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
                        onClick={() => openChangePackageModal(selectedCustomer)}
                        className="p-3 rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer col-span-2 border border-blue-200 dark:border-blue-800">
                        <Sliders size={14} /> Change / Upgrade Package Plan
                      </button>
                      <button
                        onClick={() => toggleNet(selectedCustomer, true)}
                        className="p-3 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95">
                        <Wifi size={14} /> Enable Line
                      </button>
                      <button
                        onClick={() => toggleNet(selectedCustomer, false)}
                        className="p-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95">
                        <WifiOff size={14} /> Disable Line
                      </button>
                      <button
                        onClick={() => setSmsModal(true)}
                        className="p-3 rounded-xl bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95">
                        <Send size={14} /> Send SMS Notice
                      </button>
                      <button
                        onClick={() => { setPaymentModal(true); setPayAmount(String(selectedCustomer.dueAmount || selectedCustomer.price)); }}
                        className="p-3 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center gap-2 hover:opacity-95">
                        <CreditCard size={14} /> Record Payment
                      </button>
                    </div>
                  </div>
                </>
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
                          <option value="PIONEER_HOME_20Mbps">PIONEER_HOME_20Mbps (৳1,200)</option>
                          {PACKAGES.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      {/* Server */}
                      <div>
                        <label className="block text-[11px] font-bold text-foreground uppercase mb-1">Server</label>
                        <input
                          type="text"
                          value={netForm.serverName || ""}
                          onChange={e => setNetForm(prev => ({ ...prev, serverName: e.target.value }))}
                          className="w-full px-3 py-2 text-xs rounded-lg bg-muted border border-border text-foreground outline-none font-mono"
                        />
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
                      disabled={isSavingDrawer}
                      className="w-full mt-4 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Save size={14} />
                      <span>{isSavingDrawer ? "Saving Changes..." : "Save Network & Product Info"}</span>
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
                      <label className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg cursor-pointer">
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1">
                          <ShieldAlert size={13} />
                          WANT TO CREATE AS DISABLE CLIENT?
                        </span>
                        <input
                          type="checkbox"
                          checked={!!serviceForm.disabledInMikrotik}
                          onChange={e => setServiceForm(prev => ({ ...prev, disabledInMikrotik: e.target.checked }))}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-rose-400"
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
                          value={serviceForm.billingStartMonth || "08/2026"}
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
                      disabled={isSavingDrawer}
                      className="w-full mt-4 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:opacity-95 shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Save size={14} />
                      <span>{isSavingDrawer ? "Saving Changes..." : "Save Service Information"}</span>
                    </button>
                  </div>
                </div>
              )}

              {drawerTab === "Credentials" && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border bg-muted/30 space-y-3" style={{ borderColor: "var(--border)" }}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Lock size={16} className="text-primary" /> Subscriber Login Passcode
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        Default Auto-Generated
                      </span>
                    </div>

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
              )}

              {drawerTab === "Billing" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-muted/40 border flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="text-xs font-bold text-foreground">{selectedCustomer.package}</div>
                      <div className="text-[11px] text-muted-foreground">Billing Cycle: {selectedCustomer.billingDate}th of every month · ৳{selectedCustomer.price}/mo</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-sm font-black ${selectedCustomer.dueAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {selectedCustomer.dueAmount > 0 ? `৳${selectedCustomer.dueAmount.toLocaleString()} DUE` : "PAID"}
                      </span>
                      <button
                        onClick={() => openChangePackageModal(selectedCustomer)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 flex items-center gap-1 shadow-sm cursor-pointer">
                        <Sliders size={12} /> Change Plan
                      </button>
                    </div>
                  </div>

                  {selectedCustomer.invoices.map(inv => (
                    <div key={inv.id} className="p-4 rounded-2xl border flex items-center justify-between" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                      <div>
                        <div className="text-xs font-bold text-foreground">{inv.month} ({inv.id})</div>
                        <div className="text-[11px] text-muted-foreground">{inv.paidDate ? `Paid on ${inv.paidDate}` : `Due: ${inv.dueDate}`}</div>
                      </div>
                      <span className="font-mono text-xs font-bold">৳{inv.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === "Payments" && (
                <div className="space-y-3">
                  <button
                    onClick={() => { setPaymentModal(true); setPayAmount(String(selectedCustomer.dueAmount || selectedCustomer.price)); }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-primary shadow-md flex items-center justify-center gap-2">
                    <Plus size={14} /> Record Manual Payment
                  </button>

                  {selectedCustomer.paymentHistory.map(p => (
                    <div key={p.id} className="p-4 rounded-2xl border flex items-center justify-between" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                      <div>
                        <div className="text-xs font-bold font-mono text-primary">{p.trxId} ({p.method})</div>
                        <div className="text-[11px] text-muted-foreground">{p.date} · {p.collectedBy}</div>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-600">+৳{p.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {drawerTab === "Activity" && (
                <div className="space-y-2">
                  {[
                    { icon: Zap, label: "Line Active", time: "Today, 10:00 AM", desc: "PPPoE session dialed on MikroTik-01" },
                    { icon: CreditCard, label: "Payment Logged", time: "Yesterday", desc: `৳${selectedCustomer.price} processed via bKash` },
                    { icon: Lock, label: "Passcode Generated", time: selectedCustomer.joinDate, desc: `Default: ${selectedCustomer.passcode}` },
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
                  <span className="text-[11px] font-black text-primary uppercase tracking-wider">1. Subscriber Profile</span>
                  <span className="text-[11px] text-muted-foreground">General Info</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
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
                        placeholder="192.10.10.100"
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
                      {MIKROTIKS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">OPTICAL OLT CHASSIS</label>
                    <select
                      value={addForm.olt}
                      onChange={e => setAddForm(p => ({ ...p, olt: e.target.value }))}
                      className={inputCls}
                      style={inputStyle}>
                      {OLTS.map(o => <option key={o} value={o}>{o}</option>)}
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
                { label: "Login Credentials", text: `Your MAA BEST NETWORK Login:\nPortal: portal.maabestnetwork.com\nUser ID: ${selectedCustomer.id}\nPasscode: ${selectedCustomer.passcode}` },
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
              <div className="text-muted-foreground">User ID: {selectedCustomer.id} · Due: ৳{selectedCustomer.dueAmount}</div>
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
                <span className="font-bold text-primary">{selectedNewPkg.name}</span>
                <span className="text-emerald-600 block text-[11px] font-mono font-bold">৳{packageCustomPrice || selectedNewPkg.price}/mo · {selectedNewPkg.down}/{selectedNewPkg.up} Mbps</span>
              </div>
            </div>

            {/* Package Selection Grid */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Select Target Plan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_PACKAGES.map(pkg => {
                    const isSelected = selectedNewPkg.id === pkg.id;
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
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Standard catalog rate: ৳{selectedNewPkg.price}</span>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    Target Bandwidth Limit
                  </label>
                  <div className="px-3 py-2.5 rounded-xl border bg-muted/20 font-mono text-xs font-bold text-foreground flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                    <span>{selectedNewPkg.down} Mbps / {selectedNewPkg.up} Mbps</span>
                    <Zap size={14} className="text-amber-500" />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Profile: profile-{selectedNewPkg.down}M-{selectedNewPkg.up}M</span>
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
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              req.status === "approved"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : req.status === "rejected"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}>
                            {req.status === "approved" ? "✓ Approved" : req.status === "rejected" ? "✗ Declined" : "⏳ Pending Review"}
                          </span>
                        </div>

                        {/* Plan Comparison Bar */}
                        <div className="p-3 rounded-xl bg-card border flex items-center justify-between flex-wrap gap-3 text-xs" style={{ borderColor: "var(--border)" }}>
                          <div>
                            <span className="text-muted-foreground text-[10px] uppercase font-bold block">Current Plan</span>
                            <span className="font-bold text-foreground">{req.currentPackage}</span>
                            <span className="font-mono text-muted-foreground ml-1.5">(৳{req.currentPrice.toLocaleString()}/mo)</span>
                          </div>

                          <div className="text-primary font-black">
                            <ArrowRight size={16} />
                          </div>

                          <div>
                            <span className="text-primary text-[10px] uppercase font-bold block">Requested Upgrade</span>
                            <span className="font-extrabold text-foreground">{req.requestedPackage}</span>
                            <span className="font-mono font-bold text-primary ml-1.5">(৳{req.requestedPrice.toLocaleString()}/mo)</span>
                          </div>

                          <div className="text-right">
                            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold block">Monthly Diff</span>
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                              +৳{req.priceDifference.toLocaleString()}/mo
                            </span>
                          </div>
                        </div>

                        {/* Optional notes */}
                        {req.notes && (
                          <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/40">
                            <strong>Subscriber Note:</strong> "{req.notes}"
                          </div>
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
                                showToast(`✓ Approved & Upgraded ${req.customerName} to ${req.requestedPackage} (৳${req.requestedPrice}/mo)! MikroTik queue synchronized.`);
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

      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast("")} />}
    </div>
  );
}
