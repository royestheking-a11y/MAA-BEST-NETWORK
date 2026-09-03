import React, { useState, useMemo } from "react";
import {
  CreditCard, Download, Printer, Search, CheckCircle2,
  Calendar, Filter, X, ArrowUpDown, DollarSign
} from "lucide-react";
import { useCustomerContext } from "../../context/CustomerContext";

interface PaymentProcessingFeeReportPageProps {
  onNavigate?: (page: string) => void;
}

interface ProcessingFeeRow {
  id: string;
  trxNo: string;
  pUType: string;
  provider: "bKash" | "Nagad" | "Rocket" | "Upay" | "SSLCommerz";
  gateway: string;
  feeType: string;
  paidAmount: number;
  feePercent: number;
  feeAmount: number;
  vatCer: string;
  appVat: string;
  vatAmount: number;
  exFeeName: string;
  appExFee: string;
  exFeeAmount: number;
  ppFeeAmount: number;
  stlAmount: number;
  netAmount: number;
}

const DEFAULT_FEE_ROWS: ProcessingFeeRow[] = [
  {
    id: "fee-1",
    trxNo: "TRX-829101",
    pUType: "Client",
    provider: "bKash",
    gateway: "bKash Online PGW",
    feeType: "Percentage",
    paidAmount: 500.00,
    feePercent: 1.5,
    feeAmount: 7.50,
    vatCer: "VAT-01",
    appVat: "15%",
    vatAmount: 1.13,
    exFeeName: "MFS Surcharge",
    appExFee: "Fixed",
    exFeeAmount: 0.00,
    ppFeeAmount: 8.63,
    stlAmount: 491.37,
    netAmount: 491.37
  },
  {
    id: "fee-2",
    trxNo: "TRX-829102",
    pUType: "Client",
    provider: "Nagad",
    gateway: "Nagad Direct API",
    feeType: "Percentage",
    paidAmount: 600.00,
    feePercent: 1.2,
    feeAmount: 7.20,
    vatCer: "VAT-01",
    appVat: "15%",
    vatAmount: 1.08,
    exFeeName: "MFS Surcharge",
    appExFee: "Fixed",
    exFeeAmount: 0.00,
    ppFeeAmount: 8.28,
    stlAmount: 591.72,
    netAmount: 591.72
  },
  {
    id: "fee-3",
    trxNo: "TRX-829103",
    pUType: "Client",
    provider: "bKash",
    gateway: "bKash Online PGW",
    feeType: "Percentage",
    paidAmount: 700.00,
    feePercent: 1.5,
    feeAmount: 10.50,
    vatCer: "VAT-01",
    appVat: "15%",
    vatAmount: 1.58,
    exFeeName: "MFS Surcharge",
    appExFee: "Fixed",
    exFeeAmount: 0.00,
    ppFeeAmount: 12.08,
    stlAmount: 687.92,
    netAmount: 687.92
  }
];

