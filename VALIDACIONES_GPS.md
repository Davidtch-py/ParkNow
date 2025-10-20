# Validaciones de Coordenadas GPS

## Resumen

Se implementaron validaciones completas tanto en el **frontend** como en el **backend** para asegurar que las coordenadas GPS sean válidas antes de crear un parqueadero.

## Validaciones Implementadas

### ✅ 1. Ambas Coordenadas Requeridas
Si se proporciona una coordenada, ambas deben estar presentes.

**Error:** "Debes proporcionar tanto latitud como longitud, o dejar ambas vacías"

### ✅ 2. Rango de Latitud
La latitud debe estar entre **-90° y 90°**

- **-90°**: Polo Sur
- **0°**: Ecuador
- **90°**: Polo Norte

**Error:** "La latitud debe estar entre -90 y 90 grados"

### ✅ 3. Rango de Longitud
La longitud debe estar entre **-180° y 180°**

- **-180°**: Línea de cambio de fecha (oeste)
- **0°**: Meridiano de Greenwich
- **180°**: Línea de cambio de fecha (este)

**Error:** "La longitud debe estar entre -180 y 180 grados"

### ✅ 4. Validación de Null Island
Las coordenadas **0,0** no son válidas (punto en el Océano Atlántico, probablemente un error)

**Error:** "Las coordenadas 0,0 no son válidas. Por favor verifica los valores."

## Implementación

### Frontend (ParqueaderoWizard.tsx)

```typescript
const validateCurrentStep = () => {
  switch (currentStep) {
    case 2:
      // Validar coordenadas GPS si se proporcionaron
      if (formData.latitud !== undefined || formData.longitud !== undefined) {
        // Si se proporciona una, ambas deben estar presentes
        if (formData.latitud === undefined || formData.longitud === undefined) {
          toast.error('Debes proporcionar tanto latitud como longitud...');
          return false;
        }
        
        // Validar rango de latitud (-90 a 90)
        if (formData.latitud < -90 || formData.latitud > 90) {
          toast.error('La latitud debe estar entre -90 y 90 grados');
          return false;
        }
        
        // Validar rango de longitud (-180 a 180)
        if (formData.longitud < -180 || formData.longitud > 180) {
          toast.error('La longitud debe estar entre -180 y 180 grados');
          return false;
        }
        
        // Validar que no sean exactamente 0,0
        if (formData.latitud === 0 && formData.longitud === 0) {
          toast.error('Las coordenadas 0,0 no son válidas...');
          return false;
        }
      }
      return true;
  }
};
```

### Backend (ParqueaderoController.js)

```javascript
async crear(req, res) {
  const { latitud, longitud } = req.body;

  // Validar coordenadas GPS si se proporcionaron
  if (latitud !== undefined || longitud !== undefined) {
    // Si se proporciona una, ambas deben estar presentes
    if (latitud === undefined || longitud === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Debes proporcionar tanto latitud como longitud...'
      });
    }

    // Validar rango de latitud (-90 a 90)
    if (latitud < -90 || latitud > 90) {
      return res.status(400).json({
        success: false,
        error: 'La latitud debe estar entre -90 y 90 grados'
      });
    }

    // Validar rango de longitud (-180 a 180)
    if (longitud < -180 || longitud > 180) {
      return res.status(400).json({
        success: false,
        error: 'La longitud debe estar entre -180 y 180 grados'
      });
    }

    // Validar que no sean exactamente 0,0
    if (latitud === 0 && longitud === 0) {
      return res.status(400).json({
        success: false,
        error: 'Las coordenadas 0,0 no son válidas'
      });
    }
  }
}
```

## Mejoras en la UI

### 1. Rangos Visibles en Labels
```tsx
<label>
  Latitud
  <span className="ml-1 text-xs text-slate-500">(-90 a 90)</span>
</label>
```

### 2. Atributos HTML de Validación
```tsx
<input
  type="number"
  min="-90"
  max="90"
  step="any"
/>
```

