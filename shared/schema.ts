import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
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

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type AIConsultationRequest = z.infer<typeof aiConsultationSchema>;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"),
  email: text("email"),
  googleId: text("google_id"),
  name: text("name"),
  role: text("role").notNull().default("user"), // user, admin
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
}).extend({
  username: z.string().min(3, "Usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "Contraseña debe tener al menos 6 caracteres"),
  email: z.string().email("Email inválido").optional(),
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;


