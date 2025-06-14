import { appointments, type Appointment, type InsertAppointment } from "@shared/schema";

export interface IStorage {
  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAvailableTimeSlots(date: string, specialty: string): Promise<string[]>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private appointments: Map<number, Appointment>;
  private currentAppointmentId: number;

  constructor() {
    this.appointments = new Map();
    this.currentAppointmentId = 1;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = {
      id,
      patientName: insertAppointment.patientName,
      email: insertAppointment.email,
      phone: insertAppointment.phone,
      date: insertAppointment.date,
      time: insertAppointment.time,
      specialty: insertAppointment.specialty,
      kinesiologistName: this.getKinesiologistForSpecialty(insertAppointment.specialty),
      sessions: insertAppointment.sessions || 1,
      reason: insertAppointment.reason,
      reasonDetail: insertAppointment.reasonDetail || null,
      status: "confirmed",
      aiRecommendation: null,
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const appointmentsArray = Array.from(this.appointments.values());
    return appointmentsArray.filter(appointment => appointment.date === date);
  }

  async getAvailableTimeSlots(date: string, specialty: string): Promise<string[]> {
    const allSlots = [
      "09:00", "10:00", "11:00", "12:00",
      "14:00", "15:00", "16:00", "17:00", "18:00"
    ];
    
    const bookedAppointments = await this.getAppointmentsByDate(date);
    const bookedSlots = bookedAppointments
      .filter(apt => apt.specialty === specialty)
      .map(apt => apt.time);
    
    return allSlots.filter(slot => !bookedSlots.includes(slot));
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (appointment) {
      const updatedAppointment = { ...appointment, ...updates };
      this.appointments.set(id, updatedAppointment);
      return updatedAppointment;
    }
    return undefined;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  private getKinesiologistForSpecialty(specialty: string): string {
    const kinesiologists: Record<string, string> = {
      "Fisioterapia General": "Dr. María González",
      "Rehabilitación Deportiva": "Dr. Carlos Rodríguez",
      "Terapia Manual": "Dr. Ana Martínez",
      "Fisioterapia Pediátrica": "Dr. Luis Fernández",
      "Fisioterapia Neurológica": "Dr. Carmen López"
    };
    return kinesiologists[specialty as keyof typeof kinesiologists] || "Dr. Staff Ecofisio";
  }
}

export const storage = new MemStorage();