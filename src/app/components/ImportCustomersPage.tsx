import { useState, useRef } from "react";
import {
  Upload, CheckCircle2, AlertTriangle, XCircle, Download, FileText,
  ArrowRight, ArrowLeft, RefreshCw, Filter, Search, Check, Sparkles,
  Server, Smartphone, User, ShieldCheck, Database
} from "lucide-react";

type Step = "upload" | "validate" | "preview" | "importing" | "done";

interface ImportCustomersPageProps {
  onNavigate?: (page: string) => void;
}

interface ValidationIssue {
  row: number;
  customerName: string;
  field: string;
  issue: string;
  value: string;
  type: "error" | "duplicate";
}

const INITIAL_VALIDATION_ISSUES: ValidationIssue[] = [
  { row: 14, customerName: "Tanvir Ahmed", field: "Phone", issue: "Invalid mobile prefix (Must be 013-019)", value: "0121-889900", type: "error" },
  { row: 28, customerName: "Mahbubur Rahman", field: "IP Address", issue: "IP out of subnet range (103.112.50.0/24)", value: "192.168.300.1", type: "error" },
  { row: 47, customerName: "Sumaya Akter", field: "Package", issue: "Package name does not match any active tier", value: "15 Mbps Ultra", type: "error" },
  { row: 89, customerName: "Zahid Hasan", field: "Customer ID", issue: "Customer ID already assigned in CRM database", value: "CUST-10482", type: "duplicate" },
  { row: 124, customerName: "Nusrat Jahan", field: "Phone", issue: "Duplicate phone registered with CUST-10112", value: "01712-345678", type: "duplicate" },
  { row: 201, customerName: "Kamrul Islam", field: "MikroTik", issue: "Router identifier 'MKT-EXTRA' not in fleet", value: "MKT-EXTRA", type: "error" },
  { row: 312, customerName: "Shahida Begum", field: "Zone", issue: "Zone 'Keraniganj' not mapped to OLT chassis", value: "Keraniganj", type: "error" },
];

const PREVIEW_ROWS = [
  { id: "CUST-NEW-001", name: "Md. Habibur Rahman", phone: "01712-100001", zone: "Mirpur-10", package: "20 Mbps Basic (৳1,000)", pppoe: "habib_mir01", ip: "103.112.50.12", status: "valid" },
  { id: "CUST-NEW-002", name: "Sadia Islam", phone: "01819-100002", zone: "Uttara Sec-4", package: "10 Mbps Basic (৳800)", pppoe: "sadia_utt01", ip: "103.112.50.13", status: "valid" },
  { id: "CUST-NEW-003", name: "Ariful Haque", phone: "01611-100003", zone: "Dhanmondi", package: "30 Mbps Standard (৳1,500)", pppoe: "arif_dhan01", ip: "103.112.50.14", status: "valid" },
  { id: "CUST-NEW-004", name: "Mahmuda Begum", phone: "01914-100004", zone: "Gulshan-1", package: "50 Mbps Premium (৳2,500)", pppoe: "mahmuda_gul01", ip: "103.112.50.15", status: "valid" },
  { id: "CUST-NEW-005", name: "Nasir Uddin", phone: "01711-200005", zone: "Mirpur-11", package: "20 Mbps Basic (৳1,000)", pppoe: "nasir_mir02", ip: "103.112.50.16", status: "valid" },
  { id: "CUST-NEW-006", name: "Roxana Parvin", phone: "01814-300006", zone: "Banani", package: "40 Mbps Enterprise (৳2,000)", pppoe: "roxana_ban01", ip: "103.112.50.17", status: "valid" },
  { id: "CUST-NEW-007", name: "Golam Mostafa", phone: "01922-400007", zone: "Mohammadpur", package: "10 Mbps Basic (৳800)", pppoe: "mostafa_moh01", ip: "103.112.50.18", status: "valid" },
  { id: "CUST-NEW-008", name: "Farzana Yasmin", phone: "01678-500008", zone: "Bashundhara", package: "30 Mbps Standard (৳1,500)", pppoe: "farzana_bas01", ip: "103.112.50.19", status: "valid" },
];

