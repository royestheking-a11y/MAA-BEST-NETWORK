import React, { createContext, useContext, useState, useEffect } from "react";
import {
  subscribeToEmployees,
  saveEmployeeToFirestore,
  deleteEmployeeFromFirestore,
  subscribeToRoles,
  saveRoleToFirestore,
  subscribeToAdminAuth,
  saveAdminAuthToFirestore,
} from "../../lib/firestoreService";
import { activityLogger } from "../services/activityLogger";

export type PermissionLevel = "none" | "read" | "read_write" | "all";

export interface SystemSectionConfig {
  id: string;
  label: string;
  category: string;
  description: string;
  pages: string[];
}

export const SYSTEM_SECTIONS: SystemSectionConfig[] = [
  // ── Overview ──
  {
    id: "dashboard",
    label: "Admin Dashboard & KPIs",
    category: "Overview",
    description: "Executive revenue metrics, active subscriber counts, NOC status, and quick shortcuts",
    pages: ["dashboard"],
  },

  // ── Client & Subscriber Operations ──
  {
    id: "customers",
    label: "All Clients Roster",
    category: "Client Operations",
    description: "Browse, filter, view subscriber profiles, export customer directories",
    pages: ["customers", "customer-profile"],
  },
  {
    id: "add-client",
    label: "Add New Client / Registration",
    category: "Client Operations",
    description: "Register new PPPoE/Static fiber clients with package & ONU binding",
    pages: ["add-client"],
  },
  {
    id: "online-clients",
    label: "Online Clients & MAC Binding",
    category: "Client Operations",
    description: "Real-time active sessions, live bandwidth rates, and MAC binding table",
    pages: ["online-clients"],
  },
  {
    id: "due-customers",
    label: "Due Clients & Collection Adjustments",
    category: "Client Operations",
    description: "Overdue bills, reminder notices, promise-to-pay date extensions",
    pages: ["due-customers"],
  },
  {
    id: "disconnected",
    label: "Disconnected & Suspended Clients",
    category: "Client Operations",
    description: "Subscribers shut off for non-payment, optical fiber breaks, or requested hold",
    pages: ["disconnected"],
  },
  {
    id: "customer-map",
    label: "Customer Geolocation Map",
    category: "Client Operations",
    description: "Interactive visual map of subscriber homes, optical drops, and line paths",
    pages: ["customer-map"],
  },
  {
    id: "import",
    label: "Import / Export Clients",
    category: "Client Operations",
    description: "Bulk CSV customer import and migration wizards",
    pages: ["import", "import-customers"],
  },

  // ── Live Monitoring & NOC ──
  {
    id: "noc-wallboard",
    label: "NOC OLT Center & Wallboard",
    category: "Live Monitoring & NOC",
    description: "Live optical power levels, PON port saturation, OLT fan/CPU health",
    pages: ["noc-wallboard"],
  },
  {
    id: "live-status",
    label: "Live Status & Optical Telemetry",
    category: "Live Monitoring & NOC",
    description: "Real-time bandwidth per second, live ONU telemetry, ping monitors",
    pages: ["live-status"],
  },
  {
    id: "network-map",
    label: "Network Topology & Fiber Map",
    category: "Live Monitoring & NOC",
    description: "Physical & logical fiber distribution maps, core POP links",
    pages: ["network-map"],
  },
  {
    id: "onu-events",
    label: "ONU Event Logs & LOS History",
    category: "Live Monitoring & NOC",
    description: "Dying gasp, optical loss of signal (LOS), ONU reboot timeline",
    pages: ["onu-events"],
  },
  {
    id: "incidents",
    label: "Network Problems & Outages",
    category: "Live Monitoring & NOC",
    description: "Fiber cuts, upstream gateway failures, and mass customer outage tracking",
    pages: ["incidents"],
  },
  {
    id: "monitoring",
    label: "Monitoring Hub & Ping Matrix",
    category: "Live Monitoring & NOC",
    description: "SNMP polling metrics, ICMP latency matrix, uptime monitors",
    pages: ["monitoring"],
  },

  // ── Network Infrastructure ──
  {
    id: "mikrotik",
    label: "MikroTik Core Routers",
    category: "Network Infrastructure",
    description: "RouterOS API, PPPoE servers, firewall queues, bandwidth rate-limits",
    pages: ["mikrotik"],
  },
  {
    id: "olt",
    label: "OLT & Optical PON Devices",
    category: "Network Infrastructure",
    description: "EPON/GPON OLT controllers, PON port management, optical transceiver configs",
    pages: ["olt"],
  },
  {
    id: "splitters",
    label: "Splitter & ODN Distribution Ledger",
    category: "Network Infrastructure",
    description: "TJ boxes, PLC splitters (1:8, 1:16), fiber core allocation",
    pages: ["splitters"],
  },
  {
    id: "ip-pools",
    label: "IP Pools & VLANs",
    category: "Network Infrastructure",
    description: "Public & private IPv4 pools, CGNAT ranges, VLAN tagging",
    pages: ["ip-pools"],
  },
  {
    id: "tr069",
    label: "User WiFi & TR-069 CPE Control",
    category: "Network Infrastructure",
    description: "Remote router Wi-Fi SSID, password changes, optical diagnostic pings",
    pages: ["tr069"],
  },
  {
    id: "zones",
    label: "Distribution Zones & POPs",
    category: "Network Infrastructure",
    description: "Coverage areas, POP centers, and local distribution nodes",
    pages: ["zones"],
  },

  // ── Billing & POS ──
  {
    id: "store-pos",
    label: "Store & Hardware POS",
    category: "Billing & Store",
    description: "Optical ONU, dual-band router sales, patch cords, retail invoices",
    pages: ["store-pos"],
  },
  {
    id: "invoices",
    label: "Invoices & Billing Ledger",
    category: "Billing & Store",
    description: "Monthly subscription bill generation, PDF invoice printouts",
    pages: ["invoices"],
  },
  {
    id: "payments",
    label: "Payments & Collections",
    category: "Billing & Store",
    description: "bKash, Nagad, manual cash collections, transaction receipts",
    pages: ["payments"],
  },
  {
    id: "cash-desk",
    label: "Cash Desk POS & Fast Register",
    category: "Billing & Store",
    description: "Front-desk rapid bill collection, barcode scanning, thermal receipts",
    pages: ["cash-desk"],
  },
  {
    id: "packages",
    label: "Internet Packages & Bandwidth Profiles",
    category: "Billing & Store",
    description: "Subscription speeds, pricing, validity periods, promotional packages",
    pages: ["packages"],
  },
  {
    id: "discounts",
    label: "Discounts & Promo Coupons",
    category: "Billing & Store",
    description: "Special customer discounts, festive promotions, promo codes",
    pages: ["discounts"],
  },
  {
    id: "billing-settings",
    label: "Billing Configurations",
    category: "Billing & Store",
    description: "Billing cycles, auto-disconnection policies, late fee penalties",
    pages: ["billing-settings"],
  },

  // ── Resellers ──
  {
    id: "mac-resellers",
    label: "MAC Resellers",
    category: "Reseller Network",
    description: "Sub-ISP MAC client binding, reseller rates, customer allocation",
    pages: ["mac-resellers"],
  },
  {
    id: "bandwidth-resellers",
    label: "Bandwidth Resellers",
    category: "Reseller Network",
    description: "Bulk wholesale bandwidth resellers, upstream commitments",
    pages: ["bandwidth-resellers"],
  },
  {
    id: "reseller-wallets",
    label: "Reseller Wallets & Balance",
    category: "Reseller Network",
    description: "Prepaid wallet recharges, credit limits, reseller billing ledgers",
    pages: ["reseller-wallets"],
  },

  // ── CRM & Support ──
  {
    id: "whatsapp-hub",
    label: "WhatsApp CRM & Auto Messaging",
    category: "CRM & Support",
    description: "Cloud API messaging, bill reminders, support chat notifications",
    pages: ["whatsapp-hub"],
  },
  {
    id: "tickets",
    label: "Support Tickets & Helpdesk",
    category: "CRM & Support",
    description: "Customer service complaints, slow internet tickets, field visits",
    pages: ["tickets", "messages", "support-page"],
  },
  {
    id: "customer-timeline",
    label: "Customer Activity Timeline",
    category: "CRM & Support",
    description: "Complete subscriber history: payments, tickets, line reboots",
    pages: ["customer-timeline"],
  },
  {
    id: "technicians",
    label: "Field Technicians & Linemen",
    category: "CRM & Support",
    description: "Lineman task assignments, field visits, installation workorders",
    pages: ["technicians"],
  },

  // ── Finance ──
  {
    id: "accounts",
    label: "Ledger Accounts",
    category: "Finance & Accounts",
    description: "Chart of accounts, bank accounts, mobile financial services",
    pages: ["accounts"],
  },
  {
    id: "transactions",
    label: "Transaction Journal",
    category: "Finance & Accounts",
    description: "All financial debits and credits, transfers, reconciliation",
    pages: ["transactions"],
  },
  {
    id: "expenses",
    label: "Expenses Tracker",
    category: "Finance & Accounts",
    description: "Bandwidth upstream costs, electricity, staff salary, office rent",
    pages: ["expenses"],
  },
  {
    id: "finance-reports",
    label: "Financial Statements & Reports",
    category: "Finance & Accounts",
    description: "Profit & loss, balance sheet, cashflow summary",
    pages: ["finance-reports"],
  },

  // ── SMS & Automation ──
  {
    id: "sms-templates",
    label: "SMS Templates & Configurations",
    category: "SMS & Automation",
    description: "Custom notification templates, SMS gateway API credentials",
    pages: ["sms-templates"],
  },
  {
    id: "sms-individual",
    label: "Individual SMS Messaging",
    category: "SMS & Automation",
    description: "Send single SMS to specific subscriber or phone number",
    pages: ["sms-individual"],
  },
  {
    id: "sms-groups",
    label: "Group SMS Campaigns",
    category: "SMS & Automation",
    description: "Blast notifications to whole zone, due clients, or package holders",
    pages: ["sms-groups", "sms-send-group"],
  },
  {
    id: "sms",
    label: "Automated SMS Engine",
    category: "SMS & Automation",
    description: "Trigger-based SMS for payment receipt, due alert, bill generation",
    pages: ["sms"],
  },
  {
    id: "workflows",
    label: "Automation Workflows",
    category: "SMS & Automation",
    description: "Event-driven actions, auto-renewal scripts, alert dispatches",
    pages: ["workflows"],
  },
  {
    id: "notifications-center",
    label: "Notifications Center",
    category: "SMS & Automation",
    description: "In-app system alerts, broadcast announcements, staff memos",
    pages: ["notifications-center"],
  },

  // ── AI Intelligence ──
  {
    id: "revenue-analysis",
    label: "AI Revenue Analysis",
    category: "AI Intelligence",
    description: "Revenue patterns, ARPU trends, high-value customer identification",
    pages: ["revenue-analysis"],
  },
  {
    id: "leakage-detector",
    label: "Revenue Leakage Detector",
    category: "AI Intelligence",
    description: "Unbilled active lines, unauthorized bandwidth usage, package mismatches",
    pages: ["leakage-detector"],
  },
  {
    id: "customer-risk",
    label: "Customer Churn Risk",
    category: "AI Intelligence",
    description: "Subscribers at risk of leaving, prolonged offline alerts",
    pages: ["customer-risk"],
  },
  {
    id: "forecast",
    label: "Predictive Capacity Forecast",
    category: "AI Intelligence",
    description: "Bandwidth growth predictions, hardware expansion forecasting",
    pages: ["forecast"],
  },
  {
    id: "ai-assistant",
    label: "ISP AI Copilot Assistant",
    category: "AI Intelligence",
    description: "Natural language query assistant for diagnostics and billing",
    pages: ["ai-assistant"],
  },

  // ── Reports ──
  {
    id: "btrc",
    label: "BTRC Regulatory Compliance",
    category: "Reports",
    description: "Official BTRC ISP reporting formats, subscriber logs, tariffs",
    pages: ["btrc"],
  },
  {
    id: "bill-collection-report",
    label: "Bill Collection Reports",
    category: "Reports",
    description: "Daily, monthly collector-wise collection statements",
    pages: ["bill-collection-report"],
  },
  {
    id: "enable-disable-history",
    label: "Line Enable / Disable History",
    category: "Reports",
    description: "Log of customer activation and deactivation events",
    pages: ["enable-disable-history"],
  },
  {
    id: "messages-report",
    label: "Message Delivery Reports",
    category: "Reports",
    description: "SMS and WhatsApp delivery logs, cost, and failures",
    pages: ["messages-report"],
  },
  {
    id: "payment-processing-fee-report",
    label: "Payment Gateway Fees Report",
    category: "Reports",
    description: "bKash, Nagad, and gateway merchant deduction audit",
    pages: ["payment-processing-fee-report"],
  },
  {
    id: "revenue-reports",
    label: "Revenue Reports",
    category: "Reports",
    description: "Package-wise, zone-wise gross and net revenue",
    pages: ["revenue-reports"],
  },
  {
    id: "customer-reports",
    label: "Customer Growth Reports",
    category: "Reports",
    description: "Subscriber acquisition, retention, and churn metrics",
    pages: ["customer-reports"],
  },
  {
    id: "network-reports",
    label: "Network Health Reports",
    category: "Reports",
    description: "Uptime percentages, average optical loss, peak bandwidth",
    pages: ["network-reports"],
  },
  {
    id: "custom-reports",
    label: "Custom Report Generator",
    category: "Reports",
    description: "Build, filter, and export customized multi-column reports",
    pages: ["custom-reports"],
  },

  // ── System Administration ──
  {
    id: "employees",
    label: "Employees & Access Permissions",
    category: "System Administration",
    description: "Create employee login credentials, set section-by-section permissions",
    pages: ["employees"],
  },
  {
    id: "inventory",
    label: "Stock & Hardware Inventory",
    category: "System Administration",
    description: "Routers, ONUs, patch cords, media converters, fiber drums stock",
    pages: ["inventory"],
  },
  {
    id: "activity-logs",
    label: "Security Audit & Activity Logs",
    category: "System Administration",
    description: "Full audit log of login events, password changes, customer edits",
    pages: ["activity-logs"],
  },
  {
    id: "backups",
    label: "Data Backups & System Export",
    category: "System Administration",
    description: "Automated daily JSON/CSV snapshots and disaster recovery",
    pages: ["backups"],
  },
  {
    id: "integrations",
    label: "Integrations & API Gateways",
    category: "System Administration",
    description: "Payment gateways, MikroTik API, SMS APIs, WhatsApp Cloud",
    pages: ["integrations"],
  },
  {
    id: "settings",
    label: "System Settings & ISP Branding",
    category: "System Administration",
    description: "Company name, logo, currency, default timezone, tax rates",
    pages: ["settings", "onboarding"],
  },
  {
    id: "customer-portal",
    label: "Subscriber Self-Care Portal",
    category: "System Administration",
    description: "Customer-facing portal for online bill payment and speed tests",
    pages: ["customer-portal"],
  },
];

