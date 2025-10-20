# 🚗 ParkNow - Sistema de Gestión de Parqueaderos

Sistema completo de gestión de parqueaderos con notificaciones en tiempo real (MQTT), autenticación JWT, gestión de horarios con festivos y arquitectura en capas.

## 📋 Características Principales

### Gestión Completa
- ✅ **CRUD de Parqueaderos** con validación GPS y mapas
- ✅ **Gestión de Usuarios** (Admin/Controlador) con JWT
- ✅ **Horarios de Atención** por día + festivos automáticos
- ✅ **Entradas/Salidas** con cálculo automático de tarifas
- ✅ **Espacios Disponibles** en tiempo real
- ✅ **Reportes Avanzados** por fecha, tipo y controlador

### Notificaciones en Tiempo Real
- 🔔 **MQTT WebSocket** para notificaciones instantáneas
- 🚨 **Alertas de Capacidad** cuando ocupación > 75%
- 📊 **Dashboard en Tiempo Real** con métricas actualizadas
- 🎯 **Notificaciones por Rol** (Admin ve todo, Controlador solo sus parqueaderos)

### Validaciones y UX
- 📍 **Validación GPS** (-90 a 90 lat, -180 a 180 lon)
- 🗓️ **Festivos Automáticos** desde API de Colombia
- 🎨 **UI Moderna** con TailwindCSS y componentes reutilizables
- 📱 **Responsive** (Desktop, Tablet, Mobile)
- 🔄 **Página 404** con redirección automática

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│  - Dashboard, Alertas, Horarios, etc.   │
│  - Context MQTT global                  │
│  - Auth Context (JWT)                   │
└──────────────┬──────────────────────────┘
               │ HTTP + WebSocket
┌──────────────▼──────────────────────────┐
│       Backend (Node.js + Express)       │
│  - Controllers (Presentation)           │
│  - Use Cases (Application)              │
│  - Repositories (Persistence)           │
│  - MQTT Broker (Aedes)                  │
└──────────────┬──────────────────────────┘
               │ Sequelize ORM
┌──────────────▼──────────────────────────┐
│         PostgreSQL Database             │
│  - Parqueaderos, Usuarios, Horarios     │
│  - Entradas, Salidas, Reportes          │
└─────────────────────────────────────────┘
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### 1. Clonar e Instalar

```bash
git clone <repo-url>
cd ParkNow

# Backend
cd backend
npm install
cp .env.example .env  # Configurar variables

# Frontend
cd ../frontend
npm install
```

### 2. Base de Datos

```bash
createdb parknow_db
psql -d parknow_db -f database/init.sql
```

### 3. Iniciar Servicios

```bash
# Terminal 1: Backend (puerto 3000)
cd backend
npm run dev

# Terminal 2: Frontend (puerto 3001)
cd frontend
npm start
```

### 4. Acceder

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **MQTT WebSocket**: ws://localhost:8883

### 5. Credenciales de Prueba

**Admin:**
- Email: `admin@parqueadero.com`
- Password: `secret`

**Controlador:**
- Email: `juan.perez@parqueadero.com`
- Password: `secret`

## 📦 Estructura del Proyecto

```
ParkNow/
├── backend/
│   ├── application/          # Casos de uso
│   ├── domain/              # Entidades de dominio
│   ├── infrastructure/      # MQTT, Festivos API
│   ├── persistence/         # Repositorios Sequelize
│   ├── presentation/        # Controladores Express
│   └── server.js           # Punto de entrada
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── contexts/       # Auth + MQTT Context
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API clients
│   │   └── views/          # Páginas principales
│   └── package.json
├── database/
│   └── init.sql           # Schema + seeds
├── docs/
│   ├── deployment/        # Guías de despliegue
│   └── development/       # Docs técnicas
└── .github/workflows/     # CI/CD
```

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express.js** - API REST
- **Sequelize** - ORM para PostgreSQL
- **Aedes** - Broker MQTT embebido
- **JWT** - Autenticación sin estado
- **bcryptjs** - Hash de contraseñas

### Frontend
- **React 18** - UI Library
- **React Router** - Enrutamiento
- **MQTT.js** - Cliente MQTT
- **Axios** - HTTP Client
- **Lucide React** - Iconos
- **React Toastify** - Notificaciones

### Base de Datos
- **PostgreSQL** - RDBMS
- **Triggers** - Lógica de negocio
- **Constraints** - Integridad referencial

## 🔑 Funcionalidades por Rol

### 👨‍💼 Administrador
- ✅ CRUD completo de parqueaderos
- ✅ Gestión de usuarios y controladores
- ✅ Configuración de horarios y tarifas
- ✅ Alertas de capacidad (todas)
- ✅ Reportes completos
- ✅ Dashboard global

### 👨‍🔧 Controlador
- ✅ Registro de entradas/salidas
- ✅ Visualización de espacios disponibles
- ✅ Alertas de sus parqueaderos
- ✅ Reportes de su actividad
- ✅ Dashboard operativo

## 🔔 Sistema de Notificaciones MQTT

