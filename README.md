<<<<<<< HEAD
# ECOFISIO - Sistema de Reserva de Kinesiología

Sistema completo de reserva de sesiones de kinesiología y fisioterapia con consulta IA, notificaciones automáticas y gestión integral de citas médicas.

## 🚀 Características Principales

- **Reserva Inteligente de Citas**: Sistema intuitivo para agendar sesiones de kinesiología con selección de especialidades
- **Consulta con Inteligencia Artificial**: Orientación médica automatizada con OpenAI para recomendaciones personalizadas
- **Notificaciones Automáticas**: Sistema dual de notificaciones por WhatsApp y correo electrónico
- **Gestión Integral de Pacientes**: Control completo de historiales clínicos y seguimiento de tratamientos
- **Aplicación Web Progresiva (PWA)**: Funciona offline y se puede instalar como app móvil
- **Diseño Responsivo**: Interfaz optimizada para dispositivos móviles y escritorio
- **Autenticación Segura**: Sistema robusto de usuarios y gestión de sesiones
- **Calendario Dinámico**: Visualización de horarios disponibles solo los sábados (10:00-13:00)

## 🛠️ Stack Tecnológico

### Interfaz de Usuario (Frontend)
- **React 18** con TypeScript para desarrollo tipado
- **Vite** como bundler y servidor de desarrollo ultrarrápido
- **Tailwind CSS** para estilos modernos y responsivos
- **Wouter** para navegación SPA ligera
- **TanStack Query** para gestión de estado del servidor
- **Framer Motion** para animaciones fluidas
- **PWA** con service worker para experiencia nativa

### Servidor (Backend)
- **Node.js** con Express.js para API REST
- **MongoDB Atlas** como base de datos en la nube
- **Autenticación basada en sesiones** con bcrypt
- **Nodemailer** para envío de correos electrónicos
- **WhatsApp Business API** para mensajería instantánea
- **Rate limiting** y seguridad con Helmet

### Inteligencia Artificial
- **OpenAI GPT-4o** para consultas médicas automatizadas
- **Análisis de síntomas** y recomendaciones personalizadas
- **Orientación pre-consulta** para optimizar tiempo médico

## 📦 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/ecofisio-kinesiology-booking.git
cd ecofisio-kinesiology-booking
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:
```env
# Configuración de Base de Datos
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/ecofisio

# Configuración de OpenAI (Requerido para IA)
OPENAI_API_KEY=sk-tu-clave-de-openai-aqui

# Configuración de Email (Gmail SMTP)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion-gmail
ADMIN_EMAIL=admin@ecofisio.com

# WhatsApp Business API (Opcional)
WHATSAPP_ACCESS_TOKEN=tu-token-de-whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu-numero-de-telefono-id

# Configuración Adicional
NODE_ENV=development
PORT=5000
```

### 4. Ejecutar en Modo Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5000`

## 🔧 Configuración Detallada

### Configuración de Gmail SMTP
1. **Habilitar verificación en 2 pasos** en tu cuenta de Gmail
2. **Generar contraseña de aplicación**:
   - Ir a Configuración de Google → Seguridad
   - Buscar "Contraseñas de aplicaciones"
   - Generar nueva contraseña para "Correo"
3. **Configurar variables de entorno**:
   ```env
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASS=contraseña-de-aplicacion-sin-espacios
   ```

### Configuración de WhatsApp Business API
1. **Crear cuenta en Meta for Developers**
2. **Configurar aplicación de WhatsApp Business**
3. **Obtener credenciales**:
   ```env
   WHATSAPP_ACCESS_TOKEN=tu-token-de-acceso
   WHATSAPP_PHONE_NUMBER_ID=id-de-numero-telefono
   ```

### Configuración de OpenAI
1. **Crear cuenta en OpenAI**
2. **Generar clave API** en el panel de desarrollador
3. **Configurar variable**:
   ```env
   OPENAI_API_KEY=sk-tu-clave-openai
   ```

### Configuración de MongoDB Atlas
1. **Crear cluster gratuito** en MongoDB Atlas
2. **Crear usuario de base de datos**
3. **Obtener cadena de conexión**:
   ```env
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ecofisio
   ```

## 📱 Funcionalidades del Sistema

### Módulo de Pacientes
- **Reserva Inteligente**: Selección de especialidad y horarios disponibles
- **Consulta IA**: Análisis de síntomas con recomendaciones personalizadas
- **Notificaciones Automáticas**: Confirmación por WhatsApp y email
- **Gestión Personal**: Ver, modificar y cancelar citas existentes
- **Interfaz Responsiva**: Optimizada para uso móvil y táctil

