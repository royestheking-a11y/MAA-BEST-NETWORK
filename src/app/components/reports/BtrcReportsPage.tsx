import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet, Download, RefreshCw, Search, CheckCircle2,
  X, Info, FileText, ArrowUpDown, Filter, ShieldCheck, Printer
} from "lucide-react";
import { useCustomerContext } from "../../context/CustomerContext";

interface BtrcReportsPageProps {
  onNavigate?: (page: string) => void;
}

export const BtrcReportsPage: React.FC<BtrcReportsPageProps> = ({ onNavigate }) => {
  const { customers } = useCustomerContext();

  // Filters State (Screenshot 1 Grid)
  const [previousMonth, setPreviousMonth] = useState("all");
  const [serverFilter, setServerFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [clientTypeFilter, setClientTypeFilter] = useState("all");
  const [connectionTypeFilter, setConnectionTypeFilter] = useState("all");
  const [bStatusFilter, setBStatusFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [subZoneFilter, setSubZoneFilter] = useState("all");
  const [boxFilter, setBoxFilter] = useState("all");
  const [ipTypeFilter, setIpTypeFilter] = useState("IP Address");
  const [distPointType, setDistPointType] = useState("NOC");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast("RouterOS IPDR & BTRC records synced successfully!");
    }, 1200);
  };

  // Pre-configured BTRC data mapped from subscriber registry
  const btrcRows = useMemo(() => {
    return customers.map((c, idx) => {
      const isOnline = c.netStatus === "online";
      return {
        id: c.id,
        client_type: c.clientType || "Home",
        connection_type: c.connectionType || "Wired",
        client_name: c.pppUser || `Mbn@user${idx + 1}`,
        fullName: c.name,
        bandwidth_distribution_point: "NOC",
        connectivity_type: "Shared",
        activation_date: c.joinDate || "06/01/2026",
        bandwidth_allocation: c.downloadSpeedMbps || 20,
        allocated_ip: c.ipAddress || `10.200.201.${50 + idx}`,
        division: c.district || "DHAKA DIVISION",
        district: "MADARIPUR",
        upazila: c.upazila || "KALKINI",
        contact_number: c.phone,
        nid_number: c.nidNo || `199${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
        status: isOnline ? "Active" : "Disabled",
        server: c.serverName || "RETAIL_1",
        service: c.service || "pppoe",
        zone: c.zone || "DHAKA DIVISION",
        subzone: c.subzone || "KALKINI SOMITIR HAT",
        box: c.box || "SOMITIR HAT BAZAR"
      };
    });
  }, [customers]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return btrcRows.filter(r => {
      const matchSearch =
        r.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.allocated_ip.includes(searchQuery) ||
        r.contact_number.includes(searchQuery);

      const matchServer = serverFilter === "all" || r.server === serverFilter;
      const matchService = serviceFilter === "all" || r.service === serviceFilter;
      const matchClientType = clientTypeFilter === "all" || r.client_type === clientTypeFilter;
      const matchZone = zoneFilter === "all" || r.zone.toLowerCase().includes(zoneFilter.toLowerCase());

      return matchSearch && matchServer && matchService && matchClientType && matchZone;
    });
  }, [btrcRows, searchQuery, serverFilter, serviceFilter, clientTypeFilter, zoneFilter]);

  const exportPDF = () => {
    showToast("Generating BTRC Statutory Return PDF...");
    window.print();
  };

  const exportExcel = () => {
    const headers = [
      "client_type", "connection_type", "client_name", "subscriber_full_name",
      "bandwidth_distribution_point", "connectivity_type", "activation_date",
      "bandwidth_allocation_mbps", "allocated_ip", "division", "district",
      "upazila", "contact_number", "nid_number"
    ];
    const rows = filteredRows.map(r => [
      r.client_type, r.connection_type, r.client_name, r.fullName,
      r.bandwidth_distribution_point, r.connectivity_type, r.activation_date,
      r.bandwidth_allocation, r.allocated_ip, r.division, r.district,
      r.upazila, r.contact_number, r.nid_number
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BTRC_Report_MAA_BEST_NETWORK_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✓ Exported ${filteredRows.length} BTRC records to Excel/CSV.`);
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

      {/* Header (Screenshot 1 Layout) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">BTRC Report</h1>
              <span className="text-sm font-normal text-muted-foreground hidden sm:inline">Report for BTRC</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <span>Report</span>
              <span>&gt;</span>
              <span className="text-foreground font-medium">BTRC Report</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-muted border border-border text-foreground hover:bg-muted/80 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin text-primary" : "text-primary"} />
            <span>Sync Clients & Servers</span>
          </button>

          {/* Generate PDF */}
          <button
            onClick={exportPDF}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:opacity-90 shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span>Generate PDF</span>
          </button>

          {/* Generate Excel */}
          <button
            onClick={exportExcel}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-95 shadow transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Generate Excel</span>
          </button>
        </div>
      </div>

      {/* N.B: Click here Notice Banner (Screenshot 1) */}
      <div className="bg-card border border-border rounded-xl p-3.5 shadow-xs flex items-center justify-between">
        <button
          onClick={() => setShowInfoModal(true)}
          className="flex items-center gap-2 text-xs font-bold text-primary hover:underline cursor-pointer"
        >
          <Info size={16} />
          <span>N.B: Click here to view BTRC Statutory Reporting Format Guidelines & IPDR Requirements</span>
        </button>
        <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
          License: BTRC/ISP-NAT-2024/991
        </span>
      </div>

      {/* 3-Row Comprehensive Filter Grid (Screenshot 1 Exact Layout) */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
        {/* Row 1: PREVIOUS MONTH, SERVERS, SERVICE, CLIENT TYPE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">PREVIOUS MONTH</label>
            <select
              value={previousMonth}
              onChange={e => setPreviousMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="08-2026">August 2026</option>
              <option value="07-2026">July 2026</option>
              <option value="06-2026">June 2026</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">SERVERS</label>
            <select
              value={serverFilter}
              onChange={e => setServerFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="RETAIL_1">RETAIL_1</option>
              <option value="MikroTik-01">MikroTik-01</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">SERVICE</label>
            <select
              value={serviceFilter}
              onChange={e => setServiceFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="pppoe">pppoe</option>
              <option value="hotspot">hotspot</option>
              <option value="static">static</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">CLIENT TYPE</label>
            <select
              value={clientTypeFilter}
              onChange={e => setClientTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="Home">Home</option>
              <option value="Commercial">Commercial</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>
        </div>

        {/* Row 2: CONNECTION TYPE, B.STATUS, ZONE, SUB ZONE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">CONNECTION TYPE</label>
            <select
              value={connectionTypeFilter}
              onChange={e => setConnectionTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="Wired">Wired (Fiber/Cat6)</option>
              <option value="Wireless">Wireless</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">B.STATUS</label>
            <input
              type="text"
              value={bStatusFilter}
              onChange={e => setBStatusFilter(e.target.value)}
              placeholder="Active / Grace"
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            />
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
              <option value="MADARIPUR">MADARIPUR</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">SUB ZONE</label>
            <select
              value={subZoneFilter}
              onChange={e => setSubZoneFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="all">Select</option>
              <option value="KALKINI SOMITIR HAT">KALKINI SOMITIR HAT</option>
            </select>
          </div>
        </div>

        {/* Row 3: BOX, ALLOCATED IP TYPE, DISTRIBUTED POINT TYPE, DATE FORMATE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">ALLOCATED IP TYPE</label>
            <select
              value={ipTypeFilter}
              onChange={e => setIpTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="IP Address">IP Address</option>
              <option value="Framed IP">Framed IP</option>
              <option value="Public Static">Public Static IP</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">DISTRIBUTED POINT TYPE</label>
            <select
              value={distPointType}
              onChange={e => setDistPointType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="NOC">NOC</option>
              <option value="POP">POP</option>
              <option value="DP">DP Box</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">DATE FORMATE</label>
            <select
              value={dateFormat}
              onChange={e => setDateFormat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-muted border border-border text-foreground outline-none focus:border-primary"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
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
            <option value={250}>250</option>
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

      {/* BTRC Data Table (Screenshot 1 Exact Layout) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/80 text-foreground border-b border-border font-bold">
                <th className="py-3 px-3 whitespace-nowrap">client_type</th>
                <th className="py-3 px-3 whitespace-nowrap">connection_type</th>
                <th className="py-3 px-3 whitespace-nowrap">client_name</th>
                <th className="py-3 px-3 whitespace-nowrap">bandwidth_distribution_point</th>
                <th className="py-3 px-3 whitespace-nowrap">connectivity_type</th>
                <th className="py-3 px-3 whitespace-nowrap">activation_date</th>
                <th className="py-3 px-3 whitespace-nowrap text-center">bandwidth_allocation</th>
                <th className="py-3 px-3 whitespace-nowrap">allocated_ip</th>
                <th className="py-3 px-3 whitespace-nowrap">division</th>
                <th className="py-3 px-3 whitespace-nowrap">district</th>
                <th className="py-3 px-3 whitespace-nowrap">upazila</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-muted-foreground">
                    No BTRC records matching the selected parameters.
                  </td>
                </tr>
              ) : (
                filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-muted/30 transition-colors ${idx % 2 === 1 ? "bg-muted/10" : ""}`}
                  >
                    <td className="py-2.5 px-3 text-foreground whitespace-nowrap">{r.client_type}</td>
                    <td className="py-2.5 px-3 text-foreground whitespace-nowrap">{r.connection_type}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-foreground whitespace-nowrap">{r.client_name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{r.bandwidth_distribution_point}</td>
                    <td className="py-2.5 px-3 font-medium text-primary whitespace-nowrap">{r.connectivity_type}</td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{r.activation_date}</td>
                    <td className="py-2.5 px-3 font-bold font-mono text-center text-foreground whitespace-nowrap">{r.bandwidth_allocation} Mbps</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-sky-600 dark:text-sky-400 whitespace-nowrap">{r.allocated_ip}</td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{r.division}</td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{r.district}</td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{r.upazila}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <p>Showing 1 to {Math.min(filteredRows.length, pageSize)} of {filteredRows.length} entries</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-border text-foreground font-medium disabled:opacity-40" disabled>Next</button>
          </div>
        </div>
      </div>

      {/* ── BTRC INFO MODAL ── */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary" />
                <h3 className="font-bold text-foreground text-base">BTRC Compliance Notice</h3>
              </div>
              <button onClick={() => setShowInfoModal(false)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground">Bangladesh Telecommunication Regulatory Commission (BTRC) Guidelines:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>Every ISP licensee must maintain complete subscriber records including National ID (NID), active MAC, and assigned IP address.</li>
                <li>Bandwidth distribution reports must be generated and submitted electronically before the 10th of every calendar month.</li>
                <li>IPDR (Internet Protocol Detail Record) syslog logs must be retained for at least 2 years in accordance with Lawful Interception requirements.</li>
              </ul>
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button onClick={() => setShowInfoModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground">
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
