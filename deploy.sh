#!/bin/bash
set -e

echo "🚀 Iniciando proceso de build idéntico al desarrollo..."

# Limpiar directorio de build anterior
rm -rf dist/

echo "📦 Construyendo frontend..."
# Build del frontend manteniendo configuración de desarrollo
npx vite build --config vite.config.prod.ts --mode development

echo "🔧 Construyendo backend..."
# Build del backend sin minificación ni optimizaciones
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