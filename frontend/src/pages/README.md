# 📚 Pages - Biblioteca de Componentes del Template

Esta carpeta contiene **componentes del template original** que se mantienen como referencia y biblioteca de UI.

## ⚠️ Importante

**Esta carpeta NO contiene las páginas principales de ParkNow.**

Las páginas de la aplicación ParkNow están en `/views/`.

## 🎯 Propósito

Esta carpeta sirve como:
- 📖 Biblioteca de componentes UI del template
- 🎨 Referencia de diseño y patrones
- 🧪 Ejemplos de implementación
- 🔧 Componentes auxiliares útiles

## 📁 Estructura

```
pages/
├── Authentication/     # Páginas de autenticación del template (referencia)
├── Components/        # Biblioteca de componentes UI
│   ├── Forms/        # Ejemplos de formularios
│   ├── Navigation/   # Componentes de navegación
│   ├── Table/        # Ejemplos de tablas
│   └── UIElement/    # Elementos de UI
├── Pages/            # Páginas auxiliares útiles
│   ├── Account/      # Gestión de cuenta
│   ├── Settings/     # Configuración
│   ├── Pricing/      # Precios
│   ├── Faqs/         # Preguntas frecuentes
│   └── ContactUs/    # Contacto
└── Users/            # Gestión de usuarios del template (referencia)
```

## 📋 Contenido

### 🔐 `/Authentication/`
Páginas de autenticación del template original.

**Estado:** Referencia (no se usan en ParkNow)
- `Login.tsx` - Login del template
- `Register.tsx` - Registro del template
- `UserProfile.tsx` - Perfil de usuario
- `LogOut.tsx` - Logout
- `AuthIcon.tsx` - Iconos de autenticación

**Nota:** ParkNow usa `/views/LoginBoxed.tsx`

### 🎨 `/Components/`
Biblioteca completa de componentes UI del template.

**Estado:** Biblioteca de referencia
- `Forms/` - Ejemplos de formularios (38 archivos)
- `Navigation/` - Componentes de navegación (19 archivos)
- `Table/` - Ejemplos de tablas (14 archivos)
- `UIElement/` - Elementos de UI (58 archivos)
- `MapsGoogle.tsx` - Integración con Google Maps
- `MapsLeaflet.tsx` - Integración con Leaflet Maps

**Uso:** Consultar cuando necesites implementar un componente similar

### 📄 `/Pages/`
Páginas auxiliares útiles del template.

**Estado:** Disponibles para uso
- `Account/` - Gestión de cuenta de usuario
- `Settings/` - Página de configuración
- `Pricing/` - Página de precios
- `Faqs/` - Preguntas frecuentes
- `ContactUs/` - Página de contacto
- Y más...

**Uso:** Pueden integrarse en ParkNow si se necesitan

### 👥 `/Users/`
Gestión de usuarios del template original.

**Estado:** Referencia (no se usan en ParkNow)
- `ListView.tsx` - Vista de lista de usuarios
- `GridView.tsx` - Vista de cuadrícula de usuarios

**Nota:** ParkNow usa `/views/UsuariosListView.tsx`

## 🔄 Relación con `/views/`

| Carpeta | Propósito | Ejemplo |
|---------|-----------|---------|
| `/pages/` | Biblioteca del template | `Components/Forms/FormsBasic.tsx` |
| `/views/` | Páginas de ParkNow | `DashboardAnalytics.tsx` |

## ✅ Cuándo Usar `/pages/`

✅ **SÍ usar cuando:**
- Necesitas ver ejemplos de implementación de UI
- Quieres consultar patrones de diseño
- Buscas inspiración para un componente
- Necesitas páginas auxiliares (Settings, FAQs, etc.)

❌ **NO usar cuando:**
- Vas a crear una nueva página de ParkNow → usar `/views/`
- Necesitas un componente reutilizable de ParkNow → usar `/components/`
- Vas a implementar lógica de negocio → usar `/services/`

## 📝 Ejemplo de Uso

### Consultar Referencia
```typescript
// Ver cómo se implementa un formulario con validación
// Archivo: pages/Components/Forms/FormValidation.tsx
```

### Usar Página Auxiliar
```typescript
// Agregar ruta a Settings en allRoutes.ts
import Settings from "pages/Pages/Settings";

const authProtectedRoutes = [
  // ...
  { path: "/settings", component: Settings },
];
```

## 🎨 Componentes UI Disponibles

La carpeta `/Components/` contiene ejemplos de:

### Formularios
- Formularios básicos
- Validación con Formik
- Inputs avanzados
- Selectores
- Date/Time pickers
- File uploads
- Editores de texto

### Navegación
- Navbars
- Breadcrumbs
- Tabs
- Pagination
- Sidebars

### Tablas
- Tablas básicas
- DataTables con React Table
- Tablas con paginación
- Tablas con filtros

### UI Elements
- Botones
- Cards
- Modales
- Dropdowns
- Tooltips
- Badges
- Alerts
- Progress bars
- Y mucho más...

## 🚀 Migración de Componentes

Si encuentras un componente en `/pages/Components/` que necesitas en ParkNow:

1. **Evaluar si es genérico o específico**
   - Genérico → Puede quedarse en `/Common/`
   - Específico de ParkNow → Mover a `/components/`

2. **Adaptar al dominio de ParkNow**
   - Cambiar nombres y props según el negocio
   - Agregar lógica específica si es necesario

3. **Documentar**
   - Agregar comentarios
   - Actualizar README de `/components/`

## 📚 Recursos Adicionales

- Ver `/Common/` para componentes UI genéricos ya extraídos
- Ver `/components/` para componentes específicos de ParkNow
- Ver `/views/` para las páginas principales de la aplicación

---

**Resumen:** Esta carpeta es tu biblioteca de referencia. Las páginas reales de ParkNow están en `/views/`.
