# Configuración de Google OAuth para EcoFisio

## Error Actual
```
Error 400: redirect_uri_mismatch
```

## URLs de Callback Requeridas

Para que Google OAuth funcione correctamente, necesitas configurar estas URLs en Google Cloud Console:

### Desarrollo
```
https://0c42ff8b-6f8f-415b-b577-79e2871a15d0-00-2j4chxzl71jv4.janeway.replit.dev/api/auth/google/callback
```

### Producción (Deploy)
```
https://ecofisio.replit.app/api/auth/google/callback
```

## Pasos para Configurar

1. **Ir a Google Cloud Console**
   - URL: https://console.cloud.google.com

2. **Seleccionar tu proyecto**
   - Buscar el proyecto que contiene el Client ID: `174897344765-83krjvp0putqsidpc5mvg5ejjo1rhihn.apps.googleusercontent.com`

3. **Navegar a Credenciales**
   - Ir a: APIs y servicios > Credenciales

4. **Editar Cliente OAuth 2.0**
   - Buscar y hacer clic en el cliente OAuth existente

5. **Agregar URLs de Redirección**
   - En la sección "URIs de redireccionamiento autorizados"
   - Agregar ambas URLs mencionadas arriba
   - Asegurarse de que no haya espacios o caracteres extra

6. **Guardar Cambios**
   - Hacer clic en "Guardar"
   - Los cambios pueden tardar 5-10 minutos en aplicarse

## Verificar Configuración

Una vez configurado, puedes probar:
- Desarrollo: `/api/auth/google`
- Producción: `https://ecofisio.replit.app/api/auth/google`

## Notas Importantes

- Los dominios de Replit pueden cambiar
- Si el dominio cambia, necesitarás actualizar las URLs nuevamente
- Mantén ambas URLs (desarrollo y producción) configuradas
- Google OAuth estará deshabilitado hasta completar esta configuración

## Credenciales Actuales

- **Client ID**: `174897344765-83krjvp0putqsidpc5mvg5ejjo1rhihn.apps.googleusercontent.com`
- **Dominio Actual**: `0c42ff8b-6f8f-415b-b577-79e2871a15d0-00-2j4chxzl71jv4.janeway.replit.dev`
- **Deploy URL**: `ecofisio.replit.app`