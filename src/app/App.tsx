import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Receipt, Activity, Menu } from "lucide-react";
import { LoginPage } from "./components/LoginPage";
import { CustomerLoginPage } from "./components/CustomerLoginPage";
import { Sidebar, type Page } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { LanguageProvider } from "./context/LanguageContext";
import { CustomerProvider } from "./context/CustomerContext";
import { Dashboard } from "./components/Dashboard";
import { CustomersPage } from "./components/CustomersPage";
import { LiveStatusPage } from "./components/LiveStatusPage";
import { DueCustomersPage } from "./components/DueCustomersPage";
import { DisconnectedPage } from "./components/DisconnectedPage";
import { ImportCustomersPage } from "./components/ImportCustomersPage";

// ─── Dedicated Billing & Store Pages ─────────────────────────────────────────
import { InvoicesPage } from "./components/billing/InvoicesPage";
import { PaymentsPage } from "./components/billing/PaymentsPage";
import { CashDeskPage } from "./components/billing/CashDeskPage";
import { PackagesPage } from "./components/billing/PackagesPage";
import { DiscountsPage } from "./components/billing/DiscountsPage";
import { BillingSettingsPage } from "./components/billing/BillingSettingsPage";
import { StoreSalesPage } from "./components/store/StoreSalesPage";

// ─── Dedicated Network Pages ────────────────────────────────────────────────
import { NetworkMapPage } from "./components/network/NetworkMapPage";
import { MikrotikPage } from "./components/network/MikrotikPage";
import { OltPage } from "./components/network/OltPage";
import { IpPoolsPage } from "./components/network/IpPoolsPage";
import { Tr069AcsPage } from "./components/network/Tr069AcsPage";
import { ZonesPage } from "./components/network/ZonesPage";
import { IncidentsPage } from "./components/network/IncidentsPage";
import { MonitoringPage } from "./components/network/MonitoringPage";

// ─── Dedicated Reseller Pages ───────────────────────────────────────────────
import { MacResellersPage } from "./components/resellers/MacResellersPage";
import { BandwidthResellersPage } from "./components/resellers/BandwidthResellersPage";
import { ResellerWalletsPage } from "./components/resellers/ResellerWalletsPage";

// ─── Dedicated CRM Pages ────────────────────────────────────────────────────
import { TicketsPage } from "./components/crm/TicketsPage";
import { CustomerTimelinePage } from "./components/crm/CustomerTimelinePage";

// ─── Dedicated Finance Pages ────────────────────────────────────────────────
import { AccountsPage } from "./components/finance/AccountsPage";
import { TransactionsPage } from "./components/finance/TransactionsPage";
import { ExpensesPage } from "./components/finance/ExpensesPage";
import { FinanceReportsPage } from "./components/finance/FinanceReportsPage";

// ─── Dedicated Automation Pages ─────────────────────────────────────────────
import { SmsAutomationPage } from "./components/automation/SmsAutomationPage";
import { WorkflowsPage } from "./components/automation/WorkflowsPage";
import { NotificationsCenterPage } from "./components/automation/NotificationsCenterPage";

// ─── Dedicated AI Intelligence Pages ─────────────────────────────────────────
import { RevenueAnalysisPage } from "./components/ai/RevenueAnalysisPage";
import { LeakageDetectorPage } from "./components/ai/LeakageDetectorPage";
import { CustomerRiskPage } from "./components/ai/CustomerRiskPage";
import { ForecastPage } from "./components/ai/ForecastPage";
import { AiAssistantPage } from "./components/ai/AiAssistantPage";

// ─── Dedicated Reports Pages ────────────────────────────────────────────────
import { RevenueReportsPage } from "./components/reports/RevenueReportsPage";
import { CustomerReportsPage } from "./components/reports/CustomerReportsPage";
import { NetworkReportsPage } from "./components/reports/NetworkReportsPage";
import { BtrcReportsPage } from "./components/reports/BtrcReportsPage";
import { CustomReportsPage } from "./components/reports/CustomReportsPage";

// ─── Dedicated System Pages ─────────────────────────────────────────────────
import { EmployeesPage } from "./components/EmployeesPage";
import { ActivityLogsPage } from "./components/ActivityLogsPage";
import { BackupsPage } from "./components/BackupsPage";
import { IntegrationsPage } from "./components/system/IntegrationsPage";
import { SettingsPage } from "./components/system/SettingsPage";

