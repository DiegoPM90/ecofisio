# Exportar ECOFISIO a GitHub

## Pasos para exportar el proyecto a GitHub

### 1. Crear repositorio en GitHub
1. Ir a [GitHub.com](https://github.com)
2. Hacer clic en "New repository"
3. Nombre sugerido: `ecofisio-kinesiology-booking`
4. Descripción: "Sistema de reserva de kinesiología con IA y notificaciones automáticas"
5. Marcar como "Public" o "Private" según preferencia
6. NO inicializar con README (ya tenemos uno)

### 2. Preparar archivos locales
Todos los archivos están listos para exportar:
- ✅ README.md completo con documentación
- ✅ LICENSE agregada (MIT)
- ✅ .env.example con variables de ejemplo
- ✅ .gitignore actualizado para proteger datos sensibles
- ✅ Código limpio sin credenciales hardcodeadas

### 3. Descargar proyecto desde Replit
En Replit:
1. Ir a la pestaña "Files"
2. Hacer clic en los tres puntos (...) al lado del nombre del proyecto
3. Seleccionar "Download as zip"
4. Extraer el archivo ZIP en tu computadora

### 4. Subir a GitHub usando Git
```bash
# Navegar a la carpeta del proyecto
cd ecofisio-kinesiology-booking

# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit: Complete kinesiology booking system with AI"

# Agregar remote de GitHub (reemplazar con tu URL)
git remote add origin https://github.com/tu-usuario/ecofisio-kinesiology-booking.git

# Subir código
git push -u origin main
```

### 5. Alternativa: Subir usando GitHub Web
Si prefieres no usar Git:
1. Crear el repositorio en GitHub
2. Hacer clic en "uploading an existing file"
3. Arrastrar todos los archivos del proyecto
4. Escribir mensaje de commit: "Initial commit: Complete kinesiology booking system"
5. Hacer clic en "Commit new files"

### 6. Configurar secretos en GitHub (para CI/CD)
En el repositorio de GitHub:
1. Ir a Settings > Secrets and variables > Actions
2. Agregar estos secretos:
   - `MONGODB_URI`
   - `OPENAI_API_KEY`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `ADMIN_EMAIL`

### 7. Verificar exportación
- ✅ Todos los archivos subidos
- ✅ README.md se muestra correctamente
- ✅ No hay archivos sensibles (.env visible)
- ✅ Estructura de proyecto clara

## Archivos incluidos en la exportación

### Frontend (client/)
- Aplicación React con TypeScript
- Componentes reutilizables
- Routing con Wouter
- Estilos con Tailwind CSS
- PWA configurada

### Backend (server/)
- API REST con Express
- Autenticación segura
- Sistema de notificaciones
- Integración con OpenAI
- Gestión de base de datos

### Configuración
- TypeScript configurado
- Vite para desarrollo
- ESLint y formateo
- Variables de entorno
- Documentación completa

## Próximos pasos después de exportar

1. **Configurar entorno de desarrollo local**
   ```bash
   npm install
   cp .env.example .env
   # Configurar variables en .env
   npm run dev
   ```

2. **Configurar despliegue en producción**
   - Vercel, Netlify, o servidor VPS
   - Configurar variables de entorno
   - Configurar base de datos MongoDB

3. **Configurar CI/CD (opcional)**
   - GitHub Actions para testing
   - Despliegue automático
   - Verificación de código

El proyecto está listo para exportar y usar en cualquier entorno de desarrollo.