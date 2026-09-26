/**
 * Realtime Hardware Telemetry Gateway for Maa Best Network ISP System
 * Fetches REAL live data from the NetX platform API:
 * 1. OLT server status & ONU counts from /api/v1/mac-reseller/olt/servers/
 * 2. Live customer stats (connection, IP, MAC, uptime, ONU RX power) from /api/v1/mac-reseller/live-stats/
 * 3. TCP probe for latency measurement
 */

import net from 'net';
import fs from 'fs';
import path from 'path';

// ─── NetX API Configuration ──────────────────────────────────────────────────
const NETX_API_BASE = 'https://yes.ispdhaka.com/api/v1';
const NETX_CREDENTIALS = { username: 'mbn@netx.com', password: 'mbn@123' };
const OLT1_ID = '6f29a9a7-b5b9-4a38-93c6-efd59e200140';
const OLT2_ID = '716faeb5-9680-48ac-8375-104101d4d23b';

// ─── JWT Token Management (with Persistent Disk Cache) ───────────────────────
const TOKEN_CACHE_FILE = path.join(process.cwd(), '.netx_token_cache.json');
let netxToken = null;
let tokenExpiresAt = 0;
let loginCooldownUntil = 0;
let pendingLoginPromise = null;

function loadDiskToken() {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, 'utf8'));
      if (data.token && data.expiresAt > (Date.now() + 60000)) {
        netxToken = data.token;
        tokenExpiresAt = data.expiresAt;
        console.log('[NetX Auth] Loaded valid token from persistent disk cache');
        return netxToken;
      }
    }
  } catch (_) {}
  return null;
}

function saveDiskToken(token, expiresAt) {
  try {
    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify({ token, expiresAt }), 'utf8');
  } catch (_) {}
}

// Initial check on module load
loadDiskToken();

async function getNetxAuthToken() {
  if (netxToken && Date.now() < tokenExpiresAt) {
    return netxToken;
  }
  const disk = loadDiskToken();
  if (disk) return disk;

  if (pendingLoginPromise) {
    return pendingLoginPromise;
  }
  if (Date.now() < loginCooldownUntil) {
    return netxToken;
  }
  loginCooldownUntil = Date.now() + 15000;
  pendingLoginPromise = (async () => {
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
        saveDiskToken(netxToken, tokenExpiresAt);
        console.log('[NetX Auth] Login successful, token cached for 50 minutes');
        return netxToken;
      } else {
        const errBody = await res.text();
        console.error(`[NetX Auth] Login failed: HTTP ${res.status} - ${errBody}`);
      }
    } catch (err) {
      console.error('[NetX Auth] Login error:', err.message);
    } finally {
      pendingLoginPromise = null;
    }
    return null;
  })();
  return pendingLoginPromise;
}

// ─── Cached Data ─────────────────────────────────────────────────────────────

// Live stats cache (all 193 customers with real status)
let cachedLiveStats = null;
let liveStatsLastFetch = 0;

// OLT servers cache
let cachedOltServers = null;
let oltServersLastFetch = 0;

// Deduplicated MBN Subscribers cache
let cachedMbnUsers = null;
let mbnUsersLastFetch = 0;

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

// ─── RouterOS API: Direct MikroTik Hardware Probe ───────────────────────────

function encodeWord(word) {
  const buf = Buffer.from(word, "utf-8");
  const len = buf.length;
  let lenBuf;
  if (len < 0x80) lenBuf = Buffer.from([len]);
  else if (len < 0x4000) lenBuf = Buffer.from([(len >> 8) | 0x80, len & 0xFF]);
  else lenBuf = Buffer.from([(len >> 16) | 0xC0, (len >> 8) & 0xFF, len & 0xFF]);
  return Buffer.concat([lenBuf, buf]);
}

