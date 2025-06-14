import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { getAIConsultationResponse } from "./openai";
import {
  insertAppointmentSchema,
  insertUserSchema,
  loginSchema,
  aiConsultationSchema,
  type InsertAppointment,
  type InsertUser,
  type LoginCredentials,
  type User,
  type AIConsultationRequest,
  type Appointment,
} from "@shared/schema";

// Interface para extender Request con session
interface RequestWithSession extends Request {
  session: any;
}

// Middleware para verificar autenticación
function requireAuth(req: RequestWithSession, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Middleware para verificar rol de administrador
function requireAdmin(req: RequestWithSession, res: Response, next: NextFunction) {
  if (!req.session?.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar trust proxy para Replit
  app.set('trust proxy', 1);

  // Configuración básica de sesiones (sin store por ahora)
  app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Para desarrollo
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  }));

  // === RUTAS DE AUTENTICACIÓN ===
  
  // Registro de usuario
  app.post("/api/auth/register", async (req: RequestWithSession, res: Response) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Datos inválidos",
          errors: validation.error.errors 
        });
      }

      const { username, password, email, name } = validation.data;
      
      // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "El usuario ya existe" });
      }

      // Crear usuario
      const user = await storage.createUser({ username, password, email, name });
      
      // Crear sesión
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      };

      res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token: "session-based"
      });
    } catch (error) {
      console.error("Error en registro:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Login de usuario
  app.post("/api/auth/login", async (req: RequestWithSession, res: Response) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Datos inválidos",
          errors: validation.error.errors 
        });
      }

      const { username, password } = validation.data;
      
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Crear sesión
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name
      };

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token: "session-based"
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: RequestWithSession, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Error al cerrar sesión" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  // Obtener usuario actual
  app.get("/api/auth/me", requireAuth, async (req: RequestWithSession, res: Response) => {
    try {
      const user = await storage.getUser(req.session.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // === RUTAS DE CITAS ===
  
  // Crear cita
  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      const validation = insertAppointmentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Datos inválidos",
          errors: validation.error.errors 
        });
      }

      const appointment = await storage.createAppointment(validation.data);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creando cita:", error);
      res.status(500).json({ message: "Error al crear la cita" });
    }
  });

  // Obtener todas las citas (requiere autenticación)
  app.get("/api/appointments", requireAuth, async (req: Request, res: Response) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error obteniendo citas:", error);
      res.status(500).json({ message: "Error al obtener las citas" });
    }
  });

  // Obtener horarios disponibles
  app.get("/api/appointments/available-slots", async (req: Request, res: Response) => {
    try {
      const { date, specialty } = req.query;
      if (!date || !specialty) {
        return res.status(400).json({ message: "Fecha y especialidad son requeridos" });
      }

      const availableSlots = await storage.getAvailableTimeSlots(
        date as string, 
        specialty as string
      );
      res.json(availableSlots);
    } catch (error) {
      console.error("Error obteniendo horarios:", error);
      res.status(500).json({ message: "Error al obtener horarios disponibles" });
    }
  });

  // Actualizar cita (solo admin)
  app.put("/api/appointments/:id", requireAdmin, async (req: RequestWithSession, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedAppointment = await storage.updateAppointment(id, updates);
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error actualizando cita:", error);
      res.status(500).json({ message: "Error al actualizar la cita" });
    }
  });

  // Eliminar cita (solo admin)
  app.delete("/api/appointments/:id", requireAdmin, async (req: RequestWithSession, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAppointment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
      
      res.json({ message: "Cita eliminada exitosamente" });
    } catch (error) {
      console.error("Error eliminando cita:", error);
      res.status(500).json({ message: "Error al eliminar la cita" });
    }
  });

  // === RUTAS ADMIN ===
  
  // Obtener todos los usuarios (solo admin)
  app.get("/api/admin/users", requireAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      res.status(500).json({ message: "Error al obtener usuarios" });
    }
  });

  // Actualizar rol de usuario (solo admin)
  app.put("/api/admin/users/:id/role", requireAdmin, async (req: RequestWithSession, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Rol inválido" });
      }
      
      const updatedUser = await storage.updateUserRole(id, role);
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      });
    } catch (error) {
      console.error("Error actualizando rol:", error);
      res.status(500).json({ message: "Error al actualizar rol" });
    }
  });

  // === RUTA AI ===
  
  // Consulta AI
  app.post("/api/ai-consultation", async (req: Request, res: Response) => {
    try {
      const validation = aiConsultationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Datos inválidos",
          errors: validation.error.errors 
        });
      }

      const response = await getAIConsultationResponse(validation.data);
      res.json(response);
    } catch (error) {
      console.error("Error en consulta AI:", error);
      res.status(500).json({ message: "Error en consulta AI" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}