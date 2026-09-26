import http from 'http';
import { getCachedTelemetry, refreshLiveHardwareTelemetry, syncNetxOltData, testOltConnection, getCachedLiveStats, getCachedOltServers, fetchNetxLiveStats, fetchMikrotikLiveStatus, fetchDeduplicatedMbnUsers, getCachedMbnUsers, executeRouterOsCommand, disconnectPppoeUser, setUserDisabledState, mikrotikPing, getMikrotikDetails, createPppoeSecret, updatePppoeSecret, deletePppoeSecret } from './telemetry-service.js';

const PORT = process.env.PORT || 5050;

// Connected SSE clients for zero-delay real-time push
const sseClients = new Set();

export function broadcastTelemetry(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (_) {
      sseClients.delete(client);
    }
  }
}

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Helper: read JSON POST body
  const readBody = () => new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
  });

  const url = new URL(req.url, `http://${req.headers.host}`);

  // 1. Zero-delay Server-Sent Events (SSE) persistent stream
  if (url.pathname === '/api/realtime/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Send initial snapshot immediately (0ms delay)
    res.write(`data: ${JSON.stringify(getCachedTelemetry())}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // 2. High-speed cached JSON endpoint (<2ms response)
  if (url.pathname === '/api/realtime/live-status' || url.pathname === '/api/realtime') {
    const data = getCachedTelemetry();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // 3. Force refresh trigger
  if (url.pathname === '/api/realtime/refresh') {
    const data = await refreshLiveHardwareTelemetry();
    broadcastTelemetry(data);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // ─── NEW: Real Live Stats Proxy from NetX API ─────────────────────────────

  // 4. Get real live customer stats (connection status, IP, MAC, uptime, ONU RX power)
  if (url.pathname === '/api/netx/live-stats') {
    const cached = getCachedLiveStats();
    // If data is older than 60s, trigger a background refresh
    if (!cached.data || cached.ageMs > 60000) {
      fetchNetxLiveStats().catch(() => {});
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: cached.data ? cached.data.length : 0,
      lastFetch: cached.lastFetch ? new Date(cached.lastFetch).toISOString() : null,
      ageSeconds: Math.round(cached.ageMs / 1000),
      data: cached.data || []
    }));
    return;
  }

  // 5. Get real OLT server data (status, ONU counts)
  if (url.pathname === '/api/netx/olt-servers') {
    const cached = getCachedOltServers();
    if (!cached.data || cached.ageMs > 60000) {
      syncNetxOltData().catch(() => {});
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      lastFetch: cached.lastFetch ? new Date(cached.lastFetch).toISOString() : null,
      ageSeconds: Math.round(cached.ageMs / 1000),
      data: cached.data || []
    }));
    return;
  }

  // 6. OLT Live Cloud Sync (force)
  if (url.pathname === '/api/olt/sync') {
    const data = await syncNetxOltData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, servers: data }));
    return;
  }

  // 7. OLT Live Test
  if (url.pathname === '/api/olt/test') {
    const serverId = url.searchParams.get('id') || '6f29a9a7-b5b9-4a38-93c6-efd59e200140';
    const data = await testOltConnection(serverId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // 8. Health check
  if (url.pathname === '/health') {
    const liveStats = getCachedLiveStats();
    const oltServers = getCachedOltServers();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'mbn-telemetry-gateway',
      version: '2.0',
      sseClients: sseClients.size,
      liveStatsAge: Math.round(liveStats.ageMs / 1000) + 's',
      liveStatsCount: liveStats.data ? liveStats.data.length : 0,
      oltServersAge: Math.round(oltServers.ageMs / 1000) + 's'
    }));
    return;
  }

  // 9. MikroTik Live Status from direct RouterOS API
  if (url.pathname === '/api/mikrotik/live-status' || url.pathname === '/api/mikrotik') {
    const data = getCachedTelemetry();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: data.mikrotik
    }));
    return;
  }

  // 10. MikroTik Deduplicated MBN Subscribers List
  if (url.pathname === '/api/mikrotik/users' || url.pathname === '/api/mikrotik/subscribers') {
    const cached = getCachedMbnUsers();
    if (cached.data && (Date.now() - cached.lastFetch < 15000)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, cached: true, ...cached.data }));
      return;
    }
    const fresh = await fetchDeduplicatedMbnUsers();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, cached: false, ...fresh }));
    return;
  }

  // 11. MikroTik Force Direct Probe & Sync
  if (url.pathname === '/api/mikrotik/sync') {
    const [status, mbnUsers] = await Promise.all([
      fetchMikrotikLiveStatus(),
      fetchDeduplicatedMbnUsers()
    ]);
    await refreshLiveHardwareTelemetry();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'MikroTik hardware and deduplicated MBN subscriber pool synced',
      data: status,
      subscribers: mbnUsers
    }));
    return;
  }

  // 12. Real RouterOS Command Execution (for live CLI terminal)
  if (url.pathname === '/api/mikrotik/command' && req.method === 'POST') {
    const body = await readBody();
    const { command } = body;
    if (!command || typeof command !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'command field required' }));
      return;
    }
    // Parse command string into RouterOS API words (e.g. /system resource print -> /system/resource/print)
    let clean = command.trim();
    if (!clean.startsWith('/')) clean = '/' + clean;
    const parts = clean.split(/\s+/);
    const pathWords = [];
    const paramWords = [];
    for (const p of parts) {
      if (p.startsWith('=') || p.startsWith('?') || p.startsWith('.')) {
        paramWords.push(p);
      } else if (p.includes('=')) {
        paramWords.push(`=${p}`);
      } else if (pathWords.length > 0 && ['print', 'get', 'set', 'add', 'remove', 'enable', 'disable', 'reset', 'comment'].includes(pathWords[pathWords.length - 1])) {
        paramWords.push(`=${p}`);
      } else {
        pathWords.push(p.replace(/^\//, ''));
      }
    }
    const apiPath = '/' + pathWords.join('/');
    const words = [apiPath, ...paramWords];

    const result = await executeRouterOsCommand(words);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 13. Real Ping from MikroTik
  if (url.pathname === '/api/mikrotik/ping' && req.method === 'POST') {
    const body = await readBody();
    const target = body.target || '8.8.8.8';
    const count = Math.min(10, Math.max(1, parseInt(body.count || '4', 10)));
    const result = await mikrotikPing(target, count);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 14. Disconnect PPPoE User (kill active session)
  if (url.pathname === '/api/mikrotik/disconnect' && req.method === 'POST') {
    const body = await readBody();
    const { username } = body;
    if (!username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'username required' }));
      return;
    }
    const result = await disconnectPppoeUser(username);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 15. Enable / Disable PPPoE Secret
  if (url.pathname === '/api/mikrotik/user/toggle' && req.method === 'POST') {
    const body = await readBody();
    const { username, disabled } = body;
    if (!username || disabled === undefined) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'username and disabled (boolean) required' }));
      return;
    }
    const result = await setUserDisabledState(username, !!disabled);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 16. Extended MikroTik System Details
  if (url.pathname === '/api/mikrotik/details') {
    const details = await getMikrotikDetails();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, ...details }));
    return;
  }

  // 17. Create (provision) a new PPPoE secret on MikroTik
  if (url.pathname === '/api/mikrotik/user/create' && req.method === 'POST') {
    const body = await readBody();
    const { username, password, profile, comment } = body;
    if (!username || !password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'username and password are required' }));
      return;
    }
    const result = await createPppoeSecret(username, password, profile || 'default', comment || '');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 18. Delete (remove) a PPPoE secret from MikroTik
  if (url.pathname === '/api/mikrotik/user/delete' && req.method === 'POST') {
    const body = await readBody();
    const { username } = body;
    if (!username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'username required' }));
      return;
    }
    const result = await deletePppoeSecret(username);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 19. Update (modify) a PPPoE secret on MikroTik
  if (url.pathname === '/api/mikrotik/user/update' && req.method === 'POST') {
    const body = await readBody();
    const { username, newUsername, password, profile, comment, disabled } = body;
    if (!username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'username required' }));
      return;
    }
    const result = await updatePppoeSecret(username, { newUsername, password, profile, comment, disabled });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 20. Fetch live ONU RX power for a specific MAC from NetX
  if (url.pathname === '/api/netx/onu-power' && req.method === 'POST') {
    const body = await readBody();
    const { mac } = body;
    const cached = getCachedLiveStats();
    const all = cached.data || [];
    const match = mac ? all.find(c => (c.live_mac || '').toLowerCase() === mac.toLowerCase()) : null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: !!match,
      onu_rx_power: match ? match.onu_rx_power : null,
      connection_status: match ? match.connection_status : null,
      pppoe_username: match ? match.pppoe_username : null,
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`[MBN Telemetry Gateway v2.0] Real-time data from NetX API`);
  console.log(`  SSE Stream:   http://localhost:${PORT}/api/realtime/stream`);
  console.log(`  Live Status:  http://localhost:${PORT}/api/realtime/live-status`);
  console.log(`  Live Stats:   http://localhost:${PORT}/api/netx/live-stats`);
  console.log(`  OLT Servers:  http://localhost:${PORT}/api/netx/olt-servers`);

  // Autonomous Self-Ping Keep-Alive (every 8 minutes)
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || "https://maa-best-network.onrender.com";
  console.log(`[Self-Ping Engine] Initialized keep-alive loop for ${SELF_URL}/health`);

  setInterval(async () => {
    try {
      const res = await fetch(`${SELF_URL}/health`, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        console.log(`[Self-Ping Keep-Alive] Pinged at ${new Date().toLocaleTimeString()} (HTTP ${res.status})`);
      }
    } catch (err) {
      console.log(`[Self-Ping Keep-Alive] Ping notice:`, err.message);
    }
  }, 8 * 60 * 1000);
});