// ─── New Feature Pages ───────────────────────────────────────────────────────
import { CustomerProfilePage } from "./components/CustomerProfilePage";
import { CustomerMapPage } from "./components/CustomerMapPage";
import { InventoryPage } from "./components/InventoryPage";
import { TechniciansPage } from "./components/TechniciansPage";
import { ONUEventHistoryPage } from "./components/network/ONUEventHistoryPage";
import { SplitterLedgerPage } from "./components/network/SplitterLedgerPage";
import { WhatsAppHubPage } from "./components/crm/WhatsAppHubPage";
import { CustomerPortalPage } from "./components/CustomerPortalPage";
import { NocWallboardPage } from "./components/network/NocWallboardPage";
import { OnlineClientMonitoringPage } from "./components/network/OnlineClientMonitoringPage";
import { AddNewClientPage } from "./components/AddNewClientPage";
import { SmsTemplatePage } from "./components/sms/SmsTemplatePage";
import { IndividualSmsPage } from "./components/sms/IndividualSmsPage";
import { SmsGroupsPage } from "./components/sms/SmsGroupsPage";
import { GroupSmsPage } from "./components/sms/GroupSmsPage";
import { EnableDisableHistoryPage } from "./components/reports/EnableDisableHistoryPage";
import { BillCollectionHistoryPage } from "./components/reports/BillCollectionHistoryPage";
import { MessagesReportPage } from "./components/reports/MessagesReportPage";
import { PaymentProcessingFeeReportPage } from "./components/reports/PaymentProcessingFeeReportPage";

// ─── URL Routing Mappers ────────────────────────────────────────────────────

export const PAGE_TO_URL: Record<Page, string> = {
  dashboard: "/admin",
  "customer-portal": "/",
  // Customers
  customers: "/customers",
  "add-client": "/customers/add",
  "due-customers": "/customers/due",
  disconnected: "/customers/disconnected",
  import: "/customers/import",
  "live-status": "/customers/live-status",
  "online-clients": "/network/online-clients",
  // Billing & Store
  "store-pos": "/billing/store",
  invoices: "/billing/invoices",
  payments: "/billing/payments",
  "cash-desk": "/billing/cash-desk",
  packages: "/billing/packages",
  discounts: "/billing/discounts",
  "billing-settings": "/billing/settings",
  // Network
  "network-map": "/network/map",
  mikrotik: "/network/mikrotik",
  olt: "/network/olt",
  "ip-pools": "/network/ip-pools",
  tr069: "/network/tr069",
  zones: "/network/zones",
  incidents: "/network/incidents",
  monitoring: "/network/monitoring",
  // Resellers
  "mac-resellers": "/resellers/mac",
  "bandwidth-resellers": "/resellers/bandwidth",
  "reseller-wallets": "/resellers/wallets",
  // CRM
  tickets: "/crm/tickets",
  "customer-timeline": "/crm/timeline",
  messages: "/crm/messages",
  // Finance
  accounts: "/finance/accounts",
  transactions: "/finance/transactions",
  expenses: "/finance/expenses",
  "finance-reports": "/finance/reports",
  // SMS Service
  "sms-templates": "/sms/templates",
  "sms-individual": "/sms/individual",
  "sms-groups": "/sms/groups",
  "sms-send-group": "/sms/send",
  // Automation
  sms: "/automation/sms",
  workflows: "/automation/workflows",
  "notifications-center": "/automation/notifications",
  // AI
  "revenue-analysis": "/ai/revenue",
  "leakage-detector": "/ai/leakage",
  "customer-risk": "/ai/risk",
  forecast: "/ai/forecast",
  "ai-assistant": "/ai/assistant",
  // Reports
  btrc: "/reports/btrc",
  "enable-disable-history": "/reports/enable-disable",
  "bill-collection-report": "/reports/bill-collection",
  "messages-report": "/reports/messages",
  "payment-processing-fee-report": "/reports/payment-fees",
  "revenue-reports": "/reports/revenue",
  "customer-reports": "/reports/customers",
  "network-reports": "/reports/network",
  "custom-reports": "/reports/custom",
  // System
  employees: "/system/employees",
  technicians: "/system/technicians",
  inventory: "/system/inventory",
  "activity-logs": "/system/activity-logs",
  backups: "/system/backups",
  integrations: "/system/integrations",
  settings: "/system/settings",
  onboarding: "/system/onboarding",
  // Customer Detail & CRM
  "customer-profile": "/customers/profile",
  "customer-map": "/customers/map",
  "whatsapp-hub": "/crm/whatsapp",
  "support-page": "/crm/support",
  // Network
  splitters: "/network/splitters",
  "onu-events": "/network/onu-events",
  "noc-wallboard": "/network/noc-wall",
};