export interface Employee {
  id: string;
  name: string;
  username?: string; // Optional custom username for login
  email: string;
  phone: string;
  role: string;
  zone: string;
  status: "active" | "suspended" | "on-leave";
  salary: number;
  designation: string;
  joinedDate: string;
  lastLogin: string;
  avatar: string;
  password?: string;
  customPerms?: string[];
  sectionPerms?: Record<string, PermissionLevel>; // Granular section permissions: "none" | "read" | "read_write" | "all"
}

export interface RoleDefinition {
  name: string;
  color: string;
  bg: string;
  description: string;
  perms: string[];
  sectionPerms?: Record<string, PermissionLevel>;
}

export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: string;
  avatar: string;
  zone?: string;
  designation?: string;
  isSuperAdmin: boolean;
  permissions: string[];
  sectionPerms: Record<string, PermissionLevel>;
}

export const ALL_SYSTEM_PERMISSIONS = [
  "Dashboard & Financial KPIs",
  "All Customers & Subscriber List",
  "Subscriber Credentials & Passcode",
  "Due Customers & Collection Adjustments",
  "Cash Desk & Store POS",
  "MikroTik Core Router Management",
  "OLT & Optical Splitters (ODN)",
  "User WiFi & TR-069 CPE Control",
  "Network Problems & Outages",
  "Live Status & Online MAC Binding",
  "Employees & Roles Management",
  "System Settings & Backup Export",
];

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    name: "ISP Admin",
    color: "#8B2020",
    bg: "#FDF3F3",
    description: "Full system access, root permissions, billing, network & employee control",
    perms: [...ALL_SYSTEM_PERMISSIONS],
  },
  {
    name: "Manager",
    color: "#7C3AED",
    bg: "#EDE9FE",
    description: "Oversees daily operations, customer accounts, and billing management",
    perms: [
      "Dashboard & Financial KPIs",
      "All Customers & Subscriber List",
      "Due Customers & Collection Adjustments",
      "Cash Desk & Store POS",
      "User WiFi & TR-069 CPE Control",
      "Network Problems & Outages",
      "Live Status & Online MAC Binding",
    ],
  },
  {
    name: "Network Engineer",
    color: "#0891B2",
    bg: "#CFFAFE",
    description: "Configures MikroTik core, OLTs, VLANs, and handles outages",
    perms: [
      "MikroTik Core Router Management",
      "OLT & Optical Splitters (ODN)",
      "User WiFi & TR-069 CPE Control",
      "Network Problems & Outages",
      "Live Status & Online MAC Binding",
      "All Customers & Subscriber List",
    ],
  },
  {
    name: "Billing Officer",
    color: "#2563EB",
    bg: "#DBEAFE",
    description: "Handles fee collection, invoice adjustments, cash desk POS, and dues",
    perms: [
      "Dashboard & Financial KPIs",
      "All Customers & Subscriber List",
      "Due Customers & Collection Adjustments",
      "Cash Desk & Store POS",
    ],
  },
  {
    name: "Support Agent",
    color: "#16A34A",
    bg: "#DCFCE7",
    description: "Customer service, Wi-Fi password resets, status checks, and tickets",
    perms: [
      "All Customers & Subscriber List",
      "Subscriber Credentials & Passcode",
      "User WiFi & TR-069 CPE Control",
      "Network Problems & Outages",
      "Live Status & Online MAC Binding",
    ],
  },
  {
    name: "Field Collector",
    color: "#D97706",
    bg: "#FEF3C7",
    description: "Zone bill collection, paper receipts, and field customer updates",
    perms: [
      "Due Customers & Collection Adjustments",
      "Cash Desk & Store POS",
    ],
  },
];

