/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['@capacitor-community/barcode-scanner'], // Exclude optional dependency from pre-bundling
  },
  server: {
    host: '0.0.0.0', // Allow external connections (needed for iOS simulator)
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
