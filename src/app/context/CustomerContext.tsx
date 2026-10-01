import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  subscribeToCustomers,
  subscribeToUpgradeRequests,
  subscribeToDeletedCustomers,
  saveCustomerToFirestore,
  saveDeletedCustomerToFirestore,
  purgeDeletedCustomerFromFirestore,
  saveCustomersBatchToFirestore,
  saveUpgradeRequestToFirestore,
  seedInitialFirestoreDataIfEmpty,
  deleteCustomerFromFirestore
} from "../../lib/firestoreService";
import { activityLogger } from "../services/activityLogger";

export type CustomerStatus = "active" | "offline" | "due" | "suspended" | "disconnected";

export interface Invoice {
  id: string;
  month: string;
  amount: number;
  dueDate: string;
  paidDate?: string | null;
  status: "paid" | "due" | "overdue";
  paymentMethod?: string | null;
  trxId?: string | null;
}

export interface PaymentTransaction {
  id: string;
  date: string;
  amount: number;
  method: "bKash" | "Nagad" | "Rocket" | "Upay" | "Card" | "Cash";
  trxId: string;
  status: "verified" | "pending";
  collectedBy: string;
  invoiceId: string;
}

export interface Customer {
  id: string; // User ID / Customer ID, e.g. CUST-10001
  passcode: string; // Default portal passcode, e.g. isp@10001
  clientCode?: string; // e.g. MBN0007, MBN0008
  name: string;
  phone: string;
  phone2?: string;
  email: string;
  address: string;
  roadNo?: string;
  houseNo?: string;
  district?: string;
  upazila?: string;
  gender?: "Male" | "Female" | "Other";
  occupation?: string;
  facebookLink?: string;
  remarks?: string;
  nidNo?: string;
  regFormNo?: string;
  dob?: string;
  zone: string;
  subzone: string;
  box?: string;
  tjBox?: string;
  connectionType?: "Optical Fiber" | "Cat6" | "Wireless" | "Coaxial" | "UTP";
  connectivityType?: string;
  serverName?: string; // e.g. RETAIL_1, MikroTik-01
  profile?: string; // e.g. PIONEER_HOME_20Mbps
  service?: "pppoe" | "hotspot" | "static";
  package: string;
  speed: string; // e.g. "50/25" (Download/Upload Mbps)
  downloadSpeedMbps: number;
  uploadSpeedMbps: number;
  price: number;
  monthlyBill?: number;
  status: CustomerStatus;
  netStatus: "online" | "offline";
  duration?: string; // e.g. "0d:1h:2m:51s"
  logoutTime?: string | null; // e.g. "28/08/2026 10:30:06 PM"
  disconnectedAt?: string | null; // ISO timestamp or epoch for offline duration
  billingDate: number;
  startDate: string; // e.g. "10 Aug 2026"
  endDate: string; // e.g. "10 Sep 2026"
  daysRemaining: number;
  dueAmount: number;
  due?: number;
  ipAddress: string;
  mac: string;
  macBound?: boolean;
  boundMac?: string;
  callingStationId?: string;
  macBindDate?: string;
  pppUser: string;
  pppPass: string;
  mikrotik: string;
  olt: string;
  onuSignal: string; // e.g. "-18.4 dBm"
  sessionUptime: string; // e.g. "14d 6h 22m"
  monthlyUsageGB: number; // e.g. 412.8
  joinDate: string;
  clientType?: "Home" | "Commercial" | "Reseller" | "Corporate";
  billingStatus?: "Prepaid" | "Postpaid" | "Daily" | "Monthly";
  billingStartMonth?: string;
  expireDate?: string;
  graceDays?: number; // Number of bonus / grace days granted without changing the base billing cycle
  graceExpiryDate?: string; // Date until which internet access is granted under grace (e.g. "04 Nov 2026")
  cableMetre?: number | string;
  fiberCode?: string;
  coreNumber?: number | string;
  coreColor?: string;
  deviceType?: string;
  deviceSerial?: string;
  deviceVendor?: string;
  purchaseDate?: string;
  splitterBox?: string;
  splitterPort?: string;
  splitterRatio?: string;
  ponPort?: string;
  protocolType?: string;
  userType?: "normal" | "free" | "unlimited";
  disabledInMikrotik?: boolean;
  disabledInSystem?: boolean;
  profileMismatch?: boolean;
  createdAt?: number; // Epoch ms timestamp when account was provisioned (grace period protection)
  updatedAt?: number; // Epoch ms timestamp when account was modified by admin
  deletedAt?: string;
  deletedDate?: string;
  deletedBy?: string;
  deletionReason?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  invoices: Invoice[];
  paymentHistory: PaymentTransaction[];
}

const MONTH_NAMES_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Safely parse date strings supporting DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY, and standard formats.
 * Prevents V8 from misinterpreting DD/MM/YYYY as MM/DD/YYYY (e.g. 01/11/2026 being parsed as Jan 11 instead of Nov 1).
 * Sets end-of-day (23:59:59) so subscribers retain access throughout the entire final expiry date.
 */
