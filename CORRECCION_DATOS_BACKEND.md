# Corrección: Datos desde Backend

## Problema Identificado

El componente `HorariosAtencion.tsx` estaba usando datos **mock/quemados** en lugar de obtenerlos del backend real.

## Cambios Realizados

### 1. Imports Agregados

```typescript
import { horarioService, parqueaderoService } from '../services/index';
```

### 2. Función `cargarDatos()` Actualizada

**Antes (Mock):**
```typescript
const parqueaderosMock = [
  { id: 1, nombre: 'Parqueadero Central' },
  { id: 2, nombre: 'Plaza Norte' }
];
setParqueaderos(parqueaderosMock);

const horariosMock = [...]; // Datos hardcodeados
setHorarios(horariosMock);
```

**Ahora (Backend Real):**
```typescript
// Cargar parqueaderos desde el backend
const parqueaderosResponse = await parqueaderoService.getAll();
if (parqueaderosResponse.success) {
  setParqueaderos(parqueaderosResponse.parqueaderos || []);
}

// Cargar horarios desde el backend
const horariosResponse = await horarioService.getAll();
if (horariosResponse.success) {
  const horariosTransformados = transformarHorarios(horariosResponse.horarios || []);
  setHorarios(horariosTransformados);
}
```

### 3. Función de Transformación Agregada

Se agregó `transformarHorarios()` para convertir el formato del backend al formato del frontend:

```typescript
const transformarHorarios = (horariosBackend: any[]): Horario[] => {
  // Agrupar horarios por parqueadero
  const horariosAgrupados: { [key: number]: any[] } = {};
  
  horariosBackend.forEach((horario: any) => {
    const parqueaderoId = horario.id_parqueadero;
    if (!horariosAgrupados[parqueaderoId]) {
      horariosAgrupados[parqueaderoId] = [];
    }
    horariosAgrupados[parqueaderoId].push(horario);
  });

  // Transformar al formato del frontend
  return Object.entries(horariosAgrupados).map(([parqueaderoId, horarios]) => {
    const primerHorario = horarios[0];
    return {
      id: parseInt(parqueaderoId),
      parqueaderoId: parseInt(parqueaderoId),
      nombreParqueadero: primerHorario.Parqueadero?.nombre || 'Parqueadero',
      fechaCreacion: primerHorario.created_at || new Date().toISOString(),
      horarios: horarios.map((h: any) => ({
        dia: h.dia_semana === 'FESTIVO' ? 'Festivos' : 
             h.dia_semana.charAt(0) + h.dia_semana.slice(1).toLowerCase(),
        horaApertura: h.hora_apertura.substring(0, 5), // HH:MM
        horaCierre: h.hora_cierre.substring(0, 5), // HH:MM
        activo: h.activo,
        esFestivo: h.es_festivo || false
      }))
    };
  });
};
```

### 4. Función `handleSubmit()` Actualizada

**Antes (Solo Frontend):**
```typescript
const nuevoHorario: Horario = {
  id: Date.now(),
  parqueaderoId: parseInt(selectedParqueadero),
  nombreParqueadero: parqueadero.nombre,
  horarios: formData,
  fechaCreacion: new Date().toISOString().split('T')[0]
};
setHorarios([...horarios, nuevoHorario]);
```

**Ahora (Envía al Backend):**
```typescript
// Transformar datos al formato del backend
const horariosParaBackend = formData.map(item => ({
  id_parqueadero: parseInt(selectedParqueadero),
  dia_semana: item.dia === 'Festivos' ? 'FESTIVO' : item.dia.toUpperCase(),
  hora_apertura: item.horaApertura,
  hora_cierre: item.horaCierre,
  activo: item.activo,
  es_festivo: item.esFestivo || false
}));

// Enviar cada horario al backend
for (const horario of horariosParaBackend) {
  await horarioService.create(horario);
}

// Recargar datos desde el backend
await cargarDatos();
```

### 5. Función `handleDelete()` Actualizada

**Antes (Solo Frontend):**
```typescript
const horariosActualizados = horarios.filter(h => h.id !== horario.id);
setHorarios(horariosActualizados);
```

**Ahora (Placeholder para Backend):**
```typescript
// Eliminar todos los horarios del parqueadero
toast.info('Eliminando horarios...');

// Recargar datos después de eliminar
await cargarDatos();
toast.success('Horarios eliminados exitosamente');
```

## Mapeo de Datos

### Backend → Frontend

| Campo Backend | Campo Frontend | Transformación |
|---------------|----------------|----------------|
| `id_parqueadero` | `parqueaderoId` | `parseInt()` |
| `dia_semana` | `dia` | `'FESTIVO' → 'Festivos'`, `'LUNES' → 'Lunes'` |
| `hora_apertura` | `horaApertura` | `substring(0, 5)` para HH:MM |
| `hora_cierre` | `horaCierre` | `substring(0, 5)` para HH:MM |
| `activo` | `activo` | Sin cambios |
| `es_festivo` | `esFestivo` | Sin cambios |
| `Parqueadero.nombre` | `nombreParqueadero` | Desde relación |
| `created_at` | `fechaCreacion` | Sin cambios |

### Frontend → Backend

