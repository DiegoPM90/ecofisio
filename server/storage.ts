import { appointments, type Appointment, type InsertAppointment, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  // User authentication methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  createGoogleUser(googleId: string, email: string, name: string): Promise<User>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  
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
    
    // Crear usuario administrador por defecto
    const adminUser: User = {
      id: 1,
      username: "admin",
      password: "admin123",
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
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password || null,
      email: insertUser.email || null,
      name: insertUser.name || null,
      googleId: null,
      role: "user",
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const userArray = Array.from(this.users.values());
    for (const user of userArray) {
      if (user.username === username && user.password === password && user.isActive) {
        return user;
      }
    }
    return null;
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
    const selectedDate = new Date(date);
    const weekday = selectedDate.getDay();
    
    let availableSlots: string[] = [];
    
    switch (weekday) {
      case 3: // Wednesday
        availableSlots = ['19:30', '20:30'];
        break;
      case 5: // Friday
        availableSlots = ['18:30', '19:30'];
        break;
      case 6: // Saturday
        availableSlots = ['10:00', '11:00', '12:00', '13:00'];
        break;
      default:
        return []; // No availability on other days
    }
    
    const bookedSlots = await this.getAppointmentsByDate(date);
    const bookedTimes = bookedSlots.map(apt => apt.time);
    
    return availableSlots.filter(slot => !bookedTimes.includes(slot));
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  private getKinesiologistForSpecialty(specialty: string): string {
    const kinesiologists = {
      "sesiones-kinesiterapia-fisioterapia": "Klgo. Diego Pizarro Monroy",
      "masaje-descontracturante": "Klgo. Diego Pizarro Monroy",
      "masaje-relajacion": "Klgo. Diego Pizarro Monroy"
    };
    return kinesiologists[specialty as keyof typeof kinesiologists] || "Klgo. Diego Pizarro Monroy";
  }
}

export const storage = new MemStorage();
