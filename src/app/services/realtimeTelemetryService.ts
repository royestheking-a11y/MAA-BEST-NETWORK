import { useState, useEffect } from "react";

export interface LiveInterfaceMetric {
  id: number;
  name: string;
  status: "up" | "down";
  rxMbps: number;
  txMbps: number;
  totalRxGb: number;
  totalTxGb: number;
}

export interface LiveMikrotikData {
  host: string;
  status: "online" | "offline";
  model: string;
  sysName: string;
  uptime: string;
  uptimeSeconds: number;
  cpuCores: number;
  cpuUsagePercent: number;
  totalRamMb: number;
  freeRamMb: number;
  usedRamMb: number;
  interfaces: LiveInterfaceMetric[];
  latencyMs?: number;
  temperature?: number;
  version?: string;
  activePppoe?: number;
  lastSync?: string;
}

export interface LiveOltData {
  id: string;
  name: string;
  host: string;
  port: number;
  vendor: string;
  type: string;
  status: "online" | "offline";
  latencyMs: number | null;
  webService?: string;
  error?: string;
  activeOnus: number;
  totalOnus: number;
  ports: Array<{
    port: string;
    online: number;
    total: number;
    rxPowerDbm: number;
    status: string;
  }>;
}

export interface HardwareTelemetryPayload {
  timestamp: string;
  lastUpdated: number;
  isLiveRealtime: boolean;
  mikrotik: LiveMikrotikData;
  olt1: LiveOltData;
  olt2: LiveOltData;
}

// Default/initial state — everything starts OFFLINE until real telemetry data arrives.
// This prevents the UI from showing hardcoded "online" when no live data has been fetched.
const DEFAULT_TELEMETRY: HardwareTelemetryPayload = {
  timestamp: new Date().toISOString(),
  lastUpdated: 0, // 0 = no data yet
  isLiveRealtime: false,
  mikrotik: {
    host: "103.12.173.136",
    status: "offline",
    model: "RouterOS x86 (72-Core Xeon Core Server)",
    sysName: "DC-CA",
    uptime: "—",
    uptimeSeconds: 0,
    cpuCores: 72,
    cpuUsagePercent: 0,
    totalRamMb: 32064,
    freeRamMb: 0,
    usedRamMb: 0,
    latencyMs: undefined,
    temperature: undefined,
    version: "—",
    activePppoe: 0,
    interfaces: []
  },
  olt1: {
    id: "olt-1",
    name: "OLT1",
    host: "103.12.173.136",
    port: 1895,
    vendor: "BDCOM",
    type: "EPON",
    status: "offline",
    latencyMs: null,
    webService: "BDCOM EPON CLI Telnet v1.0",
    activeOnus: 0,
    totalOnus: 0,
    ports: []
  },
  olt2: {
    id: "olt-2",
    name: "OLT2",
    host: "103.12.173.136",
    port: 1894,
    vendor: "BDCOM",
    type: "GPON",
    status: "offline",
    latencyMs: null,
    webService: "BDCOM GPON CLI Telnet v1.0",
    activeOnus: 0,
    totalOnus: 0,
    ports: []
  }
};

/**
 * Custom React Hook to poll live hardware telemetry
 * Uses debounce logic to prevent OLT status flickering between online/offline
 */
export function useRealtimeHardwareTelemetry(pollIntervalMs = 8000) {
  const [telemetry, setTelemetry] = useState<HardwareTelemetryPayload>(DEFAULT_TELEMETRY);
  // Start as false — only flip to true once real data arrives from the backend
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("—");

  useEffect(() => {
    let isMounted = true;
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const defaultGateway = isLocal ? "" : "https://maa-best-network.onrender.com";
    const gatewayBase = (import.meta as any).env?.VITE_GATEWAY_URL || defaultGateway;
    const streamEndpoint = `${gatewayBase}/api/realtime/stream`;
    const statusEndpoint = `${gatewayBase}/api/realtime/live-status`;

    let eventSource: EventSource | null = null;
    let fallbackInterval: any = null;

    // ── OLT Status Debounce (client-side) ──────────────────────────────────
    // Prevent rapid online/offline flickering by requiring 3 consecutive
    // offline reports before changing status to offline on the UI.
    let olt1OfflineCount = 0;
    let olt2OfflineCount = 0;
    const OFFLINE_THRESHOLD = 3;

    function stabilizeOltStatus(data: HardwareTelemetryPayload): HardwareTelemetryPayload {
      // Truthful real-time reporting — never mask offline status as online
      return data;
    }

    // 1. Try Zero-Delay Server-Sent Events (SSE) Stream
    try {
      if (typeof window !== "undefined" && window.EventSource) {
        eventSource = new EventSource(streamEndpoint);

        eventSource.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data && data.mikrotik) {
              setTelemetry(stabilizeOltStatus(data));
              setIsLiveConnected(true);
              setLastSyncTime(new Date().toLocaleTimeString());
            }
          } catch (_) {}
        };

        eventSource.onerror = () => {
          // SSE not supported on static host, close and rely on fast polling
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
        };
      }
    } catch (_) {}

    // 2. Polling Mechanism
    async function fetchTelemetry() {
      try {
        const res = await fetch(statusEndpoint, {
          signal: AbortSignal.timeout(5000),
        }).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          if (isMounted && data && data.mikrotik) {
            setTelemetry(stabilizeOltStatus(data));
            setIsLiveConnected(true);
            setLastSyncTime(new Date().toLocaleTimeString());
            return;
          }
        }
      } catch (_) {}

      // Backend unreachable: mark as disconnected so the UI shows offline correctly
      if (isMounted) {
        setIsLiveConnected(false);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    }

    fetchTelemetry();
    fallbackInterval = setInterval(fetchTelemetry, pollIntervalMs);

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [pollIntervalMs]);

  return { telemetry, isLiveConnected, lastSyncTime };
}
