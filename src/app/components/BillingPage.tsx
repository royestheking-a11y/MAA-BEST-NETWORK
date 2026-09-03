import { useState, useEffect } from "react";
import {
  FileText, CreditCard, Package, Tag, Settings, Search, Plus, Download,
  CheckCircle2, Clock, AlertTriangle, XCircle, Eye, Send, Printer, X,
  Filter, Edit2, Trash2, RefreshCw, Smartphone, Building2, ShieldAlert,
  Sparkles, Check, ChevronRight, DollarSign, Calendar, Percent, QrCode,
  Sliders, Layers, Save, ExternalLink, Zap, Copy, AlertCircle, Radio,
  Lock, Key, Bell, Globe, ArrowUpRight, CheckSquare, Square
} from "lucide-react";

export type BillTab = "invoices" | "payments" | "packages" | "discounts" | "billing-settings";

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface Invoice {
  id: string;
  customer: string;
  custId: string;
  phone: string;
  zone: string;
  pkgName: string;
  subtotal: number;
  vat: number;
  discount: number;
  amount: number;
  period: string;
  issued: string;
  due: string;
  status: "paid" | "pending" | "overdue" | "cancelled";
  method: string | null;
  paidAt?: string;
  trxId?: string;
}

interface Payment {
  id: string;
  customer: string;
  custId: string;
  invoice: string;
  amount: number;
  method: "bKash" | "Nagad" | "Bank" | "Cash" | "SSLCommerz" | "Rocket";
  txn: string;
  date: string;
  time: string;
  addedBy: string;
  channel: string;
  status: "verified" | "pending" | "refunded";
  notes?: string;
}

interface IspPackage {
  id: string;
  name: string;
  down: number;
  up: number;
  price: number;
  type: "PPPoE" | "Static IP" | "DHCP" | "Hotspot" | "Corporate Lease";
  customers: number;
  margin: number;
  mikrotikProfile: string;
  burstLimit: string;
  fupLimit: string;
  status: "active" | "archived";
}

interface DiscountRule {
  id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  scope: "all" | "new_customers" | "resellers" | "specific_pkg" | "annual_plan";
  minPackageSpeed?: number;
  durationMonths: number;
  usageCount: number;
  maxUsage: number;
  validUntil: string;
  status: "active" | "expired" | "paused";
}

interface CustomerAdjustment {
  id: string;
  customer: string;
  custId: string;
  type: "waiver" | "promotional" | "goodwill" | "late_fee" | "reconnection_charge";
  nature: "discount" | "penalty";
  amount: number;
  reason: string;
  ticketId?: string;
  approvedBy: string;
  date: string;
  status: "applied" | "reverted";
}

// ─── Initial Mock Data ───────────────────────────────────────────────────────

const INITIAL_INVOICES: Invoice[] = [
  { id: "INV-10204", customer: "Rahim Uddin", custId: "CUST-10001", phone: "01711-234567", zone: "Dhanmondi-01", pkgName: "20 Mbps Plus", subtotal: 1142, vat: 58, discount: 0, amount: 1200, period: "Aug 2026", issued: "01 Aug 2026", due: "05 Aug 2026", status: "paid", method: "bKash", paidAt: "03 Aug 2026", trxId: "BKH8821291" },
  { id: "INV-10203", customer: "Nasrin Begum", custId: "CUST-10003", phone: "01819-876543", zone: "Gulshan-02", pkgName: "30 Mbps Pro", subtotal: 1428, vat: 72, discount: 0, amount: 1500, period: "Aug 2026", issued: "01 Aug 2026", due: "10 Aug 2026", status: "overdue", method: null },
  { id: "INV-10202", customer: "Jamal Uddin", custId: "CUST-10004", phone: "01912-349812", zone: "Mirpur-10", pkgName: "50 Mbps Business", subtotal: 2380, vat: 120, discount: 0, amount: 2500, period: "Aug 2026", issued: "01 Aug 2026", due: "15 Aug 2026", status: "pending", method: null },
  { id: "INV-10201", customer: "Fatema Begum", custId: "CUST-10005", phone: "01722-998811", zone: "Banani-03", pkgName: "100 Mbps Enterprise", subtotal: 4761, vat: 239, discount: 0, amount: 5000, period: "Aug 2026", issued: "01 Aug 2026", due: "20 Aug 2026", status: "paid", method: "Bank", paidAt: "02 Aug 2026", trxId: "BNK0038812" },
  { id: "INV-10200", customer: "Karim Hossain", custId: "CUST-10002", phone: "01611-554433", zone: "Uttara-Sec4", pkgName: "10 Mbps Home", subtotal: 762, vat: 38, discount: 0, amount: 800, period: "Aug 2026", issued: "01 Aug 2026", due: "05 Aug 2026", status: "overdue", method: null },
  { id: "INV-10199", customer: "Monir Ahmed", custId: "CUST-10009", phone: "01812-771122", zone: "Mohammadpur", pkgName: "20 Mbps Plus", subtotal: 1142, vat: 58, discount: 0, amount: 1200, period: "Aug 2026", issued: "01 Aug 2026", due: "18 Aug 2026", status: "pending", method: null },
  { id: "INV-10198", customer: "Shirin Akter", custId: "CUST-10010", phone: "01933-221100", zone: "Mirpur-12", pkgName: "15 Mbps Standard", subtotal: 952, vat: 48, discount: 0, amount: 1000, period: "Aug 2026", issued: "01 Aug 2026", due: "05 Aug 2026", status: "overdue", method: null },
  { id: "INV-10197", customer: "Delwar Hossain", custId: "CUST-10008", phone: "01755-443322", zone: "Badda-Link", pkgName: "30 Mbps Pro", subtotal: 1428, vat: 72, discount: 0, amount: 1500, period: "Aug 2026", issued: "01 Aug 2026", due: "12 Aug 2026", status: "paid", method: "Nagad", paidAt: "02 Aug 2026", trxId: "NGD7723190" },
  { id: "INV-10196", customer: "Abul Kalam", custId: "CUST-10014", phone: "01788-990011", zone: "Bashundhara R/A", pkgName: "50 Mbps Business", subtotal: 2380, vat: 120, discount: 200, amount: 2300, period: "Aug 2026", issued: "01 Aug 2026", due: "08 Aug 2026", status: "paid", method: "bKash", paidAt: "04 Aug 2026", trxId: "BKH9932145" },
];

const INITIAL_PAYMENTS: Payment[] = [
  { id: "PAY-88312", customer: "Rahim Uddin", custId: "CUST-10001", invoice: "INV-10204", amount: 1200, method: "bKash", txn: "BKH8821291", date: "03 Aug 2026", time: "11:42 AM", addedBy: "bKash IPN Gateway", channel: "Merchant Checkout", status: "verified", notes: "Auto-reconciled via webhook" },
  { id: "PAY-88311", customer: "Fatema Begum", custId: "CUST-10005", invoice: "INV-10201", amount: 5000, method: "Bank", txn: "BNK0038812", date: "02 Aug 2026", time: "02:15 PM", addedBy: "Admin — Farhana", channel: "Dutch-Bangla Bank Acc", status: "verified", notes: "BEFTN wire verified with bank statement" },
  { id: "PAY-88310", customer: "Delwar Hossain", custId: "CUST-10008", invoice: "INV-10197", amount: 1500, method: "Nagad", txn: "NGD7723190", date: "02 Aug 2026", time: "10:08 AM", addedBy: "Nagad Gateway", channel: "App Direct Payment", status: "verified", notes: "Verified online" },
  { id: "PAY-88309", customer: "Monir Ahmed", custId: "CUST-10009", invoice: "INV-10199", amount: 600, method: "Cash", txn: "CSH-20260801-09", date: "01 Aug 2026", time: "04:30 PM", addedBy: "Collector-01 (Rafiq)", channel: "Field Collection Booth", status: "verified", notes: "Part payment collected with receipt booklet #44" },
  { id: "PAY-88308", customer: "Nasrin Begum", custId: "CUST-10003", invoice: "INV-10203", amount: 750, method: "bKash", txn: "BKH8819004", date: "01 Aug 2026", time: "09:00 AM", addedBy: "Gateway", channel: "Merchant Checkout", status: "pending", notes: "Awaiting bank settlement confirmation" },
  { id: "PAY-88307", customer: "Abul Kalam", custId: "CUST-10014", invoice: "INV-10196", amount: 2300, method: "bKash", txn: "BKH9932145", date: "04 Aug 2026", time: "03:12 PM", addedBy: "bKash IPN Gateway", channel: "Merchant Checkout", status: "verified", notes: "Full payment with promo applied" },
  { id: "PAY-88306", customer: "Tanvir Hasan", custId: "CUST-10022", invoice: "INV-10188", amount: 1200, method: "SSLCommerz", txn: "SSL9912048", date: "31 Jul 2026", time: "06:45 PM", addedBy: "SSLCommerz IPN", channel: "Visa / Mastercard", status: "verified", notes: "Automated card payment" },
];

