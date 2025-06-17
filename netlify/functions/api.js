export const handler = async (event, context) => {
  // Simple serverless handler without external dependencies
  const { httpMethod, path, body, headers, queryStringParameters } = event;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Content-Type': 'application/json',
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
    // Simple routing for essential endpoints
    const apiPath = path.replace('/.netlify/functions/api', '');
    
    if (apiPath === '/api/health') {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ status: 'OK', message: 'API is running' }),
      };
    }

    if (apiPath === '/api/appointments' && httpMethod === 'GET') {
      // Mock response for appointments
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ appointments: [], message: 'Sistema en mantenimiento' }),
      };
    }

    if (apiPath === '/api/appointments' && httpMethod === 'POST') {
      // Mock response for creating appointments
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          success: true, 
          message: 'Cita registrada exitosamente',
          appointment: { id: Date.now(), status: 'pending' }
        }),
      };
    }

    if (apiPath.startsWith('/api/auth')) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No autenticado' }),
      };
    }

    // Default response for unhandled routes
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};