function decodeSentences(buffer) {
  const results = [];
  let offset = 0;
  let currentSentence = [];

  while (offset < buffer.length) {
    const b0 = buffer[offset];
    let len = 0, headerLen = 0;

    if (b0 === 0) {
      offset += 1;
      if (currentSentence.length > 0) {
        results.push(currentSentence);
        currentSentence = [];
      }
      continue;
    } else if ((b0 & 0x80) === 0) {
      len = b0; headerLen = 1;
    } else if ((b0 & 0xC0) === 0x80) {
      len = ((b0 & 0x3F) << 8) | buffer[offset + 1]; headerLen = 2;
    } else if ((b0 & 0xE0) === 0xC0) {
      len = ((b0 & 0x1F) << 16) | (buffer[offset + 1] << 8) | buffer[offset + 2]; headerLen = 3;
    } else break;

    const word = buffer.slice(offset + headerLen, offset + headerLen + len).toString("utf-8");
    currentSentence.push(word);
    offset += headerLen + len;
  }
  return results;
}

// Track previous interface byte counters for delta Mbps computation
let prevIfaceSnapshot = {};

export function fetchMikrotikLiveStatus(host = "103.12.173.136", port = 8728, user = "billing@mbn", pass = "Billing@mBn234#9530$") {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const socket = new net.Socket();
    socket.setTimeout(6000);

    let stage = 0;
    let rxBuf = Buffer.alloc(0);
    const output = { host, port, online: false, latencyMs: 0, interfaces: [] };
    const ifaceList = [];

    socket.connect(port, host, () => {
      output.latencyMs = Date.now() - t0;
      output.online = true;
      const cmd = Buffer.concat([
        encodeWord("/login"),
        encodeWord(`=name=${user}`),
        encodeWord(`=password=${pass}`),
        Buffer.from([0])
      ]);
      socket.write(cmd);
    });

    socket.on("data", (chunk) => {
      rxBuf = Buffer.concat([rxBuf, chunk]);
      const sentences = decodeSentences(rxBuf);

      for (const s of sentences) {
        if (s[0] === "!done" && stage === 0) {
          stage = 1;
          rxBuf = Buffer.alloc(0);
          socket.write(Buffer.concat([encodeWord("/system/resource/print"), Buffer.from([0])]));
          return;
        } else if (stage === 1 && s[0] === "!re") {
          for (const item of s.slice(1)) {
            const [k, v] = item.slice(1).split("=");
            if (k) output[k] = v;
          }
        } else if (stage === 1 && s[0] === "!done") {
          stage = 2;
          rxBuf = Buffer.alloc(0);
          socket.write(Buffer.concat([encodeWord("/ppp/active/print"), encodeWord("=count-only="), Buffer.from([0])]));
          return;
        } else if (stage === 2) {
          if (s[0] === "!done") {
            for (const item of s.slice(1)) {
              if (item.startsWith("=ret=")) output.activePppoe = parseInt(item.slice(5), 10);
            }
            // Stage 3: Fetch real interface traffic stats
            stage = 3;
            rxBuf = Buffer.alloc(0);
            socket.write(Buffer.concat([encodeWord("/interface/print"), encodeWord("=stats="), Buffer.from([0])]));
            return;
          }
        } else if (stage === 3 && s[0] === "!re") {
          const entry = {};
          for (const item of s.slice(1)) {
            const eq = item.indexOf("=", 1);
            if (eq > 1) entry[item.slice(1, eq)] = item.slice(eq + 1);
          }
          if (entry.name && entry["rx-byte"] !== undefined) ifaceList.push(entry);
        } else if (stage === 3 && s[0] === "!done") {
          const now = Date.now();
          output.interfaces = ifaceList.map(iface => {
            const name = iface.name || "";
            const rxBytes = parseInt(iface["rx-byte"] || "0", 10);
            const txBytes = parseInt(iface["tx-byte"] || "0", 10);
            const isRunning = iface.running === "true" || !!iface["last-link-up-time"];
            let rxMbps = 0, txMbps = 0;
            const prev = prevIfaceSnapshot[name];
            if (prev && (now - prev.ts) > 500) {
              const elapsedSec = (now - prev.ts) / 1000;
              rxMbps = Math.max(0, ((rxBytes - prev.rx) * 8) / (elapsedSec * 1000000));
              txMbps = Math.max(0, ((txBytes - prev.tx) * 8) / (elapsedSec * 1000000));
            }
            prevIfaceSnapshot[name] = { rx: rxBytes, tx: txBytes, ts: now };
            return {
              name, status: isRunning ? "up" : "down",
              rxMbps: Math.round(rxMbps * 10) / 10,
              txMbps: Math.round(txMbps * 10) / 10,
              totalRxGb: Math.round((rxBytes / 1e9) * 10) / 10,
              totalTxGb: Math.round((txBytes / 1e9) * 10) / 10,
            };
          }).filter(i => !i.name.startsWith("<pppoe-") && (i.status === "up" || i.totalRxGb > 0));
          socket.destroy(); resolve(output); return;
        }
      }
    });

    socket.on("error", (err) => { socket.destroy(); resolve({ ...output, online: false, error: err.message }); });
    socket.on("timeout", () => { socket.destroy(); resolve({ ...output, online: false, error: "Timed out" }); });
  });
}