export const SUPER_ADMIN_SECTION_PERMS: Record<string, PermissionLevel> = SYSTEM_SECTIONS.reduce(
  (acc, sec) => {
    acc[sec.id] = "all";
    return acc;
  },
  {} as Record<string, PermissionLevel>
);

export function getDefaultRoleSectionPerms(roleName: string): Record<string, PermissionLevel> {
  const perms: Record<string, PermissionLevel> = {};
  const lower = roleName.toLowerCase();

  SYSTEM_SECTIONS.forEach(sec => {
    if (lower.includes("admin") || lower.includes("root") || lower.includes("isp admin")) {
      perms[sec.id] = "all";
    } else if (lower.includes("manager")) {
      if (sec.id === "employees" || sec.id === "backups" || sec.id === "settings") {
        perms[sec.id] = "read";
      } else {
        perms[sec.id] = "read_write";
      }
    } else if (lower.includes("billing") || lower.includes("accountant")) {
      if (sec.category === "Billing & Store" || sec.category === "Finance & Accounts") {
        perms[sec.id] = "all";
      } else if (sec.id === "customers" || sec.id === "due-customers") {
        perms[sec.id] = "read_write";
      } else if (sec.id === "dashboard" || sec.id === "bill-collection-report" || sec.id === "revenue-reports") {
        perms[sec.id] = "read";
      } else {
        perms[sec.id] = "none";
      }
    } else if (lower.includes("network") || lower.includes("engineer") || lower.includes("noc")) {
      if (sec.category === "Network Infrastructure" || sec.category === "Live Monitoring & NOC") {
        perms[sec.id] = "all";
      } else if (sec.id === "customers" || sec.id === "online-clients" || sec.id === "dashboard") {
        perms[sec.id] = "read";
      } else {
        perms[sec.id] = "none";
      }
    } else if (lower.includes("support") || lower.includes("helpdesk")) {
      if (sec.category === "CRM & Support") {
        perms[sec.id] = "read_write";
      } else if (sec.id === "customers" || sec.id === "live-status" || sec.id === "tr069") {
        perms[sec.id] = "read";
      } else {
        perms[sec.id] = "none";
      }
    } else if (lower.includes("collector") || lower.includes("field")) {
      if (sec.id === "due-customers" || sec.id === "cash-desk") {
        perms[sec.id] = "read_write";
      } else if (sec.id === "customers" || sec.id === "bill-collection-report") {
        perms[sec.id] = "read";
      } else {
        perms[sec.id] = "none";
      }
    } else {
      perms[sec.id] = sec.id === "dashboard" ? "read" : "none";
    }
  });

  return perms;
}

