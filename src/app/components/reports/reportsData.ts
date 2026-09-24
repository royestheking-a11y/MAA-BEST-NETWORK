export interface RevenueReportRow {
  period: string;
  invoicesGenerated: number;
  totalBilled: number;
  totalCollected: number;
  bkashCollected: number;
  nagadCollected: number;
  cashCollected: number;
  unpaidDue: number;
  collectionRate: number; // percentage
}

export interface CustomerReportRow {
  zone: string;
  activeUsers: number;
  newAdditions: number;
  churnedUsers: number;
  netGrowth: number;
  growthRate: string;
}

export interface NetworkUptimeRow {
  element: string;
  type: string;
  uptimePercentage: number;
  totalDowntimeMinutes: number;
  incidentsCount: number;
  slaStatus: "met" | "breached";
}

export const INITIAL_REVENUE_REPORTS: RevenueReportRow[] = [
  { period: "Aug 2026", invoicesGenerated: 193, totalBilled: 115800, totalCollected: 108400, bkashCollected: 64200, nagadCollected: 26800, cashCollected: 17400, unpaidDue: 7400, collectionRate: 93.6 },
  { period: "Jul 2026", invoicesGenerated: 190, totalBilled: 114000, totalCollected: 110200, bkashCollected: 66000, nagadCollected: 27200, cashCollected: 17000, unpaidDue: 3800, collectionRate: 96.7 },
  { period: "Jun 2026", invoicesGenerated: 184, totalBilled: 110400, totalCollected: 107600, bkashCollected: 63800, nagadCollected: 26500, cashCollected: 17300, unpaidDue: 2800, collectionRate: 97.5 },
  { period: "May 2026", invoicesGenerated: 178, totalBilled: 106800, totalCollected: 104500, bkashCollected: 61500, nagadCollected: 26000, cashCollected: 17000, unpaidDue: 2300, collectionRate: 97.8 },
];

export const INITIAL_CUSTOMER_REPORTS: CustomerReportRow[] = [
  { zone: "Kalkini Hub & Thana Road", activeUsers: 145, newAdditions: 12, churnedUsers: 1, netGrowth: 11, growthRate: "+8.2%" },
  { zone: "Somitir Hat Bazar POP", activeUsers: 48, newAdditions: 5, churnedUsers: 0, netGrowth: 5, growthRate: "+11.6%" },
];

export const INITIAL_UPTIME_REPORTS: NetworkUptimeRow[] = [
  { element: "MikroTik-MBN-Core (103.12.173.136)", type: "Core BGP Router", uptimePercentage: 99.98, totalDowntimeMinutes: 8, incidentsCount: 0, slaStatus: "met" },
  { element: "OLT1 - BDCOM EPON (Somitir Hat :1895)", type: "BDCOM EPON OLT", uptimePercentage: 99.95, totalDowntimeMinutes: 12, incidentsCount: 0, slaStatus: "met" },
  { element: "OLT2 - BDCOM EPON (Kalkini Hub :1896)", type: "BDCOM EPON OLT", uptimePercentage: 99.92, totalDowntimeMinutes: 18, incidentsCount: 0, slaStatus: "met" },
  { element: "MediaOne-BDIX Upstream (Port 21)", type: "BDIX Peering 10G", uptimePercentage: 99.99, totalDowntimeMinutes: 2, incidentsCount: 0, slaStatus: "met" },
  { element: "MediaOne-IIG Global Transit (Port 18)", type: "IIG Upstream", uptimePercentage: 99.96, totalDowntimeMinutes: 10, incidentsCount: 0, slaStatus: "met" },
];