export function ImportCustomersPage({ onNavigate }: ImportCustomersPageProps) {
  const [step, setStep] = useState<Step>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [currentSyncTask, setCurrentSyncTask] = useState("Initializing database worker...");
  const [filterIssueType, setFilterIssueType] = useState<"all" | "error" | "duplicate">("all");
  const [previewSearch, setPreviewSearch] = useState("");
  const [syncMikrotik, setSyncMikrotik] = useState(true);
  const [autoGenerateInvoices, setAutoGenerateInvoices] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validationStats = {
    total: 1245,
    valid: 1218,
    errors: 21,
    duplicates: 6,
  };

  const handleFileChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setSelectedFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setStep("validate");
  };

  const handleSelectFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      setSelectedFileName("subscribers_august_2026_import.csv");
      setFileSize("148.4 KB");
      setStep("validate");
    }
  };

  const handleImport = () => {
    setStep("importing");
    let p = 0;
    const stages = [
      "Validating NID numbers & phone formats...",
      "Provisioning PPPoE secrets on MikroTik CCR routers...",
      "Assigning static public IPs & NAT queue rate limits...",
      "Registering GPON ONU serials on Huawei OLT MA5800...",
      "Generating initial monthly billing invoices...",
      "Finalizing customer records & sync ledgers..."
    ];

    const iv = setInterval(() => {
      p += Math.random() * 12 + 6;
      const stageIdx = Math.min(Math.floor((p / 100) * stages.length), stages.length - 1);
      setCurrentSyncTask(stages[stageIdx]);

      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setTimeout(() => setStep("done"), 400);
      }
      setProgress(Math.min(Math.round(p), 100));
    }, 240);
  };

  const stepLabels: { id: Step; label: string; num: number; sub: string }[] = [
    { id: "upload", label: "Upload File", num: 1, sub: "CSV or Excel" },
    { id: "validate", label: "Validation", num: 2, sub: "Data Integrity" },
    { id: "preview", label: "Preview", num: 3, sub: "Inspect Records" },
    { id: "importing", label: "Network Sync", num: 4, sub: "MikroTik & OLT" },
    { id: "done", label: "Complete", num: 5, sub: "1,218 Live" },
  ];

  const stepOrder: Step[] = ["upload", "validate", "preview", "importing", "done"];
  const currentIdx = stepOrder.indexOf(step);

  const filteredIssues = INITIAL_VALIDATION_ISSUES.filter(issue => {
    if (filterIssueType === "all") return true;
    return issue.type === filterIssueType;
  });

  const filteredPreviews = PREVIEW_ROWS.filter(row => {
    const q = previewSearch.toLowerCase();
    return !q ||
      row.name.toLowerCase().includes(q) ||
      row.id.toLowerCase().includes(q) ||
      row.phone.includes(q) ||
      row.zone.toLowerCase().includes(q) ||
      row.pppoe.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-[calc(100vh-80px)] w-full py-4 sm:py-8 px-3 sm:px-6 flex flex-col items-center justify-start">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={e => handleFileChosen(e.target.files)}
        accept=".csv,.xlsx,.xls"
        className="hidden"
      />

      {/* Main Standard Centered Container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 sm:gap-6">

        {/* ── Center Header ──────────────────────────────────────────────────── */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
            <Database size={13} /> Bulk Customer Onboarding Engine
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
            Import Customers & Bulk Provisioning
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", maxWidth: 600, margin: "0 auto" }}>
            Upload subscriber spreadsheets to automatically register CRM profiles, generate MikroTik PPPoE secrets, and configure GPON OLTs.
          </p>
        </div>

        {/* ── Centered Large Progress Stepper ─────────────────────────────────── */}
        <div className="rounded-2xl p-3 sm:p-6 border border-border bg-card shadow-sm overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[480px] max-w-3xl mx-auto">
            {stepLabels.map((s, i) => {
              const idx = stepOrder.indexOf(s.id);
              const done = currentIdx > idx;
              const active = currentIdx === idx;
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="flex items-center justify-center rounded-full transition-all duration-300 shadow-md"
                      style={{
                        width: 44,
                        height: 44,
                        background: done ? "#16A34A" : active ? "var(--primary)" : "var(--muted)",
                        border: `2.5px solid ${done ? "#16A34A" : active ? "var(--primary)" : "var(--border)"}`,
                      }}
                    >
                      {done ? (
                        <CheckCircle2 size={20} className="text-white" />
                      ) : (
                        <span style={{ fontSize: 15, fontWeight: 700, color: active ? "#fff" : "var(--muted-foreground)" }}>
                          {s.num}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        color: active ? "var(--primary)" : done ? "#16A34A" : "var(--foreground)",
                        marginTop: 8,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.label}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 1 }}>
                      {s.sub}
                    </span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div
                      className="flex-1 h-1 mx-4 -mt-6 rounded-full transition-all duration-300"
                      style={{ background: done ? "#16A34A" : "var(--border)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Step 1: Upload File (Spacious & Standard Sizing) ────────────────── */}
        {step === "upload" && (
          <div className="flex flex-col gap-5">
            <div
              className="rounded-2xl flex flex-col items-center justify-center p-16 transition-all cursor-pointer shadow-sm hover:shadow-lg"
              style={{
                minHeight: 340,
                border: `2px dashed ${dragOver ? "var(--primary)" : "var(--border)"}`,
                background: dragOver ? "rgba(196,53,53,0.05)" : "var(--card)",
              }}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                handleFileChosen(e.dataTransfer.files);
              }}
              onClick={handleSelectFileClick}
            >
              <div
                className="flex items-center justify-center rounded-2xl mb-5 transition-transform hover:scale-110 shadow-sm"
                style={{ width: 84, height: 84, background: dragOver ? "rgba(196,53,53,0.12)" : "var(--muted)" }}
              >
                <Upload size={38} style={{ color: dragOver ? "var(--primary)" : "var(--primary)" }} />
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 6 }}>
                Drag & Drop your customer CSV / Excel file here
              </p>
              <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 22 }}>
                Supports standard comma-separated .csv, .xlsx, or .xls format up to 25MB
              </p>

              <button
                type="button"
                onClick={e => { e.stopPropagation(); handleSelectFileClick(); }}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
                style={{ background: "var(--primary)", fontSize: 14, fontWeight: 600 }}
              >
                <Upload size={16} /> Browse & Select File
              </button>
            </div>

            {/* Download Template Banner */}
            <div className="rounded-2xl p-5 flex items-center justify-between shadow-sm bg-card border border-border flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={24} className="text-primary" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Need the official ISP customer spreadsheet template?</p>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Includes standard BTRC columns: Customer ID, Name, Mobile, Zone, Package, PPPoE Password, Static IP, MAC & OLT Port
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const blob = new Blob([
                    "Customer ID,Name,Phone,Email,Address,Zone,Package,PPPoE Username,PPPoE Password,IP,MAC,MikroTik,OLT,ONU,Billing Date\n" +
                    "CUST-10001,Rahim Uddin,01712-345678,rahim@example.com,House 12 Road 4,Mirpur-10,20 Mbps Basic,rahim_mir,pass123,103.112.50.12,00:1A:2B:3C:4D:5E,CCR2004-Mirpur,Huawei-MA5800,EPON01,01\n" +
                    "CUST-10002,Sadia Islam,01819-876543,sadia@example.com,Sector 4 Road 10,Uttara,10 Mbps Basic,sadia_utt,pass456,103.112.50.13,00:1A:2B:3C:4D:5F,CCR2016-Uttara,Huawei-MA5800,EPON02,01\n"
                  ], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "ISP_Customer_Import_Template.csv";
                  a.click();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground transition-colors text-xs font-semibold"
              >
                <Download size={14} /> Download Sample Template (.CSV)
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Validate Data ───────────────────────────────────────────── */}
        {step === "validate" && (
          <div className="flex flex-col gap-5">
            {/* File Info Pill */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-primary" />
                <span className="font-semibold text-xs text-foreground">
                  File: <span className="font-mono text-primary">{selectedFileName || "subscribers_batch_2026.csv"}</span> ({fileSize || "148 KB"})
                </span>
              </div>
              <button
                onClick={() => setStep("upload")}
                className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
              >
                Choose Different File
              </button>
            </div>

            {/* Validation Metrics Grid */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[
                { label: "Total Rows In File", value: validationStats.total.toLocaleString(), color: "var(--foreground)", bg: "var(--card)" },
                { label: "Valid Records (Ready)", value: validationStats.valid.toLocaleString(), color: "#16A34A", bg: "#DCFCE7" },
                { label: "Validation Errors", value: validationStats.errors.toString(), color: "#DC2626", bg: "#FEE2E2" },
                { label: "Duplicate Keys", value: validationStats.duplicates.toString(), color: "#D97706", bg: "#FEF3C7" },
              ].map(k => (
                <div key={k.label} className="rounded-2xl p-5 text-center border border-border shadow-sm" style={{ background: k.bg }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: k.color }}>{k.value}</p>
                  <p style={{ fontSize: 12, color: k.color, opacity: 0.9, marginTop: 4, fontWeight: 600 }}>{k.label}</p>
                </div>
              ))}
            </div>

            {/* Issues Breakdown Card */}
            <div className="rounded-2xl overflow-hidden shadow-sm bg-card border border-border">
              <div className="px-6 py-4 flex items-center justify-between border-b border-border flex-wrap gap-2">
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--foreground)" }}>
                    Integrity Issues & Auto-Sanitization ({filteredIssues.length})
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Invalid rows will be skipped during import. You can export the error log to correct them.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(["all", "error", "duplicate"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilterIssueType(f)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors"
                      style={{
                        background: filterIssueType === f ? "var(--primary)" : "var(--muted)",
                        color: filterIssueType === f ? "white" : "var(--muted-foreground)",
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col max-h-72 overflow-y-auto">
                {filteredIssues.map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors text-xs"
                    style={{ borderBottom: i < filteredIssues.length - 1 ? "1px solid var(--border)" : "none" }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", width: 60 }}>
                      Row #{issue.row}
                    </span>
                    <span className="font-semibold text-foreground w-36 truncate">{issue.customerName}</span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase w-24 text-center"
                      style={{
                        background: issue.type === "error" ? "#FEE2E2" : "#FEF3C7",
                        color: issue.type === "error" ? "#DC2626" : "#D97706",
                      }}
                    >
                      {issue.field}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--foreground)", flex: 1 }}>{issue.issue}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", background: "var(--muted)", padding: "2px 6px", borderRadius: 4 }}>
                      {issue.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setStep("upload")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
              >
                <ArrowLeft size={14} /> Back to Upload
              </button>
              <button
                onClick={() => setStep("preview")}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-white text-xs font-semibold shadow-md hover:opacity-90 transition-opacity"
                style={{ background: "var(--primary)" }}
              >
                Preview Valid Rows ({validationStats.valid.toLocaleString()} Customers) <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Preview Records ─────────────────────────────────────────── */}
        {step === "preview" && (
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl p-4 flex items-center justify-between shadow-sm bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    {validationStats.valid.toLocaleString()} Subscribers Ready For Provisioning
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Skipping 27 invalid rows. PPPoE logins will be provisioned on assigned MikroTik nodes.
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-4 text-xs font-medium text-emerald-900">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncMikrotik}
                    onChange={e => setSyncMikrotik(e.target.checked)}
                    className="accent-primary"
                  />
                  Auto-Sync MikroTik
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateInvoices}
                    onChange={e => setAutoGenerateInvoices(e.target.checked)}
                    className="accent-primary"
                  />
                  Issue August Invoices
                </label>
              </div>
            </div>

            {/* Table Container */}
            <div className="rounded-2xl overflow-hidden shadow-sm bg-card border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="relative w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={previewSearch}
                    onChange={e => setPreviewSearch(e.target.value)}
                    placeholder="Filter preview subscribers..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl outline-none text-xs"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">Showing first 8 verified rows</span>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: "var(--muted)" }}>
                    {["Status", "Customer ID", "Customer Name", "Mobile Phone", "Zone", "Assigned Package", "PPPoE Username", "Static IP"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left font-semibold text-muted-foreground tracking-wider">
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPreviews.map((r, i) => (
                    <tr
                      key={r.id}
                      style={{ borderBottom: i < filteredPreviews.length - 1 ? "1px solid var(--border)" : "none" }}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <CheckCircle2 size={14} /> Ready
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-muted-foreground">{r.id}</td>
                      <td className="px-5 py-3.5 font-bold text-foreground">{r.name}</td>
                      <td className="px-5 py-3.5 font-mono text-muted-foreground">{r.phone}</td>
                      <td className="px-5 py-3.5 text-foreground">{r.zone}</td>
                      <td className="px-5 py-3.5 font-semibold text-primary">{r.package}</td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-foreground">{r.pppoe}</td>
                      <td className="px-5 py-3.5 font-mono text-muted-foreground">{r.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setStep("validate")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors"
              >
                <ArrowLeft size={14} /> Back to Validation
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-8 py-3 rounded-xl text-white text-xs font-semibold shadow-md hover:opacity-90 transition-opacity"
                style={{ background: "var(--primary)" }}
              >
                Execute Bulk Import ({validationStats.valid.toLocaleString()} Subscribers) <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Network Sync Importing (Live Console) ───────────────────── */}
        {step === "importing" && (
          <div className="rounded-2xl p-14 flex flex-col items-center text-center shadow-md bg-card border border-border space-y-6">
            <div className="flex items-center justify-center rounded-2xl w-24 h-24 bg-primary/10 animate-pulse">
              <RefreshCw size={44} className="text-primary animate-spin" />
            </div>

            <div className="space-y-2 max-w-lg">
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
                Provisioning Customers on Network...
              </h3>
              <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
                {currentSyncTask}
              </p>
            </div>

            <div className="w-full max-w-lg pt-2">
              <div className="flex justify-between mb-2 text-xs font-semibold">
                <span className="text-muted-foreground font-mono">
                  {Math.round((progress * validationStats.valid) / 100).toLocaleString()} of {validationStats.valid.toLocaleString()} Completed
                </span>
                <span className="text-primary font-mono font-bold text-sm">{progress}%</span>
              </div>
              <div className="h-3.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "var(--primary)" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5: Completed ────────────────────────────────────────────────── */}
        {step === "done" && (
          <div className="rounded-2xl p-14 flex flex-col items-center text-center shadow-md bg-card border border-border space-y-6">
            <div className="flex items-center justify-center rounded-2xl w-24 h-24 bg-emerald-100 shadow-sm">
              <CheckCircle2 size={48} className="text-emerald-600" />
            </div>

            <div className="space-y-2 max-w-lg">
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--foreground)" }}>
                Customer Onboarding & Sync Complete!
              </h3>
              <p style={{ fontSize: 15, color: "var(--foreground)" }}>
                <strong className="text-emerald-600">{validationStats.valid.toLocaleString()}</strong> subscribers successfully registered in CRM and provisioned on MikroTik / OLT.
              </p>
              <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                27 invalid rows excluded · Automatic August invoices generated and queued for SMS dispatch.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => { setStep("upload"); setSelectedFileName(""); setProgress(0); }}
                className="px-6 py-3 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-semibold transition-colors"
              >
                Import Another Batch
              </button>
              <button
                onClick={() => onNavigate?.("customers")}
                className="px-8 py-3 rounded-xl text-white text-xs font-semibold shadow-md hover:opacity-90 transition-opacity"
                style={{ background: "var(--primary)" }}
              >
                Open Customer Directory →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
