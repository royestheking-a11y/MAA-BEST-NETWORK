export interface SmsGatewayConfig {
  provider: "greenweb" | "teletalk" | "infobip" | "onnorokom";
  apiKey: string;
  senderId: string;
  balance: number;
  currency: string;
  ratePerSms: number;
  status: "connected" | "disconnected";
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  triggerEvent: "bill_generated" | "due_date_reached" | "grace_period_expired" | "ticket_resolved" | "payment_received";
  action: "send_sms" | "disable_mikrotik_pppoe" | "enable_mikrotik_pppoe" | "apply_late_fee";
  enabled: boolean;
  delayHours: number;
  executionsCount: number;
  lastRun: string;
}

export interface WebhookNotification {
  id: string;
  name: string;
  targetUrl: string;
  channel: "telegram" | "slack" | "discord" | "custom_webhook";
  events: string[];
  status: "active" | "inactive";
  lastSent: string;
}

export const INITIAL_SMS_CONFIG: SmsGatewayConfig = {
  provider: "greenweb",
  apiKey: "gw_live_8849201994",
  senderId: "ISP-ALERT",
  balance: 0,
  currency: "BDT",
  ratePerSms: 0.35,
  status: "disconnected",
};

export const INITIAL_WORKFLOWS: AutomationWorkflow[] = [
  { id: "WF-01", name: "Monthly Invoice SMS Broadcast", triggerEvent: "bill_generated", action: "send_sms", enabled: true, delayHours: 0, executionsCount: 0, lastRun: "—" },
  { id: "WF-02", name: "Payment Due Warning SMS (3 Days Before)", triggerEvent: "due_date_reached", action: "send_sms", enabled: true, delayHours: 72, executionsCount: 0, lastRun: "—" },
  { id: "WF-03", name: "Auto-Disable PPPoE on Expiry (Grace Over)", triggerEvent: "grace_period_expired", action: "disable_mikrotik_pppoe", enabled: true, delayHours: 120, executionsCount: 0, lastRun: "—" },
  { id: "WF-04", name: "Instant Auto-Reconnection upon Payment", triggerEvent: "payment_received", action: "enable_mikrotik_pppoe", enabled: true, delayHours: 0, executionsCount: 0, lastRun: "—" },
  { id: "WF-05", name: "Late Fee Penalty Auto-Assessment", triggerEvent: "grace_period_expired", action: "apply_late_fee", enabled: true, delayHours: 120, executionsCount: 0, lastRun: "—" },
];

export const INITIAL_WEBHOOKS: WebhookNotification[] = [];

const STORAGE_KEYS = {
  SMS: "isp_automation_sms_v3",
  WORKFLOWS: "isp_automation_workflows_v3",
  WEBHOOKS: "isp_automation_webhooks_v3",
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(fallback)) {
          if (Array.isArray(parsed)) return parsed as unknown as T;
        } else if (parsed && typeof parsed === "object") {
          return { ...fallback, ...parsed } as unknown as T;
        }
      }
    }
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
  }
  return fallback;
}

function saveStorage<T>(key: string, data: T): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

let sharedSms = loadStorage(STORAGE_KEYS.SMS, { ...INITIAL_SMS_CONFIG });
let sharedWorkflows = loadStorage(STORAGE_KEYS.WORKFLOWS, [...INITIAL_WORKFLOWS]);
let sharedWebhooks = loadStorage(STORAGE_KEYS.WEBHOOKS, [...INITIAL_WEBHOOKS]);

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach(cb => cb());
}

export const automationStore = {
  getSms: () => sharedSms,
  updateSms: (cfg: Partial<SmsGatewayConfig>) => {
    sharedSms = { ...sharedSms, ...cfg };
    saveStorage(STORAGE_KEYS.SMS, sharedSms);
    notify();
  },

  getWorkflows: () => sharedWorkflows,
  toggleWorkflow: (id: string) => {
    sharedWorkflows = sharedWorkflows.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w);
    saveStorage(STORAGE_KEYS.WORKFLOWS, sharedWorkflows);
    notify();
  },
  addWorkflow: (wf: AutomationWorkflow) => {
    sharedWorkflows = [wf, ...sharedWorkflows];
    saveStorage(STORAGE_KEYS.WORKFLOWS, sharedWorkflows);
    notify();
  },

  getWebhooks: () => sharedWebhooks,
  addWebhook: (wh: WebhookNotification) => {
    sharedWebhooks = [wh, ...sharedWebhooks];
    saveStorage(STORAGE_KEYS.WEBHOOKS, sharedWebhooks);
    notify();
  },

  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }
};
