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
