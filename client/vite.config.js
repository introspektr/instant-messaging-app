import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8747',
        changeOrigin: true,
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src")}
  }
})
