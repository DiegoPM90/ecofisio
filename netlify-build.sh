#!/bin/bash

echo "🚀 Build simplificado para Netlify"

# Instalar dependencias
npm install

# Build usando configuración específica para Netlify
npx vite build --config vite.config.netlify.ts

# Verificar que el build se creó correctamente
if [ -f "dist/index.html" ]; then
    echo "✅ Build completado exitosamente"
    ls -la dist/
else
    echo "❌ Error: index.html no fue generado"
    exit 1
fi

echo "🎉 Listo para deploy"