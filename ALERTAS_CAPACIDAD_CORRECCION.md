# Corrección: Alertas de Capacidad con Datos Reales y MQTT

## Problema Identificado

El componente `AlertasCapacidad.tsx` estaba usando datos **mock/quemados** y no tenía integración con MQTT para recibir notificaciones en tiempo real.

## Cambios Realizados

### 1. Imports Agregados

```typescript
import { parqueaderoService } from '../services/index';
import mqtt from 'mqtt';
```

### 2. Estado MQTT Agregado

```typescript
const [mqttClient, setMqttClient] = useState<any>(null);
```

### 3. Función `cargarAlertas()` Actualizada

**Antes (Mock):**
```typescript
const alertasMock: AlertaCapacidad[] = [
  {
    id: 1,
    nombreParqueadero: 'Parqueadero Central',
    capacidadTotal: 200,
    capacidadDisponible: 8,
    // ... datos hardcodeados
  }
];
setAlertas(alertasMock);
```

**Ahora (Backend Real):**
```typescript
// Obtener parqueaderos con capacidad baja desde el backend
const response = await parqueaderoService.getCapacidadBaja(configuracion.umbralMedio);

if (response.success && response.parqueaderos) {
  const alertasNuevas: AlertaCapacidad[] = response.parqueaderos.map((p: any) => {
    const porcentajeOcupado = Math.round(
      ((p.capacidad_total - p.capacidad_disponible) / p.capacidad_total) * 100
    );
    
    let nivel: 'critico' | 'alto' | 'medio' = 'medio';
    if (porcentajeOcupado >= configuracion.umbralCritico) {
      nivel = 'critico';
    } else if (porcentajeOcupado >= configuracion.umbralAlto) {
      nivel = 'alto';
    }

    return {
      id: p.id,
      parqueaderoId: p.id,
      nombreParqueadero: p.nombre,
      direccion: p.direccion,
      capacidadTotal: p.capacidad_total,
      capacidadDisponible: p.capacidad_disponible,
      porcentajeOcupado,
      nivel,
      fechaAlerta: new Date().toISOString(),
      leida: false
    };
  });

  setAlertas(alertasNuevas);
}
```

### 4. Integración MQTT Agregada

```typescript
useEffect(() => {
  const client = mqtt.connect('ws://localhost:8883');

  client.on('connect', () => {
    console.log('✅ Conectado a MQTT');
    // Suscribirse al topic de notificaciones de capacidad
    client.subscribe('parknow/notificaciones/capacidad', (err) => {
      if (!err) {
        console.log('📡 Suscrito a alertas de capacidad');
      }
    });
  });

  client.on('message', (topic, message) => {
    const notification = JSON.parse(message.toString());
    
    if (notification.type === 'CAPACIDAD_BAJA') {
      // Recargar alertas cuando llega una notificación
      cargarAlertas();
    }
  });

  setMqttClient(client);

  return () => {
    if (client) {
      client.end();
    }
  };
}, []);
```

### 5. Notificaciones Mejoradas

```typescript
if (alertasCriticasNuevas.length > 0 && configuracion.notificacionesActivas) {
  toast.error(`¡${alertasCriticasNuevas.length} parqueadero(s) con capacidad crítica!`, {
    autoClose: false  // No cerrar automáticamente
  });
  
  if (configuracion.sonidoActivo) {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});
  }
}
```

## Instalación Requerida

### Instalar Paquete MQTT

```bash
cd frontend
npm install mqtt
```

O si usas yarn:

```bash
cd frontend
yarn add mqtt
```

## Endpoints Utilizados

### Backend API

```typescript
GET /api/parqueaderos/alertas/capacidad-baja?umbral=75
Response: {
  success: true,
  parqueaderos: [
    {
      id: 1,
      nombre: "Parqueadero Central",
      direccion: "Calle 100 #15-30",
      capacidad_total: 200,
      capacidad_disponible: 8
    }
  ]
}
```

### MQTT Topics

**Suscripción:**
- `parknow/notificaciones/capacidad` - Notificaciones generales de capacidad

**Formato del Mensaje:**
```json
{
  "type": "CAPACIDAD_BAJA",
  "timestamp": "2025-10-20T05:10:00.000Z",
  "parqueadero": {
    "id": 1,
    "nombre": "Parqueadero Central",
    "capacidadDisponible": 8,
    "capacidadTotal": 200,
    "porcentaje": 4
  },
  "message": "El parqueadero Parqueadero Central tiene baja capacidad disponible"
}
```

## Niveles de Alerta

### Configuración por Defecto

```typescript
{
  umbralCritico: 95,  // >= 95% ocupado
  umbralAlto: 85,     // >= 85% ocupado
  umbralMedio: 75     // >= 75% ocupado
}
```

### Clasificación