export function getPageFromPathname(path: string): Page {
  const cleanPath = path.replace(/\/$/, "") || "/";

  // 1. Admin link (/admin, /admin/login, /admin/dashboard)
  if (
    cleanPath === "/admin" ||
    cleanPath === "/admin/login" ||
    cleanPath === "/admin/dashboard" ||
    cleanPath === "/login"
  ) {
    return "dashboard";
  }

  // 2. Normal link for subscribers (default root "/" or "/portal" or "/subscriber")
  if (
    cleanPath === "/" ||
    cleanPath === "/portal" ||
    cleanPath.startsWith("/portal") ||
    cleanPath === "/subscriber" ||
    cleanPath === "/subscriber/login" ||
    cleanPath === "/user/login" ||
    cleanPath === "/my-account"
  ) {
    return "customer-portal";
  }

  if (cleanPath === "/dashboard") {
    return "dashboard";
  }

  // Exact match against registry
  for (const [pageKey, pageUrl] of Object.entries(PAGE_TO_URL)) {
    if (cleanPath === pageUrl || cleanPath === `/${pageKey}` || cleanPath === `/admin/${pageKey}`) {
      return pageKey as Page;
    }
  }

  // Alias checks for Billing & Store
  if (cleanPath.includes("/store") || cleanPath.includes("/pos-store")) return "store-pos";
  if (cleanPath.includes("/invoices")) return "invoices";
  if (cleanPath.includes("/cash-desk")) return "cash-desk";
  if (cleanPath.includes("/payments")) return "payments";
  if (cleanPath.includes("/packages")) return "packages";
  if (cleanPath.includes("/discounts")) return "discounts";
  if (cleanPath.includes("/billing-settings") || cleanPath.includes("/billing/settings")) return "billing-settings";

  // Alias checks for Network
  if (cleanPath.includes("/map") || cleanPath.includes("/network-map") || cleanPath.includes("network/map")) return "network-map";
  if (cleanPath.includes("/mikrotik")) return "mikrotik";
  if (cleanPath.includes("/olt")) return "olt";
  if (cleanPath.includes("/ip-pools") || cleanPath.includes("/ipam")) return "ip-pools";
  if (cleanPath.includes("/tr069") || cleanPath.includes("/acs")) return "tr069";
  if (cleanPath.includes("/zones")) return "zones";
  if (cleanPath.includes("/incidents")) return "incidents";
  if (cleanPath.includes("/monitoring")) return "monitoring";

  // Alias checks for Resellers
  if (cleanPath.includes("/resellers/mac") || cleanPath.includes("/mac-resellers")) return "mac-resellers";
  if (cleanPath.includes("/resellers/bandwidth") || cleanPath.includes("/bandwidth-resellers")) return "bandwidth-resellers";
  if (cleanPath.includes("/resellers/wallets") || cleanPath.includes("/reseller-wallets") || cleanPath.includes("/wallets")) return "reseller-wallets";

  // Alias checks for CRM
  if (cleanPath.includes("/crm/tickets") || cleanPath.includes("/tickets")) return "tickets";
  if (cleanPath.includes("/crm/timeline") || cleanPath.includes("/customer-timeline") || cleanPath.includes("/timeline")) return "customer-timeline";
  if (cleanPath.includes("/crm/messages") || cleanPath.includes("/messages")) return "messages";

  // Alias checks for Finance
  if (cleanPath.includes("/finance/accounts") || cleanPath.includes("/accounts")) return "accounts";
  if (cleanPath.includes("/finance/transactions") || cleanPath.includes("/transactions")) return "transactions";
  if (cleanPath.includes("/finance/expenses") || cleanPath.includes("/expenses")) return "expenses";
  if (cleanPath.includes("/finance/reports") || cleanPath.includes("/finance-reports")) return "finance-reports";

  // Alias checks for SMS Service
  if (cleanPath.includes("/sms/templates") || cleanPath.includes("/sms-templates")) return "sms-templates";
  if (cleanPath.includes("/sms/individual") || cleanPath.includes("/sms-individual")) return "sms-individual";
  if (cleanPath.includes("/sms/groups") || cleanPath.includes("/sms-groups")) return "sms-groups";
  if (cleanPath.includes("/sms/send") || cleanPath.includes("/sms-send") || cleanPath.includes("/group-sms")) return "sms-send-group";

  // Alias checks for Automation
  if (cleanPath.includes("/automation/sms") || cleanPath.includes("/sms")) return "sms";
  if (cleanPath.includes("/automation/workflows") || cleanPath.includes("/workflows")) return "workflows";
  if (cleanPath.includes("/automation/notifications") || cleanPath.includes("/notifications")) return "notifications-center";

  // Alias checks for AI
  if (cleanPath.includes("/ai/revenue") || cleanPath.includes("/revenue-analysis")) return "revenue-analysis";
  if (cleanPath.includes("/ai/leakage") || cleanPath.includes("/leakage-detector") || cleanPath.includes("/leakage")) return "leakage-detector";
  if (cleanPath.includes("/ai/risk") || cleanPath.includes("/customer-risk") || cleanPath.includes("/risk")) return "customer-risk";
  if (cleanPath.includes("/ai/forecast") || cleanPath.includes("/forecast")) return "forecast";
  if (cleanPath.includes("/ai/assistant") || cleanPath.includes("/ai-assistant") || cleanPath.includes("/assistant")) return "ai-assistant";

  // Alias checks for Reports
  if (cleanPath.includes("/reports/btrc") || cleanPath.includes("/btrc")) return "btrc";
  if (cleanPath.includes("/reports/enable-disable") || cleanPath.includes("/enable-disable")) return "enable-disable-history";
  if (cleanPath.includes("/reports/bill-collection") || cleanPath.includes("/bill-collection")) return "bill-collection-report";
  if (cleanPath.includes("/reports/messages") || cleanPath.includes("/messages-report")) return "messages-report";
  if (cleanPath.includes("/reports/payment-fees") || cleanPath.includes("/payment-processing-fee") || cleanPath.includes("/fee-report")) return "payment-processing-fee-report";
  if (cleanPath.includes("/reports/revenue") || cleanPath.includes("/revenue-reports")) return "revenue-reports";
  if (cleanPath.includes("/reports/customers") || cleanPath.includes("/customer-reports")) return "customer-reports";
  if (cleanPath.includes("/reports/network") || cleanPath.includes("/network-reports")) return "network-reports";
  if (cleanPath.includes("/reports/custom") || cleanPath.includes("/custom-reports")) return "custom-reports";

  // Alias checks for System
  if (cleanPath.includes("/system/employees") || cleanPath.includes("/employees")) return "employees";
  if (cleanPath.includes("/system/activity-logs") || cleanPath.includes("/activity-logs")) return "activity-logs";
  if (cleanPath.includes("/system/backups") || cleanPath.includes("/backups")) return "backups";
  if (cleanPath.includes("/system/integrations") || cleanPath.includes("/integrations")) return "integrations";
  if (cleanPath.includes("/system/settings") || cleanPath.includes("/settings")) return "settings";

  return "customer-portal";
}

