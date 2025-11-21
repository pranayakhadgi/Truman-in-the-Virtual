import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite Configuration for Truman Virtual Tour
 * 
 * This config sets up Vite to build React components with JSX transformation
 * at build time (instead of browser-based Babel), significantly improving load times.
 * 
 * The build maintains the existing architecture:
 * - Static HTML files (welcome.html, queries.html, index.html)
 * - React components for the 3D tour (index.html)
 * - Public assets served as-is
 */
export default defineConfig({
  plugins: [react()],
  
  // Root directory for Vite
  root: './Frontend',
  
  // Public directory (relative to root)
  publicDir: '../public',
  
  // Build configuration
  build: {
    outDir: '../dist',
    emptyOutDir: false, // Don't clear dist on build (may contain other files)
    rollupOptions: {
      input: {
        // Main React app entry point
        main: resolve(__dirname, 'Frontend/index.html'),
      },
      output: {
        // Preserve file structure
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Optimize chunks
    chunkSizeWarningLimit: 1000,
    // Source maps for debugging (disable in production for smaller builds)
    sourcemap: false,
  },
  
  // Development server configuration
  server: {
    port: 8000,
    open: '/welcome.html',
    cors: true,
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'Frontend'),
      '@components': resolve(__dirname, 'Frontend/components'),
      '@config': resolve(__dirname, 'Frontend/config'),
      '@services': resolve(__dirname, 'Frontend/services'),
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'three'],
  },
});

