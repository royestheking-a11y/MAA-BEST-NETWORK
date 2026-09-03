import { useState, useMemo, useEffect } from "react";
import {
  User, Wifi, WifiOff, CreditCard, Package, MapPin, Phone, Mail,
  Shield, Server, Radio, Clock, CheckCircle2, AlertTriangle, XCircle,
  MessageSquare, BarChart3, TicketCheck, FileText, Activity,
  ChevronLeft, ChevronRight, MoreHorizontal, RefreshCw, Power,
  PowerOff, Edit3, Trash2, Send, Tag, Calendar, Gift, AlertCircle,
  ArrowUpRight, ArrowDownRight, Zap, Eye, Download, TrendingUp,
  Cpu, MemoryStick, Globe, Lock, Unlock, Plus, X, CheckCircle,
  Circle, Signal, Network, UserCheck, Wrench, ClipboardList,
  Star, Award, Copy, Check, ExternalLink, Sliders
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useCustomerContext } from "../context/CustomerContext";

const AVAILABLE_PACKAGES = [
  { id: "PKG-01", name: "5 Mbps Basic", down: 5, up: 2, price: 500, desc: "Economy home browsing & light streaming" },
  { id: "PKG-02", name: "10 Mbps Home", down: 10, up: 5, price: 800, desc: "Standard family browsing, HD video & social" },
  { id: "PKG-03", name: "15 Mbps Standard", down: 15, up: 8, price: 1000, desc: "HD streaming & smooth work-from-home" },
  { id: "PKG-04", name: "20 Mbps Fiber Standard", down: 20, up: 10, price: 1200, desc: "4K streaming, low latency & gaming" },
  { id: "PKG-05", name: "30 Mbps Home Fiber", down: 30, up: 15, price: 1500, desc: "Multi-device heavy home broadband" },
  { id: "PKG-06", name: "50 Mbps Ultra Fiber Pro", down: 50, up: 25, price: 2500, desc: "High-speed SME, office & studio line" },
  { id: "PKG-07", name: "100 Mbps Gigabit Fiber", down: 100, up: 50, price: 5000, desc: "Dedicated high priority fiber bandwidth" },
];

interface CustomerProfilePageProps {
  onNavigate?: (page: string) => void;
  customerId?: string;
}

type Tab = "overview" | "network" | "billing" | "payments" | "messages" | "usage" | "activity" | "tickets";

const initialCustomer = {
  id: "CUST-10293",
  name: "Rahim Uddin",
  phone: "01711-223344",
  altPhone: "01811-556677",
  email: "rahim@gmail.com",
  nid: "19821234567890",
  address: "Somitir Hat Bazar, Kalkini, Madaripur",
  zone: "Madaripur",
  subZone: "Kalkini Somitir Hat",
  area: "Somitir Hat Bazar",
  lat: "23.0641",
  lng: "90.2467",
  status: "active" as const,
  notes: "Reliable customer. Always pays on time. Prefers bKash.",
  createdAt: "12 Aug 2023",
  // Network
  pppoeUsername: "mbn_kalkini_01",
  pppoePassword: "••••••••",
  staticIP: "103.145.60.47",
  connectionType: "PPPoE",
  macAddress: "AA:BB:CC:DD:EE:01",
  mikrotik: "MikroTik-01 (Madaripur Core)",
  olt: "OLT-Madaripur-01",
  onu: "ONU-0802",
  onuMac: "00:1A:79:3C:12:AB",
  ponPort: "PON 1/1/4",
  onuModel: "Huawei HG8310M",
  onuSerial: "48575443B892A104",
  vlan: "VLAN-120",
  serviceProfile: "GPON-1G-Profile",
  rxPower: "-18.4 dBm",
  txPower: "2.1 dBm",
  distance: "1.24 km",
  currentStatus: "online" as const,
  uptime: "6d 14h 32m",
  // Billing
  package: "20 Mbps Fiber Standard",
  packagePrice: 1200,
  billingDate: 1,
  dueDate: 10,
  discount: 100,
  vat: 0,
  lateFee: 0,
  currentBalance: 0,
  previousDue: 0,
  lastPaidDate: "01 Aug 2026",
  lastPaidAmount: 1200,
};

const usageData = [
  { day: "Mon", upload: 2.4, download: 18.6 },
  { day: "Tue", upload: 3.1, download: 22.4 },
  { day: "Wed", upload: 1.8, download: 15.2 },
  { day: "Thu", upload: 4.2, download: 28.7 },
  { day: "Fri", upload: 5.6, download: 35.1 },
  { day: "Sat", upload: 6.8, download: 41.3 },
  { day: "Sun", upload: 4.1, download: 27.9 },
];

const paymentHistory = [
  { date: "01 Aug 2026", amount: 1200, method: "bKash", txn: "TX8832761", by: "Gateway", status: "verified" },
  { date: "01 Jul 2026", amount: 1200, method: "bKash", txn: "TX7744821", by: "Gateway", status: "verified" },
  { date: "01 Jun 2026", amount: 1200, method: "Cash", txn: "—", by: "Admin", status: "verified" },
  { date: "01 May 2026", amount: 1100, method: "Nagad", txn: "NG44029", by: "Gateway", status: "verified" },
  { date: "01 Apr 2026", amount: 1200, method: "bKash", txn: "TX5521389", by: "Gateway", status: "verified" },
  { date: "15 Mar 2026", amount: 200, method: "Cash", txn: "—", by: "Collector", status: "verified" },
];

