import React, { useState, useMemo } from "react";
import {
  DollarSign, Download, Printer, Search, CheckCircle2,
  Calendar, Filter, X, ArrowUpDown, Receipt
} from "lucide-react";
import { useCustomerContext } from "../../context/CustomerContext";

interface BillCollectionHistoryPageProps {
  onNavigate?: (page: string) => void;
}

export const BillCollectionHistoryPage: React.FC<BillCollectionHistoryPageProps> = ({ onNavigate }) => {
  const { customers } = useCustomerContext();

  // 3-Row Filters (Screenshot 3 Layout)
  const [usernameFilter, setUsernameFilter] = useState("all");
  const [paymentGateway, setPaymentGateway] = useState("all");
  const [gatewayType, setGatewayType] = useState("all");
  const [packageFilter, setPackageFilter] = useState("all");
  const [receivedBy, setReceivedBy] = useState("");

  const [createdByFilter, setCreatedByFilter] = useState("all");
  const [billingStatusFilter, setBillingStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [subZoneFilter, setSubZoneFilter] = useState("all");
  const [boxFilter, setBoxFilter] = useState("all");

  const [paymentFrom, setPaymentFrom] = useState("");
  const [paymentTo, setPaymentTo] = useState("");
  const [receiveFrom, setReceiveFrom] = useState("01-08-2026");
  const [receiveTo, setReceiveTo] = useState("31-08-2026");

  const [pageSize, setPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Seeded Collection History Transactions matching Screenshot 3
  const collectionRows = useMemo(() => {
    return [
      {
        id: "col-1",
        rDate: "28 Aug 2026",
        cCode: "MBN0029",
        idIp: "mbn@siamahmed",
        name: "Mbn@siamahmed",
        zone: "DHAKA DIVISION",
        subZone: "KALKINI SOMITIR HAT",
        box: "SOMITIR HAT BAZAR",
        package: "20Mbps",
        bStatus: "Active",
        trxId: "TRX-94810291",
        monthlyBill: 500,
        received: 500,
        moneyReceiptNo: "MBN0029-202608-2814-d2207c83RV",
        createdBy: "maabestnetwork"
      },
      {
        id: "col-2",
        rDate: "27 Aug 2026",
        cCode: "MBN0085",
        idIp: "mbn@khadizabegum",
        name: "Mbn@khadizabegum",
        zone: "DHAKA DIVISION",
        subZone: "KALKINI SOMITIR HAT",
        box: "SOMITIR HAT BAZAR",
        package: "20Mbps",
        bStatus: "Active",
        trxId: "TRX-81029411",
        monthlyBill: 500,
        received: 500,
        moneyReceiptNo: "MBN0085-202608-2718-2b39eff6RV",
        createdBy: "maabestnetwork"
      },
      {
        id: "col-3",
        rDate: "27 Aug 2026",
        cCode: "MBN0120",
        idIp: "mbn@khalilhowlader",
        name: "Mbn@khalilhowlader",
        zone: "DHAKA DIVISION",
        subZone: "KALKINI SOMITIR HAT",
        box: "SOMITIR HAT BAZAR",
        package: "20Mbps",
        bStatus: "Active",
        trxId: "TRX-72910488",
        monthlyBill: 500,
        received: 500,
        moneyReceiptNo: "MBN0120-202608-2720-6928f746RV",
        createdBy: "maabestnetwork"
      },
      {
        id: "col-4",
        rDate: "26 Aug 2026",
        cCode: "MBN0007",
        idIp: "mbn@sumonbepari",
        name: "Sumon Bepari",
        zone: "DHAKA DIVISION",
        subZone: "KALKINI SOMITIR HAT",
        box: "SOMITIR HAT BAZAR",
        package: "PIONEER_HOME_20Mbps",
        bStatus: "Active",
        trxId: "TRX-82910381",
        monthlyBill: 600,
        received: 600,
        moneyReceiptNo: "MBN0007-202608-2611-9a41c712RV",
        createdBy: "maabestnetwork"
      },
      {
        id: "col-5",
        rDate: "25 Aug 2026",
        cCode: "MBN0008",
        idIp: "mbn@mdabubakersiddik",
        name: "Md Abubaker Siddik",
        zone: "DHAKA DIVISION",
        subZone: "KALKINI SOMITIR HAT",
        box: "SOMITIR HAT BAZAR",
        package: "PIONEER_HOME_20Mbps",
        bStatus: "Active",
        trxId: "TRX-44910283",
        monthlyBill: 700,
        received: 700,
        moneyReceiptNo: "MBN0008-202608-2510-1c88d921RV",
        createdBy: "maabestnetwork"
      }
    ];
  }, []);

  const filteredRows = useMemo(() => {
    return collectionRows.filter(r => {
      const matchSearch =
        r.cCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.idIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.moneyReceiptNo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchPackage = packageFilter === "all" || r.package.includes(packageFilter);
      const matchZone = zoneFilter === "all" || r.zone.includes(zoneFilter);

      return matchSearch && matchPackage && matchZone;
    });
  }, [collectionRows, searchQuery, packageFilter, zoneFilter]);

  const totalCollected = filteredRows.reduce((sum, r) => sum + r.received, 0);

  const exportPDF = () => {
    showToast("Generating Bill Collection History PDF...");
    window.print();
  };

  const exportCSV = () => {
    const headers = [
      "R.Date", "C.Code", "ID/IP", "Name", "Zone", "SubZone", "Box",
      "Package", "B.Status", "TrxId", "MonthlyBill", "Received",
      "Money Receipt No", "CreatedBy"
    ];
    const rows = filteredRows.map(r => [
      r.rDate, r.cCode, r.idIp, r.name, r.zone, r.subZone, r.box,
      r.package, r.bStatus, r.trxId, r.monthlyBill, r.received,
      r.moneyReceiptNo, r.createdBy
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bill_Collection_History_${receiveFrom}_to_${receiveTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✓ Exported ${filteredRows.length} collection records to CSV.`);
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

      {/* Header (Screenshot 3 Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <Receipt size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Bill Collection History</h1>
              <span className="text-sm font-normal text-muted-foreground hidden sm:inline">Bill Collection/Receive History/Report</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Report</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">Bill Collection</span>
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

      {/* 3-Row Comprehensive Filter Box (Screenshot 3 Exact Layout) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
        {/* Row 1: USERNAME, PAYMENT GATEWAYS, GATEWAY TYPE, PACKAGE, RECEIVED BY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">USERNAME</label>
            <select
              value={usernameFilter}
              onChange={e => setUsernameFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">All User</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.clientCode || c.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">PAYMENT GATEWAYS</label>
            <select
              value={paymentGateway}
              onChange={e => setPaymentGateway(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="bKash">bKash Merchant</option>
              <option value="Nagad">Nagad Direct</option>
              <option value="Rocket">Rocket</option>
              <option value="Cash">Cash Desk</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">GATEWAY TYPE</label>
            <select
              value={gatewayType}
              onChange={e => setGatewayType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="Online">Online MFS</option>
              <option value="Manual">Manual Receipt</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">PACKAGE</label>
            <select
              value={packageFilter}
              onChange={e => setPackageFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="20Mbps">20Mbps</option>
              <option value="30Mbps">30Mbps</option>
              <option value="50Mbps">50Mbps</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">RECEIVED BY</label>
            <input
              type="text"
              value={receivedBy}
              onChange={e => setReceivedBy(e.target.value)}
              placeholder="Staff Name / ID"
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Row 2: CREATED BY, BILLING STATUS, ZONE, SUBZONE, BOX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">CREATED BY</label>
            <select
              value={createdByFilter}
              onChange={e => setCreatedByFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="maabestnetwork">maabestnetwork</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">BILLING STATUS</label>
            <select
              value={billingStatusFilter}
              onChange={e => setBillingStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="Active">Active</option>
              <option value="Due">Due</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">ZONE</label>
            <select
              value={zoneFilter}
              onChange={e => setZoneFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="DHAKA DIVISION">DHAKA DIVISION</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">SUBZONE</label>
            <select
              value={subZoneFilter}
              onChange={e => setSubZoneFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="KALKINI SOMITIR HAT">KALKINI SOMITIR HAT</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">BOX</label>
            <select
              value={boxFilter}
              onChange={e => setBoxFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="SOMITIR HAT BAZAR">SOMITIR HAT BAZAR</option>
            </select>
          </div>
        </div>

        {/* Row 3: PAYMENT FROM, PAYMENT TO, RECEIVE FROM, RECEIVE TO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">PAYMENT FROM</label>
            <input
              type="text"
              value={paymentFrom}
              onChange={e => setPaymentFrom(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">PAYMENT TO</label>
            <input
              type="text"
              value={paymentTo}
              onChange={e => setPaymentTo(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">RECEIVE FROM</label>
            <input
              type="text"
              value={receiveFrom}
              onChange={e => setReceiveFrom(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">RECEIVE TO</label>
            <input
              type="text"
              value={receiveTo}
              onChange={e => setReceiveTo(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-muted border border-border text-foreground outline-none focus:border-primary"
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

      {/* Data Table (Screenshot 3 Exact Layout) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/80 text-foreground border-b border-border font-bold">
                <th className="py-3 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">R.Date <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">C.Code <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">ID/IP</th>
                <th className="py-3 px-3 whitespace-nowrap">Name</th>
                <th className="py-3 px-3 whitespace-nowrap">Zone</th>
                <th className="py-3 px-3 whitespace-nowrap">SubZone</th>
                <th className="py-3 px-3 whitespace-nowrap">Box</th>
                <th className="py-3 px-3 whitespace-nowrap">Package</th>
                <th className="py-3 px-3 whitespace-nowrap">B.Status</th>
                <th className="py-3 px-3 whitespace-nowrap">TrxId</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">MonthlyBill</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Received</th>
                <th className="py-3 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">Money Receipt No <ArrowUpDown size={11} className="opacity-60" /></div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">CreatedBy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-muted-foreground">
                    No bill collection records found for the selected dates.
                  </td>
                </tr>
              ) : (
                filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                  >
                    <td className="py-3 px-3 font-mono text-muted-foreground whitespace-nowrap">{r.rDate}</td>
                    <td className="py-3 px-3 font-mono font-bold text-foreground whitespace-nowrap">{r.cCode}</td>
                    <td className="py-3 px-3 font-mono text-foreground whitespace-nowrap">{r.idIp}</td>
                    <td className="py-3 px-3 font-medium text-foreground whitespace-nowrap">{r.name}</td>
                    <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">{r.zone}</td>
                    <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">{r.subZone}</td>
                    <td className="py-3 px-3 text-muted-foreground whitespace-nowrap">{r.box}</td>
                    <td className="py-3 px-3 text-foreground whitespace-nowrap">{r.package}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600">
                        {r.bStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{r.trxId}</td>
                    <td className="py-3 px-3 font-mono text-right text-foreground whitespace-nowrap">৳ {r.monthlyBill}</td>
                    <td className="py-3 px-3 font-mono font-bold text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">৳ {r.received}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-foreground font-medium whitespace-nowrap">{r.moneyReceiptNo}</td>
                    <td className="py-3 px-3 text-muted-foreground text-[11px] whitespace-nowrap">{r.createdBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-3.5 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>Showing 1 to {Math.min(filteredRows.length, pageSize)} of {filteredRows.length} entries</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Total Realized Collection:</span>
            <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">৳ {totalCollected.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
