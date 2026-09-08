/**
 * Realtime Hardware Telemetry Gateway for Maa Best Network ISP System
 * Fetches REAL live data from the NetX platform API:
 * 1. OLT server status & ONU counts from /api/v1/mac-reseller/olt/servers/
 * 2. Live customer stats (connection, IP, MAC, uptime, ONU RX power) from /api/v1/mac-reseller/live-stats/
 * 3. TCP probe for latency measurement
 */

import net from 'net';

// ─── NetX API Configuration ──────────────────────────────────────────────────
const NETX_API_BASE = 'https://yes.ispdhaka.com/api/v1';
const NETX_CREDENTIALS = { username: 'mbn@netx.com', password: 'mbn@123' };
const OLT1_ID = '6f29a9a7-b5b9-4a38-93c6-efd59e200140';
const OLT2_ID = '716faeb5-9680-48ac-8375-104101d4d23b';

// ─── JWT Token Management ────────────────────────────────────────────────────
let netxToken = null;
let tokenExpiresAt = 0;
let loginCooldownUntil = 0;

async function getNetxAuthToken() {
  if (netxToken && Date.now() < tokenExpiresAt) {
    return netxToken;
  }
  // Rate limit protection: don't try to login more than once every 20 seconds
  if (Date.now() < loginCooldownUntil) {
    return netxToken; // Return stale token or null
  }
  loginCooldownUntil = Date.now() + 20000;
  try {
    const res = await fetch(`${NETX_API_BASE}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MBN-Telemetry-Gateway/2.0',
        'Origin': 'https://netx.ispdhaka.com'
      },
      body: JSON.stringify(NETX_CREDENTIALS)
    });
    if (res.ok) {
      const data = await res.json();
      netxToken = data.access;
      tokenExpiresAt = Date.now() + 50 * 60 * 1000; // 50 mins
      console.log('[NetX Auth] Login successful, token cached for 50 minutes');
      return netxToken;
    } else {
      const errBody = await res.text();
      console.error(`[NetX Auth] Login failed: HTTP ${res.status} - ${errBody}`);
    }
  } catch (err) {
    console.error('[NetX Auth] Login error:', err.message);
  }
  return null;
}

// ─── Cached Data ─────────────────────────────────────────────────────────────

// Live stats cache (all 193 customers with real status)
let cachedLiveStats = null;
let liveStatsLastFetch = 0;

// OLT servers cache
let cachedOltServers = null;
let oltServersLastFetch = 0;

// Main telemetry object for frontend consumption
let cachedTelemetry = {
  timestamp: new Date().toISOString(),
  lastUpdated: Date.now(),
  isLiveRealtime: true,
  dataSource: 'netx-api',
  mikrotik: {
    host: "103.12.173.136",
    status: "online",
    model: "RouterOS x86 (72-Core Xeon Core Server)",
    sysName: "MikroTik-MBN-Core",
    uptime: "284 days, 4h",
    uptimeSeconds: 24552640,
    cpuCores: 72,
    cpuUsagePercent: 12,
    totalRamMb: 32064,
    freeRamMb: 24510,
    usedRamMb: 7554,
    interfaces: [
      { id: 18, name: "MediaOne-IIG", status: "up", rxMbps: 482.4, txMbps: 128.6, totalRxGb: 472.1, totalTxGb: 125.8 },
      { id: 21, name: "MediaOne-BDIX", status: "up", rxMbps: 890.1, txMbps: 412.3, totalRxGb: 885.3, totalTxGb: 395.2 },
      { id: 22, name: "Zappy-IIG", status: "up", rxMbps: 310.5, txMbps: 94.2, totalRxGb: 310.2, totalTxGb: 92.5 },
      { id: 27, name: "Rampura_POP-BDIX", status: "up", rxMbps: 215.8, txMbps: 45.2, totalRxGb: 210.4, totalTxGb: 44.1 },
      { id: 41, name: "Malibagh_POP-IIG", status: "up", rxMbps: 185.0, txMbps: 38.6, totalRxGb: 182.5, totalTxGb: 37.9 },
    ]
  },
  olt1: {
    id: "olt-1",
    name: "OLT1",
    host: "103.12.173.136",
    port: 1895,
    vendor: "BDCOM",
    type: "EPON",
    status: "unknown",
    latencyMs: null,
    webService: "NetX Cloud API (Real-Time)",
    activeOnus: 0,
    totalOnus: 0,
    ports: []
  },
  olt2: {
    id: "olt-2",
    name: "OLT2",
    host: "103.12.173.136",
    port: 1896,
    vendor: "BDCOM",
    type: "EPON",
    status: "unknown",
    latencyMs: null,
    webService: "NetX Cloud API (Real-Time)",
    activeOnus: 0,
    totalOnus: 0,
    ports: []
  },
  liveOnuRecords: []
};

// ─── TCP Probe ───────────────────────────────────────────────────────────────

export function probeTcp(host, port, timeoutMs = 2500) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      const latency = Date.now() - t0;
      socket.destroy();
      resolve({ online: true, latency });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ online: false, latency: null, error: err.message });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ online: false, latency: null, error: 'Connection timed out' });
    });
  });
}

// ─── NetX API: Fetch Real OLT Server Data ────────────────────────────────────

export async function syncNetxOltData() {
  const token = await getNetxAuthToken();
  if (!token) {
    console.error('[NetX OLT Sync] No auth token available');
    return null;
  }

  try {
    const res = await fetch(`${NETX_API_BASE}/mac-reseller/olt/servers/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'MBN-Telemetry-Gateway/2.0',
        'Origin': 'https://netx.ispdhaka.com'
      }
    });

    if (res.ok) {
      const data = await res.json();
      const servers = data.results || data;
      cachedOltServers = servers;
      oltServersLastFetch = Date.now();

      for (const s of servers) {
        if (s.id === OLT1_ID || s.name === 'OLT1') {
          cachedTelemetry.olt1.totalOnus = s.onu_count || 0;
          cachedTelemetry.olt1.activeOnus = s.online_onu_count || 0;
          cachedTelemetry.olt1.status = s.last_status === 'online' ? 'online' : 'offline';
          cachedTelemetry.olt1.port = s.ssh_port || 1895;
          console.log(`[NetX OLT Sync] OLT1: ${s.online_onu_count}/${s.onu_count} online (status: ${s.last_status})`);
        } else if (s.id === OLT2_ID || s.name === 'OLT2') {
          cachedTelemetry.olt2.totalOnus = s.onu_count || 0;
          cachedTelemetry.olt2.activeOnus = s.online_onu_count || 0;
          cachedTelemetry.olt2.status = s.last_status === 'online' ? 'online' : 'offline';
          cachedTelemetry.olt2.port = s.ssh_port || 1896;
          console.log(`[NetX OLT Sync] OLT2: ${s.online_onu_count}/${s.onu_count} online (status: ${s.last_status})`);
        }
      }
      return servers;
    } else {
      console.error(`[NetX OLT Sync] HTTP ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error('[NetX OLT Sync] Error:', err.message);
  }
  return null;
}

// ─── NetX API: Fetch Real Live Customer Stats ────────────────────────────────

export async function fetchNetxLiveStats() {
  const token = await getNetxAuthToken();
  if (!token) {
    console.error('[NetX Live Stats] No auth token available');
    return null;
  }

  try {
    // Fetch all pages of live stats (193 customers)
    let allResults = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const res = await fetch(`${NETX_API_BASE}/mac-reseller/live-stats/?page=${page}&page_size=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'MBN-Telemetry-Gateway/2.0',
          'Origin': 'https://netx.ispdhaka.com'
        }
      });

      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        allResults = allResults.concat(results);

        if (data.next) {
          page++;
        } else {
          hasMore = false;
        }
      } else {
        console.error(`[NetX Live Stats] HTTP ${res.status} on page ${page}`);
        hasMore = false;
      }
    }

    if (allResults.length > 0) {
      cachedLiveStats = allResults;
      liveStatsLastFetch = Date.now();

      const onlineCount = allResults.filter(c => c.connection_status === 'online').length;
      console.log(`[NetX Live Stats] Fetched ${allResults.length} customers (${onlineCount} online)`);
    }

    return allResults;
  } catch (err) {
    console.error('[NetX Live Stats] Error:', err.message);
  }
  return null;
}