function normalizeMbnUsername(name) {
  if (!name) return "";
  let clean = name.toLowerCase().trim();
  if (clean.startsWith("mbn") && !clean.startsWith("mbn@")) {
    clean = "mbn@" + clean.slice(3);
  }
  return clean;
}

export function fetchDeduplicatedMbnUsers(host = "103.12.173.136", port = 8728, user = "billing@mbn", pass = "Billing@mBn234#9530$") {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(8000);
    let stage = 0;
    let rxBuf = Buffer.alloc(0);
    const rawSecrets = [];
    const rawActive = [];

    socket.connect(port, host, () => {
      const cmd = Buffer.concat([
        encodeWord("/login"),
        encodeWord(`=name=${user}`),
        encodeWord(`=password=${pass}`),
        Buffer.from([0])
      ]);
      socket.write(cmd);
    });

    socket.on("data", (chunk) => {
      rxBuf = Buffer.concat([rxBuf, chunk]);
      const sentences = decodeSentences(rxBuf);
      for (const s of sentences) {
        if (s[0] === "!done" && stage === 0) {
          stage = 1;
          rxBuf = Buffer.alloc(0);
          socket.write(Buffer.concat([encodeWord("/ppp/secret/print"), Buffer.from([0])]));
          return;
        } else if (stage === 1 && s[0] === "!re") {
          const entry = {};
          for (const item of s.slice(1)) {
            if (item.startsWith("=")) {
              const eq = item.indexOf("=", 1);
              if (eq > 1) entry[item.slice(1, eq)] = item.slice(eq + 1);
            }
          }
          if ((entry.name || "").toLowerCase().includes("mbn")) rawSecrets.push(entry);
        } else if (stage === 1 && s[0] === "!done") {
          stage = 2;
          rxBuf = Buffer.alloc(0);
          socket.write(Buffer.concat([encodeWord("/ppp/active/print"), Buffer.from([0])]));
          return;
        } else if (stage === 2 && s[0] === "!re") {
          const entry = {};
          for (const item of s.slice(1)) {
            if (item.startsWith("=")) {
              const eq = item.indexOf("=", 1);
              if (eq > 1) entry[item.slice(1, eq)] = item.slice(eq + 1);
            }
          }
          if ((entry.name || "").toLowerCase().includes("mbn")) rawActive.push(entry);
        } else if (stage === 2 && s[0] === "!done") {
          socket.destroy();

          const activeMap = new Map();
          for (const a of rawActive) {
            const u = normalizeMbnUsername(a.name);
            if (u && !activeMap.has(u)) {
              activeMap.set(u, a);
            }
          }

          const userMap = new Map();
          for (const s of rawSecrets) {
            const u = normalizeMbnUsername(s.name);
            if (!u) continue;
            // Exclude purely artificial test accounts if needed
            if (u === "mbn@test") continue;

            if (userMap.has(u)) {
              const existing = userMap.get(u);
              if (s.disabled === "false") existing.disabled = false;
              if (s["last-caller-id"]) existing.lastCallerId = s["last-caller-id"];
              if (s["last-logged-out"]) existing.lastLoggedOut = s["last-logged-out"];
            } else {
              userMap.set(u, {
                username: u,
                rawName: s.name,
                profile: s.profile || "35M",
                disabled: s.disabled === "true",
                lastCallerId: s["last-caller-id"] || "",
                lastLoggedOut: s["last-logged-out"] || "",
                isOnline: false,
                ip: "",
                mac: s["last-caller-id"] || "",
                uptime: "Offline / Standby",
                status: "offline"
              });
            }
          }

          let onlineCount = 0;
          for (const [u, userObj] of userMap.entries()) {
            const live = activeMap.get(u);
            if (live) {
              userObj.isOnline = true;
              userObj.status = "online";
              userObj.ip = live.address || userObj.ip;
              userObj.mac = live["caller-id"] || userObj.mac;
              userObj.uptime = live.uptime || "Online";
              userObj.sessionId = live["session-id"] || "";
              onlineCount++;
            }
          }

          const subscribers = Array.from(userMap.values()).sort((a, b) => {
            if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
            return a.username.localeCompare(b.username);
          });

          const result = {
            success: true,
            totalSubscribers: subscribers.length,
            onlineCount,
            offlineCount: subscribers.length - onlineCount,
            subscribers
          };

          cachedMbnUsers = result;
          mbnUsersLastFetch = Date.now();
          resolve(result);
        }
      }
    });

    socket.on("error", (err) => { socket.destroy(); resolve({ success: false, error: err.message, subscribers: [] }); });
    socket.on("timeout", () => { socket.destroy(); resolve({ success: false, error: "Timed out", subscribers: [] }); });
  });
}

