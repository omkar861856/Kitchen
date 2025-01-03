import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative paths are used for assets
  build: {
    outDir: 'dist', // Output directory for production build
    assetsDir: 'assets', // Folder for static assets (CSS, JS, etc.)
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]', // Ensures hashed file names in assets folder
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  server: {
    open: true, // Automatically open the browser on server start
  },
});