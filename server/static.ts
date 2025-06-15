import express from "express";
import path from "path";
import fs from "fs";

export function serveStaticFiles(app: express.Express) {
  const distPath = path.resolve(process.cwd(), "dist");
  const publicPath = path.resolve(distPath, "public");
  
  // Serve static files from dist/public if it exists
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
  }
  
  // Serve static files from dist
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
  }

  // Fallback to serve the updated index.html for all routes
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Fallback HTML with complete navigation
      const fallbackHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcoFisio - Sistema de Reservas de Kinesiología</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .btn-primary { background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; text-decoration: none; display: inline-block; }
        .btn-secondary { background: #10b981; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 500; text-decoration: none; display: inline-block; }
        .btn-ghost { background: transparent; color: #6b7280; padding: 0.5rem 0.75rem; border: none; border-radius: 0.375rem; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn-primary:hover { background: #2563eb; }
        .btn-secondary:hover { background: #059669; }
        .btn-ghost:hover { color: #374151; background: #f9fafb; }
    </style>
</head>
<body class="min-h-screen bg-slate-50">
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <a href="/" class="flex-shrink-0 flex items-center">
                        <div class="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <span class="text-white font-bold text-sm">EC</span>
                        </div>
                        <span class="font-bold text-xl text-gray-900">EcoFisio Centro</span>
                    </a>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="/auth" class="btn-ghost">Iniciar Sesión</a>
                    <a href="/auth" class="btn-primary">Registrarse</a>
                </div>
            </div>
        </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section class="text-center py-16">
            <div class="max-w-4xl mx-auto">
                <h1 class="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
                    Reserva tu Sesión de Kinesiología
                </h1>
                <p class="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                    Sistema inteligente de reservas con asistencia de IA
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/auth" class="btn-primary text-lg px-8 py-4">Reservar Cita</a>
                    <a href="/status" class="btn-secondary text-lg px-8 py-4">Estado de Citas</a>
                </div>
            </div>
        </section>
    </main>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(fallbackHTML);
    }
  });
}