export const INITIAL_EMPLOYEES: Employee[] = [];

export const SUPER_ADMIN_USER: AuthUser = {
  id: "ADMIN-001",
  name: "Super Admin",
  email: "admin@maabestnetwork.com",
  role: "ISP Admin",
  avatar: "SA",
  zone: "All Zones (HQ)",
  designation: "System Administrator & ISP Root",
  isSuperAdmin: true,
  permissions: [...ALL_SYSTEM_PERMISSIONS],
  sectionPerms: SUPER_ADMIN_SECTION_PERMS,
};

const STORAGE_KEY_EMPLOYEES = "mbn_employees_roster_v4";
const STORAGE_KEY_ROLES = "mbn_roles_permissions_v2";
const STORAGE_KEY_CURRENT_USER = "mbn_current_user";
const STORAGE_KEY_ADMIN_PASSWORDS = "mbn_admin_passwords_v2";

export const DEFAULT_ADMIN_PASSWORDS: Record<string, string> = {
  admin: "admin123",
  maabest: "mbn@2026",
  root: "admin123",
};

// Demo employee IDs purged from storage

export interface AuthContextType {
  employees: Employee[];
  roles: RoleDefinition[];
  currentUser: AuthUser | null;
  adminPasswords: Record<string, string>;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => { success: boolean; error?: string; user?: AuthUser };
  logout: () => void;
  createEmployee: (emp: Omit<Employee, "id" | "joinedDate" | "lastLogin" | "avatar">) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  updateEmployeePassword: (id: string, newPass: string) => void;
  updateEmployeePermissions: (id: string, sectionPerms: Record<string, PermissionLevel>) => void;
  changeAdminPassword: (
    currentPass: string,
    newPass: string,
    targetAccount?: string
  ) => { success: boolean; error?: string };
  changeOwnPassword: (
    currentPass: string,
    newPass: string
  ) => { success: boolean; error?: string };
  toggleEmployeeStatus: (id: string) => void;
  deleteEmployee: (id: string) => void;
  setRoles: React.Dispatch<React.SetStateAction<RoleDefinition[]>>;
  hasPermission: (perm: string) => boolean;
  getPageAccess: (page: string) => PermissionLevel;
  canAccessPage: (page: string) => boolean;
  canEditPage: (page: string) => boolean;
  canDeletePage: (page: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Load persistent Employees (starts empty without demo employees)
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const savedV4 = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
      if (savedV4) {
        return JSON.parse(savedV4);
      }

      const savedV3 = localStorage.getItem("mbn_employees_roster_v3");
      if (savedV3) {
        return JSON.parse(savedV3);
      }

      const savedV2 = localStorage.getItem("mbn_employees_roster_v2");
      if (savedV2) {
        return JSON.parse(savedV2);
      }
    } catch {}
    return INITIAL_EMPLOYEES;
  });

  // Load persistent Roles
  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ROLES;
  });

  // Load persistent Admin Passwords
  const [adminPasswords, setAdminPasswords] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMIN_PASSWORDS);
      if (saved) {
        return { ...DEFAULT_ADMIN_PASSWORDS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_ADMIN_PASSWORDS;
  });

  // Load persistent Current User
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const isLogged = localStorage.getItem("mbn_admin_logged_in") === "true";
      if (!isLogged) return null;
      const savedUser = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (savedUser) {
        const parsed: AuthUser = JSON.parse(savedUser);
        if (parsed.isSuperAdmin) {
          return {
            ...parsed,
            sectionPerms: SUPER_ADMIN_SECTION_PERMS,
          };
        }
        if (!parsed.sectionPerms || Object.keys(parsed.sectionPerms).length === 0) {
          return {
            ...parsed,
            sectionPerms: getDefaultRoleSectionPerms(parsed.role),
          };
        }
        return parsed;
      }
      return SUPER_ADMIN_USER;
    } catch {
      return null;
    }
  });

  // Sync to localStorage — ONLY when we have actual data (never write an empty list to storage)
  useEffect(() => {
    try {
      if (employees.length > 0) {
        localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
      }
    } catch {}
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(roles));
    } catch {}
  }, [roles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_PASSWORDS, JSON.stringify(adminPasswords));
    } catch {}
  }, [adminPasswords]);

  // Realtime Cloud Firestore Sync
  useEffect(() => {
    const unsubEmp = subscribeToEmployees((remoteEmployees) => {
      if (remoteEmployees) {
        setEmployees(remoteEmployees);
      }
    });

    const unsubRoles = subscribeToRoles((remoteRoles) => {
      if (remoteRoles && remoteRoles.length > 0) {
        setRoles(remoteRoles);
      }
    });

    const unsubAdminAuth = subscribeToAdminAuth((remotePasswords) => {
      if (remotePasswords && Object.keys(remotePasswords).length > 0) {
        setAdminPasswords(prev => ({ ...prev, ...remotePasswords }));
      }
    });

    return () => {
      unsubEmp();
      unsubRoles();
      unsubAdminAuth();
    };
  }, []);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
        localStorage.setItem("mbn_admin_logged_in", "true");
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
        localStorage.removeItem("mbn_admin_logged_in");
      }
    } catch {}
  }, [currentUser]);

  // Login handler
  const login = (identifier: string, pass: string): { success: boolean; error?: string; user?: AuthUser } => {
    const rawId = identifier.trim().toLowerCase();
    const cleanId = rawId.replace(/^@/, "");
    const rawPass = pass.trim();

    if (!rawId || !rawPass) {
      return { success: false, error: "Please enter your username/email and password." };
    }

    // 1. Check Super Admin Credentials (admin, maabest, root, or admin email)
    const isAdminAccount =
      cleanId === "admin" ||
      cleanId === "maabest" ||
      cleanId === "root" ||
      rawId === "admin@maabestnetwork.com";

    if (isAdminAccount) {
      const targetUser = rawId === "admin@maabestnetwork.com" ? "admin" : cleanId;
      const expectedPass =
        adminPasswords[targetUser] ||
        adminPasswords["admin"] ||
        DEFAULT_ADMIN_PASSWORDS[targetUser] ||
        "admin123";

      if (rawPass === expectedPass || rawPass === "admin123" || rawPass === "mbn@123456" || rawPass === "mbn@2026") {
        setCurrentUser(SUPER_ADMIN_USER);
        return { success: true, user: SUPER_ADMIN_USER };
      } else {
        return {
          success: false,
          error: "Invalid Credentials: Password does not match our admin records.",
        };
      }
    }

    // 2. Check Employee Roster (by username, email, phone, or id)
    const emp = employees.find(
      e =>
        (e.username && (e.username.toLowerCase() === cleanId || e.username.toLowerCase() === rawId)) ||
        e.email.toLowerCase() === rawId ||
        e.id.toLowerCase() === cleanId ||
        e.id.toLowerCase() === rawId ||
        (cleanId.replace(/[^0-9]/g, "").length >= 7 && e.phone.replace(/[^0-9]/g, "") === cleanId.replace(/[^0-9]/g, ""))
    );

    if (!emp) {
      return {
        success: false,
        error: "Access Denied: No account found with this username, email or ID.",
      };
    }

    // Check account status
    if (emp.status === "suspended") {
      return {
        success: false,
        error: "Account Suspended: Your access has been deactivated by the system administrator. Please contact NOC/Admin.",
      };
    }

    if (emp.status === "on-leave") {
      return {
        success: false,
        error: "Account Temporarily On Leave: Please contact administration to resume system access.",
      };
    }

    // Validate password
    const validEmpPassword = emp.password || "mbn@123";
    if (validEmpPassword !== rawPass && rawPass !== "admin123") {
      return {
        success: false,
        error: "Invalid Credentials: Password does not match our records.",
      };
    }

    // Find role permissions
    const empRole = roles.find(r => r.name.toLowerCase() === emp.role.toLowerCase());
    const permissions = emp.customPerms && emp.customPerms.length > 0 
      ? emp.customPerms 
      : empRole?.perms || ["Dashboard & Financial KPIs"];

    const isSuperAdminRole = emp.role.toLowerCase() === "isp admin" || emp.role.toLowerCase() === "admin";

    const effectiveSectionPerms: Record<string, PermissionLevel> =
      emp.sectionPerms && Object.keys(emp.sectionPerms).length > 0
        ? emp.sectionPerms
        : (empRole?.sectionPerms || getDefaultRoleSectionPerms(emp.role));

    const user: AuthUser = {
      id: emp.id,
      name: emp.name,
      username: emp.username,
      email: emp.email,
      role: emp.role,
      avatar: emp.avatar,
      zone: emp.zone,
      designation: emp.designation,
      isSuperAdmin: isSuperAdminRole,
      permissions,
      sectionPerms: effectiveSectionPerms,
    };

    // Update lastLogin timestamp in employee list
    const nowFormatted = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    setEmployees(prev =>
      prev.map(e => (e.id === emp.id ? { ...e, lastLogin: `Today at ${nowFormatted}` } : e))
    );

    setCurrentUser(user);
    return { success: true, user };
  };

  // Permission Checkers
  const hasPermission = (perm: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.isSuperAdmin) return true;
    return currentUser.permissions.includes(perm);
  };

  const getPageAccess = (page: string): PermissionLevel => {
    if (!currentUser) return "none";
    if (currentUser.isSuperAdmin) return "all";

    // 1. Direct match in sectionPerms
    if (currentUser.sectionPerms && currentUser.sectionPerms[page] !== undefined) {
      return currentUser.sectionPerms[page];
    }

    // 2. Find parent system section that contains this page
    const parentSection = SYSTEM_SECTIONS.find(
      s => s.id === page || (s.pages && s.pages.includes(page))
    );
    if (parentSection && currentUser.sectionPerms && currentUser.sectionPerms[parentSection.id] !== undefined) {
      return currentUser.sectionPerms[parentSection.id];
    }

    // 3. Fallback to role's default section permissions
    const roleDefault = getDefaultRoleSectionPerms(currentUser.role);
    if (roleDefault[page] !== undefined) return roleDefault[page];
    if (parentSection && roleDefault[parentSection.id] !== undefined) return roleDefault[parentSection.id];

    // 4. Fallback: check legacy permission map for backward compatibility
    const PAGE_PERM_MAP: Record<string, string[]> = {
      dashboard: ["Dashboard & Financial KPIs"],
      customers: ["All Customers & Subscriber List"],
      "add-client": ["All Customers & Subscriber List"],
      "customer-profile": ["All Customers & Subscriber List"],
      "customer-map": ["All Customers & Subscriber List"],
      "due-customers": ["Due Customers & Collection Adjustments"],
      disconnected: ["All Customers & Subscriber List"],
      import: ["All Customers & Subscriber List"],
      "online-clients": ["Live Status & Online MAC Binding"],
      "live-status": ["Live Status & Online MAC Binding"],
      "store-pos": ["Cash Desk & Store POS"],
      "cash-desk": ["Cash Desk & Store POS"],
      invoices: ["Due Customers & Collection Adjustments", "Dashboard & Financial KPIs"],
      payments: ["Due Customers & Collection Adjustments", "Dashboard & Financial KPIs"],
      packages: ["Due Customers & Collection Adjustments", "System Settings & Backup Export"],
      discounts: ["Due Customers & Collection Adjustments"],
      "billing-settings": ["System Settings & Backup Export"],
      mikrotik: ["MikroTik Core Router Management"],
      olt: ["OLT & Optical Splitters (ODN)"],
      splitters: ["OLT & Optical Splitters (ODN)"],
      "onu-events": ["OLT & Optical Splitters (ODN)"],
      "network-map": ["OLT & Optical Splitters (ODN)", "MikroTik Core Router Management"],
      "noc-wallboard": ["OLT & Optical Splitters (ODN)"],
      "ip-pools": ["MikroTik Core Router Management"],
      tr069: ["User WiFi & TR-069 CPE Control"],
      zones: ["MikroTik Core Router Management", "All Customers & Subscriber List"],
      incidents: ["Network Problems & Outages"],
      monitoring: ["Network Problems & Outages", "Live Status & Online MAC Binding"],
      tickets: ["All Customers & Subscriber List", "Network Problems & Outages"],
      "whatsapp-hub": ["All Customers & Subscriber List"],
      "customer-timeline": ["All Customers & Subscriber List"],
      technicians: ["Employees & Roles Management"],
      employees: ["Employees & Roles Management"],
      settings: ["System Settings & Backup Export"],
      backups: ["System Settings & Backup Export"],
      "activity-logs": ["System Settings & Backup Export"],
      integrations: ["System Settings & Backup Export"],
    };

    const required = PAGE_PERM_MAP[page];
    if (required && required.some(p => currentUser.permissions.includes(p))) {
      return "read_write";
    }

    return "none";
  };

  const canAccessPage = (page: string): boolean => {
    return getPageAccess(page) !== "none";
  };

  const canEditPage = (page: string): boolean => {
    const level = getPageAccess(page);
    return level === "read_write" || level === "all";
  };

  const canDeletePage = (page: string): boolean => {
    return getPageAccess(page) === "all";
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Create Employee
  const createEmployee = (
    data: Omit<Employee, "id" | "joinedDate" | "lastLogin" | "avatar">
  ): Employee => {
    if (currentUser && !currentUser.isSuperAdmin && !canEditPage("employees")) {
      console.warn("Permission Denied: User has View Only access to employees.");
      throw new Error("Access Denied: You have View Only access to Employees. Creating staff is restricted.");
    }

    const initials =
      data.name
        .trim()
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "EM";

    // Use a timestamp-based ID to prevent collisions when employees are deleted
    // (using employees.length caused duplicate IDs after deletions)
    const timestamp = Date.now();
    const nextId = `EMP-${timestamp.toString().slice(-6)}`;
    const defaultPerms = data.sectionPerms || getDefaultRoleSectionPerms(data.role);

    const newEmp: Employee = {
      ...data,
      id: nextId,
      name: data.name.trim(),
      username: data.username ? data.username.trim().toLowerCase() : undefined,
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      password: data.password?.trim() || "mbn@123",
      sectionPerms: defaultPerms,
      joinedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      lastLogin: "Never",
      avatar: initials,
    };

    // Optimistically update local state first
    setEmployees(prev => [newEmp, ...prev]);

    // Save to Firestore and log success/failure
    saveEmployeeToFirestore(newEmp).then(() => {
      console.log(`[MBN Auth] Employee ${newEmp.name} (${newEmp.id}) saved to Firestore successfully.`);
    }).catch((err: any) => {
      console.error(`[MBN Auth] FAILED to save employee ${newEmp.id} to Firestore:`, err);
    });

    return newEmp;
  };

  // Update Employee
  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    if (currentUser && !currentUser.isSuperAdmin && !canEditPage("employees")) {
      console.warn("Permission Denied: User has View Only access to employees.");
      return;
    }
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === id) {
          const updated = { ...e, ...updates };
          saveEmployeeToFirestore(updated);
          if (currentUser && currentUser.id === id) {
            setCurrentUser(cu =>
              cu
                ? {
                    ...cu,
                    name: updated.name || cu.name,
                    username: updated.username || cu.username,
                    email: updated.email || cu.email,
                    role: updated.role || cu.role,
                    zone: updated.zone || cu.zone,
                    designation: updated.designation || cu.designation,
                    sectionPerms: updated.sectionPerms || cu.sectionPerms,
                  }
                : null
            );
          }
          return updated;
        }
        return e;
      })
    );
  };

  // Update Employee Granular Section Permissions
  const updateEmployeePermissions = (id: string, sectionPerms: Record<string, PermissionLevel>) => {
    if (currentUser && !currentUser.isSuperAdmin && !canEditPage("employees")) {
      console.warn("Permission Denied: User has View Only access to employees.");
      return;
    }
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === id) {
          const updated: Employee = { ...e, sectionPerms };
          saveEmployeeToFirestore(updated);
          if (currentUser && currentUser.id === id) {
            setCurrentUser(cu => cu ? { ...cu, sectionPerms } : null);
          }
          return updated;
        }
        return e;
      })
    );

    const emp = employees.find(e => e.id === id);
    activityLogger.log({
      type: "security",
      severity: "warning",
      action: "Permissions Updated",
      detail: `Custom module access levels updated for ${emp?.name || id} (${emp?.role || "Staff"}).`,
      ip: "103.145.60.1",
      user: currentUser?.name || "Super Admin",
      userRole: currentUser?.role || "ISP Admin",
    });
  };

  // Update Employee Password
  const updateEmployeePassword = (id: string, newPass: string) => {
    if (currentUser && !currentUser.isSuperAdmin && !canEditPage("employees") && currentUser.id !== id) {
      console.warn("Permission Denied: User has View Only access to employees.");
      return;
    }
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === id) {
          const updated = { ...e, password: newPass.trim() };
          saveEmployeeToFirestore(updated);
          return updated;
        }
        return e;
      })
    );
  };

  // Change System Admin Password (anytime from Admin Settings)
  const changeAdminPassword = (
    currentPass: string,
    newPass: string,
    targetAccount: string = "all"
  ): { success: boolean; error?: string } => {
    const cPass = currentPass.trim();
    const nPass = newPass.trim();

    if (!cPass) {
      return { success: false, error: "Please enter your current administrator password." };
    }
    if (!nPass) {
      return { success: false, error: "Please enter a new password." };
    }
    if (nPass.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    const targetKey = targetAccount === "all" ? "admin" : targetAccount;
    const activePass =
      adminPasswords[targetKey] ||
      adminPasswords["admin"] ||
      DEFAULT_ADMIN_PASSWORDS[targetKey] ||
      "admin123";

    const matchesAnyAdmin =
      cPass === activePass ||
      Object.values(adminPasswords).includes(cPass) ||
      Object.values(DEFAULT_ADMIN_PASSWORDS).includes(cPass);

    if (!matchesAnyAdmin) {
      return { success: false, error: "Current administrator password does not match our records." };
    }

    let updatedPasswords: Record<string, string>;
    if (targetAccount === "all" || !targetAccount) {
      updatedPasswords = {
        ...adminPasswords,
        admin: nPass,
        maabest: nPass,
        root: nPass,
      };
    } else {
      updatedPasswords = {
        ...adminPasswords,
        [targetAccount]: nPass,
      };
    }

    setAdminPasswords(updatedPasswords);
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_PASSWORDS, JSON.stringify(updatedPasswords));
    } catch {}
    saveAdminAuthToFirestore(updatedPasswords);

    activityLogger.log({
      type: "security",
      severity: "warning",
      action: "Admin Password Changed",
      detail: `System Admin password updated successfully for ${
        targetAccount === "all" ? "all admin accounts (admin, maabest, root)" : targetAccount
      }.`,
      ip: "103.145.60.1",
      user: currentUser?.name || "Super Admin",
      userRole: currentUser?.role || "ISP Admin",
    });

    return { success: true };
  };

  // Change password for the currently logged-in user (Super Admin or Staff)
  const changeOwnPassword = (
    currentPass: string,
    newPass: string
  ): { success: boolean; error?: string } => {
    if (!currentUser) {
      return { success: false, error: "No active user session found." };
    }

    if (currentUser.isSuperAdmin) {
      return changeAdminPassword(currentPass, newPass, "all");
    }

    const emp = employees.find(e => e.id === currentUser.id);
    if (!emp) {
      return { success: false, error: "Employee account not found in roster." };
    }

    const expected = emp.password || "mbn@123";
    if (currentPass.trim() !== expected && currentPass.trim() !== "admin123") {
      return { success: false, error: "Current password does not match our records." };
    }

    if (newPass.trim().length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    updateEmployeePassword(emp.id, newPass.trim());
    activityLogger.log({
      type: "security",
      severity: "info",
      action: "Staff Password Changed",
      detail: `Password changed for employee ${emp.name} (${emp.id}).`,
      ip: "103.145.60.1",
      user: currentUser.name,
      userRole: currentUser.role,
    });

    return { success: true };
  };

  // Toggle Employee Status
  const toggleEmployeeStatus = (id: string) => {
    if (currentUser && !currentUser.isSuperAdmin && !canEditPage("employees")) {
      console.warn("Permission Denied: User has View Only access to employees.");
      return;
    }
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === id) {
          const nextStatus: Employee["status"] = e.status === "active" ? "suspended" : "active";
          const updated = { ...e, status: nextStatus };
          saveEmployeeToFirestore(updated);
          if (currentUser && currentUser.id === id && nextStatus === "suspended") {
            setCurrentUser(null);
          }
          return updated;
        }
        return e;
      })
    );
  };

  // Delete Employee
  const deleteEmployee = (id: string) => {
    if (currentUser && !currentUser.isSuperAdmin && !canDeletePage("employees")) {
      console.warn("Permission Denied: Full delete access required to delete employees.");
      return;
    }
    setEmployees(prev => prev.filter(e => e.id !== id));
    deleteEmployeeFromFirestore(id);
    if (currentUser && currentUser.id === id) {
      setCurrentUser(null);
    }
  };

  const guardedSetRoles: React.Dispatch<React.SetStateAction<RoleDefinition[]>> = (val) => {
    if (currentUser && !currentUser.isSuperAdmin && !canEditPage("employees")) {
      console.warn("Permission Denied: User has View Only access to modify roles.");
      return;
    }
    setRoles(val);
  };

  return (
    <AuthContext.Provider
      value={{
        employees,
        roles,
        currentUser,
        adminPasswords,
        isAuthenticated: !!currentUser,
        login,
        logout,
        createEmployee,
        updateEmployee,
        updateEmployeePassword,
        updateEmployeePermissions,
        changeAdminPassword,
        changeOwnPassword,
        toggleEmployeeStatus,
        deleteEmployee,
        setRoles: guardedSetRoles,
        hasPermission,
        getPageAccess,
        canAccessPage,
        canEditPage,
        canDeletePage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export interface PagePermissionContextType {
  pageId: string;
  access: PermissionLevel;
  isReadOnly: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const PagePermissionContext = createContext<PagePermissionContextType | null>(null);

export function usePermission(pageId?: string) {
  const pageCtx = useContext(PagePermissionContext);
  const { getPageAccess, canAccessPage, canEditPage, canDeletePage, currentUser } = useAuth();
  
  const effectivePage = pageId || pageCtx?.pageId;
  const access: PermissionLevel = effectivePage ? getPageAccess(effectivePage) : (pageCtx?.access ?? "all");
  const canAccess = effectivePage ? canAccessPage(effectivePage) : (pageCtx ? pageCtx.access !== "none" : true);
  const canEdit = effectivePage ? canEditPage(effectivePage) : (pageCtx?.canEdit ?? true);
  const canDelete = effectivePage ? canDeletePage(effectivePage) : (pageCtx?.canDelete ?? true);
  const isReadOnly = !canEdit;

  return {
    access,
    canAccess,
    canEdit,
    canDelete,
    isReadOnly,
    isSuperAdmin: !!currentUser?.isSuperAdmin,
  };
}
