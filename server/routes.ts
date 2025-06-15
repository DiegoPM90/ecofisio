import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, aiConsultationSchema } from "@shared/schema";
import { getAIConsultationResponse } from "./openai";
import { notificationService } from "./notifications";
import * as cron from 'node-cron';
import passport from "passport";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  getUserAppointments,
  requireAuth
} from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // === RUTAS DE AUTENTICACIÓN ===
  
  // Registro de usuario
  app.post("/api/auth/register", registerUser);
  
  // Inicio de sesión
  app.post("/api/auth/login", loginUser);
  
  // Cerrar sesión
  app.post("/api/auth/logout", logoutUser);
  
  // Obtener usuario actual
  app.get("/api/auth/me", requireAuth, getCurrentUser);
  
  // Obtener citas del usuario actual
  app.get("/api/auth/my-appointments", requireAuth, getUserAppointments);

  // === RUTAS DE GOOGLE OAUTH ===
  
  // Iniciar autenticación con Google
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  // Callback de Google OAuth con logging completo
  app.get("/api/auth/google/callback", (req, res, next) => {
    console.log("=== CALLBACK GOOGLE OAUTH INICIADO ===");
    console.log("Query params:", req.query);
    console.log("Session antes de auth:", req.session ? "Existe" : "No existe");
    
    passport.authenticate("google", (err: any, user: any, info: any) => {
      console.log("=== RESULTADO PASSPORT AUTHENTICATE ===");
      console.log("Error:", err ? err.message : "Ninguno");
      console.log("Usuario:", user ? { id: user.id, email: user.email } : "No user");
      console.log("Info:", info);
      
      if (err) {
        console.error("❌ Error en passport authenticate:", err);
        // Manejar errores específicos de Google OAuth
        const errorType = err.code === 'invalid_grant' ? 'invalid_code' : 'passport_error';
        return res.redirect("/auth?error=" + errorType + "&msg=" + encodeURIComponent(err.message || 'unknown'));
      }

      if (!user) {
        console.error("❌ No se obtuvo usuario de passport");
        return res.redirect("/auth?error=no_user_from_passport");
      }

      // Login manual con passport
      req.logIn(user, async (loginErr: any) => {
        if (loginErr) {
          console.error("❌ Error en req.logIn:", loginErr);
          return res.redirect("/auth?error=login_error&msg=" + encodeURIComponent(loginErr.message || 'unknown'));
        }

        try {
          console.log("✅ Usuario logueado con passport, creando sesión personalizada...");
          
          // Crear sesión en nuestra base de datos
          const session = await storage.createSession(user.id);
          (req.session as any).sessionId = session.id;
          
          console.log("✅ Sesión creada:", session.id);
          
          // Guardar la sesión antes de redirigir
          req.session.save((saveErr) => {
            if (saveErr) {
              console.error("❌ Error guardando sesión:", saveErr);
              return res.redirect("/auth?error=session_save_error");
            }
            
            console.log("🎉 Google OAuth COMPLETADO exitosamente para:", user.email);
            console.log("=== FIN CALLBACK GOOGLE OAUTH ===");
            res.redirect("/?login=google_success");
          });

        } catch (error: any) {
          console.error("❌ Error en creación de sesión:", error);
          res.redirect("/auth?error=session_creation_error&msg=" + encodeURIComponent(error.message || 'unknown'));
        }
      });
    })(req, res, next);
  });

  // Ruta para manejar errores de Google OAuth
  app.get("/api/auth/google/error", (req, res) => {
    console.log("❌ Error en autenticación Google:", req.query);
    res.redirect("/auth?error=google_oauth_error");
  });

  // Ruta de prueba robusta para validar MongoDB OAuth
  app.post("/api/test-robust-oauth", async (req, res) => {
    try {
      console.log("=== PRUEBA ROBUSTA OAUTH MONGODB ===");
      console.log("Datos de entrada:", req.body);
      
      // Crear usuario directamente en MongoDB sin validaciones problemáticas
      const { UserModel } = await import('./mongodb');
      const db = UserModel.db;
      const usersCollection = db.collection('users');
      
      const userData = {
        email: req.body.email || "test.robust@gmail.com",
        name: req.body.name || "Test Robust User",
        googleId: req.body.googleId || "robust123456",
        role: "client",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("Insertando directamente en colección users:", userData);
      
      const result = await usersCollection.insertOne(userData);
      const insertedUser = await usersCollection.findOne({ _id: result.insertedId });
      
      console.log("✅ Usuario OAuth creado exitosamente:", result.insertedId);
      
      res.json({
        success: true,
        message: "Usuario OAuth creado sin validaciones problemáticas",
        userId: result.insertedId.toString(),
        data: insertedUser
      });
      
    } catch (error: any) {
      console.log("❌ ERROR en prueba robusta:", error.message);
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Error en creación robusta de usuario OAuth"
      });
    }
  });






  
  // === RUTAS DE CITAS ===
  
  // Obtener todas las citas
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error obteniendo citas:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Crear nueva cita
  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      
      // Enviar notificaciones inmediatamente después de crear la cita
      try {
        await notificationService.sendAppointmentConfirmation(appointment);
      } catch (notificationError) {
        console.error("Error enviando notificaciones:", notificationError);
        // No fallar la creación de la cita si falla la notificación
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creando cita:", error);
      res.status(400).json({ message: "Datos de cita inválidos" });
    }
  });

  // Obtener citas por fecha
  app.get("/api/appointments/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const appointments = await storage.getAppointmentsByDate(date);
      res.json(appointments);
    } catch (error) {
      console.error("Error obteniendo citas por fecha:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Obtener horarios disponibles
  app.get("/api/appointments/available-slots/:date/:specialty", async (req, res) => {
    try {
      const { date, specialty } = req.params;
      const slots = await storage.getAvailableTimeSlots(date, specialty);
      res.json(slots);
    } catch (error) {
      console.error("Error obteniendo horarios disponibles:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Consultar estado de cita por token
  app.get("/api/appointments/status/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const appointment = await storage.getAppointmentByToken(token);
      
      if (!appointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      res.json({
        appointment: {
          id: appointment.id,
          patientName: appointment.patientName,
          date: appointment.date,
          time: appointment.time,
          specialty: appointment.specialty,
          sessions: appointment.sessions,
          status: appointment.status,
          kinesiologistName: appointment.kinesiologistName,
          createdAt: appointment.createdAt
        }
      });
    } catch (error) {
      console.error("Error consultando estado de cita:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // Cancelar cita por token
  app.post("/api/appointments/cancel/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const appointment = await storage.getAppointmentByToken(token);
      
      if (!appointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }

      if (appointment.status === 'cancelada') {
        return res.status(400).json({ message: "La cita ya está cancelada" });
      }

      const updatedAppointment = await storage.updateAppointment(appointment.id, { 
        status: 'cancelada' 
      });

      if (updatedAppointment) {
        try {
          await notificationService.sendCancellationNotification(updatedAppointment);
        } catch (notificationError) {
          console.error("Error enviando notificación de cancelación:", notificationError);
        }
      }

      res.json({ message: "Cita cancelada exitosamente", appointment: updatedAppointment });
    } catch (error) {
      console.error("Error cancelando cita:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // === RUTAS DE ADMINISTRACIÓN ===
  
  // Endpoint de administración - Ver todas las citas con estadísticas
  app.get("/api/admin/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      const stats = {
        total: appointments.length,
        confirmadas: appointments.filter(a => a.status === 'pendiente').length,
        canceladas: appointments.filter(a => a.status === 'cancelada').length,
        completadas: appointments.filter(a => a.status === 'completada').length,
      };
      
      res.json({
        stats,
        appointments: appointments.map(appointment => ({
          id: appointment.id,
          paciente: appointment.patientName,
          email: appointment.email,
          telefono: appointment.phone,
          fecha: appointment.date,
          hora: appointment.time,
          especialidad: appointment.specialty,
          estado: appointment.status,
          kinesiologo: appointment.kinesiologistName,
          sesiones: appointment.sessions,
          motivo: appointment.reason,
          tokenCancelacion: appointment.cancelToken,
          recordatorioEnviado: appointment.reminderSent,
          fechaCreacion: appointment.createdAt
        }))
      });
    } catch (error) {
      console.error("Error obteniendo datos de administración:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });

  // === RUTAS DE IA ===
  
  // Endpoint de diagnóstico para variables de entorno
  app.get("/api/env-check", (req, res) => {
    const envCheck = {
      nodeEnv: process.env.NODE_ENV,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      openAIKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      availableEnvVars: Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('API')),
      timestamp: new Date().toISOString()
    };
    res.json(envCheck);
  });
  
  // Consulta de IA
  app.post("/api/ai-consultation", async (req, res) => {
    try {
      const validatedData = aiConsultationSchema.parse(req.body);
      const recommendation = await getAIConsultationResponse(validatedData);
      res.json(recommendation);
    } catch (error) {
      console.error("Error en consulta de IA:", error);
      res.status(500).json({ 
        message: "Error procesando consulta de IA",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });

  // === SISTEMA DE RECORDATORIOS AUTOMATIZADOS ===
  
  // Configurar cron job para enviar recordatorios diarios a las 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Ejecutando tarea de recordatorios automáticos...');
    try {
      const appointmentsForReminder = await storage.getAppointmentsForReminder();
      
      for (const appointment of appointmentsForReminder) {
        try {
          await notificationService.sendAppointmentReminder(appointment);
          // Marcar como recordatorio enviado
          await storage.updateAppointment(appointment.id, { reminderSent: true });
        } catch (reminderError) {
          console.error(`Error enviando recordatorio para cita ${appointment.id}:`, reminderError);
        }
      }
      
      console.log(`Recordatorios enviados para ${appointmentsForReminder.length} citas.`);
    } catch (error) {
      console.error('Error en el sistema de recordatorios:', error);
    }
  });

  console.log('Sistema de recordatorios automáticos configurado correctamente');

  const httpServer = createServer(app);
  return httpServer;
}