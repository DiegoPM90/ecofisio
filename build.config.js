// Build configuration optimized for Replit deployment
import { build } from 'vite';
import { build as esbuild } from 'esbuild';

// Optimized Vite build for production
await build({
  build: {
    minify: false,
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});

// Optimized esbuild for server
await esbuild({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outdir: 'dist',
  external: ['express', 'mongoose', 'mongodb', 'drizzle-orm', '@neondatabase/serverless'],
  minify: false,
  sourcemap: false,
  logLevel: 'info'
});

console.log('Build completed successfully!');