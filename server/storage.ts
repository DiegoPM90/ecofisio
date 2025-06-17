import { type Appointment, type InsertAppointment, type User, type InsertUser, type Session, type PasswordResetToken } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { AppointmentModel, UserModel, SessionModel, PasswordResetTokenModel } from './mongodb';
import bcrypt from 'bcryptjs';

export interface IStorage {
  // Appointment methods
  createAppointment(appointment: InsertAppointment, userId?: number): Promise<Appointment>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAvailableTimeSlots(date: string, specialty: string): Promise<string[]>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  getAppointmentByToken(token: string): Promise<Appointment | undefined>;
  getAppointmentsForReminder(): Promise<Appointment[]>;
  getUserAppointments(userId: number): Promise<Appointment[]>;
  
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Session methods
  createSession(userId: number): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
  deleteUserSessions(userId: number): Promise<void>;
  
  // Password reset methods
  createPasswordResetToken(userId: number): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenAsUsed(token: string): Promise<boolean>;
  cleanupExpiredTokens(): Promise<void>;
}

// Clase de almacenamiento en memoria (para desarrollo sin base de datos)
export class MemStorage implements IStorage {
  private appointments: Map<number, Appointment>;
  private users: Map<number, User>;
  private sessions: Map<string, Session>;
  private passwordResetTokens: Map<string, PasswordResetToken>;
  private currentAppointmentId: number;
  private currentUserId: number;

  constructor() {
    this.appointments = new Map();
    this.users = new Map();
    this.sessions = new Map();
    this.passwordResetTokens = new Map();
    this.currentAppointmentId = 1;
    this.currentUserId = 1;
  }

