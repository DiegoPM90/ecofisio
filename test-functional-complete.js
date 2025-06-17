#!/usr/bin/env node

import http from 'http';

console.log('⚕️ PRUEBAS FUNCIONALES COMPLETAS - POST RATE LIMIT\n');

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

// Test de flujo completo de usuario
async function testCompleteUserFlow() {
  console.log('👤 FLUJO COMPLETO DE USUARIO');
  
  try {
    // 1. Registro de usuario
    console.log('  📝 Registrando usuario...');
    const registerResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      name: 'Usuario Funcional',
      email: 'funcional@test.com',
      password: 'Password123!'
    });

    console.log(`  📝 Registro: ${registerResponse.statusCode === 201 ? '✅' : '❌'} (${registerResponse.statusCode})`);
    
    if (registerResponse.statusCode !== 201) {
      console.log('  ⚠️ Deteniendo pruebas - registro falló\n');
      return false;
    }

    // 2. Login
    console.log('  🔑 Iniciando sesión...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'funcional@test.com',
      password: 'Password123!'
    });

    const sessionCookie = loginResponse.headers['set-cookie']?.[0];
    console.log(`  🔑 Login: ${loginResponse.statusCode === 200 ? '✅' : '❌'} (${loginResponse.statusCode})`);
    console.log(`  🍪 Sesión: ${sessionCookie ? '✅' : '❌'}`);

    if (!sessionCookie) {
      console.log('  ⚠️ No se pudo obtener sesión\n');
      return false;
    }

    // 3. Verificar usuario autenticado
    console.log('  👤 Verificando autenticación...');
    const authResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });

    console.log(`  👤 Usuario autenticado: ${authResponse.statusCode === 200 ? '✅' : '❌'} (${authResponse.statusCode})`);

    // 4. Consultar horarios disponibles
    console.log('  ⏰ Consultando horarios disponibles...');
    const slotsResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/appointments/available-slots?date=2024-06-22&specialty=kinesiologia-deportiva',
      method: 'GET'
    });

    console.log(`  ⏰ Horarios: ${slotsResponse.statusCode === 200 ? '✅' : '❌'} (${slotsResponse.statusCode})`);
    if (slotsResponse.statusCode === 200 && slotsResponse.body) {
      console.log(`  📊 Slots disponibles: ${slotsResponse.body.availableSlots?.length || 0}`);
    }

    // 5. Crear cita
    console.log('  📅 Creando cita...');
    const appointmentResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/appointments',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie 
      }
    }, {
      patientName: 'Paciente Funcional',
      email: 'paciente@test.com',
      phone: '+56912345678',
      specialty: 'kinesiologia-deportiva',
      reason: 'dolor-lumbar',
      reasonDetail: 'Dolor lumbar después de ejercicio',
      date: '2024-06-22',
      time: '10:00',
      sessions: 1
    });

    console.log(`  📅 Cita creada: ${appointmentResponse.statusCode === 201 ? '✅' : '❌'} (${appointmentResponse.statusCode})`);
    
    let appointmentToken = null;
    if (appointmentResponse.statusCode === 201 && appointmentResponse.body) {
      appointmentToken = appointmentResponse.body.appointment?.token;
      console.log(`  🎫 Token de cita: ${appointmentToken ? '✅' : '❌'}`);
    }

    // 6. Consulta IA
    console.log('  🤖 Realizando consulta IA...');
    const aiResponse = await makeRequest({
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

    console.log(`  🤖 Consulta IA: ${aiResponse.statusCode === 200 ? '✅' : '❌'} (${aiResponse.statusCode})`);

    // 7. Listar citas del usuario
    console.log('  📋 Listando citas del usuario...');
    const userAppointmentsResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/user/appointments',
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });

    console.log(`  📋 Citas del usuario: ${userAppointmentsResponse.statusCode === 200 ? '✅' : '❌'} (${userAppointmentsResponse.statusCode})`);

    // 8. Verificar estado de cita (si tenemos token)
    if (appointmentToken) {
      console.log('  🔍 Verificando estado de cita...');
      const statusResponse = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: `/api/appointments/status/${appointmentToken}`,
        method: 'GET'
      });

      console.log(`  🔍 Estado de cita: ${statusResponse.statusCode === 200 ? '✅' : '❌'} (${statusResponse.statusCode})`);
    }

    // 9. Logout
    console.log('  🚪 Cerrando sesión...');
    const logoutResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { 'Cookie': sessionCookie }
    });

    console.log(`  🚪 Logout: ${logoutResponse.statusCode === 200 ? '✅' : '❌'} (${logoutResponse.statusCode})`);

    console.log('');
    return true;

  } catch (error) {
    console.log(`  ❌ Error en flujo completo: ${error.message}\n`);
    return false;
  }
}

