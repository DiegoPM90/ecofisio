# Configuración de MongoDB Atlas para Ecofisio

## Pasos para Configurar MongoDB Atlas

### 1. Crear Cuenta en MongoDB Atlas
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Crear un Cluster
1. Selecciona "Create a New Cluster"
2. Elige el plan **M0 Sandbox (FREE)**
3. Selecciona región más cercana (US East, Europe, etc.)
4. Nombre del cluster: `ecofisio-cluster`
5. Haz clic en "Create Cluster"

### 3. Configurar Acceso a la Base de Datos
1. En el panel izquierdo, ve a "Database Access"
2. Haz clic en "Add New Database User"
3. Crea un usuario:
   - Username: `ecofisio_user`
   - Password: [genera una contraseña segura]
   - Database User Privileges: "Read and write to any database"
4. Haz clic en "Add User"

### 4. Configurar Acceso de Red
1. Ve a "Network Access" en el panel izquierdo
2. Haz clic en "Add IP Address"
3. Selecciona "Allow Access from Anywhere" (0.0.0.0/0)
4. Haz clic en "Confirm"

### 5. Obtener la Cadena de Conexión
1. Ve a "Clusters" en el panel izquierdo
2. Haz clic en "Connect" en tu cluster
3. Selecciona "Connect your application"
4. Copia la cadena de conexión, se verá así:
```
mongodb+srv://ecofisio_user:<password>@ecofisio-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 6. Configurar Variable de Entorno
1. En Replit, ve a la pestaña "Secrets" (🔒)
2. Agrega un nuevo secreto:
   - Key: `MONGODB_URI`
   - Value: [pega la cadena de conexión completa]
3. Reemplaza `<password>` con la contraseña real del usuario

### Ejemplo de MONGODB_URI:
```
mongodb+srv://ecofisio_user:mi_contraseña_segura@ecofisio-cluster.abc123.mongodb.net/ecofisio?retryWrites=true&w=majority
```

## Verificación
Una vez configurado, reinicia la aplicación. Verás en los logs:
```
✅ Conectado exitosamente a MongoDB Atlas
📊 Base de datos: ecofisio - Tamaño: 0.00 MB
```

## Ventajas de MongoDB Atlas
- **Persistencia real**: Los datos no se pierden al reiniciar
- **Escalabilidad automática**: Crece con tu negocio
- **Backups automáticos**: Recuperación de datos incluida
- **Interfaz web**: MongoDB Compass para visualizar datos
- **Búsquedas avanzadas**: Queries flexibles por fecha, estado, paciente
- **Métricas en tiempo real**: Monitoreo de rendimiento

## Visualización de Datos
Una vez configurado MongoDB Atlas, puedes visualizar tus citas de estas formas:

### 1. MongoDB Atlas Dashboard
- Ve a tu cluster en MongoDB Atlas
- Haz clic en "Browse Collections"
- Verás la colección `appointments` con todas las citas

### 2. API Endpoints (siguen funcionando igual)
```bash
# Todas las citas con estadísticas
GET /api/admin/appointments

# Cita específica
GET /api/appointments/status/{token}
```

### 3. Interfaz Web de la Aplicación
- La lista de citas se actualiza automáticamente
- Filtros por estado: Confirmada, Cancelada, Completada
- Búsqueda por paciente, fecha, especialidad

## Solución de Problemas
- Si ves "Usando almacenamiento en memoria", verifica que MONGODB_URI esté configurado
- Si hay error de conexión, verifica que la IP esté en la lista blanca
- Si hay error de autenticación, verifica usuario y contraseña