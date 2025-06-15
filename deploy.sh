#!/bin/bash
set -e

echo "🚀 Forzando deploy con código de desarrollo actual..."

# Verificar que estamos usando el código correcto
echo "🔍 Verificando código de desarrollo..."
if ! grep -q "Google" client/src/pages/auth.tsx; then
    echo "✓ Código de desarrollo sin Google OAuth confirmado"
else
    echo "❌ Error: Código contiene Google OAuth"
    exit 1
fi

# Limpiar directorio de build anterior
rm -rf dist/

echo "📦 Construyendo frontend desde código actual..."
# Forzar build desde archivos actuales, no cache
npx vite build --config vite.config.prod.ts --mode development --force

echo "🔧 Construyendo backend desde código actual..."
# Build del backend forzando archivos actuales
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify=false --sourcemap --keep-names

echo "✅ Build completado exitosamente!"
echo "📋 Archivos generados:"
ls -la dist/

echo "🔍 Verificando archivos críticos..."
if [ -f "dist/index.js" ]; then
  echo "✓ Backend compilado correctamente"
else
  echo "❌ Error: Backend no compilado"
  exit 1
fi

if [ -d "dist/public" ]; then
  echo "✓ Frontend compilado correctamente"
else
  echo "❌ Error: Frontend no compilado"
  exit 1
fi

echo "🎉 ¡Listo para despliegue!"