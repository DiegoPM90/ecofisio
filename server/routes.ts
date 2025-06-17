import type { Express } from "express";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { insertAppointmentSchema, aiConsultationSchema, requestPasswordResetSchema, resetPasswordSchema } from "@shared/schema";
import { getAIConsultationResponse } from "./openai";
import { notificationService } from "./notifications";
import bcrypt from "bcryptjs";
import * as cron from 'node-cron';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  getUserAppointments,
  requireAuth
} from "./auth";

// Rate limiters críticos para seguridad
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  message: { error: "Demasiados intentos de autenticación. Intenta en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 solicitudes por IP por hora
  message: { error: "Demasiadas solicitudes de recuperación. Intenta en 1 hora." },
  standardHeaders: true,
  legacyHeaders: false,
});

const appointmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 citas por IP por hora
  message: { error: "Demasiadas citas solicitadas. Intenta en 1 hora." },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 consultas IA por IP por hora
  message: { error: "Límite de consultas IA alcanzado. Intenta en 1 hora." },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<void> {
  
  // === RUTAS DE AUTENTICACIÓN ===
  
  // Registro de usuario con rate limiting
  app.post("/api/auth/register", authLimiter, registerUser);
  
  // Inicio de sesión con rate limiting
  app.post("/api/auth/login", authLimiter, loginUser);
  
  // Cerrar sesión
  app.post("/api/auth/logout", logoutUser);
  
  // Obtener usuario actual
  app.get("/api/auth/me", requireAuth, getCurrentUser);
  
  // Obtener citas del usuario actual
  app.get("/api/user/appointments", requireAuth, getUserAppointments);

  // Solicitar recuperación de contraseña con rate limiting
  app.post("/api/auth/request-password-reset", passwordResetLimiter, async (req, res) => {
    try {
      const { email } = requestPasswordResetSchema.parse(req.body);
      
      // Buscar usuario por email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Por seguridad, no revelar si el email existe o no
        return res.json({ message: "Si el email existe, recibirás instrucciones para recuperar tu contraseña." });
      }

      // Crear token de recuperación
      const resetToken = await storage.createPasswordResetToken(user.id);
      
      // Enviar email con enlace de recuperación
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken.token}`;
      const emailContent = `
        <h2>Recuperación de Contraseña - ECOFISIO</h2>
        <p>Hola ${user.name},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><a href="${resetUrl}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        <br>
        <p>Equipo ECOFISIO</p>
      `;
      
      await notificationService.sendEmail(
        email,
        "Recuperación de Contraseña - ECOFISIO",
        emailContent
      );

      res.json({ message: "Si el email existe, recibirás instrucciones para recuperar tu contraseña." });
    } catch (error) {
      console.error("Error en solicitud de reset:", error);
      res.status(400).json({ message: "Datos inválidos" });
    }
  });

  // Restablecer contraseña con token y rate limiting
  app.post("/api/auth/reset-password", passwordResetLimiter, async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      // Validar token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ message: "Token inválido o expirado" });
      }

      // Obtener usuario
      const user = await storage.getUserById(resetToken.userId);
      if (!user) {
        return res.status(400).json({ message: "Usuario no encontrado" });
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Actualizar contraseña del usuario
      await storage.updateUser(user.id, { hashedPassword });

      // Marcar token como usado
      await storage.markTokenAsUsed(token);

      // Eliminar todas las sesiones del usuario
      await storage.deleteUserSessions(user.id);

      res.json({ message: "Contraseña restablecida exitosamente" });
    } catch (error) {
      console.error("Error al restablecer contraseña:", error);
      res.status(400).json({ message: "Error al procesar la solicitud" });
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

  // Crear nueva cita con validación exhaustiva y rate limiting
  app.post("/api/appointments", appointmentLimiter, async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Validación 1: Verificar que la fecha sea un sábado
      const appointmentDate = new Date(validatedData.date);
      const dayOfWeek = appointmentDate.getDay();
      if (dayOfWeek !== 6) {
        return res.status(400).json({ 
          message: "Solo se pueden agendar citas los sábados",
          error: "INVALID_DAY"
        });
      }
      
      // Validación 2: Verificar que la hora esté dentro del rango permitido
      const allowedTimes = ['10:00', '11:00', '12:00', '13:00'];
      if (!allowedTimes.includes(validatedData.time)) {
        return res.status(400).json({ 
          message: "Hora no válida. Solo disponible de 10:00 a 13:00",
          error: "INVALID_TIME"
        });
      }
      
      // Validación 3: Verificar que la fecha no sea en el pasado
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      appointmentDate.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        return res.status(400).json({ 
          message: "No se pueden agendar citas en fechas pasadas",
          error: "PAST_DATE"
        });
      }
      
      // Validación 4: Verificar duplicados por horario
      const existingAppointments = await storage.getAppointmentsByDate(validatedData.date);
      const isSlotTaken = existingAppointments.some(apt => 
        apt.time === validatedData.time && 
        apt.status !== 'cancelada'
      );
      
      if (isSlotTaken) {
        console.warn(`⚠️ INTENTO DE DUPLICACIÓN - Horario ocupado: ${validatedData.date} ${validatedData.time} por ${validatedData.email}`);
        return res.status(409).json({ 
          message: "Este horario ya está ocupado",
          error: "SLOT_TAKEN"
        });
      }
      
      // Validación 5: Verificar duplicados por email en la misma fecha
      const duplicateByEmail = existingAppointments.some(apt => 
        apt.email.toLowerCase() === validatedData.email.toLowerCase() && 
        apt.status !== 'cancelada'
      );
      
      if (duplicateByEmail) {
        console.warn(`⚠️ INTENTO DE DUPLICACIÓN - Email duplicado: ${validatedData.email} para fecha ${validatedData.date}`);
        return res.status(409).json({ 
          message: "Ya tienes una cita agendada para esta fecha",
          error: "DUPLICATE_EMAIL"
        });
      }
      
      // Validación 6: Verificar que no exceda el límite de citas por día (máximo 4)
      if (existingAppointments.filter(apt => apt.status !== 'cancelada').length >= 4) {
        console.warn(`⚠️ LÍMITE EXCEDIDO - Fecha completa: ${validatedData.date} (${existingAppointments.length} citas)`);
        return res.status(409).json({ 
          message: "No hay más horarios disponibles para esta fecha",
          error: "DATE_FULL"
        });
      }
      
      // Crear la cita si pasa todas las validaciones
      console.log(`🔄 CREANDO CITA: ${validatedData.date} ${validatedData.time} - ${validatedData.email} - ${validatedData.specialty}`);
      const appointment = await storage.createAppointment(validatedData);
      
      // Enviar notificaciones inmediatamente después de crear la cita
      try {
        await notificationService.sendAppointmentConfirmation(appointment);
      } catch (notificationError) {
        console.error("Error enviando notificaciones:", notificationError);
        // No fallar la creación de la cita si falla la notificación
      }
      
      res.status(201).json(appointment);
    } catch (error: any) {
      console.error("❌ ERROR GENERAL CREANDO CITA:", error);
      
      // Manejo específico de errores de duplicación desde storage
      if (error.message === 'SLOT_TAKEN') {
        return res.status(409).json({ 
          message: "Este horario ya está ocupado",
          error: "SLOT_TAKEN"
        });
      } else if (error.message === 'DUPLICATE_EMAIL') {
        return res.status(409).json({ 
          message: "Ya tienes una cita agendada para esta fecha",
          error: "DUPLICATE_EMAIL"
        });
      } else if (error.message === 'DUPLICATE_ENTRY') {
        return res.status(409).json({ 
          message: "Esta cita ya existe en el sistema",
          error: "DUPLICATE_ENTRY"
        });
      } else if (error?.name === 'ZodError') {
        res.status(400).json({ message: "Datos de cita inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
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

  // === RUTAS DE PRUEBAS ===
  
  // Endpoint de prueba para WhatsApp (solo para testing)
  app.post("/api/test/whatsapp", async (req, res) => {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber || !message) {
        return res.status(400).json({ 
          error: "Se requieren phoneNumber y message" 
        });
      }

      const result = await notificationService.sendWhatsAppNotification(phoneNumber, message);
      
      if (result) {
        res.json({ 
          success: true, 
          message: "Mensaje de WhatsApp enviado exitosamente",
          configured: notificationService.isWhatsAppConfigured()
        });
      } else {
        res.status(500).json({ 
          error: "Error enviando mensaje de WhatsApp",
          configured: notificationService.isWhatsAppConfigured()
        });
      }
    } catch (error) {
      console.error("Error en endpoint de prueba WhatsApp:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  // Endpoint de prueba para Email
  app.post("/api/test/email", async (req, res) => {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
      return res.status(400).json({ 
        error: "Se requieren to, subject y message" 
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ECOFISIO - Prueba de Email</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Prueba del sistema de notificaciones</h2>
          <p>${message}</p>
          <p><em>Este es un email de prueba del sistema ECOFISIO</em></p>
        </div>
      </div>
    `;

    const result = await notificationService.sendEmail(to, subject, html);
    
    res.json({ 
      success: true, 
      message: "Sistema de notificaciones configurado correctamente",
      emailConfigured: !!process.env.EMAIL_USER,
      status: result ? "enviado" : "simulado_en_logs"
    });
  });

  // Endpoint de diagnóstico para Gmail - REMOVIDO POR SEGURIDAD

  // === RUTAS DE IA ===
  
  // Endpoint de diagnóstico - REMOVIDO POR SEGURIDAD
  
  // Consulta de IA con rate limiting y autenticación
  app.post("/api/ai-consultation", aiLimiter, requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }

      // Verificar límite de consultas de IA
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (user.aiConsultationsUsed >= 1) {
        return res.status(429).json({ 
          message: "Límite de consultas de IA alcanzado",
          details: "Has utilizado tu consulta gratuita disponible. Para más consultas, contacta con soporte."
        });
      }

      const validatedData = aiConsultationSchema.parse(req.body);
      const recommendation = await getAIConsultationResponse(validatedData);
      
      // Incrementar contador de consultas de IA
      await storage.updateUser(userId, {
        aiConsultationsUsed: user.aiConsultationsUsed + 1
      });

      res.json({
        ...recommendation,
        consultationsRemaining: 1 - (user.aiConsultationsUsed + 1)
      });
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
}