  async createAppointment(insertAppointment: InsertAppointment, userId?: number): Promise<Appointment> {
    const appointment: Appointment = {
      id: this.currentAppointmentId++,
      userId: userId || null,
      patientName: insertAppointment.patientName,
      email: insertAppointment.email,
      phone: insertAppointment.phone || "",
      specialty: insertAppointment.specialty,
      reason: insertAppointment.reason,
      reasonDetail: insertAppointment.reasonDetail || null,
      sessions: insertAppointment.sessions,
      date: insertAppointment.date,
      time: insertAppointment.time,
      status: 'pendiente',
      kinesiologistName: this.getKinesiologistForSpecialty(insertAppointment.specialty),
      aiRecommendation: null,
      cancelToken: uuidv4(),
      reminderSent: false,
      createdAt: new Date(),
    };

    this.appointments.set(appointment.id, appointment);
    return appointment;
  }

  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  async getAvailableTimeSlots(date: string, specialty: string): Promise<string[]> {
    // Check if the date is a Saturday (only day available for appointments)
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();
    
    // If not Saturday (6), return empty array
    if (dayOfWeek !== 6) {
      return [];
    }

    // Saturday slots only
    const allSlots = ['10:00', '11:00', '12:00', '13:00'];

    // Buscar todas las citas activas (no canceladas) para la fecha, sin filtrar por specialty
    const bookedSlots = Array.from(this.appointments.values())
      .filter(appointment => 
        appointment.date === date && 
        appointment.status !== 'cancelada'
      )
      .map(appointment => appointment.time);

    return allSlots.filter(slot => !bookedSlots.includes(slot));
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

  async getAppointmentByToken(token: string): Promise<Appointment | undefined> {
    return Array.from(this.appointments.values()).find(appointment => appointment.cancelToken === token);
  }

  async getAppointmentsForReminder(): Promise<Appointment[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    return Array.from(this.appointments.values()).filter(appointment => 
      appointment.date === tomorrowString && 
      appointment.status === 'pendiente' && 
      !appointment.reminderSent
    );
  }

  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(apt => apt.userId === userId);
  }

  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.currentUserId++,
      email: user.email,
      name: user.name,
      hashedPassword: user.hashedPassword,
      role: user.role || 'client',
      isActive: true,
      aiConsultationsUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Session methods
  async createSession(userId: number): Promise<Session> {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días de expiración

    const session: Session = {
      id: sessionId,
      userId,
      expiresAt,
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    
    // Verificar si la sesión expiró
    if (session.expiresAt < new Date()) {
      this.sessions.delete(sessionId);
      return undefined;
    }

    return session;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  async deleteUserSessions(userId: number): Promise<void> {
    const sessionsToDelete: string[] = [];
    this.sessions.forEach((session, sessionId) => {
      if (session.userId === userId) {
        sessionsToDelete.push(sessionId);
      }
    });
    
    sessionsToDelete.forEach(sessionId => {
      this.sessions.delete(sessionId);
    });
  }

  // Password reset methods
  async createPasswordResetToken(userId: number): Promise<PasswordResetToken> {
    const token: PasswordResetToken = {
      id: Date.now(),
      token: uuidv4(),
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
      used: false,
      createdAt: new Date(),
    };
    
    this.passwordResetTokens.set(token.token, token);
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const resetToken = this.passwordResetTokens.get(token);
    if (!resetToken) return undefined;
    
    // Verificar si el token expiró
    if (resetToken.expiresAt < new Date() || resetToken.used) {
      this.passwordResetTokens.delete(token);
      return undefined;
    }

    return resetToken;
  }

  async markTokenAsUsed(token: string): Promise<boolean> {
    const resetToken = this.passwordResetTokens.get(token);
    if (!resetToken) return false;
    
    resetToken.used = true;
    this.passwordResetTokens.set(token, resetToken);
    return true;
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    const tokensToDelete: string[] = [];
    
    this.passwordResetTokens.forEach((token, tokenKey) => {
      if (token.expiresAt < now || token.used) {
        tokensToDelete.push(tokenKey);
      }
    });
    
    tokensToDelete.forEach(tokenKey => {
      this.passwordResetTokens.delete(tokenKey);
    });
  }

  private getKinesiologistForSpecialty(specialty: string): string {
    return 'Diego Pizarro Monroy';
  }
}

// Clase de almacenamiento MongoDB (para producción)
export class MongoStorage implements IStorage {
  async createAppointment(insertAppointment: InsertAppointment, userId?: number): Promise<Appointment> {
    try {
      const appointmentDoc = new AppointmentModel({
        ...insertAppointment,
        phone: insertAppointment.phone || "",
        userId: userId || null,
        status: 'pendiente',
        kinesiologistName: this.getKinesiologistForSpecialty(insertAppointment.specialty),
        aiRecommendation: null,
        cancelToken: uuidv4(),
        reminderSent: false,
        reasonDetail: insertAppointment.reasonDetail || null,
      });

      const savedDoc = await appointmentDoc.save();
      console.log(`✅ CITA CREADA EXITOSAMENTE: ${insertAppointment.date} ${insertAppointment.time} - ${insertAppointment.email}`);
      return this.transformDocToAppointment(savedDoc);
    } catch (error: any) {
      // Manejar errores de duplicación a nivel de MongoDB
      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyValue)[0];
        console.error(`❌ ERROR DE DUPLICACIÓN EN MONGODB: Campo ${duplicateField} - ${JSON.stringify(error.keyValue)}`);
        
        if (error.keyValue.time) {
          throw new Error('SLOT_TAKEN');
        } else if (error.keyValue.email) {
          throw new Error('DUPLICATE_EMAIL');
        } else {
          throw new Error('DUPLICATE_ENTRY');
        }
      }
      console.error('❌ ERROR CREANDO CITA EN MONGODB:', error);
      throw error;
    }
  }

  async getAppointments(): Promise<Appointment[]> {
    const docs = await AppointmentModel.find({}).sort({ createdAt: -1 });
    return docs.map(doc => this.transformDocToAppointment(doc));
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const docs = await AppointmentModel.find({ date }).sort({ time: 1 });
    return docs.map(doc => this.transformDocToAppointment(doc));
  }

