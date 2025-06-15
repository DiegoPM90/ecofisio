import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Configuración de producción idéntica al desarrollo
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Sin minificación para mantener código legible como en desarrollo
    minify: false,
    // Sin optimizaciones que cambien el comportamiento
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Mantener nombres originales
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});