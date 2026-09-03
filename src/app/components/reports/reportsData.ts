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
  { period: "Aug 2026", invoicesGenerated: 12840, totalBilled: 14600000, totalCollected: 13920000, bkashCollected: 9400000, nagadCollected: 3100000, cashCollected: 1420000, unpaidDue: 680000, collectionRate: 95.3 },
  { period: "Jul 2026", invoicesGenerated: 12450, totalBilled: 13800000, totalCollected: 13524000, bkashCollected: 9100000, nagadCollected: 3050000, cashCollected: 1374000, unpaidDue: 276000, collectionRate: 98.0 },
  { period: "Jun 2026", invoicesGenerated: 12100, totalBilled: 13100000, totalCollected: 12838000, bkashCollected: 8600000, nagadCollected: 2900000, cashCollected: 1338000, unpaidDue: 262000, collectionRate: 98.0 },
  { period: "May 2026", invoicesGenerated: 11800, totalBilled: 12400000, totalCollected: 12214000, bkashCollected: 8100000, nagadCollected: 2800000, cashCollected: 1314000, unpaidDue: 186000, collectionRate: 98.5 },
];

export const INITIAL_CUSTOMER_REPORTS: CustomerReportRow[] = [
  { zone: "Kalkini Zone", activeUsers: 164, newAdditions: 22, churnedUsers: 2, netGrowth: 20, growthRate: "+12.2%" },
  { zone: "Madaripur Sadar", activeUsers: 85, newAdditions: 14, churnedUsers: 1, netGrowth: 13, growthRate: "+8.6%" },
  { zone: "Shibchar Zone", activeUsers: 48, newAdditions: 9, churnedUsers: 1, netGrowth: 8, growthRate: "+6.0%" },
  { zone: "Somitir Hat Bazar", activeUsers: 62, newAdditions: 12, churnedUsers: 0, netGrowth: 12, growthRate: "+9.7%" },
  { zone: "Rajoir Zone", activeUsers: 34, newAdditions: 6, churnedUsers: 1, netGrowth: 5, growthRate: "+5.6%" },
  { zone: "Dashar Zone", activeUsers: 28, newAdditions: 5, churnedUsers: 0, netGrowth: 5, growthRate: "+7.5%" },
];

export const INITIAL_UPTIME_REPORTS: NetworkUptimeRow[] = [
  { element: "MikroTik-01 (Madaripur Core)", type: "Core CCR", uptimePercentage: 99.98, totalDowntimeMinutes: 8, incidentsCount: 1, slaStatus: "met" },
  { element: "MikroTik-02 (Kalkini Hub)", type: "Core CCR", uptimePercentage: 99.95, totalDowntimeMinutes: 21, incidentsCount: 1, slaStatus: "met" },
  { element: "MikroTik-03 (Shibchar POP)", type: "Core CCR", uptimePercentage: 99.85, totalDowntimeMinutes: 65, incidentsCount: 2, slaStatus: "met" },
  { element: "MikroTik-04 (Rajoir Edge)", type: "Edge CCR", uptimePercentage: 99.40, totalDowntimeMinutes: 120, incidentsCount: 1, slaStatus: "met" },
  { element: "OLT-Madaripur-01 (Huawei)", type: "GPON OLT", uptimePercentage: 99.99, totalDowntimeMinutes: 4, incidentsCount: 0, slaStatus: "met" },
  { element: "OLT-Kalkini-01 (BDCOM)", type: "GPON OLT", uptimePercentage: 99.80, totalDowntimeMinutes: 15, incidentsCount: 0, slaStatus: "met" },
];
