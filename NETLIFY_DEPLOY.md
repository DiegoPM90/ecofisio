# Guía de Despliegue en Netlify - ECOFISIO

## Pasos para Desplegar

### 1. Preparar el Repositorio en GitHub
✅ **Completado** - Tu código ya está en GitHub

### 2. Conectar GitHub con Netlify

1. **Ir a Netlify**: https://netlify.com
2. **Crear cuenta** o iniciar sesión
3. **Hacer clic en "New site from Git"**
4. **Seleccionar GitHub** como proveedor
5. **Autorizar Netlify** a acceder a tu repositorio
6. **Seleccionar tu repositorio**: `ecofisio-sistema-kinesologia`

### 3. Configuración de Build en Netlify

En la página de configuración, usa estos valores:

```
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

### 4. Variables de Entorno

En **Site Settings > Environment Variables**, agregar:

```
MONGODB_URI=mongodb+srv://tu-usuario:tu-password@cluster.mongodb.net/ecofisio
OPENAI_API_KEY=sk-tu-clave-openai
EMAIL_USER=canalmovimiento@gmail.com
EMAIL_PASS=raasgpggwcbcebnx
ADMIN_EMAIL=canalmovimiento@gmail.com
NODE_ENV=production
SESSION_SECRET=ecofisio-secret-key-2024
```

**Opcional (WhatsApp):**
```
WHATSAPP_ACCESS_TOKEN=tu-token
WHATSAPP_PHONE_NUMBER_ID=tu-id
```

### 5. Hacer Deploy

1. **Hacer clic en "Deploy site"**
2. **Esperar que termine el build** (2-3 minutos)
3. **Tu sitio estará disponible** en una URL como: `https://optimistic-name-123456.netlify.app`

### 6. Configurar Dominio Personalizado (Opcional)

1. **Ir a Site Settings > Domain Management**
2. **Hacer clic en "Add custom domain"**
3. **Agregar tu dominio**: `ecofisio.com`
4. **Configurar DNS** según las instrucciones de Netlify

## URLs Importantes

- **Tu sitio**: Se generará automáticamente
- **Panel de administración**: `tu-sitio.netlify.app/admin`
- **API endpoints**: `tu-sitio.netlify.app/api/*`

## Verificar que Funciona

Después del deploy, verificar:

✅ **Frontend carga correctamente**
✅ **Formulario de reserva funciona**
✅ **Login/registro funciona**
✅ **Consulta IA responde**
✅ **Emails se envían correctamente**
✅ **Base de datos se conecta**

## Solución de Problemas Comunes

### Error de Build
- Verificar que todas las dependencias estén en package.json
- Revisar los logs de build en Netlify

### Error de Variables de Entorno
- Verificar que todas las variables estén configuradas
- Sin espacios en los valores
- Redeploy después de cambiar variables

### Error de Base de Datos
- Verificar conexión a MongoDB Atlas
- Whitelist de IPs debe incluir 0.0.0.0/0 para Netlify

### Error de Email
- Verificar contraseña de aplicación Gmail
- Confirmar que EMAIL_USER y EMAIL_PASS son correctos

## Contacto para Soporte

- **Email**: canalmovimiento@gmail.com
- **GitHub**: Tu repositorio para issues técnicos