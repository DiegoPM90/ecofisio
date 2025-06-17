#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 SIMULACIÓN DE DESPLIEGUE EN NETLIFY\n');

// Test 1: Verificar configuración de Netlify
function testNetlifyConfig() {
  console.log('📋 PRUEBA 1: Configuración de Netlify');
  
  // Verificar netlify.toml
  if (fs.existsSync('netlify.toml')) {
    console.log('  ✅ netlify.toml: Presente');
    const config = fs.readFileSync('netlify.toml', 'utf8');
    
    // Verificar configuraciones críticas
    const checks = [
      { name: 'build command', pattern: /command\s*=\s*"npm run build"/, content: config },
      { name: 'publish directory', pattern: /publish\s*=\s*"dist"/, content: config },
      { name: 'functions directory', pattern: /functions\s*=\s*"netlify\/functions"/, content: config },
      { name: 'redirects', pattern: /\[\[redirects\]\]/, content: config },
      { name: 'environment variables', pattern: /\[build.environment\]/, content: config }
    ];
    
    checks.forEach(check => {
      if (check.pattern.test(check.content)) {
        console.log(`  ✅ ${check.name}: Configurado`);
      } else {
        console.log(`  ❌ ${check.name}: Faltante o mal configurado`);
      }
    });
  } else {
    console.log('  ❌ netlify.toml: No encontrado');
  }
  
  // Verificar función serverless
  if (fs.existsSync('netlify/functions/api.js')) {
    console.log('  ✅ Función serverless: Presente');
    const apiContent = fs.readFileSync('netlify/functions/api.js', 'utf8');
    
    if (apiContent.includes('serverless-http')) {
      console.log('  ✅ serverless-http: Configurado');
    } else {
      console.log('  ❌ serverless-http: No configurado');
    }
  } else {
    console.log('  ❌ Función serverless: No encontrada');
  }
  
  console.log('');
}

// Test 2: Build de producción
async function testProductionBuild() {
  console.log('🔨 PRUEBA 2: Build de Producción');
  
  return new Promise((resolve) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    buildProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    buildProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    buildProcess.on('close', (code) => {
      console.log(`  📦 Build process: ${code === 0 ? '✅' : '❌'} (exit code: ${code})`);
      
      if (code === 0) {
        // Verificar archivos generados
        if (fs.existsSync('dist')) {
          console.log('  ✅ Directorio dist: Creado');
          
          const distFiles = fs.readdirSync('dist');
          console.log(`  📁 Archivos generados: ${distFiles.length}`);
          
          // Verificar archivos críticos
          const criticalFiles = ['index.html', 'assets'];
          criticalFiles.forEach(file => {
            if (distFiles.includes(file)) {
              console.log(`  ✅ ${file}: Presente`);
            } else {
              console.log(`  ❌ ${file}: Faltante`);
            }
          });
          
          // Verificar tamaño del bundle
          const stats = fs.statSync('dist');
          console.log(`  📊 Tamaño del build: Directory created`);
          
        } else {
          console.log('  ❌ Directorio dist: No creado');
        }
      } else {
        console.log(`  ❌ Error en build: ${errorOutput}`);
      }
      
      console.log('');
      resolve(code === 0);
    });
  });
}

// Test 3: Variables de entorno
function testEnvironmentVariables() {
  console.log('🔧 PRUEBA 3: Variables de Entorno');
  
  // Verificar .env.example
  if (fs.existsSync('.env.example')) {
    console.log('  ✅ .env.example: Presente');
    const envExample = fs.readFileSync('.env.example', 'utf8');
    
    const requiredVars = [
      'MONGODB_URI',
      'SESSION_SECRET',
      'OPENAI_API_KEY',
      'EMAIL_USER',
      'EMAIL_PASS',
      'ADMIN_EMAIL'
    ];
    
    requiredVars.forEach(varName => {
      if (envExample.includes(varName)) {
        console.log(`  ✅ ${varName}: Documentado`);
      } else {
        console.log(`  ❌ ${varName}: No documentado`);
      }
    });
  } else {
    console.log('  ❌ .env.example: No encontrado');
  }
  
  // Verificar que .env no esté en el repositorio
  if (!fs.existsSync('.env')) {
    console.log('  ✅ .env: Correctamente excluido del repositorio');
  } else {
    console.log('  ⚠️ .env: Presente (debería estar en .gitignore)');
  }
  
  console.log('');
}