### 3. Ejemplos de Coordenadas
```tsx
<p className="mt-1 text-xs text-slate-500">
  Ejemplo: 4.6097 (Bogotá)
</p>
```

### 4. Guía de Uso
Caja azul con instrucciones paso a paso:
1. Abre Google Maps
2. Haz clic derecho en la ubicación
3. Selecciona las coordenadas
4. Copia y pega aquí

### 5. Advertencia Importante
Caja ámbar con recordatorio sobre rangos válidos.

## Coordenadas de Ejemplo para Colombia

### Principales Ciudades

**Bogotá:**
- Latitud: `4.6097`
- Longitud: `-74.0817`

**Medellín:**
- Latitud: `6.2442`
- Longitud: `-75.5812`

**Cali:**
- Latitud: `3.4516`
- Longitud: `-76.5320`

**Barranquilla:**
- Latitud: `10.9639`
- Longitud: `-74.7964`

**Cartagena:**
- Latitud: `10.3910`
- Longitud: `-75.4794`

**Bucaramanga:**
- Latitud: `7.1193`
- Longitud: `-73.1227`

## Casos de Prueba

### ✅ Casos Válidos

```javascript
// Bogotá
{ latitud: 4.6097, longitud: -74.0817 }

// Polo Norte
{ latitud: 90, longitud: 0 }

// Polo Sur
{ latitud: -90, longitud: 0 }

// Sin coordenadas
{ latitud: undefined, longitud: undefined }
```

### ❌ Casos Inválidos

```javascript
// Solo una coordenada
{ latitud: 4.6097, longitud: undefined }
❌ Error: Debes proporcionar ambas

// Latitud fuera de rango
{ latitud: 95, longitud: -74.0817 }
❌ Error: Latitud debe estar entre -90 y 90

// Longitud fuera de rango
{ latitud: 4.6097, longitud: -200 }
❌ Error: Longitud debe estar entre -180 y 180

// Null Island (0,0)
{ latitud: 0, longitud: 0 }
❌ Error: Coordenadas 0,0 no son válidas
```

## Beneficios

1. ✅ **Seguridad**: Validación en frontend y backend
2. ✅ **UX Mejorada**: Mensajes claros de error
3. ✅ **Guía Visual**: Rangos y ejemplos visibles
4. ✅ **Prevención de Errores**: Validación antes de enviar
5. ✅ **Datos Consistentes**: Solo coordenadas válidas en la BD

## Flujo de Validación

```
Usuario ingresa coordenadas
         ↓
Frontend valida rangos
         ↓
    ¿Válido?
    ↙     ↘
   NO      SÍ
   ↓       ↓
Muestra   Envía al
 error    backend
           ↓
    Backend valida
         ↓
    ¿Válido?
    ↙     ↘
   NO      SÍ
   ↓       ↓
Retorna  Guarda en
 error   base de datos
```

## Notas Técnicas

### ¿Por qué validar 0,0?
Las coordenadas 0,0 apuntan a un punto en el Océano Atlántico conocido como "Null Island". En la práctica, estas coordenadas casi siempre indican un error de datos o valores por defecto no inicializados.

### ¿Por qué validar en frontend Y backend?
- **Frontend**: Mejor experiencia de usuario, feedback inmediato
- **Backend**: Seguridad, previene manipulación de requests

### Precisión de Coordenadas
- **4 decimales**: ~11 metros de precisión
- **6 decimales**: ~11 centímetros de precisión
- **8 decimales**: ~1 milímetro de precisión

Para parqueaderos, 4-6 decimales son suficientes.

## Futuras Mejoras

1. **Validación de país**: Verificar que las coordenadas estén en Colombia
2. **Selector de mapa**: Permitir seleccionar ubicación en un mapa interactivo
3. **Geocodificación**: Obtener coordenadas automáticamente desde la dirección
4. **Geocodificación inversa**: Verificar que la dirección coincida con las coordenadas
5. **Vista previa**: Mostrar el mapa mientras se ingresan las coordenadas
