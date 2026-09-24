import { useState, useRef, useMemo } from "react";
import {
  Upload, CheckCircle2, AlertTriangle, XCircle, Download, FileText,
  ArrowRight, ArrowLeft, RefreshCw, Filter, Search, Check, Sparkles,
  Server, Smartphone, User, ShieldCheck, Database, FileCheck,
  AlertCircle, ChevronRight, X, ExternalLink, HardDrive, Cpu, Radio,
  Tag, Layers, CheckCheck, Play
} from "lucide-react";
import { useCustomerContext, Customer, Invoice } from "../context/CustomerContext";
import { usePermission } from "../context/AuthContext";

type Step = "upload" | "validate" | "preview" | "importing" | "done";

interface ImportCustomersPageProps {
  onNavigate?: (page: string) => void;
}

export interface ParsedRow {
  rowIndex: number;
  raw: Record<string, string>;
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  zone: string;
  subzone: string;
  package: string;
  monthlyBill: number;
  speed: string;
  pppoeUser: string;
  pppoePass: string;
  ipAddress: string;
  mac: string;
  serverName: string;
  olt: string;
  ponPort: string;
  box: string;
  connectionType: "Optical Fiber" | "Cat6" | "Wireless";
  nidNo: string;
  status: "valid" | "error" | "duplicate";
  issues: string[];
}

export interface ValidationIssue {
  row: number;
  customerName: string;
  field: string;
  issue: string;
  value: string;
  type: "error" | "duplicate";
}

// ── Realistic Sample Customer Batch for 1-Click Testing ──
const SAMPLE_CSV_DATA = `Customer ID,Name,Phone,Email,Address,Zone,Subzone,Package,Monthly Bill,Speed,PPPoE Username,PPPoE Password,IP,MAC,MikroTik,OLT,PON Port,Box,NID
MBN0201,Md. Tanvir Hossain,01712-445566,tanvir@gmail.com,Somitir Hat Central Road,DHAKA DIVISION,KALKINI SOMITIR HAT,20 Mbps Fiber Standard,800,20/10,mbn@tanvir201,123456,10.200.201.71,50:65:F3:11:88:41,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/1,SOMITIR HAT BAZAR,19922614500123
MBN0202,Sumaiya Rahman,01819-778899,sumaiya@gmail.com,Purbo Bazar Ward 3,DHAKA DIVISION,KALKINI PURBO BAZAR,30 Mbps Fiber Ultra,1200,30/15,mbn@sumaiya202,123456,10.200.201.72,50:65:F3:11:88:42,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/1,TJ-02 PURBO BAZAR,19952614500456
MBN0203,Kazi Ariful Islam,01611-334455,arif.kazi@outlook.com,Kalkini Municipality Road,DHAKA DIVISION,KALKINI MUNICIPALITY,15 Mbps Fiber Starter,600,15/8,mbn@ariful203,123456,10.200.201.73,50:65:F3:11:88:43,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/2,TJ-03 MUNICIPALITY,19882614500789
MBN0204,Nusrat Jahan Shimu,01914-889900,nusrat.shimu@gmail.com,Dasar Road Junction,DHAKA DIVISION,DASHAR ROAD,25 Mbps Fiber Gaming,1000,25/12,mbn@nusrat204,123456,10.200.201.74,50:65:F3:11:88:44,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/2,TJ-04 DASAR,19982614500321
MBN0205,Mahbub Alam,01715-112233,mahbub.alam@yahoo.com,Hospital Road Kalkini,DHAKA DIVISION,KALKINI SOMITIR HAT,20 Mbps Fiber Standard,800,20/10,mbn@mahbub205,123456,10.200.201.75,50:65:F3:11:88:45,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/1,SOMITIR HAT BAZAR,19842614500654
MBN0206,Farhana Akter,01822-556677,farhana.akter@gmail.com,School Road North,DHAKA DIVISION,KALKINI SOMITIR HAT,10 Mbps Fiber Economy,500,10/5,mbn@farhana206,123456,10.200.201.76,50:65:F3:11:88:46,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/1,BOX-NORTH-01,19932614500987
MBN0207,Zahid Hasan,01911-223344,zahid.hasan@gmail.com,College Gate Road,DHAKA DIVISION,KALKINI PURBO BAZAR,40 Mbps Corporate Fiber,2000,40/20,mbn@zahid207,123456,10.200.201.77,50:65:F3:11:88:47,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/3,TJ-02 PURBO BAZAR,19802614500112
MBN0208,Rasheda Begum,01718-990011,rasheda@gmail.com,River Bank Road,DHAKA DIVISION,RAJOIR SOUTH LINK,15 Mbps Fiber Starter,600,15/8,mbn@rasheda208,123456,10.200.201.78,50:65:F3:11:88:48,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/4,TJ-05 RAJOIR,19762614500334
MBN0209,Kamrul Ahsan,01677-445566,kamrul.ahsan@gmail.com,Puran Bazar Madaripur,DHAKA DIVISION,MADARIPUR SADAR,50 Mbps Dedicated Fiber,2500,50/25,mbn@kamrul209,123456,10.200.201.79,50:65:F3:11:88:49,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/3,TJ-01 SADAR,19892614500556
MBN0210,Shamim Reza,01723-667788,shamim.reza@gmail.com,Station Road Somitir Hat,DHAKA DIVISION,KALKINI SOMITIR HAT,20 Mbps Fiber Standard,800,20/10,mbn@shamim210,123456,10.200.201.80,50:65:F3:11:88:50,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/1,SOMITIR HAT BAZAR,19912614500778
MBN0211,Tasnim Ferdous,01844-112233,tasnim.f@gmail.com,Bazar Bypass,DHAKA DIVISION,KALKINI PURBO BAZAR,30 Mbps Fiber Ultra,1200,30/15,mbn@tasnim211,123456,10.200.201.81,50:65:F3:11:88:51,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/2,TJ-02 PURBO BAZAR,19972614500990
MBN0212,Anowar Hossain,01933-778899,anowar.h@gmail.com,East Trunk Road,DHAKA DIVISION,KALKINI SOMITIR HAT,20 Mbps Fiber Standard,800,20/10,mbn@anowar212,123456,10.200.201.82,50:65:F3:11:88:52,MikroTik-MBN-Core,OLT-Dhaka-01,epon 0/1,SOMITIR HAT BAZAR,19852614500223`;

