# 🧪 Botón de Prueba MQTT

## Ubicación
**Vista:** Alertas de Capacidad (`/parknow-alertas`)

## Función
Simula una alerta de capacidad baja en un parqueadero aleatorio y la envía a través de MQTT para que **todos los usuarios conectados** la reciban en tiempo real.

## Cómo Funciona

### 1. Al Hacer Click
```typescript
simularAlertaCapacidad()
```

### 2. Proceso
1. ✅ Obtiene todos los parqueaderos del backend
2. ✅ Selecciona uno al azar
3. ✅ Simula capacidad al 5% (crítico)
4. ✅ Crea notificación MQTT
5. ✅ Publica en `parknow/notificaciones/capacidad`
6. ✅ **Todos los clientes conectados reciben la notificación**

### 3. Resultado

**En el Cliente que Hace Click:**
- Toast verde: "🧪 Alerta simulada enviada: [Nombre] (5% disponible)"

**En TODOS los Clientes Conectados:**
- **Admin**: Toast rojo que no se cierra, click para ir a alertas
- **Controlador**: Toast amarillo, 5 segundos

## Estructura de la Notificación

```json
{
  "type": "CAPACIDAD_BAJA",
  "timestamp": "2025-10-20T05:45:00.000Z",
  "parqueadero": {
    "id": 2,
    "nombre": "Parqueadero Norte",
    "capacidadDisponible": 7,
    "capacidadTotal": 150,
    "porcentaje": 5
  },
  "message": "[SIMULACIÓN] El parqueadero Parqueadero Norte tiene baja capacidad disponible"
}
```

## Prueba Multi-Cliente

### Escenario de Prueba

1. **Abrir 3 navegadores/pestañas:**
   - Navegador 1: Admin logueado
   - Navegador 2: Controlador logueado
   - Navegador 3: Otro admin/controlador

2. **En cualquier navegador:**
   - Ir a Alertas de Capacidad
   - Click en "🧪 Simular Alerta"

3. **Observar:**
   - ✅ **Navegador 1** (Admin): Toast rojo aparece
   - ✅ **Navegador 2** (Controlador): Toast amarillo aparece
   - ✅ **Navegador 3**: Toast aparece según rol
   - ✅ Consola de todos muestra: `📨 Mensaje MQTT recibido`

## Logs en Consola

### Cliente que Envía
```
🧪 Alerta simulada enviada: Parqueadero Norte (5% disponible)
📤 Publicado en: parknow/notificaciones/capacidad
```

### Clientes que Reciben
```
📨 Mensaje MQTT recibido: {topic: "parknow/notificaciones/capacidad", data: {...}}
📨 Alerta de capacidad recibida: {...}
```

### Backend (Broker MQTT)
```
✅ Mensaje publicado en parknow/notificaciones/capacidad
```

## Casos de Uso

### ✅ Caso 1: MQTT Conectado
- Notificación se envía a **todos** los clientes
- Aparece en tiempo real
- Se ve en múltiples navegadores/dispositivos

### ⚠️ Caso 2: MQTT Desconectado
- Toast warning: "MQTT no está conectado"
- Notificación solo se muestra localmente
- No llega a otros clientes

## Diferencias con Alertas Reales

| Aspecto | Alerta Real | Alerta Simulada |
|---------|-------------|-----------------|
| **Origen** | Backend al registrar entrada | Frontend con botón |
| **Capacidad** | Real del parqueadero | Simulada al 5% |
| **Persistencia** | Se guarda en BD | Solo en memoria |
| **Mensaje** | Normal | Prefijo "[SIMULACIÓN]" |
| **MQTT** | Sí | Sí |

## Código del Botón

```tsx
<button
  onClick={simularAlertaCapacidad}
  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 border-2 border-purple-400"
  title="Simular alerta de capacidad baja para pruebas MQTT"
>
  <Bell className="size-4 mr-2" />
  🧪 Simular Alerta
</button>
```

## Función Principal

```typescript
const simularAlertaCapacidad = async () => {
  // 1. Obtener parqueaderos
  const response = await parqueaderoService.getAll();
  
  // 2. Seleccionar uno al azar
  const parqueaderoAleatorio = response.parqueaderos[
    Math.floor(Math.random() * response.parqueaderos.length)
  ];
  
  // 3. Crear notificación
  const notificacionSimulada = {
    type: 'CAPACIDAD_BAJA',
    parqueadero: {
      id: parqueaderoAleatorio.id,
      nombre: parqueaderoAleatorio.nombre,
      porcentaje: 5
    }
  };
  
  // 4. Publicar en MQTT
  if (isConnected) {
    publish('parknow/notificaciones/capacidad', notificacionSimulada);
  }
  
  // 5. Recargar alertas
  await cargarAlertas();
};
```

## Verificación

### 1. Backend Corriendo
```bash
# Terminal
cd backend
npm run dev

# Deberías ver:
🔌 Broker MQTT iniciado en puerto 1883
🌐 Broker MQTT WebSocket iniciado en puerto 8883
```

### 2. Frontend Conectado
```javascript
// Consola del navegador (F12)
✅ Conectado a MQTT Broker
📡 Suscrito a: parknow/notificaciones/capacidad
```

### 3. Hacer Click en Botón
```javascript
// Consola
🧪 Alerta simulada enviada: Parqueadero Norte (5% disponible)
📤 Publicado en: parknow/notificaciones/capacidad
```

### 4. Otros Clientes Reciben
```javascript
// Consola de otros navegadores
📨 Mensaje MQTT recibido: {...}
📨 Alerta de capacidad recibida: {...}
```

## Troubleshooting

### Problema: No llega a otros clientes
**Causa:** MQTT no está conectado
**Solución:** 
1. Verificar que backend esté corriendo
2. Verificar puerto 8883 disponible
3. Revisar consola: debe decir "✅ Conectado a MQTT"

### Problema: Error al simular
**Causa:** No hay parqueaderos en BD
**Solución:**
```bash
# Reiniciar BD con datos de prueba
cd backend
npm run dev
```

### Problema: Solo aparece localmente
**Causa:** `isConnected = false`
**Solución:** Esperar a que MQTT se conecte (5 segundos de reintento)

## Notas Importantes

1. ⚠️ **Es temporal**: Este botón es solo para pruebas
2. 🔄 **No persiste**: La alerta simulada no se guarda en BD
3. 📡 **Requiere MQTT**: Si MQTT falla, solo funciona localmente
4. 🎲 **Aleatorio**: Cada click selecciona un parqueadero diferente
5. 🧪 **Prefijo [SIMULACIÓN]**: Para distinguir de alertas reales

## Eliminar el Botón

Cuando ya no lo necesites, simplemente elimina estas líneas:

```tsx
{/* 🧪 BOTÓN DE PRUEBA TEMPORAL */}
<button onClick={simularAlertaCapacidad} ...>
  ...
</button>
```

Y la función:
```typescript
const simularAlertaCapacidad = async () => { ... };
```

---

**Estado**: ✅ Implementado
**Propósito**: Pruebas de MQTT multi-cliente
**Temporal**: Sí