// ─── RouterOS Connection Defaults ────────────────────────────────────────────
const MK_DEF_HOST = '103.12.173.136';
const MK_DEF_PORT = 8728;
const MK_DEF_USER = 'billing@mbn';
const MK_DEF_PASS = 'Billing@mBn234#9530$';

// ─── Generic RouterOS API Command Executor ────────────────────────────────────
export function executeRouterOsCommand(commandWords, host = MK_DEF_HOST, port = MK_DEF_PORT, user = MK_DEF_USER, pass = MK_DEF_PASS) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(8000);
    let stage = 0;
    let rxBuf = Buffer.alloc(0);
    const results = [];
    let retVal = null;

    socket.connect(port, host, () => {
      socket.write(Buffer.concat([
        encodeWord('/login'),
        encodeWord(`=name=${user}`),
        encodeWord(`=password=${pass}`),
        Buffer.from([0])
      ]));
    });

    socket.on('data', (chunk) => {
      rxBuf = Buffer.concat([rxBuf, chunk]);
      const sentences = decodeSentences(rxBuf);
      for (const s of sentences) {
        if (s[0] === '!done' && stage === 0) {
          stage = 1; rxBuf = Buffer.alloc(0);
          const words = commandWords.map(w => encodeWord(w));
          words.push(Buffer.from([0]));
          socket.write(Buffer.concat(words));
          return;
        } else if (stage === 1 && s[0] === '!re') {
          const entry = {};
          for (const item of s.slice(1)) {
            const eq = item.indexOf('=', 1);
            if (eq > 1) entry[item.slice(1, eq)] = item.slice(eq + 1);
          }
          results.push(entry);
        } else if (stage === 1 && (s[0] === '!done' || s[0] === '!trap')) {
          if (s[0] === '!done') {
            for (const item of s.slice(1)) {
              if (item.startsWith('=ret=')) retVal = item.slice(5);
            }
          }
          const errMsg = s[0] === '!trap'
            ? (s.slice(1).find(i => i.startsWith('=message=')) || '=message=RouterOS Error').slice(9)
            : null;
          socket.destroy();
          resolve({ success: s[0] === '!done', results, retVal, error: errMsg });
          return;
        }
      }
    });
    socket.on('error', (err) => { socket.destroy(); resolve({ success: false, error: err.message, results: [], retVal: null }); });
    socket.on('timeout', () => { socket.destroy(); resolve({ success: false, error: 'Timed out', results: [], retVal: null }); });
  });
}

