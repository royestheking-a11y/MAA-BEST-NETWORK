import { useState, useMemo } from "react";
import {
  CreditCard, Search, Printer, CheckCircle2, QrCode, Phone,
  User, DollarSign, RefreshCw, Send, Check, X, Building2,
  Receipt, ArrowRight, ShieldCheck, Sparkles, Download, FileText,
  MessageCircle, Share2
} from "lucide-react";
import { billingStore, type Payment } from "./billingData";
import { useCustomerContext } from "../../context/CustomerContext";
import { usePermission } from "../../context/AuthContext";

interface CashDeskPageProps {
  onNavigate?: (page: string) => void;
}

interface QuickCustomer {
  id: string;
  name: string;
  phone: string;
  zone: string;
  pkgName: string;
  monthlyFee: number;
  dueAmount: number;
  advanceBalance: number;
  status: "active" | "due" | "suspended";
}

export function CashDeskPage({ onNavigate }: CashDeskPageProps) {
  const { customers, processPayment } = useCustomerContext();
  const { canEdit, isReadOnly } = usePermission("cash-desk");

  const cashCustomers: QuickCustomer[] = useMemo(() => {
    return customers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      zone: c.subzone || c.zone,
      pkgName: c.package,
      monthlyFee: c.price,
      dueAmount: c.dueAmount,
      advanceBalance: 0,
      status: (c.status === "active" || c.status === "due" || c.status === "suspended") ? c.status : "active" as const
    }));
  }, [customers]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCust, setSelectedCust] = useState<QuickCustomer | null>(() => cashCustomers[0] || null);
  const [collectAmount, setCollectAmount] = useState(() => (cashCustomers[0]?.dueAmount || cashCustomers[0]?.monthlyFee || 1200).toString());
  const [discountAmount, setDiscountAmount] = useState("0");
  const [collectedBy, setCollectedBy] = useState("Cashier - Kalkini Main Branch");
  const [printedReceipt, setPrintedReceipt] = useState<any | null>(null);
  const [toast, setToast] = useState("");
  const [sendSms, setSendSms] = useState(true);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const activeReceipt = useMemo(() => {
    if (printedReceipt) return printedReceipt;
    if (selectedCust) {
      return {
        receiptNo: `REC-${(selectedCust.id.replace(/\D/g, "") || "10029").slice(-6)}`,
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        customer: selectedCust.name,
        custId: selectedCust.id,
        phone: selectedCust.phone,
        zone: selectedCust.zone,
        pkgName: selectedCust.pkgName,
        subtotal: Number(collectAmount) || selectedCust.monthlyFee,
        discount: Number(discountAmount) || 0,
        netPaid: Math.max(0, (Number(collectAmount) || selectedCust.monthlyFee) - (Number(discountAmount) || 0)),
        collectedBy: collectedBy || "Cashier - Kalkini Main Branch",
        isDraft: true,
      };
    }
    return {
      receiptNo: "REC-100049",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      customer: "Mst. Rohima Akter",
      custId: "CUST-10004",
      phone: "01937418702",
      zone: "Madaripur Sadar",
      pkgName: "20 Mbps Fiber Standard",
      subtotal: 1200,
      discount: 0,
      netPaid: 1200,
      collectedBy: "Cashier - Kalkini Main Branch",
      isDraft: true,
    };
  }, [printedReceipt, selectedCust, collectAmount, discountAmount, collectedBy]);

  const handleDownloadPng = (rc: any) => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 620;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 2;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

    // Header
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("MAA BEST NETWORK", 200, 42);

    ctx.font = "10px 'Courier New', monospace";
    ctx.fillStyle = "#64748B";
    ctx.fillText("Somitir Hat Bazar, Kalkini, Madaripur", 200, 60);
    ctx.fillText("Hotline: 01788-990011 · help@maabestnetwork.com", 200, 75);

    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#0F172A";
    ctx.fillText("OFFICIAL MONEY RECEIPT", 200, 95);

    // Dashed line
    ctx.strokeStyle = "#94A3B8";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, 108);
    ctx.lineTo(380, 108);
    ctx.stroke();

    // Details Left & Right
    ctx.setLineDash([]);
    ctx.font = "11px 'Courier New', monospace";
    ctx.textAlign = "left";

    let y = 130;
    const drawRow = (label: string, val: string, isBold = false) => {
      ctx.fillStyle = "#475569";
      ctx.font = "11px 'Courier New', monospace";
      ctx.fillText(label, 25, y);
      ctx.fillStyle = "#0F172A";
      ctx.font = isBold ? "bold 11px 'Courier New', monospace" : "11px 'Courier New', monospace";
      ctx.textAlign = "right";
      ctx.fillText(val, 375, y);
      ctx.textAlign = "left";
      y += 20;
    };

    drawRow("Receipt No:", rc.receiptNo, true);
    drawRow("Date & Time:", rc.date);
    drawRow("Customer:", rc.customer, true);
    drawRow("Customer ID:", rc.custId);
    drawRow("Mobile:", rc.phone);
    if (rc.zone) drawRow("Zone:", rc.zone);

    // Dashed divider
    y += 5;
    ctx.strokeStyle = "#94A3B8";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(380, y);
    ctx.stroke();
    y += 20;

    // Items
    ctx.setLineDash([]);
    drawRow("Package:", rc.pkgName);
    drawRow("Subtotal:", `৳${rc.subtotal}`);
    if (rc.discount > 0) {
      drawRow("Discount:", `-৳${rc.discount}`);
    }

    // Total highlight box
    y += 5;
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(20, y, 360, 32);
    ctx.strokeStyle = "#CBD5E1";
    ctx.strokeRect(20, y, 360, 32);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillText("NET PAID:", 30, y + 21);
    ctx.textAlign = "right";
    ctx.fillText(`৳${rc.netPaid}`, 370, y + 21);
    ctx.textAlign = "left";

    y += 50;
    // Footer notes
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillStyle = "#64748B";
    ctx.textAlign = "center";
    ctx.fillText("Payment Mode: CASH (WALK-IN COUNTER)", 200, y);
    y += 16;
    ctx.fillText(`Collected by: ${rc.collectedBy || "Counter Executive"}`, 200, y);
    y += 22;
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#0F172A";
    ctx.fillText("THANK YOU FOR CHOOSING MAA BEST NETWORK!", 200, y);

    // Trigger download
    const link = document.createElement("a");
    link.download = `receipt_${rc.receiptNo}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast(`Thermal Receipt (${rc.receiptNo}.png) downloaded!`);
  };

  const handleDownloadHtml = (rc: any) => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt ${rc.receiptNo} - MAA BEST NETWORK</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      width: 76mm;
      margin: 0 auto;
      padding: 10px;
      color: #000;
      background: #fff;
      font-size: 12px;
      line-height: 1.3;
    }
    .text-center { text-align: center; }
    .header { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
    .title { font-size: 16px; font-weight: bold; }
    .subtitle { font-size: 10px; color: #444; }
    .row { display: flex; justify-content: space-between; margin: 4px 0; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; padding-top: 6px; }
    .total-box { font-size: 15px; font-weight: bold; border-top: 1px solid #000; padding-top: 6px; margin-top: 6px; }
    .footer { text-align: center; font-size: 10px; margin-top: 12px; border-top: 1px dashed #000; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="header text-center">
    <div class="title">MAA BEST NETWORK</div>
    <div class="subtitle">Somitir Hat Bazar, Kalkini, Madaripur · Hotline: 01788-990011</div>
    <div style="font-weight: bold; margin-top: 4px;">OFFICIAL MONEY RECEIPT</div>
  </div>
  <div class="row"><span>Receipt No:</span><strong>${rc.receiptNo}</strong></div>
  <div class="row"><span>Date:</span><span>${rc.date}</span></div>
  <div class="row"><span>Customer:</span><strong>${rc.customer}</strong></div>
  <div class="row"><span>Customer ID:</span><span>${rc.custId}</span></div>
  <div class="row"><span>Mobile:</span><span>${rc.phone}</span></div>
  ${rc.zone ? `<div class="row"><span>Zone:</span><span>${rc.zone}</span></div>` : ''}
  <div class="divider">
    <div class="row"><span>Package: ${rc.pkgName}</span><span>৳${rc.subtotal}</span></div>
    ${rc.discount > 0 ? `<div class="row"><span>Discount:</span><span>-৳${rc.discount}</span></div>` : ''}
    <div class="row total-box"><span>NET PAID:</span><span>৳${rc.netPaid}</span></div>
  </div>
  <div class="footer">
    <div>Payment Mode: CASH (WALK-IN COUNTER)</div>
    <div>Collected by: ${rc.collectedBy || "Counter-01"}</div>
    <div style="font-weight: bold; margin-top: 6px;">THANK YOU FOR CHOOSING MAA BEST NETWORK!</div>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt_${rc.receiptNo}.html`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Thermal Receipt (${rc.receiptNo}.html) downloaded!`);
  };

  const handleSendWhatsApp = (rc: any) => {
    const cleanPhone = (rc.phone || "").replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("88") ? cleanPhone : cleanPhone.startsWith("0") ? `88${cleanPhone}` : `880${cleanPhone}`;
    const msg = `*MAA BEST NETWORK - OFFICIAL MONEY RECEIPT*\n\n` +
      `Receipt No: ${rc.receiptNo}\n` +
      `Date: ${rc.date}\n` +
      `Customer: ${rc.customer} (${rc.custId})\n` +
      `Package: ${rc.pkgName}\n` +
      `Amount Paid: ৳${rc.netPaid}\n` +
      `Status: PAID (CASH COUNTER)\n` +
      `Collected by: ${rc.collectedBy}\n\n` +
      `Thank you for staying with MAA BEST NETWORK!\nHotline: 01788-990011`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`, "_blank");
    showToast(`Opened WhatsApp with receipt for ${rc.customer}!`);
  };

  const handlePrintReceipt = (rc: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Print Receipt ${rc.receiptNo}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      width: 72mm;
      margin: 0 auto;
      padding: 8px;
      color: #000;
      background: #fff;
      font-size: 12px;
      line-height: 1.3;
    }
    .text-center { text-align: center; }
    .header { border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
    .title { font-size: 15px; font-weight: bold; }
    .subtitle { font-size: 10px; color: #444; }
    .row { display: flex; justify-content: space-between; margin: 3px 0; }
    .divider { border-top: 1px dashed #000; margin: 6px 0; padding-top: 4px; }
    .total-box { font-size: 14px; font-weight: bold; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
    .footer { text-align: center; font-size: 10px; margin-top: 10px; border-top: 1px dashed #000; padding-top: 6px; }
  </style>
</head>
<body>
  <div class="header text-center">
    <div class="title">MAA BEST NETWORK</div>
    <div class="subtitle">Somitir Hat Bazar, Kalkini, Madaripur · 01788-990011</div>
    <div style="font-weight: bold; margin-top: 2px;">OFFICIAL MONEY RECEIPT</div>
  </div>
  <div class="row"><span>Receipt No:</span><strong>${rc.receiptNo}</strong></div>
  <div class="row"><span>Date:</span><span>${rc.date}</span></div>
  <div class="row"><span>Customer:</span><strong>${rc.customer}</strong></div>
  <div class="row"><span>Customer ID:</span><span>${rc.custId}</span></div>
  <div class="row"><span>Mobile:</span><span>${rc.phone}</span></div>
  <div class="divider">
    <div class="row"><span>Package: ${rc.pkgName}</span><span>৳${rc.subtotal}</span></div>
    ${rc.discount > 0 ? `<div class="row"><span>Discount:</span><span>-৳${rc.discount}</span></div>` : ''}
    <div class="row total-box"><span>NET PAID:</span><span>৳${rc.netPaid}</span></div>
  </div>
  <div class="footer">
    <div>Payment Mode: CASH (WALK-IN)</div>
    <div>Collected by: ${rc.collectedBy}</div>
    <div style="font-weight: bold; margin-top: 4px;">THANK YOU FOR STAYING WITH US!</div>
  </div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSelectCustomer = (c: QuickCustomer) => {
    setSelectedCust(c);
    setCollectAmount(c.dueAmount > 0 ? c.dueAmount.toString() : c.monthlyFee.toString());
    setDiscountAmount("0");
  };

  const handleProcessCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !canEdit) {
      showToast("Access Restricted: Your account role has Read-Only access to Cash Desk.");
      return;
    }
    if (!selectedCust || !collectAmount) return;

    const subtotal = Number(collectAmount);
    const discount = Number(discountAmount || 0);

    if (isNaN(subtotal) || subtotal <= 0) {
      showToast("Security Alert: Invalid collection amount. Amount must be greater than ৳0.");
      return;
    }
    if (subtotal > 500000) {
      showToast("Security Alert: Transaction exceeds maximum allowed single receipt limit (৳5,00,000).");
      return;
    }
    if (isNaN(discount) || discount < 0) {
      showToast("Security Alert: Discount amount cannot be negative.");
      return;
    }
    if (discount >= subtotal) {
      showToast("Security Alert: Discount cannot be 100% or greater than the collection subtotal.");
      return;
    }

    const netPaid = subtotal - discount;
    const receiptData = {
      receiptNo: `REC-${Date.now().toString().slice(-6)}`,
      customer: selectedCust.name,
      custId: selectedCust.id,
      phone: selectedCust.phone,
      zone: selectedCust.zone,
      pkgName: selectedCust.pkgName,
      subtotal: Number(collectAmount),
      discount: Number(discountAmount),
      netPaid: netPaid,
      method: "Cash Desk (Walk-In)",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      collectedBy: collectedBy,
      qrPayload: `MBN-REC|${selectedCust.id}|${netPaid}|${Date.now()}`
    };

    // Add to billing store
    const pmt: Payment = {
      id: `PMT-${(Math.floor(1000 + Math.random() * 9000)).toString()}`,
      invoice: `INV-${(Math.floor(10000 + Math.random() * 9000)).toString()}`,
      customer: selectedCust.name,
      custId: selectedCust.id,
      amount: netPaid,
      method: "Cash",
      txn: receiptData.receiptNo,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      addedBy: collectedBy,
      channel: "Walk-In Counter",
      status: "verified"
    };

    billingStore.addPayment(pmt);
    setPrintedReceipt(receiptData);
    showToast(`✓ Payment of ৳${netPaid.toLocaleString()} collected for ${selectedCust.name}! ${sendSms ? "SMS confirmation sent." : ""}`);
  };

  const filtered = cashCustomers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-3xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Receipt size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-black text-foreground">
                Walk-In Cash Desk & POS Thermal Billing
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Point-of-Sale Mode Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rapid counter payment collection with instant 80mm POS thermal receipt generation and automated SMS confirmation.
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground shadow-xs cursor-pointer">
          <Printer size={14} />
          <span>Printer Setup (80mm ESC/POS)</span>
        </button>
      </div>

      {/* ── Main Layout: Search & Collection Terminal ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left: Quick Customer Lookup */}
        <div className="bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-foreground">Subscriber Lookup</h3>
            <span className="text-[10px] text-muted-foreground">Scan Barcode / Phone</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-border bg-muted/40">
            <Search size={14} className="text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Enter mobile number, name, ID..."
              className="bg-transparent outline-none text-xs text-foreground w-full font-medium"
            />
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto">
            {filtered.map(cust => {
              const isSelected = selectedCust?.id === cust.id;
              return (
                <div
                  key={cust.id}
                  onClick={() => handleSelectCustomer(cust)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary shadow-xs"
                      : "bg-muted/30 border-border hover:bg-muted/60"
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-foreground">{cust.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      cust.dueAmount > 0 ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                    }`}>
                      {cust.dueAmount > 0 ? `৳${cust.dueAmount} DUE` : "PAID"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex justify-between">
                    <span>{cust.phone}</span>
                    <span className="font-mono text-foreground font-semibold">{cust.id}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1 truncate">
                    {cust.pkgName} · {cust.zone}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle: Payment Collection Form */}
        <div className="bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-foreground">Payment Entry</h3>

          {selectedCust ? (
            <form onSubmit={handleProcessCollection} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subscriber Name:</span>
                  <span className="font-bold text-foreground">{selectedCust.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer ID:</span>
                  <span className="font-mono font-bold text-primary">{selectedCust.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Package Rate:</span>
                  <span className="font-mono font-bold text-foreground">৳{selectedCust.monthlyFee.toLocaleString()} / mo</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border">
                  <span className="font-bold text-rose-600">Total Outstanding Due:</span>
                  <span className="font-mono font-black text-rose-600 text-sm">৳{selectedCust.dueAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">CASH AMOUNT TO COLLECT (BDT)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">৳</span>
                  <input
                    required
                    type="number"
                    value={collectAmount}
                    onChange={e => setCollectAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground font-mono text-base font-black outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">DISCOUNT / WAIVER (BDT)</label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={e => setDiscountAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-muted-foreground block mb-1">COLLECTED BY</label>
                  <input
                    value={collectedBy}
                    onChange={e => setCollectedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-muted/40 text-foreground font-semibold outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-muted/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendSms}
                  onChange={e => setSendSms(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
                <span className="font-bold text-foreground text-xs">Send instant SMS receipt with payment confirmation</span>
              </label>

              <button
                type="submit"
                disabled={isReadOnly || !canEdit}
                className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
                  isReadOnly || !canEdit
                    ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                    : "bg-primary hover:opacity-95 text-white cursor-pointer"
                }`}>
                <CheckCircle2 size={16} />
                <span>{isReadOnly || !canEdit ? "Read-Only: Collection Disabled" : "Confirm Payment & Print Receipt"}</span>
              </button>
            </form>
          ) : (
            <div className="p-8 text-center text-muted-foreground italic text-xs">
              Select a customer from the left list to initiate counter collection.
            </div>
          )}
        </div>

        {/* Right: Thermal POS 80mm Live Preview */}
        <div className="bg-card p-4 md:p-5 rounded-3xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-extrabold text-sm text-foreground">POS Thermal Receipt Preview</h3>
              <span className="text-[10px] font-mono text-muted-foreground">80mm Paper</span>
            </div>

            {activeReceipt && (
              <div className="p-4 bg-white text-black font-mono text-xs rounded-2xl border border-gray-300 shadow-inner mt-3 space-y-3">
                <div className="text-center pb-2 border-b border-dashed border-gray-400">
                  <div className="font-black text-sm tracking-wider">MAA BEST NETWORK</div>
                  <div className="text-[10px] text-gray-600">Somitir Hat Bazar, Kalkini, Madaripur · Hotline: 01788-990011</div>
                  <div className="text-[10px] text-gray-600 font-bold mt-0.5">OFFICIAL MONEY RECEIPT</div>
                  {activeReceipt.isDraft && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      LIVE COUNTER DRAFT
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Receipt No:</span>
                    <strong>{activeReceipt.receiptNo}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{activeReceipt.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <strong>{activeReceipt.customer}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer ID:</span>
                    <span>{activeReceipt.custId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mobile:</span>
                    <span>{activeReceipt.phone}</span>
                  </div>
                  {activeReceipt.zone && (
                    <div className="flex justify-between">
                      <span>Zone:</span>
                      <span>{activeReceipt.zone}</span>
                    </div>
                  )}
                </div>

                <div className="py-2 border-t border-b border-dashed border-gray-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Package: {activeReceipt.pkgName}</span>
                    <span>৳{activeReceipt.subtotal}</span>
                  </div>
                  {activeReceipt.discount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Discount:</span>
                      <span>-৳{activeReceipt.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-gray-300">
                    <span>NET PAID:</span>
                    <span>৳{activeReceipt.netPaid}</span>
                  </div>
                </div>

                <div className="text-center text-[10px] text-gray-600 pt-1 space-y-1">
                  <div>Payment Mode: CASH (WALK-IN COUNTER)</div>
                  <div>Collected by: {activeReceipt.collectedBy}</div>
                  <div className="font-bold text-black mt-2">THANK YOU FOR CHOOSING MAA BEST NETWORK!</div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons for Download, WhatsApp & Print */}
          {activeReceipt && (
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownloadPng(activeReceipt)}
                  className="py-2.5 px-3 rounded-xl bg-primary hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  title="Download Receipt Image (PNG) to send via WhatsApp or email"
                >
                  <Download size={14} />
                  <span>Download PNG</span>
                </button>

                <button
                  onClick={() => handleDownloadHtml(activeReceipt)}
                  className="py-2.5 px-3 rounded-xl bg-card border border-border hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  title="Download HTML Printable File"
                >
                  <FileText size={14} />
                  <span>Download HTML</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSendWhatsApp(activeReceipt)}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  title="Send receipt details to customer via WhatsApp"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => handlePrintReceipt(activeReceipt)}
                  className="py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all border border-border"
                  title="Print on connected 80mm thermal receipt printer"
                >
                  <Printer size={14} />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-[#130606] text-white text-xs font-semibold animate-slideUp"
        >
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="ml-2 hover:opacity-75 cursor-pointer">
            <X size={14} className="text-white/60" />
          </button>
        </div>
      )}
    </div>
  );
}
