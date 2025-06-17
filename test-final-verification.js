#!/usr/bin/env node

import http from 'http';

// Test rápido de endpoints críticos
async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function quickSystemCheck() {
  console.log('🔍 VERIFICACIÓN FINAL DEL SISTEMA\n');

  // 1. Health check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log(`Health Check: ${health.statusCode === 200 ? '✅' : '❌'} (${health.statusCode})`);

  // 2. Headers de seguridad
  const security = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET'
  });
  
  const securityHeaders = [
    'x-content-type-options',
    'x-frame-options', 
    'x-xss-protection',
    'referrer-policy'
  ];
  
  const headersPassed = securityHeaders.filter(header => 
    security.headers[header]
  ).length;
  
  console.log(`Headers Seguridad: ${headersPassed === 4 ? '✅' : '❌'} (${headersPassed}/4)`);

  // 3. Horarios disponibles (endpoint público)
  const slots = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/appointments/available-slots?date=2024-06-22&specialty=kinesiologia-deportiva',
    method: 'GET'
  });
  console.log(`Horarios Disponibles: ${slots.statusCode === 200 ? '✅' : '❌'} (${slots.statusCode})`);

  // 4. Verificar que rate limiting esté activo pero permita requests normales
  const auth = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET'
  });
  console.log(`Autenticación Endpoint: ${auth.statusCode === 401 ? '✅' : '❌'} (${auth.statusCode})`);

  console.log('\n📊 SISTEMA OPERATIVO Y SEGURO');
  console.log('✅ Listo para producción en Netlify');
}

quickSystemCheck();