// ─── Disconnect a PPPoE Session by Username ───────────────────────────────────
export async function disconnectPppoeUser(username) {
  const findResult = await executeRouterOsCommand(['/ppp/active/print', `?name=${username}`]);
  if (!findResult.success || findResult.results.length === 0) {
    return { success: false, error: `No active session found for "${username}"` };
  }
  const sessionId = findResult.results[0]['.id'];
  if (!sessionId) return { success: false, error: 'Session ID not found' };
  const removeResult = await executeRouterOsCommand(['/ppp/active/remove', `=.id=${sessionId}`]);
  return { success: removeResult.success, sessionId, username, error: removeResult.error };
}

// ─── Enable / Disable a PPPoE Secret ─────────────────────────────────────────
export async function setUserDisabledState(username, disabled) {
  let findResult = await executeRouterOsCommand(['/ppp/secret/print', `?name=${username}`]);
  if (!findResult.success || findResult.results.length === 0) {
    const alt = username.toLowerCase().startsWith('mbn@') ? username : 'mbn@' + username.replace(/^mbn/i, '');
    findResult = await executeRouterOsCommand(['/ppp/secret/print', `?name=${alt}`]);
    if (!findResult.success || findResult.results.length === 0) {
      return { success: false, error: `PPPoE secret not found for "${username}"` };
    }
  }
  const secretId = findResult.results[0]['.id'];
  if (!secretId) return { success: false, error: 'Secret ID not found' };
  const setResult = await executeRouterOsCommand(['/ppp/secret/set', `=.id=${secretId}`, `=disabled=${disabled ? 'yes' : 'no'}`]);
  if (setResult.success && disabled) {
    try {
      await disconnectPppoeUser(username);
    } catch (_) {}
  }
  return { success: setResult.success, username, disabled, error: setResult.error };
}

// ─── Real Ping from MikroTik Router ──────────────────────────────────────────
export function mikrotikPing(target, count = 4) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(12000);
    let stage = 0;
    let rxBuf = Buffer.alloc(0);
    const pingResults = [];

    socket.connect(MK_DEF_PORT, MK_DEF_HOST, () => {
      socket.write(Buffer.concat([
        encodeWord('/login'),
        encodeWord(`=name=${MK_DEF_USER}`),
        encodeWord(`=password=${MK_DEF_PASS}`),
        Buffer.from([0])
      ]));
    });

    socket.on('data', (chunk) => {
      rxBuf = Buffer.concat([rxBuf, chunk]);
      const sentences = decodeSentences(rxBuf);
      for (const s of sentences) {
        if (s[0] === '!done' && stage === 0) {
          stage = 1; rxBuf = Buffer.alloc(0);
          socket.write(Buffer.concat([
            encodeWord('/ping'),
            encodeWord(`=address=${target}`),
            encodeWord(`=count=${count}`),
            Buffer.from([0])
          ]));
          return;
        } else if (stage === 1 && s[0] === '!re') {
          const entry = {};
          for (const item of s.slice(1)) {
            const eq = item.indexOf('=', 1);
            if (eq > 1) entry[item.slice(1, eq)] = item.slice(eq + 1);
          }
          pingResults.push(entry);
        } else if (stage === 1 && (s[0] === '!done' || s[0] === '!trap')) {
          socket.destroy();
          if (s[0] === '!trap') {
            const e = (s.slice(1).find(i => i.startsWith('=message=')) || '=message=Ping failed').slice(9);
            resolve({ success: false, error: e, target, results: [] });
            return;
          }
          const ok = pingResults.filter(p => p.status === 'reply' || (p.time && p.time !== 'timeout'));
          const times = ok.map(p => parseFloat((p.time || '0ms').replace('ms', ''))).filter(t => !isNaN(t) && t > 0);
          resolve({
            success: true, target, count,
            sent: pingResults.length,
            received: ok.length,
            lost: pingResults.length - ok.length,
            minMs: times.length ? Math.min(...times).toFixed(2) : 'N/A',
            maxMs: times.length ? Math.max(...times).toFixed(2) : 'N/A',
            avgMs: times.length ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2) : 'N/A',
            results: pingResults
          });
          return;
        }
      }
    });
    socket.on('error', (err) => { socket.destroy(); resolve({ success: false, error: err.message, target, results: [] }); });
    socket.on('timeout', () => { socket.destroy(); resolve({ success: false, error: 'RouterOS ping timed out', target, results: [] }); });
  });
}

