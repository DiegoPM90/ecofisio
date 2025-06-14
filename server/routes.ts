import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, aiConsultationSchema, insertUserSchema, loginSchema } from "@shared/schema";
import { getAIConsultationResponse } from "./openai";
import { authenticateToken, requireRole, generateToken, auditLog, AuthRequest } from "./auth";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar medidas de seguridad
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Rate limiting para autenticación
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos por IP
    message: { message: "Demasiados intentos de login. Intenta nuevamente en 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Rate limiting general
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Demasiadas solicitudes desde esta IP." },
  });

  app.use('/api', generalLimiter);

  // === RUTAS DE AUTENTICACIÓN ===
  
  // Login
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(validatedData.username, validatedData.password);
      
      if (!user) {
        auditLog("LOGIN_FAILED", 0, { username: validatedData.username, ip: req.ip });
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      const token = generateToken(user);
      auditLog("LOGIN_SUCCESS", user.id, { ip: req.ip });
      
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Datos de login inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error en el login" });
      }
    }
  });

  // Registro de usuario
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({ message: "El usuario ya existe" });
      }

      const user = await storage.createUser(validatedData);
      auditLog("USER_REGISTERED", user.id, { ip: req.ip });
      
      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Datos de registro inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error en el registro" });
      }
    }
  });

  // Verificar token y obtener datos de usuario
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    const user = req.user!;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role
    });
  });

  // === RUTAS PÚBLICAS ===

  // Get all appointments (público para vista principal)
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });

  // Create new appointment
  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creating appointment" });
      }
    }
  });

  // Get available time slots for a date and specialty
  app.get("/api/appointments/availability", async (req, res) => {
    try {
      const { date, specialty } = req.query;
      
      if (!date || !specialty) {
        return res.status(400).json({ message: "Date and specialty are required" });
      }

      const availableSlots = await storage.getAvailableTimeSlots(
        date as string, 
        specialty as string
      );
      res.json({ availableSlots });
    } catch (error) {
      res.status(500).json({ message: "Error fetching availability" });
    }
  });

  // Get AI consultation response
  app.post("/api/ai-consultation", async (req, res) => {
    try {
      const validatedData = aiConsultationSchema.parse(req.body);
      const aiResponse = await getAIConsultationResponse(validatedData);
      res.json(aiResponse);
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Invalid consultation data", errors: error.errors });
      } else {
        console.error("AI consultation error:", error);
        res.status(500).json({ message: "Error generating AI consultation" });
      }
    }
  });

  // === RUTAS ADMINISTRATIVAS ===

  // Obtener todas las citas (solo admin)
  app.get("/api/admin/appointments", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const appointments = await storage.getAppointments();
      auditLog("APPOINTMENTS_VIEWED", req.user!.id);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: "Error obteniendo citas" });
    }
  });

  // Actualizar cita (solo admin)
  app.patch("/api/admin/appointments/:id", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedAppointment = await storage.updateAppointment(id, updates);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
      
      auditLog("APPOINTMENT_UPDATED", req.user!.id, { appointmentId: id, updates });
      res.json(updatedAppointment);
    } catch (error: any) {
      res.status(500).json({ message: "Error actualizando cita" });
    }
  });

  // Eliminar cita (solo admin)
  app.delete("/api/admin/appointments/:id", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAppointment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
      
      auditLog("APPOINTMENT_DELETED", req.user!.id, { appointmentId: id });
      res.json({ message: "Cita eliminada exitosamente" });
    } catch (error: any) {
      res.status(500).json({ message: "Error eliminando cita" });
    }
  });

  // Actualizar rol de usuario (solo admin)
  app.patch("/api/admin/users/:id/role", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Rol inválido" });
      }
      
      const updatedUser = await storage.updateUserRole(id, role);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      auditLog("USER_ROLE_UPDATED", req.user!.id, { userId: id, newRole: role });
      res.json({
        message: "Rol actualizado exitosamente",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error actualizando rol" });
    }
  });

  // Update appointment (for adding AI recommendation) - mantenemos compatible
  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedAppointment = await storage.updateAppointment(id, updates);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updatedAppointment);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating appointment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
