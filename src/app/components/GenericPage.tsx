import {
  UserCog, ScrollText, HardDrive, Link, Settings, PieChart,
  Users2, Network, ClipboardList, FileText, UserCheck, Wallet,
  Globe, MessageCircle, Workflow, Bell, CheckCircle2, Circle,
  Smartphone, Building2, CreditCard, Mail, Server, Radio, Zap
} from "lucide-react";
import type { Page } from "./Sidebar";

const PAGE_META: Partial<Record<Page, { icon: React.ElementType; title: string; sub: string; desc: string; color: string; bg: string }>> = {
  employees: { icon: UserCog, title: "Employee Management", sub: "Staff, roles, and permissions", desc: "Manage your team members, assign roles, set zone-based permissions, and track employee activity.", color: "#8B2020", bg: "#FDF3F3" },
  "activity-logs": { icon: ScrollText, title: "Activity Logs", sub: "Full audit trail", desc: "Every important action is logged — customer creation, payments, package changes, login events, and more.", color: "#2563EB", bg: "#DBEAFE" },
  backups: { icon: HardDrive, title: "System Backups", sub: "Automated & manual", desc: "Daily automated backups at 3:00 AM. Manage backup history, retention policy, and restore points.", color: "#16A34A", bg: "#DCFCE7" },
  integrations: { icon: Link, title: "Integrations", sub: "Third-party connections", desc: "Connect payment gateways, SMS providers, email services, and monitoring tools.", color: "#7C3AED", bg: "#EDE9FE" },
  settings: { icon: Settings, title: "System Settings", sub: "Platform configuration", desc: "ISP branding, billing configuration, billing date, grace period, SMS templates, and system preferences.", color: "#6B7280", bg: "#F3F4F6" },
  "revenue-reports": { icon: PieChart, title: "Revenue Reports", sub: "Financial reporting", desc: "Daily, weekly, monthly, and yearly revenue reports. Filter by zone, package, collector, and payment method.", color: "#8B2020", bg: "#FDF3F3" },
  "customer-reports": { icon: Users2, title: "Customer Reports", sub: "Subscriber analytics", desc: "Customer growth, churn, package distribution, zone-wise breakdown, and lifecycle reports.", color: "#2563EB", bg: "#DBEAFE" },
  "network-reports": { icon: Network, title: "Network Reports", sub: "Infrastructure analytics", desc: "Device uptime, session counts, bandwidth usage, incident history, and OLT performance.", color: "#16A34A", bg: "#DCFCE7" },
  btrc: { icon: ClipboardList, title: "BTRC Regulatory Reports", sub: "Compliance reporting", desc: "Generate subscriber statistics, bandwidth reports, and customer data exports compliant with BTRC requirements.", color: "#D97706", bg: "#FEF3C7" },
  "custom-reports": { icon: FileText, title: "Custom Reports", sub: "Flexible report builder", desc: "Build custom reports with your own filters, date ranges, and column selections. Export to PDF, Excel, or CSV.", color: "#7C3AED", bg: "#EDE9FE" },
  "mac-resellers": { icon: UserCheck, title: "MAC Resellers", sub: "Reseller management", desc: "Manage reseller accounts, credit wallets, commissions, and permitted zones. Track reseller performance.", color: "#8B2020", bg: "#FDF3F3" },
  "reseller-wallets": { icon: Wallet, title: "Reseller Wallets", sub: "Credit & wallet management", desc: "View and manage reseller credit balances, transaction ledgers, and top-up history.", color: "#16A34A", bg: "#DCFCE7" },
  "bandwidth-resellers": { icon: Globe, title: "Bandwidth Resellers", sub: "Bandwidth allocation", desc: "Manage bandwidth reseller allocations, monthly invoices, soft limits, and usage monitoring.", color: "#2563EB", bg: "#DBEAFE" },
  sms: { icon: MessageCircle, title: "SMS Automation", sub: "Automated messaging", desc: "Configure SMS templates, automation rules, and gateway settings. Track delivery reports and retry logic.", color: "#8B2020", bg: "#FDF3F3" },
  workflows: { icon: Workflow, title: "Automation Workflows", sub: "Business automation", desc: "Build WHEN → IF → THEN automation workflows for billing, disconnection, reconnection, and notifications.", color: "#7C3AED", bg: "#EDE9FE" },
  "notifications-center": { icon: Bell, title: "Notification Center", sub: "System alerts", desc: "Configure alert thresholds, notification channels (SMS, email, push), and manage notification history.", color: "#D97706", bg: "#FEF3C7" },
  "finance-reports": { icon: PieChart, title: "Finance Reports", sub: "Financial statements", desc: "Income statements, balance summaries, expense breakdowns, and collection rate reports.", color: "#16A34A", bg: "#DCFCE7" },
  disconnected: { icon: UserCog, title: "Disconnected Customers", sub: "Suspended accounts", desc: "View all disconnected customers, outstanding amounts, and bulk reconnection options.", color: "#6B7280", bg: "#F3F4F6" },
  import: { icon: ScrollText, title: "Import Customers", sub: "Bulk customer onboarding", desc: "Import customers from CSV/Excel. Validate data, preview errors, and sync with MikroTik/OLT after import.", color: "#2563EB", bg: "#DBEAFE" },
  discounts: { icon: FileText, title: "Discounts & Penalties", sub: "Billing adjustments", desc: "Manage customer discounts, late fees, and promotional pricing. Every adjustment is logged with reason.", color: "#8B2020", bg: "#FDF3F3" },
  "billing-settings": { icon: Settings, title: "Billing Settings", sub: "Billing configuration", desc: "Configure billing date, grace period, late fee rules, VAT, invoice numbering, and auto-disconnect rules.", color: "#6B7280", bg: "#F3F4F6" },
  monitoring: { icon: Network, title: "Network Monitoring", sub: "Real-time monitoring", desc: "Live network metrics, CPU/RAM trends, bandwidth usage, and configurable alert thresholds.", color: "#2563EB", bg: "#DBEAFE" },
  "customer-timeline": { icon: ScrollText, title: "Customer Timeline", sub: "360° customer history", desc: "Complete customer lifecycle view — from onboarding to every payment, package change, ticket, and action.", color: "#8B2020", bg: "#FDF3F3" },
  messages: { icon: MessageCircle, title: "Messages", sub: "SMS & communication", desc: "View sent/failed messages, delivery reports, and conversation history with each customer.", color: "#D97706", bg: "#FEF3C7" },
  accounts: { icon: Wallet, title: "Accounts", sub: "Payment accounts", desc: "Manage bKash, Nagad, bank, and cash accounts. Track balances and inter-account transfers.", color: "#16A34A", bg: "#DCFCE7" },
  transactions: { icon: ScrollText, title: "Transactions", sub: "Ledger & journal", desc: "Complete transaction ledger with income, expenses, transfers, and journal entries.", color: "#2563EB", bg: "#DBEAFE" },
  expenses: { icon: ScrollText, title: "Expenses", sub: "Cost management", desc: "Track and categorize all ISP expenses — bandwidth, salaries, rent, electricity, and maintenance.", color: "#DC2626", bg: "#FEE2E2" },
  zones: { icon: Network, title: "Zones & Sub-Zones", sub: "Geographic management", desc: "Manage ISP service zones, sub-zones, and their associated OLT, splitter, and customer mappings.", color: "#16A34A", bg: "#DCFCE7" },
};

