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

    // Horarios disponibles
    if (apiPath === '/api/appointments/available-slots' && httpMethod === 'GET') {
      const { date, specialty } = queryStringParameters || {};
      
      // Horarios para sábados únicamente
      const availableSlots = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];
      
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

    // Crear cita (simplificado para producción inicial)
    if (apiPath === '/api/appointments' && httpMethod === 'POST') {
      const appointmentData = JSON.parse(body || '{}');
      
      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'Cita registrada exitosamente. Te contactaremos para confirmar.',
          appointment: {
            id: Date.now(),
            token: 'temp_' + Date.now(),
            status: 'pending',
            ...appointmentData
          }
        }),
      };
    }

    // Endpoints de autenticación (respuesta temporal)
    if (apiPath.startsWith('/api/auth')) {
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Sistema de autenticación en mantenimiento',
          message: 'Para citas, use el formulario público'
        }),
      };
    }

    // Consulta IA (respuesta temporal)
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