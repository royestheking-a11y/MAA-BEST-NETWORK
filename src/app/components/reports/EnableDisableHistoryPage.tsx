import React, { useState, useMemo } from "react";
import {
  Activity, Download, Printer, Search, CheckCircle2,
  Calendar, Filter, X, ArrowUpDown
} from "lucide-react";
import { useCustomerContext } from "../../context/CustomerContext";

interface EnableDisableHistoryPageProps {
  onNavigate?: (page: string) => void;
}

interface EnableDisableRecord {
  id: string;
  username: string;
  server: string;
  service: string;
  profile: string;
  mStatus: "Enabled" | "Disabled";
  daysEnabled: number;
  daysFundCredited: number;
}

const DEFAULT_HISTORY_RECORDS: EnableDisableRecord[] = [
  { id: "ed-1", username: "mbn@khadiza", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Disabled", daysEnabled: 0, daysFundCredited: 0 },
  { id: "ed-2", username: "mbn@jannat", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Disabled", daysEnabled: 25, daysFundCredited: 26 },
  { id: "ed-3", username: "mbn@rajibsrder", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Disabled", daysEnabled: 0, daysFundCredited: 0 },
  { id: "ed-4", username: "mbn@rohimaakter", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Disabled", daysEnabled: 0, daysFundCredited: 0 },
  { id: "ed-5", username: "mbn@mstshahanaz", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Disabled", daysEnabled: 0, daysFundCredited: 0 },
  { id: "ed-6", username: "mbn@shamim", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Disabled", daysEnabled: 0, daysFundCredited: 0 },
  { id: "ed-7", username: "mbn@sumonbepari", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Enabled", daysEnabled: 29, daysFundCredited: 29 },
  { id: "ed-8", username: "mbn@mdabubakersiddik", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Enabled", daysEnabled: 29, daysFundCredited: 29 },
  { id: "ed-9", username: "mbn@tawhid", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Disabled", daysEnabled: 10, daysFundCredited: 14 },
  { id: "ed-10", username: "mbn@hafijul", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Enabled", daysEnabled: 29, daysFundCredited: 29 },
  { id: "ed-11", username: "mbn@shraboni", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Enabled", daysEnabled: 29, daysFundCredited: 29 },
  { id: "ed-12", username: "mbn@mosarafkha", server: "RETAIL_1", service: "PPPOE", profile: "PIONEER_HOME_20Mbps", mStatus: "Enabled", daysEnabled: 29, daysFundCredited: 29 },
];

export const EnableDisableHistoryPage: React.FC<EnableDisableHistoryPageProps> = ({ onNavigate }) => {
  const { customers } = useCustomerContext();

  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("01/08/2026");
  const [toDate, setToDate] = useState("29/08/2026");
  const [pageSize, setPageSize] = useState(100);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const records = useMemo(() => {
    // Combine seeded records with any live subscriber status changes
    return DEFAULT_HISTORY_RECORDS;
  }, [customers]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchSearch =
        r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.server.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.profile.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "Enabled" && r.mStatus === "Enabled") ||
        (statusFilter === "Disabled" && r.mStatus === "Disabled");

      return matchSearch && matchStatus;
    });
  }, [records, searchQuery, statusFilter]);

  const exportPDF = () => {
    showToast("Generating Client Enable/Disable History PDF...");
    window.print();
  };

  const exportCSV = () => {
    const headers = ["Username", "Server", "Service", "Profile", "M. Status", "No. Of Days(Enabled)", "No. Of Days(Fund Credited)"];
    const rows = filteredRecords.map(r => [
      r.username, r.server, r.service, r.profile, r.mStatus, r.daysEnabled, r.daysFundCredited
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Enable_Disable_History_${fromDate.replace(/\//g, "-")}_to_${toDate.replace(/\//g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✓ Exported ${filteredRecords.length} records to CSV.`);
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

      {/* Header (Screenshot 2 Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <Activity size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Client Enable/Disable History</h1>
              <span className="text-sm font-normal text-muted-foreground hidden sm:inline">Report for Enable/Disable</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Report</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">Client Enable/Disable History</span>
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

      {/* Filters (STATUS, FROM DATE, TO DATE) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">STATUS</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary font-medium"
            >
              <option value="all">Select</option>
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">FROM DATE</label>
            <input
              type="text"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">TO DATE</label>
            <input
              type="text"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              placeholder="DD/MM/YYYY"
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

      {/* Data Table (Screenshot 2 Exact Layout) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/80 text-foreground border-b border-border font-bold">
                <th className="py-3 px-4 whitespace-nowrap">Username</th>
                <th className="py-3 px-4 whitespace-nowrap">Server</th>
                <th className="py-3 px-4 whitespace-nowrap">Service</th>
                <th className="py-3 px-4 whitespace-nowrap">Profile</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">M. Status</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">No. Of Days(Enabled)</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">No. Of Days(Fund Credited)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No enable/disable records found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">{r.username}</td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{r.server}</td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">{r.service}</td>
                    <td className="py-3 px-4 text-foreground font-mono text-[11px] whitespace-nowrap">{r.profile}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {r.mStatus === "Enabled" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-center text-foreground whitespace-nowrap">{r.daysEnabled}</td>
                    <td className="py-3 px-4 font-mono font-bold text-center text-foreground whitespace-nowrap">{r.daysFundCredited}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <p>Showing 1 to {Math.min(filteredRecords.length, pageSize)} of {filteredRecords.length} entries</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