function renderPage(page: Page, onNavigate: (p: Page) => void) {
  switch (page) {
    case "dashboard":
      return <Dashboard onNavigate={(target) => onNavigate(target as Page)} />;

    // Customers
    case "customers":
    case "customer-profile":
      return <CustomersPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "add-client":
      return <AddNewClientPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "customer-map":
      return <CustomerMapPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "due-customers":
      return <DueCustomersPage />;
    case "disconnected":
      return <DisconnectedPage />;
    case "import":
      return <ImportCustomersPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "live-status":
      return <LiveStatusPage />;
    case "online-clients":
      return <OnlineClientMonitoringPage onNavigate={(target) => onNavigate(target as Page)} />;

    // ── Dedicated Individual Billing & Store Pages ──
    case "store-pos":
      return <StoreSalesPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "invoices":
      return <InvoicesPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "payments":
      return <PaymentsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "cash-desk":
      return <CashDeskPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "packages":
    case "discounts":
      return <PackagesPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "billing-settings":
      return <BillingSettingsPage onNavigate={(target) => onNavigate(target as Page)} />;

    // ── Dedicated Individual Network Pages ──
    case "network-map":
      return <NetworkMapPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "noc-wallboard":
      return <NocWallboardPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "mikrotik":
      return <MikrotikPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "olt":
      return <OltPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "splitters":
      return <SplitterLedgerPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "onu-events":
      return <ONUEventHistoryPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "ip-pools":
      return <IpPoolsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "tr069":
      return <Tr069AcsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "zones":
      return <ZonesPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "incidents":
      return <IncidentsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "monitoring":
      return <MonitoringPage onNavigate={(target) => onNavigate(target as Page)} />;

    // ── Dedicated Individual Resellers Pages ──
    case "mac-resellers":
      return <MacResellersPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "bandwidth-resellers":
      return <BandwidthResellersPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "reseller-wallets":
      return <ResellerWalletsPage onNavigate={(target) => onNavigate(target as Page)} />;

    // ── Dedicated Individual CRM Pages ──
    case "whatsapp-hub":
      return <WhatsAppHubPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "tickets":
      return <TicketsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "customer-timeline":
      return <CustomerTimelinePage onNavigate={(target) => onNavigate(target as Page)} />;
    case "messages":
      return <TicketsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "technicians":
      return <TechniciansPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "support-page":
      return <TicketsPage onNavigate={(target) => onNavigate(target as Page)} />;

    // ── Dedicated Individual Finance Pages ──
    case "accounts":
      return <AccountsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "transactions":
      return <TransactionsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "expenses":
      return <ExpensesPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "finance-reports":
      return <FinanceReportsPage onNavigate={(target) => onNavigate(target as Page)} />;

    // ── Dedicated Individual SMS Service Pages ──
    case "sms-templates":
      return <SmsTemplatePage onNavigate={(target) => onNavigate(target as Page)} />;
    case "sms-individual":
      return <IndividualSmsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "sms-groups":
      return <SmsGroupsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "sms-send-group":
      return <GroupSmsPage onNavigate={(target) => onNavigate(target as Page)} />;

    // ── Dedicated Individual Automation Pages ──
    case "sms":
      return <SmsAutomationPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "workflows":
      return <WorkflowsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "notifications-center":
      return <NotificationsCenterPage onNavigate={(target) => onNavigate(target as Page)} />;

    // ── Dedicated Individual AI Intelligence Pages ──
    case "revenue-analysis":
      return <RevenueAnalysisPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "leakage-detector":
      return <LeakageDetectorPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "customer-risk":
      return <CustomerRiskPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "forecast":
      return <ForecastPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "ai-assistant":
      return <AiAssistantPage onNavigate={(target) => onNavigate(target as Page)} />;

    // ── Dedicated Individual Reports Pages ──
    case "btrc":
      return <BtrcReportsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "enable-disable-history":
      return <EnableDisableHistoryPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "bill-collection-report":
      return <BillCollectionHistoryPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "messages-report":
      return <MessagesReportPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "payment-processing-fee-report":
      return <PaymentProcessingFeeReportPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "revenue-reports":
      return <RevenueReportsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "customer-reports":
      return <CustomerReportsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "network-reports":
      return <NetworkReportsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "custom-reports":
      return <CustomReportsPage onNavigate={(target) => onNavigate(target as Page)} />;

    // ── Dedicated Individual System Pages ──
    case "employees":
      return <EmployeesPage />;
    case "inventory":
      return <InventoryPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "activity-logs":
      return <ActivityLogsPage />;
    case "backups":
      return <BackupsPage />;
    case "integrations":
      return <IntegrationsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "settings":
      return <SettingsPage onNavigate={(target) => onNavigate(target as Page)} />;
    case "onboarding":
      return <Dashboard onNavigate={(target) => onNavigate(target as Page)} />;
    case "customer-portal":
      return <CustomerPortalPage onNavigate={(target) => onNavigate(target as Page)} />;

    default:
      return <CustomerPortalPage onNavigate={(target) => onNavigate(target as Page)} />;
  }
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem("mbn_admin_logged_in") === "true";
      }
    } catch {
      // fallback
    }
    return false;
  });

  const [portalAuthenticated, setPortalAuthenticated] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem("mbn_portal_authenticated") === "true";
      }
    } catch {
      // fallback
    }
    return false;
  });

  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window !== "undefined") {
      return getPageFromPathname(window.location.pathname);
    }
    return "customer-portal";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Persist Admin session
  useEffect(() => {
    try {
      if (loggedIn) {
        localStorage.setItem("mbn_admin_logged_in", "true");
      } else {
        localStorage.removeItem("mbn_admin_logged_in");
      }
    } catch (e) {
      console.error(e);
    }
  }, [loggedIn]);

  // Persist Subscriber session
  useEffect(() => {
    try {
      if (portalAuthenticated) {
        localStorage.setItem("mbn_portal_authenticated", "true");
      } else {
        localStorage.removeItem("mbn_portal_authenticated");
      }
    } catch (e) {
      console.error(e);
    }
  }, [portalAuthenticated]);

  // Sync URL on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const pageFromUrl = getPageFromPathname(window.location.pathname);
      setCurrentPage(pageFromUrl);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleNavigate = (page: Page | string) => {
    const validPage = page as Page;
    setCurrentPage(validPage);
    setMobileMenuOpen(false);
    const targetUrl = PAGE_TO_URL[validPage] || `/${page}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, "", targetUrl);
    }
  };

  // ── 1. NORMAL LINK (SUBSCRIBER PORTAL AT "/") ──
  if (currentPage === "customer-portal") {
    return (
      <LanguageProvider>
        <CustomerProvider>
          {portalAuthenticated ? (
            <CustomerPortalPage
              onNavigate={handleNavigate}
              onLogout={() => {
                setPortalAuthenticated(false);
                handleNavigate("customer-portal");
              }}
            />
          ) : (
            <CustomerLoginPage
              onSuccess={() => setPortalAuthenticated(true)}
              onAdminSwitch={() => {
                handleNavigate("dashboard");
              }}
            />
          )}
        </CustomerProvider>
      </LanguageProvider>
    );
  }

  // ── 2. ADMIN LINK (ADMIN GATEWAY AT "/admin") ──
  if (!loggedIn) {
    return (
      <LanguageProvider>
        <CustomerProvider>
          <LoginPage
            onLogin={() => {
              setLoggedIn(true);
              handleNavigate("dashboard");
            }}
            onPortalSwitch={() => {
              handleNavigate("customer-portal");
            }}
          />
        </CustomerProvider>
      </LanguageProvider>
    );
  }

  // ── 3. FULL ADMIN ISP OPERATING SYSTEM (WHEN LOGGED IN AT "/admin") ──
  return (
    <LanguageProvider>
      <CustomerProvider>
        <div
          className="flex h-screen overflow-hidden relative"
          style={{ background: "var(--background)", animation: "appFadeIn 0.35s ease" }}
        >
          <style>{`@keyframes appFadeIn { from { opacity:0; transform:scale(0.997); } to { opacity:1; transform:scale(1); } }`}</style>
          
          {/* Responsive Sidebar (Desktop Fixed + Mobile Overlay Drawer) */}
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(c => !c)}
            mobileOpen={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            onLogout={() => {
              setLoggedIn(false);
              handleNavigate("dashboard");
            }}
          />

          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <TopBar
              currentPage={currentPage}
              darkMode={darkMode}
              onToggleDark={() => setDarkMode(d => !d)}
              onLogout={() => {
                setLoggedIn(false);
                handleNavigate("dashboard");
              }}
              onNavigate={handleNavigate}
              onMenuToggle={() => setMobileMenuOpen(m => !m)}
            />

            <main
              className="flex-1 overflow-y-auto pb-16 md:pb-0"
              style={{ background: "var(--background)" }}
            >
              {renderPage(currentPage, handleNavigate)}
            </main>

            {/* Mobile Bottom Navigation Bar (Admin Quick Actions) */}
            <div
              className="md:hidden flex items-center justify-around fixed bottom-0 left-0 right-0 z-40 px-2 py-1.5 border-t backdrop-blur-md"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: "0 -2px 10px rgba(0,0,0,0.06)",
                height: 56
              }}
            >
              {[
                { id: "dashboard" as Page, label: "Home", icon: LayoutDashboard },
                { id: "customers" as Page, label: "Customers", icon: Users },
                { id: "cash-desk" as Page, label: "Cash POS", icon: Receipt },
                { id: "live-status" as Page, label: "Status", icon: Activity },
              ].map(item => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors cursor-pointer"
                    style={{
                      color: active ? "var(--primary)" : "var(--muted-foreground)",
                      fontWeight: active ? 700 : 500
                    }}
                  >
                    <Icon size={18} className="mb-0.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors cursor-pointer"
                style={{
                  color: mobileMenuOpen ? "var(--primary)" : "var(--muted-foreground)"
                }}
              >
                <Menu size={18} className="mb-0.5" />
                <span>More</span>
              </button>
            </div>
          </div>
        </div>
      </CustomerProvider>
    </LanguageProvider>
  );
}
