import { useState } from "react";
import {
  Settings as SettingsIcon, CheckCircle2, Save, Building2,
  Phone, Globe, Shield, RefreshCw, X, Upload, Palette, Link,
  Mail, Bell, Key, CreditCard, Image, Eye, EyeOff, Lock,
  Smartphone, Server, Database, Clock, AlertTriangle,
  ChevronRight, Wifi, Zap, DollarSign, FileText, Users, Star,
  Check, Copy, ExternalLink, Plus, Crown, MessageSquare, HardDrive, Sparkles
} from "lucide-react";

interface SettingsPageProps {
  onNavigate?: (page: string) => void;
}

type SettingsTab = "company" | "billing" | "invoice" | "notifications" | "security" | "subscription";

const inputStyle = {
  background: "var(--muted)",
  border: "1px solid var(--border)",
  fontSize: 13,
  color: "var(--foreground)",
};

const sectionCard = {
  background: "var(--card)",
  border: "1px solid var(--border)",
};

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const [toast, setToast] = useState("");

  // ── Company Profile ──────────────────────────────────────────────────────
  const [company, setCompany] = useState({
    legalName: "MAA BEST NETWORK Ltd.",
    displayName: "MAA BEST NETWORK",
    tagline: "Ultra-Fast Gigabit Fiber & Enterprise Connectivity",
    btrcLicense: "BTRC/ISP-NAT-2024/991",
    binNo: "001294820-0102",
    hotline: "09611-223344",
    supportEmail: "support@maabestnetwork.com",
    website: "https://maabestnetwork.com",
    address: "Holding 12, Main Road, Block B, Dhaka, Bangladesh",
    currency: "BDT (৳)",
    timezone: "Asia/Dhaka (GMT+6)",
    dateFormat: "DD/MM/YYYY",
  });

  // ── Billing Rules ─────────────────────────────────────────────────────────
  const [billing, setBilling] = useState({
    billingDay: "1",
    dueAfterDays: "10",
    gracePeriodDays: "2",
    autoDisconnect: true,
    autoReconnect: true,
    lateFeeEnabled: true,
    lateFeeType: "fixed" as "fixed" | "percent",
    lateFeeAmount: "50",
    vatPercent: "0",
    sendInvoiceSms: true,
    sendInvoiceEmail: true,
    reminderDaysBefore: "3",
    finalReminderDaysBefore: "1",
    currency: "BDT",
    invoicePrefix: "MBN",
    receiptPrefix: "RCP",
  });

  // ── Invoice ────────────────────────────────────────────────────────────────
  const [invoice, setInvoice] = useState({
    footerText: "Thank you for choosing MAA BEST NETWORK. For support: 09611-223344",
    showLogo: true,
    showAddress: true,
    showBtrcLicense: true,
    showVat: false,
    showTerms: true,
    terms: "Payment is due by the specified due date. Late payments may result in service interruption.",
    bankDetails: "",
    stampText: "PAID",
  });

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState({
    smsGateway: "ssl_commerz",
    smsApiUrl: "",
    smsApiKey: "mbn_live_sec_991823a4b",
    smsSenderId: "MAA_BEST",
    smtpHost: "mail.maabestnetwork.com",
    smtpPort: "587",
    smtpUser: "billing@maabestnetwork.com",
    smtpPass: "••••••••••••",
    alertCpuThreshold: "80",
    alertRamThreshold: "85",
    alertBandwidthThreshold: "90",
    alertOnDeviceDown: true,
    alertOnPaymentReceived: true,
    alertOnDisconnect: true,
    alertOnBackupFail: true,
  });

  // ── Security ───────────────────────────────────────────────────────────────
  const [security, setSecurity] = useState({
    require2FA: false,
    sessionTimeout: "8",
    maxLoginAttempts: "5",
    lockoutDuration: "15",
    passwordMinLength: "8",
    requireSpecialChar: true,
    requireNumber: true,
    logAllActions: true,
    logIpAddresses: true,
    allowMultipleSessions: false,
    showLoginHistory: true,
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "company", label: "Company Profile", icon: Building2 },
    { id: "billing", label: "Billing Rules", icon: CreditCard },
    { id: "invoice", label: "Invoice & Receipt", icon: FileText },
    { id: "notifications", label: "Notifications & SMS", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "subscription", label: "Subscription Plan", icon: Star },
  ];

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0"
      style={{
        width: 40, height: 22,
        background: value ? "var(--primary)" : "var(--border)",
        borderRadius: 11, transition: "background 0.2s",
        border: "none", cursor: "pointer",
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%",
        background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }} />
    </button>
  );

  const FormRow = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-start gap-2 sm:gap-3">
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>{label}</div>
        {hint && <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{children}</h3>
    </div>
  );

  return (
    <div className="p-3 sm:p-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)" }}>
              System Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: "rgba(196,53,53,0.1)", color: "var(--primary)" }}>
              ISP Operating System v2.0
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Complete platform configuration, white-label branding, billing rules, security and subscription management
          </p>
        </div>
        <button
          onClick={() => showToast("All settings saved successfully!")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold shadow-sm transition-all cursor-pointer"
          style={{ background: "var(--primary)", fontSize: 13 }}
        >
          <Save size={15} /> Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* ── Left Sidebar Tabs ───────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 md:w-56 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Main Settings Content Panel ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ── Company Profile ─────────────────────────────────────────────── */}
          {activeTab === "company" && (
            <>
              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Organization Identity & Branding</SectionTitle>

                <FormRow label="Brand Logo" hint="Active official logo used in sidebar, login portals, invoice receipts, and favicon">
                  <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/40 border border-border">
                    <div className="h-16 px-4 rounded-xl bg-white dark:bg-card border border-border shadow-xs flex items-center justify-center flex-shrink-0">
                      <img src="/maabestnetwork.png" alt="MAA BEST NETWORK" className="h-11 max-w-[160px] object-contain" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <span>maabestnetwork.png</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active · Ready
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        High-resolution 1672 × 941 PNG with alpha transparency
                      </p>
                    </div>
                  </div>
                </FormRow>

                <FormRow label="Legal Company Name" hint="Used on invoices and official documents">
                  <input value={company.legalName} onChange={e => setCompany(c => ({ ...c, legalName: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                </FormRow>
                <FormRow label="Display Name" hint="Shown on login page and portal">
                  <input value={company.displayName} onChange={e => setCompany(c => ({ ...c, displayName: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                </FormRow>
                <FormRow label="Tagline" hint="Shown on login and email templates">
                  <input value={company.tagline} onChange={e => setCompany(c => ({ ...c, tagline: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                </FormRow>
                <FormRow label="BTRC ISP License No." hint="Required for regulatory compliance">
                  <input value={company.btrcLicense} onChange={e => setCompany(c => ({ ...c, btrcLicense: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} />
                </FormRow>
                <FormRow label="BIN / VAT No." hint="Business Identification Number">
                  <input value={company.binNo} onChange={e => setCompany(c => ({ ...c, binNo: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} />
                </FormRow>
              </div>

              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Contact & Location</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <FormRow label="24/7 Hotline">
                    <input value={company.hotline} onChange={e => setCompany(c => ({ ...c, hotline: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                  </FormRow>
                  <FormRow label="Support Email">
                    <input value={company.supportEmail} onChange={e => setCompany(c => ({ ...c, supportEmail: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                  </FormRow>
                </div>
                <FormRow label="Company Website">
                  <input value={company.website} onChange={e => setCompany(c => ({ ...c, website: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} placeholder="https://" />
                </FormRow>
                <FormRow label="Registered Address">
                  <textarea value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ ...inputStyle, minHeight: 80 }} />
                </FormRow>
              </div>

              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Regional Settings</SectionTitle>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Currency", key: "currency", options: ["BDT (৳)", "USD ($)", "EUR (€)"] },
                    { label: "Timezone", key: "timezone", options: ["Asia/Dhaka (GMT+6)", "UTC", "Asia/Kolkata"] },
                    { label: "Date Format", key: "dateFormat", options: ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"] },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>{f.label.toUpperCase()}</label>
                      <select className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle}
                        value={(company as any)[f.key]} onChange={e => setCompany(c => ({ ...c, [f.key]: e.target.value }))}>
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Billing Rules ─────────────────────────────────────────────── */}
          {activeTab === "billing" && (
            <>
              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Billing Cycle</SectionTitle>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>BILLING DATE (DAY OF MONTH)</label>
                    <input type="number" min="1" max="28" value={billing.billingDay} onChange={e => setBilling(b => ({ ...b, billingDay: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4, display: "block" }}>Invoices auto-generated on this day</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>PAYMENT DUE AFTER (DAYS)</label>
                    <input type="number" min="1" max="30" value={billing.dueAfterDays} onChange={e => setBilling(b => ({ ...b, dueAfterDays: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4, display: "block" }}>Days after billing date to mark overdue</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--muted-foreground)" }}>DEFAULT GRACE PERIOD (DAYS)</label>
                    <input type="number" min="0" max="30" value={billing.gracePeriodDays} onChange={e => setBilling(b => ({ ...b, gracePeriodDays: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl outline-none" style={inputStyle} />
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4, display: "block" }}>After due date before disconnection</span>
                  </div>
                </div>

                {/* Billing State Machine Visualization */}
                <div className="rounded-xl p-4 mt-2" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                    Auto-Billing State Machine
                  </div>
                  <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: 12 }}>
                    {[
                      { label: "Invoice\nGenerated", color: "#2563EB" },
                      { label: `Due\n(+${billing.dueAfterDays}d)`, color: "#D97706" },
                      { label: `Grace\n(+${billing.gracePeriodDays}d)`, color: "#D97706" },
                      { label: "Auto-\nDisconnect", color: "#DC2626" },
                      { label: "Payment\nReceived", color: "#16A34A" },
                      { label: "Auto-\nReconnect", color: "#16A34A" },
                    ].map((s, i, arr) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="rounded-xl px-3 py-2 text-center font-semibold text-white" style={{ background: s.color, fontSize: 11, lineHeight: 1.5, whiteSpace: "pre-line" }}>
                          {s.label}
                        </div>
                        {i < arr.length - 1 && <ChevronRight size={14} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Automation Rules</SectionTitle>
                {[
                  { label: "Auto-Disconnect on Due", hint: "Disconnect PPPoE after grace period expires", key: "autoDisconnect" },
                  { label: "Auto-Reconnect on Payment", hint: "Reconnect immediately when payment is verified", key: "autoReconnect" },
                  { label: "Send Invoice via SMS", hint: "Send invoice link to customer on billing date", key: "sendInvoiceSms" },
                  { label: "Send Invoice via Email", hint: "Email invoice PDF to customer on billing date", key: "sendInvoiceEmail" },
                  { label: "Late Fee Enabled", hint: "Apply late fee after due date passes", key: "lateFeeEnabled" },
                ].map(f => (
                  <FormRow key={f.key} label={f.label} hint={f.hint}>
                    <Toggle value={(billing as any)[f.key]} onChange={v => setBilling(b => ({ ...b, [f.key]: v }))} />
                  </FormRow>
                ))}
              </div>

              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Late Fee & Tax</SectionTitle>
                <FormRow label="Late Fee Type">
                  <div className="flex gap-3">
                    {["fixed", "percent"].map(t => (
                      <button key={t} onClick={() => setBilling(b => ({ ...b, lateFeeType: t as any }))}
                        className="px-4 py-2 rounded-xl text-sm font-semibold border capitalize"
                        style={{
                          borderColor: billing.lateFeeType === t ? "var(--primary)" : "var(--border)",
                          background: billing.lateFeeType === t ? "rgba(139,32,32,0.1)" : "var(--muted)",
                          color: billing.lateFeeType === t ? "var(--primary)" : "var(--muted-foreground)",
                        }}>
                        {t === "fixed" ? "Fixed Amount (৳)" : "Percentage (%)"}
                      </button>
                    ))}
                  </div>
                </FormRow>
                <FormRow label={billing.lateFeeType === "fixed" ? "Late Fee Amount (৳)" : "Late Fee (%)"} hint="Applied to overdue bills">
                  <input type="number" value={billing.lateFeeAmount} onChange={e => setBilling(b => ({ ...b, lateFeeAmount: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, maxWidth: 160 }} />
                </FormRow>
                <FormRow label="VAT / Tax (%)" hint="Applied to all invoices. 0 = disabled">
                  <input type="number" min="0" max="100" value={billing.vatPercent} onChange={e => setBilling(b => ({ ...b, vatPercent: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, maxWidth: 160 }} />
                </FormRow>
              </div>

              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Payment Reminders</SectionTitle>
                <FormRow label="Send First Reminder" hint="Days before due date">
                  <div className="flex items-center gap-2">
                    <input type="number" value={billing.reminderDaysBefore} onChange={e => setBilling(b => ({ ...b, reminderDaysBefore: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, width: 80 }} />
                    <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>days before due date</span>
                  </div>
                </FormRow>
                <FormRow label="Send Final Reminder" hint="Days before due date">
                  <div className="flex items-center gap-2">
                    <input type="number" value={billing.finalReminderDaysBefore} onChange={e => setBilling(b => ({ ...b, finalReminderDaysBefore: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, width: 80 }} />
                    <span style={{ fontSize: 13, color: "var(--muted-foreground)" }}>days before due date</span>
                  </div>
                </FormRow>
                <FormRow label="Invoice Number Prefix">
                  <input value={billing.invoicePrefix} onChange={e => setBilling(b => ({ ...b, invoicePrefix: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl outline-none font-mono" style={{ ...inputStyle, maxWidth: 160 }} />
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 4, display: "block" }}>e.g. INV-000123</span>
                </FormRow>
              </div>
            </>
          )}

          {/* ── Invoice & Receipt ──────────────────────────────────────────── */}
          {activeTab === "invoice" && (
            <>
              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Invoice Display Options</SectionTitle>
                {[
                  { label: "Show Company Logo", key: "showLogo" },
                  { label: "Show Company Address", key: "showAddress" },
                  { label: "Show BTRC License", key: "showBtrcLicense" },
                  { label: "Show VAT Details", key: "showVat" },
                  { label: "Show Payment Terms", key: "showTerms" },
                ].map(f => (
                  <FormRow key={f.key} label={f.label}>
                    <Toggle value={(invoice as any)[f.key]} onChange={v => setInvoice(i => ({ ...i, [f.key]: v }))} />
                  </FormRow>
                ))}
              </div>

              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Invoice Content</SectionTitle>
                <FormRow label="Footer Text" hint="Shown at bottom of every invoice">
                  <textarea value={invoice.footerText} onChange={e => setInvoice(i => ({ ...i, footerText: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ ...inputStyle, minHeight: 80 }} />
                </FormRow>
                <FormRow label="Payment Terms" hint="Legal terms shown on invoice">
                  <textarea value={invoice.terms} onChange={e => setInvoice(i => ({ ...i, terms: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ ...inputStyle, minHeight: 80 }} />
                </FormRow>
                <FormRow label="Bank Details" hint="For bank transfer payments (optional)">
                  <textarea value={invoice.bankDetails} onChange={e => setInvoice(i => ({ ...i, bankDetails: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none resize-none" style={{ ...inputStyle, minHeight: 80 }}
                    placeholder="Bank: &#10;Account Name: &#10;Account Number: &#10;Branch:" />
                </FormRow>
                <FormRow label="Paid Stamp Text">
                  <input value={invoice.stampText} onChange={e => setInvoice(i => ({ ...i, stampText: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, maxWidth: 200 }} />
                </FormRow>
              </div>
            </>
          )}

          {/* ── Notifications & SMS ────────────────────────────────────────── */}
          {activeTab === "notifications" && (
            <>
              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>SMS Gateway Configuration</SectionTitle>
                <FormRow label="SMS Provider">
                  <select className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, maxWidth: 260 }}
                    value={notifications.smsGateway} onChange={e => setNotifications(n => ({ ...n, smsGateway: e.target.value }))}>
                    <option value="ssl_commerz">SSLCommerz SMS</option>
                    <option value="infobip">Infobip</option>
                    <option value="twilio">Twilio</option>
                    <option value="custom">Custom API</option>
                  </select>
                </FormRow>
                <FormRow label="API URL">
                  <input value={notifications.smsApiUrl} onChange={e => setNotifications(n => ({ ...n, smsApiUrl: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} placeholder="https://api.smsgateway.com/send" />
                </FormRow>
                <FormRow label="API Key / Token">
                  <input type="password" value={notifications.smsApiKey} onChange={e => setNotifications(n => ({ ...n, smsApiKey: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} placeholder="••••••••••••••" />
                </FormRow>
                <FormRow label="Sender ID">
                  <input value={notifications.smsSenderId} onChange={e => setNotifications(n => ({ ...n, smsSenderId: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, maxWidth: 200 }} maxLength={11} />
                </FormRow>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  onClick={() => showToast("Test SMS sent to admin phone!")}>
                  <Smartphone size={14} /> Send Test SMS
                </button>
              </div>

              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Email / SMTP Configuration</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <FormRow label="SMTP Host">
                    <input value={notifications.smtpHost} onChange={e => setNotifications(n => ({ ...n, smtpHost: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} />
                  </FormRow>
                  <FormRow label="SMTP Port">
                    <input value={notifications.smtpPort} onChange={e => setNotifications(n => ({ ...n, smtpPort: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} />
                  </FormRow>
                </div>
                <FormRow label="SMTP Username">
                  <input value={notifications.smtpUser} onChange={e => setNotifications(n => ({ ...n, smtpUser: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} />
                </FormRow>
                <FormRow label="SMTP Password">
                  <input type="password" value={notifications.smtpPass} onChange={e => setNotifications(n => ({ ...n, smtpPass: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl outline-none font-mono" style={inputStyle} placeholder="••••••••" />
                </FormRow>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                  onClick={() => showToast("Test email sent to admin!")}>
                  <Mail size={14} /> Send Test Email
                </button>
              </div>

              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Alert Thresholds</SectionTitle>
                {[
                  { label: "CPU Alert Threshold (%)", key: "alertCpuThreshold" },
                  { label: "RAM Alert Threshold (%)", key: "alertRamThreshold" },
                  { label: "Bandwidth Alert Threshold (%)", key: "alertBandwidthThreshold" },
                ].map(f => (
                  <FormRow key={f.key} label={f.label}>
                    <input type="number" min="0" max="100" value={(notifications as any)[f.key]}
                      onChange={e => setNotifications(n => ({ ...n, [f.key]: e.target.value }))}
                      className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, maxWidth: 160 }} />
                  </FormRow>
                ))}
                <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                  {[
                    { label: "Alert when device goes offline", key: "alertOnDeviceDown" },
                    { label: "Alert when payment is received", key: "alertOnPaymentReceived" },
                    { label: "Alert when customer is disconnected", key: "alertOnDisconnect" },
                    { label: "Alert when backup fails", key: "alertOnBackupFail" },
                  ].map(f => (
                    <div key={f.key} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 13, color: "var(--foreground)" }}>{f.label}</span>
                      <Toggle value={(notifications as any)[f.key]} onChange={v => setNotifications(n => ({ ...n, [f.key]: v }))} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Security ─────────────────────────────────────────────────── */}
          {activeTab === "security" && (
            <>
              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Authentication</SectionTitle>
                <FormRow label="Require 2FA for Admins" hint="Strongly recommended for ISP owners">
                  <div className="flex items-center gap-3">
                    <Toggle value={security.require2FA} onChange={v => setSecurity(s => ({ ...s, require2FA: v }))} />
                    {security.require2FA && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "rgba(22,163,74,0.1)", color: "#16A34A" }}>
                        ✓ Enabled
                      </span>
                    )}
                  </div>
                </FormRow>
                <FormRow label="Session Timeout (hours)" hint="Force logout after inactivity">
                  <input type="number" min="1" max="72" value={security.sessionTimeout}
                    onChange={e => setSecurity(s => ({ ...s, sessionTimeout: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, maxWidth: 160 }} />
                </FormRow>
                <FormRow label="Max Login Attempts" hint="Before IP lockout">
                  <input type="number" min="3" max="20" value={security.maxLoginAttempts}
                    onChange={e => setSecurity(s => ({ ...s, maxLoginAttempts: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, maxWidth: 160 }} />
                </FormRow>
                <FormRow label="Lockout Duration (minutes)">
                  <input type="number" min="5" max="1440" value={security.lockoutDuration}
                    onChange={e => setSecurity(s => ({ ...s, lockoutDuration: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, maxWidth: 160 }} />
                </FormRow>
              </div>

              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Password Policy</SectionTitle>
                <FormRow label="Minimum Password Length">
                  <input type="number" min="6" max="32" value={security.passwordMinLength}
                    onChange={e => setSecurity(s => ({ ...s, passwordMinLength: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl outline-none" style={{ ...inputStyle, maxWidth: 160 }} />
                </FormRow>
                <FormRow label="Require Special Character">
                  <Toggle value={security.requireSpecialChar} onChange={v => setSecurity(s => ({ ...s, requireSpecialChar: v }))} />
                </FormRow>
                <FormRow label="Require Number">
                  <Toggle value={security.requireNumber} onChange={v => setSecurity(s => ({ ...s, requireNumber: v }))} />
                </FormRow>
              </div>

              <div className="rounded-2xl p-6 space-y-5" style={sectionCard}>
                <SectionTitle>Audit & Monitoring</SectionTitle>
                <FormRow label="Log All Admin Actions">
                  <Toggle value={security.logAllActions} onChange={v => setSecurity(s => ({ ...s, logAllActions: v }))} />
                </FormRow>
                <FormRow label="Log IP Addresses">
                  <Toggle value={security.logIpAddresses} onChange={v => setSecurity(s => ({ ...s, logIpAddresses: v }))} />
                </FormRow>
                <FormRow label="Allow Multiple Sessions">
                  <Toggle value={security.allowMultipleSessions} onChange={v => setSecurity(s => ({ ...s, allowMultipleSessions: v }))} />
                </FormRow>
                <FormRow label="Show Login History to Employees">
                  <Toggle value={security.showLoginHistory} onChange={v => setSecurity(s => ({ ...s, showLoginHistory: v }))} />
                </FormRow>
              </div>
            </>
          )}

          {/* ── Subscription Plan Showcase ─────────────────────────────────── */}
          {activeTab === "subscription" && (
            <>
              {/* Current Active Plan Banner */}
              <div className="rounded-2xl p-6 border shadow-sm" style={{ background: "linear-gradient(135deg, #8B2020 0%, #C43535 100%)", borderColor: "transparent" }}>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Star size={15} color="#FFD700" fill="#FFD700" />
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        CURRENT ACTIVE PACKAGE · MAA BEST NETWORK
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "#fff" }}>
                      Starter Plan (Up to 200 Users)
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginTop: 4 }}>
                      Dedicated ISP software license & cloud server • All billing, MikroTik & optical OLT modules enabled
                    </div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: "#fff" }}>
                      ৳800
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600 }}>per month</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                  {[
                    { label: "Subscribers Allocated", value: "168 / 200 Users (84%)" },
                    { label: "SMS Gateway Integration", value: "BTCL / SSL Gateway API" },
                    { label: "Cloud Database Backup", value: "Encrypted Daily Backups" },
                    { label: "Next Renewal Billing", value: "01 Sep 2026" },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600 }}>{s.label}</div>
                      <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginTop: 2 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Tier Plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: "Starter Plan",
                    price: "৳800",
                    users: "Up to 200 Users",
                    tag: "CURRENT PLAN",
                    current: true,
                    desc: "Perfect for local ISP operators managing up to 200 subscribers with core billing & network tools.",
                    features: [
                      "Up to 200 Active Subscribers",
                      "MikroTik RouterOS API Sync",
                      "OLT & ONU Optical Diagnostics",
                      "Automated Bill & Invoice Generator",
                      "bKash & Nagad Auto-Billing Gateway",
                      "Direct BTCL / SMS Gateway API",
                      "Automated Daily Cloud Backups",
                      "Standard Technical Support"
                    ]
                  },
                  {
                    name: "Growth Pro",
                    price: "৳1,200",
                    users: "Up to 600 Users",
                    tag: "POPULAR UPGRADE",
                    current: false,
                    desc: "Expanded subscriber capacity and automation for growing ISP networks up to 600 subscribers.",
                    features: [
                      "Up to 600 Active Subscribers",
                      "Everything in Starter Plan",
                      "WhatsApp Hub & Automated Bot",
                      "Reseller Sub-ISP Wallets Engine",
                      "AI Customer Risk & Churn Detector",
                      "Multi-OLT Optical Auto-Discovery",
                      "Automated Daily Cloud Backups",
                      "Priority Phone & Chat Support"
                    ]
                  },
                  {
                    name: "Enterprise Ultra",
                    price: "৳1,600",
                    users: "Up to 900+ Users",
                    tag: "ULTRA FEATURES",
                    current: false,
                    desc: "High-capacity tier with ultra network intelligence for large metropolitan operators.",
                    features: [
                      "Up to 900+ Active Subscribers",
                      "Everything in Growth Pro",
                      "Ultra Network Auto Self-Healing",
                      "Real-time NOC Wallboard Display",
                      "AI Revenue Leakage Auto-Fix",
                      "Multi-Zone Splitter Map GIS",
                      "High-Availability Cloud Storage",
                      "24/7 Dedicated Field & SLA Support"
                    ]
                  },
                ].map(plan => (
                  <div
                    key={plan.name}
                    className="rounded-2xl p-5 border flex flex-col justify-between"
                    style={{
                      background: plan.current ? "rgba(139,32,32,0.05)" : "var(--card)",
                      borderColor: plan.current ? "var(--primary)" : "var(--border)",
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                          style={{
                            background: plan.current ? "var(--primary)" : "var(--muted)",
                            color: plan.current ? "#fff" : "var(--muted-foreground)",
                          }}
                        >
                          {plan.tag}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>{plan.users}</span>
                      </div>

                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--foreground)" }}>
                        {plan.name}
                      </div>

                      <div style={{ fontSize: 28, fontWeight: 800, color: plan.current ? "var(--primary)" : "var(--foreground)", marginTop: 4, fontFamily: "var(--font-display)" }}>
                        {plan.price}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted-foreground)" }}>/mo</span>
                      </div>

                      <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 6, lineHeight: 1.5 }}>
                        {plan.desc}
                      </p>

                      <div className="space-y-2 mt-4 pt-3" style={{ borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--muted-foreground)" }}>
                        <div className="flex items-center gap-2">
                          <Users size={14} style={{ color: "var(--primary)" }} />
                          <span><strong>{plan.users}</strong> capacity</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HardDrive size={14} style={{ color: "#D97706" }} />
                          <span>Daily Cloud Backup Included</span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                        {plan.features.map(f => (
                          <div key={f} className="flex items-center gap-2" style={{ fontSize: 12, color: "var(--foreground)" }}>
                            <Check size={13} style={{ color: "#16A34A", flexShrink: 0 }} />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 pt-3">
                      {plan.current ? (
                        <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center border flex items-center justify-center gap-1.5"
                          style={{ borderColor: "var(--primary)", background: "rgba(139,32,32,0.1)", color: "var(--primary)" }}>
                          <Check size={14} /> Active Plan on this System
                        </div>
                      ) : (
                        <button
                          onClick={() => showToast(`Upgrade request for ${plan.name} (৳${plan.price}) submitted!`)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:bg-muted"
                          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                        >
                          Request Upgrade to {plan.name}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl"
          style={{ background: "#130606", color: "#ffffff", fontSize: 13, fontWeight: 500 }}>
          <CheckCircle2 size={16} style={{ color: "#4ADE80" }} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