export function parseSafeDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || dateStr === "Permanent / Lifetime" || dateStr === "—") return null;
  const str = String(dateStr).trim();

  // Pattern: "30 Oct 2026", "01-October-2026", "30-Oct-2026"
  const namedMatch = str.match(/^(\d{1,2})[\s\-]+([a-zA-Z]+)[\s\-]+(\d{4})(.*)$/);
  if (namedMatch) {
    const day = parseInt(namedMatch[1], 10);
    const monthKey = namedMatch[2].toLowerCase();
    const month = MONTH_NAMES_MAP[monthKey];
    const year = parseInt(namedMatch[3], 10);
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day, 23, 59, 59, 999);
    }
  }

  // Pattern: "DD/MM/YYYY" or "DD-MM-YYYY"
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    return new Date(year, month, day, 23, 59, 59, 999);
  }

  // Pattern: "YYYY-MM-DD" or "YYYY/MM/DD"
  const yyyymmdd = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (yyyymmdd) {
    const year = parseInt(yyyymmdd[1], 10);
    const month = parseInt(yyyymmdd[2], 10) - 1;
    const day = parseInt(yyyymmdd[3], 10);
    return new Date(year, month, day, 23, 59, 59, 999);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

import { REAL_ISP_CUSTOMERS } from "../data/realIspData";
import { splitterStore } from "../data/splitterData";

export const INITIAL_CUSTOMERS: Customer[] = REAL_ISP_CUSTOMERS.map(c => ({
  ...c,
  userType: (c as any).userType || "normal",
  macBound: c.macBound !== undefined ? c.macBound : Boolean(c.mac && c.mac.trim()),
  boundMac: c.boundMac || c.mac || undefined,
  callingStationId: c.callingStationId || c.mac || undefined,
}));

export interface PlanUpgradeRequest {
  id: string; // e.g. "REQ-1001"
  customerId: string;
  customerName: string;
  phone: string;
  currentPackage: string;
  currentPrice: number;
  requestedPackage: string;
  requestedSpeed: string;
  requestedPrice: number;
  priceDifference: number;
  status: "pending" | "approved" | "rejected";
  requestDate: string;
  notes?: string;
  userNote?: string;
  adminResponseDate?: string;
  rejectionReason?: string;
}

export const INITIAL_UPGRADE_REQUESTS: PlanUpgradeRequest[] = [];

interface CustomerContextType {
  bulkUpdateStatus: (customerIds: string[], newStatus: CustomerStatus, newNetStatus: "online" | "offline") => void;
  grantExtraDays: (customerId: string, extraDays: number) => void;
  bindMac: (customerId: string, macAddress?: string) => { success: boolean; mac: string };
  unbindMac: (customerId: string) => { success: boolean };
  setUserType: (customerId: string, userType: "normal" | "free" | "unlimited") => void;
  bulkSetUserType: (customerIds: string[], userType: "normal" | "free" | "unlimited") => void;

  customers: Customer[];
  deletedCustomers: Customer[];
  activeCustomer: Customer | null;
  upgradeRequests: PlanUpgradeRequest[];
  setActiveCustomer: (customer: Customer | null) => void;
  loginAsCustomer: (identifier: string, passcode?: string) => { success: boolean; customer?: Customer; error?: string };
  logoutCustomer: () => void;
  addCustomer: (newCustomer: Partial<Customer>) => Customer;
  addCustomerAsync: (newCustomer: Partial<Customer>) => Promise<{ success: boolean; customer: Customer; error?: string; alreadyExists?: boolean }>;
  addCustomersBulk: (newCustomers: Partial<Customer>[]) => Customer[];
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string, reason?: string) => void;
  restoreCustomer: (id: string) => void;
  permanentlyPurgeCustomer: (id: string) => void;
  toggleNetStatus: (id: string, enable: boolean) => void;
  processPayment: (
    customerId: string,
    amount: number,
    method?: PaymentTransaction["method"],
    trxId?: string,
    customPaymentDate?: Date
  ) => { success: boolean; trxId: string; invoiceId: string; startDate: string; endDate: string };
  generateDefaultPasscode: (customerId: string) => string;
  changePackage: (customerId: string, newPackage: string, newSpeed: string, newPrice: number) => void;
  submitUpgradeRequest: (
    customerId: string,
    requestedPackage: string,
    requestedSpeed: string,
    requestedPrice: number,
    notes?: string
  ) => PlanUpgradeRequest;
  approveUpgradeRequest: (requestId: string) => { success: boolean; request?: PlanUpgradeRequest };
  rejectUpgradeRequest: (requestId: string, reason?: string) => { success: boolean; request?: PlanUpgradeRequest };
  runBillingCutoffEngine: () => number;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const CUSTOMERS_STORAGE_KEY = "isp_customers_store_v16_authentic_mikrotik_packages";
const DELETED_CUSTOMERS_STORAGE_KEY = "isp_deleted_customers_archive_v1";

export function normalizeCustomerPackage(c: Customer): Customer {
  // ── PACKAGE NORMALIZATION ─────────────────────────────────────────────────
  // CRITICAL: Only migrate truly legacy/empty packages. NEVER overwrite 
  // packages that were set by the admin or synced from MikroTik/NetX.
  // This preserves user edits and prevents reverting to defaults.
  const isOldPkg = !c.package || c.package === "20Mbps" || c.package === "10 Mbps Basic" || c.package.includes("PIONEER");
  const pkg = isOldPkg ? "35M" : c.package;
  const prof = isOldPkg ? "35M" : (c.profile || c.package || "35M");

  // Only derive speed/download/upload if they are missing or if we migrated from an old package
  const knownPkgSpeeds: Record<string, { down: number; up: number }> = {
    "35M": { down: 35, up: 35 },
    "50M": { down: 50, up: 50 },
    "80M": { down: 80, up: 80 },
    "100M": { down: 100, up: 100 },
    "10 Mbps": { down: 10, up: 10 },
  };
  const knownSpeed = knownPkgSpeeds[pkg];
  const speed = c.speed && !isOldPkg ? c.speed : (knownSpeed ? `${knownSpeed.down}/${knownSpeed.up}` : (c.speed || "35/35"));
  const down = c.downloadSpeedMbps && !isOldPkg ? c.downloadSpeedMbps : (knownSpeed?.down || c.downloadSpeedMbps || 35);
  const up = c.uploadSpeedMbps && !isOldPkg ? c.uploadSpeedMbps : (knownSpeed?.up || c.uploadSpeedMbps || 35);

  const signal = (c.onuSignal === "-18.5 dBm" || c.onuSignal?.toLowerCase() === "offline") ? "—" : (c.onuSignal || "—");

  // ── STALE-DATE MIGRATION (runs for every customer from every source) ──────
  // If endDate is expired but dueAmount is 0 (paid up), the date is stale data
  // (e.g. hardcoded "30 Sep 2026" in realIspData.ts). Auto-extend to today+30
  // so the billing engine never suspends paid-up customers due to old dates.
  let endDate = c.endDate;
  let expireDate = c.expireDate;
  let daysRemaining = c.daysRemaining;
  if (
    c.userType !== "free" && c.userType !== "unlimited" &&
    endDate && endDate !== "Permanent / Lifetime"
  ) {
    const end = parseSafeDate(endDate);
    if (end && !isNaN(end.getTime())) {
      const rawDue = (c.dueAmount ?? c.due ?? 0);
      const diffDays = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0 && rawDue === 0 && c.status !== "suspended" && c.disabledInSystem !== true) {
        // Extend stale expired date to today+30
        const newEnd = new Date();
        newEnd.setMonth(newEnd.getMonth() + 1);
        endDate = newEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        expireDate = endDate;
        daysRemaining = 30;
      } else {
        daysRemaining = diffDays;
      }
    }
  }

  return {
    ...c,
    package: pkg,
    profile: prof,
    speed,
    downloadSpeedMbps: down,
    uploadSpeedMbps: up,
    // CRITICAL: Preserve existing price/monthlyBill/serverName — only fill if missing (never overwrite 0 for free tier)
    price: typeof c.price === "number" ? c.price : (c.userType === "free" ? 0 : 500),
    monthlyBill: typeof c.monthlyBill === "number" ? c.monthlyBill : (typeof c.price === "number" ? c.price : (c.userType === "free" ? 0 : 500)),
    serverName: c.serverName || "DC-CA",
    onuSignal: signal,
    endDate,
    expireDate,
    daysRemaining,
  };
}

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [deletedCustomers, setDeletedCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(DELETED_CUSTOMERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      // Purge old cache keys
      localStorage.removeItem("isp_customers_store_v14_authentic_194_fixed");
      localStorage.removeItem("isp_customers_store_v13_live_laser_and_synced");
      localStorage.removeItem("isp_customers_store_v12_authentic_194_subscribers");
      localStorage.removeItem("isp_customers_store_v11_authentic_netx_macs");
      localStorage.removeItem("isp_customers_store_v10");
      localStorage.removeItem("isp_customers_store_v9");

      let delSaved: any[] = [];
      try {
        delSaved = JSON.parse(localStorage.getItem(DELETED_CUSTOMERS_STORAGE_KEY) || "[]");
      } catch {
        delSaved = [];
      }
      const delSet = new Set<string>();
      if (Array.isArray(delSaved)) {
        delSaved.forEach((d: any) => {
          if (d?.id) delSet.add(String(d.id).toLowerCase());
          if (d?.clientCode) delSet.add(String(d.clientCode).toLowerCase());
          if (d?.pppUser) delSet.add(String(d.pppUser).toLowerCase());
        });
      }

      const saved = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed
            .filter((c: any) => c && c.id && !c.id.toLowerCase().includes("test") && !(c.name && c.name.toLowerCase().includes("test")))
            .filter((c: any) => !delSet.has((c.id || "").toLowerCase()) && !(c.clientCode && delSet.has(c.clientCode.toLowerCase())) && !(c.pppUser && delSet.has(c.pppUser.toLowerCase())))
            .map((c: any) => normalizeCustomerPackage(c));

          if (clean.length > 0) return clean;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOMERS.map(c => normalizeCustomerPackage(c));
  });

  const [upgradeRequests, setUpgradeRequests] = useState<PlanUpgradeRequest[]>(() => {
    try {
      const saved = localStorage.getItem("isp_upgrade_requests_store_v9_mbn_passcodes");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_UPGRADE_REQUESTS;
  });

  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("isp_active_customer_id") || "MBN0001";
    } catch {
      return "MBN0001";
    }
  });

  // ── Cloud Firestore Realtime Sync ──
  useEffect(() => {
    // 1. Ensure initial customer roster is present in Cloud Firestore in background
    seedInitialFirestoreDataIfEmpty(INITIAL_CUSTOMERS, INITIAL_UPGRADE_REQUESTS);

    // 2. Subscribe to realtime updates for deleted customers archive
    const unsubDeleted = subscribeToDeletedCustomers(cloudDeleted => {
      if (Array.isArray(cloudDeleted) && cloudDeleted.length > 0) {
        setDeletedCustomers(prev => {
          const map = new Map<string, Customer>();
          prev.forEach(d => map.set(d.id, d));
          cloudDeleted.forEach(d => map.set(d.id, d));
          const list = Array.from(map.values());
          try {
            localStorage.setItem(DELETED_CUSTOMERS_STORAGE_KEY, JSON.stringify(list));
          } catch (e) {
            console.error(e);
          }
          return list;
        });
      }
    });

    // 3. Subscribe to realtime updates for active customers
    const unsubCustomers = subscribeToCustomers(cloudCustomers => {
      if (cloudCustomers && cloudCustomers.length > 0) {
        let delSaved: any[] = [];
        try {
          delSaved = JSON.parse(localStorage.getItem(DELETED_CUSTOMERS_STORAGE_KEY) || "[]");
        } catch {
          delSaved = [];
        }
        const delSet = new Set<string>();
        if (Array.isArray(delSaved)) {
          delSaved.forEach((d: any) => {
            if (d?.id) delSet.add(String(d.id).toLowerCase());
            if (d?.clientCode) delSet.add(String(d.clientCode).toLowerCase());
            if (d?.pppUser) delSet.add(String(d.pppUser).toLowerCase());
          });
        }

        const clean = cloudCustomers
          .filter(c => c && c.id && !c.id.toLowerCase().includes("test") && !(c.name && c.name.toLowerCase().includes("test")))
          .filter(c => !delSet.has((c.id || "").toLowerCase()) && !(c.clientCode && delSet.has(c.clientCode.toLowerCase())) && !(c.pppUser && delSet.has(c.pppUser.toLowerCase())));

        if (clean.length > 0) {
          const refreshed = clean.map(c => normalizeCustomerPackage(c));

          setCustomers(prev => {
            const merged = refreshed.map(cloudCust => {
              const local = prev.find(p =>
                p.id === cloudCust.id ||
                p.clientCode === cloudCust.clientCode ||
                (p.pppUser && p.pppUser === cloudCust.pppUser)
              );
              if (!local) return cloudCust;

              const localEndDate = parseSafeDate(local.endDate);
              const cloudEndDate = parseSafeDate(cloudCust.endDate);
              const localEndLater = localEndDate && cloudEndDate && !isNaN(localEndDate.getTime()) && !isNaN(cloudEndDate.getTime()) && localEndDate > cloudEndDate;
              const bestEndDate = localEndLater ? local.endDate : cloudCust.endDate;
              const bestEndDateObj = parseSafeDate(bestEndDate);
              const bestDaysRemaining = bestEndDateObj ? Math.ceil((bestEndDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : cloudCust.daysRemaining;

              const localTime = Math.max(local.updatedAt || 0, local.createdAt || 0);
              const cloudTime = Math.max((cloudCust as any).updatedAt || 0, (cloudCust as any).createdAt || 0);
              const localIsNewer = (localTime >= cloudTime) ||
                                   Boolean(local.updatedAt && (Date.now() - local.updatedAt) < 120000) ||
                                   Boolean(local.createdAt && (Date.now() - local.createdAt) < 120000);

              if (localIsNewer) {
                return {
                  ...cloudCust,
                  ...local,
                  endDate: bestEndDate,
                  expireDate: bestEndDate,
                  daysRemaining: bestDaysRemaining,
                  onuSignal: ((local.onuSignal || cloudCust.onuSignal) && (local.onuSignal || cloudCust.onuSignal)?.toLowerCase() !== "offline" && (local.onuSignal || cloudCust.onuSignal) !== "-18.5 dBm") ? (local.onuSignal || cloudCust.onuSignal) : "—",
                  sessionUptime: local.sessionUptime || cloudCust.sessionUptime,
                  ipAddress: local.ipAddress || cloudCust.ipAddress,
                  mac: local.mac || cloudCust.mac,
                  netStatus: local.netStatus || cloudCust.netStatus,
                };
              }

              return {
                ...local,
                ...cloudCust,
                endDate: bestEndDate,
                expireDate: bestEndDate,
                daysRemaining: bestDaysRemaining,
                onuSignal: ((local.onuSignal || cloudCust.onuSignal) && (local.onuSignal || cloudCust.onuSignal)?.toLowerCase() !== "offline" && (local.onuSignal || cloudCust.onuSignal) !== "-18.5 dBm") ? (local.onuSignal || cloudCust.onuSignal) : "—",
                sessionUptime: local.sessionUptime || cloudCust.sessionUptime,
                ipAddress: local.ipAddress || cloudCust.ipAddress,
                mac: local.mac || cloudCust.mac,
                netStatus: local.netStatus || cloudCust.netStatus,
              };
            });

            const localOnly = prev.filter(local =>
              !delSet.has((local.id || "").toLowerCase()) &&
              !(local.clientCode && delSet.has(local.clientCode.toLowerCase())) &&
              !(local.pppUser && delSet.has(local.pppUser.toLowerCase())) &&
              !refreshed.some(c =>
                c.id === local.id ||
                c.clientCode === local.clientCode ||
                (c.pppUser && local.pppUser && c.pppUser.toLowerCase() === local.pppUser.toLowerCase())
              )
            );

            const result = [...localOnly, ...merged];
            try {
              localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(result));
            } catch (e) {
              console.error(e);
            }
            return result;
          });
        }
      }
    });

    // 4. Subscribe to realtime updates for upgrade requests
    const unsubUpgrades = subscribeToUpgradeRequests(cloudRequests => {
      if (cloudRequests && cloudRequests.length > 0) {
        setUpgradeRequests(cloudRequests);
      }
    });

    return () => {
      unsubCustomers();
      unsubDeleted();
      unsubUpgrades();
    };
  }, []);

  // ── Frontend Keep-Alive Heartbeat (Pings Render /health every 4 mins to keep server awake) ──
  useEffect(() => {
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (isLocal) return;
    const heartbeat = () => {
      fetch("https://maa-best-network.onrender.com/health", { signal: AbortSignal.timeout(10000) }).catch(() => {});
    };
    heartbeat();
    const timer = setInterval(heartbeat, 4 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Sync Live Telemetry & Authentic Billing from NetX API (Optical Power, Real IP, Dues, Expiry, Status) ──
  useEffect(() => {
    let mounted = true;
    const syncNetx = async () => {
      try {
        const gatewayBase = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
          ? "" : "https://maa-best-network.onrender.com";

        const [statsRes, custsRes] = await Promise.all([
          fetch(`${gatewayBase}/api/netx/live-stats`, { signal: AbortSignal.timeout(25000) }).catch(() => null),
          fetch(`${gatewayBase}/api/netx/customers`, { signal: AbortSignal.timeout(25000) }).catch(() => null),
        ]);

        const liveList = statsRes && statsRes.ok ? (await statsRes.json()).data : [];
        const fullCustList = custsRes && custsRes.ok ? (await custsRes.json()).data : [];

        if (!mounted) return;
        if ((!Array.isArray(liveList) || liveList.length === 0) && (!Array.isArray(fullCustList) || fullCustList.length === 0)) return;

        // Index live telemetry data (IP, MAC, ONU Optical Power, Uptime)
        const liveMap = new Map<string, any>();
        const macMap = new Map<string, any>();
        if (Array.isArray(liveList)) {
          liveList.forEach(ls => {
            if (ls.pppoe_username) liveMap.set(ls.pppoe_username.toLowerCase(), ls);
            if (ls.full_name) liveMap.set(ls.full_name.toLowerCase().replace(/[^a-z0-9]/g, ""), ls);
            if (ls.user_id) liveMap.set(ls.user_id.toLowerCase().replace(/[^a-z0-9]/g, ""), ls);
            if (ls.live_mac) macMap.set(ls.live_mac.toLowerCase().trim(), ls);
          });
        }

        // Index authentic billing & customer accounts from NetX/MikroTik
        const custMap = new Map<string, any>();
        if (Array.isArray(fullCustList)) {
          fullCustList.forEach(c => {
            if (c.pppoe_username) custMap.set(c.pppoe_username.toLowerCase(), c);
            if (c.customer_code) custMap.set(c.customer_code.toLowerCase(), c);
            if (c.id) custMap.set(c.id.toLowerCase(), c);
            if (c.phone) custMap.set(c.phone, c);
            if (c.full_name) custMap.set(c.full_name.toLowerCase().replace(/[^a-z0-9]/g, ""), c);
          });
        }

        let delSaved: any[] = [];
        try {
          delSaved = JSON.parse(localStorage.getItem(DELETED_CUSTOMERS_STORAGE_KEY) || "[]");
        } catch {
          delSaved = [];
        }
        const delSet = new Set<string>();
        if (Array.isArray(delSaved)) {
          delSaved.forEach((d: any) => {
            if (d?.id) delSet.add(String(d.id).toLowerCase());
            if (d?.clientCode) delSet.add(String(d.clientCode).toLowerCase());
            if (d?.pppUser) delSet.add(String(d.pppUser).toLowerCase());
          });
        }

        setCustomers(prev => {
          let hasChange = false;
          const matchedNetxIds = new Set<string>();

          // 1. Update existing customers with live billing, status, and telemetry
          const updated = prev
            .filter(c => !delSet.has((c.id || "").toLowerCase()) && !(c.clientCode && delSet.has(c.clientCode.toLowerCase())) && !(c.pppUser && delSet.has(c.pppUser.toLowerCase())))
            .map(c => {
            const pppKey = (c.pppUser || "").toLowerCase();
            const nameKey = (c.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            const macKey = (c.mac || "").toLowerCase().trim();
            const codeKey = (c.clientCode || "").toLowerCase();
            const idKey = (c.id || "").toLowerCase();

            const liveMatch = liveMap.get(pppKey) || macMap.get(macKey) || liveMap.get(nameKey);
            const netxMatch = custMap.get(pppKey) || custMap.get(codeKey) || custMap.get(idKey) || custMap.get(c.phone) || custMap.get(nameKey);

            if (netxMatch && netxMatch.id) {
              matchedNetxIds.add(netxMatch.id.toLowerCase());
              if (netxMatch.pppoe_username) matchedNetxIds.add(netxMatch.pppoe_username.toLowerCase());
              if (netxMatch.customer_code) matchedNetxIds.add(netxMatch.customer_code.toLowerCase());
            }

            if (!liveMatch && !netxMatch) {
              // ── CREATION GRACE PERIOD ──────────────────────────────────────
              // Skip newly created customers (within 120s) — the NetX/MikroTik API
              // hasn't synced yet and would return no data, causing the sync loop 
              // to think the customer doesn't exist and potentially override their active state.
              if (c.createdAt && (Date.now() - c.createdAt) < 120000) {
                return c; // Preserve brand new customer as-is
              }
              if (c.onuSignal === "-18.5 dBm" || c.onuSignal?.toLowerCase() === "offline") {
                hasChange = true;
                return { ...c, onuSignal: "—" };
              }
              return c;
            }

            // Connection & Line State
            // CRITICAL: If admin manually enabled/edited the customer,
            // the NetX API still shows stale data for up to 20–60s while MikroTik syncs.
            // We must NOT let the stale API response re-disable or overwrite the customer.
            // GRACE PERIOD: Newly created or recently edited customers (within 120s) are immune to API overwrites.
            const isRecentlyEdited = Boolean((c.updatedAt && (Date.now() - c.updatedAt) < 120000) || (c.createdAt && (Date.now() - c.createdAt) < 120000));
            const apiSaysDisabled = netxMatch?.status === "disabled";
            const isWithinGrace = Boolean(c.graceExpiryDate && (parseSafeDate(c.graceExpiryDate)?.getTime() ?? 0) >= Date.now());
            const isPaidOrFree = c.userType === "free" || c.userType === "unlimited" || isWithinGrace || ((c.dueAmount === 0 || c.due === 0) && c.status === "active");

            // CRITICAL FIX: If customer has paid their bill (dueAmount === 0), is free/active, or is within active bonus grace,
            // never let upstream NetX's stale "disabled" (caused by expiry cutoff) override their line to disabled/suspended!
            const isLineDisabled = isPaidOrFree
              ? (c.disabledInMikrotik === true && c.status === "suspended" && !isWithinGrace)
              : isRecentlyEdited
                ? (c.disabledInMikrotik === true)
                : (c.disabledInMikrotik === true || (apiSaysDisabled && c.disabledInMikrotik !== false));

            const newNetStatus: "online" | "offline" = isLineDisabled
              ? "offline"
              : isPaidOrFree
                ? (liveMatch?.connection_status === "offline" ? (c.netStatus || "online") : "online")
                : (liveMatch?.connection_status === "online" || netxMatch?.connection_status === "online")
                  ? "online"
                  : liveMatch?.connection_status === "offline"
                    ? "offline"
                    : c.netStatus;

            const cleanSignal = (c.onuSignal && c.onuSignal.toLowerCase() !== "offline" && c.onuSignal !== "—") ? c.onuSignal : null;
            const newSignal = (liveMatch?.onu_rx_power !== null && liveMatch?.onu_rx_power !== undefined)
              ? `${liveMatch.onu_rx_power} dBm`
              : (cleanSignal || "—");
            const newIp = liveMatch?.live_ip || c.ipAddress;
            const newMac = liveMatch?.live_mac || netxMatch?.onu_mac || c.mac;
            const newUptime = liveMatch?.live_uptime || c.sessionUptime;

            // Live MikroTik package & pricing — if customer was recently edited by admin or is free/unlimited, preserve admin's package & price!
            const effectivePkg = isRecentlyEdited || c.userType === "free" || c.userType === "unlimited"
              ? (c.package || "35M")
              : (netxMatch?.package_name || liveMatch?.package_name || c.package || "35M");
            const livePrice = isRecentlyEdited || c.userType === "free" || c.userType === "unlimited"
              ? (c.price ?? (c.userType === "free" ? 0 : 500))
              : (netxMatch?.package_price ? Number(netxMatch.package_price) : (netxMatch?.monthly_bill ? Number(netxMatch.monthly_bill) : (liveMatch?.package_price ? Number(liveMatch.package_price) : c.price)));
            const liveSpeed = isRecentlyEdited
              ? (c.speed || "35/35")
              : (effectivePkg === "35M" ? "35/35" : (effectivePkg === "50M" ? "50/50" : (effectivePkg === "80M" ? "80/80" : (effectivePkg === "100M" ? "100/100" : (effectivePkg === "10 Mbps" ? "10/10" : c.speed)))));
            const liveDown = isRecentlyEdited
              ? (c.downloadSpeedMbps || 35)
              : (effectivePkg === "35M" ? 35 : (effectivePkg === "50M" ? 50 : (effectivePkg === "80M" ? 80 : (effectivePkg === "100M" ? 100 : (effectivePkg === "10 Mbps" ? 10 : c.downloadSpeedMbps)))));
            const liveUp = isRecentlyEdited
              ? (c.uploadSpeedMbps || 35)
              : (effectivePkg === "35M" ? 35 : (effectivePkg === "50M" ? 50 : (effectivePkg === "80M" ? 80 : (effectivePkg === "100M" ? 100 : (effectivePkg === "10 Mbps" ? 10 : c.uploadSpeedMbps)))));

            // ── HYBRID DUE AMOUNT ─────────────────────────────────────────────────
            const rawNetxDue = netxMatch?.due_amount !== undefined ? Number(netxMatch.due_amount) : undefined;
            let liveDueAmount: number;
            if (c.userType === "free" || c.userType === "unlimited") {
              liveDueAmount = 0;
            } else if (rawNetxDue !== undefined && rawNetxDue > 0) {
              const locallyPaid = (c.dueAmount === 0 || c.due === 0) && c.status === "active";
              liveDueAmount = locallyPaid ? 0 : rawNetxDue;
            } else if (rawNetxDue === 0) {
              liveDueAmount = 0;
            } else {
              liveDueAmount = c.dueAmount ?? c.due ?? 0;
            }

            const liveMonthlyBill = isRecentlyEdited || c.userType === "free" || c.userType === "unlimited"
              ? (c.monthlyBill ?? (c.userType === "free" ? 0 : 500))
              : (netxMatch?.monthly_bill !== undefined ? Number(netxMatch.monthly_bill) : (livePrice || c.monthlyBill));

            // ── HYBRID LIFECYCLE STATUS ───────────────────────────────────────────
            let computedStatus: CustomerStatus = c.status;
            if (isPaidOrFree) {
              computedStatus = "active";
            } else if (isRecentlyEdited) {
              computedStatus = c.status; // Preserve admin-chosen status during edit grace period
            } else if (isLineDisabled) {
              computedStatus = "suspended";
            } else if (liveDueAmount > 0 && netxMatch?.is_due) {
              computedStatus = "due";
            } else if (liveDueAmount === 0) {
              if (c.status === "due") {
                computedStatus = "active";
              } else if (c.status === "suspended" && (c.disabledInSystem === false || c.disabledInMikrotik === false)) {
                computedStatus = "active";
              } else if ((netxMatch?.status === "active" || newNetStatus === "online") && c.status !== "active" && c.status !== "disconnected") {
                computedStatus = "active";
              }
            } else if (netxMatch?.status === "active" && liveDueAmount === 0) {
              computedStatus = "active";
            }

            // ── HYBRID EXPIRY DATE & DAYS REMAINING ──────────────────────────────
            let newEndDate = c.endDate;
            let newDaysRemaining = c.daysRemaining;
            if (netxMatch?.expiry_date) {
              const apiExpiry = parseSafeDate(netxMatch.expiry_date);
              if (apiExpiry && !isNaN(apiExpiry.getTime())) {
                const localExpiry = parseSafeDate(c.endDate);
                if (!localExpiry || isNaN(localExpiry.getTime()) || apiExpiry > localExpiry) {
                  newEndDate       = apiExpiry.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                  newDaysRemaining = Math.ceil((apiExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                } else {
                  newDaysRemaining = Math.ceil((localExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                }
              }
            } else if (c.endDate && c.endDate !== "Permanent / Lifetime") {
              const localExpiry = parseSafeDate(c.endDate);
              if (localExpiry && !isNaN(localExpiry.getTime())) {
                newDaysRemaining = Math.ceil((localExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              }
            }

            // If active bonus grace is present, compute remaining days based on graceExpiryDate
            const graceExpiryObj = parseSafeDate(c.graceExpiryDate);
            if (graceExpiryObj && graceExpiryObj.getTime() > Date.now()) {
              const graceRemaining = Math.ceil((graceExpiryObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              newDaysRemaining = Math.max(newDaysRemaining || 0, graceRemaining);
            }

            if (
              c.netStatus !== newNetStatus ||
              c.onuSignal !== newSignal ||
              c.ipAddress !== newIp ||
              c.mac !== newMac ||
              c.package !== effectivePkg ||
              c.price !== livePrice ||
              c.monthlyBill !== liveMonthlyBill ||
              c.dueAmount !== liveDueAmount ||
              c.due !== liveDueAmount ||
              c.status !== computedStatus ||
              c.disabledInMikrotik !== isLineDisabled ||
              c.daysRemaining !== newDaysRemaining ||
              c.endDate !== newEndDate
            ) {
              hasChange = true;
              return {
                ...c,
                netStatus: newNetStatus,
                status: computedStatus,
                disabledInMikrotik: isLineDisabled,
                disabledInSystem: isLineDisabled,
                dueAmount: liveDueAmount,
                due: liveDueAmount,
                monthlyBill: liveMonthlyBill,
                price: livePrice,
                onuSignal: newSignal,
                ipAddress: newIp,
                mac: newMac,
                sessionUptime: newUptime,
                package: effectivePkg,
                profile: effectivePkg,
                speed: liveSpeed,
                downloadSpeedMbps: liveDown,
                uploadSpeedMbps: liveUp,
                endDate: newEndDate,
                daysRemaining: newDaysRemaining,
                serverName: netxMatch?.server_name || liveMatch?.server_name || "DC-CA"
              };
            }
            return c;
          });

          // 2. Discover and ingest newly created MikroTik subscribers that aren't in prev
          const brandNewSubscribers: Customer[] = [];
          if (Array.isArray(fullCustList)) {
            fullCustList.forEach(nc => {
              const ncId = (nc.id || '').toLowerCase();
              const ncPpp = (nc.pppoe_username || '').toLowerCase();
              const ncCode = (nc.customer_code || '').toLowerCase();

              // Do not ingest if subscriber is in deleted archive
              if (delSet.has(ncId) || delSet.has(ncPpp) || delSet.has(ncCode)) {
                return;
              }

              if (matchedNetxIds.has(ncId) || matchedNetxIds.has(ncPpp) || matchedNetxIds.has(ncCode)) {
                return; // Already in roster
              }

              const alreadyExists = prev.some(p =>
                (p.id && p.id.toLowerCase() === ncId) ||
                (p.pppUser && p.pppUser.toLowerCase() === ncPpp) ||
                (p.clientCode && p.clientCode.toLowerCase() === ncCode)
              );
              if (alreadyExists) return;

              hasChange = true;
              const liveMatch = liveMap.get(ncPpp);
              const isDis = nc.status === 'disabled';
              const pkgName = nc.package_name || '35M';
              const price = Number(nc.package_price || nc.monthly_bill || 500);
              const due = Number(nc.due_amount || 0);

              const expDate = nc.expiry_date ? new Date(nc.expiry_date) : new Date(Date.now() + 30 * 86400000);
              const daysRem = Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

              brandNewSubscribers.push({
                id: nc.id || nc.customer_code || `MBN-${Date.now()}`,
                clientCode: nc.customer_code || nc.id,
                passcode: nc.pppoe_password || '123456',
                name: nc.full_name || nc.pppoe_username,
                phone: nc.phone || '01700000000',
                email: `${(nc.pppoe_username || 'client').replace(/[^a-z0-9]/gi, '')}@maabestnetwork.com`,
                address: nc.address || 'Kalkini',
                zone: nc.zone_name || 'Default',
                subzone: nc.subzone_name || 'KALKINI SOMITIR HAT',
                package: pkgName,
                profile: pkgName,
                speed: pkgName === '35M' ? '35/35' : (pkgName === '50M' ? '50/50' : '35/35'),
                downloadSpeedMbps: 35,
                uploadSpeedMbps: 35,
                price,
                monthlyBill: Number(nc.monthly_bill || price),
                dueAmount: due,
                due,
                status: isDis ? 'suspended' : (nc.is_due && due > 0 ? 'due' : 'active'),
                netStatus: isDis ? 'offline' : (nc.connection_status === 'online' ? 'online' : 'offline'),
                disabledInMikrotik: isDis,
                disabledInSystem: isDis,
                billingDate: expDate.getDate() || 1,
                startDate: nc.activation_date || new Date().toLocaleDateString('en-GB'),
                endDate: expDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                daysRemaining: daysRem,
                ipAddress: liveMatch?.live_ip || '10.200.201.1',
                mac: liveMatch?.live_mac || nc.onu_mac || '',
                pppUser: nc.pppoe_username,
                pppPass: nc.pppoe_password || '123456',
                mikrotik: 'DC-CA',
                serverName: 'DC-CA',
                olt: nc.olt_server || 'OLT1',
                onuSignal: liveMatch?.onu_rx_power ? `${liveMatch.onu_rx_power} dBm` : '—',
                sessionUptime: liveMatch?.live_uptime || '0d',
                monthlyUsageGB: 0,
                joinDate: nc.created_at ? new Date(nc.created_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
                clientType: 'Home',
                billingStatus: 'Monthly',
                invoices: [],
                paymentHistory: []
              });
            });
          }

          if (hasChange) {
            const combined = [...brandNewSubscribers, ...updated];
            try {
              localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(combined));
            } catch (_) {}
            return combined;
          }
          return prev;
        });
      } catch (_) {}
    };

    syncNetx();
    const interval = setInterval(syncNetx, 20000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // ── Daily daysRemaining Recalculation ──
  useEffect(() => {
    const recalcDaysRemaining = () => {
      const now = new Date();
      setCustomers(prev => {
        let changed = false;
        const updated = prev.map(c => {
          if (c.userType === "free" || c.userType === "unlimited") return c;
          if (!c.endDate || c.endDate === "Permanent / Lifetime") return c;
          const baseEnd = parseSafeDate(c.endDate);
          const graceEnd = parseSafeDate(c.graceExpiryDate);
          const activeEnd = (graceEnd && graceEnd > now) ? graceEnd : baseEnd;
          if (activeEnd && !isNaN(activeEnd.getTime())) {
            const diffMs = activeEnd.getTime() - now.getTime();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays !== c.daysRemaining) {
              changed = true;
              return { ...c, daysRemaining: diffDays };
            }
          }
          return c;
        });
        return changed ? updated : prev;
      });
    };

    // Run immediately on mount
    recalcDaysRemaining();

    // Then recalculate every hour to keep it accurate
    const timer = setInterval(recalcDaysRemaining, 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);



  useEffect(() => {
    try {
      if (customers && customers.length > 0) {
        const clean = customers.filter(c => c && c.id);
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(clean));
      }
    } catch (e) {
      console.error(e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem("isp_upgrade_requests_store_v9_mbn_passcodes", JSON.stringify(upgradeRequests));
    } catch (e) {
      console.error(e);
    }
  }, [upgradeRequests]);

  useEffect(() => {
    try {
      if (activeCustomerId) {
        localStorage.setItem("isp_active_customer_id", activeCustomerId);
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeCustomerId]);

  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === activeCustomerId || c.clientCode === activeCustomerId) || customers[0] || null;
  }, [customers, activeCustomerId]);

  const generateDefaultPasscode = (idOrCode: string) => {
    const numPart = idOrCode.replace(/[^0-9]/g, "");
    return `mbn@${numPart || "0001"}`;
  };

  const loginAsCustomer = (identifier: string, passcode?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const customer = customers.find(
      c =>
        (c.id && c.id.toLowerCase() === cleanId) ||
        (c.clientCode && c.clientCode.toLowerCase() === cleanId) ||
        (c.phone && c.phone.replace(/\D/g, "") === cleanId.replace(/\D/g, "")) ||
        (c.pppUser && c.pppUser.toLowerCase() === cleanId) ||
        (c.email && c.email.toLowerCase() === cleanId)
    );

    if (!customer) {
      return { success: false, error: "Customer not found. Please check your User ID, Phone, or PPPoE Username." };
    }

    if (passcode) {
      const isMatch = customer.passcode === passcode || customer.passcode.replace(/^isp@/i, "mbn@") === passcode.replace(/^isp@/i, "mbn@");
      if (!isMatch) {
        return { success: false, error: "Incorrect passcode. Please check your assigned subscriber passcode." };
      }
    }

    setActiveCustomerId(customer.id);
    return { success: true, customer };
  };

  const logoutCustomer = () => {
    setActiveCustomerId(null);
  };

  const addCustomer = (data: Partial<Customer>): Customer => {
    // Generate sequential MBN000X format
    const maxExistingNum = customers.reduce((max, c) => {
      const match = (c.clientCode || c.id).match(/MBN(\d+)/i);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);
    const nextNum = maxExistingNum + 1;
    const newId = data.clientCode || `MBN${String(nextNum).padStart(4, "0")}`;
    const defaultPass = data.passcode || `mbn@${String(nextNum).padStart(4, "0")}`;

    const speedVal = data.speed || "35/35";
    const speeds = speedVal.split("/").map(s => parseInt(s.trim()) || 35);
    const cleanName = (data.name || `client${nextNum}`).toLowerCase().replace(/[^a-z0-9]/g, "");

    const userType = data.userType || "normal";
    const isFree = userType === "free";
    const isUnlimited = userType === "unlimited";
    const wantDisabled = data.status === "suspended" || data.netStatus === "offline";
    const cleanProfile = isFree ? "default" : ((data.profile || data.package || "35M").split(/[—\-]/)[0].trim() || "35M");
    const cleanPkg = isFree ? "Complimentary Free Tier (No Cutoff)" : ((data.package || cleanProfile).split(/[—\-]/)[0].trim() || "35M");

    const newCustomer: Customer = {
      name: data.name || `Mbn@${cleanName}`,
      phone: data.phone || `01712-${String(100000 + ((nextNum * 137) % 900000))}`,
      email: data.email || `${cleanName}@maabestnetwork.com`,
      address: data.address || "Somitir Hat, Kalkini, Madaripur",
      zone: data.zone || "DHAKA DIVISION",
      subzone: data.subzone || "KALKINI SOMITIR HAT",
      box: data.box || "SOMITIR HAT BAZAR",
      serverName: data.serverName || "DC-CA",
      service: data.service || "pppoe",
      connectionType: data.connectionType || "Optical Fiber",
      speed: speedVal,
      downloadSpeedMbps: speeds[0] || 35,
      uploadSpeedMbps: speeds[1] || 35,
      price: isFree ? 0 : (data.price || data.monthlyBill || 500),
      monthlyBill: isFree ? 0 : (data.monthlyBill || data.price || 500),
      status: isFree ? "active" : (data.status || "active"),
      netStatus: isFree ? "online" : (data.netStatus || "online"),
      billingDate: data.billingDate || 1,
      startDate: data.startDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      endDate: isFree || isUnlimited ? "Permanent / Lifetime" : (data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })),
      expireDate: isFree || isUnlimited ? "Permanent / Lifetime" : (data.expireDate || data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })),
      daysRemaining: isFree || isUnlimited ? 999 : (data.daysRemaining ?? 30),
      dueAmount: isFree ? 0 : (data.dueAmount ?? data.due ?? 0),
      due: isFree ? 0 : (data.due ?? data.dueAmount ?? 0),
      ipAddress: data.ipAddress || `10.215.35.${10 + (nextNum % 240)}`,
      mac: data.mac || `50:65:F3:11:88:${String(nextNum % 100).padStart(2, "0")}`,
      pppUser: data.pppUser || `mbn@${cleanName}`,
      pppPass: data.pppPass || "123456",
      mikrotik: data.mikrotik || "MikroTik-MBN-Core",
      olt: data.olt || "OLT-01",
      onuSignal: data.onuSignal || "—",
      sessionUptime: data.sessionUptime || "0d 0h 0m",
      monthlyUsageGB: data.monthlyUsageGB ?? 0,
      joinDate: data.joinDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      clientType: data.clientType || (isUnlimited ? "Corporate" : "Home"),
      billingStatus: isFree ? "Prepaid" : (data.billingStatus || "Monthly"),
      invoices: data.invoices || [],
      paymentHistory: data.paymentHistory || [],
      ...data,
      profile: cleanProfile, // Ensure clean profile after spread
      package: cleanPkg,
      id: newId,
      clientCode: newId,
      passcode: data.passcode || defaultPass,
      userType: userType,
      createdAt: Date.now(), // Grace period: syncNetx won't override for 120s
      disabledInMikrotik: wantDisabled ? true : false,
      disabledInSystem: wantDisabled ? true : false,
      ...(isFree ? { dueAmount: 0, due: 0, price: 0, monthlyBill: 0, status: "active", netStatus: "online" } : {}),
    };

    const updatedList = [newCustomer, ...customers];
    setCustomers(updatedList);
    try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
    // Auto-link with Optical Splitter Ledger if box & port are assigned
    if (newCustomer.splitterBox && newCustomer.splitterPort) {
      try {
        const portNum = parseInt(String(newCustomer.splitterPort).replace(/\D/g, ""), 10) || 1;
        const splitters = splitterStore.getSplitters();
        const matchedBox = splitters.find(s =>
          s.id === newCustomer.splitterBox ||
          s.name.toLowerCase().includes(String(newCustomer.splitterBox).toLowerCase().trim()) ||
          String(newCustomer.splitterBox).toLowerCase().includes(s.name.toLowerCase().trim())
        );
        if (matchedBox) {
          splitterStore.assignSubscriberToPort(matchedBox.id, portNum, {
            id: newCustomer.clientCode || newCustomer.id,
            name: newCustomer.name,
            phone: newCustomer.phone,
            dropMeters: typeof newCustomer.cableMetre === "number" ? newCustomer.cableMetre : 45,
            rxPowerDbm: newCustomer.onuSignal ? parseFloat(newCustomer.onuSignal) : -19.0,
          });
        }
      } catch (err) {
        console.warn("Auto splitter assignment skipped:", err);
      }
    }

    saveCustomerToFirestore(newCustomer);

    // ── Auto-Provision PPPoE Secret on MikroTik RouterOS ────────────────────
    const srv = (newCustomer.service || "").toLowerCase();
    const shouldProvision = Boolean(newCustomer.pppUser) || srv === "pppoe" || srv === "hotspot" || !srv;
    if (shouldProvision) {
      const gatewayBase = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
        ? "" : "https://maa-best-network.onrender.com";
      const pppUser = newCustomer.pppUser || `mbn@${(newCustomer.name || "").toLowerCase().replace(/[^a-z0-9]/g, "")}`;
      const pppPass = newCustomer.pppPass || newCustomer.passcode || "123456";
      const profile = (newCustomer.profile || newCustomer.package || "35M").split(/[—\-]/)[0].trim();
      const comment = `${newCustomer.name} (${newId}) — Created via ISP Portal`;
      fetch(`${gatewayBase}/api/mikrotik/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: pppUser, 
          password: pppPass, 
          profile, 
          comment,
          name: newCustomer.name,
          phone: newCustomer.phone,
          address: newCustomer.address,
          package: profile,
          zone: newCustomer.zone,
          olt: newCustomer.olt,
          ponPort: newCustomer.ponPort,
          mac: newCustomer.mac
        }),
      })
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          activityLogger.log({
            type: "network",
            severity: "success",
            action: "MikroTik PPPoE Secret Provisioned",
            detail: `RouterOS PPPoE secret "${pppUser}" created on MikroTik DC-CA for ${newCustomer.name} (${newId}) with profile: ${profile}.`,
            targetId: newId,
          });
        } else if (!result.alreadyExists) {
          activityLogger.log({
            type: "network",
            severity: "warning",
            action: "MikroTik PPPoE Provisioning Failed",
            detail: `Could not create RouterOS PPPoE secret "${pppUser}" for ${newCustomer.name}: ${result.error}`,
            targetId: newId,
          });
        }
      })
      .catch(err => {
        console.warn("[MikroTik Provisioning] Failed to provision PPPoE secret:", err.message);
      });
    }

    activityLogger.log({
      type: "customer",
      severity: "success",
      action: "New Subscriber Account Provisioned",
      detail: `Created subscriber ${newCustomer.name} (${newId}) with ${newCustomer.package} (${newCustomer.userType?.toUpperCase()} Policy).`,
      targetId: newId,
      metadata: { package: newCustomer.package, ip: newCustomer.ipAddress, mac: newCustomer.mac, userType: newCustomer.userType }
    });

    return newCustomer;
  };

  const addCustomerAsync = async (data: Partial<Customer>): Promise<{ success: boolean; customer: Customer; error?: string; alreadyExists?: boolean }> => {
    const newCustomer = addCustomer(data);
    const srv = (newCustomer.service || "").toLowerCase();
    const shouldProvision = Boolean(newCustomer.pppUser) || srv === "pppoe" || srv === "hotspot" || !srv;
    if (!shouldProvision) {
      return { success: true, customer: newCustomer };
    }

    const gatewayBase = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
      ? "" : "https://maa-best-network.onrender.com";
    let pppUser = newCustomer.pppUser || `mbn@${(newCustomer.name || "").toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    if (!pppUser.toLowerCase().startsWith("mbn@")) {
      pppUser = `mbn@${pppUser.replace(/^mbn/i, "")}`;
    }
    const pppPass = newCustomer.pppPass || "123456";
    const profile = (newCustomer.package || newCustomer.profile || "35M").split(/[—\-]/)[0].trim();
    const comment = `${newCustomer.name} (${newCustomer.id}) — Created via ISP Portal`;

    try {
      const res = await fetch(`${gatewayBase}/api/mikrotik/user/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: pppUser, 
          password: pppPass, 
          profile, 
          comment,
          name: newCustomer.name,
          phone: newCustomer.phone,
          address: newCustomer.address,
          package: profile,
          zone: newCustomer.zone,
          olt: newCustomer.olt,
          ponPort: newCustomer.ponPort,
          mac: newCustomer.mac
        }),
        signal: AbortSignal.timeout(35000), // 35s to allow for Render cold wake up if asleep
      });
      const result = await res.json();
      if (result.success) {
        return { success: true, customer: newCustomer, alreadyExists: result.alreadyExists };
      } else {
        return { success: false, customer: newCustomer, error: result.error || "MikroTik rejected the request" };
      }
    } catch (err: any) {
      return {
        success: false,
        customer: newCustomer,
        error: err.name === "TimeoutError"
          ? "MikroTik Gateway timed out while waking up. Please retry in 10 seconds."
          : (err.message || "Failed to reach MikroTik Gateway")
      };
    }
  };

  const addCustomersBulk = (newCustomersData: Partial<Customer>[]): Customer[] => {
    if (!newCustomersData || newCustomersData.length === 0) return [];

    let currentMaxNum = customers.reduce((max, c) => {
      const match = (c.clientCode || c.id || "").match(/MBN(\d+)/i);
      return match ? Math.max(max, parseInt(match[1], 10)) : max;
    }, 0);

    const createdCustomers: Customer[] = [];

    newCustomersData.forEach((data) => {
      currentMaxNum += 1;
      const nextNum = currentMaxNum;
      const newId = data.clientCode || `MBN${String(nextNum).padStart(4, "0")}`;
      const defaultPass = data.passcode || `mbn@${String(nextNum).padStart(4, "0")}`;

      const speedVal = data.speed || "20/10";
      const speeds = speedVal.split("/").map(s => parseInt(s.trim()) || 20);
      const cleanName = (data.name || `client${nextNum}`).toLowerCase().replace(/[^a-z0-9]/g, "");

      const newCustomer: Customer = {
        name: data.name || `Mbn@${cleanName}`,
        phone: data.phone || `01712-${String(100000 + ((nextNum * 137) % 900000))}`,
        email: data.email || `${cleanName}@maabestnetwork.com`,
        address: data.address || "Somitir Hat, Kalkini, Madaripur",
        zone: data.zone || "DHAKA DIVISION",
        subzone: data.subzone || "KALKINI SOMITIR HAT",
        box: data.box || "SOMITIR HAT BAZAR",
        package: data.package || "PIONEER_HOME_20Mbps",
        profile: data.profile || data.package || "PIONEER_HOME_20Mbps",
        serverName: data.serverName || "RETAIL_1",
        service: data.service || "pppoe",
        connectionType: data.connectionType || "Optical Fiber",
        speed: speedVal,
        downloadSpeedMbps: speeds[0] || (data.downloadSpeedMbps || 20),
        uploadSpeedMbps: speeds[1] || (data.uploadSpeedMbps || 10),
        price: data.price || data.monthlyBill || 500,
        monthlyBill: data.monthlyBill || data.price || 500,
        status: data.status || "active",
        netStatus: data.netStatus || "online",
        billingDate: data.billingDate || 1,
        startDate: data.startDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        endDate: data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        daysRemaining: data.daysRemaining ?? 30,
        dueAmount: data.dueAmount ?? data.due ?? 0,
        due: data.due ?? data.dueAmount ?? 0,
        ipAddress: data.ipAddress || `10.215.35.${10 + (nextNum % 240)}`,
        mac: data.mac || `50:65:F3:11:${String(Math.floor(nextNum / 256)).padStart(2, "0")}:${String(nextNum % 256).padStart(2, "0")}`,
        pppUser: data.pppUser || `mbn@${cleanName}`,
        pppPass: data.pppPass || "123456",
        mikrotik: data.mikrotik || "MikroTik-MBN-Core",
        olt: data.olt || "OLT-01",
        onuSignal: data.onuSignal || "—",
        sessionUptime: data.sessionUptime || "0d 0h 0m",
        monthlyUsageGB: data.monthlyUsageGB ?? 0,
        joinDate: data.joinDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        clientType: data.clientType || "Home",
        billingStatus: data.billingStatus || "Monthly",
        invoices: data.invoices || [],
        paymentHistory: data.paymentHistory || [],
        ...data,
        id: newId,
        clientCode: newId,
        passcode: data.passcode || defaultPass,
      };

      createdCustomers.push(newCustomer);
    });

    const updatedList = [...createdCustomers, ...customers];
    setCustomers(updatedList);
    try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
    saveCustomersBatchToFirestore(createdCustomers);
    return createdCustomers;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const rawNewId = updates.id || updates.clientCode;
    const newId = rawNewId ? rawNewId.trim() : id;
    const isIdChanged = newId !== id && Boolean(newId);

    const target = customers.find(c => c.id === id || c.clientCode === id || c.pppUser === id);
    const targetName = target ? target.name : id;
    if (updates.userType && target && updates.userType !== target.userType) {
      activityLogger.log({
        type: "customer",
        severity: updates.userType === "free" ? "warning" : "info",
        action: `Subscriber Policy Set to ${updates.userType.toUpperCase()}`,
        detail: `Changed policy tier for ${targetName} (${id}) from ${target.userType || "normal"} to ${updates.userType}.`,
        targetId: id,
        metadata: { prevUserType: target.userType, newUserType: updates.userType }
      });
    }

    setCustomers(prev => {
      const updated: Customer[] = prev.map((c): Customer => {
        if (c.id === id || c.clientCode === id || c.pppUser === id) {
          const finalUserType = updates.userType !== undefined ? updates.userType : c.userType || "normal";
          const isFree = finalUserType === "free";
          const isUnlimited = finalUserType === "unlimited";

          const nextStatus: CustomerStatus = updates.status 
            ? (updates.status as CustomerStatus)
            : (updates.disabledInMikrotik !== undefined 
                ? (updates.disabledInMikrotik ? "suspended" : "active") 
                : c.status);

          const nextNetStatus: "online" | "offline" = updates.netStatus
            ? updates.netStatus
            : (updates.disabledInMikrotik !== undefined
                ? (updates.disabledInMikrotik ? "offline" : "online")
                : (nextStatus === "suspended" ? "offline" : c.netStatus));

          const finalStatus: CustomerStatus = isFree 
            ? "active" 
            : (isUnlimited && nextStatus === "suspended" ? "active" : nextStatus);

          const finalNetStatus: "online" | "offline" = isFree ? "online" : nextNetStatus;

          return {
            ...c,
            ...updates,
            id: newId,
            clientCode: newId,
            userType: finalUserType,
            updatedAt: Date.now(), // Mark that admin updated this customer now
            status: finalStatus,
            netStatus: finalNetStatus,
            disabledInMikrotik: isFree || isUnlimited ? false : (updates.disabledInMikrotik !== undefined ? updates.disabledInMikrotik : (finalStatus === "suspended")),
            disabledInSystem: isFree || isUnlimited ? false : (updates.disabledInMikrotik !== undefined ? updates.disabledInMikrotik : (finalStatus === "suspended")),
            ...(isFree ? {
              dueAmount: 0,
              due: 0,
              price: 0,
              monthlyBill: 0,
            } : {})
          };
        }
        return c;
      });

      const target = updated.find(c => c.id === newId || c.clientCode === newId || c.pppUser === newId);
      if (target) {
        if (isIdChanged) {
          deleteCustomerFromFirestore(id);
        }
        saveCustomerToFirestore(target);
      }

      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (isIdChanged) {
      if (activeCustomerId === id) {
        setActiveCustomerId(newId);
      }
      setUpgradeRequests(prev => {
        const updated = prev.map(req => req.customerId === id ? { ...req, customerId: newId } : req);
        try {
          localStorage.setItem("isp_upgrade_requests_store_v9_mbn_passcodes", JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });
    }

    // ── Propagate modifications to MikroTik RouterOS ──────────────────────
    const pppUser = target?.pppUser || (target?.name ? `mbn@${target.name.toLowerCase().replace(/[^a-z0-9]/g, "")}` : undefined);
    if (pppUser) {
      const gatewayBase = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
        ? "" : "https://maa-best-network.onrender.com";

      const mkUpdates: Record<string, any> = {};
      if (updates.pppPass) mkUpdates.password = updates.pppPass;
      if (updates.pppUser && updates.pppUser !== pppUser) mkUpdates.newUsername = updates.pppUser;
      if (updates.profile) mkUpdates.profile = updates.profile;
      else if (updates.package) {
        const match = updates.package.match(/\d+M/i);
        if (match) mkUpdates.profile = match[0].toUpperCase();
      }
      if (updates.status !== undefined) {
        mkUpdates.disabled = updates.status === "suspended" || (updates.status as string) === "inactive" || updates.status === "offline";
      }
      if (updates.disabledInMikrotik !== undefined) {
        mkUpdates.disabled = updates.disabledInMikrotik;
      }
      if (updates.name) {
        mkUpdates.comment = `${updates.name} (${newId}) — Updated via ISP Portal`;
      }

      if (Object.keys(mkUpdates).length > 0) {
        fetch(`${gatewayBase}/api/mikrotik/user/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: pppUser,
            customerId: newId,
            phone: updates.phone,
            name: updates.name,
            address: updates.address,
            zone: updates.zone,
            package: updates.package,
            ...mkUpdates
          }),
        })
        .then(r => r.json())
        .then(result => {
          if (result.success) {
            activityLogger.log({
              type: "network",
              severity: "info",
              action: "MikroTik Secret Synced",
              detail: `Updated RouterOS secret for "${pppUser}" on MikroTik (${Object.keys(mkUpdates).join(", ")}).`,
              targetId: newId,
            });
          }
        })
        .catch(err => {
          console.warn("[MikroTik Sync] Failed to update PPPoE secret on RouterOS:", err.message);
        });
      }
    }
  };

  const deleteCustomer = (id: string, reason?: string) => {
    const target = customers.find(c => c.id === id || c.clientCode === id);
    const targetName = target ? target.name : id;
    const targetPppUser = target?.pppUser || (target?.name ? `mbn@${target.name.toLowerCase().replace(/[^a-z0-9]/g, "")}` : undefined);
    const targetDocId = target?.id || id;
    const targetClientCode = target?.clientCode;

    // Archive the deleted customer into deletedCustomers state and storage
    if (target) {
      const archived: Customer = {
        ...target,
        status: "disconnected" as CustomerStatus,
        netStatus: "offline" as const,
        disabledInMikrotik: true,
        disabledInSystem: true,
        deletedAt: new Date().toISOString(),
        deletedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        deletedBy: "Admin",
        deletionReason: reason || "Account Terminated by Admin",
      };

      setDeletedCustomers(prev => {
        const filtered = prev.filter(c => c.id !== target.id && c.clientCode !== target.clientCode);
        const updated = [archived, ...filtered];
        try {
          localStorage.setItem(DELETED_CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });

      // Save archive directly to Cloud Firestore
      saveDeletedCustomerToFirestore(archived);
    }

    setCustomers(prev => {
      const updated = prev.filter(c => c.id !== id && c.clientCode !== id && c.id !== targetDocId);
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Delete document from active Firestore collection
    deleteCustomerFromFirestore(targetDocId);
    if (targetClientCode && targetClientCode !== targetDocId) {
      deleteCustomerFromFirestore(targetClientCode);
    }

    // Auto-release any assigned optical splitter port in the ledger
    try {
      const splitters = splitterStore.getSplitters();
      splitters.forEach(box => {
        box.ports.forEach(p => {
          if (p.customerId === id || p.customerId === targetDocId || p.customerId === targetClientCode) {
            splitterStore.releasePort(box.id, p.portNumber);
          }
        });
      });
    } catch (e) {
      console.warn("[Splitter De-allocation Notice]:", e);
    }

    // ── Auto-Deprovision PPPoE Secret & Session on MikroTik RouterOS ────────
    if (targetPppUser) {
      const gatewayBase = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
        ? "" : "https://maa-best-network.onrender.com";

      // Disconnect active PPPoE session first
      fetch(`${gatewayBase}/api/mikrotik/user/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetPppUser, customerId: id }),
      }).catch(() => {});

      // Remove PPPoE secret
      fetch(`${gatewayBase}/api/mikrotik/user/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetPppUser, customerId: id }),
      })
      .then(r => r.json())
      .then(result => {
        const severity = result.success || result.notFound ? "success" : "warning";
        activityLogger.log({
          type: "network",
          severity,
          action: "MikroTik PPPoE Secret Removed",
          detail: result.success
            ? `RouterOS PPPoE secret "${targetPppUser}" deleted for ${targetName} (${id}).`
            : result.notFound
              ? `PPPoE secret "${targetPppUser}" was not on MikroTik (already removed or never provisioned).`
              : `Failed to delete RouterOS PPPoE secret "${targetPppUser}": ${result.error}`,
          targetId: id,
        });
      })
      .catch(err => {
        console.warn("[MikroTik Deprovision] Failed to delete PPPoE secret:", err.message);
      });
    }

    activityLogger.log({
      type: "customer",
      severity: "warning",
      action: "Subscriber Account Deleted & Archived",
      detail: `Deleted subscriber record for ${targetName} (${id}) from active service. Account archived in Deleted Accounts section.`,
      targetId: id,
    });
  };

  const restoreCustomer = (id: string) => {
    const target = deletedCustomers.find(c => c.id === id || c.clientCode === id);
    if (!target) return;

    const restored: Customer = {
      ...target,
      status: "active" as CustomerStatus,
      netStatus: "online" as const,
      disabledInMikrotik: false,
      disabledInSystem: false,
      deletedAt: undefined,
      deletedDate: undefined,
      deletedBy: undefined,
      deletionReason: undefined,
      updatedAt: Date.now(),
    };

    setDeletedCustomers(prev => {
      const updated = prev.filter(c => c.id !== id && c.clientCode !== id);
      try {
        localStorage.setItem(DELETED_CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setCustomers(prev => {
      const updated = [normalizeCustomerPackage(restored), ...prev.filter(c => c.id !== id && c.clientCode !== id)];
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Remove from deleted archive in Cloud Firestore and save to active
    purgeDeletedCustomerFromFirestore(target.id);
    if (target.clientCode && target.clientCode !== target.id) {
      purgeDeletedCustomerFromFirestore(target.clientCode);
    }
    saveCustomerToFirestore(restored);

    // Re-provision on MikroTik
    const targetPppUser = restored.pppUser || `mbn@${restored.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    syncMikrotikUserState(targetPppUser, false, restored);

    activityLogger.log({
      type: "customer",
      severity: "success",
      action: "Subscriber Account Restored",
      detail: `Subscriber ${restored.name} (${id}) restored from Deleted Accounts archive to active service.`,
      targetId: id,
    });
  };

  const permanentlyPurgeCustomer = (id: string) => {
    const target = deletedCustomers.find(c => c.id === id || c.clientCode === id);
    const targetId = target?.id || id;
    const targetCode = target?.clientCode;

    setDeletedCustomers(prev => {
      const updated = prev.filter(c => c.id !== id && c.clientCode !== id);
      try {
        localStorage.setItem(DELETED_CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    purgeDeletedCustomerFromFirestore(targetId);
    if (targetCode && targetCode !== targetId) {
      purgeDeletedCustomerFromFirestore(targetCode);
    }

    activityLogger.log({
      type: "customer",
      severity: "warning",
      action: "Subscriber Permanently Purged",
      detail: `Archived customer ${id} was permanently purged from the database archive.`,
      targetId: id,
    });
  };

  
  const bulkUpdateStatus = (customerIds: string[], newStatus: CustomerStatus, newNetStatus: "online" | "offline") => {
    const isEnabling = newNetStatus === "online";
    setCustomers(prev => {
      const updated = prev.map(c => {
        if (!customerIds.includes(c.id)) return c;

        // When enabling (bulk reconnect): also set disabled flags and extend expired endDate.
        // Without this, the billing engine re-suspends in the next 60s cycle if endDate is past.
        let endDateExtension: Partial<Customer> = {};
        if (isEnabling) {
          const currentEnd = parseSafeDate(c.endDate);
          const isExpired = !currentEnd || isNaN(currentEnd.getTime()) || currentEnd < new Date();
          if (isExpired) {
            const newEnd = new Date();
            newEnd.setMonth(newEnd.getMonth() + 1);
            const newEndStr = newEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            endDateExtension = { endDate: newEndStr, expireDate: newEndStr, daysRemaining: 30 };
          }
        }

        return {
          ...c,
          ...endDateExtension,
          status: newStatus,
          netStatus: newNetStatus,
          ...(isEnabling ? { disabledInMikrotik: false, disabledInSystem: false, disconnectedAt: undefined, logoutTime: null } : { disabledInMikrotik: true, disabledInSystem: true }),
        };
      });
      // Save all updated targets to firestore
      updated.filter(c => customerIds.includes(c.id)).forEach(target => saveCustomerToFirestore(target));
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    activityLogger.log({
      type: "network",
      severity: newNetStatus === "online" ? "success" : "warning",
      action: "Bulk Line Status Modification",
      detail: `Modified status for ${customerIds.length} subscribers to ${newStatus.toUpperCase()} (${newNetStatus.toUpperCase()}).`,
      metadata: { count: customerIds.length, status: newStatus, netStatus: newNetStatus }
    });
  };

  const grantExtraDays = (customerId: string, extraDays: number) => {
    const targetCust = customers.find(c => c.id === customerId || c.clientCode === customerId);
    let shouldReactivate = false;

    setCustomers(prev => {
      const updated = prev.map(c => {
        if (c.id === customerId || c.clientCode === customerId) {
          // Calculate bonus grace end date without changing base billing cycle expiry date
          const baseEnd = parseSafeDate(c.endDate || c.expireDate) || new Date();
          const graceBase = new Date(Math.max(Date.now(), baseEnd.getTime()));
          graceBase.setDate(graceBase.getDate() + extraDays);

          const graceEndDateStr = graceBase.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
          const newDays = Math.max(extraDays, Math.ceil((graceBase.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          const wasSuspended = c.status === "suspended" || c.disabledInMikrotik;
          if (wasSuspended) {
            shouldReactivate = true;
          }

          return {
            ...c,
            // Permanent base cycle expired date is preserved untouched as a bonus gift!
            graceDays: (c.graceDays || 0) + extraDays,
            graceExpiryDate: graceEndDateStr,
            daysRemaining: newDays,
            status: "active" as CustomerStatus,
            netStatus: "online" as const,
            disabledInMikrotik: false,
            disabledInSystem: false,
            disconnectedAt: undefined,
            logoutTime: null,
          };
        }
        return c;
      });
      const target = updated.find(c => c.id === customerId || c.clientCode === customerId);
      if (target) saveCustomerToFirestore(target);
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    if (shouldReactivate && targetCust) {
      syncMikrotikUserState(targetCust.pppUser || targetCust.id, false, targetCust);
      activityLogger.log({
        type: "network",
        severity: "success",
        action: "Subscriber Line Auto-Reactivated on MikroTik (Bonus Grace Gift)",
        detail: `PPPoE secret restored & unblocked for ${targetCust.name} (${targetCust.pppUser || targetCust.id}) with +${extraDays} days bonus gift. Base cycle expiry remains ${targetCust.expireDate || targetCust.endDate}.`,
        targetId: customerId,
      });
    }

    activityLogger.log({
      type: "billing",
      severity: "info",
      action: "Bonus Gift / Grace Days Granted",
      detail: `Granted +${extraDays} days bonus access gift for subscriber ${targetCust?.name || customerId} (${customerId}) without changing base billing cycle expiry (${targetCust?.expireDate || targetCust?.endDate}).`,
      targetId: customerId,
      metadata: { extraDays, subscriber: targetCust?.name, baseExpiry: targetCust?.expireDate || targetCust?.endDate }
    });
  };

  const syncMikrotikUserState = async (targetIdOrUser?: string, disabled?: boolean, customerObj?: Customer) => {
    if (!targetIdOrUser) return;
    try {
      const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const base = isLocal ? "" : "https://maa-best-network.onrender.com";
      const res = await fetch(`${base}/api/mikrotik/user/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: customerObj?.pppUser || targetIdOrUser, 
          customerId: customerObj?.id || targetIdOrUser,
          phone: customerObj?.phone,
          disabled: !!disabled 
        }),
      });
      const data = await res.json();
      if (data.success) {
        activityLogger.log({
          type: "network",
          severity: disabled ? "warning" : "success",
          action: disabled ? "MikroTik Line Disabled" : "MikroTik Line Enabled",
          detail: `PPPoE secret "${customerObj?.pppUser || targetIdOrUser}" (${customerObj?.name || 'Subscriber'}) ${disabled ? "disabled on RouterOS DC-CA / session dropped" : "enabled on RouterOS DC-CA"}.`,
          targetId: customerObj?.id || targetIdOrUser,
        });
      }
    } catch (err) {
      console.warn("[MikroTik API Auto-Sync Notice]:", err);
    }
  };

  const toggleNetStatus = (id: string, enable: boolean) => {
    const targetCust = customers.find(c => c.id === id || c.clientCode === id || c.pppUser === id);
    syncMikrotikUserState(targetCust?.pppUser || targetCust?.id || id, !enable, targetCust);

    setCustomers(prev => {
      const updated = prev.map(c => {
        if (c.id !== id && c.clientCode !== id && c.pppUser !== id) return c;

        // When enabling: also extend endDate if it's expired, so the billing engine
        // doesn't immediately re-suspend this customer in the next 60-second cycle.
        let endDateExtension: Partial<typeof c> = {};
        if (enable) {
          const currentEnd = parseSafeDate(c.endDate);
          const isCurrentlyExpired = !currentEnd || isNaN(currentEnd.getTime()) || currentEnd < new Date();
          if (isCurrentlyExpired) {
            const newEnd = new Date();
            newEnd.setMonth(newEnd.getMonth() + 1);
            const newEndStr = newEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
            endDateExtension = {
              endDate: newEndStr,
              expireDate: newEndStr,
              daysRemaining: 30,
            };
          }
        }

        return {
          ...c,
          ...endDateExtension,
          netStatus: enable ? "online" as const : "offline" as const,
          status: enable ? "active" as CustomerStatus : "suspended" as CustomerStatus,
          disabledInMikrotik: !enable,
          disabledInSystem: !enable,
          disconnectedAt: enable ? undefined : new Date().toISOString(),
          logoutTime: enable
            ? null
            : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
              " " +
              new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
      });
      const target = updated.find(c => c.id === id || c.clientCode === id || c.pppUser === id);
      if (target) saveCustomerToFirestore(target);
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    activityLogger.log({
      type: "network",
      severity: enable ? "success" : "warning",
      action: enable ? "Subscriber Line Activated" : "Subscriber Line Suspended",
      detail: `PPPoE link ${enable ? "restored & unblocked" : "suspended & disabled"} for ${targetCust?.name || id} (${id}).`,
      targetId: id,
      metadata: { action: enable ? "enable" : "disable", ip: targetCust?.ipAddress, pppUser: targetCust?.pppUser }
    });
  };

  const runBillingCutoffEngine = useCallback(() => {
    let cutoffCount = 0;
    const now = new Date();

    setCustomers(prev => {
      let hasChanges = false;
      const updated = prev.map(c => {
        if (c.userType === "free" || c.userType === "unlimited") return c;
        if (c.createdAt && (Date.now() - c.createdAt) < 120000) return c; // Grace period: new customers immune to auto-cutoff
        if (c.updatedAt && (Date.now() - c.updatedAt) < 120000) return c; // Grace period: recently edited/enabled customers immune

        const rawDue = c.dueAmount !== undefined ? c.dueAmount : (c.due !== undefined ? c.due : 0);
        if (rawDue <= 0) return c; // Bill is paid / 0 due — never cutoff!

        const hasDue = rawDue > 0;
        const endDateObj = parseSafeDate(c.endDate || c.expireDate);
        const graceEndDateObj = parseSafeDate(c.graceExpiryDate);

        // If customer was granted bonus gift / grace days and is within that grace window, do NOT cutoff!
        const isWithinGrace = graceEndDateObj ? (graceEndDateObj >= now) : false;
        if (isWithinGrace) return c;

        const isExpired = endDateObj ? (endDateObj < now) : false;

        if (isExpired && hasDue && c.status !== "suspended") {
          hasChanges = true;
          cutoffCount++;
          if (c.pppUser || c.id) {
            syncMikrotikUserState(c.pppUser || c.id, true, c);
          }
          activityLogger.log({
            type: "billing",
            severity: "warning",
            action: "Auto-Billing Cutoff Executed",
            detail: `Line auto-suspended and PPPoE secret disabled on MikroTik for ${c.name} (${c.id}) due to overdue billing deadline.`,
            targetId: c.id,
            metadata: { pppUser: c.pppUser, daysRemaining: c.daysRemaining, dueAmount: rawDue }
          });

          return {
            ...c,
            status: "suspended" as CustomerStatus,
            netStatus: "offline" as const,
            disabledInMikrotik: true,
            disabledInSystem: true,
            disconnectedAt: c.disconnectedAt || new Date().toISOString(),
            logoutTime: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
              " " +
              new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
        }
        return c;
      });

      if (hasChanges) {
        try {
          localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        updated.forEach(c => {
          if (c.status === "suspended" && c.disabledInMikrotik) {
            saveCustomerToFirestore(c);
          }
        });
        return updated;
      }
      return prev;
    });

    return cutoffCount;
  }, []);

  // Periodic billing audit loop (every 60s)
  useEffect(() => {
    const timer = setInterval(() => {
      runBillingCutoffEngine();
    }, 60000);
    return () => clearInterval(timer);
  }, [runBillingCutoffEngine]);

  const processPayment = (
    customerId: string,
    amount: number,
    method: PaymentTransaction["method"] = "bKash",
    customTrxId?: string,
    customPaymentDate?: Date
  ) => {
    const validAmount = Math.max(1, Math.min(500000, Number(amount) || 0));
    const trxId = customTrxId || (method === "Cash" ? `CSH-${Date.now().toString().slice(-8)}` : `TRX-${Date.now().toString().slice(-8)}`);
    const now = customPaymentDate || new Date();
    
    // Formatting start date as exact payment date
    const startDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    
    // Calculating end date as exactly 1 month (or 30 days) from payment date
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 1);
    const endDate = expiry.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    
    const billingDay = now.getDate();
    const invoiceId = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${Date.now().toString().slice(-4)}`;
    const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const newPayment: PaymentTransaction = {
      id: `PAY-${Date.now().toString().slice(-6)}`,
      date: dateStr,
      amount: validAmount,
      method,
      trxId,
      status: "verified",
      collectedBy: `${method} Direct Gateway`,
      invoiceId,
    };

    const targetCust = customers.find(c => c.id === customerId || c.clientCode === customerId || c.pppUser === customerId);

    // Auto-reconnect subscriber on MikroTik RouterOS & drop stale session
    if (targetCust) {
      syncMikrotikUserState(targetCust.pppUser || targetCust.id, false, targetCust);
      const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      const base = isLocal ? "" : "https://maa-best-network.onrender.com";
      fetch(`${base}/api/mikrotik/user/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetCust.pppUser || targetCust.id })
      }).catch(() => {});

      activityLogger.log({
        type: "network",
        severity: "success",
        action: "Subscriber Line Auto-Reconnected on MikroTik",
        detail: `PPPoE secret restored & unblocked for ${targetCust.name} (${targetCust.pppUser || targetCust.id}) upon payment confirmation.`,
        targetId: customerId,
        metadata: { pppUser: targetCust.pppUser, status: "active", netStatus: "online" }
      });
    }

    setCustomers(prev => {
      const updated = prev.map(c => {
        if (c.id !== customerId && c.clientCode !== customerId && c.pppUser !== customerId) return c;

        const updatedInvoices: Invoice[] = [
          {
            id: invoiceId,
            month: `${now.toLocaleDateString("en-GB", { month: "long", year: "numeric" })} (${startDate} – ${endDate})`,
            amount: validAmount,
            dueDate: endDate,
            paidDate: dateStr,
            status: "paid",
            paymentMethod: method,
            trxId,
          },
          ...c.invoices.map(inv => inv.status === "due" ? { ...inv, status: "paid" as const, paidDate: dateStr, paymentMethod: method, trxId } : inv),
        ];

        return {
          ...c,
          dueAmount: 0,
          due: 0,
          status: "active" as CustomerStatus,
          netStatus: "online" as const,
          disabledInMikrotik: false,
          disabledInSystem: false,
          disconnectedAt: undefined,
          logoutTime: null,
          billingDate: billingDay,
          startDate: startDate,
          endDate: endDate,
          expireDate: endDate,
          graceDays: undefined,
          graceExpiryDate: undefined,
          daysRemaining: Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          updatedAt: Date.now(), // Grace period: billing engine won't cut off this paid customer for 120s
          invoices: updatedInvoices,
          paymentHistory: [newPayment, ...c.paymentHistory],
        };
      });

      const target = updated.find(c => c.id === customerId || c.clientCode === customerId || c.pppUser === customerId);
      if (target) saveCustomerToFirestore(target);
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });

    activityLogger.log({
      type: "payment",
      severity: "success",
      action: "Invoice Payment Received",
      detail: `Collected ৳${validAmount.toLocaleString()} via ${method} (TrxID: ${trxId}) for ${targetCust?.name || customerId}. Automatic reconnection activated.`,
      targetId: customerId,
      metadata: { amount: validAmount, method, trxId, invoiceId, validity: `${startDate} to ${endDate}` }
    });

    return { success: true, trxId, invoiceId, startDate, endDate };
  };

  const changePackage = (customerId: string, newPackage: string, newSpeed: string, newPrice: number) => {
    const speeds = newSpeed.split("/").map(s => parseInt(s.trim()) || 30);
    const targetCust = customers.find(c => c.id === customerId || c.clientCode === customerId || c.pppUser === customerId);
    const targetPppUser = targetCust?.pppUser || (targetCust?.name ? `mbn@${targetCust.name.toLowerCase().replace(/[^a-z0-9]/g, "")}` : undefined);

    setCustomers(prev => {
      const updated = prev.map(c => {
        if (c.id !== customerId && c.clientCode !== customerId && c.pppUser !== customerId) return c;
        return {
          ...c,
          package: newPackage,
          profile: newPackage,
          speed: newSpeed,
          downloadSpeedMbps: speeds[0] || 30,
          uploadSpeedMbps: speeds[1] || 15,
          price: newPrice,
          monthlyBill: newPrice,
        };
      });
      const target = updated.find(c => c.id === customerId || c.clientCode === customerId || c.pppUser === customerId);
      if (target) saveCustomerToFirestore(target);
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // ── Propagate new profile & rate limit to MikroTik RouterOS ───────────
    if (targetPppUser) {
      const gatewayBase = (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
        ? "" : "https://maa-best-network.onrender.com";

      let mkProfile = newPackage;
      const match = newPackage.match(/\d+M/i);
      if (match) mkProfile = match[0].toUpperCase();

      fetch(`${gatewayBase}/api/mikrotik/user/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: targetPppUser,
          customerId: targetCust?.id,
          profile: mkProfile,
          package: newPackage,
          comment: `${targetCust?.name || customerId} — Rate limit updated to ${newPackage} (${newSpeed} Mbps)`
        }),
      })
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          activityLogger.log({
            type: "network",
            severity: "success",
            action: "MikroTik PPPoE Profile Updated",
            detail: `RouterOS profile for "${targetPppUser}" updated to ${mkProfile} on MikroTik core router.`,
            targetId: customerId,
          });
        }
      })
      .catch(err => {
        console.warn("[MikroTik Package Sync] Failed to update PPPoE profile on RouterOS:", err.message);
      });
    }

    activityLogger.log({
      type: "package",
      severity: "info",
      action: "Subscriber Package Modified",
      detail: `Updated bandwidth profile for ${targetCust?.name || customerId} to ${newPackage} (${newSpeed} Mbps @ ৳${newPrice}/mo).`,
      targetId: customerId,
      metadata: { prevPackage: targetCust?.package, newPackage, newSpeed, newPrice }
    });
  };

  const submitUpgradeRequest = (
    customerId: string,
    requestedPackage: string,
    requestedSpeed: string,
    requestedPrice: number,
    notes?: string
  ): PlanUpgradeRequest => {
    const customer = customers.find(c => c.id === customerId || c.clientCode === customerId || c.pppUser === customerId);
    const currPkg = customer ? customer.package : "Standard Package";
    const currPrice = customer ? customer.price : 800;
    const diff = Math.max(0, requestedPrice - currPrice);
    const dateStr = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newReq: PlanUpgradeRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      customerId,
      customerName: customer ? customer.name : "Subscriber",
      phone: customer ? customer.phone : "01700000000",
      currentPackage: currPkg,
      currentPrice: currPrice,
      requestedPackage,
      requestedSpeed,
      requestedPrice,
      priceDifference: diff,
      status: "pending",
      requestDate: dateStr,
      notes: notes || "Requested via Subscriber Self-Service Portal",
    };

    setUpgradeRequests(prev => [newReq, ...prev]);
    saveUpgradeRequestToFirestore(newReq);

    activityLogger.log({
      type: "package",
      severity: "info",
      action: "Plan Upgrade Request Submitted",
      detail: `${newReq.customerName} submitted upgrade request to ${requestedPackage} (${requestedSpeed} Mbps).`,
      targetId: customerId,
      metadata: { requestedPackage, requestedSpeed, requestedPrice, diff }
    });

    return newReq;
  };

  const approveUpgradeRequest = (requestId: string) => {
    const target = upgradeRequests.find(r => r.id === requestId);
    if (!target) return { success: false };

    // Apply plan upgrade to subscriber
    changePackage(target.customerId, target.requestedPackage, target.requestedSpeed, target.requestedPrice);

    const respDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const updatedReq: PlanUpgradeRequest = {
      ...target,
      status: "approved" as const,
      adminResponseDate: respDate
    };

    setUpgradeRequests(prev =>
      prev.map(r => (r.id === requestId ? updatedReq : r))
    );
    saveUpgradeRequestToFirestore(updatedReq);

    activityLogger.log({
      type: "package",
      severity: "success",
      action: "Plan Upgrade Approved & Provisioned",
      detail: `Approved upgrade for ${target.customerName} (${target.customerId}) to ${target.requestedPackage}.`,
      targetId: target.customerId,
      metadata: { requestId, package: target.requestedPackage, speed: target.requestedSpeed }
    });

    return { success: true, request: updatedReq };
  };

  const rejectUpgradeRequest = (requestId: string, reason?: string) => {
    const target = upgradeRequests.find(r => r.id === requestId);
    if (!target) return { success: false };

    const respDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const updatedReq: PlanUpgradeRequest = {
      ...target,
      status: "rejected" as const,
      rejectionReason: reason || "Capacity constraint / Admin rejected request",
      adminResponseDate: respDate,
    };

    setUpgradeRequests(prev =>
      prev.map(r => (r.id === requestId ? updatedReq : r))
    );
    saveUpgradeRequestToFirestore(updatedReq);

    activityLogger.log({
      type: "package",
      severity: "warning",
      action: "Plan Upgrade Request Rejected",
      detail: `Rejected upgrade request for ${target.customerName} (${target.customerId}). Reason: ${updatedReq.rejectionReason}.`,
      targetId: target.customerId,
      metadata: { requestId, reason: updatedReq.rejectionReason }
    });

    return { success: true, request: updatedReq };
  };

  const bindMac = (customerId: string, macAddress?: string): { success: boolean; mac: string } => {
    let assignedMac = (macAddress || "").trim().toLowerCase();
    const nowStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const targetCust = customers.find(c => c.id === customerId);

    setCustomers(prev => {
      const target = prev.find(c => c.id === customerId);
      if (!assignedMac && target) {
        assignedMac = (target.mac || target.callingStationId || "").trim().toLowerCase();
      }
      if (!assignedMac || assignedMac === "—") {
        return prev;
      }

      const updated = prev.map(c =>
        c.id === customerId
          ? {
              ...c,
              mac: assignedMac,
              boundMac: assignedMac,
              callingStationId: assignedMac,
              macBound: true,
              macBindDate: nowStr,
            }
          : c
      );

      const targetUpdated = updated.find(c => c.id === customerId);
      if (targetUpdated) saveCustomerToFirestore(targetUpdated);
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    activityLogger.log({
      type: "security",
      severity: "success",
      action: "Hardware MAC Address Locked (Bound)",
      detail: `Locked MAC address ${assignedMac.toUpperCase()} to subscriber ${targetCust?.name || customerId} (${customerId}) for PPPoE security.`,
      targetId: customerId,
      metadata: { mac: assignedMac.toUpperCase(), subscriber: targetCust?.name, pppUser: targetCust?.pppUser }
    });

    return { success: true, mac: assignedMac };
  };

  const unbindMac = (customerId: string): { success: boolean } => {
    const targetCust = customers.find(c => c.id === customerId);
    setCustomers(prev => {
      const updated = prev.map(c =>
        c.id === customerId
          ? {
              ...c,
              macBound: false,
              boundMac: undefined,
              callingStationId: undefined,
            }
          : c
      );

      const targetUpdated = updated.find(c => c.id === customerId);
      if (targetUpdated) saveCustomerToFirestore(targetUpdated);
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    activityLogger.log({
      type: "security",
      severity: "warning",
      action: "Hardware MAC Address Unbound",
      detail: `Released hardware MAC lock for subscriber ${targetCust?.name || customerId} (${customerId}). Subscriber can now authenticate from any device.`,
      targetId: customerId,
      metadata: { prevMac: targetCust?.mac, subscriber: targetCust?.name }
    });

    return { success: true };
  };

  const setUserType = (customerId: string, userType: "normal" | "free" | "unlimited") => {
    updateCustomer(customerId, { userType });
  };

  const bulkSetUserType = (customerIds: string[], userType: "normal" | "free" | "unlimited") => {
    customerIds.forEach(id => {
      updateCustomer(id, { userType });
    });
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        deletedCustomers,
        activeCustomer,
        upgradeRequests,
        setActiveCustomer: cust => setActiveCustomerId(cust ? cust.id : null),
        loginAsCustomer,
        logoutCustomer,
        addCustomer,
        addCustomerAsync,
        addCustomersBulk,
        updateCustomer,
        deleteCustomer,
        restoreCustomer,
        permanentlyPurgeCustomer,
        toggleNetStatus,
        processPayment,
        generateDefaultPasscode,
        bulkUpdateStatus,
        grantExtraDays,
        bindMac,
        unbindMac,
        setUserType,
        bulkSetUserType,
        changePackage,
        submitUpgradeRequest,
        approveUpgradeRequest,
        rejectUpgradeRequest,
        runBillingCutoffEngine,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomerContext() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomerContext must be used within a CustomerProvider");
  }
  return context;
}
