import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToMongoDB } from "./mongodb";
import { setupGoogleAuth } from "./google-auth";

const app = express();

// Middleware personalizado para manejar JSON enviado como text/plain
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'text/plain;charset=UTF-8') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(body);
      } catch (e) {
        req.body = {};
      }
      next();
    });
  } else {
    next();
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Configurar sesiones
const MemStore = MemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu-clave-secreta-super-segura',
  resave: false,
  saveUninitialized: false,
  store: new MemStore({
    checkPeriod: 86400000 // Limpiar sesiones expiradas cada 24 horas
  }),
  cookie: {
    secure: false, // Cambiar a false para desarrollo
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    sameSite: 'lax' // Añadir sameSite para compatibilidad
  }
}));

// Configurar Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configurar Google OAuth
setupGoogleAuth(app);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Conectar a MongoDB si está configurado
  if (process.env.MONGODB_URI) {
    try {
      await connectToMongoDB();
    } catch (error) {
      console.error('No se pudo conectar a MongoDB, usando almacenamiento en memoria');
    }
  } else {
    console.log('📝 Usando almacenamiento en memoria - Para usar MongoDB, configura MONGODB_URI');
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Configure port for both development and production
  const port = parseInt(process.env.PORT || "5000", 10);
  
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
