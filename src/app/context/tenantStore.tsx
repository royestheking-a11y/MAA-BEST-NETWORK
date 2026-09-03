import React, { createContext, useContext, useState, useEffect } from "react";

export interface TenantConfig {
  id: string;
  name: string;
  tagline: string;
  slug: string;
  logoText: string;
  logoBg: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  portalDomain: string;
  resellerDomain: string;
  hotline: string;
  supportEmail: string;
  address: string;
  licenseNo: string;
  binNo: string;
  invoicePrefix: string;
  smsSenderId: string;
  loginHeadline: string;
  loginSubline: string;
  totalSubscribers: number;
  activeMRR: number;
  currency: string;
  btrcCategory: "Nationwide" | "Zonal" | "Category A" | "Category B";
  onboardingCompleted: boolean;
  setupChecklist: {
    companyProfile: boolean;
    branding: boolean;
    customDomain: boolean;
    mikrotikConfig: boolean;
    oltConfig: boolean;
    packagesSetup: boolean;
    paymentGateway: boolean;
    smsGateway: boolean;
    billingRules: boolean;
    customersImported: boolean;
  };
}

export const DEFAULT_TENANTS: Record<string, TenantConfig> = {
  "maa-best": {
    id: "maa-best",
    name: "MAA BEST NETWORK",
    tagline: "Ultra-Fast Gigabit Fiber & Enterprise Connectivity",
    slug: "maabest",
    logoText: "MBN",
    logoBg: "linear-gradient(135deg, #8B2020 0%, #C43535 100%)",
    primaryColor: "#8B2020",
    secondaryColor: "#C43535",
    customDomain: "billing.maabestnetwork.com",
    portalDomain: "portal.maabestnetwork.com",
    resellerDomain: "reseller.maabestnetwork.com",
    hotline: "09611-223344",
    supportEmail: "support@maabestnetwork.com",
    address: "Holding 12, Main Road, Block B, Dhaka, Bangladesh",
    licenseNo: "BTRC/ISP-NAT-2024/782",
    binNo: "001928471-0101",
    invoicePrefix: "MBN-INV",
    smsSenderId: "MAA_BEST",
    loginHeadline: "MAA BEST NETWORK — High Speed Fiber Control",
    loginSubline: "Manage customers, billing, MikroTik routers, OLTs & revenue from one intelligent platform.",
    totalSubscribers: 12840,
    activeMRR: 12450000,
    currency: "৳",
    btrcCategory: "Nationwide",
    onboardingCompleted: true,
    setupChecklist: {
      companyProfile: true,
      branding: true,
      customDomain: true,
      mikrotikConfig: true,
      oltConfig: true,
      packagesSetup: true,
      paymentGateway: true,
      smsGateway: true,
      billingRules: true,
      customersImported: true,
    },
  },
  "abc-isp": {
    id: "abc-isp",
    name: "MAA BEST NETWORK",
    tagline: "Ultra-Fast Gigabit Fiber & Enterprise Connectivity",
    slug: "maabest",
    logoText: "MBN",
    logoBg: "linear-gradient(135deg, #8B2020 0%, #C43535 100%)",
    primaryColor: "#8B2020",
    secondaryColor: "#C43535",
    customDomain: "billing.maabestnetwork.com",
    portalDomain: "portal.maabestnetwork.com",
    resellerDomain: "reseller.maabestnetwork.com",
    hotline: "09611-223344",
    supportEmail: "support@maabestnetwork.com",
    address: "Holding 12, Main Road, Block B, Dhaka, Bangladesh",
    licenseNo: "BTRC/ISP-NAT-2024/782",
    binNo: "001928471-0101",
    invoicePrefix: "MBN-INV",
    smsSenderId: "MAA_BEST",
    loginHeadline: "MAA BEST NETWORK — High Speed Fiber Control",
    loginSubline: "Manage customers, billing, MikroTik routers, OLTs & revenue from one intelligent platform.",
    totalSubscribers: 12840,
    activeMRR: 12450000,
    currency: "৳",
    btrcCategory: "Nationwide",
    onboardingCompleted: true,
    setupChecklist: {
      companyProfile: true,
      branding: true,
      customDomain: true,
      mikrotikConfig: true,
      oltConfig: true,
      packagesSetup: true,
      paymentGateway: true,
      smsGateway: true,
      billingRules: true,
      customersImported: true,
    },
  },
  "metronet-bd": {
    id: "metronet-bd",
    name: "MetroNet Fiber BD",
    tagline: "Next-Gen Gigabit Broadband for Home & Enterprise",
    slug: "metronet",
    logoText: "MN",
    logoBg: "linear-gradient(135deg, #7A1C1C 0%, #B91C1C 100%)",
    primaryColor: "#7A1C1C",
    secondaryColor: "#B91C1C",
    customDomain: "ops.metronetbd.net",
    portalDomain: "my.metronetbd.net",
    resellerDomain: "partner.metronetbd.net",
    hotline: "09678-889900",
    supportEmail: "noc@metronetbd.net",
    address: "Tower 5, Sector 3, Uttara, Dhaka-1230",
    licenseNo: "BTRC/ISP-ZONAL-2023/419",
    binNo: "002849182-0103",
    invoicePrefix: "MN-INV",
    smsSenderId: "METRONET",
    loginHeadline: "MetroNet High-Speed Operations Center",
    loginSubline: "Unified network automation, PPPoE accounting and real-time monitoring.",
    totalSubscribers: 8420,
    activeMRR: 8900000,
    currency: "৳",
    btrcCategory: "Zonal",
    onboardingCompleted: true,
    setupChecklist: {
      companyProfile: true,
      branding: true,
      customDomain: true,
      mikrotikConfig: true,
      oltConfig: true,
      packagesSetup: true,
      paymentGateway: true,
      smsGateway: true,
      billingRules: true,
      customersImported: true,
    },
  },
  "citylink-fiber": {
    id: "citylink-fiber",
    name: "CityLink Broadband",
    tagline: "Reliable Fiber Optic Internet Solutions",
    slug: "citylink",
    logoText: "CL",
    logoBg: "linear-gradient(135deg, #6B1717 0%, #991B1B 100%)",
    primaryColor: "#6B1717",
    secondaryColor: "#991B1B",
    customDomain: "admin.citylink.com.bd",
    portalDomain: "selfcare.citylink.com.bd",
    resellerDomain: "agent.citylink.com.bd",
    hotline: "09602-112233",
    supportEmail: "info@citylink.com.bd",
    address: "GEC Circle, Nasirabad, Chittagong",
    licenseNo: "BTRC/ISP-CAT-A-2024/112",
    binNo: "003918273-0104",
    invoicePrefix: "CL-INV",
    smsSenderId: "CITYLINK",
    loginHeadline: "CityLink Network & Billing Gateway",
    loginSubline: "Intelligent bandwidth provisioning and automated financial settlement.",
    totalSubscribers: 5160,
    activeMRR: 5400000,
    currency: "৳",
    btrcCategory: "Category A",
    onboardingCompleted: true,
    setupChecklist: {
      companyProfile: true,
      branding: true,
      customDomain: true,
      mikrotikConfig: true,
      oltConfig: true,
      packagesSetup: true,
      paymentGateway: true,
      smsGateway: true,
      billingRules: true,
      customersImported: true,
    },
  },
};

