import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, aiConsultationSchema, insertUserSchema, loginSchema } from "@shared/schema";
import { getAIConsultationResponse } from "./openai";
import session from "express-session";

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
  // Configurar sesiones
  app.use(session({
    secret: process.env.SESSION_SECRET || 'ecofisio-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Para desarrollo, cambiar a true en producción
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    }
  }));

  // Rutas de autenticación
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }

      const user = await storage.createUser(validatedData);
      
      // No incluir la contraseña en la respuesta
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ message: "Usuario creado exitosamente", user: userWithoutPassword });
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error creando usuario" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.authenticateUser(validatedData.username, validatedData.password);
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      // Guardar usuario en sesión
      req.session.user = { id: user.id, username: user.username, role: user.role };
      
      const { password, ...userWithoutPassword } = user;
      res.json({ message: "Login exitoso", user: userWithoutPassword });
    } catch (error) {
      if (error.name === "ZodError") {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
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

  // Rutas del panel de administración
  app.get("/api/admin/appointments", requireAdmin, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });

  app.delete("/api/admin/appointments/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAppointment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
      
      res.json({ message: "Cita eliminada exitosamente" });
    } catch (error) {
      res.status(500).json({ message: "Error eliminando cita" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      // Obtener todos los usuarios sin contraseñas
      const appointments = await storage.getAppointments();
      const users = Array.from(storage.users?.values() || []).map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
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