### Panel Administrativo
- **Dashboard Central**: Resumen de citas del día y estadísticas
- **Gestión de Reservas**: Control total de horarios y disponibilidad
- **Base de Pacientes**: Historial completo y seguimiento de tratamientos
- **Notificaciones Automáticas**: Alertas instantáneas de nuevas reservas
- **Reportes**: Estadísticas de uso y análisis de tendencias

## 🏥 Especialidades Médicas Disponibles

### Kinesiología y Rehabilitación
- **Kinesiología General**: Evaluación postural y tratamiento integral
- **Rehabilitación Deportiva**: Recuperación de lesiones deportivas
- **Fisioterapia Neurológica**: Tratamiento de trastornos neurológicos
- **Terapia Manual**: Técnicas manuales especializadas
- **Masoterapia Terapéutica**: Masajes para relajación y recuperación

### Horarios de Atención
- **Día**: Solo sábados
- **Horario**: 10:00 AM - 1:00 PM
- **Duración**: Sesiones de 1 hora
- **Modalidad**: Presencial en consulta

## 📧 Sistema de Notificaciones Automáticas

### Notificaciones por Email
- **Confirmación Instantánea**: Email automático al paciente tras reservar
- **Notificación al Administrador**: Alerta inmediata de nuevas citas
- **Recordatorios**: Mensajes 24 horas antes de la cita
- **Confirmaciones de Cancelación**: Notificación de citas canceladas

### Notificaciones por WhatsApp
- **Mensajes Instantáneos**: Confirmación inmediata por WhatsApp
- **Enlaces Directos**: Links para gestionar o cancelar citas
- **Recordatorios Automáticos**: Mensajes de recordatorio programados
- **Soporte Interactivo**: Canal directo de comunicación

## 🔒 Seguridad y Privacidad

### Protección de Datos
- **Encriptación de Contraseñas**: Hashing seguro con bcrypt
- **Validación Robusta**: Sanitización en frontend y backend
- **Protección CSRF**: Tokens de seguridad para formularios
- **Rate Limiting**: Prevención de ataques de fuerza bruta
- **Sanitización SQL**: Prevención de inyecciones maliciosas

### Cumplimiento Normativo
- **Protección de Datos Médicos**: Manejo seguro de información sensible
- **Sesiones Seguras**: Gestión de autenticación con tokens seguros
- **Logs de Auditoría**: Registro de acciones para trazabilidad
- **Backup Automático**: Respaldos regulares de datos críticos

## 📊 Estructura del Proyecto

```
ecofisio-kinesiology-booking/
├── client/                    # Aplicación Frontend (React + TypeScript)
│   ├── public/               # Archivos estáticos y PWA
│   │   ├── manifest.json     # Configuración de PWA
│   │   └── sw.js            # Service Worker para offline
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── ai-assistant.tsx
│   │   │   ├── booking-form.tsx
│   │   │   ├── calendar-view.tsx
│   │   │   └── navigation.tsx
│   │   ├── pages/           # Páginas principales
│   │   │   ├── home.tsx
│   │   │   ├── booking.tsx
│   │   │   ├── my-appointments.tsx
│   │   │   └── ai-consultation.tsx
│   │   ├── hooks/           # Custom Hooks de React
│   │   ├── contexts/        # Context Providers
│   │   └── main.tsx         # Punto de entrada
│   └── index.html
├── server/                   # Backend API (Node.js + Express)
│   ├── index.ts             # Servidor principal
│   ├── routes.ts            # Definición de rutas API
│   ├── auth.ts              # Sistema de autenticación
│   ├── storage.ts           # Gestión de base de datos
│   ├── notifications.ts     # Sistema de notificaciones
│   ├── openai.ts            # Integración con OpenAI
│   └── mongodb.ts           # Conexión MongoDB
├── shared/                  # Código compartido
│   └── schema.ts            # Esquemas TypeScript y Zod
├── .env.example             # Plantilla de variables de entorno
├── package.json             # Dependencias y scripts
├── tailwind.config.ts       # Configuración de Tailwind CSS
├── tsconfig.json            # Configuración de TypeScript
└── vite.config.ts           # Configuración de Vite
```

## 🚀 Despliegue en Producción

### Opción 1: Replit Deployments (Recomendado)
```bash
# 1. Configurar variables de entorno en Replit Secrets
# 2. Hacer clic en "Deploy" en el panel de Replit
# 3. La aplicación se despliega automáticamente con HTTPS
```

