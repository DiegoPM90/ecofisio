// Configuración para garantizar que deploy y development usen el mismo código
const { execSync } = require('child_process');
const fs = require('fs');

// Configurar variables de entorno para producción
process.env.NODE_ENV = 'production';

// Función para compilar y verificar el frontend
function buildFrontend() {
  console.log('Compilando frontend para producción...');
  
  try {
    // Limpiar dist anterior
    if (fs.existsSync('dist')) {
      execSync('rm -rf dist');
    }
    
    // Compilar
    execSync('vite build', { stdio: 'inherit' });
    console.log('Frontend compilado exitosamente');
    return true;
  } catch (error) {
    console.error('Error compilando frontend:', error.message);
    return false;
  }
}

// Función para compilar el backend
function buildBackend() {
  console.log('Compilando backend para producción...');
  
  try {
    execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
    console.log('Backend compilado exitosamente');
    return true;
  } catch (error) {
    console.error('Error compilando backend:', error.message);
    return false;
  }
}

// Función principal
function deployBuild() {
  console.log('Iniciando proceso de deploy...');
  
  const frontendBuilt = buildFrontend();
  const backendBuilt = buildBackend();
  
  if (frontendBuilt && backendBuilt) {
    console.log('Build completado exitosamente');
    // Iniciar servidor de producción
    execSync('node dist/index.js', { stdio: 'inherit' });
  } else {
    console.log('Error en build, usando modo desarrollo para producción...');
    // Fallback: usar tsx directamente
    execSync('tsx server/index.ts', { stdio: 'inherit' });
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  deployBuild();
}

module.exports = { buildFrontend, buildBackend, deployBuild };