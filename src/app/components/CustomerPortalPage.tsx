import { useState, useEffect } from "react";
import {
  Wifi, CreditCard, Shield, Download, ArrowUpRight, ArrowDownRight,
  Clock, AlertCircle, CheckCircle2, RefreshCw, Smartphone,
  Activity, Zap, FileText, Send, HelpCircle, User,
  ChevronRight, Gauge, Lock, Globe, Sparkles, Copy, Check,
  Layers, Phone, MessageSquare, ArrowRight, ExternalLink,
  Sliders, Server, Radio, Power, CheckCircle, AlertTriangle, X,
  Calendar, RotateCcw, Share2, Info, LogOut, Menu, Home,
  Compass, BarChart2, Settings, LifeBuoy, Bell, ChevronLeft,
  Moon, Sun, Wrench, Gift, ShoppingBag, Truck, Store, Package,
  ShieldCheck, DollarSign, Tv, Laptop, Tablet
} from "lucide-react";
import { useCustomerContext, Customer, Invoice } from "../context/CustomerContext";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "./ui/LanguageToggle";
import { storeService, StoreProduct, StoreOrder } from "../data/storeData";

interface CustomerPortalPageProps {
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
}

type PortalSection = "overview" | "bills" | "speed" | "upgrade" | "usage" | "router" | "support" | "profile" | "store";

