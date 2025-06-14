# Configuración WhatsApp Business API Oficial

## Paso 1: Crear Aplicación en Meta for Developers

1. Ve a https://developers.facebook.com/
2. Crea una nueva aplicación seleccionando "Business"
3. Agrega el producto "WhatsApp Business Platform"

## Paso 2: Configurar WhatsApp Business API

### Obtener Credenciales:

1. **Phone Number ID**: 
   - Ve a WhatsApp > Getting Started
   - Copia el "Phone number ID"

2. **Access Token**:
   - Ve a WhatsApp > Getting Started  
   - Copia el "Temporary access token" (para pruebas)
   - Para producción: Genera un token permanente

### Variables de Entorno Requeridas:

```env
WHATSAPP_ACCESS_TOKEN=tu_access_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
```

## Paso 3: Configurar Webhook (Opcional)

Para recibir confirmaciones de entrega:

1. En la consola de Meta, ve a WhatsApp > Configuration
2. Configura webhook URL: `https://tu-dominio.com/webhook/whatsapp`
3. Verify token: cualquier string aleatorio

## Paso 4: Verificar Número de WhatsApp Business

1. En WhatsApp > Getting Started
2. Agrega tu número de teléfono business
3. Verifica el número con el código SMS

## Paso 5: Configurar Email (Gmail)

Para notificaciones por email:

```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password-de-gmail
```

### Generar App Password para Gmail:

1. Ve a tu cuenta Google
2. Seguridad > Verificación en 2 pasos
3. Contraseñas de aplicaciones
4. Genera contraseña para "Correo"

## Paso 6: Probar el Sistema

### Probar sin Credenciales (Modo Simulación):

El sistema funciona sin credenciales mostrando logs en consola.

### Probar con Credenciales Reales:

1. Agrega las variables de entorno
2. Reinicia el servidor
3. Crea una cita de prueba
4. Verifica que lleguen los mensajes

## Estructura de Mensajes

### WhatsApp:
- Formato: Texto plano con emojis
- Incluye: Detalles de cita, dirección, token de cancelación

### Email:
- Formato: HTML responsivo
- Incluye: Plantilla profesional con branding

## Límites de la API

### Modo Desarrollo:
- 1000 mensajes gratis por mes
- Solo a números verificados

### Modo Producción:
- Costo por mensaje (varía por país)
- Envío a cualquier número
- Requiere verificación de negocio

## Troubleshooting

### Error: "Phone number not registered"
- Solución: Verifica el número en Meta console

### Error: "Invalid access token"
- Solución: Regenera el token en Meta console

### Error: "Rate limit exceeded"
- Solución: Espera o upgrade al plan pago

## URLs Importantes

- Meta for Developers: https://developers.facebook.com/
- WhatsApp Business API Docs: https://developers.facebook.com/docs/whatsapp/
- Precios: https://developers.facebook.com/docs/whatsapp/pricing