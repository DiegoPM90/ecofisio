import { appointments, type Appointment, type InsertAppointment, type User, type InsertUser } from "@shared/schema";
import bcrypt from "bcryptjs";
import { hipaaCompliance } from "./hipaaCompliance";
import { auditLogger } from "./auditLogger";

export interface IStorage {
  // User authentication methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  createGoogleUser(googleId: string, email: string, name: string): Promise<User>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAvailableTimeSlots(date: string, specialty: string): Promise<string[]>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
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
    
    // Crear usuario administrador por defecto con contraseña hasheada
    const hashedPassword = bcrypt.hashSync("admin123", 12);
    const adminUser: User = {
      id: 1,
      username: "admin",
      password: hashedPassword,
      email: "admin@ecofisio.com",
      googleId: null,
      name: "Administrador",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(1, adminUser);
    this.currentUserId = 2;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const userArray = Array.from(this.users.values());
    for (const user of userArray) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    const id = this.currentUserId++;
    const user: User = { 
      id,
      username: insertUser.username,
      password: hashedPassword,
      email: insertUser.email || null,
      googleId: null,
      name: insertUser.name || null,
      role: "user",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password || '');
    return isValid ? user : null;
  }

  async createGoogleUser(googleId: string, email: string, name: string): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      username: email,
      password: null,
      email,
      googleId,
      name,
      role: "user",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const userArray = Array.from(this.users.values());
    for (const user of userArray) {
      if (user.googleId === googleId) {
        return user;
      }
    }
    return undefined;
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, role };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
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