### Topics
- `parknow/notificaciones/capacidad` - Alertas de capacidad
- `parknow/notificaciones/entradas` - Entradas de vehículos
- `parknow/notificaciones/salidas` - Salidas de vehículos
- `parknow/parqueadero/{id}/capacidad` - Por parqueadero

### Flujo
1. Usuario registra entrada → Backend actualiza capacidad
2. Si capacidad < 25% → Backend publica en MQTT
3. Todos los clientes conectados reciben notificación
4. Toast aparece según rol (Admin: rojo, Controlador: amarillo)

### Configuración Frontend
```typescript
// Ya configurado en App.tsx
import { MQTTProvider } from './contexts/MQTTContext';
import { useMQTTNotifications } from './hooks/useMQTTNotifications';

// Envuelve la app con MQTTProvider
<MQTTProvider>
  <App />
</MQTTProvider>

// Usa el hook en componentes
useMQTTNotifications(); // Auto-suscribe según rol
```

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Perfil del usuario

### Parqueaderos
- `GET /api/parqueaderos` - Listar todos
- `POST /api/parqueaderos` - Crear (admin)
- `PUT /api/parqueaderos/:id` - Actualizar (admin)
- `DELETE /api/parqueaderos/:id` - Eliminar (admin)
- `GET /api/parqueaderos/alertas/capacidad-baja?umbral=75` - Alertas

### Horarios
- `GET /api/horarios` - Listar todos
- `GET /api/horarios/parqueadero/:id` - Por parqueadero
- `POST /api/horarios` - Crear
- `DELETE /api/horarios/:id` - Eliminar

### Festivos
- `GET /api/festivos` - Listar festivos del año
- `GET /api/festivos/:year` - Festivos de un año específico

### Entradas/Salidas
- `POST /api/entradas` - Registrar entrada
- `POST /api/salidas` - Registrar salida
- `GET /api/entradas/parqueadero/:id/activas` - Activas

### Reportes
- `GET /api/reportes/fecha?inicio=YYYY-MM-DD&fin=YYYY-MM-DD`
- `GET /api/reportes/tipo-vehiculo?tipo=carro`
- `GET /api/reportes/controlador/:id`

## 🚀 Despliegue (CI/CD)

### Servicios Gratuitos
- **Frontend**: Vercel (ilimitado)
- **Backend + MQTT**: Render.com ($0/mes)
- **PostgreSQL**: Render.com (incluido)
- **CI/CD**: GitHub Actions (2000 min/mes)

### Ramas
- `main` → Producción automática
- `develop` → Staging automático

### Configuración
Ver documentación completa en:
- 📄 `docs/deployment/RENDER_SETUP_GRATIS.md` - Setup de Render
- 📄 `docs/deployment/CI_CD_SETUP.md` - Configuración CI/CD

### URLs de Ejemplo
```
Production:
- Frontend: https://parknow.vercel.app
- Backend:  https://parknow-backend.onrender.com

Staging:
- Frontend: https://parknow-staging.vercel.app
- Backend:  https://parknow-backend-staging.onrender.com
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# E2E (si está configurado)
npm run test:e2e
```

## 📚 Documentación Adicional

### Para Desarrollo
- 📄 `docs/development/MQTT_NOTIFICACIONES_GLOBALES.md` - Sistema MQTT
- 📄 `docs/development/FESTIVOS_API.md` - API de festivos
- 📄 `docs/historias_usuario.md` - Historias de usuario

### Para Despliegue
- 📄 `docs/deployment/RENDER_SETUP_GRATIS.md` - Render.com (gratis)
- 📄 `docs/deployment/CI_CD_SETUP.md` - GitHub Actions

### Frontend
- 📄 `frontend/ARCHITECTURE.md` - Arquitectura del frontend
- 📄 `frontend/QUICK_START.md` - Inicio rápido

## 🔒 Seguridad

- ✅ Autenticación JWT con expiración
- ✅ Hash de contraseñas con bcrypt (10 rounds)
- ✅ Middleware de autorización por roles
- ✅ Validación de entrada en todos los endpoints
- ✅ Sanitización de consultas SQL (Sequelize)
- ✅ CORS configurado
- ✅ Variables de entorno para secretos

## 🐛 Troubleshooting

### Backend no inicia
```bash
# Verificar PostgreSQL
psql -d parknow_db -c "SELECT 1;"

# Verificar variables de entorno
cat backend/.env

# Ver logs
cd backend && npm run dev
```

### Frontend no conecta
```bash
# Verificar que backend esté corriendo
curl http://localhost:3000/api/health

# Verificar CORS
# Debe permitir http://localhost:3001
```

### MQTT no funciona
```bash
# Verificar puerto 8883
lsof -i :8883

# Ver logs del broker
# Buscar: "🔌 Broker MQTT iniciado"
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -am 'feat: nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request a `develop`

### Convenciones
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **Ramas**: `feature/`, `bugfix/`, `hotfix/`
- **PRs**: Siempre a `develop`, nunca directo a `main`

## 📄 Licencia

MIT License - Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ por el equipo de ParkNow**

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025
