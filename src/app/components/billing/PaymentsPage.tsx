import { useState, useEffect, useMemo } from "react";
import {
  CreditCard, Search, Plus, Download, CheckCircle2, Clock, XCircle,
  Smartphone, Building2, FileText, X, Check, User, Phone, MapPin, Zap, ShieldCheck
} from "lucide-react";
import {
  billingStore, type Payment
} from "./billingData";
import { useCustomerContext, Customer } from "../../context/CustomerContext";

interface PaymentsPageProps {
  onNavigate?: (page: string) => void;
}

export function PaymentsPage({ onNavigate }: PaymentsPageProps) {
  const { customers, processPayment } = useCustomerContext();
  const [payments, setPayments] = useState<Payment[]>(billingStore.getPayments());
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [toast, setToast] = useState("");

  // Customer Auto-Search state
  const [custSearchQuery, setCustSearchQuery] = useState("");
  const [showCustSuggestions, setShowCustSuggestions] = useState(false);
  const [selectedCustDetails, setSelectedCustDetails] = useState<Customer | null>(null);

  const [newPay, setNewPay] = useState({
    customer: "", custId: "", invoice: "", amount: "",
    method: "bKash" as Payment["method"], txn: "", channel: "Direct Settlement",
    collector: "Admin Cashier", sendSms: true, notes: ""
  });

  useEffect(() => {
    return billingStore.subscribe(() => {
      setPayments(billingStore.getPayments());
    });
  }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  // Filter matching customers for payment collection
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
    const existingInvs = billingStore.getInvoices().filter(i => (i.custId === cust.id || i.custId === cust.clientCode) && i.status !== "paid");
    const targetInvId = existingInvs.length > 0 ? existingInvs[0].id : `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setNewPay(prev => ({
      ...prev,
      customer: cust.name,
      custId: cust.clientCode || cust.id,
      invoice: targetInvId,
      amount: (cust.dueAmount > 0 ? cust.dueAmount : cust.price || 1200).toString(),
    }));
    setCustSearchQuery(`${cust.name} (${cust.clientCode || cust.id})`);
    setShowCustSuggestions(false);
    showToast(`✓ Auto-selected subscriber: ${cust.name} (${cust.clientCode || cust.id})`);
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

    billingStore.addPayment(payment);

    // Sync with CustomerContext to update subscriber due balance & active dates
    if (processPayment) {
      const mappedMethod: "Cash" | "bKash" | "Nagad" | "Rocket" | "Card" =
        newPay.method === "Bank" || newPay.method === "SSLCommerz" ? "Card" : (newPay.method as any);
      processPayment(newPay.custId, payment.amount, mappedMethod, payment.txn, now);
    }

    setShowRecordPayment(false);
    showToast(`Payment ${payId} recorded ৳${payment.amount.toLocaleString()} via ${payment.method} for ${payment.customer}`);
    setNewPay({
      customer: "", custId: "", invoice: "", amount: "",
      method: "bKash", txn: "", channel: "Direct Settlement",
      collector: "Admin Cashier", sendSms: true, notes: ""
    });
    setCustSearchQuery("");
    setSelectedCustDetails(null);
  };

  const filteredPayments = payments.filter(pay => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      pay.id.toLowerCase().includes(q) ||
      pay.customer.toLowerCase().includes(q) ||
      pay.custId.toLowerCase().includes(q) ||
      pay.txn.toLowerCase().includes(q) ||
      pay.invoice.toLowerCase().includes(q);
    const matchMethod = methodFilter === "all" || pay.method === methodFilter;
    const matchStatus = statusFilter === "all" || pay.status === statusFilter;
    return matchSearch && matchMethod && matchStatus;
  });

  const exportPaymentsCSV = () => {
    const headers = ["Payment ID", "Customer", "Customer ID", "Invoice Ref", "Amount", "Method", "Txn ID", "Date", "Time", "Added By", "Channel", "Status"];
    const rows = filteredPayments.map(p => [
      p.id, p.customer, p.custId, p.invoice, p.amount, p.method, p.txn, p.date, p.time, p.addedBy, p.channel, p.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `Payments_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const paymentStats = {
    total: payments.reduce((a, b) => a + b.amount, 0),
    bkash: payments.filter(p => p.method === "bKash").reduce((a, b) => a + b.amount, 0),
    nagad: payments.filter(p => p.method === "Nagad").reduce((a, b) => a + b.amount, 0),
    bankCash: payments.filter(p => p.method === "Bank" || p.method === "Cash" || p.method === "SSLCommerz").reduce((a, b) => a + b.amount, 0),
    count: payments.length,
    pendingVerif: payments.filter(p => p.status === "pending").length,
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
              Received Payments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "#DCFCE7", color: "#16A34A" }}>
              ৳{(paymentStats.total / 1000).toFixed(1)}K Total Collections
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Live payment transactions, digital gateway reconciliations (bKash/Nagad), and cash counter receipts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportPaymentsCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer"
            style={{ background: "var(--card)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setShowRecordPayment(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all cursor-pointer"
            style={{ background: "#16A34A", fontSize: 13 }}
          >
            <Plus size={14} /> Record Payment
          </button>
        </div>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
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
          <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{paymentStats.count} successful payment transactions</p>
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

      {/* ── Payments Table ───────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted-foreground)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Txn ID, customer, invoice..."
              className="w-full pl-9 pr-3 py-2 rounded-lg outline-none"
              style={{ background: "var(--muted)", fontSize: 12, color: "var(--foreground)", border: "1px solid transparent" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
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
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
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
                          billingStore.setPayments(payments.map(x => x.id === p.id ? { ...x, status: "verified" } : x));
                          showToast(`Payment ${p.id} verified!`);
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

      {/* ── Record Payment Modal ─────────────────────────────────────────────── */}
      {showRecordPayment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl bg-card border border-border max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600" />
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--foreground)" }}>
                  Record Payment
                </h3>
              </div>
              <button onClick={() => setShowRecordPayment(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* ── SUBSCRIBER FAST SEARCH / AUTO-FILL ── */}
              <div className="space-y-1 relative">
                <label className="font-extrabold text-muted-foreground flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <Search size={12} className="text-primary" />
                  <span>SEARCH & SELECT SUBSCRIBER (USER ID / PHONE / NAME)</span>
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search User ID (e.g. MBN0001), Phone (017...), or Name..."
                    value={custSearchQuery}
                    onChange={e => {
                      setCustSearchQuery(e.target.value);
                      setShowCustSuggestions(true);
                    }}
                    onFocus={() => setShowCustSuggestions(true)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-emerald-500/40 bg-muted/20 text-xs font-semibold text-foreground outline-none focus:border-emerald-500 shadow-xs"
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
                      Select Subscriber to Collect Bill ({matchingCustomers.length} Found)
                    </div>
                    {matchingCustomers.map(cust => (
                      <div
                        key={cust.id}
                        onClick={() => handleSelectCustomer(cust)}
                        className="p-2 rounded-xl hover:bg-emerald-500/10 transition-colors cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span>{cust.name}</span>
                            <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              {cust.clientCode || cust.id}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {cust.phone} · {cust.subzone || cust.zone} · {cust.package}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cust.dueAmount > 0 ? "bg-rose-500/10 text-rose-600 font-mono" : "bg-emerald-500/10 text-emerald-600"
                          }`}>
                            {cust.dueAmount > 0 ? `Due: ৳${cust.dueAmount}` : "Active (৳0 Due)"}
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
                    <span>Customer: {selectedCustDetails.name} ({selectedCustDetails.clientCode || selectedCustDetails.id})</span>
                  </div>
                  <span className="font-mono font-black">Plan: ৳{selectedCustDetails.price}/mo</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">CUSTOMER NAME *</label>
                  <input
                    value={newPay.customer}
                    onChange={e => setNewPay(p => ({ ...p, customer: e.target.value }))}
                    placeholder="e.g. Rahim Uddin"
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">USER / CLIENT ID</label>
                  <input
                    value={newPay.custId}
                    onChange={e => setNewPay(p => ({ ...p, custId: e.target.value }))}
                    placeholder="MBN0001"
                    className="w-full px-3 py-2 rounded-xl outline-none font-mono font-bold text-emerald-600"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">INVOICE NUMBER</label>
                  <input
                    value={newPay.invoice}
                    onChange={e => setNewPay(p => ({ ...p, invoice: e.target.value }))}
                    placeholder="INV-10204"
                    className="w-full px-3 py-2 rounded-xl outline-none font-mono font-bold"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">AMOUNT (৳) *</label>
                  <input
                    type="number"
                    value={newPay.amount}
                    onChange={e => setNewPay(p => ({ ...p, amount: e.target.value }))}
                    placeholder="1200"
                    className="w-full px-3 py-2 rounded-xl outline-none font-mono font-black text-emerald-600"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">PAYMENT METHOD</label>
                  <select
                    value={newPay.method}
                    onChange={e => setNewPay(p => ({ ...p, method: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl outline-none"
                    style={inputStyle}
                  >
                    <option value="bKash">bKash Direct</option>
                    <option value="Nagad">Nagad Pay</option>
                    <option value="Cash">Cash Desk</option>
                    <option value="Rocket">DBBL Rocket</option>
                    <option value="Bank">Bank Deposit</option>
                    <option value="SSLCommerz">SSLCommerz (Card)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground block mb-1">TRANSACTION ID / REF</label>
                  <input
                    value={newPay.txn}
                    onChange={e => setNewPay(p => ({ ...p, txn: e.target.value }))}
                    placeholder="Auto-generated if blank"
                    className="w-full px-3 py-2 rounded-xl outline-none font-mono"
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
                  className="w-full px-3 py-2 rounded-xl outline-none"
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
                <span className="text-foreground font-medium">Send SMS instant payment receipt to customer mobile</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowRecordPayment(false)}
                className="flex-1 py-2.5 rounded-xl text-xs border border-border hover:bg-muted font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={!newPay.customer || !newPay.amount}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Money Receipt Modal ──────────────────────────────────────────────── */}
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
                <FileText size={13} /> Print Slip
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
