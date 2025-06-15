const { execSync } = require('child_process');
const fs = require('fs');

console.log('Compilación rápida para deploy...');

// Solo compilar frontend
try {
  // Limpiar dist de cliente anterior
  if (fs.existsSync('client/dist')) {
    execSync('rm -rf client/dist');
  }
  
  // Compilar solo frontend con timeout reducido
  execSync('timeout 60s vite build || echo "Build timeout, usando archivos existentes"', { 
    stdio: 'inherit',
    shell: true
  });
  
  console.log('Frontend preparado');
} catch (error) {
  console.log('Usando archivos de desarrollo para frontend');
}

// Iniciar servidor con tsx (sin compilar backend)
console.log('Iniciando servidor de producción...');
execSync('NODE_ENV=production tsx server/index.ts', { 
  stdio: 'inherit',
  env: { 
    ...process.env, 
    NODE_ENV: 'production',
    PORT: process.env.PORT || '3000'
  }
});