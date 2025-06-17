#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('Building ECOFISIO for Netlify deployment...');

try {
  // Clear any existing dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Create a minimal vite config for production build
  const viteConfig = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client/src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
  },
  root: "client",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
`;

  fs.writeFileSync('vite.config.production.js', viteConfig);

  // Run the build
  console.log('Running Vite build...');
  execSync('npx vite build --config vite.config.production.js', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Verify build output
  if (fs.existsSync('dist/index.html')) {
    console.log('Build completed successfully');
    
    // List contents
    const files = fs.readdirSync('dist');
    console.log('Generated files:', files.join(', '));
    
    // Clean up temp config
    fs.unlinkSync('vite.config.production.js');
    
  } else {
    throw new Error('Build failed - index.html not generated');
  }

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}