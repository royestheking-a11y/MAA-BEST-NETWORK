/**
 * NetX Live Data Service — Fetches REAL data from the NetX API via Render backend proxy.
 * This replaces all hardcoded/fake ONU and customer status data.
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types (matching real NetX API response) ─────────────────────────────────

export interface NetxLiveCustomer {
  id: string;
  full_name: string;
  user_id: string;
  pppoe_username: string;
  connection_status: "online" | "offline";
  connection_type: string;
  package_name: string;
  zone_name: string;
  server_name: string;
  live_ip: string;
  live_mac: string;
  live_uptime: string;
  live_tx_bytes: number;
  live_rx_bytes: number;
  last_seen_online: string | null;
  downtime_seconds: number | null;
  onu_rx_power: number | null;
  onu_status: string | null;
  onu_last_seen_at: string | null;
  onu_status_changed_at: string | null;
  onu_device_uptime_seconds: number | null;
  onu_server_status: string | null;
}

export interface NetxOltServer {
  id: string;
  name: string;
  host: string;
  brand: string;
  olt_type: string;
  connection_type: string;
  ssh_port: number;
  snmp_community: string;
  snmp_port: number;
  last_status: "online" | "offline";
  last_checked_at: string;
  is_active: boolean;
  onu_count: number;
  online_onu_count: number;
  created_at: string;
  updated_at: string;
}

export interface NetxLiveData {
  liveStats: NetxLiveCustomer[];
  oltServers: NetxOltServer[];
  isLoading: boolean;
  isConnected: boolean;
  lastRefresh: Date | null;
  error: string | null;
  refresh: () => void;
}

// ─── Gateway URL ─────────────────────────────────────────────────────────────

function getGatewayBase(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return ""; // Same-origin in dev
    }
  }
  return (import.meta as any).env?.VITE_GATEWAY_URL || "https://maa-best-network.onrender.com";
}

// ─── Data Cache (module-level singleton) ─────────────────────────────────────

let _liveStatsCache: NetxLiveCustomer[] = [];
let _oltServersCache: NetxOltServer[] = [];
let _lastFetchTime = 0;
let _isFetching = false;
let _listeners: Set<() => void> = new Set();

function notifyListeners() {
  _listeners.forEach(fn => fn());
}

async function fetchLiveStats(): Promise<NetxLiveCustomer[]> {
  try {
    const base = getGatewayBase();
    const res = await fetch(`${base}/api/netx/live-stats`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (_) {}
  return [];
}

async function fetchOltServers(): Promise<NetxOltServer[]> {
  try {
    const base = getGatewayBase();
    const res = await fetch(`${base}/api/netx/olt-servers`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (_) {}
  return [];
}

async function refreshAll() {
  if (_isFetching) return;
  _isFetching = true;
  try {
    const [stats, servers] = await Promise.all([
      fetchLiveStats(),
      fetchOltServers(),
    ]);
    if (stats.length > 0) {
      _liveStatsCache = stats;
    }
    if (servers.length > 0) {
      _oltServersCache = servers;
    }
    _lastFetchTime = Date.now();
    notifyListeners();
  } finally {
    _isFetching = false;
  }
}

// ─── React Hook ──────────────────────────────────────────────────────────────

export function useNetxLiveData(pollIntervalMs = 30000): NetxLiveData {
  const [, forceUpdate] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<any>(null);

  const refresh = useCallback(() => {
    setIsLoading(true);
    refreshAll()
      .then(() => {
        setError(null);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    // Subscribe to updates
    const listener = () => forceUpdate(n => n + 1);
    _listeners.add(listener);

    // Initial fetch
    refresh();

    // Polling
    intervalRef.current = setInterval(refresh, pollIntervalMs);

    return () => {
      _listeners.delete(listener);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pollIntervalMs, refresh]);

  return {
    liveStats: _liveStatsCache,
    oltServers: _oltServersCache,
    isLoading: isLoading && _liveStatsCache.length === 0,
    isConnected: _liveStatsCache.length > 0 || _oltServersCache.length > 0,
    lastRefresh: _lastFetchTime ? new Date(_lastFetchTime) : null,
    error,
    refresh,
  };
}