export interface TempSupportSession {
  active: boolean;
  technician: string;
  reason: string;
  expiresAt: string;
}

interface TenantContextType {
  tenants: Record<string, TenantConfig>;
  activeTenantId: string;
  activeTenant: TenantConfig;
  setTenantId: (id: string) => void;
  updateTenantConfig: (updates: Partial<TenantConfig>) => void;
  isSuperAdminMode: boolean;
  setSuperAdminMode: (val: boolean) => void;
  tempSupportSession: TempSupportSession | null;
  startTempSupportSession: (reason: string, minutes?: number) => void;
  endTempSupportSession: () => void;
  customerPortalOpen: boolean;
  setCustomerPortalOpen: (open: boolean) => void;
  selectedPortalCustomer: any | null;
  openCustomerPortalFor: (customer: any) => void;
  resellerPortalOpen: boolean;
  setResellerPortalOpen: (open: boolean) => void;
  selectedPortalReseller: any | null;
  openResellerPortalFor: (reseller: any) => void;
  customerMapOpen: boolean;
  setCustomerMapOpen: (open: boolean) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenants, setTenants] = useState<Record<string, TenantConfig>>(() => {
    const saved = localStorage.getItem("ips_bd_tenants_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved tenants", e);
      }
    }
    return DEFAULT_TENANTS;
  });

  const [activeTenantId, setActiveTenantIdState] = useState<string>(() => {
    return localStorage.getItem("ips_bd_active_tenant_id") || "abc-isp";
  });

  const [isSuperAdminMode, setSuperAdminMode] = useState<boolean>(false);
  const [tempSupportSession, setTempSupportSession] = useState<TempSupportSession | null>(null);

  // Portal Modals State
  const [customerPortalOpen, setCustomerPortalOpen] = useState(false);
  const [selectedPortalCustomer, setSelectedPortalCustomer] = useState<any | null>(null);

  const [resellerPortalOpen, setResellerPortalOpen] = useState(false);
  const [selectedPortalReseller, setSelectedPortalReseller] = useState<any | null>(null);

  const [customerMapOpen, setCustomerMapOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("ips_bd_tenants_v1", JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem("ips_bd_active_tenant_id", activeTenantId);
  }, [activeTenantId]);

  const activeTenant = tenants[activeTenantId] || tenants["abc-isp"] || DEFAULT_TENANTS["abc-isp"];

  const setTenantId = (id: string) => {
    if (tenants[id]) {
      setActiveTenantIdState(id);
    }
  };

  const updateTenantConfig = (updates: Partial<TenantConfig>) => {
    setTenants(prev => {
      const current = prev[activeTenantId] || DEFAULT_TENANTS["abc-isp"];
      return {
        ...prev,
        [activeTenantId]: {
          ...current,
          ...updates,
        },
      };
    });
  };

  const startTempSupportSession = (reason: string, minutes: number = 30) => {
    const expires = new Date(Date.now() + minutes * 60 * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setTempSupportSession({
      active: true,
      technician: "Senior NOC Engineer (IPS BD Platform)",
      reason,
      expiresAt: expires,
    });
  };

  const endTempSupportSession = () => {
    setTempSupportSession(null);
  };

  const openCustomerPortalFor = (customer: any) => {
    setSelectedPortalCustomer(customer);
    setCustomerPortalOpen(true);
  };

  const openResellerPortalFor = (reseller: any) => {
    setSelectedPortalReseller(reseller);
    setResellerPortalOpen(true);
  };

  return (
    <TenantContext.Provider
      value={{
        tenants,
        activeTenantId,
        activeTenant,
        setTenantId,
        updateTenantConfig,
        isSuperAdminMode,
        setSuperAdminMode,
        tempSupportSession,
        startTempSupportSession,
        endTempSupportSession,
        customerPortalOpen,
        setCustomerPortalOpen,
        selectedPortalCustomer,
        openCustomerPortalFor,
        resellerPortalOpen,
        setResellerPortalOpen,
        selectedPortalReseller,
        openResellerPortalFor,
        customerMapOpen,
        setCustomerMapOpen,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return ctx;
}
