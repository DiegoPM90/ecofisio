const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Preparando aplicación para producción...');

// Verificar si existe dist folder
if (fs.existsSync('dist')) {
  console.log('📦 Limpiando builds anteriores...');
  execSync('rm -rf dist', { stdio: 'inherit' });
}

// Compilar frontend
console.log('📦 Compilando frontend...');
try {
  execSync('npm run build', { stdio: 'inherit', timeout: 120000 });
  console.log('✅ Frontend compilado exitosamente');
} catch (error) {
  console.log('❌ Error compilando frontend, usando tsx directamente...');
  // Si falla la compilación, usar tsx directamente
  execSync('NODE_ENV=production npx tsx server/index.ts', { 
    stdio: 'inherit', 
    env: { ...process.env, NODE_ENV: 'production' } 
  });
  return;
}

// Verificar que los archivos compilados existen
if (!fs.existsSync('dist/index.js')) {
  console.log('❌ Archivo compilado no encontrado, usando tsx...');
  execSync('NODE_ENV=production npx tsx server/index.ts', { 
    stdio: 'inherit', 
    env: { ...process.env, NODE_ENV: 'production' } 
  });
  return;
}

// Ejecutar la aplicación compilada
console.log('🚀 Iniciando servidor de producción...');
execSync('NODE_ENV=production node dist/index.js', { 
  stdio: 'inherit', 
  env: { ...process.env, NODE_ENV: 'production' } 
});