# ECOFISIO - Sistema de Reserva de Kinesiología

Sistema completo de reserva de sesiones de kinesiología y fisioterapia con consulta AI, notificaciones automáticas y gestión de citas.

## 🚀 Características

- **Reserva de Citas**: Sistema intuitivo para programar sesiones de kinesiología
- **Consulta IA**: Orientación automatizada con OpenAI para recomendaciones personalizadas
- **Notificaciones Duales**: Sistema de notificaciones por WhatsApp y Email
- **Gestión de Pacientes**: Control completo de historiales y seguimiento
- **PWA**: Aplicación web progresiva con soporte offline
- **Responsive**: Diseño optimizado para móviles y escritorio
- **Autenticación**: Sistema seguro de usuarios y sesiones

## 🛠️ Tecnologías

### Frontend
- React 18 con TypeScript
- Vite para desarrollo rápido
- Tailwind CSS para estilos
- Wouter para routing
- TanStack Query para gestión de estado
- PWA con service worker

### Backend
- Node.js con Express
- MongoDB Atlas para base de datos
- Autenticación con sesiones
- Nodemailer para emails
- WhatsApp Business API

### AI/ML
- OpenAI GPT-4o para consultas médicas
- Recomendaciones personalizadas
- Análisis de síntomas

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd ecofisio
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Configurar las siguientes variables:
```env
# Base de datos
MONGODB_URI=tu_uri_de_mongodb_atlas

# OpenAI (requerido para consultas IA)
OPENAI_API_KEY=tu_clave_openai

# Email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
ADMIN_EMAIL=admin@ecofisio.com

# WhatsApp Business API (opcional)
WHATSAPP_ACCESS_TOKEN=tu_token_whatsapp
WHATSAPP_PHONE_NUMBER_ID=tu_id_telefono
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 🔧 Configuración

### Gmail SMTP
1. Activar verificación en 2 pasos en Gmail
2. Generar contraseña de aplicación
3. Configurar EMAIL_USER y EMAIL_PASS

### WhatsApp Business API
1. Crear cuenta en Meta for Developers
2. Configurar WhatsApp Business API
3. Obtener ACCESS_TOKEN y PHONE_NUMBER_ID

### OpenAI
1. Crear cuenta en OpenAI
2. Generar API key
3. Configurar OPENAI_API_KEY

## 📱 Funcionalidades

### Para Pacientes
- Reserva de citas por especialidad
- Consulta IA para orientación médica
- Confirmación automática por WhatsApp/Email
- Gestión de citas existentes
- Interfaz móvil optimizada

### Para Administradores
- Panel de gestión de citas
- Notificaciones automáticas de nuevas reservas
- Control de horarios disponibles
- Gestión de pacientes
- Estadísticas del sistema

## 🏥 Especialidades

- **Kinesiología General**: Evaluación y tratamiento integral
- **Rehabilitación**: Recuperación post-lesiones
- **Fisioterapia**: Tratamientos especializados
- **Masoterapia**: Terapias de relajación y recuperación

## 📧 Sistema de Notificaciones

### Email Automático
- Confirmación de citas para pacientes
- Notificación al admin de nuevas reservas
- Recordatorios de citas próximas
- Confirmaciones de cancelación

### WhatsApp
- Mensajes instantáneos de confirmación
- Enlaces directos para gestión
- Recordatorios automáticos

## 🔒 Seguridad

- Autenticación segura con sesiones
- Validación de datos en frontend y backend
- Protección contra ataques CSRF
- Rate limiting en APIs
- Sanitización de inputs

## 📊 Estructura del Proyecto

```
├── client/           # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/      # Páginas de la aplicación
│   │   ├── hooks/      # Custom hooks
│   │   └── contexts/   # Context providers
├── server/           # Backend Express
│   ├── routes.ts     # Definición de rutas API
│   ├── auth.ts       # Sistema de autenticación
│   ├── storage.ts    # Gestión de datos
│   ├── notifications.ts # Sistema de notificaciones
│   └── openai.ts     # Integración con OpenAI
├── shared/           # Tipos y esquemas compartidos
│   └── schema.ts     # Definiciones TypeScript
└── attached_assets/  # Assets del proyecto
```

## 🚀 Despliegue

### Replit Deployments (Recomendado)
1. Configurar variables de entorno en Replit
2. Hacer clic en "Deploy" en el panel de Replit
3. La aplicación se desplegará automáticamente

### Manual
1. Compilar el proyecto: `npm run build`
2. Subir a servidor con Node.js
3. Configurar variables de entorno
4. Ejecutar: `npm start`

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Contacto

- **Email**: canalmovimiento@gmail.com
- **WhatsApp**: +56 9 1234 5678
- **Dirección**: Av. Providencia 1234, Santiago

## ✨ Características Futuras

- [ ] Integración con sistemas de salud
- [ ] Telemedicina integrada
- [ ] App móvil nativa
- [ ] Sistema de pagos en línea
- [ ] Historial médico digital
- [ ] Reportes y analytics avanzados

---

Desarrollado con ❤️ para mejorar la atención en kinesiología y fisioterapia.