const INITIAL_PACKAGES: IspPackage[] = [
  { id: "PKG-01", name: "5 Mbps Basic", down: 5, up: 2, price: 500, type: "PPPoE", customers: 842, margin: 72, mikrotikProfile: "profile-5M-2M", burstLimit: "8M/4M 10s", fupLimit: "Unlimited", status: "active" },
  { id: "PKG-02", name: "10 Mbps Home", down: 10, up: 5, price: 800, type: "PPPoE", customers: 3840, margin: 78, mikrotikProfile: "profile-10M-5M", burstLimit: "15M/8M 15s", fupLimit: "Unlimited", status: "active" },
  { id: "PKG-03", name: "15 Mbps Standard", down: 15, up: 8, price: 1000, type: "PPPoE", customers: 2120, margin: 80, mikrotikProfile: "profile-15M-8M", burstLimit: "20M/10M 20s", fupLimit: "Unlimited", status: "active" },
  { id: "PKG-04", name: "20 Mbps Plus", down: 20, up: 10, price: 1200, type: "PPPoE", customers: 3280, margin: 82, mikrotikProfile: "profile-20M-10M", burstLimit: "30M/15M 20s", fupLimit: "Unlimited", status: "active" },
  { id: "PKG-05", name: "30 Mbps Pro", down: 30, up: 15, price: 1500, type: "PPPoE", customers: 1440, margin: 80, mikrotikProfile: "profile-30M-15M", burstLimit: "45M/25M 30s", fupLimit: "Unlimited", status: "active" },
  { id: "PKG-06", name: "50 Mbps Business", down: 50, up: 25, price: 2500, type: "PPPoE", customers: 820, margin: 76, mikrotikProfile: "profile-50M-25M", burstLimit: "70M/35M 30s", fupLimit: "Unlimited", status: "active" },
  { id: "PKG-07", name: "100 Mbps Enterprise", down: 100, up: 50, price: 5000, type: "Corporate Lease", customers: 324, margin: 74, mikrotikProfile: "profile-100M-50M-corp", burstLimit: "No Burst", fupLimit: "Dedicated 1:1", status: "active" },
  { id: "PKG-08", name: "Hotspot 1-Day Pass", down: 5, up: 5, price: 20, type: "Hotspot", customers: 174, margin: 65, mikrotikProfile: "hotspot-1day-pass", burstLimit: "No Burst", fupLimit: "10 GB", status: "active" },
];

const INITIAL_DISCOUNT_RULES: DiscountRule[] = [
  { id: "DISC-101", code: "SUMMER2026", name: "Summer Speed Boost", type: "percentage", value: 15, scope: "specific_pkg", minPackageSpeed: 20, durationMonths: 3, usageCount: 248, maxUsage: 500, validUntil: "31 Aug 2026", status: "active" },
  { id: "DISC-102", code: "NEWFIBER100", name: "New Fiber Subscriber Offer", type: "fixed", value: 100, scope: "new_customers", durationMonths: 2, usageCount: 412, maxUsage: 1000, validUntil: "31 Dec 2026", status: "active" },
  { id: "DISC-103", code: "ANNUALPAY20", name: "Annual Advance Payment Discount", type: "percentage", value: 20, scope: "annual_plan", durationMonths: 12, usageCount: 89, maxUsage: 200, validUntil: "31 Dec 2026", status: "active" },
  { id: "DISC-104", code: "CORPVIP10", name: "Corporate Volume Tier", type: "percentage", value: 10, scope: "resellers", durationMonths: 6, usageCount: 34, maxUsage: 100, validUntil: "15 Oct 2026", status: "active" },
  { id: "DISC-105", code: "REFERFRIEND", name: "Referral Bonus Credit", type: "fixed", value: 200, scope: "all", durationMonths: 1, usageCount: 165, maxUsage: 500, validUntil: "30 Sep 2026", status: "active" },
];

const INITIAL_ADJUSTMENTS: CustomerAdjustment[] = [
  { id: "ADJ-501", customer: "Abul Kalam", custId: "CUST-10014", type: "promotional", nature: "discount", amount: 200, reason: "Special campaign discount applied for 50 Mbps upgrade", ticketId: "TCK-4421", approvedBy: "Admin", date: "01 Aug 2026", status: "applied" },
  { id: "ADJ-502", customer: "Nasrin Begum", custId: "CUST-10003", type: "late_fee", nature: "penalty", amount: 50, reason: "Invoice overdue past 5-day grace period", approvedBy: "System Automation", date: "06 Aug 2026", status: "applied" },
  { id: "ADJ-503", customer: "Karim Hossain", custId: "CUST-10002", type: "reconnection_charge", nature: "penalty", amount: 150, reason: "Line reconnection fee after auto-suspension", approvedBy: "System Automation", date: "07 Aug 2026", status: "applied" },
  { id: "ADJ-504", customer: "Shakil Chowdhury", custId: "CUST-10045", type: "waiver", nature: "discount", amount: 300, reason: "Fiber cut outage compensation for 24h disruption in Zone-04", ticketId: "TCK-4190", approvedBy: "Billing Manager", date: "29 Jul 2026", status: "applied" },
];

const invStatusConfig: Record<string, { bg: string; color: string; label: string; icon: React.ElementType }> = {
  paid: { bg: "#DCFCE7", color: "#16A34A", label: "Paid", icon: CheckCircle2 },
  pending: { bg: "#DBEAFE", color: "#2563EB", label: "Pending", icon: Clock },
  overdue: { bg: "#FEE2E2", color: "#DC2626", label: "Overdue", icon: AlertTriangle },
  cancelled: { bg: "#F3F4F6", color: "#6B7280", label: "Cancelled", icon: XCircle },
};

