import { appointments, type Appointment, type InsertAppointment, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAvailableTimeSlots(date: string, specialty: string): Promise<string[]>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private appointments: Map<number, Appointment>;
  private currentUserId: number;
  private currentAppointmentId: number;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.currentUserId = 1;
    this.currentAppointmentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = {
      id,
      patientName: insertAppointment.patientName,
      email: insertAppointment.email,
      phone: insertAppointment.phone,
      specialty: insertAppointment.specialty,
      reason: insertAppointment.reason,
      reasonDetail: insertAppointment.reasonDetail || null,
      sessions: insertAppointment.sessions || 1,
      date: insertAppointment.date,
      time: insertAppointment.time,
      status: "confirmed",
      kinesiologistName: this.getKinesiologistForSpecialty(insertAppointment.specialty),
      aiRecommendation: null,
      createdAt: new Date(),
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(apt => apt.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  async getAvailableTimeSlots(date: string, specialty: string): Promise<string[]> {
    // Check if the date is a Saturday
    const selectedDate = new Date(date);
    if (selectedDate.getDay() !== 6) {
      return []; // Only Saturdays are available
    }
    
    // Saturday slots from 10:00 to 13:00 (cada hora)
    const saturdaySlots = [
      "10:00", "11:00", "12:00", "13:00"
    ];
    
    const bookedSlots = await this.getAppointmentsByDate(date);
    const bookedTimes = bookedSlots.map(apt => apt.time);
    
    return saturdaySlots.filter(slot => !bookedTimes.includes(slot));
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  private getKinesiologistForSpecialty(specialty: string): string {
    const kinesiologists = {
      "sesiones-kinesiterapia-fisioterapia": "Lic. García López",
      "masaje-descontracturante": "Lic. Martínez Ruiz",
      "masaje-relajacion": "Lic. Fernández Castro"
    };
    return kinesiologists[specialty as keyof typeof kinesiologists] || "Lic. García López";
  }
}

export const storage = new MemStorage();
