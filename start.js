const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Iniciando aplicación en modo producción...');

// Verificar si existe dist/index.js, si no, compilar
if (!fs.existsSync('dist/index.js')) {
  console.log('📦 Compilando aplicación...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Error en compilación, usando tsx directamente...');
    execSync('npx tsx server/index.ts', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });
    return;
  }
}

// Ejecutar la aplicación compilada
console.log('🚀 Iniciando servidor...');
execSync('node dist/index.js', { stdio: 'inherit', env: { ...process.env, NODE_ENV: 'production' } });