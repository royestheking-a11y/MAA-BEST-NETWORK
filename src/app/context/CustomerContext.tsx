import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  subscribeToCustomers,
  subscribeToUpgradeRequests,
  saveCustomerToFirestore,
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
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  invoices: Invoice[];
  paymentHistory: PaymentTransaction[];
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
  activeCustomer: Customer | null;
  upgradeRequests: PlanUpgradeRequest[];
  setActiveCustomer: (customer: Customer | null) => void;
  loginAsCustomer: (identifier: string, passcode?: string) => { success: boolean; customer?: Customer; error?: string };
  logoutCustomer: () => void;
  addCustomer: (newCustomer: Partial<Customer>) => Customer;
  addCustomerAsync: (newCustomer: Partial<Customer>) => Promise<{ success: boolean; customer: Customer; error?: string; alreadyExists?: boolean }>;
  addCustomersBulk: (newCustomers: Partial<Customer>[]) => Customer[];
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
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

export function normalizeCustomerPackage(c: Customer): Customer {
  const isOldPkg = !c.package || c.package === "20Mbps" || c.package === "10 Mbps Basic" || c.package.includes("PIONEER");
  const pkg = isOldPkg ? "35M" : c.package;
  const prof = isOldPkg ? "35M" : (c.profile || "35M");
  const speed = pkg === "35M" ? "35/35" : (pkg === "50M" ? "50/50" : (pkg === "80M" ? "80/80" : (pkg === "100M" ? "100/100" : (c.speed || "35/35"))));
  const down = pkg === "35M" ? 35 : (pkg === "50M" ? 50 : (pkg === "80M" ? 80 : (pkg === "100M" ? 100 : (c.downloadSpeedMbps || 35))));
  const up = pkg === "35M" ? 35 : (pkg === "50M" ? 50 : (pkg === "80M" ? 80 : (pkg === "100M" ? 100 : (c.uploadSpeedMbps || 35))));
  const signal = c.onuSignal === "-18.5 dBm" ? "—" : (c.onuSignal || "—");

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
    const end = new Date(endDate);
    if (!isNaN(end.getTime())) {
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
    price: c.price || 500,
    monthlyBill: c.monthlyBill || 500,
    serverName: "DC-CA",
    onuSignal: signal,
    endDate,
    expireDate,
    daysRemaining,
  };
}

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      // Purge old cache keys containing stale 195th dummy customer or hardcoded signals or legacy package names
      localStorage.removeItem("isp_customers_store_v14_authentic_194_fixed");
      localStorage.removeItem("isp_customers_store_v13_live_laser_and_synced");
      localStorage.removeItem("isp_customers_store_v12_authentic_194_subscribers");
      localStorage.removeItem("isp_customers_store_v11_authentic_netx_macs");
      localStorage.removeItem("isp_customers_store_v10");
      localStorage.removeItem("isp_customers_store_v9");

      const saved = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // normalizeCustomerPackage handles stale-date migration and daysRemaining recalculation
          const clean = parsed
            .filter((c: any) => c && c.id && !c.id.startsWith("CUST-") && !c.id.toLowerCase().includes("test") && !c.name.toLowerCase().includes("test"))
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
    // 1. Ensure initial customer roster is present in Cloud Firestore in background (single atomic batch)
    seedInitialFirestoreDataIfEmpty(INITIAL_CUSTOMERS, INITIAL_UPGRADE_REQUESTS);

    // 2. Subscribe to realtime updates for customers
    const unsubCustomers = subscribeToCustomers(cloudCustomers => {
      if (cloudCustomers && cloudCustomers.length > 0) {
        const clean = cloudCustomers.filter(c => c && c.id && !c.id.startsWith("CUST-") && !c.id.toLowerCase().includes("test") && !c.name.toLowerCase().includes("test"));
        if (clean.length > 0) {
          // normalizeCustomerPackage already handles stale-date migration,
          // daysRemaining recalculation, and package normalization.
          const refreshed = clean.map(c => normalizeCustomerPackage(c));

          // ── SMART MERGE: cloud data + local state, local wins for critical fields ──
          // Problem: Firestore listener fires with OLD data during the 1-2s write lag
          // after payment/enable. A full replacement would revert local state to
          // stale Firestore data, causing the "enable→offline" / "recharge→sudden off"
          // visible within 1-2 seconds. Fix: merge and let local paid/enabled state win.
          setCustomers(prev => {
            return refreshed.map(cloudCust => {
              const local = prev.find(p =>
                p.id === cloudCust.id ||
                p.clientCode === cloudCust.clientCode ||
                (p.pppUser && p.pppUser === cloudCust.pppUser)
              );
              if (!local) return cloudCust; // New customer from cloud — accept as-is

              // Priority guards: local wins when admin enabled/disabled or payment cleared balance
              const locallyPaid  = local.status === "active" && (local.dueAmount === 0 || local.due === 0);
              const adminEnabled = local.disabledInMikrotik === false;
              const adminDisabled = local.disabledInMikrotik === true && local.status === "suspended";
              const localWins    = locallyPaid || adminEnabled || adminDisabled;

              // Determine the better endDate (the later one wins)
              const localEndDate = local.endDate ? new Date(local.endDate) : null;
              const cloudEndDate = cloudCust.endDate ? new Date(cloudCust.endDate) : null;
              const localEndLater = localEndDate && cloudEndDate && !isNaN(localEndDate.getTime()) && !isNaN(cloudEndDate.getTime()) && localEndDate > cloudEndDate;
              const bestEndDate = localEndLater ? local.endDate : cloudCust.endDate;
              const bestDaysRemaining = bestEndDate ? Math.ceil((new Date(bestEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : cloudCust.daysRemaining;

              if (localWins) {
                // Local state is fresh (just paid or just enabled) — use cloud for non-critical
                // fields (signal, mac, ip, server, etc.) but keep local for status/billing
                return {
                  ...cloudCust,            // cloud fields as base (pkg, signal, server, etc.)
                  ...local,               // overlay ALL local fields
                  endDate: bestEndDate,    // then apply the better endDate
                  expireDate: bestEndDate,
                  daysRemaining: bestDaysRemaining,
                };
              }

              // Cloud wins — but still use the later endDate
              return { ...cloudCust, endDate: bestEndDate, expireDate: bestEndDate, daysRemaining: bestDaysRemaining };
            });
          });
        }
      }
    });

    // 3. Subscribe to realtime updates for upgrade requests
    const unsubUpgrades = subscribeToUpgradeRequests(cloudRequests => {
      if (cloudRequests && cloudRequests.length > 0) {
        setUpgradeRequests(cloudRequests);
      }
    });

    return () => {
      unsubCustomers();
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

        setCustomers(prev => {
          let hasChange = false;
          const matchedNetxIds = new Set<string>();

          // 1. Update existing customers with live billing, status, and telemetry
          const updated = prev.map(c => {
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
              if (c.onuSignal === "-18.5 dBm") {
                hasChange = true;
                return { ...c, onuSignal: "—" };
              }
              return c;
            }

            // Connection & Line State
            // CRITICAL: If admin manually enabled the customer (disabledInMikrotik: false),
            // the NetX API still shows "disabled" for up to 20–60s while MikroTik syncs.
            // We must NOT let the stale API response re-disable the customer.
            // Rule: local admin override (disabledInMikrotik: false) wins over stale API data.
            const apiSaysDisabled = netxMatch?.status === "disabled";
            const isLineDisabled = c.disabledInMikrotik === true ||
              (apiSaysDisabled && c.disabledInMikrotik !== false);
            // IMPORTANT: Only flip to offline if API *explicitly* confirms offline.
            // If there's no live signal, preserve current status to prevent flicker
            // (e.g. after payment or manual enable, API takes time to reflect new state).
            const newNetStatus: "online" | "offline" = isLineDisabled
              ? "offline"
              : (liveMatch?.connection_status === "online" || netxMatch?.connection_status === "online")
                ? "online"
                : liveMatch?.connection_status === "offline"
                  ? "offline"
                  : c.netStatus; // Preserve existing status — no explicit API signal

            const newSignal = (liveMatch?.onu_rx_power !== null && liveMatch?.onu_rx_power !== undefined)
              ? `${liveMatch.onu_rx_power} dBm`
              : (newNetStatus === "online" ? c.onuSignal || "—" : "Offline");
            const newIp = liveMatch?.live_ip || c.ipAddress;
            const newMac = liveMatch?.live_mac || netxMatch?.onu_mac || c.mac;
            const newUptime = liveMatch?.live_uptime || c.sessionUptime;

            // Live MikroTik package & pricing
            const livePkg = netxMatch?.package_name || liveMatch?.package_name || c.package || "35M";
            const livePrice = netxMatch?.package_price ? Number(netxMatch.package_price) : (netxMatch?.monthly_bill ? Number(netxMatch.monthly_bill) : (liveMatch?.package_price ? Number(liveMatch.package_price) : c.price));
            const liveSpeed = livePkg === "35M" ? "35/35" : (livePkg === "50M" ? "50/50" : (livePkg === "80M" ? "80/80" : (livePkg === "100M" ? "100/100" : (livePkg === "10 Mbps" ? "10/10" : c.speed))));
            const liveDown = livePkg === "35M" ? 35 : (livePkg === "50M" ? 50 : (livePkg === "80M" ? 80 : (livePkg === "100M" ? 100 : (livePkg === "10 Mbps" ? 10 : c.downloadSpeedMbps))));
            const liveUp = livePkg === "35M" ? 35 : (livePkg === "50M" ? 50 : (livePkg === "80M" ? 80 : (livePkg === "100M" ? 100 : (livePkg === "10 Mbps" ? 10 : c.uploadSpeedMbps))));

            // ── HYBRID DUE AMOUNT ─────────────────────────────────────────────────
            // PRIORITY: local paid state always beats stale API due balance.
            // Case A: free/unlimited            → always 0
            // Case B: API due > 0              → only use if local ALSO confirms unpaid
            //   Guard 1: locally paid (amt=0+active) → preserve 0
            //   Guard 2: admin just enabled (disabledInMikrotik:false) → preserve 0
            // Case C: API explicitly says 0    → 0
            // Case D: API has no due field     → keep local c.dueAmount (preserve, don't reset)
            const rawNetxDue = netxMatch?.due_amount !== undefined ? Number(netxMatch.due_amount) : undefined;
            let liveDueAmount: number;
            if (c.userType === "free" || c.userType === "unlimited") {
              liveDueAmount = 0;
            } else if (rawNetxDue !== undefined && rawNetxDue > 0) {
              const locallyPaid = (c.dueAmount === 0 || c.due === 0) && c.status === "active";
              liveDueAmount = locallyPaid ? 0 : rawNetxDue;
            } else if (rawNetxDue === 0) {
              liveDueAmount = 0; // API explicitly cleared
            } else {
              liveDueAmount = c.dueAmount ?? c.due ?? 0; // No API data — preserve local
            }

            const liveMonthlyBill = netxMatch?.monthly_bill !== undefined ? Number(netxMatch.monthly_bill) : (livePrice || c.monthlyBill);

            // ── HYBRID LIFECYCLE STATUS ───────────────────────────────────────────
            // Status is DERIVED from actual state, NOT blindly from API status string.
            // Priority: disabled > due+balance > balance=0 resolve > API confirms active > keep
            let computedStatus: CustomerStatus = c.status;
            if (isLineDisabled) {
              computedStatus = "suspended"; // Line is definitely disabled
            } else if (liveDueAmount > 0 && netxMatch?.is_due) {
              computedStatus = "due"; // API confirms unpaid and we have real balance
            } else if (liveDueAmount === 0) {
              if (c.status === "due") {
                computedStatus = "active"; // Balance cleared → upgrade
              } else if (c.status === "suspended" && (c.disabledInSystem === false || c.disabledInMikrotik === false)) {
                computedStatus = "active"; // Admin manually re-enabled → clear suspended
              } else if ((netxMatch?.status === "active" || newNetStatus === "online") && c.status !== "active" && c.status !== "disconnected") {
                computedStatus = "active"; // API/live confirms line is up → sync
              }
              // else: keep current (already active, or intentionally disconnected)
            } else if (netxMatch?.status === "active" && liveDueAmount === 0) {
              computedStatus = "active";
            }

            // ── HYBRID EXPIRY DATE & DAYS REMAINING ──────────────────────────────
            // PRIORITY: always trust the LATER date (never undo a recent payment/renewal).
            // KEY: Always recalculate daysRemaining from the final endDate so the billing
            // engine has FRESH values — never relies on stale cached daysRemaining field.
            let newEndDate = c.endDate;
            let newDaysRemaining = c.daysRemaining;
            if (netxMatch?.expiry_date) {
              const apiExpiry = new Date(netxMatch.expiry_date);
              if (!isNaN(apiExpiry.getTime())) {
                const localExpiry = c.endDate ? new Date(c.endDate) : null;
                if (!localExpiry || isNaN(localExpiry.getTime()) || apiExpiry > localExpiry) {
                  // API date is further in future — accept it
                  newEndDate       = apiExpiry.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                  newDaysRemaining = Math.ceil((apiExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                } else {
                  // Local date is later (post-payment) — keep local, but recalc days from it
                  newDaysRemaining = Math.ceil((localExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                }
              }
            } else if (c.endDate && c.endDate !== "Permanent / Lifetime") {
              // No API expiry data — always recalculate daysRemaining from local endDate.
              // This keeps billing engine fresh instead of waiting for hourly batch recalc.
              const localExpiry = new Date(c.endDate);
              if (!isNaN(localExpiry.getTime())) {
                newDaysRemaining = Math.ceil((localExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              }
            }

            if (
              c.netStatus !== newNetStatus ||
              c.onuSignal !== newSignal ||
              c.ipAddress !== newIp ||
              c.mac !== newMac ||
              c.package !== livePkg ||
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
                package: livePkg,
                profile: livePkg,
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
          const end = new Date(c.endDate);
          if (!isNaN(end.getTime())) {
            const diffMs = end.getTime() - now.getTime();
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
        const clean = customers.filter(c => c && c.id && !c.id.startsWith("CUST-"));
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
        c.id.toLowerCase() === cleanId ||
        (c.clientCode && c.clientCode.toLowerCase() === cleanId) ||
        c.phone.replace(/\D/g, "") === cleanId.replace(/\D/g, "") ||
        c.pppUser.toLowerCase() === cleanId ||
        c.email.toLowerCase() === cleanId
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

    const speedVal = data.speed || "20/10";
    const speeds = speedVal.split("/").map(s => parseInt(s.trim()) || 20);
    const cleanName = (data.name || `client${nextNum}`).toLowerCase().replace(/[^a-z0-9]/g, "");

    const userType = data.userType || "normal";
    const isFree = userType === "free";
    const isUnlimited = userType === "unlimited";

    const newCustomer: Customer = {
      name: data.name || `Mbn@${cleanName}`,
      phone: data.phone || `01712-${String(100000 + ((nextNum * 137) % 900000))}`,
      email: data.email || `${cleanName}@maabestnetwork.com`,
      address: data.address || "Somitir Hat, Kalkini, Madaripur",
      zone: data.zone || "DHAKA DIVISION",
      subzone: data.subzone || "KALKINI SOMITIR HAT",
      box: data.box || "SOMITIR HAT BAZAR",
      package: data.package || (isFree ? "Complimentary Free Tier (No Cutoff)" : "PIONEER_HOME_20Mbps"),
      profile: data.profile || (isFree ? "default" : (data.package || "PIONEER_HOME_20Mbps")),
      serverName: data.serverName || "RETAIL_1",
      service: data.service || "pppoe",
      connectionType: data.connectionType || "Optical Fiber",
      speed: speedVal,
      downloadSpeedMbps: speeds[0] || 20,
      uploadSpeedMbps: speeds[1] || 10,
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
      id: newId,
      clientCode: newId,
      passcode: data.passcode || defaultPass,
      userType: userType,
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
      const pppPass = newCustomer.pppPass || "123456";
      const profile = newCustomer.package || newCustomer.profile || "35M";
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
          package: newCustomer.package,
          zone: newCustomer.zone
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
          zone: newCustomer.zone
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
      const updated = prev.map(c => {
        if (c.id === id || c.clientCode === id || c.pppUser === id) {
          const finalUserType = updates.userType !== undefined ? updates.userType : c.userType || "normal";
          const isFree = finalUserType === "free";
          const isUnlimited = finalUserType === "unlimited";

          return {
            ...c,
            ...updates,
            id: newId,
            clientCode: newId,
            userType: finalUserType,
            ...(isFree ? {
              dueAmount: 0,
              due: 0,
              price: 0,
              monthlyBill: 0,
              status: "active" as CustomerStatus,
              netStatus: "online" as const,
              disabledInMikrotik: false,
              disabledInSystem: false,
            } : {}),
            ...(isUnlimited ? {
              disabledInMikrotik: false,
              disabledInSystem: false,
              status: (updates.status === "suspended" ? "active" as CustomerStatus : (updates.status || c.status)),
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

  const deleteCustomer = (id: string) => {
    const target = customers.find(c => c.id === id || c.clientCode === id);
    const targetName = target ? target.name : id;
    const targetPppUser = target?.pppUser || (target?.name ? `mbn@${target.name.toLowerCase().replace(/[^a-z0-9]/g, "")}` : undefined);
    const targetDocId = target?.id || id;
    const targetClientCode = target?.clientCode;

    setCustomers(prev => {
      const updated = prev.filter(c => c.id !== id && c.clientCode !== id && c.id !== targetDocId);
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Delete document from Firestore
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
      action: "Subscriber Account Terminated",
      detail: `Deleted subscriber record for ${targetName} (${id}) from CRM & billing database.`,
      targetId: id
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
          const currentEnd = c.endDate ? new Date(c.endDate) : null;
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
          // Calculate new end date
          let currentEnd = c.endDate ? new Date(c.endDate) : new Date();
          if (isNaN(currentEnd.getTime())) {
            currentEnd = new Date();
          }
          if (currentEnd < new Date()) {
            currentEnd = new Date();
          }
          currentEnd.setDate(currentEnd.getDate() + extraDays);

          const newEndDateStr = currentEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
          const newDays = Math.max(1, (c.daysRemaining && c.daysRemaining > 0 ? c.daysRemaining : 0) + extraDays);
          const wasSuspended = c.status === "suspended" || c.disabledInMikrotik;
          if (wasSuspended) {
            shouldReactivate = true;
          }

          return {
            ...c,
            endDate: newEndDateStr,
            expireDate: newEndDateStr,
            daysRemaining: newDays,
            ...(wasSuspended ? {
              status: "active" as CustomerStatus,
              netStatus: "online" as const,
              disabledInMikrotik: false,
              disabledInSystem: false,
              disconnectedAt: undefined,
              logoutTime: null,
            } : {})
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
        action: "Subscriber Line Auto-Reactivated on MikroTik",
        detail: `PPPoE secret restored & unblocked for ${targetCust.name} (${targetCust.pppUser || targetCust.id}) following grace period extension.`,
        targetId: customerId,
      });
    }

    activityLogger.log({
      type: "billing",
      severity: "info",
      action: "Grace Period Extended",
      detail: `Granted +${extraDays} days extension for subscriber ${targetCust?.name || customerId} (${customerId}).`,
      targetId: customerId,
      metadata: { extraDays, subscriber: targetCust?.name }
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
          const currentEnd = c.endDate ? new Date(c.endDate) : null;
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

        const rawDue = c.dueAmount !== undefined ? c.dueAmount : (c.due !== undefined ? c.due : 0);
        // CRITICAL FIX: Only consider a customer "due" if they have an actual positive balance.
        // Checking c.status === "due" was causing ALL customers with status "due" (even
        // dueAmount=0 after payment) to be auto-suspended every 60 seconds.
        const hasDue = rawDue > 0;
        // CRITICAL FIX 2: Use ONLY the endDate date-comparison — NOT daysRemaining.
        // daysRemaining is recalculated only every hour so it can be stale.
        // A customer who just paid (endDate = today+30) could still have daysRemaining = -5
        // from the old data, causing instant re-suspension right after payment.
        const isExpired = c.endDate ? (new Date(c.endDate) < now) : false;

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
          daysRemaining: Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
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
