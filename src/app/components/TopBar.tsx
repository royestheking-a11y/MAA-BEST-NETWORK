import { useState } from "react";
import {
  Search, Bell, ChevronDown, Sun, Moon, User, LogOut, Settings,
  AlertTriangle, CheckCircle2, Info, X, Zap, Wifi, WifiOff, Menu
} from "lucide-react";
import type { Page } from "./Sidebar";
import { useLanguage } from "../context/LanguageContext";
import { LanguageToggle } from "./ui/LanguageToggle";

const PAGE_TITLES: Partial<Record<Page, string>> = {
  dashboard: "Dashboard",
  customers: "All Customers",
  "customer-profile": "Customer Profile",
  "customer-map": "Customer Map",
  "live-status": "Live Status",
  "due-customers": "Due Customers",
  disconnected: "Disconnected",
  import: "Import Customers",
  invoices: "Invoices",
  payments: "Payments",
  "cash-desk": "Walk-In Cash Desk POS",
  "store-pos": "ISP Hardware Store & POS Counter",
  packages: "Packages",
  discounts: "Discounts & Penalties",
  "billing-settings": "Billing Settings",
  "network-map": "Network Map",
  "noc-wallboard": "NOC Live Operations Center",
  mikrotik: "MikroTik Management",
  olt: "OLT & ONT Management",
  splitters: "Optical Splitter & PON Capacity Ledger",
  "onu-events": "ONU Event History",
  "ip-pools": "IPAM & Subnet Pools",
  tr069: "TR-069 ACS Wi-Fi Management",
  zones: "Zones & Sub-Zones",
  incidents: "Network Incidents",
  monitoring: "Network Monitoring",
  "mac-resellers": "MAC Resellers",
  "bandwidth-resellers": "Bandwidth Resellers",
  "reseller-wallets": "Reseller Wallets",
  tickets: "Support Tickets",
  "whatsapp-hub": "WhatsApp Business CRM",
  "customer-timeline": "Customer Timeline",
  technicians: "Technicians",
  "support-page": "Customer Support",
  accounts: "Accounts",
  transactions: "Transactions",
  expenses: "Expenses",
  "finance-reports": "Finance Reports",
  sms: "SMS Automation",
  workflows: "Automation Workflows",
  "notifications-center": "Notifications",
  "revenue-analysis": "Revenue Analysis",
  "leakage-detector": "Revenue Leakage Detector",
  "customer-risk": "Customer Risk Scores",
  forecast: "Revenue Forecast",
  "ai-assistant": "AI Business Assistant",
  "revenue-reports": "Revenue Reports",
  "customer-reports": "Customer Reports",
  "network-reports": "Network Reports",
  btrc: "BTRC Regulatory Reports",
  "custom-reports": "Custom Reports",
  employees: "Employees",
  inventory: "Equipment Inventory",
  "activity-logs": "Activity Logs",
  backups: "System Backups",
  integrations: "Integrations",
  settings: "Settings",
  "customer-portal": "Subscriber Portal",
  "online-clients": "Online Clients Monitoring",
  "add-client": "Client Add New Client",
};

interface NotifItem {
  id: number;
  type: "critical" | "warning" | "success" | "info";
  icon: React.ElementType;
  title: string;
  desc: string;
  time: string;
  actionLabel?: string;
  solutionMsg?: string;
  targetPage?: Page;
}

const INITIAL_NOTIFICATIONS: NotifItem[] = [
  { id: 1, type: "critical", icon: WifiOff, title: "Optical Loss: OLT-Uttara-01 (PON 0/2)", desc: "ONU-1004 Rx dropped to -27.8 dBm (Nasrin Begum)", time: "3m ago", actionLabel: "Optical Laser Boost", solutionMsg: "Sent optical laser boost & dispatched ticket to field technician (Nasir)", targetPage: "olt" },
  { id: 2, type: "warning", icon: AlertTriangle, title: "MikroTik-01 High CPU (78%)", desc: "1,284 PPPoE queues active on Mirpur Core", time: "11m ago", actionLabel: "Re-sync Queues", solutionMsg: "MikroTik-01 queues cleaned and stale ARP cache flushed via RouterOS API", targetPage: "mikrotik" },
  { id: 3, type: "warning", icon: Zap, title: "14 Overdue Invoices (Aug 2026)", desc: "৳16,800 due balance pending collection", time: "25m ago", actionLabel: "Send bKash SMS", solutionMsg: "Dispatched automated WhatsApp & SMS bill reminders with bKash dynamic payment link", targetPage: "invoices" },
  { id: 4, type: "success", icon: CheckCircle2, title: "bKash Auto-Payment Verified", desc: "৳1,200 from Rahim Uddin (CUST-10293)", time: "31m ago", actionLabel: "View Receipt", targetPage: "payments" },
  { id: 5, type: "info", icon: Info, title: "Encrypted Cloud Backup Completed", desc: "MAA BEST NETWORK DB & MikroTik config backed up safely", time: "5h ago", targetPage: "backups" },
];

