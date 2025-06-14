import { apiRequest } from "@/lib/queryClient";
import type { InsertAppointment, Appointment, AIConsultationRequest } from "@shared/schema";

export const appointmentApi = {
  // Get all appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await fetch("/api/appointments", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch appointments");
    return response.json();
  },

  // Create new appointment
  createAppointment: async (appointment: InsertAppointment): Promise<Appointment> => {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    });
    if (!response.ok) throw new Error("Failed to create appointment");
    return response.json();
  },

  // Get available time slots
  getAvailability: async (date: string, specialty: string) => {
    const response = await fetch(
      `/api/appointments/availability?date=${encodeURIComponent(date)}&specialty=${encodeURIComponent(specialty)}`,
      {
        credentials: "include",
      }
    );
    if (!response.ok) throw new Error("Failed to fetch availability");
    return response.json();
  },

  // Get appointment status by token
  getAppointmentStatus: async (token: string): Promise<{ appointment: Appointment }> => {
    const response = await fetch(`/api/appointments/status/${token}`);
    if (!response.ok) throw new Error("Failed to get appointment status");
    return response.json();
  },

  // Cancel appointment by token
  cancelAppointment: async (token: string): Promise<{ message: string; appointment: Appointment }> => {
    const response = await fetch(`/api/appointments/cancel/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to cancel appointment");
    return response.json();
  },

  // Get AI consultation
  getAIConsultation: async (consultation: AIConsultationRequest) => {
    const response = await fetch("/api/ai-consultation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consultation),
    });
    if (!response.ok) throw new Error("Failed to get AI consultation");
    return response.json();
  },
};
