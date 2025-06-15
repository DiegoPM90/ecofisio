import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { registerRoutes } from "./routes";
import { serveStaticFiles } from "./static";
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
    checkPeriod: 86400000
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// Configurar Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configurar Google OAuth
setupGoogleAuth(app);

async function startServer() {
  try {
    // Conectar a MongoDB si está configurado
    if (process.env.MONGODB_URI) {
      try {
        await connectToMongoDB();
      } catch (error) {
        console.error('No se pudo conectar a MongoDB, usando almacenamiento en memoria');
      }
    }

    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    // Servir archivos estáticos en producción
    serveStaticFiles(app);

    // Configurar puerto para producción (Replit asigna el puerto dinámicamente)
    const port = parseInt(process.env.PORT || "3000", 10);
    
    server.listen({
      port,
      host: "0.0.0.0"
    }, () => {
      console.log(`🚀 Servidor corriendo en puerto ${port}`);
      console.log(`📍 URL de callback de Google: https://${process.env.REPLIT_DOMAINS}/api/auth/google/callback`);
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();