interface TopBarProps {
  currentPage: Page;
  darkMode: boolean;
  onToggleDark: () => void;
  onLogout?: () => void;
  onSearch?: (q: string) => void;
  onNavigate?: (page: Page) => void;
  onMenuToggle?: () => void;
}

export function TopBar({ currentPage, darkMode, onToggleDark, onLogout, onNavigate, onMenuToggle }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [notificationsList, setNotificationsList] = useState<NotifItem[]>(INITIAL_NOTIFICATIONS);
  const [toastMsg, setToastMsg] = useState("");
  const { t } = useLanguage();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleQuickResolve = (e: React.MouseEvent, n: NotifItem) => {
    e.stopPropagation();
    if (n.solutionMsg) {
      showToast(`✓ ${n.solutionMsg}`);
    } else if (n.targetPage && onNavigate) {
      setNotifOpen(false);
      onNavigate(n.targetPage);
    }
  };

  const unread = notificationsList.length;

  return (
    <header
      className="flex items-center justify-between flex-shrink-0 px-3 sm:px-5"
      style={{
        height: 56,
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* Left: Hamburger menu (mobile) + page title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-foreground hover:bg-muted cursor-pointer flex-shrink-0"
            title="Toggle Menu"
          >
            <Menu size={18} />
          </button>
        )}
        <h1
          className="truncate text-sm sm:text-base font-semibold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--foreground)",
          }}
        >
          {t(PAGE_TITLES[currentPage] ?? "MAA BEST NETWORK")}
        </h1>
      </div>

      {/* Center: search (desktop/tablet) */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-6">
        <div className="relative w-full">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--muted-foreground)" }}
          />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            placeholder={t("Search customers, invoices, IPs, tickets…")}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm transition-all outline-none"
            style={{
              background: "var(--muted)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
              fontSize: 13,
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(139,32,32,0.35)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        {/* Quick Link: Online Client Monitoring */}
        <button
          onClick={() => onNavigate?.("online-clients" as Page)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted/80 hover:bg-muted text-foreground border border-border transition-all cursor-pointer"
          title="Online Client Monitoring"
        >
          <Wifi size={13} className="text-teal-500" />
          <span>Online Client Monitoring</span>
        </button>

        {/* Quick Link: Search User */}
        <button
          onClick={() => {
            const query = prompt("Enter Client Name, ID, Mobile, or IP to search:");
            if (query && query.trim() && onNavigate) {
              onNavigate("online-clients" as Page);
            }
          }}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-muted/60 hover:bg-muted text-foreground border border-border transition-all cursor-pointer"
          title="Quick Search User"
        >
          <Search size={13} className="text-primary" />
          <span>Search User</span>
        </button>

        {/* Language Switcher */}
        <LanguageToggle />

        {/* Subscriber Portal Quick Jump */}
        <button
          onClick={() => onNavigate?.("customer-portal")}
          className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer"
          style={{
            background: "rgba(139,32,32,0.08)",
            borderColor: "rgba(139,32,32,0.25)",
            color: "var(--primary)"
          }}
          title="Open Subscriber Portal"
        >
          <Wifi size={13} />
          <span className="hidden md:inline">Subscriber Portal</span>
          <span className="md:hidden">Portal</span>
        </button>

        {/* Dark mode */}
        <button
          onClick={onToggleDark}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ color: "var(--muted-foreground)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors relative"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <Bell size={16} />
            {unread > 0 && (
              <span
                className="absolute flex items-center justify-center"
                style={{
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#DC2626",
                  border: "1.5px solid var(--card)",
                }}
              />
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 mt-2 overflow-hidden rounded-xl shadow-2xl"
              style={{
                width: 360,
                background: "var(--card)",
                border: "1px solid var(--border)",
                zIndex: 50,
                top: "100%",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, color: "var(--foreground)" }}>
                  Notifications
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-full text-white"
                    style={{ fontSize: 11, background: "#DC2626" }}
                  >
                    {unread} new
                  </span>
                  <button onClick={() => setNotifOpen(false)} style={{ color: "var(--muted-foreground)" }}>
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
                {notificationsList.map(n => {
                  const Icon = n.icon;
                  const colors: Record<string, string> = {
                    critical: "#FEE2E2",
                    warning: "#FEF3C7",
                    success: "#DCFCE7",
                    info: "#DBEAFE",
                  };
                  const textColors: Record<string, string> = {
                    critical: "#DC2626",
                    warning: "#D97706",
                    success: "#16A34A",
                    info: "#2563EB",
                  };
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setNotifOpen(false);
                        if (!onNavigate) return;
                        if (n.targetPage) onNavigate(n.targetPage);
                        else if (n.title.includes("OLT")) onNavigate("olt");
                        else if (n.title.includes("MikroTik")) onNavigate("mikrotik");
                        else if (n.title.includes("Invoices")) onNavigate("invoices");
                        else if (n.title.includes("Payment")) onNavigate("payments");
                        else onNavigate("dashboard");
                      }}
                      className="p-3.5 border-b border-border transition-colors cursor-pointer hover:bg-muted/40"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex items-center justify-center rounded-xl flex-shrink-0"
                          style={{
                            width: 32,
                            height: 32,
                            background: colors[n.type],
                            marginTop: 1,
                          }}
                        >
                          <Icon size={15} style={{ color: textColors[n.type] }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                            <span className="text-[10px] text-muted-foreground ml-2">{n.time}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.desc}</p>
                          
                          {/* 1-Click Solution Button */}
                          {n.actionLabel && (
                            <div className="mt-2 flex items-center justify-between">
                              <button
                                onClick={(e) => handleQuickResolve(e, n)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all flex items-center gap-1 cursor-pointer">
                                <span>{n.actionLabel}</span>
                              </button>
                              <span className="text-[10px] text-muted-foreground/80">Click to resolve</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-2.5 text-center bg-muted/20 border-t border-border">
                <button
                  onClick={() => { setNotifOpen(false); onNavigate?.("dashboard"); }}
                  className="text-xs text-primary font-bold hover:underline cursor-pointer"
                >
                  System Alert Feed · All Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile (Desktop only - mobile logout is in dedicated fixed sidebar) */}
        <div className="relative hidden md:block">
          <button
            onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors cursor-pointer hover:bg-muted"
          >
            <div
              className="flex items-center justify-center rounded-lg bg-white dark:bg-white/10 border border-border flex-shrink-0 p-0.5 overflow-hidden shadow-xs"
              style={{ width: 28, height: 28 }}
            >
              <img src="/maabestnetwork.png" alt="MBN" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>
                Super Admin
              </span>
              <span style={{ fontSize: 10, color: "var(--muted-foreground)", lineHeight: 1.2 }}>
                admin@maabestnetwork.com
              </span>
            </div>
            <ChevronDown size={12} style={{ color: "var(--muted-foreground)" }} />
          </button>

          {userOpen && (
            <div
              className="absolute right-0 mt-1 rounded-xl shadow-xl overflow-hidden"
              style={{
                width: 200,
                background: "var(--card)",
                border: "1px solid var(--border)",
                zIndex: 50,
                top: "100%",
              }}
            >
              {[
                { icon: User, label: "My Profile", page: "employees" as Page },
                { icon: Settings, label: "Account Settings", page: "settings" as Page },
                { icon: LogOut, label: "Sign Out", danger: true },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                    style={{ borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    onClick={() => {
                      setUserOpen(false);
                      if (item.danger && onLogout) onLogout();
                      else if (item.page && onNavigate) onNavigate(item.page);
                    }}
                  >
                    <Icon
                      size={14}
                      style={{ color: item.danger ? "#DC2626" : "var(--muted-foreground)" }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        color: item.danger ? "#DC2626" : "var(--foreground)",
                        fontWeight: 400,
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Toast Notification Banner ────────────────────────────────────────── */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[400] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-[#130606] text-white text-xs font-semibold animate-slideUp">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg("")} className="ml-2 hover:opacity-75 cursor-pointer">
            <X size={14} className="text-white/60" />
          </button>
        </div>
      )}
    </header>
  );
}
