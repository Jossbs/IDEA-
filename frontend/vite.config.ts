import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // `@/...` maps to `src/...` for clean, feature-based imports
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: true, // expose on 0.0.0.0 so the Docker container is reachable
    port: 5173,
    // In dev the SPA calls relative `/api`; proxy it to the local backend so
    // requests stay same-origin (mirrors the Nginx reverse-proxy in prod).
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
