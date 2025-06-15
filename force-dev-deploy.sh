#!/bin/bash
set -e

echo "🔒 Forzando deploy exacto del código de desarrollo actual..."

# Verificación exhaustiva del código
echo "🔍 Verificando que NO hay Google OAuth en el código..."
GOOGLE_FOUND=false

# Verificar archivos principales por autenticación específica de Google
if grep -r "GoogleAuth\|google.*auth\|Continuar con Google\|Sign.*Google" client/src/ --exclude-dir=node_modules 2>/dev/null; then
    echo "❌ Error: Se encontró autenticación de Google"
    GOOGLE_FOUND=true
fi

if grep -r "GoogleAuth\|google.*auth\|passport.*google" server/ --exclude-dir=node_modules 2>/dev/null; then
    echo "❌ Error: Se encontró autenticación de Google en backend"
    GOOGLE_FOUND=true
fi

if [ "$GOOGLE_FOUND" = true ]; then
    echo "❌ Deploy cancelado - código contiene Google OAuth no deseado"
    exit 1
fi

echo "✓ Verificación exitosa - código limpio sin Google OAuth"

# Limpiar completamente
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf client/dist/

echo "📦 Construyendo desde archivos fuente actuales..."

# Build forzado desde archivos actuales
NODE_ENV=development npx vite build --config vite.config.prod.ts

echo "🔧 Construyendo backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist --minify=false --sourcemap --keep-names

echo "🔍 Verificando build final..."
if [ -f "dist/index.js" ] && [ -d "dist/public" ]; then
    echo "✅ Build exitoso - archivos generados correctamente"
    echo "📋 Contenido de dist/:"
    ls -la dist/
else
    echo "❌ Error en build"
    exit 1
fi

echo "🎯 Deploy preparado con código de desarrollo exacto"