export function CustomerPortalPage({ onNavigate, onLogout }: CustomerPortalPageProps) {
  const { activeCustomer, customers, setActiveCustomer, processPayment, changePackage, upgradeRequests, submitUpgradeRequest } = useCustomerContext();
  const { t, bnNum, isBangla } = useLanguage();

  const [activeSection, setActiveSection] = useState<PortalSection>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Speed test state
  const [speedTestActive, setSpeedTestActive] = useState(false);
  const [speedStage, setSpeedStage] = useState<"idle" | "ping" | "download" | "upload" | "done">("idle");
  const [testDownload, setTestDownload] = useState(0);
  const [testUpload, setTestUpload] = useState(0);
  const [testPing, setTestPing] = useState(4);
  const [testJitter, setTestJitter] = useState(1.1);

  // Upgrade Plan Request Modal State
  const [upgradeModalPlan, setUpgradeModalPlan] = useState<{ name: string; speed: string; price: number; features?: string[] } | null>(null);
  const [upgradeNote, setUpgradeNote] = useState("");
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false);

  // bKash Checkout State
  const [showBkashModal, setShowBkashModal] = useState(false);
  const [bkashStep, setBkashStep] = useState<"phone" | "otp" | "pin" | "processing" | "success">("phone");
  const [bkashPhone, setBkashPhone] = useState(activeCustomer?.phone || "01712345678");
  const [bkashOtp, setBkashOtp] = useState("");
  const [bkashPin, setBkashPin] = useState("");
  const [lastPaymentResult, setLastPaymentResult] = useState<{ trxId: string; invoiceId: string; amount: number; startDate?: string; endDate?: string } | null>(null);

  // Digital Receipt Modal
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);

  // Ticket Modal
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Speed Issue");
  const [ticketDesc, setTicketDesc] = useState("");

  // Line Self-Diagnosis State
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagStep, setDiagStep] = useState(0);
  const [diagDone, setDiagDone] = useState(false);

  // Wi-Fi Configuration & Connected Devices
  const [wifiSsid, setWifiSsid] = useState("MBN_Fiber_5G_Home");
  const [wifiPassword, setWifiPassword] = useState("mbn@fastfiber");
  const [guestWifi, setGuestWifi] = useState(false);
  const [devices, setDevices] = useState([
    { id: "dev-1", name: "Samsung Smart TV 4K", ip: "192.168.1.102", mac: "DC:A6:32:8B:11:01", type: "tv", speed: "14.2 Mbps", blocked: false },
    { id: "dev-2", name: "iPhone 15 Pro", ip: "192.168.1.105", mac: "F8:FF:C2:55:22:89", type: "mobile", speed: "8.4 Mbps", blocked: false },
    { id: "dev-3", name: "MacBook Air M2", ip: "192.168.1.108", mac: "3C:22:FB:99:AA:04", type: "laptop", speed: "22.1 Mbps", blocked: false },
    { id: "dev-4", name: "Kids iPad", ip: "192.168.1.112", mac: "E4:5F:01:77:33:66", type: "tablet", speed: "4.1 Mbps", blocked: false },
  ]);

  // Emergency Grace Period State
  const [graceActive, setGraceActive] = useState(false);

  // Toast & Interactions
  const [toast, setToast] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const [routerRebooting, setRouterRebooting] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const customer = activeCustomer || customers[0];

  // Hardware Store State
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>(storeService.getProducts());
  const [customerOrders, setCustomerOrders] = useState<StoreOrder[]>([]);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<StoreProduct | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderDeliveryAddress, setOrderDeliveryAddress] = useState(customer?.address || customer?.zone || "Dhaka");
  const [orderPaymentChoice, setOrderPaymentChoice] = useState<"cash" | "bkash" | "on_bill">("bkash");
  const [orderCustomerNote, setOrderCustomerNote] = useState("");
  const [storeCategoryFilter, setStoreCategoryFilter] = useState("all");

  useEffect(() => {
    if (customer) {
      setBkashPhone(customer.phone);
      setOrderDeliveryAddress(customer.address || customer.zone || "Dhaka");
    }
  }, [customer]);

  useEffect(() => {
    const updateStore = () => {
      setStoreProducts([...storeService.getProducts()]);
      if (customer) {
        const myOrders = storeService.getOrders().filter(o => o.customerId === customer.id || o.customerPhone === customer.phone);
        setCustomerOrders(myOrders);
      }
    };
    updateStore();
    const unsub = storeService.subscribe(updateStore);
    return () => unsub();
  }, [customer]);

  const handleCustomerPlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForOrder || !customer) return;

    const newOrder = storeService.createOrder({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: orderDeliveryAddress.trim() || customer.address || "Dhaka",
      channel: "portal_online",
      items: [
        {
          productId: selectedProductForOrder.id,
          productName: selectedProductForOrder.name,
          model: selectedProductForOrder.model,
          sku: selectedProductForOrder.sku,
          unitPrice: selectedProductForOrder.sellingPrice,
          quantity: orderQuantity,
          total: selectedProductForOrder.sellingPrice * orderQuantity,
          warrantyMonths: selectedProductForOrder.warrantyMonths,
        }
      ],
      paymentMethod: orderPaymentChoice,
      paymentStatus: orderPaymentChoice === "bkash" ? "paid" : "unpaid",
      orderStatus: "pending",
      notes: orderCustomerNote,
    });

    setSelectedProductForOrder(null);
    setOrderQuantity(1);
    setOrderCustomerNote("");
    showToast(`✓ Order #${newOrder.orderNumber} placed successfully! MAA BEST NETWORK is processing your hardware.`);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  const runLineDiagnosis = async () => {
    setDiagnosing(true);
    setDiagDone(false);
    setDiagStep(1);
    await new Promise(r => setTimeout(r, 600));
    setDiagStep(2);
    await new Promise(r => setTimeout(r, 600));
    setDiagStep(3);
    await new Promise(r => setTimeout(r, 600));
    setDiagStep(4);
    await new Promise(r => setTimeout(r, 500));
    setDiagnosing(false);
    setDiagDone(true);
    showToast("✓ Line self-diagnosis completed: Optical link healthy (-18.4 dBm), DNS flushed & 2ms BDIX latency!");
  };

  const toggleBlockDevice = (devId: string) => {
    setDevices(prev =>
      prev.map(d => (d.id === devId ? { ...d, blocked: !d.blocked } : d))
    );
    const target = devices.find(d => d.id === devId);
    showToast(target?.blocked ? `Internet access resumed for ${target?.name}` : `Internet access paused for ${target?.name}`);
  };

  const handleSaveWifiCreds = () => {
    if (wifiPassword.length < 8) {
      showToast("Security Alert: Wi-Fi password must be at least 8 characters.");
      return;
    }
    showToast(`✓ Wi-Fi credentials updated! SSID: "${wifiSsid}" synchronized to router.`);
  };

  const handleRequestGrace = () => {
    setGraceActive(true);
    showToast("✓ 72-Hour Emergency Grace Period activated! Full internet speed extended until 29 Aug 2026.");
  };

  // Speed test simulation
  const runSpeedTest = () => {
    setSpeedTestActive(true);
    setSpeedStage("ping");
    setTestDownload(0);
    setTestUpload(0);

    const targetDown = customer.downloadSpeedMbps || 50;
    const targetUp = customer.uploadSpeedMbps || 25;

    // Ping stage
    setTimeout(() => {
      setTestPing(Math.floor(3 + Math.random() * 3));
      setTestJitter(parseFloat((0.8 + Math.random() * 0.7).toFixed(1)));
      setSpeedStage("download");

      // Download ramp up
      let progress = 0;
      const downInterval = setInterval(() => {
        progress += 4;
        const currentSpeed = Math.min(targetDown + (Math.random() * 3 - 1), (progress / 100) * targetDown);
        setTestDownload(parseFloat(currentSpeed.toFixed(1)));

        if (progress >= 100) {
          clearInterval(downInterval);
          setSpeedStage("upload");

          // Upload ramp up
          let upProgress = 0;
          const upInterval = setInterval(() => {
            upProgress += 4;
            const currentUp = Math.min(targetUp + (Math.random() * 2 - 0.5), (upProgress / 100) * targetUp);
            setTestUpload(parseFloat(currentUp.toFixed(1)));

            if (upProgress >= 100) {
              clearInterval(upInterval);
              setSpeedStage("done");
              setSpeedTestActive(false);
              showToast(`Speed Test Completed: ${targetDown.toFixed(1)} Mbps Down / ${targetUp.toFixed(1)} Mbps Up`);
            }
          }, 60);
        }
      }, 60);
    }, 800);
  };

  // bKash payment flow
  const handleOpenBkash = () => {
    setBkashStep("phone");
    setBkashPhone(customer.phone);
    setBkashOtp("");
    setBkashPin("");
    setShowBkashModal(true);
  };

  const submitBkashPhone = () => {
    if (!bkashPhone || bkashPhone.length < 11) {
      showToast("Please enter a valid 11-digit bKash wallet number");
      return;
    }
    setBkashStep("otp");
    setBkashOtp("184920");
  };

  const submitBkashOtp = () => {
    if (!bkashOtp || bkashOtp.length < 4) {
      showToast("Please enter the 6-digit OTP code");
      return;
    }
    setBkashStep("pin");
  };

  const submitBkashPin = async () => {
    if (!bkashPin || bkashPin.length < 4) {
      showToast("Please enter your 5-digit bKash PIN");
      return;
    }
    setBkashStep("processing");

    await new Promise(r => setTimeout(r, 1600));

    const payAmount = customer.dueAmount > 0 ? customer.dueAmount : customer.price;
    const res = processPayment(customer.id, payAmount, "bKash");

    setLastPaymentResult({
      trxId: res.trxId,
      invoiceId: res.invoiceId,
      amount: payAmount,
      startDate: res.startDate,
      endDate: res.endDate,
    });
    setBkashStep("success");
    showToast(`bKash payment successful! Validity active until ${res.endDate}`);
  };

  const handleRestartRouter = async () => {
    setRouterRebooting(true);
    showToast("Sending optical terminal & router reboot signal...");
    await new Promise(r => setTimeout(r, 2200));
    setRouterRebooting(false);
    showToast("Router rebooted! PPPoE high-speed link refreshed.");
  };

  const handlePromptUpgradeModal = (pkg: { name: string; speed: string; price: number; features?: string[] }) => {
    setUpgradeModalPlan(pkg);
    setUpgradeNote("");
  };

  const handleConfirmUpgradeRequest = async () => {
    if (!upgradeModalPlan) return;
    setIsSubmittingUpgrade(true);
    await new Promise(r => setTimeout(r, 600));

    const req = submitUpgradeRequest(
      customer.id,
      upgradeModalPlan.name,
      upgradeModalPlan.speed,
      upgradeModalPlan.price,
      upgradeNote || undefined
    );

    setIsSubmittingUpgrade(false);
    setUpgradeModalPlan(null);
    showToast(`✓ Upgrade request (#${req.id}) submitted to MAA BEST NETWORK Admin! You will receive an SMS upon approval.`);
  };

  // Usage graph mockup
  const weeklyUsage = [
    { day: "Mon", down: 18.4, up: 3.2 },
    { day: "Tue", down: 22.1, up: 4.1 },
    { day: "Wed", down: 15.8, up: 2.8 },
    { day: "Thu", down: 28.5, up: 5.4 },
    { day: "Fri", down: 36.2, up: 6.9 },
    { day: "Sat", down: 42.8, up: 8.5 },
    { day: "Sun", down: 31.4, up: 5.9 },
  ];
  const maxWeekly = Math.max(...weeklyUsage.map(w => w.down));

  const navMenuItems = [
    { id: "overview" as const, label: t("Dashboard"), icon: Home, badge: undefined },
    { id: "bills" as const, label: t("Bills & bKash Pay"), icon: CreditCard, badge: customer.dueAmount > 0 ? t("Due") : undefined },
    { id: "speed" as const, label: t("Speed Test"), icon: Gauge, badge: "Live" },
    { id: "store" as const, label: t("Hardware & Store"), icon: ShoppingBag, badge: "Store" },
    { id: "upgrade" as const, label: t("Upgrade Package"), icon: Sparkles, badge: undefined },
    { id: "usage" as const, label: t("Data Analytics"), icon: BarChart2, badge: undefined },
    { id: "router" as const, label: t("Wi-Fi Settings"), icon: Radio, badge: undefined },
    { id: "support" as const, label: t("Support Ticket"), icon: LifeBuoy, badge: undefined },
    { id: "profile" as const, label: t("My Account"), icon: User, badge: undefined },
  ];

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row"
      style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── 1. APPLICATION SIDEBAR (Desktop & Tablet) ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <aside
        className="hidden md:flex flex-col justify-between w-64 lg:w-72 border-r p-5 flex-shrink-0 min-h-screen sticky top-0"
        style={{
          background: "var(--card)",
          borderColor: "var(--border)",
          boxShadow: "2px 0 20px rgba(0,0,0,0.02)"
        }}>
        {/* Top App Branding */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-11 px-2.5 rounded-2xl bg-white dark:bg-white/10 border border-rose-100 dark:border-white/10 flex items-center justify-center shadow-xs flex-shrink-0">
              <img
                src="/maabestnetwork.png"
                alt="MAA BEST NETWORK"
                className="h-8 max-w-[110px] object-contain"
              />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--foreground)" }}>
                MAA BEST NETWORK
              </div>
              <div className="text-[11px] font-bold text-primary flex items-center gap-1">
                <span>Subscriber App</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* User Mini Profile Card */}
          <div
            className="p-3.5 rounded-2xl border bg-muted/40 flex items-center gap-3"
            style={{ borderColor: "var(--border)" }}>
            <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
              {customer.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-foreground truncate">{customer.name}</div>
              <div className="text-[11px] font-mono font-semibold text-primary">{customer.id}</div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{customer.downloadSpeedMbps}M Fiber Active</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            {navMenuItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isSelected
                      ? "text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                  style={{
                    background: isSelected ? "linear-gradient(135deg, #8B2020 0%, #C43535 100%)" : "transparent"
                  }}>
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isSelected ? "text-white" : "text-muted-foreground"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      isSelected ? "bg-white text-rose-800" : "bg-amber-500 text-white"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Actions */}
        <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          {/* Authenticated Session Security Badge */}
          <div className="p-3 rounded-2xl bg-muted/40 border border-border text-[11px] space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <Shield size={13} />
              <span>Verified TLS Session</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono truncate">
              Subscriber: {customer.id}
            </div>
          </div>

          <button
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                onNavigate?.("dashboard");
              }
            }}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all flex items-center justify-center gap-2">
            <LogOut size={14} />
            <span>Sign Out from App</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── 2. MOBILE TOP APP BAR & DRAWER ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">

        {/* Mobile Header Bar */}
        <header
          className="sticky top-0 z-40 px-4 py-3.5 border-b backdrop-blur-md flex items-center justify-between"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border bg-muted/60 text-foreground"
              style={{ borderColor: "var(--border)" }}>
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="h-8 px-2 rounded-xl bg-white dark:bg-white/10 border border-rose-100 dark:border-white/10 flex items-center justify-center shadow-xs flex-shrink-0">
                <img
                  src="/maabestnetwork.png"
                  alt="MAA BEST NETWORK"
                  className="h-5 max-w-[70px] object-contain"
                />
              </div>
              <div>
                <div className="text-xs font-extrabold text-foreground leading-tight">MAA BEST NETWORK</div>
                <div className="text-[10px] text-muted-foreground font-mono">{customer.id}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <LanguageToggle />

            {/* Direct bKash Quick Button on Top Bar */}
            <button
              onClick={handleOpenBkash}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-[11px] text-white shadow-sm flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #E2136E 0%, #D11266 100%)" }}>
              <Smartphone size={13} />
              <span className="hidden xs:inline sm:inline">{customer.dueAmount > 0 ? `${t("Pay Now")} ৳${bnNum(customer.dueAmount)}` : t("bKash Pay")}</span>
              <span className="xs:hidden sm:hidden">Pay</span>
            </button>

            <button
              onClick={() => setShowNotificationModal(true)}
              className="p-2 rounded-xl border bg-muted/50 text-muted-foreground hover:text-foreground relative cursor-pointer"
              style={{ borderColor: "var(--border)" }}>
              <Bell size={16} />
              {customer.dueAmount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600" />
              )}
            </button>
          </div>
        </header>

        {/* ── MOBILE SLIDE-OVER DRAWER MENU ── */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="w-4/5 max-w-xs h-full bg-card p-5 flex flex-col justify-between shadow-2xl animate-slideIn border-r"
              style={{ borderColor: "var(--border)" }}
              onClick={e => e.stopPropagation()}>
              <style>{`@keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>

              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 px-2 rounded-xl bg-white dark:bg-white/10 border border-rose-100 dark:border-white/10 flex items-center justify-center shadow-xs">
                      <img
                        src="/maabestnetwork.png"
                        alt="MAA BEST NETWORK"
                        className="h-5 max-w-[70px] object-contain"
                      />
                    </div>
                    <span className="text-sm font-extrabold text-foreground">MAA BEST Subscriber App</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-muted-foreground">
                    <X size={18} />
                  </button>
                </div>

                {/* Profile Card in Drawer */}
                <div className="p-3.5 rounded-2xl bg-muted/40 border flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
                  <div className="w-9 h-9 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-xs shadow-sm">
                    {customer.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground truncate">{customer.name}</div>
                    <div className="text-[10px] font-mono text-primary font-bold">{customer.id}</div>
                  </div>
                </div>

                {/* Drawer Nav Items */}
                <nav className="space-y-1">
                  {navMenuItems.map(item => {
                    const Icon = item.icon;
                    const isSelected = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold ${
                          isSelected ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/60"
                        }`}>
                        <div className="flex items-center gap-3">
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${isSelected ? "bg-white text-rose-800" : "bg-amber-500 text-white"}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer Sign Out */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) onLogout();
                  else onNavigate?.("dashboard");
                }}
                className="w-full py-3 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-950 text-rose-600 flex items-center justify-center gap-2">
                <LogOut size={14} />
                <span>Sign Out from App</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── 3. MAIN APP VIEW CONTENT ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <main className="flex-1 p-4 md:p-7 max-w-5xl mx-auto w-full space-y-6">

          {/* ────────────────────────────────────────────────────────── */}
          {/* ── VIEW 1: HOME DASHBOARD (First Page Data) ── */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeSection === "overview" && (
            <div className="space-y-6">

              {/* Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                    <span>Welcome, {customer.name.split(" ")[0]}!</span>
                    <Sparkles size={20} className="text-amber-500" />
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Fiber GPON Account: <strong className="font-mono text-foreground">{customer.id}</strong> · {customer.subzone}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>PPPoE Connected</span>
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">IP: {customer.ipAddress}</span>
                </div>
              </div>

              {/* ── 1. PACKAGE & VALIDITY COUNTDOWN HERO CARD ── */}
              <div
                className="p-6 md:p-7 rounded-3xl border shadow-sm space-y-5 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(139,32,32,0.08) 0%, var(--card) 100%)",
                  borderColor: "var(--border)"
                }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary mb-2">
                      <Zap size={13} /> Active Fiber Plan
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
                      {customer.package}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Allocated Bandwidth: <strong className="text-foreground">{customer.downloadSpeedMbps} Mbps Download</strong> / <strong className="text-foreground">{customer.uploadSpeedMbps} Mbps Upload</strong>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-[11px] font-bold text-muted-foreground uppercase">Monthly Fee</div>
                    <div className="text-2xl font-black text-foreground font-mono">৳{customer.price.toLocaleString()}</div>
                  </div>
                </div>

                {/* Subscription Countdown Box */}
                <div className="p-4 rounded-2xl border bg-card space-y-3" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">30-Day Payment-Driven Cycle</span>
                    </div>
                    <span className="px-3 py-1 rounded-xl text-xs font-black bg-primary text-white flex items-center gap-1.5 shadow-sm">
                      <Clock size={13} /> {customer.daysRemaining} Days Left
                    </span>
                  </div>

                  {/* Progress Bar of Billing Cycle */}
                  <div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, Math.max(10, ((30 - customer.daysRemaining) / 30) * 100))}%`,
                          background: customer.daysRemaining > 5 ? "linear-gradient(90deg, #16A34A, #10B981)" : "linear-gradient(90deg, #D97706, #DC2626)"
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-bold text-muted-foreground mt-2">
                      <span>Connected / Paid: <strong className="text-foreground">{customer.startDate}</strong></span>
                      <span className="text-foreground">Day {30 - customer.daysRemaining} of 30</span>
                      <span>Next Due / Expires: <strong className="text-rose-600 dark:text-rose-400">{customer.endDate}</strong></span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500 flex-shrink-0" />
                    <span>
                      <strong>Payment-Driven Cycle:</strong> Your 30 days start on the day you pay (e.g. 20 Aug → 20 Sep, or 05 Oct → 05 Nov). Unused offline days are never charged!
                    </span>
                  </div>
                </div>
              </div>

              {/* ── 2. BILL DUE ALERT WITH 1-TAP BKASH PAYMENT BUTTON ── */}
              <div
                className={`p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  customer.dueAmount > 0
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-emerald-500/10 border-emerald-500/30"
                }`}>
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0 ${
                      customer.dueAmount > 0 ? "bg-amber-500" : "bg-emerald-600"
                    }`}>
                    {customer.dueAmount > 0 ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-foreground">
                        {customer.dueAmount > 0
                          ? `Bill Due: ৳${customer.dueAmount.toLocaleString()}`
                          : "Account Up-To-Date & Paid"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        customer.dueAmount > 0 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                      }`}>
                        {customer.dueAmount > 0 ? "Due" : "Paid"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {customer.dueAmount > 0
                        ? `Pay by ${customer.endDate} to keep line active. 1-tap instant bKash checkout.`
                        : `Next billing cycle renews on ${customer.endDate}.`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenBkash}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #E2136E 0%, #D11266 100%)",
                    boxShadow: "0 4px 18px rgba(226,19,110,0.35)"
                  }}>
                  <Smartphone size={16} />
                  <span>{customer.dueAmount > 0 ? `Pay ৳${customer.dueAmount} with bKash` : "Pay with bKash"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* ── 3. LIVE SPEED METERS & QUICK SPEED TEST ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Speed Card */}
                <div className="p-6 rounded-3xl border shadow-sm space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Gauge size={15} className="text-primary" /> Live Speed Telemetry
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      1 Gbps Core Link
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 text-center space-y-1">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-center gap-1">
                        <ArrowDownRight size={12} className="text-primary" /> Download
                      </div>
                      <div className="text-2xl font-black font-mono text-foreground">
                        {speedTestActive && speedStage === "download" ? testDownload.toFixed(1) : customer.downloadSpeedMbps}
                        <span className="text-xs font-normal text-muted-foreground ml-1">Mbps</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-muted/40 border border-border/40 text-center space-y-1">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-center gap-1">
                        <ArrowUpRight size={12} className="text-emerald-500" /> Upload
                      </div>
                      <div className="text-2xl font-black font-mono text-foreground">
                        {speedTestActive && speedStage === "upload" ? testUpload.toFixed(1) : customer.uploadSpeedMbps}
                        <span className="text-xs font-normal text-muted-foreground ml-1">Mbps</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={runSpeedTest}
                    disabled={speedTestActive}
                    className="w-full py-3 rounded-2xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 hover:opacity-95"
                    style={{
                      background: speedTestActive ? "var(--muted-foreground)" : "linear-gradient(135deg, #8B2020 0%, #C43535 100%)"
                    }}>
                    {speedTestActive ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                    <span>{speedTestActive ? `Testing ${speedStage}...` : "Run Live Speed Test"}</span>
                  </button>
                </div>

                {/* Line Quality & Bandwidth */}
                <div className="p-6 rounded-3xl border shadow-sm space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Radio size={15} className="text-primary" /> Optical Line Health
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600">Optimal Range</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                      <div className="text-[10px] text-muted-foreground font-semibold">Optical Rx Signal</div>
                      <div className="text-base font-extrabold text-emerald-600 font-mono mt-0.5">{customer.onuSignal}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                      <div className="text-[10px] text-muted-foreground font-semibold">Session Uptime</div>
                      <div className="text-base font-extrabold text-foreground mt-0.5">{customer.sessionUptime}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                      <div className="text-[10px] text-muted-foreground font-semibold">Monthly Usage</div>
                      <div className="text-base font-extrabold text-foreground font-mono mt-0.5">{customer.monthlyUsageGB} GB</div>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
                      <div className="text-[10px] text-muted-foreground font-semibold">Assigned Gateway</div>
                      <div className="text-base font-extrabold font-mono text-foreground mt-0.5 truncate">103.145.112.1</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveSection("router")}
                    className="w-full py-3 rounded-2xl font-bold text-xs border bg-card text-foreground hover:bg-muted transition-all flex items-center justify-center gap-1.5">
                    <Radio size={14} />
                    <span>View Wi-Fi & Optical Router Diagnostics →</span>
                  </button>
                </div>
              </div>

              {/* ── 4. QUICK ACTION APP SHORTCUTS ── */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Quick Mobile Services
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { title: "bKash Payment", icon: Smartphone, color: "#E2136E", action: handleOpenBkash },
                    { title: "Speed Test", icon: Gauge, color: "#8B2020", action: () => setActiveSection("speed") },
                    { title: "Upgrade Plan", icon: Sparkles, color: "#7C3AED", action: () => setActiveSection("upgrade") },
                    { title: "WhatsApp NOC", icon: MessageSquare, color: "#25D366", action: () => window.open("https://wa.me/8801711223344", "_blank") },
                  ].map(sc => {
                    const Icon = sc.icon;
                    return (
                      <button
                        key={sc.title}
                        onClick={sc.action}
                        className="p-4 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all hover:scale-[1.02] bg-card shadow-xs cursor-pointer"
                        style={{ borderColor: "var(--border)" }}>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                          style={{ background: sc.color }}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">{sc.title}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">1-tap service</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── 5. 1-TAP LINE SELF-DIAGNOSIS & AUTO-FIX TOOL ── */}
              <div className="p-6 rounded-3xl border shadow-sm space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Wrench size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-foreground">1-Tap Smart Line Self-Diagnosis & Auto-Fix</h3>
                      <p className="text-xs text-muted-foreground">Automatically tests optical physical link, PPPoE authentication, and flushes DNS routing cache.</p>
                    </div>
                  </div>

                  <button
                    onClick={runLineDiagnosis}
                    disabled={diagnosing}
                    className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-primary shadow-sm hover:opacity-95 flex items-center gap-2 cursor-pointer disabled:opacity-50 flex-shrink-0">
                    {diagnosing ? <RefreshCw size={14} className="animate-spin" /> : <Activity size={14} />}
                    <span>{diagnosing ? "Testing Link..." : "Run Diagnosis"}</span>
                  </button>
                </div>

                {/* Step Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2">
                  {[
                    { step: 1, title: "1. Optical Rx Power", desc: "-18.4 dBm (Pass)" },
                    { step: 2, title: "2. PPPoE Session", desc: "Radius Auth (Active)" },
                    { step: 3, title: "3. Gateway Ping", desc: "2ms BDIX (Ultra-Fast)" },
                    { step: 4, title: "4. Cache Flush", desc: "DNS Flushed (100% OK)" },
                  ].map(s => {
                    const isDone = diagStep >= s.step || diagDone;
                    const isCurrent = diagStep === s.step && diagnosing;
                    return (
                      <div
                        key={s.step}
                        className={`p-3 rounded-2xl border transition-all text-xs space-y-1 ${
                          isDone
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                            : isCurrent
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 animate-pulse"
                            : "bg-muted/30 border-border text-muted-foreground"
                        }`}>
                        <div className="flex items-center justify-between font-bold text-[11px]">
                          <span>{s.title}</span>
                          {isDone ? <CheckCircle2 size={13} className="text-emerald-500" /> : isCurrent ? <RefreshCw size={12} className="animate-spin" /> : null}
                        </div>
                        <div className="text-[10px] font-mono opacity-85">{s.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 6. EMERGENCY GRACE PERIOD & REFERRAL CARDS ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Emergency Grace Extension */}
                <div className="p-5 rounded-3xl border bg-card space-y-3" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-foreground">Need More Time to Pay?</div>
                      <div className="text-[11px] text-muted-foreground">3-Day Emergency Grace Line Extension</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    If you cannot pay immediately on the due date, activate emergency grace to keep full high-speed connection running for 72 hours without interruption.
                  </p>
                  <button
                    onClick={handleRequestGrace}
                    disabled={graceActive}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      graceActive
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20"
                    }`}>
                    <CheckCircle size={14} />
                    <span>{graceActive ? "✓ 72-Hour Grace Period Active" : "Request 3-Day Grace Extension"}</span>
                  </button>
                </div>

                {/* Refer a Friend Banner */}
                <div className="p-5 rounded-3xl border bg-card space-y-3" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                      <Gift size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-foreground">Refer a Friend & Earn ৳200</div>
                      <div className="text-[11px] text-muted-foreground">Discount applied on next invoice</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Share your unique referral code with family or neighbors getting new fiber internet in your area.
                  </p>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={`MBN-REF-${customer.id}`}
                      className="px-3 py-2 rounded-xl bg-muted border border-border text-xs font-mono font-bold text-foreground w-1/2 outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(`https://maabestnetwork.com/join?ref=MBN-REF-${customer.id}`, "referral")}
                      className="w-1/2 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                      <Share2 size={13} />
                      <span>{copiedKey === "referral" ? "Copied Link!" : "Copy Link"}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* ── VIEW 2: BILLS & BKASH PAYMENT ── */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeSection === "bills" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-foreground">Bills & Online Payments</h2>
                  <p className="text-xs text-muted-foreground">Pay instantly with bKash, Nagad or Card with auto-reconnection.</p>
                </div>
              </div>

              {/* Instant Pay Box */}
              <div className="p-6 rounded-3xl border shadow-sm space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <div className="text-[11px] font-bold text-muted-foreground uppercase">Current Invoice Amount</div>
                    <div className="text-2xl font-black font-mono text-foreground mt-0.5">
                      ৳{(customer.dueAmount > 0 ? customer.dueAmount : customer.price).toLocaleString()}.00
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                    customer.dueAmount > 0 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                  }`}>
                    {customer.dueAmount > 0 ? `Due by ${customer.endDate}` : "Fully Paid"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* bKash */}
                  <button
                    onClick={handleOpenBkash}
                    className="p-4 rounded-2xl border text-left flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer"
                    style={{ background: "rgba(226,19,110,0.06)", borderColor: "rgba(226,19,110,0.3)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E2136E] text-white flex items-center justify-center font-bold shadow-md">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">bKash Direct</div>
                        <div className="text-[10px] text-muted-foreground">Instant OTP Checkout</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#E2136E]" />
                  </button>

                  {/* Nagad */}
                  <button
                    onClick={() => {
                      const res = processPayment(customer.id, customer.dueAmount > 0 ? customer.dueAmount : customer.price, "Nagad");
                      showToast(`Payment recorded via Nagad! TrxID: ${res.trxId}`);
                    }}
                    className="p-4 rounded-2xl border text-left flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer"
                    style={{ background: "rgba(247,148,29,0.06)", borderColor: "rgba(247,148,29,0.3)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F7941D] text-white flex items-center justify-center font-bold shadow-md">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">Nagad Wallet</div>
                        <div className="text-[10px] text-muted-foreground">Mobile Banking</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#F7941D]" />
                  </button>

                  {/* Card */}
                  <button
                    onClick={() => {
                      const res = processPayment(customer.id, customer.dueAmount > 0 ? customer.dueAmount : customer.price, "Card");
                      showToast(`Payment recorded via Card! TrxID: ${res.trxId}`);
                    }}
                    className="p-4 rounded-2xl border text-left flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer"
                    style={{ background: "rgba(37,99,235,0.06)", borderColor: "rgba(37,99,235,0.3)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold shadow-md">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">Cards / NetBanking</div>
                        <div className="text-[10px] text-muted-foreground">Visa, Mastercard</div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-[#2563EB]" />
                  </button>
                </div>
              </div>

              {/* Invoice History */}
              <div className="p-6 rounded-3xl border shadow-sm space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <h3 className="text-sm font-bold text-foreground">Payment & Tax Invoice History</h3>

                <div className="space-y-2.5">
                  {customer.invoices.map(inv => (
                    <div
                      key={inv.id}
                      className="p-4 rounded-2xl border flex items-center justify-between gap-3 bg-muted/20"
                      style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          inv.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">{inv.month} ({inv.id})</div>
                          <div className="text-[10px] text-muted-foreground">
                            {inv.paidDate ? `Paid on ${inv.paidDate} via ${inv.paymentMethod || "bKash"}` : `Due by ${inv.dueDate}`}
                            {inv.trxId && <span className="font-mono text-primary ml-1">· Trx: {inv.trxId}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-black">৳{inv.amount.toLocaleString()}</span>
                        <button
                          onClick={() => setReceiptInvoice(inv)}
                          className="p-2 rounded-xl border bg-card hover:bg-muted"
                          title="Download Tax Receipt">
                          <Download size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* ── VIEW 3: LIVE SPEED TESTER & DIAGNOSTICS ── */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeSection === "speed" && (
            <div className="space-y-6">
              <div className="p-7 rounded-3xl border shadow-sm text-center space-y-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div>
                  <h2 className="text-xl font-black text-foreground">Interactive Bandwidth Speed Tester</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Test real-time fiber download & upload throughput to our core BDIX gateway.</p>
                </div>

                {/* Animated Speedometer Dial */}
                <div className="relative flex flex-col items-center justify-center my-4">
                  <div className="w-52 h-52 rounded-full flex items-center justify-center border-4 border-dashed border-primary/30 p-4">
                    <div
                      className={`w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-inner transition-all duration-300 ${
                        speedTestActive ? "scale-105 bg-primary/10 border-2 border-primary" : "bg-muted/40"
                      }`}>
                      <div className="text-4xl font-black text-foreground font-mono tracking-tight">
                        {speedTestActive
                          ? speedStage === "download"
                            ? testDownload.toFixed(1)
                            : speedStage === "upload"
                            ? testUpload.toFixed(1)
                            : "..."
                          : customer.downloadSpeedMbps.toFixed(1)}
                      </div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
                        {speedTestActive ? `${speedStage.toUpperCase()} MBPS` : "Mbps Download"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 text-xs font-semibold text-muted-foreground">
                    <span>Ping Latency: <strong className="text-foreground">{speedTestActive ? testPing : 4} ms</strong></span>
                    <span>•</span>
                    <span>Jitter: <strong className="text-foreground">{speedTestActive ? testJitter : 1.1} ms</strong></span>
                  </div>
                </div>

                <button
                  onClick={runSpeedTest}
                  disabled={speedTestActive}
                  className="max-w-xs mx-auto w-full py-3.5 px-6 rounded-2xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer"
                  style={{
                    background: speedTestActive ? "var(--muted-foreground)" : "linear-gradient(135deg, #8B2020 0%, #C43535 100%)",
                    boxShadow: "0 6px 20px rgba(139,32,32,0.35)"
                  }}>
                  {speedTestActive ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                  <span>{speedTestActive ? `Testing ${speedStage}...` : "Start High-Speed Test"}</span>
                </button>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* ── VIEW 4: UPGRADE PACKAGE ── */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeSection === "upgrade" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-black text-foreground">{t("Upgrade Your Plan")}</h2>
                <p className="text-xs text-muted-foreground">Select a higher bandwidth tier. Requests are verified by network engineers before activating.</p>
              </div>

              {/* Pending Request Alert if any */}
              {(() => {
                const pendingReq = upgradeRequests.find(r => r.customerId === customer.id && r.status === "pending");
                if (!pendingReq) return null;
                return (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                        <Clock size={18} />
                      </div>
                      <div>
                        <div className="text-xs font-black text-foreground">
                          Upgrade Request #{pendingReq.id} Pending Admin Review
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Requested upgrade to <strong>{pendingReq.requestedPackage}</strong> (৳{pendingReq.requestedPrice.toLocaleString()}/mo) on {pendingReq.requestDate}.
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                      Under Review
                    </span>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { name: "30 Mbps Home Fiber", speed: "30/15", price: 1000, features: ["Buffer-Free 4K Streaming", "Unlimited High Speed", "15 Mbps Upload"] },
                  { name: "50 Mbps Ultra Fiber Pro", speed: "50/25", price: 1200, popular: true, features: ["Ideal for 6+ Heavy Devices", "Low Ping Gaming Route", "Priority BDIX Peering"] },
                  { name: "100 Mbps Gigabit Beast", speed: "100/50", price: 2200, features: ["Gigabit Fiber Direct Route", "Real IP Included", "VIP Dedicated Core Queue"] },
                ].map(pkg => {
                  const isCurrent = customer.package.toLowerCase().includes(pkg.name.split(" ")[0].toLowerCase());
                  const isPending = upgradeRequests.some(
                    r => r.customerId === customer.id && r.status === "pending" && r.requestedPackage === pkg.name
                  );

                  return (
                    <div
                      key={pkg.name}
                      className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between bg-card ${
                        pkg.popular ? "border-primary shadow-lg" : ""
                      }`}
                      style={{ borderColor: pkg.popular ? "var(--primary)" : "var(--border)" }}>
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-base font-extrabold text-foreground">{pkg.name}</h3>
                            <div className="text-2xl font-black text-foreground font-mono mt-1">৳{pkg.price.toLocaleString()}/mo</div>
                          </div>
                          {pkg.popular && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-primary text-white">
                              POPULAR
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                          {pkg.features.map(f => (
                            <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        <button
                          onClick={() => handlePromptUpgradeModal(pkg)}
                          disabled={isCurrent || isPending}
                          className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isCurrent
                              ? "bg-muted text-muted-foreground opacity-80 cursor-not-allowed"
                              : isPending
                              ? "bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 cursor-not-allowed"
                              : "bg-primary text-white shadow-md hover:opacity-95"
                          }`}>
                          {isCurrent ? (
                            <span>✓ Current Active Plan</span>
                          ) : isPending ? (
                            <>
                              <Clock size={13} />
                              <span>Request Pending Approval</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={13} />
                              <span>Request Plan Upgrade →</span>
                            </>
                          )}
                        </button>

                        {!isCurrent && !isPending && (
                          <p className="text-[10px] text-center text-muted-foreground">
                            Diff: +৳{Math.max(0, pkg.price - customer.price).toLocaleString()}/mo (Admin approval required)
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Upgrade Requests Audit Table for this Customer ── */}
              <div className="p-6 rounded-3xl border bg-card shadow-sm space-y-4" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Sliders size={16} className="text-primary" />
                    <span>My Plan Change Request History</span>
                  </h3>
                  <span className="text-[11px] text-muted-foreground">
                    Managed by MAA BEST NETWORK Core NOC
                  </span>
                </div>

                {upgradeRequests.filter(r => r.customerId === customer.id).length === 0 ? (
                  <div className="text-center py-6 text-xs text-muted-foreground">
                    No past upgrade requests found for this account.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b text-muted-foreground text-left text-[11px]" style={{ borderColor: "var(--border)" }}>
                          <th className="pb-2 font-bold">Request ID</th>
                          <th className="pb-2 font-bold">Requested Package</th>
                          <th className="pb-2 font-bold">New Rate</th>
                          <th className="pb-2 font-bold">Difference</th>
                          <th className="pb-2 font-bold">Date</th>
                          <th className="pb-2 font-bold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {upgradeRequests
                          .filter(r => r.customerId === customer.id)
                          .map(req => (
                            <tr key={req.id}>
                              <td className="py-2.5 font-mono font-bold text-foreground">{req.id}</td>
                              <td className="py-2.5 font-semibold text-foreground">{req.requestedPackage}</td>
                              <td className="py-2.5 font-mono">৳{req.requestedPrice.toLocaleString()}</td>
                              <td className="py-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">+৳{req.priceDifference.toLocaleString()}</td>
                              <td className="py-2.5 text-muted-foreground">{req.requestDate}</td>
                              <td className="py-2.5">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                    req.status === "approved"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                      : req.status === "rejected"
                                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  }`}>
                                  {req.status === "approved" ? "✓ Approved" : req.status === "rejected" ? "✗ Declined" : "⏳ Under Review"}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* ── VIEW 5: USAGE ANALYTICS ── */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeSection === "usage" && (
            <div className="space-y-6">
              <div className="p-6 md:p-7 rounded-3xl border shadow-sm space-y-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div>
                  <h2 className="text-xl font-black text-foreground">Bandwidth Consumption Analytics</h2>
                  <p className="text-xs text-muted-foreground">Daily upload vs download traffic consumed on your line.</p>
                </div>

                <div className="grid grid-cols-7 gap-2.5 pt-4 items-end h-48">
                  {weeklyUsage.map(w => {
                    const downHeight = (w.down / maxWeekly) * 100;
                    const upHeight = (w.up / maxWeekly) * 100;
                    return (
                      <div key={w.day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="text-[9px] font-mono text-muted-foreground">{w.down}G</div>
                        <div className="w-full flex items-end justify-center gap-1 h-32 bg-muted/40 rounded-xl p-1">
                          <div className="w-full rounded-md" style={{ height: `${downHeight}%`, background: "var(--primary)" }} />
                          <div className="w-full rounded-md bg-emerald-500" style={{ height: `${upHeight}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-foreground">{w.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* ── VIEW 6: ROUTER & WI-FI ── */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeSection === "router" && (
            <div className="space-y-6">
              
              {/* Optical Terminal Status & Reboot */}
              <div className="p-6 rounded-3xl border shadow-sm space-y-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-foreground">Optical Terminal & Wi-Fi Management</h2>
                    <p className="text-xs text-muted-foreground">Manage your home wireless network, view connected family devices, and control guest access.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Dual-Band AC1200
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border space-y-2 text-xs" style={{ borderColor: "var(--border)" }}>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">PPPoE Dialed Status</span>
                    <span className="font-bold text-emerald-600">CONNECTED (Active)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">ONU Optical Rx Power</span>
                    <span className="font-bold text-emerald-600">{customer.onuSignal} (Optimal: -15 to -24 dBm)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Assigned IPv4 Address</span>
                    <span className="font-mono text-foreground">{customer.ipAddress}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Router Firmware</span>
                    <span className="font-mono text-muted-foreground">v3.4.12-TR069 (Auto-Managed)</span>
                  </div>
                </div>

                <button
                  onClick={handleRestartRouter}
                  disabled={routerRebooting}
                  className="w-full py-3 rounded-2xl font-bold text-xs text-white bg-primary shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                  {routerRebooting ? <RefreshCw size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  <span>{routerRebooting ? "Rebooting Router..." : "Reboot Optical Router Link"}</span>
                </button>
              </div>

              {/* Wi-Fi SSID & Password Configuration */}
              <div className="p-6 rounded-3xl border shadow-sm space-y-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Radio size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">Wi-Fi Network Configuration</h3>
                    <p className="text-xs text-muted-foreground">Change your home Wi-Fi SSID name and WPA2/WPA3 security key.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Wi-Fi Name (SSID)</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={e => setWifiSsid(e.target.value)}
                      className="w-full p-3 rounded-xl border bg-muted/30 text-xs font-semibold text-foreground outline-none focus:border-primary"
                      style={{ borderColor: "var(--border)" }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground">Wi-Fi Password (WPA2/WPA3)</label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={e => setWifiPassword(e.target.value)}
                      className="w-full p-3 rounded-xl border bg-muted/30 text-xs font-mono font-bold text-foreground outline-none focus:border-primary"
                      style={{ borderColor: "var(--border)" }}
                    />
                  </div>
                </div>

                {/* Guest Wi-Fi Toggle */}
                <div className="p-4 rounded-2xl border bg-muted/20 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <div className="text-xs font-bold text-foreground">Guest Wi-Fi Network (2.4GHz)</div>
                    <div className="text-[11px] text-muted-foreground">Isolated network for visitors without access to home devices.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGuestWifi(!guestWifi);
                      showToast(guestWifi ? "Guest Wi-Fi disabled" : "Guest Wi-Fi enabled (SSID: MBN_Guest_Free)");
                    }}
                    className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                      guestWifi ? "bg-emerald-500" : "bg-muted border border-border"
                    }`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-all absolute top-1 ${
                      guestWifi ? "right-1" : "left-1"
                    }`} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveWifiCreds}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:opacity-95 shadow-md flex items-center gap-2 cursor-pointer">
                  <Check size={14} />
                  <span>Save & Push Wi-Fi Settings</span>
                </button>
              </div>

              {/* Connected Home Devices & Parental Controls */}
              <div className="p-6 rounded-3xl border shadow-sm space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-foreground">Connected Home Devices ({devices.length})</h3>
                      <p className="text-xs text-muted-foreground">Live connected smart devices with individual bandwidth pause controls.</p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-border/50 border rounded-2xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
                  {devices.map(dev => (
                    <div key={dev.id} className="p-3.5 flex items-center justify-between bg-card text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-foreground font-bold">
                          {dev.type === "tv" ? <Tv size={16} /> : dev.type === "laptop" ? <Laptop size={16} /> : dev.type === "tablet" ? <Tablet size={16} /> : <Smartphone size={16} />}
                        </div>
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-2">
                            <span>{dev.name}</span>
                            {dev.blocked && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-rose-500/10 text-rose-600">
                                Paused
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            IP: {dev.ip} · MAC: {dev.mac}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-muted-foreground text-[11px]">{dev.speed}</span>
                        <button
                          type="button"
                          onClick={() => toggleBlockDevice(dev.id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                            dev.blocked
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-600 hover:bg-rose-500/20"
                          }`}>
                          {dev.blocked ? "Resume Access" : "Pause Internet"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* ── VIEW 7: SUPPORT & HELP ── */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeSection === "support" && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl border shadow-sm space-y-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <h2 className="text-xl font-black text-foreground">24/7 Subscriber Assistance</h2>
                <p className="text-xs text-muted-foreground">Connect with our dedicated NOC technical support engineers.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="https://wa.me/8801711223344"
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl border text-center space-y-1 hover:border-emerald-500 bg-card"
                    style={{ borderColor: "var(--border)" }}>
                    <MessageSquare size={22} className="mx-auto text-emerald-500" />
                    <div className="text-xs font-bold text-foreground">WhatsApp Live Support</div>
                    <div className="text-[10px] text-muted-foreground">+880 1711-223344</div>
                  </a>

                  <a
                    href="tel:09611223344"
                    className="p-4 rounded-2xl border text-center space-y-1 hover:border-primary bg-card"
                    style={{ borderColor: "var(--border)" }}>
                    <Phone size={22} className="mx-auto text-primary" />
                    <div className="text-xs font-bold text-foreground">Call Hotline 24/7</div>
                    <div className="text-[10px] text-muted-foreground">09611-223344</div>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* ── VIEW 9: HARDWARE & ACCESSORIES STORE ── */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeSection === "store" && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                style={{
                  background: "linear-gradient(135deg, rgba(139,32,32,0.12) 0%, rgba(220,38,38,0.06) 100%)",
                  borderColor: "rgba(220,38,38,0.25)"
                }}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary text-white">
                      OFFICIAL ISP HARDWARE
                    </span>
                    <span className="text-xs text-muted-foreground">Doorstep Delivery & Field Technician Setup</span>
                  </div>
                  <h2 className="text-xl font-black text-foreground">Broadband Routers & Optical Hardware</h2>
                  <p className="text-xs text-muted-foreground max-w-xl">
                    Upgrade your home Wi-Fi with high-speed Gigabit Routers, Dual-Band ONUs, and Power Backup Mini UPS verified for MAA BEST NETWORK fiber optic lines.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-3 rounded-2xl bg-card border border-border text-center">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">MY ORDERS</p>
                    <p className="text-lg font-black text-primary font-mono">{customerOrders.length}</p>
                  </div>
                </div>
              </div>

              {/* Hardware Shelf & My Orders Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Product Catalog */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    {["all", "router", "onu", "ups", "cable", "accessories"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setStoreCategoryFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                          storeCategoryFilter === cat
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground"
                        }`}>
                        {cat === "all" ? "All Hardware" : cat === "router" ? "Wi-Fi Routers" : cat === "onu" ? "Optical ONUs" : cat === "ups" ? "Mini UPS" : cat}
                      </button>
                    ))}
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {storeProducts
                      .filter(p => storeCategoryFilter === "all" || p.category === storeCategoryFilter)
                      .map(product => {
                        const isOutOfStock = product.stock <= 0;
                        return (
                          <div
                            key={product.id}
                            className="p-4 rounded-3xl border border-border bg-card shadow-xs hover:border-primary transition-all flex flex-col justify-between space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-muted text-muted-foreground border border-border">
                                  {product.brand}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isOutOfStock ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-600"
                                }`}>
                                  {isOutOfStock ? "Out of Stock" : "In Stock"}
                                </span>
                              </div>

                              <h3 className="font-extrabold text-sm text-foreground leading-snug">{product.name}</h3>
                              <p className="text-[11px] text-muted-foreground line-clamp-2">{product.description}</p>
                              
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                                <span className="flex items-center gap-1"><ShieldCheck size={13} className="text-primary" /> {product.warrantyMonths} Months Warranty</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <div>
                                <span className="text-[10px] text-muted-foreground font-bold block">PRICE</span>
                                <span className="font-mono text-base font-black text-primary">
                                  ৳ {product.sellingPrice.toLocaleString()}
                                </span>
                              </div>

                              <button
                                disabled={isOutOfStock}
                                onClick={() => {
                                  setSelectedProductForOrder(product);
                                  setOrderQuantity(1);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all cursor-pointer shadow-xs">
                                <ShoppingBag size={13} /> Buy / Order
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Right Col: My Hardware Orders & Status Tracker */}
                <div className="p-5 rounded-3xl border border-border bg-card shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <h3 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                        <Truck size={16} className="text-primary" /> My Order Status
                      </h3>
                      <span className="text-[11px] text-muted-foreground font-bold">{customerOrders.length} Orders</span>
                    </div>

                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                      {customerOrders.length === 0 ? (
                        <div className="py-12 text-center text-xs text-muted-foreground space-y-1.5">
                          <ShoppingBag size={28} className="mx-auto opacity-30 text-primary" />
                          <p className="font-bold text-foreground">No Hardware Orders</p>
                          <p className="text-[11px]">Select a router or ONU from the store to place your first order.</p>
                        </div>
                      ) : (
                        customerOrders.map(ord => (
                          <div key={ord.id} className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-foreground">{ord.orderNumber}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                ord.orderStatus === "completed" || ord.orderStatus === "delivered" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                                ord.orderStatus === "processing" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                                "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              }`}>
                                {ord.orderStatus}
                              </span>
                            </div>

                            <div className="space-y-1 text-xs">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between font-bold text-foreground">
                                  <span className="truncate pr-2">{it.productName}</span>
                                  <span className="font-mono text-primary flex-shrink-0">×{it.quantity}</span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Total: <strong className="font-mono text-foreground">৳ {ord.total.toLocaleString()}</strong></span>
                              <span className="text-[11px] text-muted-foreground">{ord.createdAt}</span>
                            </div>

                            {/* Tracking progress step */}
                            <div className="p-2 rounded-xl bg-card border border-border/80 text-[11px] flex items-center gap-1.5 text-muted-foreground">
                              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                              <span>
                                {ord.orderStatus === "pending" && "Order received. Pending confirmation."}
                                {ord.orderStatus === "processing" && "Hardware being prepared in warehouse."}
                                {ord.orderStatus === "delivered" && "Delivered & verified by subscriber."}
                                {ord.orderStatus === "completed" && "Completed & warranty registered."}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                    <span>Free replacement warranty for hardware defects within 7 days.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* ── VIEW 8: MY CREDENTIALS & PROFILE ── */}
          {/* ────────────────────────────────────────────────────────── */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl border shadow-sm space-y-4" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <h2 className="text-xl font-black text-foreground">My Account & Credentials</h2>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-muted/40 border flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground">User ID</div>
                      <div className="font-mono font-bold text-foreground text-sm mt-0.5">{customer.id}</div>
                    </div>
                    <button onClick={() => copyToClipboard(customer.id, "p-id")} className="p-1.5 rounded-lg border bg-card">
                      {copiedKey === "p-id" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground">Default Portal Passcode</div>
                      <div className="font-mono font-bold text-foreground text-sm mt-0.5">{customer.passcode}</div>
                    </div>
                    <button onClick={() => copyToClipboard(customer.passcode, "p-pass")} className="p-1.5 rounded-lg border bg-card">
                      {copiedKey === "p-pass" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-muted/40 border flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground">PPPoE Username</div>
                      <div className="font-mono font-bold text-foreground text-sm mt-0.5">{customer.pppUser}</div>
                    </div>
                    <button onClick={() => copyToClipboard(customer.pppUser, "p-ppp")} className="p-1.5 rounded-lg border bg-card">
                      {copiedKey === "p-ppp" ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* ── 4. NATIVE MOBILE BOTTOM NAVIGATION BAR ── */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-lg flex items-center justify-around px-2 py-2"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {[
            { id: "overview" as const, label: "Home", icon: Home },
            { id: "bills" as const, label: "Pay Bill", icon: CreditCard, badge: customer.dueAmount > 0 },
            { id: "store" as const, label: "Store", icon: ShoppingBag },
            { id: "speed" as const, label: "Speed", icon: Gauge },
            { id: "profile" as const, label: "Account", icon: User },
          ].map(item => {
            const Icon = item.icon;
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                  isSelected ? "text-primary font-black scale-105" : "text-muted-foreground font-semibold"
                }`}>
                <Icon size={18} />
                <span className="text-[10px] mt-1">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-600" />
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── BKASH OFFICIAL CHECKOUT MODAL ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {showBkashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border flex flex-col"
            style={{ background: "#FFFFFF", borderColor: "rgba(0,0,0,0.1)", color: "#1E1E1E" }}>

            <div
              className="p-5 text-white flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #E2136E 0%, #B80F57 100%)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-[#E2136E] flex items-center justify-center font-black text-lg shadow-sm">
                  b
                </div>
                <div>
                  <div className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
                    bKash Payment <CheckCircle size={14} className="text-white" />
                  </div>
                  <div className="text-[11px] opacity-90">MAA BEST NETWORK (MBN Fiber)</div>
                </div>
              </div>
              <button onClick={() => setShowBkashModal(false)} className="p-1 rounded-full text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground">User ID: </span>
                <strong className="font-mono text-gray-900">{customer.id}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Amount: </span>
                <strong className="font-mono text-lg font-black text-[#E2136E]">
                  ৳{(customer.dueAmount > 0 ? customer.dueAmount : customer.price).toLocaleString()}
                </strong>
              </div>
            </div>

            {bkashStep === "phone" && (
              <div className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-gray-900">Enter bKash Account Number</h3>
                  <p className="text-xs text-gray-500">6-digit OTP will be sent to verify</p>
                </div>
                <input
                  type="text"
                  value={bkashPhone}
                  onChange={e => setBkashPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  maxLength={11}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none text-base font-mono font-bold text-gray-900 focus:border-[#E2136E]"
                />
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setShowBkashModal(false)} className="w-1/2 py-3 rounded-xl text-xs font-bold border text-gray-700">Cancel</button>
                  <button onClick={submitBkashPhone} className="w-1/2 py-3 rounded-xl text-xs font-bold text-white" style={{ background: "#E2136E" }}>Proceed →</button>
                </div>
              </div>
            )}

            {bkashStep === "otp" && (
              <div className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-gray-900">Enter 6-Digit OTP</h3>
                  <p className="text-xs text-gray-500">Code sent to <strong>{bkashPhone}</strong></p>
                </div>
                <input
                  type="text"
                  value={bkashOtp}
                  onChange={e => setBkashOtp(e.target.value)}
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none text-center text-xl font-mono font-bold text-gray-900 tracking-widest focus:border-[#E2136E]"
                />
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setBkashStep("phone")} className="w-1/2 py-3 rounded-xl text-xs font-bold border text-gray-700">Back</button>
                  <button onClick={submitBkashOtp} className="w-1/2 py-3 rounded-xl text-xs font-bold text-white" style={{ background: "#E2136E" }}>Verify →</button>
                </div>
              </div>
            )}

            {bkashStep === "pin" && (
              <div className="p-6 space-y-4">
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-gray-900">Enter Secret PIN</h3>
                  <p className="text-xs text-gray-500">Confirm payment with your 5-digit PIN</p>
                </div>
                <input
                  type="password"
                  value={bkashPin}
                  onChange={e => setBkashPin(e.target.value)}
                  maxLength={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none text-center text-2xl font-mono font-bold text-gray-900 tracking-widest focus:border-[#E2136E]"
                />
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setBkashStep("otp")} className="w-1/2 py-3 rounded-xl text-xs font-bold border text-gray-700">Back</button>
                  <button onClick={submitBkashPin} className="w-1/2 py-3 rounded-xl text-xs font-bold text-white" style={{ background: "#E2136E" }}>Confirm Payment</button>
                </div>
              </div>
            )}

            {bkashStep === "processing" && (
              <div className="p-10 text-center space-y-3">
                <RefreshCw size={36} className="mx-auto text-[#E2136E] animate-spin" />
                <h3 className="text-base font-bold text-gray-900">Confirming with bKash Gateway...</h3>
              </div>
            )}

            {bkashStep === "success" && lastPaymentResult && (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900">bKash Payment Successful!</h3>
                <div className="p-3.5 rounded-2xl bg-gray-50 border text-xs text-left space-y-2">
                  <div className="flex justify-between"><span className="text-gray-500">TrxID:</span><span className="font-mono font-bold">{lastPaymentResult.trxId}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Amount Paid:</span><span className="font-bold text-emerald-600">৳{lastPaymentResult.amount}.00</span></div>
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-gray-500">Activated From:</span>
                    <strong className="text-gray-900">{lastPaymentResult.startDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Valid Until:</span>
                    <strong className="text-rose-600 font-bold">{lastPaymentResult.endDate}</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 text-left flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                  <span>Your 30-day internet is now active from <strong>{lastPaymentResult.startDate}</strong> to <strong>{lastPaymentResult.endDate}</strong>!</span>
                </div>

                <button onClick={() => setShowBkashModal(false)} className="w-full py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 cursor-pointer">
                  Back to Dashboard
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── NOTIFICATION MODAL ── */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-card border shadow-2xl space-y-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-foreground">Notifications</h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-muted-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border flex items-start gap-2.5" style={{ borderColor: "var(--border)" }}>
                <Zap size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-foreground">Fiber GPON Active</div>
                  <div className="text-muted-foreground text-[11px]">Your {customer.downloadSpeedMbps} Mbps link is running optimally.</div>
                </div>
              </div>
              {customer.dueAmount > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
                  <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-foreground">Monthly Bill Due</div>
                    <div className="text-muted-foreground text-[11px]">৳{customer.dueAmount} due on {customer.endDate}.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RECEIPT MODAL ── */}
      {receiptInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl p-6 bg-card border shadow-2xl space-y-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="h-8 px-2 rounded-xl bg-white dark:bg-white/10 border border-rose-100 dark:border-white/10 flex items-center justify-center shadow-xs">
                  <img
                    src="/maabestnetwork.png"
                    alt="MAA BEST NETWORK"
                    className="h-5 max-w-[75px] object-contain"
                  />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-foreground">MAA BEST NETWORK</div>
                  <div className="text-[10px] text-muted-foreground">Digital Tax Receipt</div>
                </div>
              </div>
              <button onClick={() => setReceiptInvoice(null)}><X size={18} /></button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="text-muted-foreground">Invoice ID</span>
                <span className="font-mono font-bold">{receiptInvoice.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="text-muted-foreground">Subscriber</span>
                <span className="font-bold">{customer.name} ({customer.id})</span>
              </div>
              <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono font-black text-primary">৳{receiptInvoice.amount}.00</span>
              </div>
            </div>
            <button onClick={() => window.print()} className="w-full py-3 rounded-xl font-bold text-xs text-white bg-primary cursor-pointer">
              Print / Save PDF
            </button>
          </div>
        </div>
      )}

      {/* ── UPGRADE PLAN REQUEST CONFIRMATION MODAL ── */}
      {upgradeModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl p-6 bg-card border shadow-2xl space-y-5" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Request Plan Upgrade</h3>
                  <p className="text-[11px] text-muted-foreground">Admin verification & queue sync required</p>
                </div>
              </div>
              <button
                onClick={() => setUpgradeModalPlan(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-1" style={{ borderColor: "var(--border)" }}>
                <span className="text-[10px] font-bold uppercase text-muted-foreground">Current Plan</span>
                <div className="text-xs font-black text-foreground truncate">{customer.package}</div>
                <div className="text-sm font-mono font-bold text-muted-foreground">৳{customer.price.toLocaleString()}/mo</div>
                <div className="text-[10px] text-muted-foreground font-mono">{customer.downloadSpeedMbps}M Down / {customer.uploadSpeedMbps}M Up</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/30 space-y-1">
                <span className="text-[10px] font-bold uppercase text-primary">Requested Plan</span>
                <div className="text-xs font-black text-foreground truncate">{upgradeModalPlan.name}</div>
                <div className="text-sm font-mono font-bold text-primary">৳{upgradeModalPlan.price.toLocaleString()}/mo</div>
                <div className="text-[10px] text-primary font-mono">{upgradeModalPlan.speed} Mbps Fiber</div>
              </div>
            </div>

            {/* Billing Difference Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">Monthly Price Difference:</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                +৳{Math.max(0, upgradeModalPlan.price - customer.price).toLocaleString()} / month
              </span>
            </div>

            {/* Note Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Optional Message / Reason for Admin (optional):
              </label>
              <textarea
                value={upgradeNote}
                onChange={e => setUpgradeNote(e.target.value)}
                placeholder="e.g., Need higher bandwidth for work-from-home, gaming, or 4K TV..."
                rows={2}
                className="w-full p-3 rounded-xl border bg-muted/30 text-xs text-foreground outline-none resize-none focus:border-primary"
                style={{ borderColor: "var(--border)" }}
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <span>
                <strong>Notice:</strong> Your speed will NOT change automatically. A request is sent to the MAA BEST NETWORK Admin console. Once verified and approved, your MikroTik queue will be upgraded and you will receive an SMS notice.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUpgradeModalPlan(null)}
                className="w-1/2 py-3 rounded-xl font-bold text-xs border bg-card text-foreground hover:bg-muted cursor-pointer"
                style={{ borderColor: "var(--border)" }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUpgradeRequest}
                disabled={isSubmittingUpgrade}
                className="w-1/2 py-3 rounded-xl font-bold text-xs text-white bg-primary hover:opacity-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                {isSubmittingUpgrade ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Submit Request to Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOMER HARDWARE ORDER MODAL ── */}
      {selectedProductForOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-black text-base text-foreground flex items-center gap-2">
                <ShoppingBag size={18} className="text-primary" />
                Order Hardware for Home
              </h3>
              <button onClick={() => setSelectedProductForOrder(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCustomerPlaceOrder} className="space-y-3.5 text-xs">
              {/* Product Brief */}
              <div className="p-3 rounded-2xl bg-muted/30 border border-border space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">{selectedProductForOrder.name}</span>
                  <span className="font-mono font-black text-primary text-sm">৳ {selectedProductForOrder.sellingPrice.toLocaleString()}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{selectedProductForOrder.brand} · {selectedProductForOrder.model} · {selectedProductForOrder.warrantyMonths}M Warranty</p>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">QUANTITY</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    className="w-7 h-7 rounded-lg border border-border bg-card font-bold flex items-center justify-center">
                    -
                  </button>
                  <span className="w-6 text-center font-mono font-bold">{orderQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(Math.min(selectedProductForOrder.stock, orderQuantity + 1))}
                    className="w-7 h-7 rounded-lg border border-border bg-card font-bold flex items-center justify-center">
                    +
                  </button>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="font-bold text-muted-foreground block mb-1">DELIVERY / SETUP ADDRESS *</label>
                <textarea
                  rows={2}
                  required
                  value={orderDeliveryAddress}
                  onChange={e => setOrderDeliveryAddress(e.target.value)}
                  placeholder="House, Road, Apartment, Zone..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none resize-none"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="font-bold text-muted-foreground block mb-1.5">PAYMENT METHOD</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "bkash", label: "bKash Online", icon: Smartphone },
                    { id: "cash", label: "Cash on Delivery", icon: DollarSign },
                    { id: "on_bill", label: "Add to Next Bill", icon: FileText },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setOrderPaymentChoice(m.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        orderPaymentChoice === m.id
                          ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                          : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                      }`}>
                      <span className="text-[11px] block">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="font-bold text-muted-foreground block mb-1">SPECIAL INSTRUCTIONS (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="e.g. Please bring extra 5M CAT6 cable or configure SSID..."
                  value={orderCustomerNote}
                  onChange={e => setOrderCustomerNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground outline-none"
                />
              </div>

              {/* Total Calculation */}
              <div className="pt-2 border-t border-border flex items-center justify-between text-sm font-black text-foreground">
                <span>Total Amount:</span>
                <span className="font-mono text-primary text-base">
                  ৳ {(selectedProductForOrder.sellingPrice * orderQuantity).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductForOrder(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 cursor-pointer">
                  Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl bg-foreground text-background text-xs font-bold animate-slideUp">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}