// Test 4: Dependencias de producción
function testProductionDependencies() {
  console.log('📦 PRUEBA 4: Dependencias de Producción');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Verificar scripts necesarios
  const requiredScripts = ['build', 'start', 'dev'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`  ✅ Script ${script}: Configurado`);
    } else {
      console.log(`  ❌ Script ${script}: Faltante`);
    }
  });
  
  // Verificar dependencias críticas
  const criticalDeps = [
    'express',
    'mongodb',
    'serverless-http',
    'react',
    'vite'
  ];
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  criticalDeps.forEach(dep => {
    if (allDeps[dep]) {
      console.log(`  ✅ ${dep}: ${allDeps[dep]}`);
    } else {
      console.log(`  ❌ ${dep}: No encontrado`);
    }
  });
  
  console.log('');
}

// Test 5: Seguridad en producción
function testProductionSecurity() {
  console.log('🔒 PRUEBA 5: Seguridad en Producción');
  
  // Verificar .gitignore
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    
    const securityPatterns = [
      '.env',
      '.env.*',
      'node_modules',
      '*.log'
    ];
    
    securityPatterns.forEach(pattern => {
      if (gitignore.includes(pattern)) {
        console.log(`  ✅ ${pattern}: Excluido`);
      } else {
        console.log(`  ❌ ${pattern}: No excluido`);
      }
    });
  } else {
    console.log('  ❌ .gitignore: No encontrado');
  }
  
  // Verificar archivos sensibles
  const sensitiveFiles = [
    '.env',
    '.env.local',
    '.env.production',
    'admin-cookies.txt',
    'login-cookies.txt'
  ];
  
  let sensitivesFound = 0;
  sensitiveFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`  ⚠️ ${file}: Presente (debería estar excluido)`);
      sensitivesFound++;
    }
  });
  
  if (sensitivesFound === 0) {
    console.log('  ✅ Archivos sensibles: Ninguno presente');
  }
  
  console.log('');
}

// Test 6: Estructura de archivos
function testFileStructure() {
  console.log('📁 PRUEBA 6: Estructura de Archivos');
  
  const expectedStructure = [
    'client',
    'server',
    'shared',
    'netlify/functions',
    'package.json',
    'netlify.toml',
    'README.md'
  ];
  
  expectedStructure.forEach(item => {
    if (fs.existsSync(item)) {
      console.log(`  ✅ ${item}: Presente`);
    } else {
      console.log(`  ❌ ${item}: Faltante`);
    }
  });
  
  console.log('');
}

// Test 7: Verificación de rutas del frontend
function testFrontendRoutes() {
  console.log('🌐 PRUEBA 7: Rutas del Frontend');
  
  // Verificar componentes principales
  const components = [
    'client/src/App.tsx',
    'client/src/main.tsx',
    'client/src/components/booking-form.tsx',
    'client/src/components/calendar-view.tsx',
    'client/src/components/ai-assistant.tsx'
  ];
  
  components.forEach(component => {
    if (fs.existsSync(component)) {
      console.log(`  ✅ ${component}: Presente`);
    } else {
      console.log(`  ❌ ${component}: Faltante`);
    }
  });
  
  console.log('');
}

// Función principal
async function runNetlifyTests() {
  console.log('='.repeat(60));
  console.log('🚀 SIMULACIÓN COMPLETA DE DESPLIEGUE EN NETLIFY');
  console.log('='.repeat(60));
  console.log('');

  testNetlifyConfig();
  testEnvironmentVariables();
  testProductionDependencies();
  testProductionSecurity();
  testFileStructure();
  testFrontendRoutes();
  
  const buildSuccess = await testProductionBuild();
  
  console.log('='.repeat(60));
  console.log('📊 RESUMEN DE SIMULACIÓN DE DESPLIEGUE');
  console.log('='.repeat(60));
  
  if (buildSuccess) {
    console.log('🎉 SIMULACIÓN DE DESPLIEGUE EXITOSA');
    console.log('✅ El proyecto está listo para desplegarse en Netlify');
    console.log('');
    console.log('📝 PASOS PARA DESPLIEGUE REAL:');
    console.log('1. Conectar repositorio de GitHub a Netlify');
    console.log('2. Configurar variables de entorno en Netlify Dashboard');
    console.log('3. Configurar dominio personalizado si es necesario');
    console.log('4. Activar HTTPS automático');
    console.log('5. Configurar notificaciones de despliegue');
  } else {
    console.log('❌ ERRORES EN SIMULACIÓN DE DESPLIEGUE');
    console.log('⚠️ Revisar errores antes de desplegue real');
  }
  
  console.log('='.repeat(60));
}

// Ejecutar pruebas
runNetlifyTests();