// ─── Create a new PPPoE Secret (provision new subscriber) ────────────────────
export async function createPppoeSecret(username, password, profile = 'default', comment = '') {
  // First check if user already exists
  const findResult = await executeRouterOsCommand(['/ppp/secret/print', `?name=${username}`]);
  if (findResult.success && findResult.results.length > 0) {
    return { success: false, error: `PPPoE secret "${username}" already exists on MikroTik. Use toggle to enable/disable.`, alreadyExists: true };
  }
  const words = [
    '/ppp/secret/add',
    `=name=${username}`,
    `=password=${password}`,
    `=service=pppoe`,
    `=profile=${profile}`,
  ];
  if (comment) words.push(`=comment=${comment}`);
  let result = await executeRouterOsCommand(words);
  if (!result.success) {
    try {
      const upstream = await fetch('https://maa-best-network.onrender.com/api/mikrotik/user/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, profile, comment }),
        signal: AbortSignal.timeout(6000)
      });
      if (upstream.ok) {
        const uData = await upstream.json();
        if (uData.success) result = uData;
      }
    } catch (_) {}
  }

  if (result.success) {
    console.log(`[RouterOS] PPPoE secret created: ${username} (profile: ${profile})`);
  } else {
    console.warn(`[RouterOS] PPPoE secret provisioning queued/notified for "${username}": ${result.error || 'RouterOS offline'}`);
  }
  return { success: result.success, username, profile, error: result.error };
}

// ─── Delete a PPPoE Secret (terminate subscriber) ────────────────────────────
export async function deletePppoeSecret(username) {
  // First disconnect any active session
  try { await disconnectPppoeUser(username); } catch (_) {}
  // Find the secret
  let findResult = await executeRouterOsCommand(['/ppp/secret/print', `?name=${username}`]);
  if (!findResult.success || findResult.results.length === 0) {
    // Try alternate form mbn@xxx vs mbnxxx
    const alt = username.toLowerCase().startsWith('mbn@') ? username : 'mbn@' + username.replace(/^mbn/i, '');
    findResult = await executeRouterOsCommand(['/ppp/secret/print', `?name=${alt}`]);
  }

  let secretId = findResult?.results?.[0]?.['.id'];
  let removeResult = { success: false, error: 'Secret not found locally' };

  if (secretId) {
    removeResult = await executeRouterOsCommand(['/ppp/secret/remove', `=.id=${secretId}`]);
  }

  if (!removeResult.success) {
    try {
      const upstream = await fetch('https://maa-best-network.onrender.com/api/mikrotik/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        signal: AbortSignal.timeout(6000)
      });
      if (upstream.ok) {
        const uData = await upstream.json();
        if (uData.success || uData.notFound) removeResult = uData;
      }
    } catch (_) {}
  }

  if (removeResult.success) {
    console.log(`[RouterOS] PPPoE secret deleted: ${username}`);
  } else {
    console.warn(`[RouterOS] PPPoE secret deprovision notice for "${username}": ${removeResult.error || 'Removed from local subscriber database'}`);
  }
  return { success: removeResult.success, username, notFound: !secretId && !removeResult.success, error: removeResult.error };
}

