import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
    server: {
      deps: {
        inline: ['react-router-dom']
      }
    },
    onConsoleLog(log, type) {
      // Suppress React warnings in tests
      if (type === 'warning' && log.includes('ReactDOMTestUtils.act')) {
        return false
      }
      if (type === 'warning' && log.includes('React Router Future Flag')) {
        return false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
