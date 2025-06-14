import { type Appointment, type InsertAppointment } from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { AppointmentModel } from './mongodb';

export interface IStorage {
  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAvailableTimeSlots(date: string, specialty: string): Promise<string[]>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  getAppointmentByToken(token: string): Promise<Appointment | undefined>;
  getAppointmentsForReminder(): Promise<Appointment[]>;
}

// Clase de almacenamiento en memoria (para desarrollo sin base de datos)
export class MemStorage implements IStorage {
  private appointments: Map<number, Appointment>;
  private currentAppointmentId: number;

  constructor() {
    this.appointments = new Map();
    this.currentAppointmentId = 1;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const appointment: Appointment = {
      id: this.currentAppointmentId++,
      patientName: insertAppointment.patientName,
      email: insertAppointment.email,
      phone: insertAppointment.phone,
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
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    const bookedSlots = Array.from(this.appointments.values())
      .filter(appointment => 
        appointment.date === date && 
        appointment.specialty === specialty &&
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

  private getKinesiologistForSpecialty(specialty: string): string {
    return 'Diego Pizarro Monroy';
  }
}

// Clase de almacenamiento MongoDB (para producción)
export class MongoStorage implements IStorage {
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const appointmentDoc = new AppointmentModel({
      ...insertAppointment,
      status: 'pendiente',
      kinesiologistName: this.getKinesiologistForSpecialty(insertAppointment.specialty),
      aiRecommendation: null,
      cancelToken: uuidv4(),
      reminderSent: false,
      reasonDetail: insertAppointment.reasonDetail || null,
    });

    const savedDoc = await appointmentDoc.save();
    return this.transformDocToAppointment(savedDoc);
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
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    const bookedAppointments = await AppointmentModel.find({
      date,
      specialty,
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

  private getKinesiologistForSpecialty(specialty: string): string {
    return 'Diego Pizarro Monroy';
  }

  private transformDocToAppointment(doc: any): Appointment {
    return {
      id: doc._id.toString(),
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
}

// Seleccionar el tipo de almacenamiento basado en la variable de entorno
export const storage = process.env.MONGODB_URI ? new MongoStorage() : new MemStorage();