/**
 * Vite Configuration File
 * 
 * Vite is a modern build tool and development server for JavaScript applications.
 * This file configures how Vite will:
 * - Run the development server
 * - Build the production version of your app
 * - Handle module imports and file paths
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'  // Helper to convert file:// URLs to paths
import path from 'path'              // Node.js path utilities

// Convert the current module's URL to a file path
// This is needed because ES modules use URLs instead of file paths
const __filename = fileURLToPath(import.meta.url)
// Get the directory name from the file path
const __dirname = path.dirname(__filename)

// Export the configuration object using Vite's defineConfig helper
// This provides type checking and autocompletion for the config options
export default defineConfig({
  // Development server configuration
  server: {
    port: 5173,               // The port the dev server will run on
    open: true,               // Automatically open browser when starting dev server
    proxy: {
      // Proxy API requests to the backend server
      // This helps avoid CORS issues during development
      '/api': {
        target: 'http://localhost:8747',  // The backend server address
        changeOrigin: true,               // Change the origin of the request to match the target
      }
    }
  },
  
  // Plugins extend Vite's functionality
  plugins: [
    react()  // Enables React support (JSX, Fast Refresh, etc.)
  ],
  
  // Configure how imports are resolved
  resolve: {
    alias: { 
      // Set up the @ symbol as an alias for the src directory
      // This allows imports like import Component from '@/components/Component'
      // instead of relative paths like '../../components/Component'
      "@": path.resolve(__dirname, "./src")
    }
  }
})
