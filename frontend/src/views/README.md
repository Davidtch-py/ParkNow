# 📄 Views - Páginas de ParkNow

Esta carpeta contiene las **páginas principales de la aplicación** que se mapean directamente a rutas.

## 🎯 Propósito

Cada archivo en esta carpeta representa una vista/página completa de la aplicación que:
- Se mapea a una ruta específica en `/Routes/allRoutes.ts`
- Contiene la lógica de una funcionalidad completa
- Puede usar componentes de `/components/` y `/Common/`
- Consume servicios de `/services/`

## 📋 Vistas Actuales

### 🏠 Dashboard
- **`DashboardAnalytics.tsx`** - Dashboard principal con métricas y estadísticas en tiempo real

### 🅿️ Gestión de Parqueaderos
- **`ParqueaderoWizard.tsx`** - Wizard para crear/editar parqueaderos

### 👥 Gestión de Usuarios
- **`UsuariosListView.tsx`** - Lista y gestión de usuarios/controladores
- **`UsuariosSimple.tsx`** - Vista simplificada de usuarios

### ⏰ Horarios
- **`HorariosAtencion.tsx`** - Configuración de horarios de atención por parqueadero

### 🚨 Alertas
- **`AlertasCapacidad.tsx`** - Sistema de alertas de capacidad
- **`AlertasCapacidadSimple.tsx`** - Vista simplificada de alertas

### 🚗 Entradas y Salidas
- **`RegistroEntradaSalida.tsx`** - Registro de entradas y salidas de vehículos

### 📊 Reportes
- **`ReportesListView.tsx`** - Generación y visualización de reportes

### 💰 Tarifas
- **`GestionTarifas.tsx`** - Gestión de tarifas por tipo de vehículo

### 🔐 Autenticación
- **`LoginBoxed.tsx`** - Página de inicio de sesión

### 🧪 Desarrollo
- **`TestComponent.tsx`** - Componente de prueba para desarrollo

## 📐 Estructura de una Vista

```typescript
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { parqueaderoService } from '../services';
import { useAuth } from '../context/AuthContext';

const MiVista = () => {
  // 1. Estados locales
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 2. Contextos y hooks
  const { user } = useAuth();
  
  // 3. Efectos
  useEffect(() => {
    cargarDatos();
  }, []);
  
  // 4. Funciones de lógica
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const result = await parqueaderoService.getAll();
      if (result.success) {
        setDatos(result.data);
      }
    } catch (error) {
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };
  
  // 5. Render
  return (
    <div className="container-fluid">
      {/* Contenido de la vista */}
    </div>
  );
};

export default MiVista;
```

## ✅ Buenas Prácticas

1. **Una vista = Una ruta**
   - Cada vista debe corresponder a una URL específica

2. **Separar lógica de presentación**
   - Extraer componentes reutilizables a `/components/`
   - Mantener la lógica de negocio en `/services/`

3. **Manejo de estados**
   - Loading states para operaciones asíncronas
   - Error handling con toast notifications
   - Estados locales con useState

4. **Nombres descriptivos**
   - El nombre debe indicar claramente qué hace la vista
   - Usar sufijos como `View`, `List`, `Wizard` cuando sea apropiado

5. **Imports organizados**
   ```typescript
   // 1. React y librerías
   import React, { useState, useEffect } from 'react';
   import { toast } from 'react-toastify';
   
   // 2. Componentes
   import { Card } from 'components/cards';
   import { Button } from 'Common/Components';
   
   // 3. Servicios y contextos
   import { parqueaderoService } from 'services';
   import { useAuth } from 'context/AuthContext';
   
   // 4. Tipos
   import type { Parqueadero } from 'types';
   ```

## 🔄 Flujo de Datos

```
Usuario interactúa con Vista
    ↓
Vista llama a Servicio
    ↓
Servicio hace petición a API
    ↓
Servicio retorna datos
    ↓
Vista actualiza estado
    ↓
UI se re-renderiza
```

## 🚫 Lo que NO va aquí

- ❌ Componentes reutilizables (van en `/components/`)
- ❌ Lógica de API (va en `/services/`)
- ❌ Componentes de layout (van en `/Layout/`)
- ❌ Utilidades genéricas (van en `/utils/`)

## 📝 Checklist para Nueva Vista

- [ ] Crear archivo en `/views/` con nombre descriptivo
- [ ] Agregar ruta en `/Routes/allRoutes.ts`
- [ ] Implementar manejo de loading y errores
- [ ] Usar servicios para lógica de negocio
- [ ] Extraer componentes reutilizables si es necesario
- [ ] Agregar comentarios para lógica compleja
- [ ] Probar en diferentes tamaños de pantalla

---

**Convención de nombres:** `PascalCase.tsx` (ej: `DashboardAnalytics.tsx`)
