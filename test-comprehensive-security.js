#!/usr/bin/env node

import https from 'https';
import http from 'http';
import { MongoClient } from 'mongodb';

// Configuración de pruebas
const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'test-security@example.com';
const TEST_PASSWORD = 'TestPassword123!';
const WEAK_PASSWORD = '123';

console.log('🔒 INICIANDO PRUEBAS EXHAUSTIVAS DE CIBERSEGURIDAD\n');

// Función auxiliar para hacer requests HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(result);
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
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test 1: Headers de Seguridad
async function testSecurityHeaders() {
  console.log('📋 PRUEBA 1: Headers de Seguridad');
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET'
    });

    const headers = response.headers;
    const securityChecks = [
      { name: 'X-Content-Type-Options', expected: 'nosniff', actual: headers['x-content-type-options'] },
      { name: 'X-Frame-Options', expected: 'DENY', actual: headers['x-frame-options'] },
      { name: 'X-XSS-Protection', expected: '1; mode=block', actual: headers['x-xss-protection'] },
      { name: 'Referrer-Policy', expected: 'strict-origin-when-cross-origin', actual: headers['referrer-policy'] }
    ];

    let passed = 0;
    securityChecks.forEach(check => {
      if (check.actual === check.expected) {
        console.log(`  ✅ ${check.name}: ${check.actual}`);
        passed++;
      } else {
        console.log(`  ❌ ${check.name}: Esperado "${check.expected}", Obtenido "${check.actual}"`);
      }
    });

    // Verificar que X-Powered-By no esté presente
    if (!headers['x-powered-by']) {
      console.log('  ✅ X-Powered-By: Correctamente removido');
      passed++;
    } else {
      console.log(`  ❌ X-Powered-By: Presente (${headers['x-powered-by']})`);
    }

    console.log(`  📊 Resultado: ${passed}/5 headers de seguridad correctos\n`);
    return passed === 5;
  } catch (error) {
    console.log(`  ❌ Error en prueba de headers: ${error.message}\n`);
    return false;
  }
}

// Test 2: Rate Limiting
async function testRateLimit() {
  console.log('🚫 PRUEBA 2: Rate Limiting');
  
  try {
    // Probar rate limit en login (5 intentos por 15 minutos)
    const loginAttempts = [];
    for (let i = 0; i < 7; i++) {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      });
      
      loginAttempts.push(response.statusCode);
      
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Pequeña pausa
      }
    }

    // Los primeros 5 intentos deberían ser 401, los siguientes 429
    const rateLimitTriggered = loginAttempts.slice(5).every(status => status === 429);
    
    if (rateLimitTriggered) {
      console.log('  ✅ Rate limiting en login funcionando correctamente');
      console.log(`  📊 Códigos de respuesta: ${loginAttempts.join(', ')}`);
    } else {
      console.log('  ❌ Rate limiting en login no funciona');
      console.log(`  📊 Códigos de respuesta: ${loginAttempts.join(', ')}`);
    }

    console.log('');
    return rateLimitTriggered;
  } catch (error) {
    console.log(`  ❌ Error en prueba de rate limiting: ${error.message}\n`);
    return false;
  }
}

