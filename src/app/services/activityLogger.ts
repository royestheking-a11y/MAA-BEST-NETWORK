export type LogType = 
  | "payment" 
  | "customer" 
  | "network" 
  | "security" 
  | "auth" 
  | "billing" 
  | "system" 
  | "package";

export type LogSeverity = "info" | "success" | "warning" | "error";

export interface ActivityLog {
  id: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  type: LogType;
  severity: LogSeverity;
  user: string;
  userRole: string;
  action: string;
  detail: string;
  ip: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

const STORAGE_KEY = "mbn_isp_activity_audit_logs_v1";

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "LOG-9081",
    timestamp: Date.now() - 3 * 60 * 1000,
    dateStr: "17 Sep 2026",
    timeStr: "12:35 AM",
    type: "security",
    severity: "success",
    user: "Royes (Super Admin)",
    userRole: "Administrator",
    action: "Router MAC Address Locked & Bound",
    detail: "Bound Calling-Station-Id [4C:46:D1:88:2A:01] to subscriber MBN0001 (Kalkini Core).",
    ip: "103.145.60.1",
    targetId: "MBN0001",
    metadata: {
      mac: "4C:46:D1:88:2A:01",
      subscriber: "MBN0001",
      routerVendor: "BDCOM GPON",
      status: "LOCKED_AUTHORIZED"
    }
  },
  {
    id: "LOG-9080",
    timestamp: Date.now() - 14 * 60 * 1000,
    dateStr: "17 Sep 2026",
    timeStr: "12:24 AM",
    type: "payment",
    severity: "success",
    user: "bKash Direct Gateway",
    userRole: "Automated Gateway",
    action: "Instant Online Bill Collection Verified",
    detail: "Received ৳1,200 payment from 01712-345678 (TRX8832910) for 20 Mbps Fiber Standard.",
    ip: "10.200.1.15",
    targetId: "MBN0003",
    metadata: {
      amount: 1200,
      trxId: "TRX8832910",
      method: "bKash",
      gatewayStatus: "VERIFIED"
    }
  },
  {
    id: "LOG-9079",
    timestamp: Date.now() - 32 * 60 * 1000,
    dateStr: "17 Sep 2026",
    timeStr: "12:06 AM",
    type: "network",
    severity: "info",
    user: "Shohel (Field Tech)",
    userRole: "NOC Engineer",
    action: "OLT Chassis Telnet Diagnostic Executed",
    detail: "Ping diagnostic & optical Rx level inspection completed on OLT-01 (Maa Net 8-Port EPON). Rx: -18.4 dBm.",
    ip: "192.168.10.25",
    targetId: "OLT-01",
    metadata: {
      olt: "OLT-01",
      ponPort: "epon 0/1",
      temperature: "42.5°C",
      opticalPower: "-18.4 dBm"
    }
  },
  {
    id: "LOG-9078",
    timestamp: Date.now() - 58 * 60 * 1000,
    dateStr: "16 Sep 2026",
    timeStr: "11:40 PM",
    type: "customer",
    severity: "info",
    user: "Royes (Super Admin)",
    userRole: "Administrator",
    action: "Subscriber Account Policy Updated",
    detail: "Designated subscriber MBN0004 as Free User (Complimentary Staff / Never Cutoff).",
    ip: "103.145.60.1",
    targetId: "MBN0004",
    metadata: {
      previousType: "normal",
      newType: "free",
      cutoffPolicy: "PERMANENT_EXEMPT",
      monthlyCharge: 0
    }
  },
  {
    id: "LOG-9077",
    timestamp: Date.now() - 95 * 60 * 1000,
    dateStr: "16 Sep 2026",
    timeStr: "11:03 PM",
    type: "package",
    severity: "success",
    user: "Faruk (Billing Manager)",
    userRole: "Billing Staff",
    action: "Speed Tier Plan Upgrade Approved",
    detail: "Approved plan upgrade for MBN0002 from 10 Mbps Home to 20 Mbps Fiber Standard (৳1,200/mo).",
    ip: "103.145.60.14",
    targetId: "MBN0002",
    metadata: {
      fromPkg: "10 Mbps Home",
      toPkg: "20 Mbps Fiber Standard",
      newRate: 1200,
      mikrotikQueueUpdated: true
    }
  },
  {
    id: "LOG-9076",
    timestamp: Date.now() - 140 * 60 * 1000,
    dateStr: "16 Sep 2026",
    timeStr: "10:18 PM",
    type: "security",
    severity: "warning",
    user: "MikroTik Core Daemon",
    userRole: "Security Monitor",
    action: "Unregistered MAC Authentication Blocked",
    detail: "PPPoE session request from unauthorized MAC 00:1A:2B:3C:4D:5E rejected by MAC lock policy.",
    ip: "100.64.10.45",
    targetId: "mbn_kalkini_02",
    metadata: {
      rejectedMac: "00:1A:2B:3C:4D:5E",
      boundMac: "4C:46:D1:88:2A:02",
      actionTaken: "AUTH_REJECTED_MAC_MISMATCH"
    }
  },
  {
    id: "LOG-9075",
    timestamp: Date.now() - 210 * 60 * 1000,
    dateStr: "16 Sep 2026",
    timeStr: "09:08 PM",
    type: "network",
    severity: "info",
    user: "System Auto-Provisioner",
    userRole: "Network Automation",
    action: "IPAM Subnet IP Allocation",
    detail: "Allocated collision-free IP 100.64.10.58 from Pool-2 (Kalkini Somitir Hat) to subscriber MBN0012.",
    ip: "172.16.20.1",
    targetId: "MBN0012",
    metadata: {
      pool: "Pool-2: Kalkini /24",
      allocatedIp: "100.64.10.58",
      gateway: "100.64.10.1"
    }
  },
  {
    id: "LOG-9074",
    timestamp: Date.now() - 320 * 60 * 1000,
    dateStr: "16 Sep 2026",
    timeStr: "07:18 PM",
    type: "auth",
    severity: "info",
    user: "Royes (Super Admin)",
    userRole: "Administrator",
    action: "Admin Operator Logged In",
    detail: "Authenticated successfully via 2FA session from Madaripur HQ.",
    ip: "103.145.60.1",
    metadata: {
      sessionDuration: "Active",
      authMethod: "Password + Master Token"
    }
  },
  {
    id: "LOG-9073",
    timestamp: Date.now() - 440 * 60 * 1000,
    dateStr: "16 Sep 2026",
    timeStr: "05:18 PM",
    type: "billing",
    severity: "info",
    user: "Faruk (Billing Manager)",
    userRole: "Billing Staff",
    action: "Manual Due Amount Adjustment",
    detail: "Granted 3 grace days to subscriber MBN0015 (Somitir Hat Bazar). Expiry extended to 20 Sep 2026.",
    ip: "103.145.60.14",
    targetId: "MBN0015",
    metadata: {
      extraDays: 3,
      reason: "Cash pickup requested by subscriber"
    }
  },
  {
    id: "LOG-9072",
    timestamp: Date.now() - 600 * 60 * 1000,
    dateStr: "16 Sep 2026",
    timeStr: "02:38 PM",
    type: "system",
    severity: "info",
    user: "Cloud Firestore Engine",
    userRole: "Database Engine",
    action: "Automated Real-Time Cloud Sync",
    detail: "194 subscriber credentials & optical ONU telemetry records synchronized to Firebase cloud.",
    ip: "127.0.0.1",
    metadata: {
      syncedDocuments: 194,
      latency: "24ms"
    }
  }
];