const activityLog = [
  { time: "01 Aug 2026, 09:14", event: "Payment received ৳1,200 via bKash", type: "payment", icon: CreditCard, color: "#16A34A" },
  { time: "01 Aug 2026, 09:15", event: "Internet reconnected automatically", type: "network", icon: Wifi, color: "#2563EB" },
  { time: "10 Jul 2026, 00:00", event: "Auto-disconnected (due date passed)", type: "disconnect", icon: WifiOff, color: "#DC2626" },
  { time: "28 Jul 2026, 14:22", event: "SMS sent: bill reminder (3 days due)", type: "sms", icon: MessageSquare, color: "#D97706" },
  { time: "01 Jul 2026, 10:05", event: "Invoice #INV-4821 generated ৳1,200", type: "billing", icon: FileText, color: "#7C3AED" },
  { time: "15 Jun 2026, 16:40", event: "Package changed to 20 Mbps Fiber", type: "package", icon: Package, color: "#0891B2" },
  { time: "12 Aug 2023, 11:00", event: "Customer account created", type: "created", icon: UserCheck, color: "#8B2020" },
];

const tickets = [
  { id: "TKT-2241", subject: "Internet speed slow in evenings", priority: "medium", status: "resolved", created: "10 Jul 2026", resolved: "11 Jul 2026" },
  { id: "TKT-1882", subject: "Connection drops every 2 hours", priority: "high", status: "resolved", created: "22 Mar 2026", resolved: "23 Mar 2026" },
  { id: "TKT-0990", subject: "Request IP change", priority: "low", status: "resolved", created: "05 Jan 2026", resolved: "06 Jan 2026" },
];

const invoices = [
  { id: "INV-5021", period: "Aug 2026", amount: 1200, status: "paid", issued: "01 Aug 2026", paid: "01 Aug 2026" },
  { id: "INV-4821", period: "Jul 2026", amount: 1200, status: "paid", issued: "01 Jul 2026", paid: "01 Jul 2026" },
  { id: "INV-4608", period: "Jun 2026", amount: 1200, status: "paid", issued: "01 Jun 2026", paid: "02 Jun 2026" },
  { id: "INV-4394", period: "May 2026", amount: 1100, status: "paid", issued: "01 May 2026", paid: "01 May 2026" },
];

const messages = [
  { date: "01 Aug 2026", msg: "Dear Rahim, payment of ৳1,200 received. Internet activated. Thank you! — MAA BEST NETWORK", type: "auto" },
  { date: "28 Jul 2026", msg: "Dear Rahim, your bill of ৳1,200 is due on 10 Aug. Please pay on time to avoid disconnection. — MAA BEST NETWORK", type: "auto" },
  { date: "01 Jul 2026", msg: "Dear Rahim, payment of ৳1,200 received. Internet activated. Thank you! — MAA BEST NETWORK", type: "auto" },
  { date: "01 Jul 2026", msg: "Dear Rahim, invoice #INV-4821 for ৳1,200 has been generated for Jul 2026. — MAA BEST NETWORK", type: "auto" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "rgba(22,163,74,0.1)", text: "#16A34A", dot: "#16A34A" },
  online: { bg: "rgba(22,163,74,0.1)", text: "#16A34A", dot: "#16A34A" },
  offline: { bg: "rgba(107,114,128,0.1)", text: "#6B7280", dot: "#6B7280" },
  suspended: { bg: "rgba(217,119,6,0.1)", text: "#D97706", dot: "#D97706" },
  due: { bg: "rgba(220,38,38,0.1)", text: "#DC2626", dot: "#DC2626" },
  disconnected: { bg: "rgba(220,38,38,0.1)", text: "#DC2626", dot: "#DC2626" },
  paid: { bg: "rgba(22,163,74,0.1)", text: "#16A34A", dot: "#16A34A" },
  resolved: { bg: "rgba(22,163,74,0.1)", text: "#16A34A", dot: "#16A34A" },
  open: { bg: "rgba(220,38,38,0.1)", text: "#DC2626", dot: "#DC2626" },
  verified: { bg: "rgba(22,163,74,0.1)", text: "#16A34A", dot: "#16A34A" },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "#DC2626",
  medium: "#D97706",
  low: "#6B7280",
};

const inputStyle = {
  background: "var(--muted)",
  border: "1px solid var(--border)",
  fontSize: 13,
  color: "var(--foreground)",
};

