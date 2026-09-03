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

let sharedSms = { ...INITIAL_SMS_CONFIG };
let sharedWorkflows = [...INITIAL_WORKFLOWS];
let sharedWebhooks = [...INITIAL_WEBHOOKS];

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach(cb => cb());
}

export const automationStore = {
  getSms: () => sharedSms,
  updateSms: (cfg: Partial<SmsGatewayConfig>) => { sharedSms = { ...sharedSms, ...cfg }; notify(); },

  getWorkflows: () => sharedWorkflows,
  toggleWorkflow: (id: string) => {
    sharedWorkflows = sharedWorkflows.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w);
    notify();
  },
  addWorkflow: (wf: AutomationWorkflow) => {
    sharedWorkflows = [wf, ...sharedWorkflows];
    notify();
  },

  getWebhooks: () => sharedWebhooks,
  addWebhook: (wh: WebhookNotification) => {
    sharedWebhooks = [wh, ...sharedWebhooks];
    notify();
  },

  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }
};