| Nivel | Porcentaje Ocupado | Color | Icono |
|-------|-------------------|-------|-------|
| **Crítico** | >= 95% | Rojo | 🔴 |
| **Alto** | >= 85% | Naranja | 🟠 |
| **Medio** | >= 75% | Amarillo | 🟡 |

## Flujo de Datos

```
┌─────────────────────────────────────────┐
│         Frontend React                  │
│                                         │
│  1. Carga inicial: cargarAlertas()      │
│  2. Polling cada 5 min                  │
│  3. Escucha MQTT en tiempo real         │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Backend API + MQTT Broker          │
│                                         │
│  GET /api/parqueaderos/alertas/...     │
│  Publica en: parknow/notificaciones/... │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Base de Datos                      │
│                                         │
│  SELECT * FROM parqueaderos             │
│  WHERE capacidad_disponible < umbral    │
└─────────────────────────────────────────┘
```

## Flujo MQTT

```
┌──────────────────┐
│  Entrada/Salida  │
│   de Vehículo    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Backend calcula │
│   capacidad      │
└────────┬─────────┘
         │
         ▼
    ¿Capacidad
      baja?
         │
    ┌────┴────┐
   NO         SÍ
    │          │
    │          ▼
    │    ┌──────────────────┐
    │    │ mqttService      │
    │    │ .notificarCapa.. │
    │    └────────┬─────────┘
    │             │
    │             ▼
    │    ┌──────────────────┐
    │    │  MQTT Broker     │
    │    │  Publica mensaje │
    │    └────────┬─────────┘
    │             │
    │             ▼
    │    ┌──────────────────┐
    │    │  Frontend recibe │
    │    │  Recarga alertas │
    │    └──────────────────┘
    │
    └──────> Fin
```

## Características

### ✅ Datos Reales
- Obtiene parqueaderos desde el backend
- Calcula porcentajes de ocupación en tiempo real
- Clasifica por niveles según umbrales configurables

### ✅ Tiempo Real con MQTT
- Conexión WebSocket a broker MQTT
- Recibe notificaciones instantáneas
- Actualiza alertas automáticamente

### ✅ Notificaciones
- Toast para alertas críticas
- Sonido opcional (si está habilitado)
- No se cierran automáticamente las críticas

### ✅ Filtros
- Por nivel: Crítico, Alto, Medio, Todos
- Por estado: Leídas, No leídas, Todas
- Combinables

### ✅ Configuración
- Umbrales personalizables
- Activar/desactivar notificaciones
- Activar/desactivar sonido
- Intervalo de actualización configurable

## Verificación

### 1. Backend Funcionando
```bash
# Verificar que el backend esté corriendo
curl http://localhost:3000/api/parqueaderos/alertas/capacidad-baja?umbral=75
```

### 2. MQTT Broker Activo
```bash
# Verificar logs del backend
# Deberías ver:
# 🔌 Broker MQTT iniciado en puerto 1883
# 🌐 Broker MQTT WebSocket iniciado en puerto 8883
```

### 3. Frontend Conectado
```javascript
// Abrir consola del navegador (F12)
// Deberías ver:
// ✅ Conectado a MQTT
// 📡 Suscrito a alertas de capacidad
```

### 4. Probar Notificación
```bash
# Simular entrada de vehículo que cause capacidad baja
curl -X POST http://localhost:3000/api/entradas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "vehiculoId": 1,
    "parqueaderoId": 1,
    "espacioId": 1,
    "usuarioId": 1
  }'
```

## Manejo de Errores

### Error de Conexión MQTT
```typescript
client.on('error', (error) => {
  console.error('❌ Error MQTT:', error);
  // El componente sigue funcionando con polling
});
```

### Error al Cargar Alertas
```typescript
catch (error) {
  console.error('Error cargando alertas:', error);
  toast.error('Error cargando alertas de capacidad');
  // Reintentará en el próximo intervalo
}
```

### Reconexión Automática
MQTT.js maneja reconexión automática por defecto.

## Próximas Mejoras

1. **Persistencia de Alertas**: Guardar alertas en BD
2. **Historial**: Ver alertas pasadas
3. **Exportar**: Descargar reporte de alertas
4. **Notificaciones Push**: Usar Web Push API
5. **Múltiples Umbrales**: Diferentes umbrales por parqueadero
6. **Predicción**: ML para predecir cuándo se llenará
7. **Gráficos**: Visualizar tendencias de ocupación

## Archivos Modificados

- ✅ `/frontend/src/views/AlertasCapacidad.tsx`
- 📦 Requiere: `npm install mqtt`

## Archivos Backend (Ya Existentes)

- ✅ `/backend/presentation/ParqueaderoController.js` - Endpoint capacidad-baja
- ✅ `/backend/infrastructure/mqttService.js` - Servicio MQTT
- ✅ `/backend/server.js` - Inicialización MQTT

---

¡Las alertas ahora funcionan con datos reales y notificaciones en tiempo real! 🎉
