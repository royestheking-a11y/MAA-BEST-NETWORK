import http from 'http';
import { getCachedTelemetry, refreshLiveHardwareTelemetry, executeOltCommand } from './telemetry-service.js';

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

  // 4. OLT CLI command execution
  if (url.pathname === '/api/olt/command') {
    const host = url.searchParams.get('host') || '103.12.173.136';
    const port = Number(url.searchParams.get('port')) || 1895;
    const cmd = url.searchParams.get('cmd') || 'show epon onu-information';
    const user = url.searchParams.get('user') || 'mbn@netx.com';
    const pass = url.searchParams.get('pass') || '';

    const result = await executeOltCommand(host, port, user, pass, cmd);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // 5. Health check
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'mbn-telemetry-gateway', sseClients: sseClients.size }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`[MBN Telemetry Gateway] Realtime SSE Stream on http://localhost:${PORT}/api/realtime/stream`);
  console.log(`[MBN Telemetry Gateway] High-speed endpoint on http://localhost:${PORT}/api/realtime/live-status`);
  console.log(`[MBN Telemetry Gateway] Connected to BDCOM OLT 1 (103.12.173.136:1895)`);

  // Autonomous Built-in Self-Ping Keep-Alive (every 8 minutes)
  const SELF_URL = process.env.RENDER_EXTERNAL_URL || "https://maa-best-network.onrender.com";
  console.log(`[Self-Ping Engine] Initialized keep-alive loop for ${SELF_URL}/health`);

  setInterval(async () => {
    try {
      const res = await fetch(`${SELF_URL}/health`, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        console.log(`[Self-Ping Keep-Alive] Pinged ${SELF_URL}/health at ${new Date().toLocaleTimeString()} (HTTP ${res.status})`);
      }
    } catch (err) {
      console.log(`[Self-Ping Keep-Alive] Ping notice:`, err.message);
    }
  }, 8 * 60 * 1000); // 8 minutes (Render sleeps at 15 minutes)
});
