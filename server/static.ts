import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStaticFiles(app: express.Express) {
  // En producción, servir archivos estáticos compilados si existen
  if (process.env.NODE_ENV === "production") {
    // Intentar servir desde dist/public primero
    try {
      app.use(express.static(join(__dirname, "../dist/public")));
    } catch (error) {
      // Si no existe, servir desde client/dist
      try {
        app.use(express.static(join(__dirname, "../client/dist")));
      } catch (error) {
        // Si tampoco existe, servir directamente desde client/src (fallback)
        app.use(express.static(join(__dirname, "../client/public")));
      }
    }
    
    // Servir index.html para rutas de SPA
    app.get("*", (req, res) => {
      try {
        res.sendFile(join(__dirname, "../dist/public/index.html"));
      } catch (error) {
        try {
          res.sendFile(join(__dirname, "../client/dist/index.html"));
        } catch (error) {
          res.sendFile(join(__dirname, "../client/index.html"));
        }
      }
    });
  }
}