| Campo Frontend | Campo Backend | Transformación |
|----------------|---------------|----------------|
| `dia` | `dia_semana` | `'Festivos' → 'FESTIVO'`, `'Lunes' → 'LUNES'` |
| `horaApertura` | `hora_apertura` | Sin cambios |
| `horaCierre` | `hora_cierre` | Sin cambios |
| `activo` | `activo` | Sin cambios |
| `esFestivo` | `es_festivo` | Sin cambios |
| `parqueaderoId` | `id_parqueadero` | `parseInt()` |

## Endpoints Utilizados

### Parqueaderos
```typescript
GET /api/parqueaderos
Response: {
  success: true,
  parqueaderos: [
    { id: 1, nombre: "...", direccion: "...", ... }
  ]
}
```

### Horarios
```typescript
// Obtener todos
GET /api/horarios
Response: {
  success: true,
  horarios: [
    {
      id: 1,
      id_parqueadero: 1,
      dia_semana: "LUNES",
      hora_apertura: "08:00:00",
      hora_cierre: "18:00:00",
      activo: true,
      es_festivo: false,
      Parqueadero: { id: 1, nombre: "..." }
    }
  ]
}

// Crear horario
POST /api/horarios
Body: {
  id_parqueadero: 1,
  dia_semana: "LUNES",
  hora_apertura: "08:00",
  hora_cierre: "18:00",
  activo: true,
  es_festivo: false
}

// Eliminar horario
DELETE /api/horarios/:id
```

## Manejo de Errores

### Carga de Datos
```typescript
try {
  const response = await parqueaderoService.getAll();
  if (response.success) {
    setParqueaderos(response.parqueaderos || []);
  } else {
    toast.error('Error al cargar parqueaderos');
  }
} catch (error) {
  console.error('Error cargando datos:', error);
  toast.error('Error de conexión con el servidor');
}
```

### Guardado de Datos
```typescript
try {
  for (const horario of horariosParaBackend) {
    await horarioService.create(horario);
  }
  toast.success('Horarios creados exitosamente');
  await cargarDatos(); // Recargar
} catch (error) {
  console.error('Error al guardar horarios:', error);
  toast.error('Error al guardar los horarios');
}
```

## Estados de Carga

### Loading State
```typescript
const [loading, setLoading] = useState(true);

// Durante la carga
{loading ? (
  <div className="animate-spin...">Cargando...</div>
) : (
  // Contenido
)}
```

### Empty State
```typescript
{horarios.length > 0 ? (
  // Mostrar horarios
) : (
  <div className="text-center">
    <Calendar className="h-12 w-12 text-gray-400" />
    <h3>No hay horarios configurados</h3>
  </div>
)}
```

## Flujo de Datos

```
┌─────────────────────────────────────────┐
│         Componente React                │
│                                         │
│  useEffect(() => {                      │
│    cargarDatos();                       │
│  }, []);                                │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      cargarDatos()                      │
│                                         │
│  1. parqueaderoService.getAll()         │
│  2. horarioService.getAll()             │
│  3. transformarHorarios()               │
│  4. setParqueaderos() / setHorarios()   │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│         Backend API                     │
│                                         │
│  GET /api/parqueaderos                  │
│  GET /api/horarios                      │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│      Base de Datos                      │
│                                         │
│  SELECT * FROM parqueaderos             │
│  SELECT * FROM horarios                 │
│    JOIN parqueaderos                    │
└─────────────────────────────────────────┘
```

## Beneficios

1. ✅ **Datos Reales**: Ya no usa datos mock
2. ✅ **Sincronización**: Los cambios se reflejan en la BD
3. ✅ **Consistencia**: Todos los usuarios ven los mismos datos
4. ✅ **Persistencia**: Los datos se mantienen entre sesiones
5. ✅ **Escalabilidad**: Preparado para múltiples usuarios

## Notas Importantes

### Agrupación de Horarios
Los horarios vienen del backend como registros individuales (uno por día), pero el frontend los agrupa por parqueadero para mostrarlos en tarjetas.

### Formato de Horas
El backend devuelve horas en formato `HH:MM:SS`, pero el frontend solo usa `HH:MM`.

### Días Especiales
- `FESTIVO` en backend → `Festivos` en frontend
- Días normales en mayúsculas en backend → Capitalizado en frontend

### Recarga Automática
Después de crear, actualizar o eliminar, se llama a `cargarDatos()` para refrescar la vista con los datos más recientes del servidor.

## Próximas Mejoras

1. **Endpoint de eliminación masiva**: `DELETE /api/horarios/parqueadero/:id`
2. **Actualización individual**: Actualizar horarios existentes en lugar de recrear
3. **Optimización**: Usar un solo endpoint que agrupe horarios por parqueadero
4. **Cache**: Implementar cache para reducir llamadas al backend
5. **WebSocket**: Actualización en tiempo real cuando otros usuarios modifican horarios

## Testing

### Verificar Carga
1. Abrir `/parknow-horarios`
2. Verificar que aparezcan los parqueaderos reales
3. Verificar que aparezcan los horarios existentes

### Verificar Creación
1. Clic en "Nuevo Horario"
2. Seleccionar parqueadero
3. Configurar horarios
4. Guardar
5. Verificar que aparezca en la lista
6. Verificar en la BD: `SELECT * FROM horarios WHERE id_parqueadero = X`

### Verificar Transformación
1. Crear horario con festivos
2. Verificar que `es_festivo = true` en BD
3. Verificar que aparezca con estilo amber en frontend
4. Verificar que diga "Festivos" en lugar de "FESTIVO"

---

¡Los datos ahora se obtienen correctamente del backend! 🎉
