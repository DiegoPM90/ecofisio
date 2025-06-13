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
  date: text("date").notNull(),
  time: text("time").notNull(),
  status: text("status").notNull().default("confirmed"),
  doctorName: text("doctor_name"),
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
  date: true,
  time: true,
}).extend({
  patientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(9, "Teléfono debe tener al menos 9 dígitos"),
  specialty: z.string().min(1, "Debe seleccionar una especialidad"),
  reason: z.string().min(1, "Debe especificar un motivo"),
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
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
