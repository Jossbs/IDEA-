import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // `@/...` maps to `src/...` for clean, feature-based imports
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: true, // expose on 0.0.0.0 so the Docker container is reachable
    port: 5173,
  },
})
