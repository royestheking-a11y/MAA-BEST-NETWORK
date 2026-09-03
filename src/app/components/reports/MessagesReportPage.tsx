import React, { useState, useMemo } from "react";
import {
  MessageSquare, Send, Download, Printer, Search, CheckCircle2,
  Calendar, Filter, X, ArrowUpDown, RefreshCw, AlertCircle
} from "lucide-react";
import { useCustomerContext } from "../../context/CustomerContext";

interface MessagesReportPageProps {
  onNavigate?: (page: string) => void;
}

interface MessageLog {
  id: string;
  logNo: string;
  toWhom: string;
  smsType: string;
  toNumber: string;
  smsText: string;
  dateTime: string;
  status: "Delivered" | "Failed" | "Queued";
  selected: boolean;
}

const DEFAULT_SMS_LOGS: MessageLog[] = [
  {
    id: "msg-1",
    logNo: "LOG-9481",
    toWhom: "Sumon Bepari (Client)",
    smsType: "Money Receipt",
    toNumber: "8801784659223",
    smsText: "প্রিয় গ্রাহক, আমরা আপনার ইন্টারনেট বিল ৳ 500 পেয়েছি। User ID: MBN0007 ধন্যবাদ ও শুভেচ্ছা MAA BEST NETWORK",
    dateTime: "28/08/2026 04:15 PM",
    status: "Delivered",
    selected: false
  },
  {
    id: "msg-2",
    logNo: "LOG-9480",
    toWhom: "Md Abubaker Siddik (Client)",
    smsType: "Client Enable",
    toNumber: "8801712345678",
    smsText: "প্রিয় ক্লায়েন্ট, আপনার অ্যাকাউন্ট সফলভাবে সক্রিয় করা হয়েছে। ক্লায়েন্ট কোড: MBN0008 ধন্যবাদ ও শুভেচ্ছা MAA BEST NETWORK",
    dateTime: "28/08/2026 02:30 PM",
    status: "Delivered",
    selected: false
  },
  {
    id: "msg-3",
    logNo: "LOG-9479",
    toWhom: "Hafijul Islam (Client)",
    smsType: "Due Template",
    toNumber: "8801799887766",
    smsText: "প্রিয় গ্রাহক, অনুগ্রহ করে আপনার ইন্টারনেট বিল ৳ 500 পরিশোধ করুন। ক্লায়েন্ট কোড: MBN0009 MAA BEST NETWORK",
    dateTime: "27/08/2026 11:20 AM",
    status: "Delivered",
    selected: false
  },
  {
    id: "msg-4",
    logNo: "LOG-9478",
    toWhom: "Nasir Uddin (Employee)",
    smsType: "Todo Assigned",
    toNumber: "8801755443322",
    smsText: "প্রিয় Nasir Uddin, আমরা আপনার জন্য একটি টাস্ক সংযুক্ত করেছি: Kalkini Somitir Hat PON line check. MAA BEST NETWORK",
    dateTime: "27/08/2026 09:45 AM",
    status: "Delivered",
    selected: false
  },
  {
    id: "msg-5",
    logNo: "LOG-9477",
    toWhom: "Shraboni Akter (Client)",
    smsType: "Greetings To Client",
    toNumber: "8801833221100",
    smsText: "প্রিয় Shraboni, আপনার ইউনিক আইডি হচ্ছেঃ MBN0010, সার্ভার আইডি/আইপি হচ্ছেঃ mbn@shraboni। ধন্যবাদ ও শুভেচ্ছা, MAA BEST NETWORK",
    dateTime: "26/08/2026 06:10 PM",
    status: "Delivered",
    selected: false
  }
];

