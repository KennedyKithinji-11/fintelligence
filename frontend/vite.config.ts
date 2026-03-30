import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy /auth, /market, /research, /admin to FastAPI backend
    // This avoids CORS issues during development
    proxy: {
      '/auth':     { target: 'http://localhost:8000', changeOrigin: true },
      '/market':   { target: 'http://localhost:8000', changeOrigin: true },
      '/research': { target: 'http://localhost:8000', changeOrigin: true },
      '/alerts':   { target: 'http://localhost:8000', changeOrigin: true },
      '/admin':    { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})