// Test de endpoints públicos
async function testPublicEndpoints() {
  console.log('🌐 ENDPOINTS PÚBLICOS');
  
  const publicEndpoints = [
    { path: '/api/appointments/available-slots?date=2024-06-22&specialty=kinesiologia-deportiva', name: 'Horarios disponibles' },
    { path: '/api/health', name: 'Health check' }
  ];

  let passed = 0;
  
  for (const endpoint of publicEndpoints) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: endpoint.path,
        method: 'GET'
      });

      const success = response.statusCode === 200;
      console.log(`  ${success ? '✅' : '❌'} ${endpoint.name}: ${response.statusCode}`);
      if (success) passed++;
      
    } catch (error) {
      console.log(`  ❌ ${endpoint.name}: Error - ${error.message}`);
    }
  }

  console.log(`  📊 Endpoints públicos: ${passed}/${publicEndpoints.length} funcionando\n`);
  return passed === publicEndpoints.length;
}

// Test de manejo de errores
async function testErrorHandling() {
  console.log('🔥 MANEJO DE ERRORES');
  
  const errorTests = [
    { 
      path: '/api/nonexistent', 
      method: 'GET', 
      name: 'Endpoint inexistente',
      expectedStatus: 404 
    },
    { 
      path: '/api/appointments', 
      method: 'POST', 
      name: 'Crear cita sin autenticación',
      expectedStatus: 401,
      data: { patientName: 'Test' }
    },
    { 
      path: '/api/auth/login', 
      method: 'POST', 
      name: 'Login con datos inválidos',
      expectedStatus: 400,
      data: { email: 'invalid' }
    }
  ];

  let passed = 0;
  
  for (const test of errorTests) {
    try {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: test.path,
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      }, test.data);

      const success = response.statusCode === test.expectedStatus;
      console.log(`  ${success ? '✅' : '❌'} ${test.name}: ${response.statusCode} (esperado: ${test.expectedStatus})`);
      if (success) passed++;
      
    } catch (error) {
      console.log(`  ❌ ${test.name}: Error - ${error.message}`);
    }
  }

  console.log(`  📊 Manejo de errores: ${passed}/${errorTests.length} correcto\n`);
  return passed === errorTests.length;
}

// Función principal
async function runFunctionalTests() {
  console.log('='.repeat(60));
  console.log('⚕️ PRUEBAS FUNCIONALES EXHAUSTIVAS');
  console.log('='.repeat(60));
  console.log('');

  // Esperar a que se restablezca el rate limiting
  console.log('⏳ Esperando restablecimiento de rate limiting (90 segundos)...\n');
  await new Promise(resolve => setTimeout(resolve, 90000));

  const results = [];
  
  results.push(await testCompleteUserFlow());
  results.push(await testPublicEndpoints());
  results.push(await testErrorHandling());

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS FUNCIONALES');
  console.log('='.repeat(60));
  console.log(`✅ Pruebas exitosas: ${passed}/${total}`);
  console.log(`❌ Pruebas fallidas: ${total - passed}/${total}`);
  console.log(`📈 Porcentaje de éxito: ${((passed/total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 TODAS LAS FUNCIONALIDADES PRINCIPALES OPERATIVAS');
  } else {
    console.log('⚠️ ALGUNAS FUNCIONALIDADES REQUIEREN ATENCIÓN');
  }
  
  console.log('='.repeat(60));
}

// Ejecutar pruebas
runFunctionalTests();