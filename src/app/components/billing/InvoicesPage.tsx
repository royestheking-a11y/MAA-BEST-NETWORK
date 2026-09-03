import { useState, useEffect, useMemo, useRef } from "react";
import {
  FileText, Search, Plus, Download, CheckCircle2, Clock, AlertTriangle,
  XCircle, Eye, Send, Printer, X, DollarSign, QrCode, Filter, CreditCard,
  User, Phone, MapPin, Zap, Check, Smartphone, Receipt, ShieldCheck
} from "lucide-react";
import {
  billingStore, type Invoice, type Payment
} from "./billingData";
import { useCustomerContext, Customer } from "../../context/CustomerContext";

interface InvoicesPageProps {
  onNavigate?: (page: string) => void;
}

export function InvoicesPage({ onNavigate }: InvoicesPageProps) {
  const { customers, processPayment } = useCustomerContext();
  const [invoices, setInvoices] = useState<Invoice[]>(billingStore.getInvoices());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "overdue" | "cancelled">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [toast, setToast] = useState("");

  // Customer Auto-Search state for Create Invoice
  const [custSearchQuery, setCustSearchQuery] = useState("");
  const [showCustSuggestions, setShowCustSuggestions] = useState(false);
  const [selectedCustDetails, setSelectedCustDetails] = useState<Customer | null>(null);

  // Manual Payment Settlement Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payTargetInvoice, setPayTargetInvoice] = useState<Invoice | null>(null);
  const [payMethod, setPayMethod] = useState<"Cash" | "bKash" | "Nagad" | "Rocket" | "Bank">("Cash");
  const [payAmount, setPayAmount] = useState("");
  const [payDiscount, setPayDiscount] = useState("0");
  const [payTrxId, setPayTrxId] = useState("");
  const [payCollectedBy, setPayCollectedBy] = useState("Admin Counter");
  const [paySendSms, setPaySendSms] = useState(true);
  const [payNotes, setPayNotes] = useState("");

  const [newInv, setNewInv] = useState({
    customer: "", custId: "", phone: "", zone: "", pkgName: "",
    amount: "",
    period: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
    due: new Date(Date.now() + 10 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    discount: "0", applyVat: true
  });

  useEffect(() => {
    return billingStore.subscribe(() => {
      setInvoices(billingStore.getInvoices());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // Filter matching customers when typing in Create Invoice search
  const matchingCustomers = useMemo(() => {
    if (!custSearchQuery.trim()) return customers.slice(0, 8);
    const q = custSearchQuery.toLowerCase();
    return customers.filter(c =>
      c.id.toLowerCase().includes(q) ||
      (c.clientCode && c.clientCode.toLowerCase().includes(q)) ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.pppUser.toLowerCase().includes(q) ||
      (c.zone && c.zone.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [customers, custSearchQuery]);

  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCustDetails(cust);
    setNewInv(prev => ({
      ...prev,
      customer: cust.name,
      custId: cust.clientCode || cust.id,
      phone: cust.phone,
      zone: cust.subzone || cust.zone || "Somitir Hat",
      pkgName: cust.package,
      amount: (cust.price || 1000).toString(),
    }));
    setCustSearchQuery(`${cust.name} (${cust.clientCode || cust.id})`);
    setShowCustSuggestions(false);
    showToast(`✓ Auto-filled subscriber ${cust.name} (${cust.clientCode || cust.id})`);
  };

  // Open manual payment settlement modal for an invoice
  const openManualPaymentModal = (inv: Invoice) => {
    setPayTargetInvoice(inv);
    setPayAmount(inv.amount.toString());
    setPayDiscount("0");
    setPayMethod("Cash");
    setPayTrxId(`TRX-${Math.floor(1000000 + Math.random() * 9000000)}`);
    setPayCollectedBy("Admin Cash Counter");
    setPayNotes("");
    setShowPayModal(true);
  };

  // Confirm manual payment
  const handleConfirmManualPayment = () => {
    if (!payTargetInvoice || !payAmount) return;

    const amountNum = Number(payAmount);
    const discountNum = Number(payDiscount || 0);
    const effectiveAmount = Math.max(0, amountNum - discountNum);

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // 1. Record in billingStore
    const payRecord: Payment = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      customer: payTargetInvoice.customer,
      custId: payTargetInvoice.custId,
      invoice: payTargetInvoice.id,
      amount: effectiveAmount,
      method: payMethod,
      txn: payTrxId || `CSH-${Date.now().toString().slice(-6)}`,
      date: dateStr,
      time: timeStr,
      addedBy: payCollectedBy,
      channel: payMethod === "Cash" ? "Cash Counter Desk" : `${payMethod} Direct`,
      status: "verified",
      notes: payNotes,
    };

    billingStore.addPayment(payRecord);

    // 2. Sync with CustomerContext to update subscriber due balance & active dates
    if (processPayment) {
      const mappedMethod: "Cash" | "bKash" | "Nagad" | "Rocket" | "Card" = payMethod === "Bank" ? "Card" : payMethod;
      processPayment(payTargetInvoice.custId, effectiveAmount, mappedMethod, payRecord.txn, now);
    }

    setShowPayModal(false);
    showToast(`✓ Payment of ৳${effectiveAmount.toLocaleString()} recorded for Invoice ${payTargetInvoice.id} (${payTargetInvoice.customer})!`);
  };

  const filteredInvoices = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      inv.id.toLowerCase().includes(q) ||
      inv.customer.toLowerCase().includes(q) ||
      inv.custId.toLowerCase().includes(q) ||
      inv.phone.includes(q) ||
      inv.zone.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportCSV = () => {
    const headers = ["Invoice ID", "Customer", "Customer ID", "Phone", "Zone", "Package", "Subtotal", "VAT (5%)", "Discount", "Net Amount", "Period", "Issued", "Due Date", "Status", "Method", "Trx ID"];
    const rows = filteredInvoices.map(i => [
      i.id, i.customer, i.custId, i.phone, i.zone, i.pkgName,
      i.subtotal, i.vat, i.discount, i.amount, i.period, i.issued, i.due,
      i.status, i.method ?? "—", i.trxId ?? "—"
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `Invoices_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

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
      phone: newInv.phone || "01711-000000",
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
    billingStore.addInvoice(inv);
    setShowNewInvoice(false);
    setNewInv({
      customer: "", custId: "", phone: "", zone: "", pkgName: "",
      amount: "",
      period: new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      due: new Date(Date.now() + 10 * 86400000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      discount: "0", applyVat: true
    });
    setCustSearchQuery("");
    setSelectedCustDetails(null);
  };

  const activeSubscribers = useMemo(() => customers.filter(c => c.status === "active"), [customers]);
  const paidClientCount = useMemo(() => activeSubscribers.filter(c => (c.dueAmount || 0) === 0).length, [activeSubscribers]);
  const dueClientCount = useMemo(() => customers.filter(c => (c.dueAmount || 0) > 0).length, [customers]);
  const totalDueAmount = useMemo(() => customers.reduce((sum, c) => sum + (c.dueAmount || 0), 0), [customers]);
  const totalPaidAmount = useMemo(() => {
    return customers.flatMap(c => c.paymentHistory || []).filter(p => (p.date || "").includes("Sep 2026") || (p.date || "").includes("01 Sep")).reduce((sum, p) => sum + p.amount, 0) || 500;
  }, [customers]);

  const summaryStats = {
    total: invoices.reduce((a, b) => a + b.amount, 0),
    collected: totalPaidAmount,
    overdue: totalDueAmount,
    paidClients: paidClientCount,
    dueClients: dueClientCount,
  };

  const invStatusConfig: Record<string, { bg: string; color: string; label: string; icon: React.ElementType }> = {
    paid: { bg: "#DCFCE7", color: "#16A34A", label: "Paid", icon: CheckCircle2 },
    pending: { bg: "#DBEAFE", color: "#2563EB", label: "Pending", icon: Clock },
    overdue: { bg: "#FEE2E2", color: "#DC2626", label: "Overdue", icon: AlertTriangle },
    cancelled: { bg: "#F3F4F6", color: "#6B7280", label: "Cancelled", icon: XCircle },
  };

  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--foreground)",
  };

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Customer Invoices & Billing List
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
              {invoices.length} Bills Total
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Monthly ISP billing statements, automated invoice dispatch, and payment statuses
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer"
            style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setShowNewInvoice(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
            style={{ background: "var(--primary)", fontSize: 13 }}
          >
            <Plus size={14} /> New Invoice
          </button>
        </div>
      </div>

      {/* ── Summary Stats (Matching Exact Billing List Aggregations) ─────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {[
          { label: "Paid Client", value: summaryStats.paidClients, sub: "All over paid client", icon: User, iconBg: "#DCFCE7", iconColor: "#16A34A", valColor: "#16A34A" },
          { label: "Due Client", value: summaryStats.dueClients, sub: "All over due client", icon: AlertTriangle, iconBg: "#FEE2E2", iconColor: "#DC2626", valColor: "#DC2626" },
          { label: "Paid Amount", value: `${summaryStats.collected}`, sub: "All over paid amount", icon: DollarSign, iconBg: "#F3E8FF", iconColor: "#9333EA", valColor: "#9333EA" },
          { label: "Due Amount", value: `${summaryStats.overdue}`, sub: "All over due amount", icon: CreditCard, iconBg: "#FEF2F2", iconColor: "#E11D48", valColor: "#E11D48" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl p-4 transition-all" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)" }}>{s.label}</span>
                <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: s.iconBg }}>
                  <Icon size={15} style={{ color: s.iconColor }} />
                </div>
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: s.valColor, marginBottom: 2 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Table Container ──────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search invoice ID, customer, phone, zone..."
              className="w-full pl-9 pr-3 py-2 rounded-lg outline-none"
              style={{ background: "var(--muted)", fontSize: 12, color: "var(--foreground)", border: "1px solid transparent" }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "paid", "pending", "overdue", "cancelled"] as const).map(k => (
              <button
                key={k}
                onClick={() => setStatusFilter(k)}
                className="px-3 py-1.5 rounded-lg capitalize transition-colors"
                style={{
                  fontSize: 11,
                  fontWeight: statusFilter === k ? 600 : 400,
                  background: statusFilter === k ? "var(--primary)" : "var(--muted)",
                  color: statusFilter === k ? "white" : "var(--muted-foreground)",
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

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
                      <div className="flex items-center gap-1.5">
                        <button
                          title="View & Print Invoice"
                          onClick={() => setSelectedInvoice(inv)}
                          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Eye size={13} style={{ color: "var(--foreground)" }} />
                        </button>

                        {inv.status !== "paid" && (
                          <button
                            title="Collect Manual Payment (Cash / bKash / Nagad)"
                            onClick={() => openManualPaymentModal(inv)}
                            className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 border border-emerald-500/20 transition-all cursor-pointer shadow-xs"
                          >
                            <Zap size={11} /> Pay
                          </button>
                        )}

                        <button
                          title="Send SMS Reminder"
                          onClick={() => showToast(`SMS reminder dispatched to ${inv.phone} for Invoice ${inv.id}`)}
                          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Send size={13} style={{ color: "var(--muted-foreground)" }} />
                        </button>
                        <button
                          title="Print Invoice"
                          onClick={() => { setSelectedInvoice(inv); setTimeout(() => window.print(), 300); }}
                          className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors cursor-pointer"
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

      {/* ── View / Print Invoice Voucher Modal ───────────────────────────────── */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div
            className="rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
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

            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 px-2.5 rounded-2xl bg-white border border-border shadow-xs flex items-center justify-center flex-shrink-0">
                    <img
                      src="/maabestnetwork.png"
                      alt="MAA BEST NETWORK"
                      className="h-8 max-w-[100px] object-contain"
                    />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--foreground)" }}>
                      MAA BEST NETWORK
                    </h2>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Holding 12, Main Road, Block B, Dhaka, Bangladesh</p>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Support: +880 9611-223344 · BIN: BIN-002918274-0102</p>
                  </div>
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

            <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-border bg-muted/30">
              <div>
                {selectedInvoice.status !== "paid" && (
                  <button
                    type="button"
                    onClick={() => {
                      const inv = selectedInvoice;
                      setSelectedInvoice(null);
                      openManualPaymentModal(inv);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Zap size={14} /> Collect Manual Payment (৳)
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-muted cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer size={13} /> Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create New Invoice Modal ─────────────────────────────────────────── */}
      {showNewInvoice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl bg-card border border-border max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Create Customer Invoice
                </h3>
              </div>
              <button onClick={() => setShowNewInvoice(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* ── SUBSCRIBER FAST SEARCH / AUTO-FILL ── */}
              <div className="space-y-1 relative">
                <label className="font-extrabold text-muted-foreground flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <Search size={12} className="text-primary" />
                  <span>Search & Select Subscriber (Auto-Fill)</span>
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by User ID (e.g. MBN0001), Phone (017...), or Name..."
                    value={custSearchQuery}
                    onChange={e => {
                      setCustSearchQuery(e.target.value);
                      setShowCustSuggestions(true);
                    }}
                    onFocus={() => setShowCustSuggestions(true)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-primary/40 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-primary shadow-xs"
                  />
                  {custSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustSearchQuery("");
                        setSelectedCustDetails(null);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Auto-suggest dropdown */}
                {showCustSuggestions && matchingCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-52 overflow-y-auto rounded-2xl bg-card border border-border shadow-2xl p-1.5 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-extrabold text-muted-foreground uppercase border-b border-border">
                      Select Subscriber from Database ({matchingCustomers.length} Found)
                    </div>
                    {matchingCustomers.map(cust => (
                      <div
                        key={cust.id}
                        onClick={() => handleSelectCustomer(cust)}
                        className="p-2 rounded-xl hover:bg-primary/10 transition-colors cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span>{cust.name}</span>
                            <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black bg-primary/10 text-primary border border-primary/20">
                              {cust.clientCode || cust.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {cust.phone} · {cust.package} (৳{cust.price})
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cust.dueAmount > 0 ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                          }`}>
                            {cust.dueAmount > 0 ? `Due: ৳${cust.dueAmount}` : "Active"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Customer Verified Chip */}
              {selectedCustDetails && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                    <span>Verified: {selectedCustDetails.name} ({selectedCustDetails.clientCode || selectedCustDetails.id})</span>
                  </div>
                  <span className="font-mono font-black">Plan: ৳{selectedCustDetails.price}/mo</span>
                </div>
              )}

              {/* Fields */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">CUSTOMER NAME *</label>
                  <input
                    value={newInv.customer}
                    onChange={e => setNewInv(p => ({ ...p, customer: e.target.value }))}
                    placeholder="e.g. Shakil Chowdhury"
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">USER / CLIENT ID</label>
                  <input
                    value={newInv.custId}
                    onChange={e => setNewInv(p => ({ ...p, custId: e.target.value }))}
                    placeholder="e.g. MBN0001"
                    className="w-full px-3 py-2 rounded-xl outline-none font-mono font-bold text-primary"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PHONE NUMBER</label>
                  <input
                    value={newInv.phone}
                    onChange={e => setNewInv(p => ({ ...p, phone: e.target.value }))}
                    placeholder="01711-000000"
                    className="w-full px-3 py-2 rounded-xl outline-none font-mono"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">ZONE / AREA</label>
                  <input
                    type="text"
                    value={newInv.zone}
                    onChange={e => setNewInv(p => ({ ...p, zone: e.target.value }))}
                    placeholder="e.g. Kalkini Somitir Hat"
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PACKAGE</label>
                  <select
                    value={newInv.pkgName}
                    onChange={e => {
                      const selPkg = billingStore.getPackages().find(x => x.name === e.target.value);
                      setNewInv(p => ({ ...p, pkgName: e.target.value, amount: (selPkg ? selPkg.price : 1200).toString() }));
                    }}
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={inputStyle}
                  >
                    {billingStore.getPackages().map(p => (
                      <option key={p.id} value={p.name}>{p.name} (৳{p.price})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PACKAGE FEE (৳) *</label>
                  <input
                    type="number"
                    value={newInv.amount}
                    onChange={e => setNewInv(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl outline-none font-mono font-bold text-primary"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">BILLING MONTH</label>
                  <input
                    value={newInv.period}
                    onChange={e => setNewInv(p => ({ ...p, period: e.target.value }))}
                    placeholder="Aug 2026"
                    className="w-full px-3 py-2 rounded-xl outline-none font-bold"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">DUE DATE</label>
                  <input
                    value={newInv.due}
                    onChange={e => setNewInv(p => ({ ...p, due: e.target.value }))}
                    placeholder="10 Aug 2026"
                    className="w-full px-3 py-2 rounded-xl outline-none font-bold"
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
                  <span className="font-semibold text-muted-foreground">Include 5% BTRC Telecom VAT</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowNewInvoice(false)}
                className="flex-1 py-2.5 rounded-xl text-xs border border-border hover:bg-muted font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvoice}
                disabled={!newInv.customer || !newInv.amount}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MANUAL PAYMENT SETTLEMENT MODAL ──────────────────────────────────── */}
      {showPayModal && payTargetInvoice && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-emerald-500" />
                <h3 className="font-black text-base text-foreground">
                  Manual Bill Payment Settlement
                </h3>
              </div>
              <button onClick={() => setShowPayModal(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Target Invoice & Customer Info Card */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-foreground">{payTargetInvoice.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {payTargetInvoice.status}
                </span>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-foreground text-sm">{payTargetInvoice.customer}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{payTargetInvoice.custId} · {payTargetInvoice.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">INVOICE DUE</p>
                  <p className="text-base font-black text-primary font-mono">৳ {payTargetInvoice.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1.5">SELECT PAYMENT METHOD</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "Cash", label: "Cash Desk", icon: DollarSign },
                    { id: "bKash", label: "bKash Direct", icon: Smartphone },
                    { id: "Nagad", label: "Nagad Pay", icon: Smartphone },
                    { id: "Rocket", label: "DBBL Rocket", icon: Smartphone },
                    { id: "Bank", label: "Card / Bank", icon: CreditCard },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        payMethod === m.id
                          ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                          : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                      }`}>
                      <span className="text-[11px] font-bold block">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">COLLECTED AMOUNT (৳) *</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono font-bold text-foreground text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">DISCOUNT / WAIVER (৳)</label>
                  <input
                    type="number"
                    value={payDiscount}
                    onChange={e => setPayDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono font-bold text-foreground text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">TRANSACTION ID / MEMO #</label>
                  <input
                    type="text"
                    value={payTrxId}
                    onChange={e => setPayTrxId(e.target.value)}
                    placeholder="e.g. BKH88992211"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 font-mono text-foreground text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">COLLECTED BY</label>
                  <input
                    type="text"
                    value={payCollectedBy}
                    onChange={e => setPayCollectedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">NOTES / REFERENCE</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  placeholder="e.g. Counter deposit, verified by subscriber"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-muted/30 text-foreground text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={paySendSms}
                    onChange={e => setPaySendSms(e.target.checked)}
                    className="rounded accent-primary"
                  />
                  <span>Send instant SMS confirmation to {payTargetInvoice.phone}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowPayModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-border hover:bg-muted text-foreground font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmManualPayment}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5">
                <Check size={14} /> Confirm & Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
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
