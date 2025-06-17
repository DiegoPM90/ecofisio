#!/bin/bash

echo "🚀 Build simplificado para Netlify"

# Instalar dependencias
npm install

# Build del frontend únicamente
cd client
npx vite build --outDir=../dist --mode=production

# Verificar que el build se creó correctamente
if [ -f "../dist/index.html" ]; then
    echo "✅ Build completado exitosamente"
    ls -la ../dist/
else
    echo "❌ Error: index.html no fue generado"
    exit 1
fi

cd ..
echo "🎉 Listo para deploy"