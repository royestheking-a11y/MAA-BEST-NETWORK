import { useState } from "react";
import {
  LayoutDashboard, Users, Activity, AlertTriangle, WifiOff, Upload,
  FileText, CreditCard, Package, Tag, Settings, Map, Server, Radio,
  Layers, Zap, AlertCircle, Monitor, UserCheck, Wallet, TicketCheck,
  Clock, MessageSquare, Building2, ArrowLeftRight, TrendingDown,
  MessageCircle, Workflow, Bell, BarChart3, TrendingUp, ShieldAlert,
  BrainCircuit, Bot, PieChart, Users2, Network, Globe, ClipboardList,
  UserCog, ScrollText, HardDrive, Link, ChevronLeft, ChevronRight,
  ChevronDown, Palette, Wrench, Box, History, User, MapPin, Headset,
  Receipt, Wifi, LogOut, Video, X, Send, ShoppingBag, Share2
} from "lucide-react";

export type Page =
  | "dashboard"
  | "customers" | "customer-profile" | "customer-map" | "live-status" | "due-customers" | "disconnected" | "import" | "add-client"
  | "invoices" | "payments" | "cash-desk" | "store-pos" | "packages" | "discounts" | "billing-settings"
  | "network-map" | "noc-wallboard" | "mikrotik" | "olt" | "splitters" | "onu-events" | "ip-pools" | "tr069" | "zones" | "incidents" | "monitoring" | "online-clients"
  | "mac-resellers" | "bandwidth-resellers" | "reseller-wallets"
  | "tickets" | "customer-timeline" | "messages" | "whatsapp-hub" | "support-page"
  | "accounts" | "transactions" | "expenses" | "finance-reports"
  | "sms" | "sms-templates" | "sms-individual" | "sms-groups" | "sms-send-group" | "workflows" | "notifications-center"
  | "revenue-analysis" | "leakage-detector" | "customer-risk" | "forecast" | "ai-assistant"
  | "revenue-reports" | "customer-reports" | "network-reports" | "btrc" | "enable-disable-history" | "bill-collection-report" | "messages-report" | "payment-processing-fee-report" | "custom-reports"
  | "employees" | "technicians" | "activity-logs" | "backups" | "integrations" | "settings" | "inventory" | "onboarding" | "customer-portal";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Client",
    items: [
      { id: "customers", label: "All Clients", icon: Users },
      { id: "add-client", label: "Add New Client", icon: User, badge: "+" },
      { id: "online-clients", label: "Online Clients", icon: Activity, badge: "150" },
      { id: "due-customers", label: "Due Clients", icon: AlertTriangle, badge: "847" },
      { id: "disconnected", label: "Disconnected", icon: WifiOff },
      { id: "customer-map", label: "Customer Map", icon: MapPin },
      { id: "import", label: "Import", icon: Upload },
    ],
  },
  {
    title: "Monitoring",
    items: [
      { id: "live-status", label: "Live Status", icon: Activity },
      { id: "noc-wallboard", label: "NOC Wallboard", icon: Radio },
      { id: "network-map", label: "Network Map", icon: Map },
      { id: "mikrotik", label: "MikroTik Client", icon: Server },
      { id: "olt", label: "OLT / ONT", icon: Network },
      { id: "onu-events", label: "ONU Event History", icon: History },
      { id: "tr069", label: "TR-069 ACS Wi-Fi", icon: Wifi, badge: "ACS" },
      { id: "ip-pools", label: "IP Pools & VLANs", icon: Layers },
      { id: "zones", label: "Zones", icon: Box },
      { id: "incidents", label: "Incidents", icon: Zap },
      { id: "monitoring", label: "Monitoring Hub", icon: Activity },
    ],
  },
  {
    title: "Billing & Store",
    items: [
      { id: "store-pos", label: "Store & Hardware POS", icon: ShoppingBag, badge: "POS" },
      { id: "invoices", label: "Invoices", icon: FileText },
      { id: "payments", label: "Payments", icon: CreditCard },
      { id: "cash-desk", label: "Cash Desk POS", icon: Receipt },
      { id: "packages", label: "Packages", icon: Package },
      { id: "discounts", label: "Discounts", icon: Tag },
      { id: "billing-settings", label: "Billing Settings", icon: Settings },
    ],
  },
  {
    title: "Network",
    items: [
      { id: "network-map", label: "Network Map", icon: Map },
      { id: "noc-wallboard", label: "NOC Wall Screen", icon: Monitor, badge: "LIVE" },
      { id: "mikrotik", label: "MikroTik", icon: Server },
      { id: "olt", label: "OLT / ONT", icon: Radio },
      { id: "splitters", label: "Splitter & PON Ledger", icon: Share2, badge: "ODN" },
      { id: "onu-events", label: "ONU Event History", icon: History },
      { id: "ip-pools", label: "IP Pools & VLANs", icon: Network },
      { id: "tr069", label: "TR-069 ACS Wi-Fi", icon: Wifi, badge: "ACS" },
      { id: "zones", label: "Zones", icon: Layers },
      { id: "incidents", label: "Incidents", icon: Zap },
      { id: "monitoring", label: "Monitoring", icon: Activity },
    ],
  },
  {
    title: "Resellers",
    items: [
      { id: "mac-resellers", label: "MAC Resellers", icon: UserCheck },
      { id: "bandwidth-resellers", label: "Bandwidth", icon: Globe },
      { id: "reseller-wallets", label: "Wallets", icon: Wallet },
    ],
  },
  {
    title: "CRM",
    items: [
      { id: "whatsapp-hub", label: "WhatsApp CRM", icon: MessageCircle, badge: "META" },
      { id: "tickets", label: "Tickets", icon: TicketCheck },
      { id: "customer-timeline", label: "Customer Timeline", icon: Clock },
      { id: "technicians", label: "Technicians", icon: Wrench },
    ],
  },
  {
    title: "Finance",
    items: [
      { id: "accounts", label: "Accounts", icon: Building2 },
      { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
      { id: "expenses", label: "Expenses", icon: TrendingDown },
      { id: "finance-reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    title: "SMS Service",
    items: [
      { id: "sms-templates", label: "SMS Template", icon: FileText },
      { id: "sms-individual", label: "Individual SMS", icon: MessageSquare },
      { id: "sms-groups", label: "SMS Groups", icon: Users },
      { id: "sms-send-group", label: "Group SMS", icon: Send },
    ],
  },
  {
    title: "Automation",
    items: [
      { id: "sms", label: "Auto SMS Engine", icon: MessageCircle },
      { id: "workflows", label: "Workflows", icon: Workflow },
      { id: "notifications-center", label: "Notifications", icon: Bell },
    ],
  },
  {
    title: "AI Intelligence",
    items: [
      { id: "revenue-analysis", label: "Revenue Analysis", icon: TrendingUp },
      { id: "leakage-detector", label: "Leakage Detector", icon: ShieldAlert },
      { id: "customer-risk", label: "Customer Risk", icon: AlertCircle },
      { id: "forecast", label: "Forecast", icon: BrainCircuit },
      { id: "ai-assistant", label: "AI Assistant", icon: Bot },
    ],
  },
  {
    title: "Report",
    items: [
      { id: "btrc", label: "BTRC Report", icon: ClipboardList },
      { id: "enable-disable-history", label: "Enable/Disable History", icon: Activity },
      { id: "bill-collection-report", label: "Bill Collection", icon: Receipt },
      { id: "messages-report", label: "Messages Report", icon: MessageSquare },
      { id: "payment-processing-fee-report", label: "P.Processing Fee", icon: CreditCard },
      { id: "revenue-reports", label: "Revenue", icon: PieChart },
      { id: "customer-reports", label: "Customer", icon: Users2 },
      { id: "network-reports", label: "Network", icon: Network },
      { id: "custom-reports", label: "Custom Reports", icon: FileText },
    ],
  },
  {
    title: "System",
    items: [
      { id: "customer-portal", label: "Subscriber Portal", icon: Globe },
      { id: "employees", label: "Employees", icon: UserCog },
      { id: "inventory", label: "Inventory", icon: Box },
      { id: "activity-logs", label: "Activity Logs", icon: ScrollText },
      { id: "backups", label: "Backups", icon: HardDrive },
      { id: "integrations", label: "Integrations", icon: Link },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

import { useLanguage } from "../context/LanguageContext";
import { useCustomerContext } from "../context/CustomerContext";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

export function Sidebar({ currentPage, onNavigate, collapsed, onToggle, mobileOpen, onCloseMobile, onLogout }: SidebarProps) {
  const { t, bnNum } = useLanguage();
  const { customers } = useCustomerContext();
  const [menuSearch, setMenuSearch] = useState("");

  const onlineCount = customers.filter(c => c.netStatus === "online").length;
  const dueCount = customers.filter(c => (c.dueAmount || 0) > 0 || c.status === "due").length;

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    Object.fromEntries(navSections.filter(s => s.title).map(s => [s.title!, true]))
  );

  const toggleSection = (title: string) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const isActive = (id: Page) => currentPage === id;

  const handleItemClick = (pageId: Page) => {
    onNavigate(pageId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (isMobileView = false) => (
    <aside
      className={`flex flex-col h-full overflow-hidden transition-all duration-200 flex-shrink-0 ${
        isMobileView ? "w-72 max-w-[85vw]" : (collapsed ? "w-16" : "w-60")
      }`}
      style={{
        background: "var(--sidebar)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-between px-4 flex-shrink-0"
        style={{ height: 56, borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex items-center justify-center flex-shrink-0 rounded-lg p-1 bg-white/10 backdrop-blur-sm border border-white/10 shadow-xs overflow-hidden"
            style={{
              width: 34,
              height: 34,
            }}
          >
            <img
              src="/maabestnetwork.png"
              alt="MAA BEST NETWORK"
              className="w-full h-full object-contain"
            />
          </div>
          {(!collapsed || isMobileView) && (
            <div className="flex flex-col min-w-0">
              <span
                className="text-white tracking-wide truncate font-bold"
                style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "-0.01em" }}
              >
                MAA BEST NETWORK
              </span>
              <span style={{ fontSize: 9.5, color: "#ffffff", opacity: 0.75, letterSpacing: "0.04em", fontWeight: 700 }}>
                {t("FIBER OPERATING SYSTEM")}
              </span>
            </div>
          )}
        </div>
        {isMobileView && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
            title="Close menu"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Menu Search Box (Screenshot 1 & 4) */}
      {(!collapsed || isMobileView) && (
        <div className="px-3 py-2.5 border-b border-white/10">
          <input
            type="text"
            value={menuSearch}
            onChange={e => setMenuSearch(e.target.value)}
            placeholder="Menu Search..."
            className="w-full px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/15 text-white placeholder:text-white/40 outline-none focus:border-white/40 focus:bg-white/10 transition-all"
          />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {navSections.map((section, si) => {
          const visibleItems = menuSearch.trim()
            ? section.items.filter(item => item.label.toLowerCase().includes(menuSearch.toLowerCase()))
            : section.items;

          if (visibleItems.length === 0) return null;

          const isExpanded = menuSearch.trim() ? true : (section.title ? expandedSections[section.title] !== false : true);
          return (
            <div key={si} className="mb-1">
              {section.title && (!collapsed || isMobileView) && (
                <button
                  onClick={() => toggleSection(section.title!)}
                  className="w-full flex items-center justify-between px-4 py-1.5 transition-colors cursor-pointer"
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "#ffffff",
                      opacity: 0.75,
                      textTransform: "uppercase",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {t(section.title)}
                  </span>
                  <ChevronDown
                    size={12}
                    style={{
                      color: "#ffffff",
                      opacity: 0.6,
                      transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 0.15s",
                    }}
                  />
                </button>
              )}

              {(isExpanded || (collapsed && !isMobileView)) &&
                visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.id);
                  const showFull = !collapsed || isMobileView;
                  const badgeVal =
                    item.id === "online-clients" ? onlineCount :
                    item.id === "due-customers" ? dueCount :
                    item.badge;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className="w-full flex items-center gap-3 transition-all duration-100 group relative cursor-pointer"
                      style={{
                        padding: !showFull ? "9px 0" : "8px 12px 8px 16px",
                        justifyContent: !showFull ? "center" : "flex-start",
                        background: active ? "var(--sidebar-accent)" : "transparent",
                        borderLeft: active && showFull ? "2px solid #C43535" : "2px solid transparent",
                      }}
                      title={!showFull ? t(item.label) : undefined}
                    >
                      <Icon
                        size={16}
                        style={{
                          color: "#ffffff",
                          opacity: active ? 1 : 0.85,
                          flexShrink: 0,
                        }}
                      />
                      {showFull && (
                        <>
                          <span
                            style={{
                              fontSize: 13,
                              color: "#ffffff",
                              opacity: active ? 1 : 0.95,
                              fontWeight: active ? 600 : 400,
                              flex: 1,
                              textAlign: "left",
                            }}
                          >
                            {t(item.label)}
                          </span>
                          {badgeVal !== undefined && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "1px 6px",
                                borderRadius: 99,
                                background: active ? "rgba(196,53,53,0.5)" : "rgba(255,255,255,0.12)",
                                color: "#ffffff",
                                opacity: 1,
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {typeof badgeVal === "number" || /^\d+/.test(String(badgeVal))
                                ? bnNum(String(badgeVal))
                                : t(String(badgeVal))}
                            </span>
                          )}
                        </>
                      )}
                      {!active && (
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        />
                      )}
                    </button>
                  );
                })}
            </div>
          );
        })}
      </nav>

      {/* ── DEDICATED FIXED ACCOUNT PROFILE & LOGOUT SECTION (LAST OPTION AT BOTTOM) ── */}
      <div
        className="flex-shrink-0 p-3 mt-auto"
        style={{
          borderTop: "1px solid var(--sidebar-border)",
          background: "rgba(0,0,0,0.22)"
        }}
      >
        {(!collapsed || isMobileView) ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-1 py-1">
              <div
                className="flex items-center justify-center rounded-xl font-black text-white text-xs flex-shrink-0 shadow-sm"
                style={{ width: 34, height: 34, background: "linear-gradient(135deg, #8B2020 0%, #C43535 100%)" }}
              >
                MBN
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">Super Admin</p>
                <p className="text-[10px] text-white/70 truncate font-mono">admin@maabestnetwork.com</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                if (onLogout) onLogout();
              }}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-white bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 shadow-xs"
            >
              <LogOut size={13} />
              <span>{t("Sign Out / Logout")}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => onLogout?.()}
            className="w-full flex items-center justify-center p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-950/60 transition-colors cursor-pointer"
            title={t("Sign Out / Logout")}
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        {sidebarContent(false)}
      </div>

      {/* Mobile Drawer with Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full shadow-2xl animate-slide-right">
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