### Opción 2: Vercel (Frontend + Serverless)
```bash
# 1. Conectar repositorio de GitHub con Vercel
# 2. Configurar variables de entorno en el dashboard
# 3. Despliegue automático en cada push
```

### Opción 3: VPS Manual
```bash
# 1. Compilar para producción
npm run build

# 2. Configurar variables de entorno en el servidor
export NODE_ENV=production
export MONGODB_URI=...
export OPENAI_API_KEY=...

# 3. Instalar dependencias de producción
npm ci --only=production

# 4. Ejecutar con PM2 (recomendado)
pm2 start server/index.js --name ecofisio

# 5. Configurar nginx como proxy reverso
```

### Variables de Entorno para Producción
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=contraseña-aplicacion
ADMIN_EMAIL=admin@ecofisio.com
WHATSAPP_ACCESS_TOKEN=token-opcional
WHATSAPP_PHONE_NUMBER_ID=id-opcional
```

## 🧪 Testing y Desarrollo

### Scripts Disponibles
```bash
# Desarrollo con recarga en caliente
npm run dev

# Construir para producción
npm run build

# Ejecutar en modo producción
npm start

# Linter y formateo
npm run lint
npm run format

# Verificar tipos TypeScript
npm run type-check
```

### Testing del Sistema
```bash
# Probar notificaciones por email
curl -X POST http://localhost:5000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","message":"Prueba"}'

# Probar consulta IA
curl -X POST http://localhost:5000/api/ai/consultation \
  -H "Content-Type: application/json" \
  -d '{"reason":"consulta-general","reasonDetail":"Dolor de espalda"}'

# Verificar estado de la aplicación
curl http://localhost:5000/api/health
```

## 🤝 Contribución al Proyecto

### Flujo de Contribución
1. **Fork** del repositorio principal
2. **Crear rama** para nueva funcionalidad:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Desarrollar** siguiendo las convenciones del proyecto
4. **Commit** con mensajes descriptivos:
   ```bash
   git commit -m "feat: agregar notificaciones push"
   ```
5. **Push** a tu fork:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
6. **Crear Pull Request** con descripción detallada

### Estándares de Código
- **TypeScript** estricto con tipos explícitos
- **ESLint** para calidad de código
- **Prettier** para formateo consistente
- **Convenciones de nomenclatura** en español e inglés
- **Comentarios** en español para lógica compleja

## 📞 Información de Contacto

### Desarrollador Principal
- **Email**: canalmovimiento@gmail.com
- **GitHub**: [Perfil del desarrollador]
- **LinkedIn**: [Perfil profesional]

### Soporte Técnico
- **Issues**: Reportar bugs en GitHub Issues
- **Documentación**: Wiki del repositorio
- **Comunidad**: Discussions en GitHub

### Información Comercial
- **WhatsApp Comercial**: +56 9 1234 5678
- **Email Comercial**: info@ecofisio.com
- **Dirección**: Av. Providencia 1234, Santiago, Chile

## ✨ Roadmap y Características Futuras

### Versión 2.0 (Planificada)
- [ ] **Integración con FONASA/ISAPRE** para validación de pacientes
- [ ] **Telemedicina** con videollamadas integradas
- [ ] **App móvil nativa** para iOS y Android
- [ ] **Sistema de pagos** con WebPay y Mercado Pago
- [ ] **Historial médico digital** con archivos adjuntos

### Versión 2.5 (Futura)
- [ ] **IA avanzada** para diagnóstico predictivo
- [ ] **Integración con dispositivos** médicos IoT
- [ ] **Reportes avanzados** y dashboard analítico
- [ ] **Sistema multiidioma** (inglés, portugués)
- [ ] **API pública** para integraciones externas

### Versión 3.0 (Visión)
- [ ] **Red de profesionales** con múltiples centros
- [ ] **Marketplace** de servicios de salud
- [ ] **Blockchain** para historiales médicos seguros
- [ ] **Machine Learning** para optimización de horarios
- [ ] **Realidad aumentada** para ejercicios de rehabilitación

---

**ECOFISIO** - Innovando la atención kinesiológica con tecnología de vanguardia.

*Desarrollado con dedicación para mejorar la calidad de vida de los pacientes y optimizar la gestión médica profesional.*
=======
# ecofisio
>>>>>>> 6f109b7b2c0f5c1c6b7eb94567ecd3cb160d3525
