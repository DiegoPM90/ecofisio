# Archivos Nuevos para Subir a GitHub

## 1. netlify.toml (en la raíz del proyecto)
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  node_bundler = "esbuild"
```

## 2. netlify/functions/api.js
Crear carpeta: netlify/functions/
Crear archivo: api.js
```javascript
import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../../server/routes.js';

const app = express();

// Basic middleware for serverless
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple CORS for production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Register all routes
registerRoutes(app);

// Export the serverless function
export const handler = serverless(app);
```

## 3. client/public/_redirects
```
# Netlify redirects file
# Redirect API calls to Netlify Functions
/api/*  /.netlify/functions/api/:splat  200

# Serve the React app for all other routes (SPA routing)
/*    /index.html   200
```

## 4. client/src/config/environment.ts
Crear carpeta: client/src/config/
Crear archivo: environment.ts
```typescript
// Configuración de ambiente para el frontend
export const config = {
  // En desarrollo, usar el servidor local
  // En producción, usar las funciones de Netlify
  apiBaseUrl: import.meta.env.PROD 
    ? '/.netlify/functions/api'
    : '/api',
  
  // URLs base para diferentes ambientes
  baseUrl: import.meta.env.PROD
    ? window.location.origin
    : 'http://localhost:5000',
    
  // Configuración de la aplicación
  appName: 'ECOFISIO',
  version: '1.0.0',
  environment: import.meta.env.MODE
};

// Helper para construir URLs de API
export function buildApiUrl(endpoint: string): string {
  // Remover slash inicial si existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (import.meta.env.PROD) {
    return `/.netlify/functions/api/${cleanEndpoint}`;
  }
  
  return `/api/${cleanEndpoint}`;
}
```

## 5. .env.netlify (en la raíz)
```env
# Variables de entorno para Netlify
# Copia estos valores a la configuración de variables de entorno en Netlify

# Base de datos MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ecofisio

# OpenAI para consultas IA
OPENAI_API_KEY=sk-tu-clave-openai-aqui

# Configuración de email Gmail
EMAIL_USER=canalmovimiento@gmail.com
EMAIL_PASS=raasgpggwcbcebnx
ADMIN_EMAIL=canalmovimiento@gmail.com

# WhatsApp (opcional)
WHATSAPP_ACCESS_TOKEN=tu-token-whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu-id-numero

# Configuración de producción
NODE_ENV=production
SESSION_SECRET=ecofisio-secret-key-2024
```

## 6. build-netlify.js (en la raíz)
```javascript
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
```

## Instrucciones para Subir:

1. Ve a tu repositorio en GitHub
2. Haz clic en "Add file" > "Create new file"
3. Crea cada archivo con su contenido exacto
4. Para las carpetas (netlify/functions/, client/src/config/):
   - Escribe la ruta completa: "netlify/functions/api.js"
   - GitHub creará automáticamente las carpetas

5. Commit message sugerido:
```
Configuración completa para despliegue en Netlify

- Funciones serverless para backend
- Configuración de build y redirects
- Variables de entorno y guías
- Soporte completo para producción
```