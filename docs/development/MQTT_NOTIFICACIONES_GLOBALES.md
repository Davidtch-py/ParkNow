# Sistema de Notificaciones MQTT Globales

## 🎯 Objetivo

Implementar un sistema de notificaciones en tiempo real que funcione en toda la aplicación, notificando a:
- **Administradores**: Todas las alertas y eventos
- **Controladores**: Alertas de sus parqueaderos asignados
- **Usuarios**: Notificaciones relevantes

## 📦 Archivos Creados

### 1. `/frontend/src/contexts/MQTTContext.tsx`
Contexto global de MQTT que maneja la conexión y suscripciones.

### 2. `/frontend/src/hooks/useMQTTNotifications.ts`
Hook para suscribirse automáticamente según el rol del usuario.

## 🔧 Integración

### Paso 1: Envolver la App con MQTTProvider

Editar `/frontend/src/App.tsx` o el archivo principal:

```typescript
import { MQTTProvider } from './contexts/MQTTContext';

function App() {
  return (
    <MQTTProvider>
      {/* Resto de la aplicación */}
      <Router>
        <Routes>
          {/* Rutas */}
        </Routes>
      </Router>
    </MQTTProvider>
  );
}
```

### Paso 2: Usar el Hook en Componentes Principales

En componentes como `Dashboard`, `Layout`, o `Home`:

```typescript
import { useMQTTNotifications } from '../hooks/useMQTTNotifications';

function Dashboard() {
  // Esto suscribe automáticamente según el rol
  useMQTTNotifications();
  
  return (
    // Tu componente
  );
}
```

### Paso 3: Usar el Contexto en Componentes Específicos

```typescript
import { useMQTT } from '../contexts/MQTTContext';

function MiComponente() {
  const { subscribe, unsubscribe, isConnected } = useMQTT();
  
  useEffect(() => {
    if (isConnected) {
      subscribe('parknow/mi-topic', (message) => {
        console.log('Mensaje recibido:', message);
      });
      
      return () => unsubscribe('parknow/mi-topic');
    }
  }, [isConnected]);
}
```

## 📡 Topics MQTT

### Topics Generales
- `parknow/notificaciones/general` - Notificaciones generales
- `parknow/notificaciones/capacidad` - Alertas de capacidad
- `parknow/notificaciones/entradas` - Entradas de vehículos
- `parknow/notificaciones/salidas` - Salidas de vehículos
- `parknow/notificaciones/alertas` - Alertas del sistema

### Topics por Parqueadero
- `parknow/parqueadero/{id}/capacidad` - Capacidad específica
- `parknow/parqueadero/{id}/entradas` - Entradas específicas
- `parknow/parqueadero/{id}/salidas` - Salidas específicas

## 🔔 Tipos de Notificaciones

### 1. Capacidad Baja
```json
{
  "type": "CAPACIDAD_BAJA",
  "timestamp": "2025-10-20T05:00:00.000Z",
  "parqueadero": {
    "id": 1,
    "nombre": "Parqueadero Central",
    "capacidadDisponible": 8,
    "capacidadTotal": 200,
    "porcentaje": 4
  },
  "message": "El parqueadero tiene baja capacidad disponible"
}
```

**Notificación mostrada:**
- **Admin**: Toast rojo, no se cierra automáticamente, click para ir a alertas
- **Controlador**: Toast amarillo, 5 segundos, solo si es su parqueadero

### 2. Entrada de Vehículo
```json
{
  "type": "ENTRADA_VEHICULO",
  "timestamp": "2025-10-20T05:00:00.000Z",
  "entrada": {
    "id": 123,
    "vehiculo": { "placa": "ABC123" },
    "parqueadero": { "nombre": "Parqueadero Central" },
    "espacio": 15
  }
}
```

**Notificación mostrada:**
- **Admin/Controlador**: Toast azul, 3 segundos, info de entrada