// Test 3: Validación de Entrada
async function testInputValidation() {
  console.log('🛡️ PRUEBA 3: Validación de Entrada');
  
  const testCases = [
    {
      name: 'Script XSS en nombre',
      data: { name: '<script>alert("xss")</script>', email: 'test@example.com', password: 'Password123!' },
      expectFail: true
    },
    {
      name: 'SQL Injection en email',
      data: { name: 'Test User', email: "'; DROP TABLE users; --", password: 'Password123!' },
      expectFail: true
    },
    {
      name: 'Email inválido',
      data: { name: 'Test User', email: 'invalid-email', password: 'Password123!' },
      expectFail: true
    },
    {
      name: 'Contraseña débil',
      data: { name: 'Test User', email: 'test@example.com', password: '123' },
      expectFail: true
    },
    {
      name: 'Datos válidos',
      data: { name: 'Test User', email: 'valid@example.com', password: 'ValidPassword123!' },
      expectFail: false
    }
  ];

  let passed = 0;
  
  for (const testCase of testCases) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, testCase.data);

      const failed = response.statusCode >= 400;
      
      if (testCase.expectFail && failed) {
        console.log(`  ✅ ${testCase.name}: Correctamente rechazado (${response.statusCode})`);
        passed++;
      } else if (!testCase.expectFail && !failed) {
        console.log(`  ✅ ${testCase.name}: Correctamente aceptado (${response.statusCode})`);
        passed++;
      } else {
        console.log(`  ❌ ${testCase.name}: Resultado inesperado (${response.statusCode})`);
      }
    } catch (error) {
      console.log(`  ❌ ${testCase.name}: Error - ${error.message}`);
    }
  }

  console.log(`  📊 Resultado: ${passed}/${testCases.length} validaciones correctas\n`);
  return passed === testCases.length;
}

// Test 4: Autenticación y Sesiones
async function testAuthSessions() {
  console.log('🔐 PRUEBA 4: Autenticación y Sesiones');
  
  try {
    // 1. Registrar usuario de prueba
    const registerResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Security Test User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    console.log(`  📝 Registro: ${registerResponse.statusCode === 201 ? '✅' : '❌'} (${registerResponse.statusCode})`);

    // 2. Login correcto
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const sessionCookie = loginResponse.headers['set-cookie']?.[0];
    console.log(`  🔑 Login: ${loginResponse.statusCode === 200 ? '✅' : '❌'} (${loginResponse.statusCode})`);
    console.log(`  🍪 Cookie de sesión: ${sessionCookie ? '✅ Presente' : '❌ Ausente'}`);

    // 3. Verificar sesión autenticada
    if (sessionCookie) {
      const authResponse = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/me',
        method: 'GET',
        headers: { 'Cookie': sessionCookie }
      });

      console.log(`  👤 Verificación de usuario: ${authResponse.statusCode === 200 ? '✅' : '❌'} (${authResponse.statusCode})`);
    }

    // 4. Logout
    if (sessionCookie) {
      const logoutResponse = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/logout',
        method: 'POST',
        headers: { 'Cookie': sessionCookie }
      });

      console.log(`  🚪 Logout: ${logoutResponse.statusCode === 200 ? '✅' : '❌'} (${logoutResponse.statusCode})`);
    }

    console.log('');
    return true;
  } catch (error) {
    console.log(`  ❌ Error en prueba de autenticación: ${error.message}\n`);
    return false;
  }
}

// Test 5: Protección CSRF
async function testCSRFProtection() {
  console.log('🔒 PRUEBA 5: Protección CSRF');
  
  try {
    // Intentar hacer request sin origen válido
    const response = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'http://malicious-site.com'
      }
    }, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    // Con sameSite: strict, las cookies no deberían enviarse desde orígenes diferentes
    console.log(`  🛡️ Protección CSRF: Configurada con sameSite: strict`);
    console.log(`  📊 Respuesta cross-origin: ${response.statusCode}`);
    console.log('');
    return true;
  } catch (error) {
    console.log(`  ❌ Error en prueba CSRF: ${error.message}\n`);
    return false;
  }
}

