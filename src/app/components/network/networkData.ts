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
  unassignedOnu?: number;
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
    id: "OLT1",
    name: "BDCOM OLT 1 (Madaripur)",
    type: "olt",
    ip: "103.12.173.136:1895",
    status: "online",
    x: 280,
    y: 260,
    sessions: 150,
    traffic: "53 ONUs Active",
    latency: "53ms",
  },
  {
    id: "OLT2",
    name: "BDCOM OLT 2 (Kalkini)",
    type: "olt",
    ip: "103.12.173.136:1896",
    status: "online",
    x: 740,
    y: 260,
    sessions: 156,
    traffic: "59 ONUs Active",
    latency: "33ms",
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
  { from: "INET-BDIX", to: "OLT1", status: "online", label: "BDIX 902M" },
  { from: "INET-IIG", to: "OLT2", status: "online", label: "IIG 465M" },
  { from: "OLT1", to: "ZONE-SADAR", status: "online", label: "PON 1-2" },
  { from: "OLT1", to: "ZONE-PORT", status: "online", label: "PON 3-4" },
  { from: "OLT2", to: "ZONE-KALKINI", status: "online", label: "PON 1-4" },
];

export const INITIAL_MIKROTIK: MikrotikServer[] = [
  {
    id: "MK-03",
    name: "DC-CA",
    ip: "103.12.173.136",
    apiPort: 8728,
    winboxPort: 8291,
    username: "billing@mbn",
    password: "••••••••",
    model: "x84 (RouterOS x86)",
    rosVersion: "7.15.3 (x86_64)",
    cpuLoad: 12,
    memoryUsed: 7554,
    memoryTotal: 32064,
    uptime: "284 days, 4h",
    activePppoe: 194,
    activeHotspot: 0,
    activeStatic: 0,
    totalSessions: 194,
    downloadMbps: 902.0,
    uploadMbps: 412.3,
    status: "online",
    lastSync: "Just now (Realtime)",
    role: "PPPoE Concentrator & Edge BRAS",
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

export const INITIAL_ZONES: ServiceZone[] = [
  {
    id: "ZONE-SADAR",
    name: "Madaripur Sadar & Somitir Hat",
    code: "SADAR",
    subzones: 4,
    customers: 85,
    active: 85,
    due: 14,
    mikrotik: "MikroTik-MBN-Core",
    olt: "OLT1",
    bandwidth: "850 Mbps",
    status: "healthy",
  },
  {
    id: "ZONE-PORT",
    name: "Charmuguria Commercial Port",
    code: "PORT",
    subzones: 3,
    customers: 65,
    active: 65,
    due: 10,
    mikrotik: "MikroTik-MBN-Core",
    olt: "OLT1",
    bandwidth: "650 Mbps",
    status: "healthy",
  },
  {
    id: "ZONE-KALKINI",
    name: "Kalkini & Thana Road Hub",
    code: "KALKINI",
    subzones: 6,
    customers: 44,
    active: 44,
    due: 20,
    mikrotik: "MikroTik-MBN-Core",
    olt: "OLT2",
    bandwidth: "450 Mbps",
    status: "healthy",
  }
];

export const INITIAL_INCIDENTS: NetworkIncident[] = [];

export const INITIAL_TELEMETRY: MetricPoint[] = [];

// ─── Reactive Network Store with LocalStorage Persistence ─────────────────────

const STORAGE_KEY_OLTS = "isp_network_olts_v2";
const STORAGE_KEY_MIKROTIK = "isp_network_mikrotik_v4";
const STORAGE_KEY_ZONES = "isp_network_zones_v2";
const STORAGE_KEY_INCIDENTS = "isp_network_incidents_v2";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const item = localStorage.getItem(key);
      if (item !== null) {
        const parsed = JSON.parse(item);
        if (Array.isArray(fallback)) {
          if (Array.isArray(parsed)) return parsed as unknown as T;
        } else if (parsed && typeof parsed === "object") {
          return { ...fallback, ...parsed } as unknown as T;
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.error(e);
  }
}

import {
  subscribeToMikrotik,
  saveMikrotikToFirestore,
  deleteMikrotikFromFirestore,
  subscribeToOlts,
  saveOltToFirestore,
  deleteOltFromFirestore,
  subscribeToZones,
  saveZoneToFirestore,
  deleteZoneFromFirestore,
  subscribeToIncidents,
  saveIncidentToFirestore,
} from "../../../lib/firestoreService";

let sharedMikrotik = loadFromStorage(STORAGE_KEY_MIKROTIK, [...INITIAL_MIKROTIK]);
let sharedOlts = loadFromStorage(STORAGE_KEY_OLTS, [...INITIAL_OLTS]);
let sharedZones = loadFromStorage(STORAGE_KEY_ZONES, [...INITIAL_ZONES]);
let sharedIncidents = loadFromStorage(STORAGE_KEY_INCIDENTS, [...INITIAL_INCIDENTS]);

const listeners = new Set<(state?: any) => void>();
function notify() {
  const currentState = { mikrotik: sharedMikrotik, olts: sharedOlts, zones: sharedZones, incidents: sharedIncidents };
  listeners.forEach(cb => cb(currentState));
}

// Background Real-Time Cloud Firestore Sync
let isInitialized = false;
let hasMikrotikSynced = false;
let hasOltsSynced = false;
let hasZonesSynced = false;

export function initNetworkFirestoreSync() {
  if (isInitialized || typeof window === "undefined") return;
  isInitialized = true;

  subscribeToMikrotik(cloudMikrotik => {
    if (cloudMikrotik && cloudMikrotik.length > 0) {
      sharedMikrotik = cloudMikrotik as MikrotikServer[];
      saveToStorage(STORAGE_KEY_MIKROTIK, sharedMikrotik);
      notify();
    } else if (!hasMikrotikSynced && (!cloudMikrotik || cloudMikrotik.length === 0)) {
      const wasInit = localStorage.getItem("isp_mikrotik_initialized");
      if (!wasInit && INITIAL_MIKROTIK.length > 0) {
        localStorage.setItem("isp_mikrotik_initialized", "true");
        sharedMikrotik = [...INITIAL_MIKROTIK];
        saveToStorage(STORAGE_KEY_MIKROTIK, sharedMikrotik);
        sharedMikrotik.forEach(m => saveMikrotikToFirestore(m));
        notify();
      } else {
        sharedMikrotik = [];
        saveToStorage(STORAGE_KEY_MIKROTIK, sharedMikrotik);
        notify();
      }
    } else {
      sharedMikrotik = (cloudMikrotik || []) as MikrotikServer[];
      saveToStorage(STORAGE_KEY_MIKROTIK, sharedMikrotik);
      notify();
    }
    hasMikrotikSynced = true;
  });

  subscribeToOlts(cloudOlts => {
    if (cloudOlts && cloudOlts.length > 0) {
      sharedOlts = cloudOlts as OltDevice[];
      saveToStorage(STORAGE_KEY_OLTS, sharedOlts);
      notify();
    } else if (!hasOltsSynced && (!cloudOlts || cloudOlts.length === 0)) {
      const wasInit = localStorage.getItem("isp_olts_initialized");
      if (!wasInit && INITIAL_OLTS.length > 0) {
        localStorage.setItem("isp_olts_initialized", "true");
        sharedOlts = [...INITIAL_OLTS];
        saveToStorage(STORAGE_KEY_OLTS, sharedOlts);
        sharedOlts.forEach(o => saveOltToFirestore(o));
        notify();
      } else {
        sharedOlts = [];
        saveToStorage(STORAGE_KEY_OLTS, sharedOlts);
        notify();
      }
    } else {
      sharedOlts = (cloudOlts || []) as OltDevice[];
      saveToStorage(STORAGE_KEY_OLTS, sharedOlts);
      notify();
    }
    hasOltsSynced = true;
  });

  subscribeToZones(cloudZones => {
    if (cloudZones && cloudZones.length > 0) {
      sharedZones = cloudZones as ServiceZone[];
      saveToStorage(STORAGE_KEY_ZONES, sharedZones);
      notify();
    } else if (!hasZonesSynced && (!cloudZones || cloudZones.length === 0)) {
      const wasInit = localStorage.getItem("isp_zones_initialized");
      if (!wasInit && INITIAL_ZONES.length > 0) {
        localStorage.setItem("isp_zones_initialized", "true");
        sharedZones = [...INITIAL_ZONES];
        saveToStorage(STORAGE_KEY_ZONES, sharedZones);
        sharedZones.forEach(z => saveZoneToFirestore(z));
        notify();
      } else {
        sharedZones = [];
        saveToStorage(STORAGE_KEY_ZONES, sharedZones);
        notify();
      }
    } else {
      sharedZones = (cloudZones || []) as ServiceZone[];
      saveToStorage(STORAGE_KEY_ZONES, sharedZones);
      notify();
    }
    hasZonesSynced = true;
  });

  subscribeToIncidents(cloudIncidents => {
    sharedIncidents = (cloudIncidents || []) as NetworkIncident[];
    saveToStorage(STORAGE_KEY_INCIDENTS, sharedIncidents);
    notify();
  });
}

if (typeof window !== "undefined") {
  setTimeout(() => initNetworkFirestoreSync(), 50);
}

export const networkStore = {
  getMikrotik: () => sharedMikrotik,
  setMikrotik: (data: MikrotikServer[]) => {
    sharedMikrotik = data;
    saveToStorage(STORAGE_KEY_MIKROTIK, sharedMikrotik);
    data.forEach(s => saveMikrotikToFirestore(s));
    notify();
  },
  addMikrotik: (srv: MikrotikServer) => {
    sharedMikrotik = [srv, ...sharedMikrotik];
    saveToStorage(STORAGE_KEY_MIKROTIK, sharedMikrotik);
    saveMikrotikToFirestore(srv);
    notify();
  },
  updateMikrotik: (id: string, updates: Partial<MikrotikServer>) => {
    sharedMikrotik = sharedMikrotik.map(s => s.id === id ? { ...s, ...updates } : s);
    saveToStorage(STORAGE_KEY_MIKROTIK, sharedMikrotik);
    const updated = sharedMikrotik.find(s => s.id === id);
    if (updated) saveMikrotikToFirestore(updated);
    notify();
  },
  deleteMikrotik: (id: string) => {
    sharedMikrotik = sharedMikrotik.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEY_MIKROTIK, sharedMikrotik);
    deleteMikrotikFromFirestore(id);
    notify();
  },

  getOlts: () => sharedOlts,
  setOlts: (data: OltDevice[]) => {
    sharedOlts = data;
    saveToStorage(STORAGE_KEY_OLTS, sharedOlts);
    data.forEach(o => saveOltToFirestore(o));
    notify();
  },
  addOlt: (olt: OltDevice) => {
    sharedOlts = [olt, ...sharedOlts];
    saveToStorage(STORAGE_KEY_OLTS, sharedOlts);
    saveOltToFirestore(olt);
    notify();
  },
  updateOlt: (id: string, updates: Partial<OltDevice>) => {
    sharedOlts = sharedOlts.map(o => o.id === id ? { ...o, ...updates } : o);
    saveToStorage(STORAGE_KEY_OLTS, sharedOlts);
    const updated = sharedOlts.find(o => o.id === id);
    if (updated) saveOltToFirestore(updated);
    notify();
  },
  deleteOlt: (id: string) => {
    sharedOlts = sharedOlts.filter(o => o.id !== id);
    saveToStorage(STORAGE_KEY_OLTS, sharedOlts);
    deleteOltFromFirestore(id);
    notify();
  },

  getZones: () => sharedZones,
  setZones: (data: ServiceZone[]) => {
    sharedZones = data;
    saveToStorage(STORAGE_KEY_ZONES, sharedZones);
    data.forEach(z => saveZoneToFirestore(z));
    notify();
  },
  addZone: (z: ServiceZone) => {
    sharedZones = [z, ...sharedZones];
    saveToStorage(STORAGE_KEY_ZONES, sharedZones);
    saveZoneToFirestore(z);
    notify();
  },
  deleteZone: (id: string) => {
    sharedZones = sharedZones.filter(z => z.id !== id);
    saveToStorage(STORAGE_KEY_ZONES, sharedZones);
    deleteZoneFromFirestore(id);
    notify();
  },

  getIncidents: () => sharedIncidents,
  setIncidents: (data: NetworkIncident[]) => {
    sharedIncidents = data;
    saveToStorage(STORAGE_KEY_INCIDENTS, sharedIncidents);
    data.forEach(inc => saveIncidentToFirestore(inc));
    notify();
  },
  addIncident: (inc: NetworkIncident) => {
    sharedIncidents = [inc, ...sharedIncidents];
    saveToStorage(STORAGE_KEY_INCIDENTS, sharedIncidents);
    saveIncidentToFirestore(inc);
    notify();
  },
  resolveIncident: (id: string) => {
    sharedIncidents = sharedIncidents.map(i => i.id === id ? { ...i, status: "resolved" } : i);
    saveToStorage(STORAGE_KEY_INCIDENTS, sharedIncidents);
    const updated = sharedIncidents.find(i => i.id === id);
    if (updated) saveIncidentToFirestore(updated);
    notify();
  },

  subscribe: (cb: (state?: any) => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }
};

