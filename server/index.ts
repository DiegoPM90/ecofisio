import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { connectToMongoDB } from "./mongodb";
import { notificationService } from "./notifications";

const app = express();

// Configurar trust proxy para manejar headers X-Forwarded-For correctamente
app.set('trust proxy', true);

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

// Headers de seguridad críticos
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.removeHeader('X-Powered-By');
  next();
});

app.use(express.json({ limit: '1mb' })); // Reducido de 10mb a 1mb
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Configurar sesiones
const MemStore = MemoryStore(session);

// Configuración de sesiones con máxima seguridad
const sessionConfig = {
  secret: process.env.SESSION_SECRET || require('crypto').randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  store: new MemStore({
    checkPeriod: 86400000 // Limpiar sesiones expiradas cada 24 horas
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS obligatorio en producción
    httpOnly: true, // Previene acceso desde JavaScript del navegador
    maxAge: 5 * 60 * 1000, // 5 minutos - coincide con timeout automático
    sameSite: 'strict' as const, // Máxima protección CSRF
    path: '/'
  },
  name: 'ecofisio.session',
  rolling: true // Renovar cookie en cada request
};

app.use(session(sessionConfig));

// Middleware de logging simplificado para producción
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    const sessionId = (req.session as any)?.sessionId;
    console.log(`🔐 [${req.method}] ${req.path} - Session: ${sessionId ? 'Presente' : 'Ausente'}`);
  }
  next();
});

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

  // Mostrar estado de configuración de WhatsApp
  console.log(notificationService.getWhatsAppConfigStatus());

  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Create HTTP server
  const server = createServer(app);

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