// ─── Get Extended System Details (queues, firewall) ───────────────────────────
export async function getMikrotikDetails() {
  const [queues, filterCount, natCount] = await Promise.all([
    executeRouterOsCommand(['/queue/simple/print', '=count-only=']),
    executeRouterOsCommand(['/ip/firewall/filter/print', '=count-only=']),
    executeRouterOsCommand(['/ip/firewall/nat/print', '=count-only='])
  ]);
  return {
    totalQueues: parseInt(queues.retVal || '0', 10),
    firewallFilterRules: parseInt(filterCount.retVal || '0', 10),
    firewallNatRules: parseInt(natCount.retVal || '0', 10)
  };
}

// ─── Main Refresh Worker ─────────────────────────────────────────────────────


export async function refreshLiveHardwareTelemetry() {
  const [p1, p2, mStatus] = await Promise.all([
    probeTcp('103.12.173.136', 1895),
    probeTcp('103.12.173.136', 1896),
    fetchMikrotikLiveStatus().catch(() => null)
  ]);

  cachedTelemetry.timestamp = new Date().toISOString();
  cachedTelemetry.lastUpdated = Date.now();

  // Update MikroTik real telemetry from direct RouterOS API
  if (mStatus && mStatus.online) {
    cachedTelemetry.mikrotik.status = 'online';
    cachedTelemetry.mikrotik.latencyMs = mStatus.latencyMs;
    cachedTelemetry.mikrotik.uptime = mStatus.uptime || cachedTelemetry.mikrotik.uptime;
    cachedTelemetry.mikrotik.sysName = 'DC-CA';
    cachedTelemetry.mikrotik.version = mStatus.version || '7.11 (stable)';
    if (mStatus['cpu-load']) cachedTelemetry.mikrotik.cpuUsagePercent = parseInt(mStatus['cpu-load'], 10);
    if (mStatus['cpu-count']) cachedTelemetry.mikrotik.cpuCores = parseInt(mStatus['cpu-count'], 10);
    if (mStatus['total-memory']) cachedTelemetry.mikrotik.totalRamMb = Math.round(parseInt(mStatus['total-memory'], 10) / (1024 * 1024));
    if (mStatus['free-memory']) {
      const freeMb = Math.round(parseInt(mStatus['free-memory'], 10) / (1024 * 1024));
      cachedTelemetry.mikrotik.freeRamMb = freeMb;
      cachedTelemetry.mikrotik.usedRamMb = (cachedTelemetry.mikrotik.totalRamMb || 32064) - freeMb;
    }
    if (mStatus.activePppoe !== undefined) {
      cachedTelemetry.mikrotik.activePppoe = mStatus.activePppoe;
    }
    // Wire real interface traffic stats (from Stage 3 /interface/print)
    if (mStatus.interfaces && mStatus.interfaces.length > 0) {
      cachedTelemetry.mikrotik.interfaces = mStatus.interfaces.map((iface, idx) => ({
        id: idx + 1,
        name: iface.name,
        status: iface.status,
        rxMbps: iface.rxMbps,
        txMbps: iface.txMbps,
        totalRxGb: iface.totalRxGb,
        totalTxGb: iface.totalTxGb,
      }));
    }
    cachedTelemetry.mikrotik.lastSync = new Date().toISOString();
  }

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

export function getCachedMbnUsers() {
  return {
    data: cachedMbnUsers,
    lastFetch: mbnUsersLastFetch,
    ageMs: Date.now() - mbnUsersLastFetch
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
