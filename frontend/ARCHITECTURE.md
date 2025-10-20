# Arquitectura Frontend - ParkNow

## 📁 Estructura de Carpetas

```
src/
├── views/              # Páginas principales de la aplicación ParkNow
├── components/         # Componentes reutilizables específicos de ParkNow
├── Common/            # Componentes UI genéricos del template (compartidos)
├── Layout/            # Layouts y estructura de la aplicación
├── services/          # Servicios de API y lógica de negocio
├── context/           # Context API de React (estado global)
├── slices/            # Redux slices (estado global con Redux)
├── Routes/            # Configuración de rutas
├── assets/            # Recursos estáticos (imágenes, estilos, etc.)
└── locales/           # Archivos de internacionalización (i18n)
```

## 🎯 Definición de Responsabilidades

### 📄 `/views/` - Páginas de la Aplicación
**Propósito:** Contiene las páginas/vistas principales de ParkNow que se mapean directamente a rutas.

**Contenido:**
- `DashboardAnalytics.tsx` - Dashboard principal con métricas
- `ParqueaderoWizard.tsx` - Gestión de parqueaderos
- `UsuariosListView.tsx` - Gestión de usuarios/controladores
- `HorariosAtencion.tsx` - Gestión de horarios
- `AlertasCapacidad.tsx` - Sistema de alertas
- `RegistroEntradaSalida.tsx` - Registro de vehículos
- `ReportesListView.tsx` - Generación de reportes
- `GestionTarifas.tsx` - Gestión de tarifas
- `LoginBoxed.tsx` - Página de login

**Regla:** Una vista = Una ruta de la aplicación

---

### 🧩 `/components/` - Componentes de ParkNow
**Propósito:** Componentes reutilizables específicos del dominio de ParkNow.

**Ejemplos:**
- `VehicleCard.tsx` - Tarjeta de vehículo
- `ParqueaderoCard.tsx` - Tarjeta de parqueadero
- `AlertaBadge.tsx` - Badge de alerta
- `TarifaForm.tsx` - Formulario de tarifa

**Regla:** Componentes que se usan en múltiples vistas de ParkNow

---

### 🎨 `/Common/` - Componentes UI Genéricos
**Propósito:** Componentes de UI reutilizables del template que NO son específicos de ParkNow.

**Contenido:**
- `BreadCrumb.tsx` - Breadcrumbs de navegación
- `Pagination.tsx` - Paginación
- `TableContainer.tsx` - Contenedor de tablas
- `DeleteModal.tsx` - Modal de confirmación de eliminación
- `LanguageDropdown.tsx` - Selector de idioma
- `LightDark.tsx` - Toggle de tema claro/oscuro
- `Components/` - Componentes base (Dropdown, Modal, etc.)

**Regla:** Componentes genéricos que podrían usarse en cualquier aplicación

---

### 🔧 `/services/` - Servicios de API
**Propósito:** Lógica de comunicación con el backend y manejo de datos.

**Contenido:**
- `parqueaderoService.ts` - API de parqueaderos
- `usuarioService.ts` - API de usuarios
- `entradaService.ts` - API de entradas
- `salidaService.ts` - API de salidas
- `tarifaService.ts` - API de tarifas
- `reporteService.ts` - API de reportes
- `index.ts` - Exportaciones centralizadas

**Regla:** Un servicio por entidad del dominio

---

### 🌐 `/context/` - Estado Global (Context API)
**Propósito:** Estado compartido entre componentes usando React Context.

**Contenido:**
- `AuthContext.tsx` - Contexto de autenticación y usuario actual

**Regla:** Solo para estado que necesita ser accesible globalmente

---

### 🗂️ `/slices/` - Estado Global (Redux)
**Propósito:** Estado global manejado con Redux (del template original).

**Contenido Actual:**
- `auth/` - Autenticación (login, register, profile)
- `layouts/` - Configuración de layout
- `calendar/` - Calendario (mantenido para uso futuro)

**Regla:** Solo para estado complejo que requiere Redux

---

### 🛣️ `/Routes/` - Configuración de Rutas
**Propósito:** Definición de todas las rutas de la aplicación.

**Contenido:**
- `allRoutes.ts` - Todas las rutas protegidas y públicas
- `Index.tsx` - Configuración del router

