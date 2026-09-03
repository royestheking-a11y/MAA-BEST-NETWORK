import { useState, useMemo } from "react";
import {
  CreditCard, Search, Printer, CheckCircle2, QrCode, Phone,
  User, DollarSign, RefreshCw, Send, Check, X, Building2,
  Receipt, ArrowRight, ShieldCheck, Sparkles
} from "lucide-react";
import { billingStore, type Payment } from "./billingData";
import { useCustomerContext } from "../../context/CustomerContext";

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

  const handleSelectCustomer = (c: QuickCustomer) => {
    setSelectedCust(c);
    setCollectAmount(c.dueAmount > 0 ? c.dueAmount.toString() : c.monthlyFee.toString());
    setDiscountAmount("0");
  };

  const handleProcessCollection = (e: React.FormEvent) => {
    e.preventDefault();
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
                className="w-full py-3 rounded-2xl bg-primary hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer">
                <CheckCircle2 size={16} />
                <span>Confirm Payment & Print Receipt</span>
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

            {printedReceipt ? (
              <div className="p-4 bg-white text-black font-mono text-xs rounded-2xl border border-gray-300 shadow-inner mt-3 space-y-3">
                <div className="text-center pb-2 border-b border-dashed border-gray-400">
                  <div className="font-black text-sm tracking-wider">MAA BEST NETWORK</div>
                  <div className="text-[10px] text-gray-600">Somitir Hat Bazar, Kalkini, Madaripur · Hotline: 01788-990011</div>
                  <div className="text-[10px] text-gray-600">OFFICIAL MONEY RECEIPT</div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Receipt No:</span>
                    <strong>{printedReceipt.receiptNo}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{printedReceipt.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <strong>{printedReceipt.customer}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer ID:</span>
                    <span>{printedReceipt.custId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mobile:</span>
                    <span>{printedReceipt.phone}</span>
                  </div>
                </div>

                <div className="py-2 border-t border-b border-dashed border-gray-400 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Package: {printedReceipt.pkgName}</span>
                    <span>৳{printedReceipt.subtotal}</span>
                  </div>
                  {printedReceipt.discount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Discount:</span>
                      <span>-৳{printedReceipt.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-gray-300">
                    <span>NET PAID:</span>
                    <span>৳{printedReceipt.netPaid}</span>
                  </div>
                </div>

                <div className="text-center text-[10px] text-gray-600 pt-1 space-y-1">
                  <div>Payment Mode: CASH (WALK-IN COUNTER)</div>
                  <div>Collected by: {printedReceipt.collectedBy}</div>
                  <div className="font-bold text-black mt-2">THANK YOU FOR CHOOSING MAA BEST NETWORK!</div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-xs italic mt-8">
                Processed receipts will generate here with 80mm thermal printer format.
              </div>
            )}
          </div>

          {printedReceipt && (
            <button
              onClick={() => showToast(`Printing 80mm thermal receipt for ${printedReceipt.customer}...`)}
              className="w-full mt-4 py-2.5 rounded-2xl bg-card border border-border hover:bg-muted text-foreground font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs">
              <Printer size={14} />
              <span>Print Thermal Copy</span>
            </button>
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
