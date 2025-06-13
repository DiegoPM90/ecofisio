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
    const response = await apiRequest("POST", "/api/appointments", appointment);
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

  // Get AI consultation
  getAIConsultation: async (consultation: AIConsultationRequest) => {
    const response = await apiRequest("POST", "/api/ai-consultation", consultation);
    return response.json();
  },
};
