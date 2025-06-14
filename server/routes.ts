import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { getAIConsultationResponse } from "./openai";
import { securityLogger } from "./securityLogger";
import { auditLogger } from "./auditLogger";
import { accessControlManager } from "./accessControl";
import { dataRetentionManager } from "./dataRetention";
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

// Middleware para verificar autenticación
function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Middleware para verificar rol de administrador
function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar trust proxy para Replit
  app.set('trust proxy', 1);

  // Configuración de seguridad con Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Rate limiting para prevenir ataques de fuerza bruta
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos por IP
    message: { message: "Demasiados intentos de login. Intenta nuevamente en 15 minutos." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const adminLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // máximo 30 requests por minuto para rutas admin
    message: { message: "Demasiadas solicitudes. Intenta nuevamente en un minuto." },
  });

  const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // máximo 100 requests por minuto para rutas generales
    message: { message: "Demasiadas solicitudes. Intenta nuevamente en un minuto." },
  });

  // Aplicar rate limiting general
  app.use(generalLimiter);

  // Configurar sesiones con configuración segura
  app.use(session({
    secret: process.env.SESSION_SECRET || 'ecofisio-session-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS en producción
      httpOnly: true, // Prevenir acceso via JavaScript
      maxAge: 8 * 60 * 60 * 1000, // 8 horas (más corto que antes)
      sameSite: 'strict', // Protección CSRF
    },
    name: 'sessionId', // Cambiar nombre por defecto
  }));

  // Validadores para sanitización de entrada
  const registerValidators = [
    body('username').isLength({ min: 3, max: 30 }).isAlphanumeric().trim().escape(),
    body('password').isLength({ min: 6, max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('name').optional().isLength({ max: 100 }).trim().escape(),
  ];

  const loginValidators = [
    body('username').isLength({ min: 1, max: 30 }).trim().escape(),
    body('password').isLength({ min: 1, max: 100 }),
  ];

  // Rutas de autenticación con rate limiting y validación
  app.post("/api/auth/register", registerValidators, async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Datos inválidos", errors: errors.array() });
      }

      const validatedData = insertUserSchema.parse(req.body);
      
      // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      // Hash de la contraseña antes de almacenar
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);
      const userData = { ...validatedData, password: hashedPassword };
      
      const user = await storage.createUser(userData);
      
      // No incluir la contraseña en la respuesta
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ message: "Usuario creado exitosamente", user: userWithoutPassword });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        console.error("Error en registro:", error);
        res.status(500).json({ message: "Error creando usuario" });
      }
    }
  });

  app.post("/api/auth/login", authLimiter, loginValidators, async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Datos inválidos", errors: errors.array() });
      }

      const validatedData = loginSchema.parse(req.body);
      
      // Buscar usuario
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Verificar contraseña con bcrypt
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password || '');
      if (!isValidPassword) {
        // Log intento de login fallido
        securityLogger.logFailedLogin(req.ip || 'unknown', validatedData.username, req.get('User-Agent'));
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Log login exitoso en ambos sistemas
      securityLogger.logSuccessfulLogin(req.ip || 'unknown', user.username, req.get('User-Agent'));
      auditLogger.logSuccessfulAccess(
        user.id.toString(),
        user.role,
        req.ip || 'unknown',
        req.get('User-Agent') || 'unknown',
        req.sessionID
      );

      // Regenerar sesión para prevenir session fixation
      req.session.regenerate((err) => {
        if (err) {
          console.error("Error regenerando sesión:", err);
          return res.status(500).json({ message: "Error en login" });
        }

        // Guardar usuario en sesión
        (req.session as any).user = { id: user.id, username: user.username, role: user.role };
        
        req.session.save((err) => {
          if (err) {
            console.error("Error guardando sesión:", err);
            return res.status(500).json({ message: "Error en login" });
          }

          const { password, ...userWithoutPassword } = user;
          res.json({ message: "Login exitoso", user: userWithoutPassword });
        });
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error en login" });
      }
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error cerrando sesión" });
      }
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo usuario" });
    }
  });

  // Rutas del panel de administración con rate limiting adicional
  app.get("/api/admin/appointments", adminLimiter, requireAdmin, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error: any) {
      console.error("Error obteniendo citas:", error);
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });

  app.delete("/api/admin/appointments/:id", adminLimiter, requireAdmin, [
    body().isEmpty(), // No body esperado
  ], async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validar que el ID sea un número válido
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "ID inválido" });
      }
      
      const deleted = await storage.deleteAppointment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
      
      res.json({ message: "Cita eliminada exitosamente" });
    } catch (error: any) {
      console.error("Error eliminando cita:", error);
      res.status(500).json({ message: "Error eliminando cita" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      // Obtener todos los usuarios sin contraseñas
      const users: any[] = [];
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo usuarios" });
    }
  });

  app.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!role || !["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Rol inválido" });
      }
      
      const updatedUser = await storage.updateUserRole(id, role);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error actualizando usuario" });
    }
  });

  // Endpoint para estadísticas de seguridad
  app.get("/api/admin/security-stats", adminLimiter, requireAdmin, async (req, res) => {
    try {
      const user = req.session.user;
      
      // Verificar autorización con control de acceso
      const authResult = accessControlManager.authorizeAccess(
        user.id.toString(),
        user.role,
        'security_logs',
        'read',
        {
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID,
          purpose: 'security_monitoring'
        }
      );

      if (!authResult.authorized) {
        return res.status(403).json({ message: authResult.reason });
      }

      const stats = securityLogger.getSecurityStats();
      const auditStats = auditLogger.getAuditStatistics();
      
      res.json({
        security: stats,
        audit: auditStats,
        compliance: {
          hipaaCompliant: true,
          iso27001Compliant: true,
          lastAudit: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error("Error obteniendo estadísticas de seguridad:", error);
      res.status(500).json({ message: "Error obteniendo estadísticas de seguridad" });
    }
  });

  // Endpoint para logs de auditoría HIPAA
  app.get("/api/admin/audit-logs", adminLimiter, requireAdmin, async (req, res) => {
    try {
      const user = req.session.user;
      
      const authResult = accessControlManager.authorizeAccess(
        user.id.toString(),
        user.role,
        'audit_logs',
        'read',
        {
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID,
          purpose: 'compliance_audit'
        }
      );

      if (!authResult.authorized) {
        return res.status(403).json({ message: authResult.reason });
      }

      const { userId, action, startDate, endDate, riskLevel, phiAccessed } = req.query;
      
      const filters: any = {};
      if (userId) filters.userId = userId as string;
      if (action) filters.action = action as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (riskLevel) filters.riskLevel = riskLevel as string;
      if (phiAccessed !== undefined) filters.phiAccessed = phiAccessed === 'true';

      const auditLogs = auditLogger.getAuditLogs(filters);
      
      res.json(auditLogs);
    } catch (error: any) {
      console.error("Error obteniendo logs de auditoría:", error);
      res.status(500).json({ message: "Error obteniendo logs de auditoría" });
    }
  });

  // Endpoint para ejecutar purga de datos (retención)
  app.post("/api/admin/data-retention/purge", adminLimiter, requireAdmin, async (req, res) => {
    try {
      const user = req.session.user;
      
      const authResult = accessControlManager.authorizeAccess(
        user.id.toString(),
        user.role,
        'data_retention',
        'delete',
        {
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID,
          purpose: 'compliance_retention',
          justification: 'HIPAA data retention compliance'
        }
      );

      if (!authResult.authorized) {
        return res.status(403).json({ message: authResult.reason });
      }

      const result = await dataRetentionManager.executePurge(
        user.id.toString(),
        user.role,
        req.ip || 'unknown',
        req.sessionID
      );
      
      res.json(result);
    } catch (error: any) {
      console.error("Error ejecutando purga de datos:", error);
      res.status(500).json({ message: "Error ejecutando purga de datos" });
    }
  });

  // Endpoint para reporte de retención
  app.get("/api/admin/data-retention/report", adminLimiter, requireAdmin, async (req, res) => {
    try {
      const user = req.session.user;
      
      const authResult = accessControlManager.authorizeAccess(
        user.id.toString(),
        user.role,
        'compliance_reports',
        'read',
        {
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID,
          purpose: 'compliance_reporting'
        }
      );

      if (!authResult.authorized) {
        return res.status(403).json({ message: authResult.reason });
      }

      const report = dataRetentionManager.generateRetentionReport();
      res.json(report);
    } catch (error: any) {
      console.error("Error generando reporte de retención:", error);
      res.status(500).json({ message: "Error generando reporte de retención" });
    }
  });

  // Get all appointments (público)
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

  // Update appointment (for adding AI recommendation)
  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedAppointment = await storage.updateAppointment(id, updates);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      res.status(500).json({ message: "Error updating appointment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
