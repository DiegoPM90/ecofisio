import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Crear estructura mínima para deploy
console.log('Sincronizando archivos para deploy...');

// Crear dist/index.js compilado rápidamente si no existe
if (!fs.existsSync('dist/index.js')) {
  console.log('Compilando backend...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js', { stdio: 'inherit' });
}

// Crear archivo HTML básico para producción
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EcoFisio - Sistema de Citas</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="root">
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc;">
            <div style="text-align: center; padding: 2rem;">
                <h1 style="font-size: 2rem; font-weight: bold; color: #1e293b; margin-bottom: 1rem;">EcoFisio Centro</h1>
                <p style="color: #64748b; margin-bottom: 2rem;">Sistema de reservas de kinesiología</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="showLogin()" style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;">Iniciar Sesión</button>
                    <button onclick="showRegister()" style="background: #10b981; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;">Registrarse</button>
                </div>
                <div id="auth-form" style="margin-top: 2rem;"></div>
            </div>
        </div>
    </div>
    <script>
        function showLogin() {
            window.location.href = '/auth';
        }
        function showRegister() {
            window.location.href = '/auth';
        }
    </script>
</body>
</html>`;

// Asegurar que existe el directorio dist
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
}

// Escribir archivo HTML
fs.writeFileSync('dist/index.html', htmlContent);

console.log('Deploy sincronizado correctamente');