import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@assets': path.resolve(__dirname, 'attached_assets'),
    },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: true,
  },
})