const CHECKLIST = [
  "Company profile configured",
  "Logo and branding uploaded",
  "Custom domain verified",
  "MikroTik server connected",
  "OLT device added",
  "Packages created",
  "Payment gateway configured",
  "SMS gateway configured",
  "Billing date and grace period set",
  "Customer data imported",
];

interface GenericPageProps {
  page: Page;
}

export function GenericPage({ page }: GenericPageProps) {
  const meta = PAGE_META[page];

  if (!meta) {
    return (
      <div className="p-6 flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="text-center">
          <Settings size={48} style={{ color: "var(--muted-foreground)", opacity: 0.3, margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--foreground)", marginBottom: 8 }}>
            Page not found
          </h2>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>{page}</p>
        </div>
      </div>
    );
  }

  const Icon = meta.icon;

  if (page === "integrations") {
    const integrations = [
      { name: "bKash", cat: "Payment Gateway", icon: Smartphone, status: "connected", color: "#DB2777", bg: "#FCE7F3", detail: "API connected · Gateway live" },
      { name: "Nagad", cat: "Payment Gateway", icon: Smartphone, status: "connected", color: "#D97706", bg: "#FEF3C7", detail: "API connected · Gateway live" },
      { name: "SSLCommerz", cat: "Payment Gateway", icon: CreditCard, status: "disconnected", color: "#6B7280", bg: "#F3F4F6", detail: "Not configured" },
      { name: "Dutch-Bangla Bank", cat: "Bank Integration", icon: Building2, status: "connected", color: "#2563EB", bg: "#DBEAFE", detail: "DBBL API · Active" },
      { name: "MikroTik API", cat: "Network Device", icon: Server, status: "connected", color: "#16A34A", bg: "#DCFCE7", detail: "2 servers connected" },
      { name: "OLT / GPON", cat: "Network Device", icon: Radio, status: "connected", color: "#0891B2", bg: "#CFFAFE", detail: "3 OLTs online" },
      { name: "SSL Wireless SMS", cat: "SMS Gateway", icon: MessageCircle, status: "connected", color: "#7C3AED", bg: "#EDE9FE", detail: "Balance: 14,280 credits" },
      { name: "SendGrid Email", cat: "Email Provider", icon: Mail, status: "disconnected", color: "#6B7280", bg: "#F3F4F6", detail: "Not configured" },
      { name: "Webhook", cat: "Automation", icon: Zap, status: "connected", color: "#D97706", bg: "#FEF3C7", detail: "3 active webhooks" },
    ];
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: meta.bg }}>
            <Icon size={22} style={{ color: meta.color }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>{meta.title}</h1>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{meta.sub}</p>
          </div>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
          {integrations.map(int => {
            const IntIcon = int.icon;
            return (
              <div key={int.name} className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-lg" style={{ width: 38, height: 38, background: int.bg }}>
                      <IntIcon size={18} style={{ color: int.color }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>{int.name}</p>
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{int.cat}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full" style={{ fontSize: 10, fontWeight: 600, background: int.status === "connected" ? "#DCFCE7" : "var(--muted)", color: int.status === "connected" ? "#16A34A" : "var(--muted-foreground)" }}>
                    {int.status === "connected" ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 12 }}>{int.detail}</p>
                <button className="w-full py-2 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 12, color: "var(--foreground)" }}>
                  {int.status === "connected" ? "Configure" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (page === "settings") {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: meta.bg }}>
            <Icon size={22} style={{ color: meta.color }} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>{meta.title}</h1>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{meta.sub}</p>
          </div>
        </div>

        <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 340px" }}>
          <div className="rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--foreground)" }}>Company Branding</h2>
            </div>
            <div className="p-5 grid gap-4">
              {[
                { label: "Company Name", value: "My ISP Bangladesh Ltd.", type: "text" },
                { label: "Support Phone", value: "+880 1712-345678", type: "text" },
                { label: "Support Email", value: "support@myisp.com.bd", type: "text" },
                { label: "Company Website", value: "https://myisp.com.bd", type: "text" },
                { label: "Address", value: "123 Mirpur Road, Dhaka-1216", type: "text" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>
                    {f.label.toUpperCase()}
                  </label>
                  <input defaultValue={f.value} className="w-full px-3 py-2.5 rounded-lg outline-none"
                    style={{ background: "var(--muted)", border: "1px solid var(--border)", fontSize: 13, color: "var(--foreground)" }} />
                </div>
              ))}
              <button className="w-full py-2.5 rounded-lg text-white" style={{ background: "var(--primary)", fontSize: 13, fontWeight: 500 }}>
                Save Branding Settings
              </button>
            </div>
          </div>

          <div className="rounded-xl" style={{ background: "var(--card)", border: "1px solid var(--border)", overflow: "hidden" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, color: "var(--foreground)" }}>Setup Checklist</h2>
            </div>
            <div className="p-5">
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 16 }}>Complete all steps to fully activate your platform.</p>
              <div className="flex flex-col gap-2">
                {CHECKLIST.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: i < 7 ? "#DCFCE7" : "var(--muted)" }}>
                    {i < 7
                      ? <CheckCircle2 size={16} style={{ color: "#16A34A", flexShrink: 0 }} />
                      : <Circle size={16} style={{ color: "var(--muted-foreground)", flexShrink: 0 }} />}
                    <span style={{ fontSize: 12, color: i < 7 ? "#16A34A" : "var(--muted-foreground)", fontWeight: i < 7 ? 500 : 400 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex justify-between mb-1.5">
                  <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Setup Progress</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#16A34A" }}>70%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "var(--muted)" }}>
                  <div className="h-full rounded-full" style={{ width: "70%", background: "#16A34A" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: meta.bg }}>
          <Icon size={22} style={{ color: meta.color }} />
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--foreground)", marginBottom: 3 }}>{meta.title}</h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>{meta.sub}</p>
        </div>
      </div>

      <div className="rounded-xl p-8 flex flex-col items-center justify-center text-center" style={{ background: "var(--card)", border: "1px solid var(--border)", minHeight: 360 }}>
        <div className="flex items-center justify-center rounded-2xl mb-5" style={{ width: 72, height: 72, background: meta.bg }}>
          <Icon size={32} style={{ color: meta.color }} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--foreground)", marginBottom: 10 }}>
          {meta.title}
        </h2>
        <p style={{ fontSize: 15, color: "var(--muted-foreground)", maxWidth: 480, lineHeight: 1.7, marginBottom: 24 }}>
          {meta.desc}
        </p>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-lg text-white" style={{ background: meta.color, fontSize: 13, fontWeight: 600 }}>
            Get Started
          </button>
          <button className="px-5 py-2.5 rounded-lg" style={{ background: "var(--muted)", fontSize: 13, color: "var(--foreground)", border: "1px solid var(--border)" }}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
