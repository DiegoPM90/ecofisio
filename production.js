// Script de producción que garantiza el mismo código en deploy y development
process.env.NODE_ENV = 'production';

const { spawn } = require('child_process');

console.log('Iniciando servidor de producción con tsx...');

// Ejecutar tsx directamente con el código fuente
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: process.env.PORT || '3000'
  }
});

server.on('close', (code) => {
  console.log(`Servidor terminó con código ${code}`);
  process.exit(code);
});

server.on('error', (error) => {
  console.error('Error iniciando servidor:', error);
  process.exit(1);
});