  async getAvailableTimeSlots(date: string, specialty: string): Promise<string[]> {
    // Check if the date is a Saturday (only day available for appointments)
    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();
    
    // If not Saturday (6), return empty array
    if (dayOfWeek !== 6) {
      return [];
    }

    // Saturday slots only
    const allSlots = ['10:00', '11:00', '12:00', '13:00'];

    // Buscar todas las citas activas (no canceladas) para la fecha
    const bookedAppointments = await AppointmentModel.find({
      date,
      status: { $ne: 'cancelada' }
    }, 'time');

    const bookedSlots = bookedAppointments.map(apt => apt.time);
    return allSlots.filter(slot => !bookedSlots.includes(slot));
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const doc = await AppointmentModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? this.transformDocToAppointment(doc) : undefined;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await AppointmentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAppointmentByToken(token: string): Promise<Appointment | undefined> {
    const doc = await AppointmentModel.findOne({ cancelToken: token });
    return doc ? this.transformDocToAppointment(doc) : undefined;
  }

  async getAppointmentsForReminder(): Promise<Appointment[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    const docs = await AppointmentModel.find({
      date: tomorrowString,
      status: 'pendiente',
      reminderSent: false
    });

    return docs.map(doc => this.transformDocToAppointment(doc));
  }

  // User methods
  async createUser(user: InsertUser): Promise<User> {
    const userDoc = new UserModel({
      email: user.email,
      name: user.name,
      hashedPassword: user.hashedPassword,
      role: user.role || 'client',
      isActive: true,
    });

    const savedDoc = await userDoc.save();
    return this.transformDocToUser(savedDoc);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const doc = await UserModel.findOne({ email });
    return doc ? this.transformDocToUser(doc) : undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const doc = await UserModel.findById(id);
    return doc ? this.transformDocToUser(doc) : undefined;
  }

  async getUsers(): Promise<User[]> {
    const docs = await UserModel.find({}).sort({ createdAt: -1 });
    return docs.map(doc => this.transformDocToUser(doc));
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const doc = await UserModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? this.transformDocToUser(doc) : undefined;
  }

  // Session methods
  async createSession(userId: number): Promise<Session> {
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días de expiración

    const sessionDoc = new SessionModel({
      _id: sessionId,
      userId,
      expiresAt,
    });

    const savedDoc = await sessionDoc.save();
    return this.transformDocToSession(savedDoc);
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const doc = await SessionModel.findById(sessionId);
    if (!doc) return undefined;
    
    // Verificar si la sesión expiró
    if (doc.expiresAt < new Date()) {
      await SessionModel.findByIdAndDelete(sessionId);
      return undefined;
    }

    return this.transformDocToSession(doc);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await SessionModel.findByIdAndDelete(sessionId);
    return !!result;
  }

  async deleteUserSessions(userId: number): Promise<void> {
    await SessionModel.deleteMany({ userId });
  }

  // Password reset methods
  async createPasswordResetToken(userId: number): Promise<PasswordResetToken> {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    const tokenDoc = new PasswordResetTokenModel({
      token,
      userId,
      expiresAt,
      used: false,
    });

    const savedDoc = await tokenDoc.save();
    return this.transformDocToPasswordResetToken(savedDoc);
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const doc = await PasswordResetTokenModel.findOne({ 
      token, 
      used: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!doc) return undefined;
    return this.transformDocToPasswordResetToken(doc);
  }

  async markTokenAsUsed(token: string): Promise<boolean> {
    const result = await PasswordResetTokenModel.findOneAndUpdate(
      { token },
      { used: true },
      { new: true }
    );
    return !!result;
  }

  async cleanupExpiredTokens(): Promise<void> {
    await PasswordResetTokenModel.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { used: true }
      ]
    });
  }

  private transformDocToAppointment(doc: any): Appointment {
    return {
      id: doc._id.toString(),
      userId: doc.userId || null,
      patientName: doc.patientName,
      email: doc.email,
      phone: doc.phone,
      specialty: doc.specialty,
      reason: doc.reason,
      reasonDetail: doc.reasonDetail,
      sessions: doc.sessions,
      date: doc.date,
      time: doc.time,
      status: doc.status,
      kinesiologistName: doc.kinesiologistName,
      aiRecommendation: doc.aiRecommendation,
      cancelToken: doc.cancelToken,
      reminderSent: doc.reminderSent,
      createdAt: doc.createdAt || new Date(),
    };
  }

  private transformDocToUser(doc: any): User {
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      hashedPassword: doc.hashedPassword,
      role: doc.role,
      isActive: doc.isActive,
      aiConsultationsUsed: doc.aiConsultationsUsed || 0,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    };
  }

  private transformDocToSession(doc: any): Session {
    return {
      id: doc._id,
      userId: doc.userId.toString(),
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt || new Date(),
    };
  }

  private transformDocToPasswordResetToken(doc: any): PasswordResetToken {
    return {
      id: parseInt(doc._id.toString()),
      token: doc.token,
      userId: parseInt(doc.userId),
      expiresAt: doc.expiresAt,
      used: doc.used,
      createdAt: doc.createdAt || new Date(),
    };
  }

  async getUserAppointments(userId: number): Promise<Appointment[]> {
    const userIdString = userId.toString();
    const docs = await AppointmentModel.find({ userId: userIdString }).sort({ createdAt: -1 });
    return docs.map(doc => this.transformDocToAppointment(doc));
  }

  private getKinesiologistForSpecialty(specialty: string): string {
    return 'Diego Pizarro Monroy';
  }
}

// Seleccionar el tipo de almacenamiento basado en la variable de entorno
export const storage = process.env.MONGODB_URI ? new MongoStorage() : new MemStorage();