export function CustomerProfilePage({ onNavigate, customerId }: CustomerProfilePageProps) {
  const { customers, activeCustomer } = useCustomerContext();

  const realCustomer = useMemo(() => {
    if (customerId) {
      const match = customers.find(c => c.id === customerId || c.clientCode === customerId || c.pppUser === customerId);
      if (match) return match;
    }
    if (activeCustomer) return activeCustomer;
    return customers[0] || null;
  }, [customerId, activeCustomer, customers]);

  const [customer, setCustomer] = useState(() => {
    const c = realCustomer || customers[0];
    if (!c) return initialCustomer;
    return {
      id: c.clientCode || c.id,
      name: c.name,
      phone: c.phone || "01711-223344",
      altPhone: c.phone2 || "—",
      email: c.email || `${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      nid: c.nidNo || "19821234567890",
      address: c.address || "Kalkini, Madaripur",
      zone: c.zone || "Madaripur",
      subZone: c.subzone || "Kalkini Somitir Hat",
      area: c.subzone || "Somitir Hat Bazar",
      lat: "23.0641",
      lng: "90.2467",
      status: (c.status === "active" ? "active" : "offline") as any,
      notes: c.remarks || "Reliable customer. Verified account.",
      createdAt: c.joinDate || "12 Aug 2023",
      pppoeUsername: c.pppUser || `mbn_${c.name.toLowerCase()}`,
      pppoePassword: c.pppPass || "••••••••",
      staticIP: c.ipAddress || "103.145.60.47",
      connectionType: "PPPoE",
      macAddress: c.mac || "4c:46:d1:55:08:25",
      mikrotik: c.mikrotik || "MikroTik-01 (Madaripur Core)",
      olt: c.olt || "OLT1",
      onu: c.deviceSerial || "ONU-0802",
      onuMac: c.mac || "4c:46:d1:55:08:25",
      ponPort: c.ponPort || "epon 0/1",
      onuModel: "BDCOM EPON ONU",
      onuSerial: c.deviceSerial || "BDCM7A1190BC",
      vlan: "VLAN-100",
      serviceProfile: "EPON-1G-Profile",
      rxPower: c.onuSignal || "-19.2 dBm",
      txPower: "2.1 dBm",
      distance: "1.24 km",
      currentStatus: (c.netStatus === "online" || c.status === "active" ? "online" : "offline") as any,
      uptime: c.sessionUptime || "6d 14h 32m",
      package: c.profile || "20 Mbps Fiber Standard",
      packagePrice: c.price || c.monthlyBill || 1200,
      billingDate: 1,
      dueDate: 10,
      discount: 0,
      vat: 0,
      lateFee: 0,
      currentBalance: c.dueAmount || 0,
      previousDue: 0,
      lastPaidDate: "01 Aug 2026",
      lastPaidAmount: c.price || c.monthlyBill || 1200,
    };
  });

  useEffect(() => {
    if (realCustomer) {
      setCustomer({
        id: realCustomer.clientCode || realCustomer.id,
        name: realCustomer.name,
        phone: realCustomer.phone || "01711-223344",
        altPhone: realCustomer.phone2 || "—",
        email: realCustomer.email || `${realCustomer.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
        nid: realCustomer.nidNo || "19821234567890",
        address: realCustomer.address || "Kalkini, Madaripur",
        zone: realCustomer.zone || "Madaripur",
        subZone: realCustomer.subzone || "Kalkini Somitir Hat",
        area: realCustomer.subzone || "Somitir Hat Bazar",
        lat: "23.0641",
        lng: "90.2467",
        status: (realCustomer.status === "active" ? "active" : "offline") as any,
        notes: realCustomer.remarks || "Reliable customer. Verified account.",
        createdAt: realCustomer.joinDate || "12 Aug 2023",
        pppoeUsername: realCustomer.pppUser || `mbn_${realCustomer.name.toLowerCase()}`,
        pppoePassword: realCustomer.pppPass || "••••••••",
        staticIP: realCustomer.ipAddress || "103.145.60.47",
        connectionType: "PPPoE",
        macAddress: realCustomer.mac || "4c:46:d1:55:08:25",
        mikrotik: realCustomer.mikrotik || "MikroTik-01 (Madaripur Core)",
        olt: realCustomer.olt || "OLT1",
        onu: realCustomer.deviceSerial || "ONU-0802",
        onuMac: realCustomer.mac || "4c:46:d1:55:08:25",
        ponPort: realCustomer.ponPort || "epon 0/1",
        onuModel: "BDCOM EPON ONU",
        onuSerial: realCustomer.deviceSerial || "BDCM7A1190BC",
        vlan: "VLAN-100",
        serviceProfile: "EPON-1G-Profile",
        rxPower: realCustomer.onuSignal || "-19.2 dBm",
        txPower: "2.1 dBm",
        distance: "1.24 km",
        currentStatus: (realCustomer.netStatus === "online" || realCustomer.status === "active" ? "online" : "offline") as any,
        uptime: realCustomer.sessionUptime || "6d 14h 32m",
        package: realCustomer.profile || "20 Mbps Fiber Standard",
        packagePrice: realCustomer.price || realCustomer.monthlyBill || 1200,
        billingDate: 1,
        dueDate: 10,
        discount: 0,
        vat: 0,
        lateFee: 0,
        currentBalance: realCustomer.dueAmount || 0,
        previousDue: 0,
        lastPaidDate: "01 Aug 2026",
        lastPaidAmount: realCustomer.price || realCustomer.monthlyBill || 1200,
      });
    }
  }, [realCustomer]);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [toast, setToast] = useState("");
  const [showActionModal, setShowActionModal] = useState<string | null>(null);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsText, setSmsText] = useState("");
  const [showScheduledPackage, setShowScheduledPackage] = useState(false);
  const [scheduledPkg, setScheduledPkg] = useState({ package: "30 Mbps Fiber Standard", date: "2026-09-01" });
  const [showGraceModal, setShowGraceModal] = useState(false);
  const [gracePeriod, setGracePeriod] = useState({ days: "3", reason: "" });

  // ── Package Change Modal State ──
  const [showChangePackageModal, setShowChangePackageModal] = useState(false);
  const [profileSelectedPkg, setProfileSelectedPkg] = useState(AVAILABLE_PACKAGES[3]);
  const [profileCustomPrice, setProfileCustomPrice] = useState("1200");
  const [profileApplyLive, setProfileApplyLive] = useState(true);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleApplyProfilePackageChange = () => {
    const finalPrice = Number(profileCustomPrice) || profileSelectedPkg.price;
    setCustomer(prev => ({
      ...prev,
      package: profileSelectedPkg.name,
      packagePrice: finalPrice,
    }));
    showToast(`✓ Package updated to ${profileSelectedPkg.name} (৳${finalPrice.toLocaleString()}/mo) for ${customer.name}`);
    setShowChangePackageModal(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: User },
    { id: "network", label: "Network", icon: Signal },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "payments", label: "Payments", icon: CheckCircle2 },
    { id: "messages", label: "SMS History", icon: MessageSquare },
    { id: "usage", label: "Usage", icon: BarChart3 },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "tickets", label: "Tickets", icon: TicketCheck },
  ];

  const actions = [
    { id: "enable", label: "Enable Internet", icon: Wifi, color: "#16A34A", desc: "Re-enable PPPoE connection" },
    { id: "disable", label: "Disable Internet", icon: WifiOff, color: "#DC2626", desc: "Temporarily suspend service" },
    { id: "suspend", label: "Suspend Account", icon: Lock, color: "#D97706", desc: "Suspend billing & network" },
    { id: "unsuspend", label: "Unsuspend", icon: Unlock, color: "#16A34A", desc: "Restore account" },
    { id: "change-package", label: "Change Package", icon: Package, color: "#2563EB", desc: "Assign new package" },
    { id: "schedule-package", label: "Schedule Package", icon: Calendar, color: "#7C3AED", desc: "Auto-change on future date" },
    { id: "grace-period", label: "Give Grace Period", icon: Gift, color: "#0891B2", desc: "Allow extra days to pay" },
    { id: "add-payment", label: "Add Payment", icon: CreditCard, color: "#16A34A", desc: "Record manual payment" },
    { id: "add-discount", label: "Add Discount", icon: Tag, color: "#0891B2", desc: "Apply bill discount" },
    { id: "add-penalty", label: "Add Penalty", icon: AlertTriangle, color: "#D97706", desc: "Apply late fee" },
    { id: "send-sms", label: "Send SMS", icon: MessageSquare, color: "#8B2020", desc: "Send manual SMS" },
    { id: "send-invoice", label: "Send Invoice", icon: FileText, color: "#7C3AED", desc: "Email or SMS invoice" },
    { id: "create-ticket", label: "Create Ticket", icon: TicketCheck, color: "#0891B2", desc: "Open support ticket" },
    { id: "add-note", label: "Add Note", icon: Edit3, color: "#6B7280", desc: "Add internal note" },
    { id: "change-ip", label: "Change IP", icon: Globe, color: "#2563EB", desc: "Assign new IP address" },
    { id: "mac-bind", label: "MAC Bind", icon: Cpu, color: "#D97706", desc: "Bind device MAC" },
    { id: "delete", label: "Delete Customer", icon: Trash2, color: "#DC2626", desc: "Permanently remove" },
  ];

  const handleAction = (id: string) => {
    if (id === "change-package") {
      const match = AVAILABLE_PACKAGES.find(p => p.name === customer.package) || AVAILABLE_PACKAGES[3];
      setProfileSelectedPkg(match);
      setProfileCustomPrice(String(customer.packagePrice || match.price));
      setShowChangePackageModal(true);
      setShowActionModal(null);
      return;
    }
    if (id === "send-sms") { setShowSmsModal(true); return; }
    if (id === "schedule-package") { setShowScheduledPackage(true); return; }
    if (id === "grace-period") { setShowGraceModal(true); return; }
    const action = actions.find(a => a.id === id);
    if (action) showToast(`✓ ${action.label} applied to ${customer.name}`);
    setShowActionModal(null);
  };

  const sc = STATUS_COLORS[customer.currentStatus] || STATUS_COLORS.offline;
  const sc2 = STATUS_COLORS[customer.status] || STATUS_COLORS.active;

  return (
    <div className="p-6" style={{ maxWidth: 1280 }}>
      {/* ── Back + Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => onNavigate?.("customers")}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: "var(--muted-foreground)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--primary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--muted-foreground)")}
        >
          <ChevronLeft size={16} /> All Customers
        </button>
        <span style={{ color: "var(--border)", fontSize: 16 }}>/</span>
        <span style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500 }}>{customer.id}</span>
      </div>

      {/* ── Customer Header Card ───────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 mb-5 border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div
              className="flex items-center justify-center rounded-2xl text-white font-bold text-xl flex-shrink-0"
              style={{ width: 64, height: 64, background: "linear-gradient(135deg, #8B2020 0%, #C43535 100%)" }}
            >
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
                  {customer.name}
                </h1>
                <span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: sc2.bg, color: sc2.text }}
                >
                  <Circle size={6} fill={sc2.dot} stroke="none" />
                  {customer.status.toUpperCase()}
                </span>
                <span
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: sc.bg, color: sc.text }}
                >
                  <Circle size={6} fill={sc.dot} stroke="none" />
                  {customer.currentStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1.5 flex-wrap" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                <span className="flex items-center gap-1.5"><Phone size={13} /> {customer.phone}</span>
                <span className="flex items-center gap-1.5"><Mail size={13} /> {customer.email}</span>
                <span className="flex items-center gap-1.5"><MapPin size={13} /> {customer.zone} — {customer.subZone}</span>
                <span className="flex items-center gap-1.5"><Calendar size={13} /> Member since {customer.createdAt}</span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-center px-4 py-2 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--muted)", minWidth: 80 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--primary)", fontFamily: "var(--font-display)" }}>৳1,200</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>MONTHLY BILL</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--muted)", minWidth: 80 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#16A34A", fontFamily: "var(--font-display)" }}>৳0</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>OUTSTANDING</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--muted)", minWidth: 80 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#2563EB", fontFamily: "var(--font-display)" }}>20M</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>PACKAGE</div>
            </div>
            <div className="text-center px-4 py-2 rounded-xl border" style={{ borderColor: "var(--border)", background: "var(--muted)", minWidth: 80 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#16A34A", fontFamily: "var(--font-display)" }}>36</div>
              <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>MONTHS</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap gap-2 mt-5 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
          {[
            { id: "enable", label: "Enable Internet", icon: Wifi, color: "#16A34A" },
            { id: "disable", label: "Disable", icon: WifiOff, color: "#DC2626" },
            { id: "add-payment", label: "Add Payment", icon: CreditCard, color: "#8B2020" },
            { id: "send-sms", label: "Send SMS", icon: MessageSquare, color: "#2563EB" },
            { id: "create-ticket", label: "Create Ticket", icon: TicketCheck, color: "#D97706" },
            { id: "schedule-package", label: "Schedule Package", icon: Calendar, color: "#7C3AED" },
            { id: "grace-period", label: "Grace Period", icon: Gift, color: "#0891B2" },
          ].map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => handleAction(a.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all"
                style={{ borderColor: "var(--border)", color: a.color, background: "var(--muted)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = `${a.color}15`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--muted)"; }}
              >
                <Icon size={13} /> {a.label}
              </button>
            );
          })}
          <button
            onClick={() => setShowActionModal("all")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)", background: "var(--muted)" }}
          >
            <MoreHorizontal size={13} /> More Actions
          </button>
        </div>

        {/* ── Subscriber Portal Credentials Strip ── */}
        <div
          className="mt-5 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ background: "rgba(139,32,32,0.04)", borderColor: "rgba(139,32,32,0.18)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
              <Lock size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Subscriber Portal Credentials</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Auto-Generated</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                <span>User ID: <strong className="font-mono text-foreground">{customer.id}</strong></span>
                <span>•</span>
                <span>Default Passcode: <strong className="font-mono text-foreground">{(customer as any).passcode || `mbn@${customer.id.replace(/\D/g, '') || "0001"}`}</strong></span>
                <span>•</span>
                <span>Portal: <strong className="text-foreground">portal.maabestnetwork.com</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`MAA BEST NETWORK Subscriber Login:\nPortal: portal.maabestnetwork.com\nUser ID: ${customer.id}\nPasscode: ${(customer as any).passcode || `mbn@${customer.id.replace(/\D/g, '') || "0001"}`}\nPackage: ${(customer as any).package || "20 Mbps"}`);
                showToast("Copied Subscriber Login Bundle to clipboard!");
              }}
              className="px-3 py-1.5 rounded-lg border text-xs font-semibold bg-card hover:bg-muted text-foreground flex items-center gap-1.5"
              style={{ borderColor: "var(--border)" }}>
              <Copy size={13} /> Copy Login Bundle
            </button>
            <button
              onClick={() => {
                onNavigate?.("customer-portal");
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary hover:opacity-95 shadow-sm flex items-center gap-1.5">
              <ExternalLink size={13} /> Open User Panel
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-5 overflow-x-auto scrollbar-thin">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: active ? "var(--primary)" : "var(--card)",
                color: active ? "#fff" : "var(--muted-foreground)",
                border: `1px solid ${active ? "transparent" : "var(--border)"}`,
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Customer Info */}
          <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
              <User size={15} style={{ color: "var(--primary)" }} /> Customer Information
            </h3>
            <div className="space-y-3">
              {[
                { label: "Customer ID", value: customer.id },
                { label: "Full Name", value: customer.name },
                { label: "Phone", value: customer.phone },
                { label: "Alternate Phone", value: customer.altPhone },
                { label: "Email", value: customer.email },
                { label: "NID Number", value: customer.nid },
                { label: "Zone", value: `${customer.zone} → ${customer.subZone} → ${customer.area}` },
                { label: "Address", value: customer.address },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-4">
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, minWidth: 130, flexShrink: 0 }}>
                    {row.label}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--foreground)", textAlign: "right", wordBreak: "break-word" }}>
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="pt-2 mt-2" style={{ borderTop: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>Notes</span>
                <p style={{ fontSize: 13, color: "var(--foreground)", marginTop: 4 }}>{customer.notes}</p>
              </div>
            </div>
          </div>

          {/* Status + Package */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
                  <Package size={15} style={{ color: "var(--primary)" }} /> Current Service
                </h3>
                <button
                  onClick={() => {
                    const match = AVAILABLE_PACKAGES.find(p => p.name === customer.package) || AVAILABLE_PACKAGES[3];
                    setProfileSelectedPkg(match);
                    setProfileCustomPrice(String(customer.packagePrice || match.price));
                    setShowChangePackageModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 flex items-center gap-1 shadow-sm cursor-pointer">
                  <Sliders size={12} /> Change Plan
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Package", value: customer.package, highlight: true },
                  { label: "Monthly Price", value: `৳${customer.packagePrice}` },
                  { label: "Billing Date", value: `Every ${customer.billingDate}st` },
                  { label: "Due Date", value: `${customer.dueDate}th of month` },
                  { label: "PPPoE Username", value: customer.pppoeUsername },
                  { label: "IP Address", value: customer.staticIP },
                  { label: "Connection", value: customer.connectionType },
                  { label: "Uptime", value: customer.uptime },
                ].map(row => (
                  <div key={row.label} className="flex items-start justify-between gap-4">
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, minWidth: 130, flexShrink: 0 }}>
                      {row.label}
                    </span>
                    <span style={{
                      fontSize: 13,
                      color: row.highlight ? "var(--primary)" : "var(--foreground)",
                      fontWeight: row.highlight ? 600 : 400,
                      textAlign: "right"
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Payment */}
            <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
                <CreditCard size={15} style={{ color: "var(--primary)" }} /> Last Payment
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{ width: 44, height: 44, background: "rgba(22,163,74,0.12)" }}
                >
                  <CheckCircle2 size={20} style={{ color: "#16A34A" }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#16A34A", fontFamily: "var(--font-display)" }}>
                    ৳{customer.lastPaidAmount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{customer.lastPaidDate} • bKash</div>
                </div>
              </div>
            </div>

            {/* Complaint Stats */}
            <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
                <Star size={15} style={{ color: "var(--primary)" }} /> CRM Health
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Tickets", value: "3", color: "var(--foreground)" },
                  { label: "Resolved", value: "3", color: "#16A34A" },
                  { label: "Avg Resolution", value: "1.2d", color: "#2563EB" },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "network" && (
        <div className="grid grid-cols-2 gap-5">
          <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
              <Server size={15} style={{ color: "var(--primary)" }} /> PPPoE / Network Config
            </h3>
            <div className="space-y-3">
              {[
                { label: "PPPoE Username", value: customer.pppoeUsername },
                { label: "PPPoE Password", value: customer.pppoePassword },
                { label: "Static IP", value: customer.staticIP },
                { label: "MAC Address", value: customer.macAddress },
                { label: "Connection Type", value: customer.connectionType },
                { label: "MikroTik", value: customer.mikrotik },
                { label: "VLAN", value: customer.vlan },
                { label: "Service Profile", value: customer.serviceProfile },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, minWidth: 130, flexShrink: 0 }}>{row.label}</span>
                  <span className="font-mono" style={{ fontSize: 12, color: "var(--foreground)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
                <Radio size={15} style={{ color: "var(--primary)" }} /> OLT / Fiber Details
              </h3>
              <div className="space-y-3">
                {[
                  { label: "OLT", value: customer.olt },
                  { label: "ONU ID", value: customer.onu },
                  { label: "ONU MAC", value: customer.onuMac },
                  { label: "PON Port", value: customer.ponPort },
                  { label: "RX Power", value: customer.rxPower },
                  { label: "TX Power", value: customer.txPower },
                  { label: "Distance", value: customer.distance },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between gap-4">
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600, minWidth: 130, flexShrink: 0 }}>{row.label}</span>
                    <span className="font-mono" style={{ fontSize: 12, color: "var(--foreground)" }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl p-4 border" style={{ background: "rgba(22,163,74,0.06)", borderColor: "rgba(22,163,74,0.2)" }}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: "#16A34A" }}></div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#16A34A" }}>Connection Online</div>
                  <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Uptime: {customer.uptime}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
                  <CreditCard size={15} style={{ color: "var(--primary)" }} /> Billing Summary
                </h3>
                <button
                  onClick={() => {
                    const match = AVAILABLE_PACKAGES.find(p => p.name === customer.package) || AVAILABLE_PACKAGES[3];
                    setProfileSelectedPkg(match);
                    setProfileCustomPrice(String(customer.packagePrice || match.price));
                    setShowChangePackageModal(true);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary text-white hover:opacity-90 flex items-center gap-1 shadow-sm cursor-pointer">
                  <Sliders size={12} /> Change Plan
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Package", value: customer.package, highlight: true },
                  { label: "Package Price", value: `৳${customer.packagePrice}` },
                  { label: "Discount", value: `- ৳${customer.discount}` },
                  { label: "VAT", value: customer.vat > 0 ? `+ ৳${customer.vat}` : "None" },
                  { label: "Late Fee", value: customer.lateFee > 0 ? `+ ৳${customer.lateFee}` : "None" },
                  { label: "Current Due", value: `৳${customer.packagePrice - customer.discount}`, highlight: true },
                  { label: "Previous Balance", value: `৳${customer.previousDue}` },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: row.highlight ? "var(--primary)" : "var(--foreground)", fontWeight: row.highlight ? 700 : 400 }}>{row.value}</span>
                  </div>
                ))}
                <div className="pt-3 mt-1 flex items-center justify-between font-bold" style={{ borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 14, color: "var(--foreground)" }}>Net Total</span>
                  <span style={{ fontSize: 18, color: "#16A34A", fontFamily: "var(--font-display)" }}>৳1,100</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
                <FileText size={15} style={{ color: "var(--primary)" }} /> Invoice History
              </h3>
              <div className="space-y-2">
                {invoices.map(inv => {
                  const sc = STATUS_COLORS[inv.status] || STATUS_COLORS.active;
                  return (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--muted)" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{inv.id}</div>
                        <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{inv.period} • Issued {inv.issued}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)", fontFamily: "var(--font-display)" }}>৳{inv.amount.toLocaleString()}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: sc.bg, color: sc.text }}>{inv.status}</span>
                        <button className="p-1 rounded" style={{ color: "var(--muted-foreground)" }}><Download size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="font-semibold flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
              <CreditCard size={15} style={{ color: "var(--primary)" }} /> Payment Ledger
            </h3>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "var(--primary)" }}
              onClick={() => showToast("Manual payment recorded!")}
            >
              <Plus size={13} /> Add Payment
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-left">Method</th>
                <th className="px-5 py-3 text-left">Transaction ID</th>
                <th className="px-5 py-3 text-left">By</th>
                <th className="px-5 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((p, i) => {
                const sc = STATUS_COLORS[p.status] || STATUS_COLORS.active;
                return (
                  <tr key={i} style={{ borderTop: "1px solid var(--border)", fontSize: 13 }}>
                    <td className="px-5 py-3.5" style={{ color: "var(--foreground)" }}>{p.date}</td>
                    <td className="px-5 py-3.5 text-right font-bold" style={{ color: "#16A34A", fontFamily: "var(--font-display)" }}>৳{p.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(139,32,32,0.1)", color: "var(--primary)" }}>{p.method}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{p.txn}</td>
                    <td className="px-5 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{p.by}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: sc.bg, color: sc.text }}>{p.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "messages" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
              <MessageSquare size={15} style={{ color: "var(--primary)" }} /> SMS / Message Log
            </h3>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "var(--primary)" }}
              onClick={() => setShowSmsModal(true)}
            >
              <Send size={13} /> Send SMS
            </button>
          </div>
          {messages.map((m, i) => (
            <div key={i} className="rounded-xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 32, height: 32, background: "rgba(139,32,32,0.1)" }}>
                  <MessageSquare size={14} style={{ color: "var(--primary)" }} />
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.6 }}>{m.msg}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{m.date}</span>
                    <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(139,32,32,0.1)", color: "var(--primary)" }}>
                      {m.type === "auto" ? "Automated" : "Manual"}
                    </span>
                    <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#16A34A" }}>
                      <CheckCircle2 size={11} /> Delivered
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "usage" && (
        <div className="space-y-5">
          <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
              <BarChart3 size={15} style={{ color: "var(--primary)" }} /> 7-Day Bandwidth Usage (GB)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={usageData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="download" name="Download" fill="#8B2020" radius={[4, 4, 0, 0]} />
                <Bar dataKey="upload" name="Upload" fill="rgba(139,32,32,0.3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "This Month Download", value: "189.2 GB", icon: ArrowDownRight, color: "#8B2020" },
              { label: "This Month Upload", value: "27.4 GB", icon: ArrowUpRight, color: "#2563EB" },
              { label: "Total Usage", value: "216.6 GB", icon: BarChart3, color: "#16A34A" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl p-4 border flex items-center gap-3" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                  <div className="rounded-xl flex items-center justify-center" style={{ width: 40, height: 40, background: `${s.color}15` }}>
                    <Icon size={18} style={{ color: s.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <h3 className="font-semibold mb-5 flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
            <Activity size={15} style={{ color: "var(--primary)" }} /> Customer Activity Timeline
          </h3>
          <div className="space-y-4 relative">
            <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: "var(--border)" }}></div>
            {activityLog.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-4 relative pl-12">
                  <div
                    className="absolute left-0 flex items-center justify-center rounded-full flex-shrink-0 z-10"
                    style={{ width: 36, height: 36, background: `${a.color}18`, border: `2px solid ${a.color}30` }}
                  >
                    <Icon size={15} style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 pb-4">
                    <div style={{ fontSize: 13, color: "var(--foreground)", fontWeight: 500 }}>{a.event}</div>
                    <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "tickets" && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <h3 className="font-semibold flex items-center gap-2" style={{ color: "var(--foreground)", fontSize: 14 }}>
              <TicketCheck size={15} style={{ color: "var(--primary)" }} /> Support Tickets
            </h3>
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: "var(--primary)" }}
              onClick={() => showToast("New ticket created!")}
            >
              <Plus size={13} /> New Ticket
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--muted)", fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <th className="px-5 py-3 text-left">Ticket ID</th>
                <th className="px-5 py-3 text-left">Subject</th>
                <th className="px-5 py-3 text-left">Priority</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Created</th>
                <th className="px-5 py-3 text-left">Resolved</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t, i) => {
                const sc = STATUS_COLORS[t.status] || STATUS_COLORS.active;
                return (
                  <tr key={i} style={{ borderTop: "1px solid var(--border)", fontSize: 13 }}>
                    <td className="px-5 py-3.5 font-mono font-semibold" style={{ color: "var(--primary)", fontSize: 12 }}>{t.id}</td>
                    <td className="px-5 py-3.5" style={{ color: "var(--foreground)" }}>{t.subject}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold capitalize" style={{ fontSize: 12, color: PRIORITY_COLORS[t.priority] }}>{t.priority}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: sc.bg, color: sc.text }}>{t.status}</span>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{t.created}</td>
                    <td className="px-5 py-3.5" style={{ color: "var(--muted-foreground)", fontSize: 12 }}>{t.resolved || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── More Actions Modal ─────────────────────────────────────────────── */}
      {showActionModal === "all" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-y-auto" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--foreground)" }}>
                Customer Actions
              </h2>
              <button onClick={() => setShowActionModal(null)} className="p-2 rounded-lg" style={{ color: "var(--muted-foreground)" }}>
                <X size={18} />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {actions.map(a => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.id}
                    onClick={() => handleAction(a.id)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left border transition-all"
                    style={{ borderColor: "var(--border)", background: "var(--muted)" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = `${a.color}10`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--muted)"; }}
                  >
                    <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, background: `${a.color}15` }}>
                      <Icon size={16} style={{ color: a.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{a.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── SMS Modal ─────────────────────────────────────────────────────── */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-md" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--foreground)" }}>Send SMS to {customer.name}</h2>
              <button onClick={() => setShowSmsModal(false)} className="p-2 rounded-lg" style={{ color: "var(--muted-foreground)" }}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>RECIPIENT</label>
                <input className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} value={customer.phone} readOnly />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>MESSAGE</label>
                <textarea
                  className="w-full px-3 py-2.5 rounded-xl outline-none resize-none"
                  style={{ ...inputStyle, minHeight: 100 }}
                  placeholder="Type your message..."
                  value={smsText}
                  onChange={e => setSmsText(e.target.value)}
                />
                <div className="flex justify-end mt-1" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{smsText.length}/160</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowSmsModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Cancel</button>
                <button
                  onClick={() => { setShowSmsModal(false); showToast(`SMS sent to ${customer.phone}`); setSmsText(""); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: "var(--primary)" }}
                >
                  <Send size={14} /> Send SMS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Schedule Package Modal ─────────────────────────────────────────── */}
      {showScheduledPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-md" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--foreground)" }}>Schedule Package Change</h2>
              <button onClick={() => setShowScheduledPackage(false)} className="p-2 rounded-lg" style={{ color: "var(--muted-foreground)" }}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-xl p-3" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--muted-foreground)", fontWeight: 600 }}>CURRENT PACKAGE</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginTop: 2 }}>{customer.package} — ৳{customer.packagePrice}/month</div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>NEW PACKAGE</label>
                <select className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle}
                  value={scheduledPkg.package} onChange={e => setScheduledPkg(p => ({ ...p, package: e.target.value }))}>
                  <option>10 Mbps Fiber — ৳800</option>
                  <option>20 Mbps Fiber — ৳1,200</option>
                  <option>30 Mbps Fiber — ৳1,600</option>
                  <option>50 Mbps Fiber — ৳2,000</option>
                  <option>100 Mbps Fiber — ৳3,500</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>EFFECTIVE DATE</label>
                <input type="date" className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle}
                  value={scheduledPkg.date} onChange={e => setScheduledPkg(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="rounded-xl p-3" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <p style={{ fontSize: 12, color: "#7C3AED" }}>
                  <strong>Auto-scheduled:</strong> Package will change automatically on {scheduledPkg.date}. No manual action required.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowScheduledPackage(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Cancel</button>
                <button
                  onClick={() => { setShowScheduledPackage(false); showToast(`Package scheduled → ${scheduledPkg.package} on ${scheduledPkg.date}`); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: "#7C3AED" }}
                >
                  <Calendar size={14} /> Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Grace Period Modal ─────────────────────────────────────────────── */}
      {showGraceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-md" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--foreground)" }}>Give Grace Period</h2>
              <button onClick={() => setShowGraceModal(false)} className="p-2 rounded-lg" style={{ color: "var(--muted-foreground)" }}><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>GRACE PERIOD (DAYS)</label>
                <input type="number" min="1" max="30" className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={inputStyle} value={gracePeriod.days} onChange={e => setGracePeriod(p => ({ ...p, days: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>REASON</label>
                <textarea className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ ...inputStyle, minHeight: 80 }}
                  placeholder="e.g. Customer committed to pay by Friday" value={gracePeriod.reason}
                  onChange={e => setGracePeriod(p => ({ ...p, reason: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowGraceModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Cancel</button>
                <button
                  onClick={() => { setShowGraceModal(false); showToast(`Grace period of ${gracePeriod.days} days granted to ${customer.name}`); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: "#0891B2" }}
                >
                  <Gift size={14} /> Grant Grace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Package Modal ─────────────────────────────────────────── */}
      {showChangePackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setShowChangePackageModal(false)}>
          <div
            className="rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border flex flex-col max-h-[90vh] bg-card"
            style={{ borderColor: "var(--border)" }}
            onClick={e => e.stopPropagation()}>
            
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Sliders size={20} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--foreground)" }}>Change Subscription Package</h2>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Modifying line for <strong>{customer.name}</strong> ({customer.id})</p>
                </div>
              </div>
              <button onClick={() => setShowChangePackageModal(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>

            <div className="p-4 bg-muted/40 border-b flex items-center justify-between gap-4 text-xs" style={{ borderColor: "var(--border)" }}>
              <div>
                <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">Current Package</span>
                <span className="font-bold text-foreground">{customer.package}</span>
                <span className="text-muted-foreground block text-[11px] font-mono">৳{customer.packagePrice}/mo</span>
              </div>
              <div className="text-primary font-bold text-sm">→</div>
              <div className="text-right">
                <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">New Selected Plan</span>
                <span className="font-bold text-primary">{profileSelectedPkg.name}</span>
                <span className="text-emerald-600 block text-[11px] font-mono font-bold">৳{profileCustomPrice || profileSelectedPkg.price}/mo · {profileSelectedPkg.down}M Down</span>
              </div>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wider text-muted-foreground">Select New Package Plan</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_PACKAGES.map(pkg => {
                    const isSelected = profileSelectedPkg.id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => {
                          setProfileSelectedPkg(pkg);
                          setProfileCustomPrice(String(pkg.price));
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? "bg-rose-50/80 border-rose-400 dark:bg-rose-950/40 dark:border-rose-700 shadow-sm ring-1 ring-rose-400"
                            : "bg-card border-border hover:border-muted-foreground/40"
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-foreground">{pkg.name}</span>
                          <span className="font-mono font-black text-xs text-primary">৳{pkg.price}</span>
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                          <Zap size={11} className="text-primary" />
                          <span>{pkg.down}M Down / {pkg.up}M Up</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{pkg.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 uppercase tracking-wider text-muted-foreground">Monthly Fee Override (৳)</label>
                <input
                  type="number"
                  value={profileCustomPrice}
                  onChange={e => setProfileCustomPrice(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border bg-muted/40 outline-none text-sm font-mono font-bold text-foreground"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-2 text-xs" style={{ borderColor: "var(--border)" }}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileApplyLive}
                    onChange={e => setProfileApplyLive(e.target.checked)}
                    className="rounded text-primary"
                  />
                  <span className="text-foreground font-medium">Apply immediately & sync MikroTik queue rate-limit</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t flex gap-3 bg-muted/20" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={() => setShowChangePackageModal(false)}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs border bg-card text-foreground hover:bg-muted">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyProfilePackageChange}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:opacity-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                <Check size={14} />
                <span>Confirm & Apply Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
