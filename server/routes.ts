import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, aiConsultationSchema } from "@shared/schema";
import { getAIConsultationResponse } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all appointments
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