function exportCSV(invoices: Invoice[]) {
  const headers = ["Invoice ID", "Customer", "Customer ID", "Phone", "Zone", "Package", "Subtotal", "VAT (5%)", "Discount", "Net Amount", "Period", "Issued", "Due Date", "Status", "Method", "Trx ID"];
  const rows = invoices.map(i => [
    i.id, i.customer, i.custId, i.phone, i.zone, i.pkgName,
    i.subtotal, i.vat, i.discount, i.amount, i.period, i.issued, i.due,
    i.status, i.method ?? "—", i.trxId ?? "—"
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `ISP_Invoices_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function exportPaymentsCSV(payments: Payment[]) {
  const headers = ["Payment ID", "Customer", "Customer ID", "Invoice Ref", "Amount", "Method", "Txn ID", "Date", "Time", "Added By", "Channel", "Status"];
  const rows = payments.map(p => [
    p.id, p.customer, p.custId, p.invoice, p.amount, p.method, p.txn, p.date, p.time, p.addedBy, p.channel, p.status
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `ISP_Payments_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ─── Main BillingPage Component ─────────────────────────────────────────────

export function BillingPage({ initialTab = "invoices" }: { initialTab?: BillTab }) {
  const [tab, setTab] = useState<BillTab>(initialTab);

  // Keep internal tab in sync if user clicked a sidebar link
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  // Common UI states
  const [toast, setToast] = useState("");
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // Data states
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [packagesList, setPackagesList] = useState<IspPackage[]>(INITIAL_PACKAGES);
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>(INITIAL_DISCOUNT_RULES);
  const [adjustments, setAdjustments] = useState<CustomerAdjustment[]>(INITIAL_ADJUSTMENTS);

  // Invoices Tab state
  const [invSearch, setInvSearch] = useState("");
  const [invStatusFilter, setInvStatusFilter] = useState<"all" | "paid" | "pending" | "overdue" | "cancelled">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newInv, setNewInv] = useState({
    customer: "", custId: "", phone: "", zone: "Dhanmondi-01", pkgName: "20 Mbps Plus",
    amount: "1200", period: "Aug 2026", due: "10 Aug 2026", discount: "0", applyVat: true
  });

  // Payments Tab state
  const [paySearch, setPaySearch] = useState("");
  const [payMethodFilter, setPayMethodFilter] = useState<string>("all");
  const [payStatusFilter, setPayStatusFilter] = useState<string>("all");
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [newPay, setNewPay] = useState({
    customer: "Rahim Uddin", custId: "CUST-10001", invoice: "INV-10204", amount: "1200",
    method: "bKash" as Payment["method"], txn: "", channel: "Merchant Checkout",
    collector: "Admin User", sendSms: true, notes: ""
  });

  // Packages Tab state
  const [pkgSearch, setPkgSearch] = useState("");
  const [pkgTypeFilter, setPkgTypeFilter] = useState<string>("all");
  const [pkgViewMode, setPkgViewMode] = useState<"grid" | "table">("grid");
  const [showNewPackage, setShowNewPackage] = useState(false);
  const [editingPkg, setEditingPkg] = useState<IspPackage | null>(null);
  const [newPkg, setNewPkg] = useState({
    name: "", down: "20", up: "10", price: "1200", type: "PPPoE" as IspPackage["type"],
    mikrotikProfile: "profile-20M-10M", burstLimit: "30M/15M 20s", fupLimit: "Unlimited"
  });

  // Discounts Tab state
  const [discSubTab, setDiscSubTab] = useState<"coupons" | "policies" | "adjustments">("coupons");
  const [showNewPromo, setShowNewPromo] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "", name: "", type: "percentage" as "percentage" | "fixed", value: "15",
    scope: "all" as DiscountRule["scope"], durationMonths: "3", maxUsage: "200", validUntil: "31 Dec 2026"
  });
  const [showNewAdjustment, setShowNewAdjustment] = useState(false);
  const [newAdj, setNewAdj] = useState({
    customer: "", custId: "", type: "waiver" as CustomerAdjustment["type"],
    nature: "discount" as "discount" | "penalty", amount: "", reason: "", ticketId: ""
  });
  const [penaltyPolicies, setPenaltyPolicies] = useState({
    graceDays: 5,
    lateFeeType: "fixed", // fixed or percentage
    lateFeeAmount: 50,
    reconnectFee: 150,
    autoBlockAfterGrace: true,
    autoLateFeeApply: true,
    smsReminderDaysBefore: 3,
  });

  // Billing Settings state
  const [billingSettings, setBillingSettings] = useState({
    billingCycleType: "calendar_month",
    autoGenerateDate: "1st of every month",
    dueDaysOffset: 10,
    vatEnabled: true,
    vatRate: 5,
    vatBin: "BIN-002918274-0102",
    priceTaxInclusive: true,
    invoicePrefix: "INV-",
    receiptPrefix: "REC-",
    nextSequence: "10205",
    companyName: "MAA BEST NETWORK Broadband Ltd.",
    companyPhone: "+880 9611-223344",
    companyEmail: "billing@maabestnetwork.com",
    companyAddress: "Holding 12, Main Road, Block B, Dhaka, Bangladesh",
    bkashLive: true,
    bkashMerchantId: "01700998877",
    bkashAppKey: "bkash_live_k99214a8x",
    bkashAppSecret: "••••••••••••••••••••••••",
    nagadLive: true,
    nagadMerchantId: "6829104",
    sslCommerzLive: false,
    sslStoreId: "ispbd_live_01",
    sendSmsOnGenerate: true,
    sendSmsOnDue: true,
    sendSmsOnPaid: true,
    autoDisconnectOnMikrotik: true,
    mikrotikAddressList: "blocked_unpaid_users",
  });

  // ─── Filtered Data ──────────────────────────────────────────────────────────

  const filteredInvoices = invoices.filter(inv => {
    const q = invSearch.toLowerCase();
    const matchSearch = !invSearch ||
      inv.id.toLowerCase().includes(q) ||
      inv.customer.toLowerCase().includes(q) ||
      inv.custId.toLowerCase().includes(q) ||
      inv.phone.includes(q) ||
      inv.zone.toLowerCase().includes(q);
    const matchStatus = invStatusFilter === "all" || inv.status === invStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredPayments = payments.filter(pay => {
    const q = paySearch.toLowerCase();
    const matchSearch = !paySearch ||
      pay.id.toLowerCase().includes(q) ||
      pay.customer.toLowerCase().includes(q) ||
      pay.custId.toLowerCase().includes(q) ||
      pay.txn.toLowerCase().includes(q) ||
      pay.invoice.toLowerCase().includes(q);
    const matchMethod = payMethodFilter === "all" || pay.method === payMethodFilter;
    const matchStatus = payStatusFilter === "all" || pay.status === payStatusFilter;
    return matchSearch && matchMethod && matchStatus;
  });

  const filteredPackages = packagesList.filter(pkg => {
    const q = pkgSearch.toLowerCase();
    const matchSearch = !pkgSearch || pkg.name.toLowerCase().includes(q) || pkg.mikrotikProfile.toLowerCase().includes(q);
    const matchType = pkgTypeFilter === "all" || pkg.type === pkgTypeFilter;
    return matchSearch && matchType;
  });

  // ─── Actions & Handlers ─────────────────────────────────────────────────────

  const handleCreateInvoice = () => {
    if (!newInv.customer || !newInv.amount) return;
    const sub = Number(newInv.amount);
    const disc = Number(newInv.discount || 0);
    const vatVal = newInv.applyVat ? Math.round((sub - disc) * 0.05) : 0;
    const net = sub - disc + vatVal;
    const nextId = `INV-${(invoices.length + 10205).toString()}`;
    const inv: Invoice = {
      id: nextId,
      customer: newInv.customer,
      custId: newInv.custId || `CUST-${(invoices.length + 10020).toString()}`,
      phone: newInv.phone || "01700-000000",
      zone: newInv.zone,
      pkgName: newInv.pkgName,
      subtotal: sub,
      vat: vatVal,
      discount: disc,
      amount: net,
      period: newInv.period,
      issued: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      due: newInv.due,
      status: "pending",
      method: null,
    };
    setInvoices(prev => [inv, ...prev]);
    setShowNewInvoice(false);
    showToast(`Invoice ${nextId} created for ${inv.customer} (৳${net.toLocaleString()})`);
    setNewInv({ customer: "", custId: "", phone: "", zone: "Dhanmondi-01", pkgName: "20 Mbps Plus", amount: "1200", period: "Aug 2026", due: "10 Aug 2026", discount: "0", applyVat: true });
  };

  const handleRecordPayment = () => {
    if (!newPay.customer || !newPay.amount) return;
    const payId = `PAY-${(payments.length + 88313).toString()}`;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const formattedTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const txnGenerated = newPay.txn || `${newPay.method.toUpperCase().slice(0,3)}${Math.floor(1000000 + Math.random() * 9000000)}`;

    const payment: Payment = {
      id: payId,
      customer: newPay.customer,
      custId: newPay.custId,
      invoice: newPay.invoice,
      amount: Number(newPay.amount),
      method: newPay.method,
      txn: txnGenerated,
      date: formattedDate,
      time: formattedTime,
      addedBy: newPay.collector || "Admin",
      channel: newPay.channel,
      status: "verified",
      notes: newPay.notes,
    };

    setPayments(prev => [payment, ...prev]);

    // Also mark matching invoice as paid if found
    setInvoices(prev => prev.map(inv => {
      if (inv.id === newPay.invoice) {
        return { ...inv, status: "paid", method: newPay.method, paidAt: formattedDate, trxId: txnGenerated };
      }
      return inv;
    }));

    setShowRecordPayment(false);
    showToast(`Payment ${payId} recorded ৳${payment.amount.toLocaleString()} via ${payment.method}`);
  };

  const handleCreatePackage = () => {
    if (!newPkg.name || !newPkg.price) return;
    const pkg: IspPackage = {
      id: `PKG-${(packagesList.length + 1).toString().padStart(2, "0")}`,
      name: newPkg.name,
      down: Number(newPkg.down),
      up: Number(newPkg.up),
      price: Number(newPkg.price),
      type: newPkg.type,
      customers: 0,
      margin: 78,
      mikrotikProfile: newPkg.mikrotikProfile || `profile-${newPkg.down}M-${newPkg.up}M`,
      burstLimit: newPkg.burstLimit || "No Burst",
      fupLimit: newPkg.fupLimit || "Unlimited",
      status: "active",
    };
    setPackagesList(prev => [...prev, pkg]);
    setShowNewPackage(false);
    showToast(`Package "${pkg.name}" created and synced with MikroTik profile!`);
    setNewPkg({ name: "", down: "20", up: "10", price: "1200", type: "PPPoE", mikrotikProfile: "", burstLimit: "30M/15M 20s", fupLimit: "Unlimited" });
  };

  const handleUpdatePackage = () => {
    if (!editingPkg) return;
    setPackagesList(prev => prev.map(p => p.id === editingPkg.id ? editingPkg : p));
    setEditingPkg(null);
    showToast(`Package "${editingPkg.name}" updated successfully!`);
  };

  const handleCreatePromo = () => {
    if (!newPromo.code || !newPromo.value) return;
    const promo: DiscountRule = {
      id: `DISC-${(discountRules.length + 101).toString()}`,
      code: newPromo.code.toUpperCase(),
      name: newPromo.name || newPromo.code.toUpperCase(),
      type: newPromo.type,
      value: Number(newPromo.value),
      scope: newPromo.scope,
      durationMonths: Number(newPromo.durationMonths),
      usageCount: 0,
      maxUsage: Number(newPromo.maxUsage),
      validUntil: newPromo.validUntil,
      status: "active",
    };
    setDiscountRules(prev => [promo, ...prev]);
    setShowNewPromo(false);
    showToast(`Promo rule "${promo.code}" activated!`);
    setNewPromo({ code: "", name: "", type: "percentage", value: "15", scope: "all", durationMonths: "3", maxUsage: "200", validUntil: "31 Dec 2026" });
  };

  const handleCreateAdjustment = () => {
    if (!newAdj.customer || !newAdj.amount) return;
    const adj: CustomerAdjustment = {
      id: `ADJ-${(adjustments.length + 501).toString()}`,
      customer: newAdj.customer,
      custId: newAdj.custId || "CUST-10099",
      type: newAdj.type,
      nature: newAdj.nature,
      amount: Number(newAdj.amount),
      reason: newAdj.reason || "Manual billing adjustment",
      ticketId: newAdj.ticketId || undefined,
      approvedBy: "Admin User",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "applied",
    };
    setAdjustments(prev => [adj, ...prev]);
    setShowNewAdjustment(false);
    showToast(`Adjustment of ৳${adj.amount} applied for ${adj.customer}`);
    setNewAdj({ customer: "", custId: "", type: "waiver", nature: "discount", amount: "", reason: "", ticketId: "" });
  };

  const handleSaveSettings = () => {
    showToast("Billing settings & Payment Gateway configurations saved successfully!");
  };

  // ─── Summary Stats ──────────────────────────────────────────────────────────

  const invoiceStats = {
    total: invoices.reduce((a, b) => a + b.amount, 0),
    collected: invoices.filter(i => i.status === "paid").reduce((a, b) => a + b.amount, 0),
    overdue: invoices.filter(i => i.status === "overdue").reduce((a, b) => a + b.amount, 0),
    pending: invoices.filter(i => i.status === "pending").reduce((a, b) => a + b.amount, 0),
    rate: Math.round((invoices.filter(i => i.status === "paid").reduce((a, b) => a + b.amount, 0) / (invoices.reduce((a, b) => a + b.amount, 0) || 1)) * 100),
  };

  const paymentStats = {
    total: payments.reduce((a, b) => a + b.amount, 0),
    bkash: payments.filter(p => p.method === "bKash").reduce((a, b) => a + b.amount, 0),
    nagad: payments.filter(p => p.method === "Nagad").reduce((a, b) => a + b.amount, 0),
    bankCash: payments.filter(p => p.method === "Bank" || p.method === "Cash" || p.method === "SSLCommerz").reduce((a, b) => a + b.amount, 0),
    count: payments.length,
    pendingVerif: payments.filter(p => p.status === "pending").length,
  };

  const packageStats = {
    totalSubscribers: packagesList.reduce((a, b) => a + b.customers, 0),
    totalGbps: ((packagesList.reduce((a, b) => a + (b.down * b.customers), 0)) / 1000).toFixed(1),
    avgArpu: Math.round(packagesList.reduce((a, b) => a + (b.price * b.customers), 0) / (packagesList.reduce((a, b) => a + b.customers, 0) || 1)),
    activeCount: packagesList.filter(p => p.status === "active").length,
  };

  const discountStats = {
    totalDiscounts: adjustments.filter(a => a.nature === "discount").reduce((acc, curr) => acc + curr.amount, 0) + 42500,
    totalPenalties: adjustments.filter(a => a.nature === "penalty").reduce((acc, curr) => acc + curr.amount, 0) + 18200,
    activePromos: discountRules.filter(d => d.status === "active").length,
  };

  // Common UI styles
  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--foreground)",
  };

  const tabs: { id: BillTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: "invoices", label: "Invoices", icon: FileText, badge: invoices.filter(i => i.status === "pending" || i.status === "overdue").length },
    { id: "payments", label: "Payments", icon: CreditCard, badge: payments.filter(p => p.status === "pending").length || undefined },
    { id: "packages", label: "Packages", icon: Package, badge: packagesList.length },
    { id: "billing-settings", label: "Billing Settings", icon: Settings },
  ];

  return (
    <div className="p-6">
      {/* ── Top Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Billing Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
              ISP Operating System v2.0
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Invoices, automated payment gateways, bandwidth packages, promotional discounts & billing policies
          </p>
        </div>

        {/* Global Action Buttons based on Tab */}
        <div className="flex items-center gap-2">
          {tab === "invoices" && (
            <>
              <button
                onClick={() => exportCSV(filteredInvoices)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
              >
                <Download size={14} /> Export Invoices CSV
              </button>
              <button
                onClick={() => setShowNewInvoice(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all"
                style={{ background: "var(--primary)", fontSize: 13 }}
              >
                <Plus size={14} /> Create Invoice
              </button>
            </>
          )}

          {tab === "payments" && (
            <>
              <button
                onClick={() => exportPaymentsCSV(filteredPayments)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
              >
                <Download size={14} /> Export Payments
              </button>
              <button
                onClick={() => setShowRecordPayment(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all"
                style={{ background: "#16A34A", fontSize: 13 }}
              >
                <Plus size={14} /> Record Payment
              </button>
            </>
          )}

          {tab === "packages" && (
            <>
              <button
                onClick={() => showToast("All packages synchronized with MikroTik PPPoE profiles!")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
              >
                <RefreshCw size={14} /> Sync MikroTik
              </button>
              <button
                onClick={() => setShowNewPackage(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all"
                style={{ background: "var(--primary)", fontSize: 13 }}
              >
                <Plus size={14} /> Create Package
              </button>
            </>
          )}

          {tab === "discounts" && (
            <>
              <button
                onClick={() => setShowNewAdjustment(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
                style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
              >
                <Plus size={14} /> Custom Adjustment
              </button>
              <button
                onClick={() => setShowNewPromo(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all"
                style={{ background: "var(--primary)", fontSize: 13 }}
              >
                <Tag size={14} /> New Promo Code
              </button>
            </>
          )}

          {tab === "billing-settings" && (
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all"
              style={{ background: "var(--primary)", fontSize: 13 }}
            >
              <Save size={14} /> Save All Settings
            </button>
          )}
        </div>
      </div>

      {/* ── Navigation Tabs ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl w-fit overflow-x-auto" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
              style={{
                background: active ? "var(--primary)" : "transparent",
                color: active ? "#ffffff" : "var(--muted-foreground)",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon size={15} />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span
                  className="px-1.5 py-0.2 rounded-full text-xs font-semibold"
                  style={{
                    background: active ? "rgba(255,255,255,0.25)" : "var(--muted)",
                    color: active ? "#ffffff" : "var(--foreground)",
                    fontSize: 10,
                  }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 1. INVOICES TAB                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {tab === "invoices" && (
        <div className="flex flex-col gap-5">
          {/* Summary Cards */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {[
              { label: "Total Invoiced", value: `৳${(invoiceStats.total / 1000).toFixed(1)}K`, sub: `${invoices.length} total bills this cycle`, icon: FileText, iconBg: "#F5F5F5", iconColor: "#6B7280", valColor: "var(--foreground)" },
              { label: "Collected (Paid)", value: `৳${(invoiceStats.collected / 1000).toFixed(1)}K`, sub: `${invoiceStats.rate}% collection efficiency`, icon: CheckCircle2, iconBg: "#DCFCE7", iconColor: "#16A34A", valColor: "#16A34A" },
              { label: "Overdue Amount", value: `৳${(invoiceStats.overdue / 1000).toFixed(1)}K`, sub: `${invoices.filter(i=>i.status==="overdue").length} accounts require cutoff/SMS`, icon: AlertTriangle, iconBg: "#FEE2E2", iconColor: "#DC2626", valColor: "#DC2626" },
              { label: "Pending Due", value: `৳${(invoiceStats.pending / 1000).toFixed(1)}K`, sub: "Within grace payment period", icon: Clock, iconBg: "#DBEAFE", iconColor: "#2563EB", valColor: "#2563EB" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl p-4 transition-all" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>{s.label}</span>
                    <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: s.iconBg }}>
                      <Icon size={15} style={{ color: s.iconColor }} />
                    </div>
                  </div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: s.valColor, marginBottom: 2 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{s.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Table Container */}
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {/* Filter Toolbar */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="relative w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  value={invSearch}
                  onChange={e => setInvSearch(e.target.value)}
                  placeholder="Search invoice, customer ID, phone, zone..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg outline-none"
                  style={{ background: "var(--muted)", fontSize: 12, color: "var(--foreground)", border: "1px solid transparent" }}
                />
              </div>

              <div className="flex items-center gap-1.5">
                {(["all", "paid", "pending", "overdue", "cancelled"] as const).map(k => (
                  <button
                    key={k}
                    onClick={() => setInvStatusFilter(k)}
                    className="px-3 py-1.5 rounded-lg capitalize transition-colors"
                    style={{
                      fontSize: 11,
                      fontWeight: invStatusFilter === k ? 600 : 400,
                      background: invStatusFilter === k ? "var(--primary)" : "var(--muted)",
                      color: invStatusFilter === k ? "white" : "var(--muted-foreground)",
                    }}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--muted)" }}>
                    {["Invoice ID", "Customer Details", "Package & Zone", "Period", "Amount", "Due Date", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv, i) => {
                    const cfg = invStatusConfig[inv.status];
                    const Icon = cfg.icon;
                    return (
                      <tr
                        key={inv.id}
                        style={{ borderBottom: i < filteredInvoices.length - 1 ? "1px solid var(--border)" : "none" }}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="font-mono text-xs font-semibold hover:underline flex items-center gap-1"
                            style={{ color: "var(--primary)" }}
                          >
                            <FileText size={12} /> {inv.id}
                          </button>
                          <span style={{ fontSize: 10, color: "var(--muted-foreground)", display: "block" }}>
                            {inv.issued}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{inv.customer}</p>
                          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{inv.custId} · {inv.phone}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", display: "block" }}>{inv.pkgName}</span>
                          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{inv.zone}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span style={{ fontSize: 12, color: "var(--foreground)" }}>{inv.period}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>
                            ৳{inv.amount.toLocaleString()}
                          </span>
                          {inv.discount > 0 && (
                            <span style={{ fontSize: 10, color: "#16A34A", display: "block" }}>-৳{inv.discount} discount</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span style={{ fontSize: 12, color: inv.status === "overdue" ? "#DC2626" : "var(--muted-foreground)", fontWeight: inv.status === "overdue" ? 600 : 400 }}>
                            {inv.due}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: cfg.bg, fontSize: 11, fontWeight: 600, color: cfg.color }}>
                            <Icon size={11} /> {cfg.label}
                          </span>
                          {inv.method && (
                            <span style={{ fontSize: 10, color: "var(--muted-foreground)", display: "block", marginTop: 2 }}>
                              via {inv.method}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button
                              title="View & Print Invoice"
                              onClick={() => setSelectedInvoice(inv)}
                              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors"
                            >
                              <Eye size={13} style={{ color: "var(--foreground)" }} />
                            </button>
                            {inv.status !== "paid" && (
                              <button
                                title="Record Payment for this Invoice"
                                onClick={() => {
                                  setNewPay({
                                    customer: inv.customer,
                                    custId: inv.custId,
                                    invoice: inv.id,
                                    amount: inv.amount.toString(),
                                    method: "bKash",
                                    txn: "",
                                    channel: "Merchant Checkout",
                                    collector: "Admin User",
                                    sendSms: true,
                                    notes: `Payment for ${inv.period}`
                                  });
                                  setShowRecordPayment(true);
                                }}
                                className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors text-emerald-600"
                              >
                                <DollarSign size={13} />
                              </button>
                            )}
                            <button
                              title="Send SMS Reminder"
                              onClick={() => showToast(`SMS reminder dispatched to ${inv.phone} for Invoice ${inv.id}`)}
                              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors"
                            >
                              <Send size={13} style={{ color: "var(--muted-foreground)" }} />
                            </button>
                            <button
                              title="Print Invoice"
                              onClick={() => { setSelectedInvoice(inv); setTimeout(() => window.print(), 300); }}
                              className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors"
                            >
                              <Printer size={13} style={{ color: "var(--muted-foreground)" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center" style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
                        No invoices match your search query or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 2. PAYMENTS TAB                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {tab === "payments" && (
        <div className="flex flex-col gap-5">
          {/* Summary Cards */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Total Collections</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DCFCE7" }}>
                  <CheckCircle2 size={15} style={{ color: "#16A34A" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#16A34A", marginBottom: 2 }}>
                ৳{(paymentStats.total / 1000).toFixed(1)}K
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{paymentStats.count} successful transactions</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>bKash Gateway</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#FCE7F3" }}>
                  <Smartphone size={15} style={{ color: "#DB2777" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#DB2777", marginBottom: 2 }}>
                ৳{(paymentStats.bkash / 1000).toFixed(1)}K
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Automated Instant Webhook</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Nagad Gateway</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#FEF3C7" }}>
                  <Smartphone size={15} style={{ color: "#D97706" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#D97706", marginBottom: 2 }}>
                ৳{(paymentStats.nagad / 1000).toFixed(1)}K
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Direct Merchant App</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Bank & Cash Counter</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DBEAFE" }}>
                  <Building2 size={15} style={{ color: "#2563EB" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#2563EB", marginBottom: 2 }}>
                ৳{(paymentStats.bankCash / 1000).toFixed(1)}K
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>BEFTN, DBBL & Field collectors</p>
            </div>
          </div>

          {/* Payments Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="relative w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  value={paySearch}
                  onChange={e => setPaySearch(e.target.value)}
                  placeholder="Search Txn ID, customer, invoice..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg outline-none"
                  style={{ background: "var(--muted)", fontSize: 12, color: "var(--foreground)", border: "1px solid transparent" }}
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={payMethodFilter}
                  onChange={e => setPayMethodFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg outline-none text-xs"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                >
                  <option value="all">All Methods</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank Wire</option>
                  <option value="Cash">Cash Collection</option>
                  <option value="SSLCommerz">SSLCommerz (Cards)</option>
                </select>

                <select
                  value={payStatusFilter}
                  onChange={e => setPayStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg outline-none text-xs"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                >
                  <option value="all">All Verification</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--muted)" }}>
                    {["Payment ID", "Customer", "Invoice Ref", "Amount", "Method", "Txn / Ref Number", "Date & Time", "Channel / Added By", "Status", "Receipt"].map(h => (
                      <th key={h} className="text-left px-4 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p, i) => (
                    <tr
                      key={p.id}
                      style={{ borderBottom: i < filteredPayments.length - 1 ? "1px solid var(--border)" : "none" }}
                      className="transition-colors hover:bg-muted/40"
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-semibold" style={{ color: "var(--primary)" }}>{p.id}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{p.customer}</p>
                        <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{p.custId}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{p.invoice}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-sm font-bold text-emerald-600">৳{p.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            background: p.method === "bKash" ? "#FCE7F3" : p.method === "Nagad" ? "#FEF3C7" : p.method === "Bank" ? "#DBEAFE" : p.method === "Cash" ? "#F3F4F6" : "#EDE9FE",
                            color: p.method === "bKash" ? "#DB2777" : p.method === "Nagad" ? "#D97706" : p.method === "Bank" ? "#2563EB" : p.method === "Cash" ? "#4B5563" : "#7C3AED",
                          }}
                        >
                          {p.method}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-foreground/80">{p.txn}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p style={{ fontSize: 12, color: "var(--foreground)" }}>{p.date}</p>
                        <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{p.time}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p style={{ fontSize: 12, color: "var(--foreground)" }}>{p.channel}</p>
                        <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{p.addedBy}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        {p.status === "verified" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
                            <CheckCircle2 size={11} /> Verified
                          </span>
                        ) : p.status === "pending" ? (
                          <button
                            onClick={() => {
                              setPayments(prev => prev.map(x => x.id === p.id ? { ...x, status: "verified" } : x));
                              showToast(`Payment ${p.id} marked as verified!`);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer hover:opacity-90"
                            style={{ background: "#FEF3C7", color: "#D97706" }}
                          >
                            <Clock size={11} /> Pending (Verify)
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                            <XCircle size={11} /> Refunded
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-muted transition-colors text-primary font-medium"
                        >
                          <FileText size={12} /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-5 py-12 text-center" style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
                        No payment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 3. PACKAGES TAB                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {tab === "packages" && (
        <div className="flex flex-col gap-5">
          {/* Summary Cards */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Active Packages</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "rgba(196,53,53,0.1)" }}>
                  <Package size={15} style={{ color: "var(--primary)" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)", marginBottom: 2 }}>
                {packageStats.activeCount} Profiles
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Synced with MikroTik RouterOS</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Total Subscribers</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DCFCE7" }}>
                  <CheckCircle2 size={15} style={{ color: "#16A34A" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#16A34A", marginBottom: 2 }}>
                {packageStats.totalSubscribers.toLocaleString()}
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Active connected client accounts</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Provisioned Bandwidth</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DBEAFE" }}>
                  <Zap size={15} style={{ color: "#2563EB" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#2563EB", marginBottom: 2 }}>
                {packageStats.totalGbps} Gbps
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Total configured capacity</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Average ARPU</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#EDE9FE" }}>
                  <DollarSign size={15} style={{ color: "#7C3AED" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#7C3AED", marginBottom: 2 }}>
                ৳{packageStats.avgArpu} /mo
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Avg revenue per user subscriber</p>
            </div>
          </div>

          {/* Filter Toolbar & View Switcher */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
                <input
                  value={pkgSearch}
                  onChange={e => setPkgSearch(e.target.value)}
                  placeholder="Search package name, profile..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg outline-none"
                  style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }}
                />
              </div>

              <select
                value={pkgTypeFilter}
                onChange={e => setPkgTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-lg outline-none text-xs"
                style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              >
                <option value="all">All Connection Types</option>
                <option value="PPPoE">PPPoE</option>
                <option value="Static IP">Static IP</option>
                <option value="DHCP">DHCP</option>
                <option value="Hotspot">Hotspot</option>
                <option value="Corporate Lease">Corporate Lease</option>
              </select>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <button
                onClick={() => setPkgViewMode("grid")}
                className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  background: pkgViewMode === "grid" ? "var(--primary)" : "transparent",
                  color: pkgViewMode === "grid" ? "white" : "var(--muted-foreground)",
                }}
              >
                Cards View
              </button>
              <button
                onClick={() => setPkgViewMode("table")}
                className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  background: pkgViewMode === "table" ? "var(--primary)" : "transparent",
                  color: pkgViewMode === "table" ? "white" : "var(--muted-foreground)",
                }}
              >
                Detailed Table
              </button>
            </div>
          </div>

          {/* Grid View */}
          {pkgViewMode === "grid" ? (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {filteredPackages.map(pkg => (
                <div
                  key={pkg.id}
                  className="rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-md"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                          {pkg.name}
                        </p>
                        <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>
                          MikroTik: <span className="font-mono text-primary font-medium">{pkg.mikrotikProfile}</span>
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: "var(--accent)", color: "var(--primary)" }}>
                        {pkg.type}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg mb-4" style={{ background: "var(--muted)" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Download / Upload</span>
                        <span className="font-mono text-xs font-bold text-foreground">{pkg.down}M / {pkg.up}M</span>
                      </div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Monthly Fee</span>
                        <span className="font-mono text-sm font-extrabold text-primary">৳{pkg.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Burst Rate</span>
                        <span style={{ fontSize: 11, color: "var(--foreground)" }}>{pkg.burstLimit}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Active Users</span>
                        <span className="font-mono text-xs font-semibold text-foreground">{pkg.customers.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Gross Margin</span>
                        <span className="text-xs font-semibold text-emerald-600">{pkg.margin}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (pkg.customers / 3840) * 100)}%`,
                            background: "var(--primary)",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={() => setEditingPkg(pkg)}
                      className="flex-1 py-1.5 rounded text-xs font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={() => showToast(`Subscribers list for ${pkg.name} opened in CRM module.`)}
                      className="flex-1 py-1.5 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Subscribers
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: "var(--muted)" }}>
                    {["Package Name", "Type", "Download", "Upload", "Monthly Price", "Burst Limit", "MikroTik Profile", "Subscribers", "Margin", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em" }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPackages.map((pkg, i) => (
                    <tr
                      key={pkg.id}
                      style={{ borderBottom: i < filteredPackages.length - 1 ? "1px solid var(--border)" : "none" }}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>{pkg.name}</p>
                        <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{pkg.id}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "var(--muted)" }}>{pkg.type}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs">{pkg.down} Mbps</td>
                      <td className="px-4 py-3.5 font-mono text-xs">{pkg.up} Mbps</td>
                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-primary">৳{pkg.price.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">{pkg.burstLimit}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-foreground/80">{pkg.mikrotikProfile}</td>
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold">{pkg.customers.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-emerald-600">{pkg.margin}%</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingPkg(pkg)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => showToast(`Archived package ${pkg.name}`)}
                            className="p-1.5 rounded hover:bg-muted text-red-500"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 4. DISCOUNTS & PENALTIES TAB                                           */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {tab === "discounts" && (
        <div className="flex flex-col gap-5">
          {/* Summary Cards */}
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Total Discounts Allowed</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DCFCE7" }}>
                  <Tag size={15} style={{ color: "#16A34A" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#16A34A", marginBottom: 2 }}>
                ৳{(discountStats.totalDiscounts / 1000).toFixed(1)}K
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Promo campaigns & goodwill waivers</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Active Promo Rules</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "rgba(196,53,53,0.1)" }}>
                  <Percent size={15} style={{ color: "var(--primary)" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--primary)", marginBottom: 2 }}>
                {discountStats.activePromos} Coupons
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Live auto-applied discount codes</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Late Penalties Imposed</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#FEE2E2" }}>
                  <AlertTriangle size={15} style={{ color: "#DC2626" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#DC2626", marginBottom: 2 }}>
                ৳{(discountStats.totalPenalties / 1000).toFixed(1)}K
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Overdue fee & line reconnection</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)" }}>Grace Period Window</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "#DBEAFE" }}>
                  <Clock size={15} style={{ color: "#2563EB" }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#2563EB", marginBottom: 2 }}>
                {penaltyPolicies.graceDays} Days
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Auto-cutoff active after day 5</p>
            </div>
          </div>

          {/* Sub-Navigation */}
          <div className="flex items-center gap-2 border-b border-border pb-3">
            {[
              { id: "coupons", label: "Promo Codes & Discount Rules", count: discountRules.length },
              { id: "policies", label: "Late Payment & Penalty Policies", count: undefined },
              { id: "adjustments", label: "Customer Adjustments & Waivers Log", count: adjustments.length },
            ].map(st => (
              <button
                key={st.id}
                onClick={() => setDiscSubTab(st.id as any)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  background: discSubTab === st.id ? "var(--primary)" : "var(--muted)",
                  color: discSubTab === st.id ? "white" : "var(--muted-foreground)",
                }}
              >
                <span>{st.label}</span>
                {st.count !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-mono">
                    {st.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sub-View 1: Promo Codes & Discount Rules */}
          {discSubTab === "coupons" && (
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {discountRules.map(rule => (
                <div
                  key={rule.id}
                  className="rounded-xl p-5 relative overflow-hidden"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm font-bold tracking-wider px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                      {rule.code}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: rule.status === "active" ? "#DCFCE7" : "#F3F4F6",
                        color: rule.status === "active" ? "#16A34A" : "#6B7280",
                      }}
                    >
                      {rule.status.toUpperCase()}
                    </span>
                  </div>

                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>
                    {rule.name}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>
                    Scope: <span className="capitalize font-medium text-foreground">{rule.scope.replace("_", " ")}</span>
                  </p>

                  <div className="p-3 rounded-lg mb-4 space-y-1.5" style={{ background: "var(--muted)" }}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Discount Benefit</span>
                      <span className="font-mono text-xs font-bold text-emerald-600">
                        {rule.type === "percentage" ? `${rule.value}% OFF` : `৳${rule.value} Flat OFF`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Duration</span>
                      <span style={{ fontSize: 12, color: "var(--foreground)" }}>{rule.durationMonths} Months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Valid Until</span>
                      <span style={{ fontSize: 12, color: "var(--foreground)" }}>{rule.validUntil}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: "var(--muted-foreground)" }}>Redemptions</span>
                      <span className="font-mono font-medium text-foreground">{rule.usageCount} / {rule.maxUsage}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--muted)" }}>
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(rule.usageCount / rule.maxUsage) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDiscountRules(prev => prev.map(r => r.id === rule.id ? { ...r, status: r.status === "active" ? "paused" : "active" } : r));
                        showToast(`Status updated for ${rule.code}`);
                      }}
                      className="flex-1 py-1.5 rounded text-xs font-medium hover:bg-muted transition-colors"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      {rule.status === "active" ? "Pause Code" : "Activate"}
                    </button>
                    <button
                      onClick={() => showToast(`Copied promo code ${rule.code} to clipboard!`)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-View 2: Late Payment & Penalty Policies */}
          {discSubTab === "policies" && (
            <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert size={18} className="text-primary" />
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                    Automated Late Fee & Grace Policies
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                      GRACE PERIOD (DAYS AFTER INVOICE DUE DATE)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={penaltyPolicies.graceDays}
                        onChange={e => setPenaltyPolicies(p => ({ ...p, graceDays: Number(e.target.value) }))}
                        className="w-24 px-3 py-2 rounded-lg outline-none font-mono"
                        style={inputStyle}
                      />
                      <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                        Days before late penalty & auto-cutoff apply
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                      LATE PAYMENT PENALTY CHARGE (৳)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={penaltyPolicies.lateFeeAmount}
                        onChange={e => setPenaltyPolicies(p => ({ ...p, lateFeeAmount: Number(e.target.value) }))}
                        className="w-24 px-3 py-2 rounded-lg outline-none font-mono"
                        style={inputStyle}
                      />
                      <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                        Fixed charge added to overdue invoice after grace window
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>
                      LINE RECONNECTION CHARGE (৳)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={penaltyPolicies.reconnectFee}
                        onChange={e => setPenaltyPolicies(p => ({ ...p, reconnectFee: Number(e.target.value) }))}
                        className="w-24 px-3 py-2 rounded-lg outline-none font-mono"
                        style={inputStyle}
                      />
                      <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                        Charged when restoring suspended accounts
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={penaltyPolicies.autoLateFeeApply}
                      onChange={e => setPenaltyPolicies(p => ({ ...p, autoLateFeeApply: e.target.checked }))}
                      className="rounded accent-primary"
                    />
                    <span style={{ fontSize: 13, color: "var(--foreground)" }}>
                      Automatically attach Late Fee to unpaid customer bills at 12:01 AM on cutoff day
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={penaltyPolicies.autoBlockAfterGrace}
                      onChange={e => setPenaltyPolicies(p => ({ ...p, autoBlockAfterGrace: e.target.checked }))}
                      className="rounded accent-primary"
                    />
                    <span style={{ fontSize: 13, color: "var(--foreground)" }}>
                      Push suspended user IP/MAC to MikroTik <code>blocked_unpaid</code> firewall filter
                    </span>
                  </label>
                </div>

                <button
                  onClick={() => showToast("Penalty policies updated & synced with automation engine!")}
                  className="w-full py-2.5 rounded-lg text-white font-medium text-xs shadow-sm mt-2"
                  style={{ background: "var(--primary)" }}
                >
                  Save Policy Rules
                </button>
              </div>

              {/* Policy Explanation & Guidelines */}
              <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={18} className="text-amber-500" />
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                    BTRC & Standard ISP Guidelines
                  </h3>
                </div>

                <div className="space-y-3 text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  <div className="p-3 rounded-lg bg-muted flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block mb-0.5">Advance Notice Requirement</strong>
                      SMS notifications must be dispatched 3 days and 1 day before service disconnection.
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block mb-0.5">Instant Auto-Reconnection</strong>
                      When customer pays via bKash/Nagad/Cards, system removes IP from MikroTik block list within 30 seconds.
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground block mb-0.5">Waiver Permission Hierarchy</strong>
                      Only Managers & Admins can issue discount adjustments above ৳500 per customer account.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-View 3: Customer Adjustments Log */}
          {discSubTab === "adjustments" && (
            <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>
                  Audit log of all manual waivers, penalty adjustments & dispute credits
                </p>
                <button
                  onClick={() => setShowNewAdjustment(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary"
                >
                  <Plus size={13} /> Apply New Adjustment
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "var(--muted)" }}>
                      {["Adjustment ID", "Customer", "Type", "Nature", "Amount", "Reason / Ticket Ref", "Approved By", "Date", "Status"].map(h => (
                        <th key={h} className="text-left px-4 py-3" style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.04em" }}>
                          {h.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adjustments.map((adj, i) => (
                      <tr
                        key={adj.id}
                        style={{ borderBottom: i < adjustments.length - 1 ? "1px solid var(--border)" : "none" }}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-primary">{adj.id}</td>
                        <td className="px-4 py-3.5">
                          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{adj.customer}</p>
                          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{adj.custId}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="capitalize text-xs font-medium text-foreground">{adj.type.replace("_", " ")}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{
                              background: adj.nature === "discount" ? "#DCFCE7" : "#FEE2E2",
                              color: adj.nature === "discount" ? "#16A34A" : "#DC2626",
                            }}
                          >
                            {adj.nature === "discount" ? "- Discount / Credit" : "+ Penalty Charge"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-sm font-bold" style={{ color: adj.nature === "discount" ? "#16A34A" : "#DC2626" }}>
                          {adj.nature === "discount" ? "-" : "+"}৳{adj.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <p style={{ fontSize: 12, color: "var(--foreground)" }}>{adj.reason}</p>
                          {adj.ticketId && (
                            <span className="font-mono text-xs text-primary font-medium">{adj.ticketId}</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">{adj.approvedBy}</td>
                        <td className="px-4 py-3.5 text-xs text-foreground/80">{adj.date}</td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <Check size={12} /> {adj.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 5. BILLING SETTINGS TAB                                                */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {tab === "billing-settings" && (
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Section 1: Billing Cycle & Automated Invoicing */}
          <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <Calendar size={18} className="text-primary" />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                Billing Cycle & Auto-Invoicing
              </h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>
                  BILLING MODEL & CYCLE
                </label>
                <select
                  value={billingSettings.billingCycleType}
                  onChange={e => setBillingSettings(s => ({ ...s, billingCycleType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg outline-none text-xs"
                  style={inputStyle}
                >
                  <option value="calendar_month">Prepaid Calendar Month (1st to 30/31st)</option>
                  <option value="anniversary">Anniversary Date Cycle (Date-to-Date)</option>
                  <option value="postpaid_metered">Postpaid Monthly Consumption</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>
                  INVOICE AUTO-GENERATION SCHEDULE
                </label>
                <select
                  value={billingSettings.autoGenerateDate}
                  onChange={e => setBillingSettings(s => ({ ...s, autoGenerateDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg outline-none text-xs"
                  style={inputStyle}
                >
                  <option value="1st of every month">1st of Every Month at 00:01 AM</option>
                  <option value="25th of previous month">25th of Previous Month (Advance Bill)</option>
                  <option value="28th of previous month">28th of Previous Month</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>
                    INVOICE PREFIX
                  </label>
                  <input
                    value={billingSettings.invoicePrefix}
                    onChange={e => setBillingSettings(s => ({ ...s, invoicePrefix: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono text-xs"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>
                    DEFAULT DUE WINDOW (DAYS)
                  </label>
                  <input
                    type="number"
                    value={billingSettings.dueDaysOffset}
                    onChange={e => setBillingSettings(s => ({ ...s, dueDaysOffset: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono text-xs"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={billingSettings.autoDisconnectOnMikrotik}
                    onChange={e => setBillingSettings(s => ({ ...s, autoDisconnectOnMikrotik: e.target.checked }))}
                    className="rounded accent-primary"
                  />
                  <span>Sync overdue clients directly to MikroTik address-list (<code>{billingSettings.mikrotikAddressList}</code>)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Gateways Integration */}
          <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <Smartphone size={18} className="text-pink-600" />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                Payment Gateway Configuration
              </h3>
            </div>

            {/* bKash */}
            <div className="p-3.5 rounded-xl border border-border space-y-3" style={{ background: "var(--muted)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span className="font-bold text-sm text-foreground">bKash Merchant Checkout API</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                  LIVE CONNECTED
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">MERCHANT NUMBER</span>
                  <input
                    value={billingSettings.bkashMerchantId}
                    onChange={e => setBillingSettings(s => ({ ...s, bkashMerchantId: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded outline-none font-mono text-xs bg-card border border-border"
                  />
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">APP KEY</span>
                  <input
                    value={billingSettings.bkashAppKey}
                    onChange={e => setBillingSettings(s => ({ ...s, bkashAppKey: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded outline-none font-mono text-xs bg-card border border-border"
                  />
                </div>
              </div>
              <button
                onClick={() => showToast("bKash Webhook IPN ping verified successfully (HTTP 200 OK)!")}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                <RefreshCw size={11} /> Test bKash API Connection
              </button>
            </div>

            {/* Nagad */}
            <div className="p-3.5 rounded-xl border border-border space-y-3" style={{ background: "var(--muted)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="font-bold text-sm text-foreground">Nagad Direct Gateway</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                  ACTIVE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">MERCHANT ID</span>
                  <input
                    value={billingSettings.nagadMerchantId}
                    onChange={e => setBillingSettings(s => ({ ...s, nagadMerchantId: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded outline-none font-mono text-xs bg-card border border-border"
                  />
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">PUBLIC KEY</span>
                  <input
                    defaultValue="••••••••••••••••"
                    type="password"
                    className="w-full px-2 py-1.5 rounded outline-none font-mono text-xs bg-card border border-border"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Taxes, VAT & BTRC Compliance */}
          <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <Percent size={18} className="text-emerald-600" />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                Taxes, VAT & BTRC Compliance
              </h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>
                    TELECOM VAT RATE (%)
                  </label>
                  <input
                    type="number"
                    value={billingSettings.vatRate}
                    onChange={e => setBillingSettings(s => ({ ...s, vatRate: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono text-xs"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 5 }}>
                    VAT BIN NUMBER
                  </label>
                  <input
                    value={billingSettings.vatBin}
                    onChange={e => setBillingSettings(s => ({ ...s, vatBin: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono text-xs"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={billingSettings.priceTaxInclusive}
                    onChange={e => setBillingSettings(s => ({ ...s, priceTaxInclusive: e.target.checked }))}
                    className="rounded accent-primary"
                  />
                  <span>Package prices are Inclusive of 5% VAT (BTRC tariff standard)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded accent-primary"
                  />
                  <span>Auto-calculate 1% Social Obligation Fund (SOF) & 5.5% BTRC Revenue Share in monthly finance report</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Automated Billing SMS & Notifications */}
          <div className="rounded-xl p-5 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
              <Bell size={18} className="text-amber-500" />
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                Automated SMS Reminders
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted flex items-center justify-between">
                <div>
                  <strong className="block text-foreground">Invoice Generated SMS</strong>
                  <span className="text-muted-foreground text-[11px]">Sent on 1st of month with invoice bill amount & bKash pay link</span>
                </div>
                <input
                  type="checkbox"
                  checked={billingSettings.sendSmsOnGenerate}
                  onChange={e => setBillingSettings(s => ({ ...s, sendSmsOnGenerate: e.target.checked }))}
                  className="rounded accent-primary"
                />
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted flex items-center justify-between">
                <div>
                  <strong className="block text-foreground">3 Days Before Due Reminder</strong>
                  <span className="text-muted-foreground text-[11px]">Gentle reminder before late fee grace period starts</span>
                </div>
                <input
                  type="checkbox"
                  checked={billingSettings.sendSmsOnDue}
                  onChange={e => setBillingSettings(s => ({ ...s, sendSmsOnDue: e.target.checked }))}
                  className="rounded accent-primary"
                />
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted flex items-center justify-between">
                <div>
                  <strong className="block text-foreground">Instant Payment Confirmation SMS</strong>
                  <span className="text-muted-foreground text-[11px]">Instant receipt text with Transaction ID & thank you note</span>
                </div>
                <input
                  type="checkbox"
                  checked={billingSettings.sendSmsOnPaid}
                  onChange={e => setBillingSettings(s => ({ ...s, sendSmsOnPaid: e.target.checked }))}
                  className="rounded accent-primary"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveSettings}
                className="w-full py-2.5 rounded-lg text-white font-medium text-xs shadow-sm flex items-center justify-center gap-2"
                style={{ background: "var(--primary)" }}
              >
                <Save size={14} /> Save All Billing Configurations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* MODALS & OVERLAYS                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      {/* 1. View / Print Invoice Voucher Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Invoice Voucher #{selectedInvoice.id}
                </h3>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Printable Invoice Body */}
            <div className="p-6 space-y-5">
              {/* ISP Brand Header */}
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--foreground)" }}>
                    MAA BEST NETWORK
                  </h2>
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Holding 12, Main Road, Block B, Dhaka, Bangladesh</p>
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Support: +880 9611-223344 · BIN: {billingSettings.vatBin}</p>
                </div>
                <div className="text-right">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase"
                    style={{
                      background: invStatusConfig[selectedInvoice.status].bg,
                      color: invStatusConfig[selectedInvoice.status].color,
                    }}
                  >
                    {selectedInvoice.status}
                  </span>
                  <p className="font-mono text-xs font-semibold text-foreground mt-1.5">{selectedInvoice.id}</p>
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Date: {selectedInvoice.issued}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-muted/60 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">BILLED TO</span>
                  <p className="text-foreground font-semibold text-sm">{selectedInvoice.customer}</p>
                  <p className="text-muted-foreground">{selectedInvoice.custId}</p>
                  <p className="text-muted-foreground">{selectedInvoice.phone}</p>
                  <p className="text-muted-foreground">{selectedInvoice.zone}</p>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-1">INVOICE DETAILS</span>
                  <p className="text-foreground"><strong className="text-muted-foreground">Billing Period:</strong> {selectedInvoice.period}</p>
                  <p className="text-foreground"><strong className="text-muted-foreground">Due Date:</strong> {selectedInvoice.due}</p>
                  {selectedInvoice.paidAt && (
                    <p className="text-emerald-600 font-medium"><strong>Paid On:</strong> {selectedInvoice.paidAt}</p>
                  )}
                  {selectedInvoice.trxId && (
                    <p className="text-foreground font-mono text-[11px]"><strong>Trx ID:</strong> {selectedInvoice.trxId}</p>
                  )}
                </div>
              </div>

              {/* Items Breakdown Table */}
              <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-muted text-muted-foreground font-semibold">
                    <th className="text-left p-2.5">DESCRIPTION</th>
                    <th className="text-center p-2.5">PERIOD</th>
                    <th className="text-right p-2.5">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-2.5">
                      <strong className="text-foreground block">{selectedInvoice.pkgName} Internet Subscription</strong>
                      <span className="text-muted-foreground text-[11px]">High Speed Unlimited Optical Fiber Bandwidth</span>
                    </td>
                    <td className="text-center p-2.5 text-muted-foreground">{selectedInvoice.period}</td>
                    <td className="text-right p-2.5 font-mono font-medium">৳{selectedInvoice.subtotal.toLocaleString()}</td>
                  </tr>
                  {selectedInvoice.vat > 0 && (
                    <tr className="border-t border-border bg-muted/20">
                      <td className="p-2.5" colSpan={2}>Government Telecom VAT (5%)</td>
                      <td className="text-right p-2.5 font-mono">৳{selectedInvoice.vat}</td>
                    </tr>
                  )}
                  {selectedInvoice.discount > 0 && (
                    <tr className="border-t border-border bg-muted/20 text-emerald-600">
                      <td className="p-2.5" colSpan={2}>Special Promotional Discount</td>
                      <td className="text-right p-2.5 font-mono">-৳{selectedInvoice.discount}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-border bg-muted/60 font-bold text-sm">
                    <td className="p-2.5 text-foreground" colSpan={2}>TOTAL PAYABLE</td>
                    <td className="text-right p-2.5 font-mono text-primary">৳{selectedInvoice.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Methods Box */}
              <div className="p-3.5 rounded-xl border border-dashed border-border flex items-center justify-between text-xs">
                <div>
                  <strong className="block text-foreground mb-0.5">Quick Payment Instructions:</strong>
                  <p className="text-muted-foreground">bKash / Nagad Merchant: <span className="font-mono text-foreground font-semibold">01700-998877</span></p>
                  <p className="text-muted-foreground">Use Reference: <span className="font-mono text-primary font-bold">{selectedInvoice.id}</span></p>
                </div>
                <div className="text-center">
                  <div className="p-2 bg-white rounded-lg inline-block shadow-sm">
                    <QrCode size={40} className="text-black" />
                  </div>
                  <span className="block text-[10px] text-muted-foreground mt-0.5">Scan & Pay</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-muted"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-primary flex items-center gap-1.5"
              >
                <Printer size={13} /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Record Payment Modal */}
      {showRecordPayment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Record Payment
                </h3>
              </div>
              <button onClick={() => setShowRecordPayment(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">CUSTOMER NAME & ID</label>
                <input
                  value={newPay.customer}
                  onChange={e => setNewPay(p => ({ ...p, customer: e.target.value }))}
                  placeholder="e.g. Rahim Uddin"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">INVOICE NUMBER</label>
                  <input
                    value={newPay.invoice}
                    onChange={e => setNewPay(p => ({ ...p, invoice: e.target.value }))}
                    placeholder="INV-10204"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">AMOUNT (৳)</label>
                  <input
                    type="number"
                    value={newPay.amount}
                    onChange={e => setNewPay(p => ({ ...p, amount: e.target.value }))}
                    placeholder="1200"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PAYMENT METHOD</label>
                  <select
                    value={newPay.method}
                    onChange={e => setNewPay(p => ({ ...p, method: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank">Bank Deposit</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="SSLCommerz">SSLCommerz (Card)</option>
                    <option value="Rocket">Rocket</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">TRANSACTION ID / REF</label>
                  <input
                    value={newPay.txn}
                    onChange={e => setNewPay(p => ({ ...p, txn: e.target.value }))}
                    placeholder="Auto-generated if blank"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">RECEIVED BY / COLLECTOR</label>
                <input
                  value={newPay.collector}
                  onChange={e => setNewPay(p => ({ ...p, collector: e.target.value }))}
                  placeholder="Admin User / Field Collector"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newPay.sendSms}
                  onChange={e => setNewPay(p => ({ ...p, sendSms: e.target.checked }))}
                  className="rounded accent-emerald-600"
                />
                <span className="text-foreground">Send SMS instant payment receipt to customer mobile</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowRecordPayment(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={!newPay.customer || !newPay.amount}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Money Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Money Receipt #{selectedReceipt.id}
                </h3>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3 text-xs">
              <div className="flex justify-between border-b border-border pb-2">
                <div>
                  <strong className="text-foreground block text-sm">MAA BEST NETWORK</strong>
                  <span className="text-muted-foreground text-[11px]">Official Collection Receipt</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-primary">{selectedReceipt.id}</span>
                  <p className="text-muted-foreground text-[10px]">{selectedReceipt.date} {selectedReceipt.time}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p><strong className="text-muted-foreground">Received From:</strong> <span className="text-foreground font-semibold">{selectedReceipt.customer} ({selectedReceipt.custId})</span></p>
                <p><strong className="text-muted-foreground">Against Invoice:</strong> <span className="font-mono text-foreground">{selectedReceipt.invoice}</span></p>
                <p><strong className="text-muted-foreground">Payment Method:</strong> <span className="text-foreground font-medium">{selectedReceipt.method} ({selectedReceipt.channel})</span></p>
                <p><strong className="text-muted-foreground">Transaction ID:</strong> <span className="font-mono text-foreground font-semibold">{selectedReceipt.txn}</span></p>
                <p><strong className="text-muted-foreground">Authorized By:</strong> <span className="text-foreground">{selectedReceipt.addedBy}</span></p>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-emerald-700">
                <span className="font-bold">AMOUNT RECEIVED</span>
                <span className="font-mono font-extrabold text-base">৳{selectedReceipt.amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary flex items-center justify-center gap-1"
              >
                <Printer size={13} /> Print Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Create New Invoice Modal */}
      {showNewInvoice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Create Customer Invoice
                </h3>
              </div>
              <button onClick={() => setShowNewInvoice(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">CUSTOMER NAME</label>
                <input
                  value={newInv.customer}
                  onChange={e => setNewInv(p => ({ ...p, customer: e.target.value }))}
                  placeholder="e.g. Shakil Chowdhury"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PHONE NUMBER</label>
                  <input
                    value={newInv.phone}
                    onChange={e => setNewInv(p => ({ ...p, phone: e.target.value }))}
                    placeholder="01711-000000"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">ZONE</label>
                  <select
                    value={newInv.zone}
                    onChange={e => setNewInv(p => ({ ...p, zone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option>Dhanmondi-01</option>
                    <option>Gulshan-02</option>
                    <option>Mirpur-10</option>
                    <option>Banani-03</option>
                    <option>Uttara-Sec4</option>
                    <option>Bashundhara R/A</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PACKAGE</label>
                  <select
                    value={newInv.pkgName}
                    onChange={e => {
                      const selPkg = packagesList.find(x => x.name === e.target.value);
                      setNewInv(p => ({ ...p, pkgName: e.target.value, amount: (selPkg ? selPkg.price : 1200).toString() }));
                    }}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    {packagesList.map(p => (
                      <option key={p.id} value={p.name}>{p.name} (৳{p.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PACKAGE FEE (৳)</label>
                  <input
                    type="number"
                    value={newInv.amount}
                    onChange={e => setNewInv(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">BILLING MONTH</label>
                  <input
                    value={newInv.period}
                    onChange={e => setNewInv(p => ({ ...p, period: e.target.value }))}
                    placeholder="Aug 2026"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">DUE DATE</label>
                  <input
                    value={newInv.due}
                    onChange={e => setNewInv(p => ({ ...p, due: e.target.value }))}
                    placeholder="10 Aug 2026"
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newInv.applyVat}
                    onChange={e => setNewInv(p => ({ ...p, applyVat: e.target.checked }))}
                    className="rounded accent-primary"
                  />
                  <span>Include 5% BTRC Telecom VAT</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewInvoice(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                disabled={!newInv.customer || !newInv.amount}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create / Edit Package Modal */}
      {(showNewPackage || editingPkg) && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  {editingPkg ? `Edit Package: ${editingPkg.name}` : "Create Bandwidth Package"}
                </h3>
              </div>
              <button onClick={() => { setShowNewPackage(false); setEditingPkg(null); }} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">PACKAGE NAME</label>
                <input
                  value={editingPkg ? editingPkg.name : newPkg.name}
                  onChange={e => {
                    const v = e.target.value;
                    if (editingPkg) setEditingPkg(p => p ? { ...p, name: v } : null);
                    else setNewPkg(p => ({ ...p, name: v }));
                  }}
                  placeholder="e.g. 25 Mbps Turbo"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">DOWNLOAD (MBPS)</label>
                  <input
                    type="number"
                    value={editingPkg ? editingPkg.down : newPkg.down}
                    onChange={e => {
                      const v = Number(e.target.value);
                      if (editingPkg) setEditingPkg(p => p ? { ...p, down: v } : null);
                      else setNewPkg(p => ({ ...p, down: e.target.value }));
                    }}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">UPLOAD (MBPS)</label>
                  <input
                    type="number"
                    value={editingPkg ? editingPkg.up : newPkg.up}
                    onChange={e => {
                      const v = Number(e.target.value);
                      if (editingPkg) setEditingPkg(p => p ? { ...p, up: v } : null);
                      else setNewPkg(p => ({ ...p, up: e.target.value }));
                    }}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">MONTHLY PRICE (৳)</label>
                  <input
                    type="number"
                    value={editingPkg ? editingPkg.price : newPkg.price}
                    onChange={e => {
                      const v = Number(e.target.value);
                      if (editingPkg) setEditingPkg(p => p ? { ...p, price: v } : null);
                      else setNewPkg(p => ({ ...p, price: e.target.value }));
                    }}
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">TYPE</label>
                  <select
                    value={editingPkg ? editingPkg.type : newPkg.type}
                    onChange={e => {
                      const v = e.target.value as any;
                      if (editingPkg) setEditingPkg(p => p ? { ...p, type: v } : null);
                      else setNewPkg(p => ({ ...p, type: v }));
                    }}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="PPPoE">PPPoE</option>
                    <option value="Static IP">Static IP</option>
                    <option value="DHCP">DHCP</option>
                    <option value="Hotspot">Hotspot</option>
                    <option value="Corporate Lease">Corporate Lease</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">MIKROTIK PPPOE PROFILE NAME</label>
                <input
                  value={editingPkg ? editingPkg.mikrotikProfile : newPkg.mikrotikProfile}
                  onChange={e => {
                    const v = e.target.value;
                    if (editingPkg) setEditingPkg(p => p ? { ...p, mikrotikProfile: v } : null);
                    else setNewPkg(p => ({ ...p, mikrotikProfile: v }));
                  }}
                  placeholder="profile-20M-10M"
                  className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowNewPackage(false); setEditingPkg(null); }}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingPkg ? handleUpdatePackage : handleCreatePackage}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary"
              >
                {editingPkg ? "Save Changes" : "Create Package"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Create Promo Code Modal */}
      {showNewPromo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Create Discount Promo Code
                </h3>
              </div>
              <button onClick={() => setShowNewPromo(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PROMO CODE</label>
                  <input
                    value={newPromo.code}
                    onChange={e => setNewPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. FESTIVE20"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">DISCOUNT TYPE</label>
                  <select
                    value={newPromo.type}
                    onChange={e => setNewPromo(p => ({ ...p, type: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed">Fixed Amount (৳ Flat)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">OFFER NAME</label>
                <input
                  value={newPromo.name}
                  onChange={e => setNewPromo(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Festive Eid Discount"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">DISCOUNT VALUE ({newPromo.type === "percentage" ? "%" : "৳"})</label>
                  <input
                    type="number"
                    value={newPromo.value}
                    onChange={e => setNewPromo(p => ({ ...p, value: e.target.value }))}
                    placeholder="15"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">APPLICABLE FOR</label>
                  <select
                    value={newPromo.scope}
                    onChange={e => setNewPromo(p => ({ ...p, scope: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="all">All Subscribers</option>
                    <option value="new_customers">New Connections</option>
                    <option value="resellers">Resellers Only</option>
                    <option value="annual_plan">Annual Upfront</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">DURATION (MONTHS)</label>
                  <input
                    type="number"
                    value={newPromo.durationMonths}
                    onChange={e => setNewPromo(p => ({ ...p, durationMonths: e.target.value }))}
                    placeholder="3"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">USAGE LIMIT</label>
                  <input
                    type="number"
                    value={newPromo.maxUsage}
                    onChange={e => setNewPromo(p => ({ ...p, maxUsage: e.target.value }))}
                    placeholder="200"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewPromo(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePromo}
                disabled={!newPromo.code || !newPromo.value}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Publish Promo Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Create Adjustment Modal */}
      {showNewAdjustment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Apply Custom Customer Adjustment
                </h3>
              </div>
              <button onClick={() => setShowNewAdjustment(false)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">CUSTOMER NAME</label>
                <input
                  value={newAdj.customer}
                  onChange={e => setNewAdj(p => ({ ...p, customer: e.target.value }))}
                  placeholder="e.g. Monir Ahmed"
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">ADJUSTMENT NATURE</label>
                  <select
                    value={newAdj.nature}
                    onChange={e => setNewAdj(p => ({ ...p, nature: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none font-medium"
                    style={inputStyle}
                  >
                    <option value="discount">Credit / Discount (-৳)</option>
                    <option value="penalty">Penalty / Charge (+৳)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">AMOUNT (৳)</label>
                  <input
                    type="number"
                    value={newAdj.amount}
                    onChange={e => setNewAdj(p => ({ ...p, amount: e.target.value }))}
                    placeholder="250"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">TYPE CATEGORY</label>
                  <select
                    value={newAdj.type}
                    onChange={e => setNewAdj(p => ({ ...p, type: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg outline-none"
                    style={inputStyle}
                  >
                    <option value="waiver">Service Outage Waiver</option>
                    <option value="promotional">Promotional Credit</option>
                    <option value="goodwill">Goodwill Adjustment</option>
                    <option value="late_fee">Late Payment Fee</option>
                    <option value="reconnection_charge">Reconnection Charge</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">SUPPORT TICKET ID</label>
                  <input
                    value={newAdj.ticketId}
                    onChange={e => setNewAdj(p => ({ ...p, ticketId: e.target.value }))}
                    placeholder="TCK-4812"
                    className="w-full px-3 py-2 rounded-lg outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">REASON / JUSTIFICATION</label>
                <textarea
                  value={newAdj.reason}
                  onChange={e => setNewAdj(p => ({ ...p, reason: e.target.value }))}
                  placeholder="State the reason for this credit or penalty charge..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewAdjustment(false)}
                className="flex-1 py-2 rounded-lg text-xs border border-border hover:bg-muted font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdjustment}
                disabled={!newAdj.customer || !newAdj.amount}
                className="flex-1 py-2 rounded-lg text-xs font-semibold text-white bg-primary disabled:opacity-50"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ──────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500 }}
        >
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 hover:opacity-75">
            <X size={14} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
        </div>
      )}
    </div>
  );
}
