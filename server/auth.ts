import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { registerUserSchema, loginSchema } from '@shared/schema';
import { z } from 'zod';

// Middleware para verificar autenticación
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = (req.session as any)?.sessionId;
    
    if (!sessionId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const session = await storage.getSession(sessionId);
    if (!session) {
      req.session!.destroy((err) => {}); // Limpiar sesión inválida
      return res.status(401).json({ error: 'Sesión inválida' });
    }

    const user = await storage.getUserById(session.userId);
    if (!user || !user.isActive) {
      await storage.deleteSession(sessionId);
      req.session!.destroy((err) => {});
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    // Adjuntar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Middleware para verificar rol de administrador
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
}

// Función para registrar usuario
export async function registerUser(req: Request, res: Response) {
  try {
    console.log('=== DATOS RECIBIDOS EN BACKEND ===');
    console.log('req.body:', req.body);
    console.log('typeof req.body:', typeof req.body);
    console.log('Object.keys(req.body):', Object.keys(req.body || {}));
    
    const validatedData = registerUserSchema.parse(req.body);

    // Verificar si el usuario ya existe
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Crear usuario
    const user = await storage.createUser({
      email: validatedData.email,
      name: validatedData.name,
      hashedPassword,
      role: 'client',
    });

    // Crear sesión
    const session = await storage.createSession(user.id);
    (req.session as any).sessionId = session.id;

    // Devolver usuario sin la contraseña
    const { hashedPassword: _, ...userWithoutPassword } = user;
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      user: userWithoutPassword 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: error.errors 
      });
    }
    
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función para iniciar sesión
export async function loginUser(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Buscar usuario
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const passwordValid = await bcrypt.compare(validatedData.password, user.hashedPassword);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Crear nueva sesión
    const session = await storage.createSession(user.id);
    (req.session as any).sessionId = session.id;

    // Devolver usuario sin la contraseña
    const { hashedPassword: _, ...userWithoutPassword } = user;
    res.json({ 
      message: 'Inicio de sesión exitoso',
      user: userWithoutPassword 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: error.errors 
      });
    }
    
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función para cerrar sesión
export async function logoutUser(req: Request, res: Response) {
  try {
    const sessionId = (req.session as any)?.sessionId;
    
    if (sessionId) {
      await storage.deleteSession(sessionId);
    }
    
    req.session!.destroy((err) => {
      if (err) {
        console.error('Error al destruir sesión:', err);
      }
    });
    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función para obtener el usuario actual
export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const { hashedPassword: _, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función para obtener todos los usuarios (solo admin)
export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await storage.getUsers();
    const usersWithoutPasswords = users.map(user => {
      const { hashedPassword: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función para actualizar usuario (solo admin)
export async function updateUserById(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.id);
    const updates = req.body;

    // No permitir actualizar contraseña a través de esta ruta
    if (updates.hashedPassword || updates.password) {
      return res.status(400).json({ error: 'No se puede actualizar la contraseña a través de esta ruta' });
    }

    const updatedUser = await storage.updateUser(userId, updates);
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const { hashedPassword: _, ...userWithoutPassword } = updatedUser;
    res.json({ 
      message: 'Usuario actualizado exitosamente',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Función para obtener citas del usuario actual
export async function getUserAppointments(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const appointments = await storage.getUserAppointments(req.user.id);
    res.json({ appointments });
  } catch (error) {
    console.error('Error al obtener citas del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// Extensión de tipos para Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        role: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        hashedPassword: string;
      };
    }
    
    interface Session {
      sessionId?: string;
    }
  }
}