import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
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
  invoices: Invoice[];
  paymentHistory: PaymentTransaction[];
}

import { REAL_ISP_CUSTOMERS } from "../data/realIspData";

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
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const CUSTOMERS_STORAGE_KEY = "isp_customers_store_v12_authentic_194_subscribers";

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      // Purge old cache keys containing stale 195th dummy customer (CUST-10001)
      localStorage.removeItem("isp_customers_store_v11_authentic_netx_macs");
      localStorage.removeItem("isp_customers_store_v10");
      localStorage.removeItem("isp_customers_store_v9");

      const saved = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter((c: any) => c && c.id && !c.id.startsWith("CUST-"));
          if (clean.length > 0) return clean;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CUSTOMERS;
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
        const clean = cloudCustomers.filter(c => c && c.id && !c.id.startsWith("CUST-"));
        if (clean.length > 0) {
          setCustomers(clean);
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
      phone: data.phone || "01700000000",
      email: data.email || `${cleanName}@maabestnetwork.com`,
      address: data.address || "Somitir Hat, Kalkini, Madaripur",
      zone: data.zone || "DHAKA DIVISION",
      subzone: data.subzone || "KALKINI SOMITIR HAT",
      box: data.box || "SOMITIR HAT BAZAR",
      package: data.package || (isFree ? "Complimentary Free Tier (No Cutoff)" : "PIONEER_HOME_20Mbps"),
      profile: data.profile || "PIONEER_HOME_20Mbps",
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
      daysRemaining: isFree || isUnlimited ? 999 : (data.daysRemaining ?? 30),
      dueAmount: isFree ? 0 : (data.dueAmount ?? data.due ?? 0),
      due: isFree ? 0 : (data.due ?? data.dueAmount ?? 0),
      ipAddress: data.ipAddress || `10.200.201.${50 + nextNum}`,
      mac: data.mac || `50:65:F3:11:88:${String(nextNum).padStart(2, "0")}`,
      pppUser: data.pppUser || `mbn@${cleanName}`,
      pppPass: data.pppPass || "123456",
      mikrotik: data.mikrotik || "MikroTik-01",
      olt: data.olt || "OLT-Dhaka-01",
      onuSignal: data.onuSignal || "-18.5 dBm",
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
    saveCustomerToFirestore(newCustomer);
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
        phone: data.phone || "01700000000",
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
        ipAddress: data.ipAddress || `10.200.201.${50 + (nextNum % 200)}`,
        mac: data.mac || `50:65:F3:11:${String(Math.floor(nextNum / 256)).padStart(2, "0")}:${String(nextNum % 256).padStart(2, "0")}`,
        pppUser: data.pppUser || `mbn@${cleanName}`,
        pppPass: data.pppPass || "123456",
        mikrotik: data.mikrotik || "MikroTik-01",
        olt: data.olt || "OLT-Dhaka-01",
        onuSignal: data.onuSignal || "-18.5 dBm",
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

    const target = customers.find(c => c.id === id);
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
        if (c.id === id) {
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

      const target = updated.find(c => c.id === newId);
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
  };

  const deleteCustomer = (id: string) => {
    const target = customers.find(c => c.id === id);
    const targetName = target ? target.name : id;
    setCustomers(prev => {
      const updated = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    deleteCustomerFromFirestore(id);
    activityLogger.log({
      type: "customer",
      severity: "warning",
      action: "Subscriber Account Terminated",
      detail: `Deleted subscriber record for ${targetName} (${id}) from CRM & billing database.`,
      targetId: id
    });
  };

  
  const bulkUpdateStatus = (customerIds: string[], newStatus: CustomerStatus, newNetStatus: "online" | "offline") => {
    setCustomers(prev => {
      const updated = prev.map(c => {
        if (customerIds.includes(c.id)) {
          return { ...c, status: newStatus, netStatus: newNetStatus };
        }
        return c;
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
    const targetCust = customers.find(c => c.id === customerId);
    setCustomers(prev => {
      const updated = prev.map(c => {
        if (c.id === customerId) {
          // Calculate new end date
          let currentEnd = c.endDate ? new Date(c.endDate) : new Date();
          // if invalid date, use now
          if (isNaN(currentEnd.getTime())) {
            currentEnd = new Date();
          }
          currentEnd.setDate(currentEnd.getDate() + extraDays);
          
          const newEndDateStr = currentEnd.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
          
          return { 
            ...c, 
            endDate: newEndDateStr,
            expireDate: newEndDateStr,
            daysRemaining: (c.daysRemaining || 0) + extraDays 
          };
        }
        return c;
      });
      const target = updated.find(c => c.id === customerId);
      if (target) saveCustomerToFirestore(target);
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    activityLogger.log({
      type: "billing",
      severity: "info",
      action: "Grace Period Extended",
      detail: `Granted +${extraDays} days extension for subscriber ${targetCust?.name || customerId} (${customerId}).`,
      targetId: customerId,
      metadata: { extraDays, subscriber: targetCust?.name }
    });
  };

const toggleNetStatus = (id: string, enable: boolean) => {
    const targetCust = customers.find(c => c.id === id);
    setCustomers(prev => {
      const updated = prev.map(c =>
        c.id === id
          ? {
              ...c,
              netStatus: enable ? "online" as const : "offline" as const,
              status: enable ? "active" as CustomerStatus : "suspended" as CustomerStatus,
              disconnectedAt: enable ? undefined : new Date().toISOString(),
              logoutTime: enable
                ? null
                : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
                  " " +
                  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
          : c
      );
      const target = updated.find(c => c.id === id);
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

  const processPayment = (
    customerId: string,
    amount: number,
    method: PaymentTransaction["method"] = "bKash",
    customTrxId?: string,
    customPaymentDate?: Date
  ) => {
    const validAmount = Math.max(1, Math.min(500000, Number(amount) || 0));
    const trxId = customTrxId || `TRX${Math.floor(10000000 + Math.random() * 90000000)}`;
    const now = customPaymentDate || new Date();
    
    // Formatting start date as exact payment date
    const startDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    
    // Calculating end date as exactly 1 month (or 30 days) from payment date
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 1);
    const endDate = expiry.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    
    const billingDay = now.getDate();
    const invoiceId = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${Math.floor(100 + Math.random() * 900)}`;
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

    const targetCust = customers.find(c => c.id === customerId);

    setCustomers(prev => {
      const updated = prev.map(c => {
        if (c.id !== customerId) return c;

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
          status: "active" as CustomerStatus,
          netStatus: "online" as const,
          billingDate: billingDay,
          startDate: startDate,
          endDate: endDate,
          daysRemaining: 30,
          invoices: updatedInvoices,
          paymentHistory: [newPayment, ...c.paymentHistory],
        };
      });

      const target = updated.find(c => c.id === customerId);
      if (target) saveCustomerToFirestore(target);
      return updated;
    });

    activityLogger.log({
      type: "payment",
      severity: "success",
      action: "Invoice Payment Received",
      detail: `Collected ৳${validAmount.toLocaleString()} via ${method} (TrxID: ${trxId}) for ${targetCust?.name || customerId}.`,
      targetId: customerId,
      metadata: { amount: validAmount, method, trxId, invoiceId, validity: `${startDate} to ${endDate}` }
    });

    return { success: true, trxId, invoiceId, startDate, endDate };
  };

  const changePackage = (customerId: string, newPackage: string, newSpeed: string, newPrice: number) => {
    const speeds = newSpeed.split("/").map(s => parseInt(s.trim()) || 30);
    const targetCust = customers.find(c => c.id === customerId);
    setCustomers(prev => {
      const updated = prev.map(c => {
        if (c.id !== customerId) return c;
        return {
          ...c,
          package: newPackage,
          speed: newSpeed,
          downloadSpeedMbps: speeds[0] || 30,
          uploadSpeedMbps: speeds[1] || 15,
          price: newPrice,
        };
      });
      const target = updated.find(c => c.id === customerId);
      if (target) saveCustomerToFirestore(target);
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

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
    const customer = customers.find(c => c.id === customerId);
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
      if (!assignedMac) {
        assignedMac = `4c:46:d1:${Math.floor(10 + Math.random() * 89).toString(16)}:${Math.floor(10 + Math.random() * 89).toString(16)}:${Math.floor(10 + Math.random() * 89).toString(16)}`;
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
