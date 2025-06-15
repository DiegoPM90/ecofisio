import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabla de usuarios
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  hashedPassword: text("hashed_password").notNull(),
  role: text("role").notNull().default("client"), // "client", "admin"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de sesiones
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Nueva relación con usuarios
  patientName: text("patient_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  specialty: text("specialty").notNull(),
  reason: text("reason").notNull(),
  reasonDetail: text("reason_detail"),
  sessions: integer("sessions").notNull().default(1),
  date: text("date").notNull(),
  time: text("time").notNull(),
  status: text("status").notNull().default("confirmed"),
  kinesiologistName: text("kinesiologist_name"),
  aiRecommendation: text("ai_recommendation"),
  cancelToken: text("cancel_token").notNull(),
  reminderSent: boolean("reminder_sent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  patientName: true,
  email: true,
  phone: true,
  specialty: true,
  reason: true,
  reasonDetail: true,
  sessions: true,
  date: true,
  time: true,
}).extend({
  patientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(9, "Teléfono debe tener al menos 9 dígitos"),
  specialty: z.string().min(1, "Debe seleccionar un servicio"),
  reason: z.string().min(1, "Debe especificar un motivo"),
  sessions: z.number().min(1, "Debe seleccionar al menos 1 sesión").max(20, "Máximo 20 sesiones"),
  date: z.string().min(1, "Debe seleccionar una fecha"),
  time: z.string().min(1, "Debe seleccionar una hora"),
});

export const aiConsultationSchema = z.object({
  reason: z.string().min(1),
  reasonDetail: z.string().optional(),
  specialty: z.string().optional(),
});

// Esquemas de autenticación
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  hashedPassword: true,
  role: true,
}).extend({
  email: z.string().email("Email inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  hashedPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["client", "admin"]).default("client"),
});

export const registerUserSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  name: z.string().min(1, "El nombre es requerido").min(2, "El nombre debe tener al menos 2 caracteres"),
  password: z.string().min(1, "La contraseña es requerida").min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmar contraseña es requerido"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type AIConsultationRequest = z.infer<typeof aiConsultationSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type Session = typeof sessions.$inferSelect;


