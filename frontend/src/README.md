# 🏗️ Estructura del Proyecto ParkNow

## 📁 Organización de Carpetas

```
src/
├── 📄 views/              # Páginas principales de ParkNow (mapean a rutas)
├── 🧩 components/         # Componentes reutilizables de ParkNow
├── 🎨 Common/            # Componentes UI genéricos del template
├── 🏠 Layout/            # Layouts y estructura de la aplicación
├── 🔧 services/          # Servicios de API y lógica de negocio
├── 🌐 context/           # Context API (estado global simple)
├── 🗂️ slices/            # Redux slices (estado global complejo)
├── 🛣️ Routes/            # Configuración de rutas
├── 📚 pages/             # Biblioteca de componentes del template
├── 🎭 assets/            # Recursos estáticos (imágenes, estilos)
└── 🌍 locales/           # Archivos de i18n (español/inglés)
```

## 🎯 Guía Rápida: ¿Dónde va mi código?

### ❓ Voy a crear una nueva página
→ **`/views/`** - Crea un archivo `.tsx` que se mapea a una ruta

### ❓ Voy a crear un componente reutilizable de ParkNow
→ **`/components/`** - Componentes específicos del dominio

### ❓ Necesito un componente UI genérico
→ **`/Common/`** - Ya existen muchos componentes base

### ❓ Voy a hacer una llamada al backend
→ **`/services/`** - Crea o usa un servicio existente

### ❓ Necesito estado global
→ **`/context/`** - Para estado simple (ej: usuario actual)
→ **`/slices/`** - Para estado complejo con Redux

### ❓ Voy a agregar una nueva ruta
→ **`/Routes/allRoutes.ts`** - Agrega la ruta aquí

### ❓ Necesito ver ejemplos de UI
→ **`/pages/Components/`** - Biblioteca de referencia del template

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                    Usuario Interactúa                    │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Vista (/views/)                             │
│  - DashboardAnalytics.tsx                                │
│  - ParqueaderoWizard.tsx                                 │
│  - UsuariosListView.tsx                                  │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│           Servicio (/services/)                          │
│  - parqueaderoService.ts                                 │
│  - usuarioService.ts                                     │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  API Backend                             │
│  http://localhost:3001/api                               │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Respuesta al Servicio                       │
└────────────────────────┬────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│         Vista Actualiza Estado y UI                      │
└─────────────────────────────────────────────────────────┘
```

## 🗺️ Mapa de Navegación

### Páginas Principales de ParkNow

| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/` | `DashboardAnalytics.tsx` | Dashboard principal |
| `/parknow-parqueaderos` | `ParqueaderoWizard.tsx` | Gestión de parqueaderos |
| `/parknow-usuarios` | `UsuariosListView.tsx` | Gestión de usuarios |
| `/parknow-horarios` | `HorariosAtencion.tsx` | Horarios de atención |
| `/parknow-alertas` | `AlertasCapacidad.tsx` | Sistema de alertas |
| `/parknow-entradas-salidas` | `RegistroEntradaSalida.tsx` | Registro de vehículos |
| `/parknow-reportes` | `ReportesListView.tsx` | Generación de reportes |
| `/parknow-tarifas` | `GestionTarifas.tsx` | Gestión de tarifas |
| `/login` | `LoginBoxed.tsx` | Inicio de sesión |

## 🔑 Conceptos Clave

### Views vs Components vs Pages

```
┌──────────────────────────────────────────────────────────┐
│ /views/                                                   │
│ ✓ Páginas completas de ParkNow                           │
│ ✓ Se mapean a rutas                                      │
│ ✓ Usan servicios y componentes                           │
│ Ejemplo: DashboardAnalytics.tsx                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ /components/                                              │
│ ✓ Componentes reutilizables de ParkNow                   │
│ ✓ Específicos del dominio de parqueaderos                │
│ ✓ Se usan en múltiples vistas                            │
│ Ejemplo: VehicleCard.tsx, ParqueaderoCard.tsx            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ /Common/                                                  │
│ ✓ Componentes UI genéricos                               │
│ ✓ No específicos de ParkNow                              │
│ ✓ Podrían usarse en cualquier app                        │
│ Ejemplo: Pagination.tsx, Modal.tsx                       │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ /pages/                                                   │
│ ✓ Biblioteca del template original                       │
│ ✓ Solo para referencia                                   │
│ ✓ NO son páginas de ParkNow                              │
│ Ejemplo: Components/Forms/FormsBasic.tsx                 │
└──────────────────────────────────────────────────────────┘
```

## 🛠️ Servicios Disponibles

```typescript
import {
  parqueaderoService,  // Gestión de parqueaderos
  usuarioService,      // Gestión de usuarios
  entradaService,      // Registro de entradas
  salidaService,       // Registro de salidas
  tarifaService,       // Gestión de tarifas
  reporteService,      // Generación de reportes
} from './services';
```

## 📝 Ejemplo de Implementación

### Crear una Nueva Vista

```typescript
// 1. Crear archivo en /views/MiNuevaVista.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { parqueaderoService } from '../services';

const MiNuevaVista = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    const result = await parqueaderoService.getAll();
    
    if (result.success) {
      setDatos(result.data || []);
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="container-fluid">
      <h1>Mi Nueva Vista</h1>
      {/* Contenido */}
    </div>
  );
};

export default MiNuevaVista;
```

```typescript
// 2. Agregar ruta en /Routes/allRoutes.ts
import MiNuevaVista from "views/MiNuevaVista";

const authProtectedRoutes = [
  // ...
  { path: "/mi-nueva-vista", component: MiNuevaVista },
];
```

```typescript
// 3. Agregar al menú en /Layout/SimpleMenuData.tsx
{
  id: "mi-vista",
  label: "Mi Nueva Vista",
  link: "/mi-nueva-vista",
  icon: <Icon className="size-4" />,
},
```

## 📚 Documentación Adicional

Cada carpeta principal tiene su propio README con información detallada:

- 📄 [/views/README.md](./views/README.md) - Páginas de ParkNow
- 🧩 [/components/README.md](./components/README.md) - Componentes reutilizables
- 🔧 [/services/README.md](./services/README.md) - Servicios de API
- 📚 [/pages/README.md](./pages/README.md) - Biblioteca del template

## 🎨 Stack Tecnológico

- **Framework:** React 18 + TypeScript
- **Routing:** React Router v6
- **Estado Global:** Redux Toolkit + Context API
- **Estilos:** TailwindCSS + SCSS
- **Iconos:** Lucide React
- **Formularios:** Formik + Yup
- **Notificaciones:** React Toastify
- **HTTP Client:** Axios
- **i18n:** react-i18next

## ✅ Checklist para Nuevas Funcionalidades

- [ ] Crear vista en `/views/`
- [ ] Crear/usar servicio en `/services/`
- [ ] Agregar ruta en `/Routes/allRoutes.ts`
- [ ] Agregar al menú en `/Layout/SimpleMenuData.tsx`
- [ ] Extraer componentes reutilizables a `/components/`
- [ ] Manejar estados de loading y error
- [ ] Agregar validaciones de formularios
- [ ] Probar en diferentes tamaños de pantalla
- [ ] Documentar funcionalidad compleja

---

**Para más detalles sobre la arquitectura completa, ver [ARCHITECTURE.md](../ARCHITECTURE.md)**
