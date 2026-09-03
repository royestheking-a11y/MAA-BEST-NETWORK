export interface LeakageItem {
  id: string;
  customerName: string;
  custId: string;
  zone: string;
  packageSpeed: string;
  leakageType: "unbilled_active" | "speed_mismatch" | "expired_unisolated" | "shared_mac_bypass";
  estimatedLossPerMonth: number;
  severity: "critical" | "high" | "medium";
  actionRecommendation: string;
  detectedAt: string;
}

export interface ChurnRiskCustomer {
  id: string;
  customerName: string;
  custId: string;
  phone: string;
  zone: string;
  riskScore: number; // 0 - 100
  primaryRiskFactor: string;
  frequentTicketsCount: number;
  monthlyBill: number;
  retentionRecommendation: string;
}

export interface ForecastPoint {
  month: string;
  predictedRevenue: number;
  predictedBandwidthGbps: number;
  projectedCustomerBase: number;
}

export const INITIAL_LEAKAGES: LeakageItem[] = [];

export const INITIAL_CHURN_RISKS: ChurnRiskCustomer[] = [];

export const INITIAL_FORECASTS: ForecastPoint[] = [
  { month: "Sep 2026", predictedRevenue: 1520000, predictedBandwidthGbps: 11.2, projectedCustomerBase: 13400 },
  { month: "Oct 2026", predictedRevenue: 1590000, predictedBandwidthGbps: 12.0, projectedCustomerBase: 13950 },
  { month: "Nov 2026", predictedRevenue: 1670000, predictedBandwidthGbps: 12.8, projectedCustomerBase: 14500 },
  { month: "Dec 2026", predictedRevenue: 1750000, predictedBandwidthGbps: 13.6, projectedCustomerBase: 15100 },
  { month: "Jan 2027", predictedRevenue: 1840000, predictedBandwidthGbps: 14.5, projectedCustomerBase: 15800 },
  { month: "Feb 2027", predictedRevenue: 1930000, predictedBandwidthGbps: 15.4, projectedCustomerBase: 16500 },
];
