# Sistema de Festivos con API de Colombia

## Descripción

El sistema de gestión de festivos se integra con la **API oficial de Colombia** (https://api-colombia.com) para obtener automáticamente los días festivos oficiales del país.

## Características

- ✅ Sincronización automática desde API oficial
- ✅ Actualización inteligente (no duplica festivos existentes)
- ✅ Soporte para múltiples años
- ✅ Gestión manual de festivos adicionales
- ✅ Verificación rápida si una fecha es festivo
- ✅ Integración con sistema de horarios

## API de Colombia

### Endpoint
```
GET https://api-colombia.com/api/v1/Holiday/year/{year}
```

### Ejemplo de Respuesta
```json
[
  {
    "date": "2025-01-01T00:00:00",
    "name": "Año Nuevo"
  },
  {
    "date": "2025-01-06T00:00:00",
    "name": "Día de los Reyes Magos"
  },
  ...
]
```

## Uso

### 1. Sincronización Automática

Sincroniza los festivos del año actual y el siguiente:

```bash
curl -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/festivos/sincronizar/auto
```

**Respuesta:**
```json
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
```

### 2. Sincronización por Año

Sincroniza los festivos de un año específico:

```bash
curl -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/festivos/sincronizar/2025
```

**Respuesta:**
```json
{
  "success": true,
  "year": 2025,
  "total": 20,
  "insertados": 18,
  "actualizados": 2,
  "errores": 0
}
```

### 3. Listar Festivos

```bash
# Todos los festivos
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/festivos

# Festivos de un año específico
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/festivos?year=2025"
```

### 4. Verificar si una Fecha es Festivo

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/festivos/verificar?fecha=2025-12-25"
```

**Respuesta:**
```json
{
  "success": true,
  "fecha": "2025-12-25",
  "esFestivo": true
}
```

## Integración con Horarios

Los festivos se integran automáticamente con el sistema de horarios. Puedes configurar horarios especiales para días festivos:

```bash
curl -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_parqueadero": 1,
    "dia_semana": "FESTIVO",
    "hora_apertura": "09:00",
    "hora_cierre": "18:00",
    "es_festivo": true,
    "activo": true
  }' \
  http://localhost:3000/api/horarios
```

### Función SQL para Obtener Horario Aplicable

El sistema incluye una función SQL que determina automáticamente el horario correcto según si la fecha es festivo o no:

```sql
-- Obtener horario para una fecha específica
SELECT * FROM obtener_horario_aplicable(1, '2025-12-25');

-- Retorna:
-- id | hora_apertura | hora_cierre | tipo_dia
-- ---|---------------|-------------|----------
-- 15 | 09:00:00      | 18:00:00    | FESTIVO
```

## Lógica de Sincronización

1. **Obtención**: Se consulta la API de Colombia para el año especificado
2. **Procesamiento**: Cada festivo se procesa individualmente
3. **Inserción**: Si el festivo no existe, se inserta
4. **Actualización**: Si ya existe (misma fecha), se actualiza el nombre y descripción
5. **Reporte**: Se genera un resumen con estadísticas

### Logs del Servidor

Durante la sincronización, verás logs detallados:

```
📅 Sincronizando festivos de Colombia para el año 2025...
  ✅ Insertado: Año Nuevo - 2025-01-01
  ✅ Insertado: Día de los Reyes Magos - 2025-01-06
  🔄 Actualizado: Navidad - 2025-12-25
  ...

📊 Resumen de sincronización 2025:
   ✅ Insertados: 18
   🔄 Actualizados: 2
   ❌ Errores: 0
   📝 Total procesados: 20
```

## Gestión Manual

Además de la sincronización automática, puedes gestionar festivos manualmente:

### Crear Festivo
```bash
curl -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Día Especial",
    "fecha": "2025-06-15",
    "descripcion": "Festivo local o especial"
  }' \
  http://localhost:3000/api/festivos
```

### Actualizar Festivo
```bash
curl -X PUT \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Día Especial Actualizado",
    "descripcion": "Nueva descripción"
  }' \
  http://localhost:3000/api/festivos/5
```

### Eliminar Festivo
```bash
curl -X DELETE \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/festivos/5
```

## Casos de Uso

### 1. Configuración Inicial del Sistema
```bash
# Al instalar el sistema, sincronizar festivos actuales
curl -X POST -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/festivos/sincronizar/auto
```

### 2. Actualización Anual
```bash
# A principios de cada año, sincronizar el nuevo año
curl -X POST -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:3000/api/festivos/sincronizar/2026
```

### 3. Verificación en Tiempo Real
```javascript
// En el frontend, verificar si hoy es festivo
const hoy = new Date().toISOString().split('T')[0];
const response = await fetch(
  `/api/festivos/verificar?fecha=${hoy}`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const { esFestivo } = await response.json();

if (esFestivo) {
  mostrarMensaje('Hoy es día festivo - Horario especial');
}
```

### 4. Mostrar Próximos Festivos
```javascript
// Obtener festivos del año actual
const year = new Date().getFullYear();
const response = await fetch(
  `/api/festivos?year=${year}`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const { festivos } = await response.json();

// Filtrar festivos futuros
const hoy = new Date();
const proximosFestivos = festivos
  .filter(f => new Date(f.fecha) > hoy)
  .slice(0, 5);
```

## Ventajas de Usar la API

1. **Actualización Automática**: No necesitas actualizar manualmente los festivos cada año
2. **Datos Oficiales**: Información verificada y oficial de Colombia
3. **Incluye Festivos Trasladados**: La API incluye los festivos que se trasladan al lunes
4. **Mantenimiento Reducido**: No hay que preocuparse por cambios en el calendario
5. **Escalable**: Fácil sincronizar múltiples años

## Consideraciones

- ⚠️ Requiere conexión a internet para sincronizar
- ⚠️ Solo usuarios ADMIN pueden sincronizar festivos
- ⚠️ La sincronización no elimina festivos existentes, solo inserta/actualiza
- ⚠️ Los festivos manuales no se sobrescriben si tienen fecha diferente

## Troubleshooting

### Error: "Error al obtener festivos"
- Verificar conexión a internet
- Verificar que la API de Colombia esté disponible
- Revisar logs del servidor para más detalles

### Festivos Duplicados
- El sistema previene duplicados por fecha
- Si hay duplicados, eliminar manualmente los incorrectos

### Festivo No Aparece
- Verificar que se sincronizó el año correcto
- Verificar que la fecha esté en formato YYYY-MM-DD
- Consultar directamente la base de datos: `SELECT * FROM festivos WHERE fecha = '2025-12-25';`

## Referencia de la API

Para más información sobre la API de Colombia:
- **Documentación**: https://api-colombia.com
- **GitHub**: https://github.com/Mteheran/api-colombia
- **Endpoints disponibles**: Departamentos, Ciudades, Presidentes, Festivos, etc.

## Próximas Mejoras

- [ ] Sincronización automática programada (cron job)
- [ ] Cache de festivos en memoria
- [ ] Notificaciones cuando se acerca un festivo
- [ ] Dashboard de festivos en el frontend
- [ ] Exportar festivos a calendario (iCal)
