import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

// Helper function to get session from cookies
function getSessionFromCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const sessionMatch = cookieHeader.match(/session=([^;]+)/);
  return sessionMatch ? sessionMatch[1] : null;
}

// Helper function to verify session
async function verifySession(sessionToken) {
  if (!sessionToken) return null;
  
  const client = await connectToDatabase();
  const db = client.db();
  
  const session = await db.collection('sessions').findOne({ 
    sessionId: sessionToken,
    expiresAt: { $gt: new Date() }
  });
  
  if (!session) return null;
  
  const user = await db.collection('users').findOne({ _id: session.userId });
  return user ? { user, session } : null;
}

export const handler = async (event, context) => {
  const { httpMethod, path, body, headers, queryStringParameters } = event;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const apiPath = path.replace('/.netlify/functions/api', '');
    console.log(`${httpMethod} ${apiPath}`);
    
    // Health check
    if (apiPath === '/api/health') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          status: 'OK', 
          message: 'ECOFISIO API funcionando en Netlify',
          timestamp: new Date().toISOString()
        }),
      };
    }

    // AUTH ENDPOINTS
    
    // Register
    if (apiPath === '/api/auth/register' && httpMethod === 'POST') {
      const client = await connectToDatabase();
      const db = client.db();
      
      const userData = JSON.parse(body || '{}');
      const { name, email, password, confirmPassword } = userData;
      
      if (!name || !email || !password || !confirmPassword) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Todos los campos son requeridos' }),
        };
      }
      
      if (password !== confirmPassword) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Las contraseñas no coinciden' }),
        };
      }
      
      const existingUser = await db.collection('users').findOne({ email });
      if (existingUser) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'El email ya está registrado' }),
        };
      }
      
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const newUser = {
        name,
        email,
        hashedPassword,
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('users').insertOne(newUser);
      
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Usuario registrado exitosamente',
          user: {
            id: result.insertedId,
            name,
            email,
            role: 'user'
          }
        }),
      };
    }

    // Login
    if (apiPath === '/api/auth/login' && httpMethod === 'POST') {
      const client = await connectToDatabase();
      const db = client.db();
      
      const loginData = JSON.parse(body || '{}');
      const { email, password } = loginData;
      
      const user = await db.collection('users').findOne({ email });
      if (!user || !await bcrypt.compare(password, user.hashedPassword)) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Credenciales inválidas' }),
        };
      }
      
      // Delete existing sessions for this user
      await db.collection('sessions').deleteMany({ userId: user._id });
      
      const sessionToken = 'session_' + Date.now() + '_' + Math.random().toString(36);
      
      await db.collection('sessions').insertOne({
        sessionId: sessionToken,
        userId: user._id,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      });
      
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Set-Cookie': `session=${sessionToken}; HttpOnly; SameSite=Lax; Max-Age=1800; Path=/`
        },
        body: JSON.stringify({
          message: 'Login exitoso',
          success: true,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          sessionToken: sessionToken
        }),
      };
    }

    // Get current user
    if (apiPath === '/api/auth/me' && httpMethod === 'GET') {
      const sessionToken = getSessionFromCookies(headers.cookie);
      const sessionData = await verifySession(sessionToken);
      
      if (!sessionData) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'No autenticado' }),
        };
      }
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          user: {
            id: sessionData.user._id,
            name: sessionData.user.name,
            email: sessionData.user.email,
            role: sessionData.user.role,
            isActive: sessionData.user.isActive || true,
            createdAt: sessionData.user.createdAt,
            updatedAt: sessionData.user.updatedAt
          }
        }),
      };
    }

    // Logout
    if (apiPath === '/api/auth/logout' && httpMethod === 'POST') {
      const sessionToken = getSessionFromCookies(headers.cookie);
      
      if (sessionToken) {
        const client = await connectToDatabase();
        const db = client.db();
        await db.collection('sessions').deleteOne({ sessionId: sessionToken });
      }
      
      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Set-Cookie': `session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`
        },
        body: JSON.stringify({ message: 'Logout exitoso', success: true }),
      };
    }

    // Update user profile
    if (apiPath === '/api/auth/profile' && httpMethod === 'PUT') {
      const sessionToken = getSessionFromCookies(headers.cookie);
      const sessionData = await verifySession(sessionToken);
      
      if (!sessionData) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'No autenticado' }),
        };
      }
      
      const client = await connectToDatabase();
      const db = client.db();
      
      const updateData = JSON.parse(body || '{}');
      const allowedFields = ['name', 'email'];
      const filteredUpdate = {};
      
      for (const field of allowedFields) {
        if (updateData[field]) {
          filteredUpdate[field] = updateData[field];
        }
      }
      
      if (Object.keys(filteredUpdate).length === 0) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'No hay campos válidos para actualizar' }),
        };
      }
      
      filteredUpdate.updatedAt = new Date();
      
      const updatedUser = await db.collection('users').findOneAndUpdate(
        { _id: sessionData.user._id },
        { $set: filteredUpdate },
        { returnDocument: 'after' }
      );
      
      if (!updatedUser.value) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Usuario no encontrado' }),
        };
      }
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Perfil actualizado exitosamente',
          user: {
            id: updatedUser.value._id,
            name: updatedUser.value.name,
            email: updatedUser.value.email,
            role: updatedUser.value.role,
            isActive: updatedUser.value.isActive,
            createdAt: updatedUser.value.createdAt,
            updatedAt: updatedUser.value.updatedAt
          }
        }),
      };
    }

    // APPOINTMENT ENDPOINTS
    
    // Get user appointments
    if (apiPath === '/api/appointments' && httpMethod === 'GET') {
      const sessionToken = getSessionFromCookies(headers.cookie);
      const sessionData = await verifySession(sessionToken);
      
      if (!sessionData) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'No autenticado' }),
        };
      }
      
      const client = await connectToDatabase();
      const db = client.db();
      
      const appointments = await db.collection('appointments').find({ 
        userId: sessionData.user._id 
      }).sort({ createdAt: -1 }).toArray();
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(appointments.map(apt => ({
          id: apt._id,
          patientName: apt.patientName,
          email: apt.email,
          phone: apt.phone,
          specialty: apt.specialty,
          reason: apt.reason,
          reasonDetail: apt.reasonDetail,
          selectedDate: apt.selectedDate,
          selectedTime: apt.selectedTime,
          status: apt.status,
          token: apt.token,
          createdAt: apt.createdAt,
          updatedAt: apt.updatedAt
        }))),
      };
    }

    // Create appointment
    if (apiPath === '/api/appointments' && httpMethod === 'POST') {
      const client = await connectToDatabase();
      const db = client.db();
      
      const appointmentData = JSON.parse(body || '{}');
      const token = 'apt_' + Date.now() + '_' + Math.random().toString(36);
      
      // Check for authenticated user
      const sessionToken = getSessionFromCookies(headers.cookie);
      const sessionData = await verifySession(sessionToken);
      const userId = sessionData ? sessionData.user._id : null;
      
      // Validate required fields
      const required = ['patientName', 'email', 'phone', 'specialty', 'selectedDate', 'selectedTime'];
      for (const field of required) {
        if (!appointmentData[field]) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: `Campo requerido: ${field}` }),
          };
        }
      }
      
      const appointment = {
        ...appointmentData,
        userId,
        token,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await db.collection('appointments').insertOne(appointment);
      
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Cita registrada exitosamente. Te contactaremos para confirmar.',
          appointment: {
            id: result.insertedId,
            token,
            status: 'pending',
            ...appointmentData
          }
        }),
      };
    }

    // Get available time slots
    if (apiPath === '/api/appointments/available-slots' && httpMethod === 'GET') {
      const { date, specialty } = queryStringParameters || {};
      
      const client = await connectToDatabase();
      const db = client.db();
      
      const existingAppointments = await db.collection('appointments').find({
        selectedDate: date,
        specialty: specialty,
        status: { $ne: 'cancelled' }
      }).toArray();
      
      const allSlots = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
      const bookedTimes = existingAppointments.map(apt => apt.selectedTime);
      const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          date,
          specialty,
          availableSlots
        }),
      };
    }

    // Get availability (alias)
    if (apiPath === '/api/appointments/availability' && httpMethod === 'GET') {
      const { date, specialty } = queryStringParameters || {};
      
      const client = await connectToDatabase();
      const db = client.db();
      
      const existingAppointments = await db.collection('appointments').find({
        selectedDate: date,
        specialty: specialty,
        status: { $ne: 'cancelled' }
      }).toArray();
      
      const allSlots = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
      const bookedTimes = existingAppointments.map(apt => apt.selectedTime);
      const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          availableSlots,
          bookedSlots: bookedTimes
        }),
      };
    }

    // Get appointment status by token
    if (apiPath.startsWith('/api/appointments/status/') && httpMethod === 'GET') {
      const token = apiPath.split('/').pop();
      
      const client = await connectToDatabase();
      const db = client.db();
      
      const appointment = await db.collection('appointments').findOne({ token });
      
      if (!appointment) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Cita no encontrada' }),
        };
      }
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          appointment: {
            id: appointment._id,
            patientName: appointment.patientName,
            email: appointment.email,
            phone: appointment.phone,
            specialty: appointment.specialty,
            reason: appointment.reason,
            selectedDate: appointment.selectedDate,
            selectedTime: appointment.selectedTime,
            status: appointment.status,
            token: appointment.token,
            createdAt: appointment.createdAt
          }
        }),
      };
    }

    // Cancel appointment by token
    if (apiPath.startsWith('/api/appointments/cancel/') && httpMethod === 'POST') {
      const token = apiPath.split('/').pop();
      
      const client = await connectToDatabase();
      const db = client.db();
      
      const appointment = await db.collection('appointments').findOne({ token });
      
      if (!appointment) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Cita no encontrada' }),
        };
      }
      
      if (appointment.status === 'cancelled') {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'La cita ya está cancelada' }),
        };
      }
      
      const updatedAppointment = await db.collection('appointments').findOneAndUpdate(
        { token },
        { 
          $set: { 
            status: 'cancelled', 
            updatedAt: new Date(),
            cancelledAt: new Date()
          } 
        },
        { returnDocument: 'after' }
      );
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Cita cancelada exitosamente',
          appointment: {
            id: updatedAppointment.value._id,
            status: updatedAppointment.value.status,
            token: updatedAppointment.value.token
          }
        }),
      };
    }

    // Update appointment status (admin)
    if (apiPath.startsWith('/api/appointments/') && apiPath.endsWith('/status') && httpMethod === 'PUT') {
      const appointmentId = apiPath.split('/')[3];
      const { status } = JSON.parse(body || '{}');
      
      // Verify admin session
      const sessionToken = getSessionFromCookies(headers.cookie);
      const sessionData = await verifySession(sessionToken);
      
      if (!sessionData || sessionData.user.role !== 'admin') {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Acceso denegado' }),
        };
      }
      
      const client = await connectToDatabase();
      const db = client.db();
      
      const updatedAppointment = await db.collection('appointments').findOneAndUpdate(
        { _id: appointmentId },
        { 
          $set: { 
            status, 
            updatedAt: new Date()
          } 
        },
        { returnDocument: 'after' }
      );
      
      if (!updatedAppointment.value) {
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Cita no encontrada' }),
        };
      }
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'Estado de cita actualizado',
          appointment: updatedAppointment.value
        }),
      };
    }

    // AI CONSULTATION ENDPOINT
    if (apiPath === '/api/ai/consultation' && httpMethod === 'POST') {
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Consulta IA temporalmente no disponible',
          message: 'Reserve su cita para consulta personalizada'
        }),
      };
    }

    // NOTIFICATION ENDPOINTS
    if (apiPath === '/api/notifications/send' && httpMethod === 'POST') {
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({
          error: 'Notificaciones temporalmente no disponibles',
          message: 'El servicio será habilitado próximamente'
        }),
      };
    }

    // Default 404
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Endpoint no encontrado',
        path: apiPath,
        method: httpMethod
      }),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        message: 'Intente nuevamente en unos minutos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};