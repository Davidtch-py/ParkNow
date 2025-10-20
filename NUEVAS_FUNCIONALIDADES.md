# Nuevas Funcionalidades Implementadas - ParkNow

## 1. Sistema de Roles y Asignación de Parqueaderos

### Descripción
Se implementó un sistema completo de roles y permisos que permite asignar parqueaderos específicos a controladores.

### Características
- **Roles**: ADMIN y CONTROLADOR
- **Asignación flexible**: Un controlador puede tener acceso a múltiples parqueaderos
- **Control de acceso**: Middleware que verifica permisos por parqueadero
- **Gestión centralizada**: Los administradores pueden asignar/desasignar controladores

### Endpoints Nuevos
```
POST   /api/parqueaderos-usuarios/asignar
POST   /api/parqueaderos-usuarios/desasignar
GET    /api/parqueaderos-usuarios/controlador/:idUsuario?
GET    /api/parqueaderos-usuarios/parqueadero/:idParqueadero
GET    /api/parqueaderos-usuarios/controladores
```

### Uso
```javascript
// Asignar controlador a parqueadero
POST /api/parqueaderos-usuarios/asignar
{
  "idParqueadero": 1,
  "idUsuario": 5
}

// Obtener parqueaderos de un controlador
GET /api/parqueaderos-usuarios/controlador/5
```

### Middleware de Permisos
```javascript
import { parqueaderoAccessMiddleware } from './infrastructure/authMiddleware.js';

// Aplicar en rutas que requieran acceso específico a parqueadero
app.post('/api/entradas', authMiddleware, parqueaderoAccessMiddleware, ...);
```

---

## 2. Sistema de Festivos en Horarios

### Descripción
Se agregó soporte completo para días festivos, permitiendo configurar horarios especiales para estos días.

### Características
- **Tabla de festivos**: Base de datos con festivos de Colombia
- **Horarios especiales**: Configurar horarios diferentes para festivos
- **Función SQL**: `es_fecha_festivo(fecha)` para verificar si una fecha es festivo
- **Función avanzada**: `obtener_horario_aplicable(parqueadero, fecha)` que retorna el horario correcto según el día

### Endpoints Nuevos
```
GET    /api/festivos
GET    /api/festivos/verificar?fecha=2024-12-25
POST   /api/festivos/sincronizar/auto          - Sincronizar año actual y siguiente
POST   /api/festivos/sincronizar/:year         - Sincronizar año específico
GET    /api/festivos/:id
POST   /api/festivos
PUT    /api/festivos/:id
DELETE /api/festivos/:id
```

### Sincronización con API de Colombia

