# Configuración WhatsApp Business API

## Credenciales necesarias:
- `WHATSAPP_ACCESS_TOKEN`: Token de acceso permanente
- `WHATSAPP_PHONE_NUMBER_ID`: ID del número de teléfono registrado

## Pasos de configuración:

### 1. Crear aplicación en Meta for Developers
- Ve a https://developers.facebook.com
- Crear cuenta → Crear aplicación → Tipo: Empresa
- Agregar producto WhatsApp

### 2. Configurar número de teléfono
- Meta asigna número de prueba gratuito
- O verifica tu propio número comercial

### 3. Obtener credenciales
- Copia el Phone Number ID desde el panel
- Genera un Access Token permanente

### 4. Configurar en Replit
```bash
# En Secrets de Replit agregar:
WHATSAPP_ACCESS_TOKEN=tu_token_aquí
WHATSAPP_PHONE_NUMBER_ID=tu_phone_id_aquí
```

### 5. Probar envío
El sistema automáticamente usará WhatsApp Business API para:
- Confirmaciones de citas
- Recordatorios 24h antes
- Códigos de cancelación
- Notificaciones de cambios

## Números de prueba gratuitos:
Meta proporciona números gratuitos para desarrollo que puedes usar inmediatamente.

## Limitaciones versión gratuita:
- 1000 conversaciones gratis por mes
- Solo números verificados pueden recibir mensajes
- Ideal para pruebas y pequeños volúmenes

## Para producción:
- Verificación comercial de Meta
- Números ilimitados
- Sin restricciones de usuarios