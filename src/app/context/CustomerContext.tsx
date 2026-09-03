import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import {
  subscribeToCustomers,
  subscribeToUpgradeRequests,
  saveCustomerToFirestore,
  saveUpgradeRequestToFirestore,
  seedInitialFirestoreDataIfEmpty,
  deleteCustomerFromFirestore
} from "../../lib/firestoreService";

export type CustomerStatus = "active" | "offline" | "due" | "suspended" | "disconnected";

export interface Invoice {
  id: string;
  month: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "paid" | "due" | "overdue";
  paymentMethod?: string;
  trxId?: string;
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
  connectionType?: "Optical Fiber" | "Cat6" | "Wireless" | "Coaxial";
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
  logoutTime?: string; // e.g. "28/08/2026 10:30:06 PM"
  billingDate: number;
  startDate: string; // e.g. "10 Aug 2026"
  endDate: string; // e.g. "10 Sep 2026"
  daysRemaining: number;
  dueAmount: number;
  due?: number;
  ipAddress: string;
  mac: string;
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
  disabledInMikrotik?: boolean;
  disabledInSystem?: boolean;
  profileMismatch?: boolean;
  invoices: Invoice[];
  paymentHistory: PaymentTransaction[];
}

import { REAL_ISP_CUSTOMERS } from "../data/realIspData";

export const INITIAL_CUSTOMERS: Customer[] = REAL_ISP_CUSTOMERS;

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
  adminResponseDate?: string;
  rejectionReason?: string;
}

export const INITIAL_UPGRADE_REQUESTS: PlanUpgradeRequest[] = [];

interface CustomerContextType {
  customers: Customer[];
  activeCustomer: Customer | null;
  upgradeRequests: PlanUpgradeRequest[];
  setActiveCustomer: (customer: Customer | null) => void;
  loginAsCustomer: (identifier: string, passcode?: string) => { success: boolean; customer?: Customer; error?: string };
  logoutCustomer: () => void;
  addCustomer: (newCustomer: Partial<Customer>) => Customer;
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

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem("isp_customers_store_v11_authentic_netx_macs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_CUSTOMERS.length) {
          return parsed;
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
        setCustomers(cloudCustomers);
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
      localStorage.setItem("isp_customers_store_v11_authentic_netx_macs", JSON.stringify(customers));
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

    const newCustomer: Customer = {
      id: newId,
      clientCode: newId,
      passcode: defaultPass,
      name: data.name || `Mbn@${cleanName}`,
      phone: data.phone || "01700000000",
      email: data.email || `${cleanName}@maabestnetwork.com`,
      address: data.address || "Somitir Hat, Kalkini, Madaripur",
      zone: data.zone || "DHAKA DIVISION",
      subzone: data.subzone || "KALKINI SOMITIR HAT",
      box: data.box || "SOMITIR HAT BAZAR",
      package: data.package || "PIONEER_HOME_20Mbps",
      profile: data.profile || "PIONEER_HOME_20Mbps",
      serverName: data.serverName || "RETAIL_1",
      service: data.service || "pppoe",
      connectionType: data.connectionType || "Optical Fiber",
      speed: speedVal,
      downloadSpeedMbps: speeds[0] || 20,
      uploadSpeedMbps: speeds[1] || 10,
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
      ipAddress: data.ipAddress || `10.200.201.${50 + nextNum}`,
      mac: data.mac || `50:65:F3:11:88:${String(nextNum).padStart(2, "0")}`,
      pppUser: data.pppUser || `mbn@${cleanName}`,
      pppPass: data.pppPass || "123456",
      mikrotik: data.mikrotik || "MikroTik-01",
      olt: data.olt || "OLT-Dhaka-01",
      onuSignal: "-18.5 dBm",
      sessionUptime: "0d 0h 0m",
      monthlyUsageGB: 0,
      joinDate: data.joinDate || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      clientType: data.clientType || "Home",
      billingStatus: data.billingStatus || "Monthly",
      invoices: data.invoices || [],
      paymentHistory: data.paymentHistory || [],
    };

    setCustomers(prev => [newCustomer, ...prev]);
    saveCustomerToFirestore(newCustomer);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, ...updates } : c));
      const target = updated.find(c => c.id === id);
      if (target) saveCustomerToFirestore(target);
      return updated;
    });
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    deleteCustomerFromFirestore(id);
  };

  const toggleNetStatus = (id: string, enable: boolean) => {
    setCustomers(prev => {
      const updated = prev.map(c =>
        c.id === id
          ? {
              ...c,
              netStatus: enable ? "online" as const : "offline" as const,
              status: enable ? "active" as CustomerStatus : "suspended" as CustomerStatus,
            }
          : c
      );
      const target = updated.find(c => c.id === id);
      if (target) saveCustomerToFirestore(target);
      return updated;
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

    return { success: true, trxId, invoiceId, startDate, endDate };
  };

  const changePackage = (customerId: string, newPackage: string, newSpeed: string, newPrice: number) => {
    const speeds = newSpeed.split("/").map(s => parseInt(s.trim()) || 30);
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
      return updated;
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

    return { success: true, request: updatedReq };
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
        updateCustomer,
        deleteCustomer,
        toggleNetStatus,
        processPayment,
        generateDefaultPasscode,
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
