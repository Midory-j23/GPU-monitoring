/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { rollupOptions: { output: { manualChunks: { antd: ['antd'], charts: ['recharts'], react: ['react', 'react-dom', 'react-router-dom'] } } } },
  server: { proxy: { '/api': 'http://localhost:8000' } }, // used when VITE_USE_MOCK=false
  test: { environment: 'jsdom', globals: true, setupFiles: './src/test-setup.ts', testTimeout: 20000 },
})
