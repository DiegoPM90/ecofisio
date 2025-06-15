#!/bin/bash
set -e

echo "🧪 Probando consistencia entre desarrollo y producción..."

# Verificar que los archivos principales existen
echo "📁 Verificando estructura de archivos..."
test -f "client/src/App.tsx" && echo "✓ App.tsx existe"
test -f "server/index.ts" && echo "✓ Backend existe"
test -f "shared/schema.ts" && echo "✓ Schema compartido existe"

# Ejecutar build de producción
echo "🔨 Ejecutando build de producción..."
./deploy.sh

# Verificar que los archivos compilados contienen las características principales
echo "🔍 Verificando características en build..."

# Verificar que el frontend compilado contiene componentes principales
if grep -q "Ecofisio" dist/public/index.html; then
    echo "✓ Título de la aplicación presente"
else
    echo "❌ Título de la aplicación faltante"
fi

# Verificar que el backend compilado contiene rutas principales
if grep -q "auth" dist/index.js; then
    echo "✓ Rutas de autenticación presentes"
else
    echo "❌ Rutas de autenticación faltantes"
fi

if grep -q "appointments" dist/index.js; then
    echo "✓ Rutas de citas presentes"
else
    echo "❌ Rutas de citas faltantes"
fi

echo "✅ Verificación completada"