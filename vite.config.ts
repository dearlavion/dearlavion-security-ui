import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Both proxies go to the shared auth service, which owns the accounts, the refresh-token cookie and the superadmin API,
// so everything stays same-origin with the app (the cookie is SameSite=Strict).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:9081',
        rewrite: (path) => path.replace(/^\/api\/v1\/auth/, '/auth'),
      },
      '/api/v1/superadmin': {
        target: 'http://localhost:9081',
        rewrite: (path) => path.replace(/^\/api\/v1\/superadmin/, '/superadmin'),
      },
    },
  },
});