---

### 🎨 `/Layout/` - Estructura de la Aplicación
**Propósito:** Componentes de layout que envuelven las vistas.

**Contenido:**
- `Header.tsx` - Barra superior
- `Footer.tsx` - Pie de página
- `Sidebar.tsx` - Menú lateral
- `VerticalLayout/` - Layout vertical
- `HorizontalLayout/` - Layout horizontal

---

## 🚀 Migración de `/pages/` a `/views/`

### Archivos a Mover:

1. **`/pages/NewParqueadero/AgregarParqueadero.jsx`**
   - ❌ Eliminar (duplicado de `ParqueaderoWizard.tsx`)

2. **`/pages/Authentication/`**
   - ❌ Mantener solo como referencia (usamos `LoginBoxed.tsx`)
   - Los archivos Login.tsx, Register.tsx son del template original

3. **`/pages/Users/`**
   - ❌ Mantener solo como referencia (usamos `UsuariosListView.tsx`)

4. **`/pages/Components/`**
   - ✅ Mantener como biblioteca de componentes UI del template
   - Útil para referencia y desarrollo

5. **`/pages/Pages/`**
   - ✅ Mantener (Account, Settings, Pricing, FAQs, etc.)
   - Son páginas auxiliares útiles

---

## 📋 Convenciones de Nombres

### Archivos:
- **Componentes:** `PascalCase.tsx` (ej: `VehicleCard.tsx`)
- **Servicios:** `camelCase.ts` (ej: `parqueaderoService.ts`)
- **Vistas:** `PascalCase.tsx` (ej: `DashboardAnalytics.tsx`)
- **Utilidades:** `camelCase.ts` (ej: `formatDate.ts`)

### Componentes:
- **Vistas:** Nombre descriptivo del módulo (ej: `DashboardAnalytics`)
- **Componentes:** Nombre del componente (ej: `VehicleCard`)
- **Servicios:** Nombre de la entidad + Service (ej: `parqueaderoService`)

---

## 🔄 Flujo de Datos

```
Vista (views/)
    ↓
Servicio (services/)
    ↓
API Backend
    ↓
Servicio (services/)
    ↓
Vista (views/) → Actualiza UI
```

### Ejemplo:
```typescript
// En DashboardAnalytics.tsx
import { parqueaderoService } from '../services';

const cargarDatos = async () => {
  const result = await parqueaderoService.getAll();
  if (result.success) {
    setParqueaderos(result.parqueaderos);
  }
};
```

---

## ✅ Buenas Prácticas

1. **Una vista = Una responsabilidad**
   - Cada vista debe enfocarse en una funcionalidad específica

2. **Componentes pequeños y reutilizables**
   - Extraer lógica común en componentes separados

3. **Servicios para lógica de negocio**
   - Nunca hacer llamadas API directamente en componentes

4. **Context para estado simple**
   - Redux solo para estado complejo

5. **Nombres descriptivos**
   - El nombre debe indicar claramente qué hace el archivo

---

## 🗑️ Archivos a Limpiar

### Eliminar:
- ❌ Archivos `.jsx` vacíos en `/views/`
- ❌ `/pages/NewParqueadero/` (duplicado)

### Mantener como Referencia:
- ✅ `/pages/Components/` - Biblioteca de UI
- ✅ `/pages/Pages/` - Páginas auxiliares
- ✅ `/pages/Authentication/` - Referencia del template
- ✅ `/pages/Users/` - Referencia del template

---

## 📊 Resumen de la Arquitectura

| Carpeta | Propósito | Ejemplo |
|---------|-----------|---------|
| `/views/` | Páginas principales | `DashboardAnalytics.tsx` |
| `/components/` | Componentes ParkNow | `VehicleCard.tsx` |
| `/Common/` | Componentes UI genéricos | `Pagination.tsx` |
| `/services/` | Lógica de API | `parqueaderoService.ts` |
| `/context/` | Estado global simple | `AuthContext.tsx` |
| `/slices/` | Estado global Redux | `auth/`, `layouts/` |
| `/Routes/` | Configuración de rutas | `allRoutes.ts` |
| `/Layout/` | Estructura de la app | `Header.tsx` |

---

**Última actualización:** Octubre 2025
**Versión:** 1.0