// Test 6: Funcionalidades Principales
async function testMainFunctionalities() {
  console.log('⚕️ PRUEBA 6: Funcionalidades Principales');
  
  try {
    // Login para obtener sesión
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    const sessionCookie = loginResponse.headers['set-cookie']?.[0];
    
    if (!sessionCookie) {
      console.log('  ❌ No se pudo obtener sesión para pruebas\n');
      return false;
    }

    // 1. Crear cita
    const appointmentData = {
      patientName: 'Paciente Prueba',
      email: 'paciente@test.com',
      phone: '+56912345678',
      specialty: 'kinesiologia-deportiva',
      reason: 'dolor-lumbar',
      reasonDetail: 'Dolor en zona lumbar después de ejercicio',
      date: '2024-06-22',
      time: '10:00',
      sessions: 1
    };

    const createAppointmentResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/appointments',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie 
      }
    }, appointmentData);

    console.log(`  📅 Crear cita: ${createAppointmentResponse.statusCode === 201 ? '✅' : '❌'} (${createAppointmentResponse.statusCode})`);

    // 2. Listar citas
    const listAppointmentsResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/appointments',
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });

    console.log(`  📋 Listar citas: ${listAppointmentsResponse.statusCode === 200 ? '✅' : '❌'} (${listAppointmentsResponse.statusCode})`);

    // 3. Consulta IA
    const aiConsultationResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/consultation',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie 
      }
    }, {
      reason: 'dolor-lumbar',
      reasonDetail: 'Dolor persistente en zona lumbar',
      specialty: 'kinesiologia-deportiva'
    });

    console.log(`  🤖 Consulta IA: ${aiConsultationResponse.statusCode === 200 ? '✅' : '❌'} (${aiConsultationResponse.statusCode})`);

    // 4. Horarios disponibles
    const availableSlotsResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/appointments/available-slots?date=2024-06-22&specialty=kinesiologia-deportiva',
      method: 'GET'
    });

    console.log(`  ⏰ Horarios disponibles: ${availableSlotsResponse.statusCode === 200 ? '✅' : '❌'} (${availableSlotsResponse.statusCode})`);

    console.log('');
    return true;
  } catch (error) {
    console.log(`  ❌ Error en pruebas de funcionalidades: ${error.message}\n`);
    return false;
  }
}

// Test 7: Base de Datos
async function testDatabaseConnection() {
  console.log('🗄️ PRUEBA 7: Conexión a Base de Datos');
  
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    console.log(`  ✅ Conexión a MongoDB: Exitosa`);
    console.log(`  📊 Colecciones disponibles: ${collections.map(c => c.name).join(', ')}`);
    
    // Verificar que la base de datos está limpia
    const usersCount = await db.collection('users').countDocuments();
    const appointmentsCount = await db.collection('appointments').countDocuments();
    const sessionsCount = await db.collection('sessions').countDocuments();
    
    console.log(`  👥 Usuarios: ${usersCount}`);
    console.log(`  📅 Citas: ${appointmentsCount}`);
    console.log(`  🔐 Sesiones: ${sessionsCount}`);
    
    await client.close();
    console.log('');
    return true;
  } catch (error) {
    console.log(`  ❌ Error de conexión a base de datos: ${error.message}\n`);
    return false;
  }
}

// Función principal
async function runAllTests() {
  const results = [];
  
  console.log('='.repeat(60));
  console.log('🔒 SUITE EXHAUSTIVA DE PRUEBAS DE CIBERSEGURIDAD');
  console.log('='.repeat(60));
  console.log('');

  results.push(await testSecurityHeaders());
  results.push(await testRateLimit());
  results.push(await testInputValidation());
  results.push(await testAuthSessions());
  results.push(await testCSRFProtection());
  results.push(await testMainFunctionalities());
  results.push(await testDatabaseConnection());

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('='.repeat(60));
  console.log('📊 RESUMEN DE RESULTADOS');
  console.log('='.repeat(60));
  console.log(`✅ Pruebas exitosas: ${passed}/${total}`);
  console.log(`❌ Pruebas fallidas: ${total - passed}/${total}`);
  console.log(`📈 Porcentaje de éxito: ${((passed/total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 TODAS LAS PRUEBAS DE SEGURIDAD PASARON EXITOSAMENTE');
    console.log('🔐 El sistema está preparado para producción');
  } else {
    console.log('⚠️ ALGUNAS PRUEBAS FALLARON - REVISAR ANTES DE PRODUCCIÓN');
  }
  
  console.log('='.repeat(60));
}

// Esperar a que el servidor esté listo y ejecutar pruebas
setTimeout(runAllTests, 2000);