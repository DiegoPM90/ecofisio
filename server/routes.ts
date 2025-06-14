import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, aiConsultationSchema } from "@shared/schema";
import { getAIConsultationResponse } from "./openai";
import { notificationService } from "./notifications";
import * as cron from 'node-cron';

export async function registerRoutes(app: Express): Promise<Server> {
  
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
  
  // Consulta de IA
  app.post("/api/ai-consultation", async (req, res) => {
    try {
      const validatedData = aiConsultationSchema.parse(req.body);
      const recommendation = await getAIConsultationResponse(validatedData);
      res.json(recommendation);
    } catch (error) {
      console.error("Error en consulta de IA:", error);
      res.status(500).json({ message: "Error procesando consulta de IA" });
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