// ─── Interfaces ─────────────────────────────────────────────────────────────

export type MapNodeType = "internet" | "mikrotik" | "olt" | "zone";
export type MapNodeStatus = "online" | "warning" | "offline";

export interface MapNode {
  id: string;
  label: string;
  name: string;
  sub: string;
  type: MapNodeType;
  x: number;
  y: number;
  status: MapNodeStatus;
  sessions: number;
  cpu: number;
  ip: string;
  uptime: string;
  rxPower?: number;
  onuCount?: number;
}

export interface MapEdge {
  from: string;
  to: string;
  status: MapNodeStatus;
  speed: string;
}

export interface MikrotikServer {
  id: string;
  name: string;
  location: string;
  model: string;
  ip: string;
  cpu: number;
  ram: number;
  uptime: string;
  sessions: number;
  status: "online" | "warning" | "offline";
  lastSync: string;
  temperature?: number;
  interfaces?: { name: string; tx: string; rx: string }[];
}

export interface OltDevice {
  id: string;
  name: string;
  vendor: string;
  model: string;
  ip: string;
  port?: number;
  connectionProtocol?: "Telnet" | "SSH" | "HTTP" | "SNMP";
  username?: string;
  password?: string;
  snmpCommunity?: string;
  snmpPort?: number;
  location: string;
  ponPorts: number;
  usedPorts: number;
  activeOnu: number;
  offlineOnu: number;
  totalOnu: number;
  rxPower: number | null;
  status: "online" | "warning" | "offline";
  lastSync: string;
  ponStandard?: "EPON" | "GPON" | "XG-PON" | "XGS-PON";
}

export interface ServiceZone {
  id: string;
  name: string;
  code: string;
  subzones: number;
  customers: number;
  active: number;
  due: number;
  mikrotik: string;
  olt: string;
  bandwidth: string;
  status: "healthy" | "degraded" | "down";
}

export interface NetworkIncident {
  id: string;
  title: string;
  zone: string;
  affectedCustomers: number;
  severity: "critical" | "warning" | "minor";
  status: "open" | "investigating" | "resolved";
  assignee: string;
  time: string;
  createdAt: string;
  rootCause?: string;
}

export interface MetricPoint {
  time: string;
  download: number;
  upload: number;
  latency: number;
  cpu: number;
}

// ─── Initial Data ────────────────────────────────────────────────────────────

export const INITIAL_MAP_NODES: MapNode[] = [];

export const INITIAL_MAP_EDGES: MapEdge[] = [];

export const INITIAL_MIKROTIK: MikrotikServer[] = [];

export const INITIAL_OLTS: OltDevice[] = [
  {
    id: "OLT-01",
    name: "OLT1",
    vendor: "BDCOM",
    model: "BDCOM P3608B EPON OLT",
    ip: "103.12.173.136",
    port: 1895,
    connectionProtocol: "Telnet",
    username: "mbn@netx.com",
    password: "••••••••",
    snmpCommunity: "public",
    snmpPort: 161,
    location: "Somitir Hat Core POP",
    ponPorts: 8,
    usedPorts: 6,
    activeOnu: 149,
    offlineOnu: 1,
    totalOnu: 150,
    rxPower: -19.4,
    status: "online",
    lastSync: "Just now (Realtime)",
    ponStandard: "EPON",
  },
  {
    id: "OLT-02",
    name: "OLT2",
    vendor: "BDCOM",
    model: "BDCOM P3616-2TE EPON OLT",
    ip: "103.12.173.136",
    port: 1894,
    connectionProtocol: "Telnet",
    username: "admin",
    password: "••••••••",
    snmpCommunity: "public",
    snmpPort: 161,
    location: "Kalkini Distribution Hub",
    ponPorts: 8,
    usedPorts: 4,
    activeOnu: 0,
    offlineOnu: 145,
    totalOnu: 145,
    rxPower: null,
    status: "offline",
    lastSync: "Down (Connection Timeout)",
    ponStandard: "EPON",
  }
];

export const INITIAL_ZONES: ServiceZone[] = [];

export const INITIAL_INCIDENTS: NetworkIncident[] = [];

export const INITIAL_TELEMETRY: MetricPoint[] = [];

// ─── Reactive Network Store ──────────────────────────────────────────────────

let sharedMikrotik = [...INITIAL_MIKROTIK];
let sharedOlts = [...INITIAL_OLTS];
let sharedZones = [...INITIAL_ZONES];
let sharedIncidents = [...INITIAL_INCIDENTS];

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach(cb => cb());
}

export const networkStore = {
  getMikrotik: () => sharedMikrotik,
  setMikrotik: (data: MikrotikServer[]) => { sharedMikrotik = data; notify(); },
  addMikrotik: (srv: MikrotikServer) => { sharedMikrotik = [srv, ...sharedMikrotik]; notify(); },

  getOlts: () => sharedOlts,
  setOlts: (data: OltDevice[]) => { sharedOlts = data; notify(); },
  addOlt: (olt: OltDevice) => { sharedOlts = [olt, ...sharedOlts]; notify(); },
  updateOlt: (id: string, updates: Partial<OltDevice>) => {
    sharedOlts = sharedOlts.map(o => o.id === id ? { ...o, ...updates } : o);
    notify();
  },
  deleteOlt: (id: string) => {
    sharedOlts = sharedOlts.filter(o => o.id !== id);
    notify();
  },

  getZones: () => sharedZones,
  setZones: (data: ServiceZone[]) => { sharedZones = data; notify(); },
  addZone: (z: ServiceZone) => { sharedZones = [z, ...sharedZones]; notify(); },

  getIncidents: () => sharedIncidents,
  setIncidents: (data: NetworkIncident[]) => { sharedIncidents = data; notify(); },
  addIncident: (inc: NetworkIncident) => { sharedIncidents = [inc, ...sharedIncidents]; notify(); },
  resolveIncident: (id: string) => {
    sharedIncidents = sharedIncidents.map(i => i.id === id ? { ...i, status: "resolved" } : i);
    notify();
  },

  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }
};
