export interface SupportTicket {
  id: string;
  customerName: string;
  custId: string;
  phone: string;
  zone: string;
  category: "no_internet" | "slow_speed" | "fiber_cut" | "billing_issue" | "router_config";
  priority: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved" | "closed";
  subject: string;
  description: string;
  assignedTech: string;
  createdAt: string;
  slaDeadline: string;
}

export interface TimelineEvent {
  id: string;
  custId: string;
  customerName: string;
  eventType: "ticket" | "payment" | "package_change" | "disconnection" | "sms_sent" | "router_sync";
  title: string;
  details: string;
  timestamp: string;
  author: string;
}

export interface CustomerMessage {
  id: string;
  customerName: string;
  custId: string;
  phone: string;
  type: "inbound" | "outbound";
  channel: "sms" | "app" | "whatsapp";
  text: string;
  timestamp: string;
  status: "delivered" | "read" | "failed";
}

export const INITIAL_TICKETS: SupportTicket[] = [];

export const INITIAL_TIMELINE: TimelineEvent[] = [];

export const INITIAL_MESSAGES: CustomerMessage[] = [];

const STORAGE_KEYS = {
  TICKETS: "isp_crm_tickets_v3",
  TIMELINE: "isp_crm_timeline_v3",
  MESSAGES: "isp_crm_messages_v3",
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(fallback)) {
          if (Array.isArray(parsed) && parsed.length > 0) return parsed as unknown as T;
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

let sharedTickets = loadStorage(STORAGE_KEYS.TICKETS, [...INITIAL_TICKETS]);
let sharedTimeline = loadStorage(STORAGE_KEYS.TIMELINE, [...INITIAL_TIMELINE]);
let sharedMessages = loadStorage(STORAGE_KEYS.MESSAGES, [...INITIAL_MESSAGES]);

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach(cb => cb());
}

export const crmStore = {
  getTickets: () => sharedTickets,
  addTicket: (t: SupportTicket) => {
    sharedTickets = [t, ...sharedTickets];
    const newEvent: TimelineEvent = {
      id: `EV-${Date.now()}`,
      custId: t.custId,
      customerName: t.customerName,
      eventType: "ticket",
      title: `Support Ticket #${t.id} Created`,
      details: t.subject,
      timestamp: t.createdAt,
      author: "Helpdesk System"
    };
    sharedTimeline = [newEvent, ...sharedTimeline];
    saveStorage(STORAGE_KEYS.TICKETS, sharedTickets);
    saveStorage(STORAGE_KEYS.TIMELINE, sharedTimeline);
    notify();
  },
  resolveTicket: (id: string) => {
    sharedTickets = sharedTickets.map(t => t.id === id ? { ...t, status: "resolved" } : t);
    saveStorage(STORAGE_KEYS.TICKETS, sharedTickets);
    notify();
  },

  getTimeline: () => sharedTimeline,

  getMessages: () => sharedMessages,
  sendMessage: (m: CustomerMessage) => {
    sharedMessages = [m, ...sharedMessages];
    saveStorage(STORAGE_KEYS.MESSAGES, sharedMessages);
    notify();
  },

  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }
};
