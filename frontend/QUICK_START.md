# 🚀 Quick Start - ParkNow Frontend

## 📁 Estructura Simplificada

```
src/
├── views/         → 📄 TUS PÁGINAS AQUÍ (mapean a rutas)
├── components/    → 🧩 Componentes reutilizables de ParkNow
├── services/      → 🔧 Llamadas al backend
├── Common/        → 🎨 Componentes UI genéricos
├── Layout/        → 🏠 Header, Sidebar, Footer
├── Routes/        → 🛣️ Configuración de rutas
└── pages/         → 📚 Biblioteca del template (solo referencia)
```

## 🎯 Regla de Oro

| Voy a... | Va en... |
|----------|----------|
| Crear una página nueva | `/views/` |
| Crear un componente reutilizable | `/components/` |
| Hacer una llamada al backend | `/services/` |
| Buscar un componente UI | `/Common/` o `/pages/Components/` |
| Agregar una ruta | `/Routes/allRoutes.ts` |

## 🏃 Flujo de Trabajo

### 1️⃣ Crear una Nueva Página

```bash
# 1. Crear archivo
src/views/MiPagina.tsx

# 2. Agregar ruta
src/Routes/allRoutes.ts

# 3. Agregar al menú
src/Layout/SimpleMenuData.tsx
```

### 2️⃣ Template de Página

```typescript
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { miServicio } from '../services';

const MiPagina = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    const result = await miServicio.getAll();
    
    if (result.success) {
      setDatos(result.data || []);
      toast.success('Datos cargados');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="container-fluid">
      <h1>Mi Página</h1>
      {/* Tu contenido aquí */}
    </div>
  );
};

export default MiPagina;
```

### 3️⃣ Crear un Servicio

```typescript
// src/services/miServicio.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class MiServicio {
  private baseUrl = `${API_URL}/mi-endpoint`;

  async getAll() {
    try {
      const response = await axios.get(this.baseUrl);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error',
      };
    }
  }

  async create(data: any) {
    try {
      const response = await axios.post(this.baseUrl, data);
      return {
        success: true,
        data: response.data,
        message: 'Creado exitosamente',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error',
      };
    }
  }
}

export const miServicio = new MiServicio();
```

```typescript
// src/services/index.ts
export { miServicio } from './miServicio';
```

## 📚 Páginas Actuales de ParkNow

| Página | Ruta | Archivo |
|--------|------|---------|
| Dashboard | `/` | `DashboardAnalytics.tsx` |
| Parqueaderos | `/parknow-parqueaderos` | `ParqueaderoWizard.tsx` |
| Usuarios | `/parknow-usuarios` | `UsuariosListView.tsx` |
| Horarios | `/parknow-horarios` | `HorariosAtencion.tsx` |
| Alertas | `/parknow-alertas` | `AlertasCapacidad.tsx` |
| Entradas/Salidas | `/parknow-entradas-salidas` | `RegistroEntradaSalida.tsx` |
| Reportes | `/parknow-reportes` | `ReportesListView.tsx` |
| Tarifas | `/parknow-tarifas` | `GestionTarifas.tsx` |
| Login | `/login` | `LoginBoxed.tsx` |

## 🔧 Servicios Disponibles

```typescript
import {
  parqueaderoService,
  usuarioService,
  entradaService,
  salidaService,
  tarifaService,
  reporteService,
} from './services';

// Uso
const result = await parqueaderoService.getAll();
if (result.success) {
  console.log(result.data);
}
```

## 🎨 Componentes UI Disponibles

### En `/Common/`
- `BreadCrumb` - Breadcrumbs
- `Pagination` - Paginación
- `TableContainer` - Tablas
- `DeleteModal` - Modal de confirmación
- `Dropdown` - Menús desplegables
- `Modal` - Modales genéricos

### En `/pages/Components/` (Referencia)
- Formularios avanzados
- Tablas con filtros
- Navegación
- Y mucho más...

## ⚡ Comandos Útiles

```bash
# Iniciar desarrollo
npm start

# Compilar para producción
npm run build

# Ejecutar tests
npm test

# Linter
npm run lint
```

## 🐛 Debugging

### Error: "Cannot find module"
→ Verifica que el import use la ruta correcta desde `src/`

### Error: "Service is not defined"
→ Asegúrate de exportar el servicio en `services/index.ts`

### Error: "Route not found"
→ Verifica que agregaste la ruta en `Routes/allRoutes.ts`

## 📖 Documentación Completa

- 📄 [Arquitectura Completa](./ARCHITECTURE.md)
- 🗂️ [Estructura del Proyecto](./src/README.md)
- 📄 [Views](./src/views/README.md)
- 🧩 [Components](./src/components/README.md)
- 🔧 [Services](./src/services/README.md)
- 📚 [Pages (Template)](./src/pages/README.md)

## ✅ Checklist Rápido

Cuando crees una nueva funcionalidad:

- [ ] Crear vista en `/views/MiVista.tsx`
- [ ] Crear/usar servicio en `/services/miServicio.ts`
- [ ] Exportar servicio en `/services/index.ts`
- [ ] Agregar ruta en `/Routes/allRoutes.ts`
- [ ] Agregar al menú en `/Layout/SimpleMenuData.tsx`
- [ ] Manejar loading y errores
- [ ] Usar toast para notificaciones
- [ ] Probar en móvil y desktop

---

**¿Dudas?** Revisa los READMEs en cada carpeta o consulta [ARCHITECTURE.md](./ARCHITECTURE.md)
