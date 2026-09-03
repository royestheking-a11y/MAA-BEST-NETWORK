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

let sharedTickets = [...INITIAL_TICKETS];
let sharedTimeline = [...INITIAL_TIMELINE];
let sharedMessages = [...INITIAL_MESSAGES];

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach(cb => cb());
}

export const crmStore = {
  getTickets: () => sharedTickets,
  addTicket: (t: SupportTicket) => {
    sharedTickets = [t, ...sharedTickets];
    sharedTimeline = [{
      id: `EV-${Date.now()}`,
      custId: t.custId,
      customerName: t.customerName,
      eventType: "ticket",
      title: `Support Ticket #${t.id} Created`,
      details: t.subject,
      timestamp: t.createdAt,
      author: "Helpdesk System"
    }, ...sharedTimeline];
    notify();
  },
  resolveTicket: (id: string) => {
    sharedTickets = sharedTickets.map(t => t.id === id ? { ...t, status: "resolved" } : t);
    notify();
  },

  getTimeline: () => sharedTimeline,

  getMessages: () => sharedMessages,
  sendMessage: (m: CustomerMessage) => {
    sharedMessages = [m, ...sharedMessages];
    notify();
  },

  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }
};
