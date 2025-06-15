#!/bin/bash
set -e

echo "🚀 Iniciando proceso de build optimizado para despliegue..."

# Limpiar directorio de build anterior
rm -rf dist/

echo "📦 Construyendo frontend..."
# Build del frontend con configuración optimizada
npm run build 2>/dev/null || {
  echo "⚠️ Build con timeout, intentando build simplificado..."
  npx vite build --mode production --minify false --sourcemap false
}

echo "🔧 Construyendo backend..."
# Build del backend
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify=false

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