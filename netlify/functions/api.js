import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const client = new MongoClient(process.env.MONGODB_URI);

export const handler = async (event, context) => {
  const { httpMethod, path, body, headers, queryStringParameters } = event;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const apiPath = path.replace('/.netlify/functions/api', '');
    
    // Health check
    if (apiPath === '/api/health') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ status: 'OK', message: 'ECOFISIO API funcionando en Netlify' }),
      };
    }

    // Registro de usuario
    if (apiPath === '/api/auth/register' && httpMethod === 'POST') {
      try {
        await client.connect();
        const db = client.db();
        
        const userData = JSON.parse(body || '{}');
        const { name, email, password } = userData;
        
        // Validar datos básicos
        if (!name || !email || !password) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Todos los campos son requeridos' }),
          };
        }
        
        // Verificar si el usuario ya existe
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'El email ya está registrado' }),
          };
        }
        
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 15);
        
        // Crear usuario
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
        
      } catch (error) {
        console.error('Register error:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Error al registrar usuario' }),
        };
      } finally {
        await client.close();
      }
    }

    // Login de usuario
    if (apiPath === '/api/auth/login' && httpMethod === 'POST') {
      try {
        await client.connect();
        const db = client.db();
        
        const loginData = JSON.parse(body || '{}');
        const { email, password } = loginData;
        
        // Buscar usuario
        const user = await db.collection('users').findOne({ email });
        if (!user) {
          return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Credenciales inválidas' }),
          };
        }
        
        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.hashedPassword);
        if (!validPassword) {
          return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Credenciales inválidas' }),
          };
        }
        
        // Crear sesión simple
        const sessionToken = 'session_' + Date.now() + '_' + Math.random().toString(36);
        
        await db.collection('sessions').insertOne({
          sessionId: sessionToken,
          userId: user._id,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutos
        });
        
        return {
          statusCode: 200,
          headers: {
            ...corsHeaders,
            'Set-Cookie': `session=${sessionToken}; HttpOnly; SameSite=Lax; Max-Age=300; Path=/`
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
        
      } catch (error) {
        console.error('Login error:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Error al iniciar sesión' }),
        };
      } finally {
        await client.close();
      }
    }

    // Verificar usuario actual
    if (apiPath === '/api/auth/me' && httpMethod === 'GET') {
      try {
        const cookieHeader = headers.cookie || '';
        const sessionMatch = cookieHeader.match(/session=([^;]+)/);
        const sessionToken = sessionMatch ? sessionMatch[1] : null;
        
        if (!sessionToken) {
          return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'No autenticado' }),
          };
        }
        
        await client.connect();
        const db = client.db();
        
        // Buscar sesión
        const session = await db.collection('sessions').findOne({ 
          sessionId: sessionToken,
          expiresAt: { $gt: new Date() }
        });
        
        if (!session) {
          return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Sesión expirada' }),
          };
        }
        
        // Buscar usuario
        const user = await db.collection('users').findOne({ _id: session.userId });
        if (!user) {
          return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Usuario no encontrado' }),
          };
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role
            }
          }),
        };
        
      } catch (error) {
        console.error('Auth check error:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Error al verificar autenticación' }),
        };
      } finally {
        await client.close();
      }
    }

    // Logout de usuario
    if (apiPath === '/api/auth/logout' && httpMethod === 'POST') {
      try {
        const cookieHeader = headers.cookie || '';
        const sessionMatch = cookieHeader.match(/session=([^;]+)/);
        const sessionToken = sessionMatch ? sessionMatch[1] : null;
        
        if (sessionToken) {
          await client.connect();
          const db = client.db();
          await db.collection('sessions').deleteOne({ sessionId: sessionToken });
        }
        
        return {
          statusCode: 200,
          headers: {
            ...corsHeaders,
            'Set-Cookie': `session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/`
          },
          body: JSON.stringify({ message: 'Logout exitoso' }),
        };
        
      } catch (error) {
        console.error('Logout error:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Error al cerrar sesión' }),
        };
      } finally {
        await client.close();
      }
    }

    // Horarios disponibles
    if (apiPath === '/api/appointments/available-slots' && httpMethod === 'GET') {
      try {
        const { date, specialty } = queryStringParameters || {};
        
        await client.connect();
        const db = client.db();
        
        // Obtener citas existentes para la fecha
        const existingAppointments = await db.collection('appointments').find({
          selectedDate: date,
          specialty: specialty,
          status: { $ne: 'cancelled' }
        }).toArray();
        
        // Horarios base para sábados
        const allSlots = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
        
        // Filtrar horarios ocupados
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
        
      } catch (error) {
        console.error('Available slots error:', error);
        // En caso de error, devolver horarios base
        const availableSlots = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            date: queryStringParameters?.date,
            specialty: queryStringParameters?.specialty,
            availableSlots
          }),
        };
      } finally {
        await client.close();
      }
    }

    // Endpoint para availability (alias de available-slots)
    if (apiPath === '/api/appointments/availability' && httpMethod === 'GET') {
      try {
        const { date, specialty } = queryStringParameters || {};
        
        await client.connect();
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
        
      } catch (error) {
        console.error('Availability error:', error);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            availableSlots: ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
            bookedSlots: []
          }),
        };
      } finally {
        await client.close();
      }
    }

    // Obtener citas del usuario
    if (apiPath === '/api/appointments' && httpMethod === 'GET') {
      try {
        const cookieHeader = headers.cookie || '';
        const sessionMatch = cookieHeader.match(/session=([^;]+)/);
        const sessionToken = sessionMatch ? sessionMatch[1] : null;
        
        if (!sessionToken) {
          return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'No autenticado' }),
          };
        }
        
        await client.connect();
        const db = client.db();
        
        // Verificar sesión
        const session = await db.collection('sessions').findOne({ 
          sessionId: sessionToken,
          expiresAt: { $gt: new Date() }
        });
        
        if (!session) {
          return {
            statusCode: 401,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Sesión expirada' }),
          };
        }
        
        // Obtener citas del usuario
        const appointments = await db.collection('appointments').find({ 
          userId: session.userId 
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
        
      } catch (error) {
        console.error('Get appointments error:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Error al cargar las citas' }),
        };
      } finally {
        await client.close();
      }
    }

    // Crear cita
    if (apiPath === '/api/appointments' && httpMethod === 'POST') {
      try {
        await client.connect();
        const db = client.db();
        
        const appointmentData = JSON.parse(body || '{}');
        const token = 'apt_' + Date.now() + '_' + Math.random().toString(36);
        
        // Verificar si hay usuario autenticado
        const cookieHeader = headers.cookie || '';
        const sessionMatch = cookieHeader.match(/session=([^;]+)/);
        const sessionToken = sessionMatch ? sessionMatch[1] : null;
        let userId = null;
        
        if (sessionToken) {
          const session = await db.collection('sessions').findOne({ 
            sessionId: sessionToken,
            expiresAt: { $gt: new Date() }
          });
          if (session) {
            userId = session.userId;
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
        
      } catch (error) {
        console.error('Appointment error:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Error al crear cita' }),
        };
      } finally {
        await client.close();
      }
    }

    // Obtener estado de cita por token
    if (apiPath.startsWith('/api/appointments/status/') && httpMethod === 'GET') {
      try {
        const token = apiPath.split('/').pop();
        
        await client.connect();
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
        
      } catch (error) {
        console.error('Get appointment status error:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Error al obtener estado de la cita' }),
        };
      } finally {
        await client.close();
      }
    }

    // Default para rutas no encontradas
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Endpoint no encontrado' }),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        message: 'Intente nuevamente en unos minutos'
      }),
    };
  }
};