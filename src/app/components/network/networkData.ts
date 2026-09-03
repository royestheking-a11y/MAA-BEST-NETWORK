// ─── Interfaces ─────────────────────────────────────────────────────────────

export type MapNodeType = "internet" | "mikrotik" | "olt" | "zone";
export type MapNodeStatus = "online" | "warning" | "offline";

export interface MapNode {
  id: string;
  name: string;
  type: MapNodeType;
  x: number;
  y: number;
  status: MapNodeStatus;
  ip: string;
  label?: string;
  sub?: string;
  sessions?: number;
  cpu?: number;
  ram?: string;
  uptime?: string;
  traffic?: string;
  latency?: string;
  rxPower?: number;
  onuCount?: number;
}

export interface MapEdge {
  from: string;
  to: string;
  status: MapNodeStatus;
  speed?: string;
  label?: string;
}

export interface MikrotikServer {
  id: string;
  name: string;
  ip: string;
  model: string;
  cpu?: number;
  cpuLoad?: number;
  ram?: number;
  memoryUsed?: number;
  memoryTotal?: number;
  uptime: string;
  sessions?: number;
  activePppoe?: number;
  activeHotspot?: number;
  activeStatic?: number;
  totalSessions?: number;
  downloadMbps?: number;
  uploadMbps?: number;
  status: "online" | "warning" | "offline";
  lastSync: string;
  location?: string;
  apiPort?: number;
  winboxPort?: number;
  username?: string;
  password?: string;
  rosVersion?: string;
  role?: string;
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

export const INITIAL_MAP_NODES: MapNode[] = [
  {
    id: "INET-BDIX",
    name: "MediaOne-BDIX Upstream",
    type: "internet",
    ip: "103.12.173.1",
    status: "online",
    x: 180,
    y: 70,
    traffic: "902.0 Mbps",
    latency: "2ms",
  },
  {
    id: "INET-IIG",
    name: "MediaOne-IIG Global Transit",
    type: "internet",
    ip: "103.12.173.2",
    status: "online",
    x: 840,
    y: 70,
    traffic: "465.1 Mbps",
    latency: "28ms",
  },
  {
    id: "MK1",
    name: "MikroTik-MBN-Core",
    type: "mikrotik",
    ip: "103.12.173.136",
    status: "online",
    x: 510,
    y: 190,
    cpu: 12,
    ram: "7.5 / 32 GB",
    sessions: 295,
    traffic: "1.37 Gbps",
    latency: "1ms",
  },
  {
    id: "OLT1",
    name: "BDCOM OLT 1 (Madaripur)",
    type: "olt",
    ip: "103.12.173.136:1895",
    status: "online",
    x: 280,
    y: 350,
    sessions: 150,
    traffic: "53 ONUs Active",
    latency: "53ms",
  },
  {
    id: "OLT2",
    name: "BDCOM OLT 2 (Kalkini)",
    type: "olt",
    ip: "103.12.173.136:1894",
    status: "online",
    x: 740,
    y: 350,
    sessions: 145,
    traffic: "49 ONUs Active",
    latency: "51ms",
  },
  {
    id: "ZONE-SADAR",
    name: "Madaripur Sadar & Somitir Hat",
    type: "zone",
    ip: "100.64.10.0/24",
    status: "online",
    x: 160,
    y: 470,
    sessions: 85,
    traffic: "epon 0/1 - 0/2",
  },
  {
    id: "ZONE-PORT",
    name: "Charmuguria Commercial Port",
    type: "zone",
    ip: "100.64.20.0/24",
    status: "online",
    x: 390,
    y: 470,
    sessions: 65,
    traffic: "epon 0/3 - 0/4",
  },
  {
    id: "ZONE-KALKINI",
    name: "Kalkini & Thana Road Hub",
    type: "zone",
    ip: "100.64.30.0/24",
    status: "online",
    x: 740,
    y: 470,
    sessions: 145,
    traffic: "epon 0/1 - 0/4",
  }
];

export const INITIAL_MAP_EDGES: MapEdge[] = [
  { from: "INET-BDIX", to: "MK1", status: "online", label: "BDIX 902M" },
  { from: "INET-IIG", to: "MK1", status: "online", label: "IIG 465M" },
  { from: "MK1", to: "OLT1", status: "online", label: "10G SFP+" },
  { from: "MK1", to: "OLT2", status: "online", label: "10G SFP+" },
  { from: "OLT1", to: "ZONE-SADAR", status: "online", label: "PON 1-2" },
  { from: "OLT1", to: "ZONE-PORT", status: "online", label: "PON 3-4" },
  { from: "OLT2", to: "ZONE-KALKINI", status: "online", label: "PON 1-4" },
];

export const INITIAL_MIKROTIK: MikrotikServer[] = [
  {
    id: "MK-01",
    name: "MikroTik-MBN-Core",
    ip: "103.12.173.136",
    apiPort: 8728,
    winboxPort: 8291,
    username: "mbn@netx.com",
    password: "••••••••",
    model: "RouterOS x86 (72-Core Xeon Core Server)",
    rosVersion: "7.15.3 (x86_64)",
    cpuLoad: 12,
    memoryUsed: 7554,
    memoryTotal: 32064,
    uptime: "284 days, 4h",
    activePppoe: 191,
    activeHotspot: 0,
    activeStatic: 104,
    totalSessions: 295,
    downloadMbps: 902.0,
    uploadMbps: 412.3,
    status: "online",
    lastSync: "Just now (Realtime)",
    role: "Core BGP Router & PPPoE Gateway",
  }
];

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
    activeOnu: 53,
    offlineOnu: 97,
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
    username: "mbn@netx.com",
    password: "••••••••",
    snmpCommunity: "public",
    snmpPort: 161,
    location: "Kalkini Distribution Hub",
    ponPorts: 8,
    usedPorts: 4,
    activeOnu: 49,
    offlineOnu: 96,
    totalOnu: 145,
    rxPower: -20.2,
    status: "online",
    lastSync: "Just now (Realtime)",
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
