#!/usr/bin/env node

// Script de build personalizado para Netlify
import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Iniciando build para Netlify...');

try {
  // 1. Build del frontend con Vite
  console.log('📦 Construyendo frontend...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Asegurarse de que el directorio netlify/functions existe
  const functionsDir = join(__dirname, 'netlify', 'functions');
  if (!existsSync(functionsDir)) {
    mkdirSync(functionsDir, { recursive: true });
  }

  // 3. Copiar archivo _redirects si no existe en dist
  const redirectsSrc = join(__dirname, 'client', 'public', '_redirects');
  const redirectsDest = join(__dirname, 'dist', '_redirects');
  
  if (existsSync(redirectsSrc)) {
    copyFileSync(redirectsSrc, redirectsDest);
    console.log('✅ Archivo _redirects copiado');
  }

  console.log('✅ Build completado exitosamente');
  console.log('📋 Estructura lista para Netlify:');
  console.log('   - Frontend: dist/');
  console.log('   - Functions: netlify/functions/');
  console.log('   - Redirects: dist/_redirects');

} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  process.exit(1);
}