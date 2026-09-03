import { useState } from "react";
import {
  FileText, Download, Filter, Calendar, CheckCircle2,
  RefreshCw, Check, Sparkles
} from "lucide-react";

interface CustomReportsPageProps {
  onNavigate?: (page: string) => void;
}

export function CustomReportsPage({ onNavigate }: CustomReportsPageProps) {
  const [reportType, setReportType] = useState("customers");
  const [dateRange, setDateRange] = useState("this_month");
  const [selectedZone, setSelectedZone] = useState("all");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleGenerate = (format: string) => {
    showToast(`Custom report (${reportType.toUpperCase()} - ${dateRange}) compiled and downloaded as ${format}!`);
  };

  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    fontSize: 13,
    color: "var(--foreground)",
  };

  return (
    <div className="p-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              Custom Report Query Builder
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
              Ad-Hoc Data Export
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Filter and export customized datasets across subscribers, bandwidth metrics, invoices, and SLA compliance
          </p>
        </div>
      </div>

      {/* ── Query Builder Card ───────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 border border-border bg-card shadow-sm space-y-5 max-w-3xl">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-muted-foreground block mb-1.5">DATASET ENTITY</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={inputStyle}
            >
              <option value="customers">Subscribers & KYC Directory</option>
              <option value="invoices">Invoices & Tax Ledgers</option>
              <option value="payments">MFS & Cash Collection Log</option>
              <option value="bandwidth">MikroTik Interface Traffic</option>
              <option value="tickets">Support Ticket SLAs</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1.5">DATE TIMEFRAME</label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={inputStyle}
            >
              <option value="this_month">Current Billing Cycle (August 2026)</option>
              <option value="last_month">Last Billing Cycle (July 2026)</option>
              <option value="quarter">Last Quarter (Q2 2026)</option>
              <option value="year">Fiscal Year 2025-2026</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1.5">TERRITORY ZONE FILTER</label>
            <select
              value={selectedZone}
              onChange={e => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={inputStyle}
            >
              <option value="all">All Coverage Zones</option>
              <option value="kalkini">Kalkini Zone</option>
              <option value="somitirhat">Somitir Hat Bazar</option>
              <option value="sadar">Madaripur Sadar</option>
              <option value="shibchar">Shibchar Zone</option>
              <option value="rajoir">Rajoir Zone</option>
              <option value="dashar">Dashar Zone</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1.5">INCLUDE ANONYMIZED KYC</label>
            <select className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle}>
              <option>Yes (Full BTRC NID & Address)</option>
              <option>No (Mask sensitive NID)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center gap-3">
          <button
            onClick={() => handleGenerate("CSV / Excel")}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
          >
            <Download size={14} /> Export to CSV (Excel)
          </button>
          <button
            onClick={() => handleGenerate("PDF Document")}
            className="flex-1 py-3 rounded-xl border border-border bg-muted/60 text-foreground font-semibold text-xs flex items-center justify-center gap-2 hover:bg-muted transition-colors"
          >
            <FileText size={14} /> Export Formatted PDF
          </button>
        </div>
      </div>

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500 }}
        >
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