export const MessagesReportPage: React.FC<MessagesReportPageProps> = ({ onNavigate }) => {
  const { customers } = useCustomerContext();
  const [logs, setLogs] = useState<MessageLog[]>(DEFAULT_SMS_LOGS);

  // 2-Row Filters (Screenshot 4 Layout)
  const [userType, setUserType] = useState("all");
  const [smsType, setSmsType] = useState("all");
  const [smsStatus, setSmsStatus] = useState("all");
  const [toSendBy, setToSendBy] = useState("all");

  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [fromDate, setFromDate] = useState("01/08/2026");
  const [toDate, setToDate] = useState("31/08/2026");

  const [pageSize, setPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchSearch =
        l.logNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.toWhom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.toNumber.includes(searchQuery) ||
        l.smsText.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSmsType = smsType === "all" || l.smsType.includes(smsType);
      const matchStatus = smsStatus === "all" || l.status === smsStatus;

      return matchSearch && matchSmsType && matchStatus;
    });
  }, [logs, searchQuery, smsType, smsStatus]);

  const toggleSelectAll = () => {
    const nextVal = !selectAll;
    setSelectAll(nextVal);
    setLogs(prev => prev.map(l => ({ ...l, selected: nextVal })));
  };

  const toggleOne = (id: string) => {
    setLogs(prev => prev.map(l => (l.id === id ? { ...l, selected: !l.selected } : l)));
  };

  const selectedCount = logs.filter(l => l.selected).length;

  const handleResendBulk = () => {
    if (selectedCount === 0) {
      alert("Please select at least one message log to resend.");
      return;
    }
    showToast(`Re-dispatched ${selectedCount} SMS message(s) through Gateway!`);
  };

  const exportPDF = () => {
    showToast("Generating Messages Report PDF...");
    window.print();
  };

  const exportCSV = () => {
    const headers = ["LogNo.", "ToWhom", "SMS Type", "ToNumber", "SMS Text", "Date & Time", "Status"];
    const rows = filteredLogs.map(l => [
      l.logNo, l.toWhom, l.smsType, l.toNumber, l.smsText, l.dateTime, l.status
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Messages_Report_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✓ Exported ${filteredLogs.length} message logs to CSV.`);
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

      {/* Header (Screenshot 4 Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Report</h1>
              <span className="text-sm font-normal text-muted-foreground hidden sm:inline">Messages Report</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Report</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">Messages Report</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Resend Bulk SMS */}
          <button
            onClick={handleResendBulk}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:opacity-90 shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Send size={14} />
            <span>Resend Bulk Sms ({selectedCount})</span>
          </button>

          {/* Generate PDF */}
          <button
            onClick={exportPDF}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-muted border border-border text-foreground hover:bg-muted/80 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
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

      {/* 2-Row Filter Grid (Screenshot 4 Layout) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
        {/* Row 1: USER TYPE, SMS TYPE, SMS STATUS, TO SEND BY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">USER TYPE</label>
            <select
              value={userType}
              onChange={e => setUserType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="Client">Client</option>
              <option value="Employee">Employee</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">SMS TYPE</label>
            <select
              value={smsType}
              onChange={e => setSmsType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="Money Receipt">Money Receipt</option>
              <option value="Client Enable">Client Enable</option>
              <option value="Due Template">Due Template</option>
              <option value="Greetings">Greetings</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">SMS STATUS</label>
            <select
              value={smsStatus}
              onChange={e => setSmsStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="Delivered">Delivered</option>
              <option value="Failed">Failed</option>
              <option value="Queued">Queued</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">TO SEND BY</label>
            <select
              value={toSendBy}
              onChange={e => setToSendBy(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="System Automated">System Automated</option>
              <option value="Admin Manual">Admin Manual</option>
            </select>
          </div>
        </div>

        {/* Row 2: EMPLOYEE, CUSTOMER, FROM DATE, TO DATE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">EMPLOYEE</label>
            <select
              value={employeeFilter}
              onChange={e => setEmployeeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="Nasir Uddin">Nasir Uddin</option>
              <option value="Tareq Hossain">Tareq Hossain</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">CUSTOMER</label>
            <select
              value={customerFilter}
              onChange={e => setCustomerFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">FROM DATE</label>
            <input
              type="text"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs font-mono bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">TO DATE</label>
            <input
              type="text"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
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

      {/* Data Table (Screenshot 4 Layout) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/80 text-foreground border-b border-border font-bold">
                <th className="py-3 px-3.5 whitespace-nowrap">LogNo.</th>
                <th className="py-3 px-3.5 whitespace-nowrap">ToWhom</th>
                <th className="py-3 px-3.5 whitespace-nowrap">SMS Type</th>
                <th className="py-3 px-3.5 whitespace-nowrap">ToNumber</th>
                <th className="py-3 px-3.5 min-w-[320px]">SMS Text</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Date & Time</th>
                <th className="py-3 px-3.5 text-center whitespace-nowrap">Status</th>
                <th className="py-3 px-3 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-primary cursor-pointer accent-primary"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No data available in table
                  </td>
                </tr>
              ) : (
                filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((l, idx) => (
                  <tr
                    key={l.id}
                    className={`hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                  >
                    <td className="py-3 px-3.5 font-mono text-muted-foreground font-medium whitespace-nowrap">{l.logNo}</td>
                    <td className="py-3 px-3.5 font-medium text-foreground whitespace-nowrap">{l.toWhom}</td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        {l.smsType}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-muted-foreground whitespace-nowrap">{l.toNumber}</td>
                    <td className="py-3 px-3.5 text-foreground leading-relaxed font-sans text-xs">{l.smsText}</td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{l.dateTime}</td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={l.selected}
                        onChange={() => toggleOne(l.id)}
                        className="w-4 h-4 rounded text-primary cursor-pointer accent-primary"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <p>Showing 1 to {Math.min(filteredLogs.length, pageSize)} of {filteredLogs.length} entries</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