class ActivityLogStore {
  private logs: ActivityLog[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.logs = parsed;
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load activity logs:", e);
    }
    this.logs = INITIAL_LOGS;
    this.save();
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.error("Failed to save activity logs:", e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public getLogs(): ActivityLog[] {
    return [...this.logs];
  }

  public log(entry: {
    type: LogType;
    severity?: LogSeverity;
    user?: string;
    userRole?: string;
    action: string;
    detail: string;
    ip?: string;
    targetId?: string;
    metadata?: Record<string, any>;
  }): ActivityLog {
    const now = new Date();
    const newLog: ActivityLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: Date.now(),
      dateStr: now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      timeStr: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      type: entry.type,
      severity: entry.severity || "info",
      user: entry.user || "Royes (Super Admin)",
      userRole: entry.userRole || "Administrator",
      action: entry.action,
      detail: entry.detail,
      ip: entry.ip || "103.145.60.1",
      targetId: entry.targetId,
      metadata: entry.metadata,
    };

    this.logs = [newLog, ...this.logs].slice(0, 500); // retain latest 500 logs
    this.save();
    return newLog;
  }

  public clearLogs() {
    this.logs = [];
    this.save();
  }

  public resetToDefault() {
    this.logs = INITIAL_LOGS;
    this.save();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export const activityLogger = new ActivityLogStore();