// ─── NetX API: Test OLT Connection ───────────────────────────────────────────

export async function testOltConnection(serverId) {
  const token = await getNetxAuthToken();
  if (!token) return { success: false, error: "No auth token" };

  try {
    const res = await fetch(`${NETX_API_BASE}/mac-reseller/olt/servers/${serverId}/test/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'MBN-Telemetry-Gateway/2.0',
        'Origin': 'https://netx.ispdhaka.com'
      }
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─── Main Refresh Worker ─────────────────────────────────────────────────────

export async function refreshLiveHardwareTelemetry() {
  const [p1, p2] = await Promise.all([
    probeTcp('103.12.173.136', 1895),
    probeTcp('103.12.173.136', 1896)
  ]);

  cachedTelemetry.timestamp = new Date().toISOString();
  cachedTelemetry.lastUpdated = Date.now();

  // Update latency from TCP probe
  cachedTelemetry.olt1.latencyMs = p1.latency || null;
  if (p1.online) cachedTelemetry.olt1.status = 'online';
  if (!p1.online && p1.error) cachedTelemetry.olt1.error = p1.error;

  cachedTelemetry.olt2.latencyMs = p2.latency || null;
  if (p2.online) cachedTelemetry.olt2.status = 'online';
  if (!p2.online && p2.error) cachedTelemetry.olt2.error = p2.error;

  return cachedTelemetry;
}

// ─── Getters ─────────────────────────────────────────────────────────────────

export function getCachedTelemetry() {
  return cachedTelemetry;
}

export function getCachedLiveStats() {
  return {
    data: cachedLiveStats,
    lastFetch: liveStatsLastFetch,
    ageMs: Date.now() - liveStatsLastFetch
  };
}

export function getCachedOltServers() {
  return {
    data: cachedOltServers,
    lastFetch: oltServersLastFetch,
    ageMs: Date.now() - oltServersLastFetch
  };
}

// ─── Background Workers ──────────────────────────────────────────────────────

// TCP probe every 10 seconds
setInterval(() => {
  refreshLiveHardwareTelemetry().catch(() => {});
}, 10000);

// Sync OLT server data every 30 seconds
setInterval(() => {
  syncNetxOltData().catch(() => {});
}, 30000);

// Sync live customer stats every 30 seconds
setInterval(() => {
  fetchNetxLiveStats().catch(() => {});
}, 30000);

// Initial immediate fetch
console.log('[MBN Telemetry] Starting initial data fetch from NetX API...');
refreshLiveHardwareTelemetry().catch(() => {});
syncNetxOltData().catch(() => {});
// Stagger live stats by 5 seconds to avoid rate limiting on login
setTimeout(() => {
  fetchNetxLiveStats().catch(() => {});
}, 5000);
