import mongoose from 'mongoose';
import { type Appointment, type InsertAppointment, type User, type Session } from "@shared/schema";

// Esquema de MongoDB para usuarios
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  isActive: { type: Boolean, default: true },
  aiConsultationsUsed: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Esquema de MongoDB para sesiones
const sessionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
}, {
  timestamps: true,
});

// Esquema de MongoDB para las citas
const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  patientName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  specialty: { type: String, required: true },
  reason: { type: String, required: true },
  reasonDetail: { type: String, default: null },
  sessions: { type: Number, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pendiente', 'cancelada', 'completada'], default: 'pendiente' },
  kinesiologistName: { type: String, required: true },
  aiRecommendation: { type: String, default: null },
  cancelToken: { type: String, required: true, unique: true },
  reminderSent: { type: Boolean, default: false },
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
});

// Índices para optimizar búsquedas (sin duplicar el índice de cancelToken)
appointmentSchema.index({ date: 1, specialty: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });

export const UserModel = mongoose.model('User', userSchema);
export const SessionModel = mongoose.model('Session', sessionSchema);
export const AppointmentModel = mongoose.model('Appointment', appointmentSchema);

// Función para conectar a MongoDB
export async function connectToMongoDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está configurado en las variables de entorno');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado exitosamente a MongoDB Atlas');
    
    // Verificar la conexión
    const db = mongoose.connection.db;
    if (db) {
      const stats = await db.stats();
      console.log(`📊 Base de datos: ${db.databaseName} - Tamaño: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    }
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
}

// Función para cerrar la conexión
export async function disconnectFromMongoDB() {
  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB');
}

// Manejar eventos de conexión
mongoose.connection.on('error', (error) => {
  console.error('❌ Error de conexión MongoDB:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB desconectado');
});

process.on('SIGINT', async () => {
  await disconnectFromMongoDB();
  process.exit(0);
});