El sistema se integra con la **API oficial de Colombia** (https://api-colombia.com) para obtener automáticamente los festivos oficiales.

```javascript
// Sincronizar festivos del año actual y siguiente automáticamente
POST /api/festivos/sincronizar/auto
// Response:
{
  "success": true,
  "resultados": [
    {
      "success": true,
      "year": 2025,
      "total": 20,
      "insertados": 18,
      "actualizados": 2,
      "errores": 0
    },
    {
      "success": true,
      "year": 2026,
      "total": 18,
      "insertados": 18,
      "actualizados": 0,
      "errores": 0
    }
  ]
}

// Sincronizar festivos de un año específico
POST /api/festivos/sincronizar/2025
// Response:
{
  "success": true,
  "year": 2025,
  "total": 20,
  "insertados": 18,
  "actualizados": 2,
  "errores": 0
}
```

### Uso Manual
```javascript
// Crear un festivo manualmente
POST /api/festivos
{
  "nombre": "Día de la Independencia",
  "fecha": "2024-07-20",
  "descripcion": "Independencia de Colombia"
}

// Verificar si una fecha es festivo
GET /api/festivos/verificar?fecha=2024-12-25
// Response: { "success": true, "fecha": "2024-12-25", "esFestivo": true }

// Obtener festivos de un año específico
GET /api/festivos?year=2025

// Crear horario para festivos
POST /api/horarios
{
  "id_parqueadero": 1,
  "dia_semana": "FESTIVO",
  "hora_apertura": "09:00",
  "hora_cierre": "18:00",
  "es_festivo": true
}
```

### Base de Datos
```sql
-- Verificar si una fecha es festivo
SELECT es_fecha_festivo('2024-12-25');

-- Obtener horario aplicable para una fecha
SELECT * FROM obtener_horario_aplicable(1, '2024-12-25');
```

---

## 3. Sistema MQTT para Notificaciones en Tiempo Real

### Descripción
Se implementó un broker MQTT integrado que permite notificaciones en tiempo real para el sistema, preparado para futura integración con sensores IoT.

### Características
- **Broker MQTT integrado**: Usando Aedes
- **Soporte WebSocket**: Para clientes web en puerto 8883
- **Soporte TCP**: Para dispositivos IoT en puerto 1883
- **Topics organizados**: Sistema de topics jerárquico
- **Notificaciones automáticas**: Se envían al registrar entradas/salidas

### Arquitectura MQTT

#### Topics Disponibles
```
parknow/notificaciones/capacidad     - Alertas de capacidad baja
parknow/notificaciones/entradas      - Notificaciones de entradas
parknow/notificaciones/salidas       - Notificaciones de salidas
parknow/notificaciones/alertas       - Alertas generales
parknow/parqueadero/{id}/capacidad   - Capacidad de parqueadero específico
parknow/parqueadero/{id}/entradas    - Entradas de parqueadero específico
parknow/parqueadero/{id}/salidas     - Salidas de parqueadero específico
```

### Endpoints Nuevos
```
GET    /api/notificaciones/config    - Configuración para conectar clientes
GET    /api/notificaciones/stats     - Estadísticas del broker
POST   /api/notificaciones/prueba    - Enviar notificación de prueba
```

### Configuración
```env
# .env
MQTT_PORT=1883        # Puerto TCP para dispositivos
MQTT_WS_PORT=8883     # Puerto WebSocket para web
```

### Uso en Frontend (Ejemplo con MQTT.js)

#### Instalación
```bash
npm install mqtt
```

#### Código de Conexión
```javascript
import mqtt from 'mqtt';

// Conectar al broker
const client = mqtt.connect('ws://localhost:8883');

client.on('connect', () => {
  console.log('Conectado al broker MQTT');
  
  // Suscribirse a notificaciones
  client.subscribe('parknow/notificaciones/#');
  client.subscribe('parknow/parqueadero/1/#');
});

client.on('message', (topic, message) => {
  const notification = JSON.parse(message.toString());
  console.log('Notificación recibida:', notification);
  
  // Manejar según el tipo
  switch(notification.type) {
    case 'ENTRADA_VEHICULO':
      mostrarNotificacionEntrada(notification);
      break;
    case 'SALIDA_VEHICULO':
      mostrarNotificacionSalida(notification);
      break;
    case 'CAPACIDAD_BAJA':
      mostrarAlertaCapacidad(notification);
      break;
  }
});
```

### Formato de Notificaciones

#### Entrada de Vehículo
```json
{
  "type": "ENTRADA_VEHICULO",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "entrada": {
    "id": 123,
    "vehiculo": { "placa": "ABC123", "tipo": "carro" },
    "parqueadero": { "id": 1, "nombre": "Parqueadero Centro" },
    "espacio": 15,
    "fechaHora": "2024-01-15T10:30:00.000Z"
  },
  "message": "Vehículo ABC123 ingresó al parqueadero"
}
```

#### Salida de Vehículo
```json
{
  "type": "SALIDA_VEHICULO",
  "timestamp": "2024-01-15T12:30:00.000Z",
  "salida": {
    "id": 456,
    "vehiculo": { "placa": "ABC123" },
    "parqueadero": { "id": 1, "nombre": "Parqueadero Centro" },
    "monto": 5000,
    "fechaHora": "2024-01-15T12:30:00.000Z"
  },
  "message": "Vehículo ABC123 salió del parqueadero"
}
```

#### Capacidad Baja
```json
{
  "type": "CAPACIDAD_BAJA",
  "timestamp": "2024-01-15T14:00:00.000Z",
  "parqueadero": {
    "id": 1,
    "nombre": "Parqueadero Centro",
    "capacidadDisponible": 5,
    "capacidadTotal": 100,
    "porcentaje": 5
  },
  "message": "El parqueadero Parqueadero Centro tiene baja capacidad disponible"
}
```

### Integración Automática
Las notificaciones se envían automáticamente cuando:
- Se registra una entrada de vehículo
- Se registra una salida de vehículo
- Se detecta capacidad baja en un parqueadero

### Preparación para Sensores IoT
El sistema está preparado para conectar sensores que publiquen en topics como:
```
parknow/sensor/{id}/ocupacion    - Estado de ocupación de espacio
parknow/sensor/{id}/barrera      - Estado de barrera de entrada/salida
parknow/sensor/{id}/camara       - Detección de placas por cámara
```

---

## Instalación de Dependencias

### Backend
```bash
cd backend
npm install
```

Las nuevas dependencias agregadas:
- `mqtt`: Cliente MQTT
- `aedes`: Broker MQTT
- `ws`: WebSocket server

### Base de Datos
Ejecutar el script actualizado:
```bash
psql -U postgres -d parqueadero_db -f database/init.sql
```

---

## Pruebas

### 1. Probar Asignación de Parqueaderos
```bash
# Obtener todos los controladores
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/parqueaderos-usuarios/controladores

# Asignar controlador a parqueadero
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"idParqueadero": 1, "idUsuario": 2}' \
  http://localhost:3000/api/parqueaderos-usuarios/asignar
```

### 2. Probar Festivos
```bash
# Sincronizar festivos automáticamente (año actual y siguiente)
curl -X POST -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/festivos/sincronizar/auto

# Sincronizar festivos de un año específico
curl -X POST -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/festivos/sincronizar/2025

# Listar festivos
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/festivos

# Listar festivos de un año específico
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/festivos?year=2025"

# Verificar si es festivo
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/festivos/verificar?fecha=2025-12-25"
```

### 3. Probar MQTT
```bash
# Obtener configuración MQTT
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/notificaciones/config

# Enviar notificación de prueba
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tipo": "TEST", "mensaje": "Prueba de notificación"}' \
  http://localhost:3000/api/notificaciones/prueba

# Ver estadísticas del broker
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/notificaciones/stats
```

### 4. Probar con Cliente MQTT
```bash
# Instalar mosquitto-clients
sudo apt-get install mosquitto-clients  # Linux
brew install mosquitto                  # Mac

# Suscribirse a notificaciones
mosquitto_sub -h localhost -p 1883 -t "parknow/#" -v

# En otra terminal, registrar una entrada para ver la notificación
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vehiculoId": 1, "parqueaderoId": 1, "espacioAsignado": 10}' \
  http://localhost:3000/api/entradas
```

---

## Notas Importantes

### Sobre .gitignore en Frontend
**Es una buena práctica** tener un `.gitignore` en el frontend. Esto evita:
- Subir `node_modules` (puede ser >100MB)
- Subir archivos compilados (`/build`, `/dist`)
- Subir archivos de configuración local (`.env.local`)
- Subir archivos del sistema (`.DS_Store`, `Thumbs.db`)

El `.gitignore` actual es estándar para proyectos React/Node.js y está correctamente configurado.

### Seguridad
- Todos los endpoints de administración requieren rol ADMIN
- Los controladores solo pueden acceder a sus parqueaderos asignados
- El broker MQTT está en modo desarrollo (sin autenticación)
- Para producción, configurar autenticación MQTT

### Próximos Pasos Sugeridos
1. Implementar autenticación en el broker MQTT
2. Crear componentes React para mostrar notificaciones en tiempo real
3. Agregar panel de administración para gestionar asignaciones
4. Implementar sistema de logs de notificaciones
5. Conectar sensores IoT reales

---

## Soporte
Para dudas o problemas, revisar los logs del servidor:
```bash
npm run dev
```

Los logs mostrarán:
- ✅ Conexiones MQTT exitosas
- 📬 Suscripciones a topics
- 📤 Mensajes publicados
- ❌ Errores de conexión