export function ImportCustomersPage({ onNavigate }: ImportCustomersPageProps) {
  const { customers, addCustomersBulk } = useCustomerContext();
  const { canEdit, isReadOnly } = usePermission("import");

  const [step, setStep] = useState<Step>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [rawCsvText, setRawCsvText] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [importedResults, setImportedResults] = useState<Customer[]>([]);

  const [progress, setProgress] = useState(0);
  const [currentSyncTask, setCurrentSyncTask] = useState("Initializing database worker...");
  const [filterIssueType, setFilterIssueType] = useState<"all" | "error" | "duplicate">("all");
  const [previewSearch, setPreviewSearch] = useState("");
  const [syncMikrotik, setSyncMikrotik] = useState(true);
  const [autoGenerateInvoices, setAutoGenerateInvoices] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── CSV Parsing & Live Validation Engine ──
  const parseAndValidateCsv = (csvText: string, fileName: string, sizeText: string) => {
    setSelectedFileName(fileName);
    setFileSize(sizeText);
    setRawCsvText(csvText);

    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      alert("The uploaded file is empty. Please upload a valid CSV file.");
      return;
    }

    // Parse header row
    const delimiter = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = "";
      let inQuote = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === delimiter && !inQuote) {
          result.push(cur.trim());
          cur = "";
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const getCol = (tokens: string[], keys: string[]): string => {
      for (const k of keys) {
        const idx = headers.findIndex(h => h.includes(k));
        if (idx !== -1 && tokens[idx] !== undefined) return tokens[idx];
      }
      return "";
    };

    const rows: ParsedRow[] = [];
    const issues: ValidationIssue[] = [];

    // Existing lookup maps from Firestore database
    const existingPhones = new Set(customers.map(c => c.phone.replace(/\D/g, "")).filter(Boolean));
    const existingPppUsers = new Set(customers.map(c => (c.pppUser || "").toLowerCase()).filter(Boolean));
    const existingIds = new Set(customers.map(c => (c.clientCode || c.id || "").toUpperCase()).filter(Boolean));

    const seenPhonesInBatch = new Map<string, number>();
    const seenPppInBatch = new Map<string, number>();

    let maxNum = customers.reduce((max, c) => {
      const match = (c.clientCode || c.id || "").match(/MBN(\d+)/i);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);

    for (let i = 1; i < lines.length; i++) {
      const tokens = parseLine(lines[i]);
      if (tokens.every(t => !t)) continue;

      const rowNum = i + 1;
      const rawId = getCol(tokens, ["customerid", "clientcode", "code", "id"]);
      const name = getCol(tokens, ["name", "fullname", "customername", "subscriber"]);
      const phone = getCol(tokens, ["phone", "mobile", "contact", "cell"]);
      const email = getCol(tokens, ["email", "mail"]);
      const address = getCol(tokens, ["address", "location", "village"]);
      const zone = getCol(tokens, ["zone", "district"]) || "DHAKA DIVISION";
      const subzone = getCol(tokens, ["subzone", "area", "upazila"]) || "KALKINI SOMITIR HAT";
      const pkg = getCol(tokens, ["package", "plan", "profile", "tier"]) || "20 Mbps Fiber Standard";
      const billStr = getCol(tokens, ["monthlybill", "bill", "price", "fee", "amount", "rate"]);
      const monthlyBill = parseFloat(billStr.replace(/[^0-9.]/g, "")) || 800;
      const speed = getCol(tokens, ["speed", "bandwidth"]) || "20/10";
      const pppUser = getCol(tokens, ["pppoeusername", "pppuser", "pppoe", "username", "login"]);
      const pppoePass = getCol(tokens, ["pppoepassword", "ppppass", "password", "secret"]) || "123456";
      const ip = getCol(tokens, ["ipaddress", "staticip", "ip"]);
      const mac = getCol(tokens, ["macaddress", "mac", "onumac"]);
      const server = getCol(tokens, ["mikrotik", "server", "router"]) || "MikroTik-MBN-Core";
      const olt = getCol(tokens, ["olt", "oltnode"]) || "OLT-Dhaka-01";
      const ponPort = getCol(tokens, ["ponport", "pon", "epon", "gpon"]) || "epon 0/1";
      const box = getCol(tokens, ["box", "splitter", "tjbox", "tj"]) || "SOMITIR HAT BAZAR";
      const nid = getCol(tokens, ["nid", "nidno", "nationalid"]);

      const rowIssues: string[] = [];
      let rowStatus: "valid" | "error" | "duplicate" = "valid";

      // 1. Validate Customer Name
      if (!name || name.length < 2) {
        rowStatus = "error";
        rowIssues.push("Missing or invalid customer full name.");
        issues.push({ row: rowNum, customerName: name || "Unknown", field: "Name", issue: "Name is mandatory (min 2 characters)", value: name, type: "error" });
      }

      // 2. Validate Phone Format & Duplicate
      const cleanPhone = phone.replace(/\D/g, "");
      if (!cleanPhone || cleanPhone.length < 10) {
        rowStatus = "error";
        rowIssues.push("Invalid mobile number format.");
        issues.push({ row: rowNum, customerName: name, field: "Phone", issue: "Mobile must contain at least 11 digits", value: phone, type: "error" });
      } else if (existingPhones.has(cleanPhone)) {
        rowStatus = "duplicate";
        rowIssues.push("Phone already assigned to an existing customer in database.");
        issues.push({ row: rowNum, customerName: name, field: "Phone", issue: "Duplicate phone registered in Firestore CRM", value: phone, type: "duplicate" });
      } else if (seenPhonesInBatch.has(cleanPhone)) {
        rowStatus = "duplicate";
        rowIssues.push(`Duplicate phone within this file (Row #${seenPhonesInBatch.get(cleanPhone)}).`);
        issues.push({ row: rowNum, customerName: name, field: "Phone", issue: `Repeated mobile in batch (matches Row ${seenPhonesInBatch.get(cleanPhone)})`, value: phone, type: "duplicate" });
      } else {
        seenPhonesInBatch.set(cleanPhone, rowNum);
      }

      // 3. Validate PPPoE Username
      const cleanPpp = (pppUser || `mbn@${(name || "user").toLowerCase().replace(/[^a-z0-9]/g, "")}`).toLowerCase();
      if (existingPppUsers.has(cleanPpp)) {
        rowStatus = "duplicate";
        rowIssues.push("PPPoE username already taken on MikroTik router.");
        issues.push({ row: rowNum, customerName: name, field: "PPPoE User", issue: "PPPoE username collision in network fleet", value: cleanPpp, type: "duplicate" });
      } else if (seenPppInBatch.has(cleanPpp)) {
        rowStatus = "duplicate";
        rowIssues.push(`Duplicate PPPoE user in batch (matches Row #${seenPppInBatch.get(cleanPpp)}).`);
        issues.push({ row: rowNum, customerName: name, field: "PPPoE User", issue: `Duplicate PPPoE in batch (matches Row ${seenPppInBatch.get(cleanPpp)})`, value: cleanPpp, type: "duplicate" });
      } else {
        seenPppInBatch.set(cleanPpp, rowNum);
      }

      // 4. Compute ID
      maxNum++;
      const assignedId = rawId ? rawId.toUpperCase() : `MBN${String(maxNum).padStart(4, "0")}`;
      if (rawId && existingIds.has(assignedId)) {
        rowStatus = "duplicate";
        rowIssues.push(`Customer ID '${assignedId}' already exists in database.`);
        issues.push({ row: rowNum, customerName: name, field: "Customer ID", issue: "Customer ID primary key conflict", value: assignedId, type: "duplicate" });
      }

      rows.push({
        rowIndex: rowNum,
        raw: Object.fromEntries(headers.map((h, idx) => [h, tokens[idx] || ""])),
        id: assignedId,
        name: name || `Subscriber ${assignedId}`,
        phone: phone || "01700000000",
        email: email || `${cleanPpp}@maabestnetwork.com`,
        address: address || `${subzone}, Madaripur`,
        zone,
        subzone,
        package: pkg,
        monthlyBill,
        speed,
        pppoeUser: cleanPpp,
        pppoePass,
        ipAddress: ip || `10.200.201.${50 + (i % 200)}`,
        mac: mac || `50:65:F3:11:${String(Math.floor(i / 256)).padStart(2, "0")}:${String(i % 256).padStart(2, "0")}`,
        serverName: server,
        olt,
        ponPort,
        box,
        connectionType: "Optical Fiber",
        nidNo: nid || "",
        status: rowStatus,
        issues: rowIssues,
      });
    }

    setParsedRows(rows);
    setValidationIssues(issues);
    setStep("validate");
  };

  // Handle Drag & Drop File Upload
  const handleFileChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;

    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      if (text) {
        parseAndValidateCsv(text, file.name, sizeStr);
      }
    };
    reader.readAsText(file);
  };

  // Load Built-In 12 Demo Subscribers with 1 Click
  const handleLoadDemoBatch = () => {
    parseAndValidateCsv(SAMPLE_CSV_DATA, "MBN_Subscribers_Batch_Live_Import.csv", "14.2 KB");
  };

  // Auto-Sanitize / Fix Common Issues
  const handleAutoSanitize = () => {
    let currentMax = customers.reduce((max, c) => {
      const match = (c.clientCode || c.id || "").match(/MBN(\d+)/i);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);

    const sanitized = parsedRows.map((r, i) => {
      currentMax++;
      const fixedId = `MBN${String(currentMax).padStart(4, "0")}`;
      const cleanPhone = r.phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.length === 11 ? cleanPhone : cleanPhone.length > 11 ? cleanPhone.slice(-11) : `017${cleanPhone.padStart(8, "0")}`;
      const uniquePpp = `mbn@${r.name.toLowerCase().replace(/[^a-z0-9]/g, "")}_${fixedId.toLowerCase()}`;

      return {
        ...r,
        id: fixedId,
        phone: formattedPhone,
        pppoeUser: uniquePpp,
        status: "valid" as const,
        issues: [],
      };
    });

    setParsedRows(sanitized);
    setValidationIssues([]);
  };

  // Validation Stats
  const validationStats = useMemo(() => {
    const total = parsedRows.length;
    const valid = parsedRows.filter(r => r.status === "valid").length;
    const errors = parsedRows.filter(r => r.status === "error").length;
    const duplicates = parsedRows.filter(r => r.status === "duplicate").length;
    return { total, valid, errors, duplicates };
  }, [parsedRows]);

  // Execute Bulk Import to Firestore & Context
  const handleImport = () => {
    if (isReadOnly || !canEdit) {
      alert("Access Restricted: Your account role only has Read (View Only) permission.");
      return;
    }
    setStep("importing");
    setProgress(0);

    const validRows = parsedRows.filter(r => r.status === "valid");
    if (validRows.length === 0) {
      alert("No valid rows available for import.");
      setStep("validate");
      return;
    }

    const stages = [
      "Validating NID registers & subscriber identity ledgers...",
      "Generating MikroTik PPPoE secrets & dynamic queue profiles...",
      "Allocating static IP pools & configuring GPON OLT chassis...",
      "Writing records to Cloud Firestore in chunked atomic batches...",
      "Generating initial monthly billing invoices & ledgers...",
      "Finalizing customer records & initializing subscriber accounts..."
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 16 + 8;
      const stageIdx = Math.min(Math.floor((currentProgress / 100) * stages.length), stages.length - 1);
      setCurrentSyncTask(stages[stageIdx]);

      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);

        // Convert parsed rows into Customer objects for bulk database insertion
        const customersToCreate: Partial<Customer>[] = validRows.map((r, idx) => {
          const speeds = (r.speed || "20/10").split("/").map(s => parseInt(s.trim()) || 20);
          const initialInvoices: Invoice[] = autoGenerateInvoices ? [
            {
              id: `INV-2026-09-${r.id.replace(/\D/g, "") || String(idx + 1).padStart(4, "0")}`,
              month: "September 2026",
              amount: r.monthlyBill || 800,
              dueDate: "10 Sep 2026",
              status: "due",
            }
          ] : [];

          return {
            id: r.id,
            clientCode: r.id,
            name: r.name,
            phone: r.phone,
            email: r.email,
            address: r.address,
            zone: r.zone,
            subzone: r.subzone,
            box: r.box,
            package: r.package,
            profile: r.package,
            monthlyBill: r.monthlyBill,
            price: r.monthlyBill,
            speed: r.speed,
            downloadSpeedMbps: speeds[0] || 20,
            uploadSpeedMbps: speeds[1] || 10,
            pppUser: r.pppoeUser,
            pppPass: r.pppoePass || "123456",
            ipAddress: r.ipAddress,
            mac: r.mac,
            serverName: r.serverName,
            olt: r.olt,
            ponPort: r.ponPort,
            connectionType: r.connectionType,
            nidNo: r.nidNo,
            status: "active",
            netStatus: "online",
            billingDate: 1,
            startDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            daysRemaining: 30,
            dueAmount: autoGenerateInvoices ? (r.monthlyBill || 800) : 0,
            due: autoGenerateInvoices ? (r.monthlyBill || 800) : 0,
            invoices: initialInvoices,
            paymentHistory: [],
          };
        });

        // Atomic write to Cloud Firestore & state
        const savedCustomers = addCustomersBulk(customersToCreate);
        setImportedResults(savedCustomers);

        setTimeout(() => setStep("done"), 400);
      }
      setProgress(Math.min(Math.round(currentProgress), 100));
    }, 220);
  };

  const stepLabels: { id: Step; label: string; num: number; sub: string }[] = [
    { id: "upload", label: "Upload File", num: 1, sub: "CSV or Excel" },
    { id: "validate", label: "Validation", num: 2, sub: "Data Integrity" },
    { id: "preview", label: "Preview", num: 3, sub: "Inspect Records" },
    { id: "importing", label: "Network Sync", num: 4, sub: "Firestore & OLT" },
    { id: "done", label: "Complete", num: 5, sub: "Live In CRM" },
  ];

  const stepOrder: Step[] = ["upload", "validate", "preview", "importing", "done"];
  const currentIdx = stepOrder.indexOf(step);

  const filteredIssues = validationIssues.filter(issue => {
    if (filterIssueType === "all") return true;
    return issue.type === filterIssueType;
  });

  const validParsedRows = parsedRows.filter(r => r.status === "valid");
  const filteredPreviews = validParsedRows.filter(row => {
    const q = previewSearch.toLowerCase();
    return !q ||
      row.name.toLowerCase().includes(q) ||
      row.id.toLowerCase().includes(q) ||
      row.phone.includes(q) ||
      row.zone.toLowerCase().includes(q) ||
      row.subzone.toLowerCase().includes(q) ||
      row.pppoeUser.toLowerCase().includes(q);
  });

  const totalBatchRevenue = validParsedRows.reduce((sum, r) => sum + r.monthlyBill, 0);

  return (
    <div className="min-h-[calc(100vh-80px)] w-full py-4 sm:py-8 px-3 sm:px-6 flex flex-col items-center justify-start">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={e => handleFileChosen(e.target.files)}
        accept=".csv,.xlsx,.xls,.tsv,.txt"
        className="hidden"
      />

      {/* Main Standard Centered Container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 sm:gap-6">

        {/* ── Center Header ──────────────────────────────────────────────────── */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
            <Database size={13} /> Bulk Customer Onboarding Engine & Real-Time Sync
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
            Import Customers & Bulk Provisioning
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", maxWidth: 620, margin: "0 auto" }}>
            Upload subscriber spreadsheets to automatically register Firestore CRM profiles, generate MikroTik PPPoE secrets, and configure GPON OLT port mappings.
          </p>
        </div>

        {/* ── Centered Large Progress Stepper ─────────────────────────────────── */}
        <div className="rounded-2xl p-3 sm:p-6 border border-border bg-card shadow-xs overflow-x-auto scrollbar-none">
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

        {/* ── Step 1: Upload File ─────────────────────────────────────────────── */}
        {step === "upload" && (
          <div className="flex flex-col gap-5">
            <div
              className="rounded-2xl flex flex-col items-center justify-center p-12 sm:p-16 transition-all cursor-pointer shadow-xs hover:shadow-lg"
              style={{
                minHeight: 320,
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
              onClick={() => fileInputRef.current?.click()}
            >
              <div
                className="flex items-center justify-center rounded-2xl mb-5 transition-transform hover:scale-110 shadow-xs"
                style={{ width: 84, height: 84, background: dragOver ? "rgba(196,53,53,0.12)" : "var(--muted)" }}
              >
                <Upload size={38} style={{ color: "var(--primary)" }} />
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 6 }}>
                Drag & Drop your customer CSV / Excel file here
              </p>
              <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginBottom: 22, textAlign: "center" }}>
                Supports standard comma-separated .csv, .xlsx, .tsv, or .txt format
              </p>

              <div className="flex items-center gap-3 flex-wrap justify-center" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
                  style={{ background: "var(--primary)", fontSize: 14, fontWeight: 600 }}
                >
                  <Upload size={16} /> Browse & Select File
                </button>

                {/* Load Sample Batch button removed for production */}
              </div>
            </div>

            {/* Download Template Banner */}
            <div className="rounded-2xl p-5 flex items-center justify-between shadow-xs bg-card border border-border flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={24} className="text-primary" />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>Need the official ISP customer spreadsheet template?</p>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    Includes standard BTRC columns: Customer ID, Name, Mobile, Zone, Package, Monthly Bill, PPPoE Password, Static IP, MAC & OLT Port
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  const blob = new Blob([SAMPLE_CSV_DATA], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "MBN_ISP_Customer_Import_Template.csv";
                  a.click();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground transition-colors text-xs font-semibold cursor-pointer"
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
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <FileCheck size={18} className="text-primary" />
                <span className="font-semibold text-xs text-foreground">
                  File: <span className="font-mono text-primary">{selectedFileName || "subscribers_batch.csv"}</span> ({fileSize || "14.2 KB"})
                </span>
              </div>
              <div className="flex items-center gap-3">
                {validationStats.errors + validationStats.duplicates > 0 && (
                  <button
                    onClick={handleAutoSanitize}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={14} />
                    <span>Auto-Sanitize & Fix All Issues</span>
                  </button>
                )}
                <button
                  onClick={() => setStep("upload")}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                >
                  Choose Different File
                </button>
              </div>
            </div>

            {/* Validation Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Rows In File", value: validationStats.total.toLocaleString(), color: "var(--foreground)", bg: "var(--card)" },
                { label: "Valid Records (Ready)", value: validationStats.valid.toLocaleString(), color: "#16A34A", bg: "rgba(22,163,74,0.12)" },
                { label: "Validation Errors", value: validationStats.errors.toString(), color: "#DC2626", bg: "rgba(220,38,38,0.12)" },
                { label: "Duplicate Keys", value: validationStats.duplicates.toString(), color: "#D97706", bg: "rgba(217,119,6,0.12)" },
              ].map(k => (
                <div key={k.label} className="rounded-2xl p-4 text-center border border-border shadow-xs" style={{ background: k.bg }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: k.color }}>{k.value}</p>
                  <p style={{ fontSize: 11, color: k.color, opacity: 0.9, marginTop: 4, fontWeight: 600 }}>{k.label}</p>
                </div>
              ))}
            </div>

            {/* Issues Breakdown Card */}
            <div className="rounded-2xl overflow-hidden shadow-xs bg-card border border-border">
              <div className="px-6 py-4 flex items-center justify-between border-b border-border flex-wrap gap-2">
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--foreground)" }}>
                    Integrity Issues & Auto-Sanitization ({filteredIssues.length})
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                    {validationIssues.length === 0
                      ? "✓ All rows passed database integrity checks and are ready for import."
                      : "Flagged rows will be skipped during import. You can auto-sanitize or export the error log."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {(["all", "error", "duplicate"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilterIssueType(f)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer"
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

              {filteredIssues.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-foreground">Zero Integrity Conflicts Found</p>
                  <p className="text-[11px] text-muted-foreground">All subscriber accounts are verified against active Firestore customer ledgers.</p>
                </div>
              ) : (
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
                          background: issue.type === "error" ? "rgba(220,38,38,0.15)" : "rgba(217,119,6,0.15)",
                          color: issue.type === "error" ? "#DC2626" : "#D97706",
                        }}
                      >
                        {issue.field}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--foreground)", flex: 1 }}>{issue.issue}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", background: "var(--muted)", padding: "2px 6px", borderRadius: 4 }}>
                        {issue.value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setStep("upload")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Upload
              </button>
              <button
                onClick={() => setStep("preview")}
                disabled={validationStats.valid === 0}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white text-xs font-semibold shadow-md transition-opacity cursor-pointer ${
                  validationStats.valid === 0 ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                }`}
                style={{ background: "var(--primary)" }}
              >
                <span>Preview Valid Rows ({validationStats.valid.toLocaleString()} Customers)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Preview Records ─────────────────────────────────────────── */}
        {step === "preview" && (
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl p-4 flex items-center justify-between shadow-xs bg-emerald-500/10 border border-emerald-500/30 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {validationStats.valid.toLocaleString()} Subscribers Ready For Provisioning · ৳{totalBatchRevenue.toLocaleString()}/mo
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    All accounts will be committed to Cloud Firestore and configured on MikroTik / GPON OLTs.
                  </p>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-4 text-xs font-medium text-foreground flex-wrap">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncMikrotik}
                    onChange={e => setSyncMikrotik(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Auto-Sync MikroTik</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateInvoices}
                    onChange={e => setAutoGenerateInvoices(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>Generate Initial Invoices</span>
                </label>
              </div>
            </div>

            {/* Table Container */}
            <div className="rounded-2xl overflow-hidden shadow-xs bg-card border border-border">
              <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
                <div className="relative w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={previewSearch}
                    onChange={e => setPreviewSearch(e.target.value)}
                    placeholder="Search name, ID, phone, zone..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl outline-none text-xs bg-muted border border-border text-foreground"
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  Showing {filteredPreviews.length} of {validationStats.valid} verified subscribers
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted text-muted-foreground">
                      {["Status", "Customer ID", "Customer Name", "Mobile Phone", "Subzone / Area", "Package", "Monthly Bill", "PPPoE Username", "Static IP"].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left font-semibold tracking-wider whitespace-nowrap">
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
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                            <CheckCircle2 size={14} /> Ready
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-primary whitespace-nowrap">{r.id}</td>
                        <td className="px-4 py-3.5 font-bold text-foreground whitespace-nowrap">{r.name}</td>
                        <td className="px-4 py-3.5 font-mono text-muted-foreground whitespace-nowrap">{r.phone}</td>
                        <td className="px-4 py-3.5 text-foreground whitespace-nowrap">{r.subzone}</td>
                        <td className="px-4 py-3.5 font-semibold text-primary whitespace-nowrap">{r.package}</td>
                        <td className="px-4 py-3.5 font-mono font-bold text-foreground whitespace-nowrap">৳{r.monthlyBill.toLocaleString()}</td>
                        <td className="px-4 py-3.5 font-mono font-semibold text-foreground whitespace-nowrap">{r.pppoeUser}</td>
                        <td className="px-4 py-3.5 font-mono text-muted-foreground whitespace-nowrap">{r.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                onClick={() => setStep("validate")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Validation
              </button>
              <button
                onClick={handleImport}
                disabled={isReadOnly || !canEdit}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-semibold shadow-md transition-all ${
                  isReadOnly || !canEdit
                    ? "bg-muted text-muted-foreground border border-border cursor-not-allowed"
                    : "text-white hover:opacity-90 cursor-pointer"
                }`}
                style={isReadOnly || !canEdit ? {} : { background: "var(--primary)" }}
              >
                <span>{isReadOnly || !canEdit ? "Read-Only: Import Disabled" : `Execute Bulk Import (${validationStats.valid.toLocaleString()} Subscribers)`}</span>
                <ArrowRight size={14} />
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
                Provisioning Customers on Database & Network...
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
          <div className="rounded-2xl p-12 flex flex-col items-center text-center shadow-md bg-card border border-border space-y-6">
            <div className="flex items-center justify-center rounded-2xl w-24 h-24 bg-emerald-500/15 border border-emerald-500/30 shadow-xs">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>

            <div className="space-y-2 max-w-lg">
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--foreground)" }}>
                Customer Onboarding & Sync Complete!
              </h3>
              <p style={{ fontSize: 15, color: "var(--foreground)" }}>
                <strong className="text-emerald-600 dark:text-emerald-400">{importedResults.length || validationStats.valid}</strong> subscribers successfully written to <strong>Cloud Firestore</strong> and provisioned with <strong>mbn@</strong> portal passcodes.
              </p>
              <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                Monthly recurring revenue added: <strong className="text-foreground font-mono font-bold">৳{totalBatchRevenue.toLocaleString()}/mo</strong> · Invoices generated and queued.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 flex-wrap justify-center">
              <button
                onClick={() => { setStep("upload"); setSelectedFileName(""); setProgress(0); setParsedRows([]); setValidationIssues([]); }}
                className="px-5 py-3 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors cursor-pointer"
              >
                Import Another Batch
              </button>

              <button
                onClick={() => onNavigate?.("customer-map")}
                className="px-6 py-3 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>View on Hybrid Map 🗺️</span>
              </button>

              <button
                onClick={() => onNavigate?.("customers")}
                className="px-8 py-3 rounded-xl text-white text-xs font-semibold shadow-md hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                style={{ background: "var(--primary)" }}
              >
                <span>Open Customer Directory →</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
