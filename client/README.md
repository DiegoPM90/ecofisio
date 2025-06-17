# Archivos de configuración para deployment en Netlify

Esta carpeta contiene todos los archivos de configuración necesarios para el deployment del frontend en Netlify.

## Archivos incluidos:

- `package.json` - Dependencias específicas para el frontend
- `vite.config.ts` - Configuración de Vite para build de producción
- `tailwind.config.ts` - Configuración de Tailwind CSS
- `postcss.config.js` - Configuración de PostCSS
- `tsconfig.json` - Configuración de TypeScript
- `tsconfig.node.json` - Configuración de TypeScript para Node

## Instrucciones:

1. Descarga esta carpeta completa
2. Reemplaza el contenido de tu carpeta `client/` existente con estos archivos
3. Mantén la carpeta `client/src/` con todo su contenido actual
4. Sube los cambios a GitHub
5. Haz deploy en Netlify

## Comando de build para Netlify:
```
cd client && npm install && npx update-browserslist-db@latest && npx vite build
```

## Publish directory:
```
client/dist
```