### 3. Salida de Vehículo
```json
{
  "type": "SALIDA_VEHICULO",
  "timestamp": "2025-10-20T05:00:00.000Z",
  "salida": {
    "id": 456,
    "vehiculo": { "placa": "ABC123" },
    "monto_total": 5000,
    "tiempo_total": 120
  }
}
```

**Notificación mostrada:**
- **Admin/Controlador**: Toast azul, 3 segundos, info de salida y monto

## 🎨 Personalización de Notificaciones

### Por Rol

El contexto MQTT automáticamente filtra y muestra notificaciones según el rol:

```typescript
// En MQTTContext.tsx
const handleGlobalNotification = (topic: string, data: any) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.rol === 'admin') {
    // Mostrar todas las notificaciones
  } else if (user.rol === 'controlador') {
    // Solo notificaciones de sus parqueaderos
  }
};
```

### Configuración de Toast

```typescript
toast.error('Mensaje', {
  autoClose: false,           // No cerrar automáticamente
  position: 'top-right',      // Posición
  onClick: () => {            // Acción al hacer click
    window.location.href = '/ruta';
  }
});
```

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────┐
│  Usuario registra entrada de vehículo   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Backend: EntradaController.registrar() │
│  1. Registra entrada                    │
│  2. Actualiza capacidad                 │
│  3. Verifica umbral (< 25%)             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  mqttService.notificarCapacidadBaja()   │
│  Publica en:                            │
│  - parknow/notificaciones/capacidad     │
│  - parknow/parqueadero/{id}/capacidad   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  Frontend: MQTTContext recibe mensaje   │
│  handleGlobalNotification()             │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│    Admin     │  │ Controlador  │
│              │  │              │
│ Toast Rojo   │  │ Toast Amarillo│
│ No se cierra │  │ 5 segundos   │
│ Click→Alertas│  │              │
└──────────────┘  └──────────────┘
```

## 🧪 Testing

### 1. Verificar Conexión MQTT

Abrir consola del navegador (F12):
```
✅ Conectado a MQTT Broker
📡 Suscrito a: parknow/notificaciones/capacidad
📡 Suscrito a: parknow/notificaciones/entradas
```

### 2. Simular Alerta de Capacidad

```bash
# Registrar múltiples entradas hasta llegar al umbral
curl -X POST http://localhost:3000/api/entradas \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehiculoId": 1,
    "parqueaderoId": 1,
    "espacioAsignado": 15
  }'
```

### 3. Verificar Notificación

Deberías ver en consola:
```
📨 Mensaje MQTT recibido: {topic: "...", data: {...}}
```

Y un toast en pantalla según tu rol.

## 🎯 Ventajas

1. ✅ **Tiempo Real**: Notificaciones instantáneas
2. ✅ **Global**: Funciona en toda la app
3. ✅ **Filtrado por Rol**: Cada usuario ve lo relevante
4. ✅ **Desacoplado**: Componentes no necesitan lógica MQTT
5. ✅ **Escalable**: Fácil agregar nuevos tipos de notificaciones
6. ✅ **Resiliente**: Funciona con polling si MQTT falla

## 🚀 Próximas Mejoras

1. **Persistencia**: Guardar notificaciones en BD
2. **Centro de Notificaciones**: Panel con historial
3. **Preferencias**: Usuario configura qué notificaciones recibir
4. **Push Notifications**: Notificaciones del navegador
5. **Sonidos**: Diferentes sonidos por tipo de alerta
6. **Badges**: Contador de notificaciones no leídas

## 📝 Notas Importantes

- El contexto MQTT se inicializa una sola vez al cargar la app
- Las suscripciones se manejan automáticamente según el rol
- Si MQTT falla, el sistema sigue funcionando con polling
- Las notificaciones se muestran solo si el usuario está autenticado
- Los controladores solo ven notificaciones de sus parqueaderos

---

**Estado**: ✅ Implementado
**Versión**: 1.0
**Fecha**: 20 de Octubre, 2025