export const PaymentProcessingFeeReportPage: React.FC<PaymentProcessingFeeReportPageProps> = ({ onNavigate }) => {
  const { customers } = useCustomerContext();

  const [customerFilter, setCustomerFilter] = useState("all");
  const [fromDate, setFromDate] = useState("01/08/2026");
  const [toDate, setToDate] = useState("31/08/2026");
  const [pageSize, setPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRows = useMemo(() => {
    return DEFAULT_FEE_ROWS.filter(r => {
      const matchSearch =
        r.trxNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.gateway.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSearch;
    });
  }, [searchQuery]);

  // Totals calculations
  const totalPaid = filteredRows.reduce((s, r) => s + r.paidAmount, 0);
  const totalFee = filteredRows.reduce((s, r) => s + r.feeAmount, 0);
  const totalVat = filteredRows.reduce((s, r) => s + r.vatAmount, 0);
  const totalExFee = filteredRows.reduce((s, r) => s + r.exFeeAmount, 0);
  const totalPpFee = filteredRows.reduce((s, r) => s + r.ppFeeAmount, 0);
  const totalStl = filteredRows.reduce((s, r) => s + r.stlAmount, 0);

  const exportPDF = () => {
    showToast("Generating Payment Processing Fee Report PDF...");
    window.print();
  };

  const exportCSV = () => {
    const headers = [
      "TrxNo.", "P.UType", "Provider", "Gateway", "Fee Type", "PaidAmount",
      "Fee(%)", "FeeAmount", "VAT.Cer", "App.VAT", "VAT.Amount",
      "Ex.FeeName", "App.Ex.Fee", "Ex.FeeAmount", "P.P.FeeAmount", "STL.Amount"
    ];
    const rows = filteredRows.map(r => [
      r.trxNo, r.pUType, r.provider, r.gateway, r.feeType, r.paidAmount,
      r.feePercent, r.feeAmount, r.vatCer, r.appVat, r.vatAmount,
      r.exFeeName, r.appExFee, r.exFeeAmount, r.ppFeeAmount, r.stlAmount
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Payment_Processing_Fee_Report_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✓ Exported processing fee report to CSV.`);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1600px] mx-auto min-h-screen pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-primary/20 text-xs font-semibold animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header (Screenshot 5 Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <CreditCard size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Report</h1>
              <span className="text-sm font-normal text-muted-foreground hidden sm:inline">Payment Processing Fee Report</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Report</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">P.Processing Fee Report</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Generate PDF */}
          <button
            onClick={exportPDF}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:opacity-90 shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>Generate PDF</span>
          </button>

          {/* Generate CSV */}
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-95 shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Generate CSV</span>
          </button>
        </div>
      </div>

      {/* Filters (CUSTOMER, FROM DATE, TO DATE) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">CUSTOMER</label>
            <select
              value={customerFilter}
              onChange={e => setCustomerFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
            >
              <option value="all">Select / All Customers</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.clientCode || c.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">FROM DATE</label>
            <input
              type="text"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              placeholder="01/08/2026"
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">TO DATE</label>
            <input
              type="text"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              placeholder="31/08/2026"
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Table Controls (SHOW ENTRIES & SEARCH) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>SHOW</span>
          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-md bg-card border border-border text-foreground outline-none text-xs"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>ENTRIES</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted-foreground uppercase">SEARCH:</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder=""
              className="w-48 sm:w-64 px-3 py-1.5 text-xs rounded-md bg-card border border-border text-foreground outline-none focus:border-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table (Screenshot 5 Exact Layout) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/80 text-foreground border-b border-border font-bold">
                <th className="py-3 px-2.5 whitespace-nowrap">TrxNo.</th>
                <th className="py-3 px-2.5 whitespace-nowrap">P.UType</th>
                <th className="py-3 px-2.5 whitespace-nowrap">Provider</th>
                <th className="py-3 px-2.5 whitespace-nowrap">Gateway</th>
                <th className="py-3 px-2.5 whitespace-nowrap">Fee Type</th>
                <th className="py-3 px-2.5 text-right whitespace-nowrap">PaidAmount</th>
                <th className="py-3 px-2 text-center whitespace-nowrap">Fee(%)</th>
                <th className="py-3 px-2.5 text-right whitespace-nowrap">FeeAmount</th>
                <th className="py-3 px-2 whitespace-nowrap">VAT.Cer</th>
                <th className="py-3 px-2 whitespace-nowrap">App.VAT</th>
                <th className="py-3 px-2.5 text-right whitespace-nowrap">VAT.Amount</th>
                <th className="py-3 px-2.5 whitespace-nowrap">Ex.FeeName</th>
                <th className="py-3 px-2 whitespace-nowrap">App.Ex.Fee</th>
                <th className="py-3 px-2.5 text-right whitespace-nowrap">Ex.FeeAmount</th>
                <th className="py-3 px-2.5 text-right whitespace-nowrap">P.P.FeeAmount</th>
                <th className="py-3 px-2.5 text-right whitespace-nowrap">STL.Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-muted-foreground">
                    No data available in table
                  </td>
                </tr>
              ) : (
                filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                  >
                    <td className="py-2.5 px-2.5 font-mono font-medium text-foreground whitespace-nowrap">{r.trxNo}</td>
                    <td className="py-2.5 px-2.5 text-muted-foreground whitespace-nowrap">{r.pUType}</td>
                    <td className="py-2.5 px-2.5 font-semibold text-foreground whitespace-nowrap">{r.provider}</td>
                    <td className="py-2.5 px-2.5 text-muted-foreground whitespace-nowrap">{r.gateway}</td>
                    <td className="py-2.5 px-2.5 text-muted-foreground whitespace-nowrap">{r.feeType}</td>
                    <td className="py-2.5 px-2.5 font-mono text-right text-foreground whitespace-nowrap">৳ {r.paidAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-center text-muted-foreground whitespace-nowrap">{r.feePercent}%</td>
                    <td className="py-2.5 px-2.5 font-mono text-right text-rose-600 whitespace-nowrap">৳ {r.feeAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-2 font-mono text-muted-foreground whitespace-nowrap">{r.vatCer}</td>
                    <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap">{r.appVat}</td>
                    <td className="py-2.5 px-2.5 font-mono text-right text-rose-600 whitespace-nowrap">৳ {r.vatAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-2.5 text-muted-foreground whitespace-nowrap">{r.exFeeName}</td>
                    <td className="py-2.5 px-2 text-muted-foreground whitespace-nowrap">{r.appExFee}</td>
                    <td className="py-2.5 px-2.5 font-mono text-right text-foreground whitespace-nowrap">৳ {r.exFeeAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-2.5 font-mono text-right font-bold text-rose-600 whitespace-nowrap">৳ {r.ppFeeAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-2.5 font-mono text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">৳ {r.stlAmount.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Totals Summary Row (Screenshot 5 Exact Layout) */}
            <tfoot>
              <tr className="bg-muted/60 border-t-2 border-border font-bold text-foreground">
                <td colSpan={5} className="py-3 px-4 text-center uppercase tracking-wider">Total</td>
                <td className="py-3 px-2.5 font-mono text-right">৳ {totalPaid.toFixed(2)}</td>
                <td></td>
                <td className="py-3 px-2.5 font-mono text-right text-rose-600">৳ {totalFee.toFixed(2)}</td>
                <td></td>
                <td></td>
                <td className="py-3 px-2.5 font-mono text-right text-rose-600">৳ {totalVat.toFixed(2)}</td>
                <td></td>
                <td></td>
                <td className="py-3 px-2.5 font-mono text-right">৳ {totalExFee.toFixed(2)}</td>
                <td className="py-3 px-2.5 font-mono text-right text-rose-600">৳ {totalPpFee.toFixed(2)}</td>
                <td className="py-3 px-2.5 font-mono text-right text-emerald-600 dark:text-emerald-400">৳ {totalStl.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <p>Showing 1 to {filteredRows.length} of {filteredRows.length} entries</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
