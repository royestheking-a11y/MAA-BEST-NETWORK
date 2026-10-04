import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function realtimeTelemetryPlugin() {
  return {
    name: 'realtime-telemetry-plugin',
    configureServer(server: any) {
      server.middlewares.use('/api/realtime/live-status', async (_req: any, res: any) => {
        try {
          const { getCachedTelemetry } = await import('./server/telemetry-service.js');
          const data = getCachedTelemetry();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(data));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      server.middlewares.use('/api/realtime/refresh', async (_req: any, res: any) => {
        try {
          const { refreshLiveHardwareTelemetry } = await import('./server/telemetry-service.js');
          const data = await refreshLiveHardwareTelemetry();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(data));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      server.middlewares.use('/api/netx/live-stats', async (_req: any, res: any) => {
        try {
          const { getCachedLiveStats, fetchNetxLiveStats } = await import('./server/telemetry-service.js');
          const cached = getCachedLiveStats();
          if (!cached.data || cached.ageMs > 60000) {
            fetchNetxLiveStats().catch(() => {});
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            success: true,
            count: cached.data ? cached.data.length : 0,
            lastFetch: cached.lastFetch ? new Date(cached.lastFetch).toISOString() : null,
            ageSeconds: Math.round(cached.ageMs / 1000),
            data: cached.data || []
          }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      server.middlewares.use('/api/netx/olt-servers', async (_req: any, res: any) => {
        try {
          const { getCachedOltServers, syncNetxOltData } = await import('./server/telemetry-service.js');
          const cached = getCachedOltServers();
          if (!cached.data || cached.ageMs > 60000) {
            syncNetxOltData().catch(() => {});
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            success: true,
            lastFetch: cached.lastFetch ? new Date(cached.lastFetch).toISOString() : null,
            ageSeconds: Math.round(cached.ageMs / 1000),
            data: cached.data || []
          }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });

      // Helper to parse JSON body in Vite middleware
      const readBody = (req: any): Promise<any> => new Promise((resolve) => {
        if (req.body && typeof req.body === 'object') return resolve(req.body);
        if (req.readableEnded) return resolve({});
        let data = '';
        let settled = false;
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
          }
        }, 1500);

        req.on('data', (chunk: any) => { data += chunk; });
        req.on('end', () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            try { resolve(JSON.parse(data)); } catch { resolve({}); }
          }
        });
        req.on('error', () => {
          if (!settled) {
            settled = true;
            clearTimeout(timer);
            resolve({});
          }
        });
      });

      // MikroTik real command execution
      server.middlewares.use('/api/mikrotik/command', async (req: any, res: any) => {
        try {
          const body = await readBody(req);
          const { executeRouterOsCommand } = await import('./server/telemetry-service.js');
          const command = body.command || '';
          if (!command) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'command required' }));
            return;
          }
          let clean = command.trim();
          if (!clean.startsWith('/')) clean = '/' + clean;
          const parts = clean.split(/\s+/);
          const pathWords: string[] = [];
          const paramWords: string[] = [];
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

          let result = await executeRouterOsCommand(words);
          if (!result.success) {
            try {
              const upstream = await fetch('https://maa-best-network.onrender.com/api/mikrotik/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(6000)
              });
              if (upstream.ok) {
                const uData = await upstream.json();
                if (uData.success) result = uData;
              }
            } catch (_) {}
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });


      // MikroTik real ping
      server.middlewares.use('/api/mikrotik/ping', async (req: any, res: any) => {
        try {
          const body = await readBody(req);
          const { mikrotikPing } = await import('./server/telemetry-service.js');
          const target = body.target || '8.8.8.8';
          const count = Math.min(10, Math.max(1, parseInt(body.count || '4', 10)));
          const result = await mikrotikPing(target, count);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // MikroTik disconnect subscriber
      const handleDisconnect = async (req: any, res: any) => {
        try {
          const body = await readBody(req);
          const { disconnectPppoeUser } = await import('./server/telemetry-service.js');
          const identifier = body.username || body.customerId || body.id;
          if (!identifier) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'username or customerId required' }));
            return;
          }
          const result = await disconnectPppoeUser(identifier);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      };
      server.middlewares.use('/api/mikrotik/disconnect', handleDisconnect);
      server.middlewares.use('/api/mikrotik/user/disconnect', handleDisconnect);

      // MikroTik toggle user disabled
      server.middlewares.use('/api/mikrotik/user/toggle', async (req: any, res: any) => {
        try {
          const body = await readBody(req);
          const { setUserDisabledState } = await import('./server/telemetry-service.js');
          const identifier = body.username || body.customerId || body.id;
          const disabled = body.disabled !== undefined ? body.disabled : (body.action === 'disable');
          if (!identifier || disabled === undefined) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'username or customerId and disabled boolean required' }));
            return;
          }
          const result = await setUserDisabledState(identifier, !!disabled);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // MikroTik create / auto-provision new subscriber
      server.middlewares.use('/api/mikrotik/user/create', async (req: any, res: any) => {
        try {
          const body = await readBody(req);
          const username = body.username || body.pppUser;
          const password = body.password || body.pppPass || '123456';
          const profile = body.profile || body.package || 'default';
          const comment = body.comment || '';
          if (!username) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'username and password are required' }));
            return;
          }
          const { createPppoeSecret } = await import('./server/telemetry-service.js');
          const result = await createPppoeSecret(username, password, profile, comment, body);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // Real OLT Hardware ONU Reboot via Telnet
      server.middlewares.use('/api/olt/reboot-onu', async (req: any, res: any) => {
        try {
          const body = await readBody(req);
          const { oltServer, mac, ponPort } = body;
          const target = mac || ponPort;
          if (!target) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'mac or ponPort required' }));
            return;
          }
          const { rebootOnuHardware } = await import('./server/telemetry-service.js');
          const result = await rebootOnuHardware(oltServer || 'OLT1', target);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // MikroTik delete / terminate subscriber secret
      server.middlewares.use('/api/mikrotik/user/delete', async (req: any, res: any) => {
        try {
          const body = await readBody(req);
          const identifier = body.username || body.customerId || body.id;
          if (!identifier) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'username or customerId required' }));
            return;
          }
          const { deletePppoeSecret } = await import('./server/telemetry-service.js');
          const result = await deletePppoeSecret(identifier);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // MikroTik update / modify subscriber credentials/profile/status
      server.middlewares.use('/api/mikrotik/user/update', async (req: any, res: any) => {
        try {
          const body = await readBody(req);
          const { username, customerId, newUsername, password, profile, package: pkg, comment, disabled, phone, name, address, zone, ipAddress, remoteAddress, ip } = body;
          if (!username && !customerId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'username or customerId required' }));
            return;
          }
          const { updatePppoeSecret } = await import('./server/telemetry-service.js');
          const result = await updatePppoeSecret(username || customerId, {
            customerId, newUsername, password, profile, package: pkg, comment, disabled, phone, name, address, zone,
            ipAddress: ipAddress || remoteAddress || ip,
            remoteAddress: remoteAddress || ipAddress || ip
          });
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // NetX live ONU RX power for a MAC
      server.middlewares.use('/api/netx/onu-power', async (req: any, res: any) => {
        try {
          const body = await readBody(req);
          const { mac } = body;
          const { getCachedLiveStats } = await import('./server/telemetry-service.js');
          const cached = getCachedLiveStats();
          const all = cached.data || [];
          const match = mac ? all.find((c: any) => (c.live_mac || '').toLowerCase() === mac.toLowerCase()) : null;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            success: !!match,
            onu_rx_power: match ? match.onu_rx_power : null,
            connection_status: match ? match.connection_status : null,
            pppoe_username: match ? match.pppoe_username : null,
          }));
        } catch (e: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // MikroTik extended details
      server.middlewares.use('/api/mikrotik/details', async (_req: any, res: any) => {
        try {
          const { getMikrotikDetails } = await import('./server/telemetry-service.js');
          const result = await getMikrotikDetails();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // MikroTik subscribers list
      server.middlewares.use('/api/mikrotik/users', async (_req: any, res: any) => {
        try {
          const { fetchDeduplicatedMbnUsers, getCachedMbnUsers } = await import('./server/telemetry-service.js');
          const cached = getCachedMbnUsers();
          if (cached.data && (Date.now() - cached.lastFetch < 15000)) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, cached: true, ...cached.data }));
            return;
          }
          const fresh = await fetchDeduplicatedMbnUsers();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ success: true, cached: false, ...fresh }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // MikroTik force sync
      server.middlewares.use('/api/mikrotik/sync', async (_req: any, res: any) => {
        try {
          const { fetchMikrotikLiveStatus, fetchDeduplicatedMbnUsers, refreshLiveHardwareTelemetry } = await import('./server/telemetry-service.js');
          const [status, mbnUsers] = await Promise.all([
            fetchMikrotikLiveStatus(),
            fetchDeduplicatedMbnUsers()
          ]);
          await refreshLiveHardwareTelemetry();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            success: true,
            message: 'MikroTik hardware and deduplicated MBN subscriber pool synced',
            data: status,
            subscribers: mbnUsers
          }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // ─── Real MikroTik / NetX Internet Setup Packages ───
      server.middlewares.use('/api/packages', async (_req: any, res: any) => {
        try {
          const { getCachedNetxPackages, fetchNetxPackages } = await import('./server/telemetry-service.js');
          let cached = getCachedNetxPackages();
          if (!cached.data || cached.ageMs > 60000) {
            const fresh = await fetchNetxPackages();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, count: fresh.length, data: fresh }));
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ success: true, count: cached.data.length, data: cached.data }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      server.middlewares.use('/api/netx/packages', async (_req: any, res: any) => {
        try {
          const { getCachedNetxPackages, fetchNetxPackages } = await import('./server/telemetry-service.js');
          let cached = getCachedNetxPackages();
          if (!cached.data || cached.ageMs > 60000) {
            const fresh = await fetchNetxPackages();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, count: fresh.length, data: fresh }));
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ success: true, count: cached.data.length, data: cached.data }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // ─── Live NetX Dashboard ───
      server.middlewares.use('/api/netx/dashboard', async (_req: any, res: any) => {
        try {
          const { getCachedNetxDashboard, fetchNetxDashboard } = await import('./server/telemetry-service.js');
          let cached = getCachedNetxDashboard();
          if (!cached.data || cached.ageMs > 30000) {
            const fresh = await fetchNetxDashboard();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, data: fresh }));
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ success: true, data: cached.data }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // ─── Live 194 Customers from NetX ───
      server.middlewares.use('/api/netx/customers', async (_req: any, res: any) => {
        try {
          const { getCachedNetxCustomers, fetchNetxFullCustomers } = await import('./server/telemetry-service.js');
          let cached = getCachedNetxCustomers();
          if (!cached.data || cached.ageMs > 30000) {
            const fresh = await fetchNetxFullCustomers();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, count: fresh.length, data: fresh }));
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ success: true, count: cached.data.length, data: cached.data }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });

      // ─── Live Zones from NetX ───
      server.middlewares.use('/api/zones', async (_req: any, res: any) => {
        try {
          const { getCachedNetxZones, fetchNetxZones } = await import('./server/telemetry-service.js');
          let cached = getCachedNetxZones();
          if (!cached.data || cached.ageMs > 60000) {
            const fresh = await fetchNetxZones();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, data: fresh }));
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ success: true, data: cached.data }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      server.middlewares.use('/api/netx/zones', async (_req: any, res: any) => {
        try {
          const { getCachedNetxZones, fetchNetxZones } = await import('./server/telemetry-service.js');
          let cached = getCachedNetxZones();
          if (!cached.data || cached.ageMs > 60000) {
            const fresh = await fetchNetxZones();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, data: fresh }));
            return;
          }
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ success: true, data: cached.data }));
        } catch (e: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
    }
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    realtimeTelemetryPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
