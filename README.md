# 🚗 ParkNow - Sistema de Gestión de Parqueaderos

ParkNow es un sistema completo de gestión de parqueaderos desarrollado con Node.js, Express, React y PostgreSQL, siguiendo una arquitectura en capas robusta y escalable.

## 📋 Características Principales

- ✅ **Gestión de Parqueaderos**: CRUD completo con información de capacidad y ubicación
- ✅ **Control de Entradas y Salidas**: Registro en tiempo real con cálculo automático de tarifas
- ✅ **Sistema de Usuarios**: Autenticación JWT con roles (admin/controlador)
- ✅ **Alertas de Capacidad**: Notificaciones cuando la ocupación es alta
- ✅ **Reportes Avanzados**: Por fecha, tipo de vehículo y controlador
- ✅ **Gestión de Tarifas**: Tarifas planas configurables por tipo de vehículo
- ✅ **Dashboard en Tiempo Real**: Visualización del estado actual del sistema

## 🏗️ Arquitectura en Capas

El proyecto sigue el patrón de arquitectura en capas para garantizar separación de responsabilidades y facilidad de mantenimiento:

```
┌─────────────────────────────────────────┐
│            User Interface               │ ← React Frontend
├─────────────────────────────────────────┤
│            Presentation                 │ ← Express Controllers
├─────────────────────────────────────────┤
│            Application                  │ ← Use Cases & Business Logic
├─────────────────────────────────────────┤
│            Domain Model                 │ ← Entities & Domain Rules
├─────────────────────────────────────────┤
│            Persistence                  │ ← Sequelize Repositories
├─────────────────────────────────────────┤
│               Data                      │ ← PostgreSQL Database
└─────────────────────────────────────────┘
```

### Estructura del Proyecto

```
parqueadero-app/
├── backend/                    # API Node.js + Express
│   ├── domain/                # Entidades de dominio
│   ├── application/           # Casos de uso
│   ├── presentation/          # Controladores Express
│   ├── persistence/           # Repositorios Sequelize
│   ├── infrastructure/        # Middleware y configuración
│   ├── package.json
│   └── server.js             # Punto de entrada del servidor
├── frontend/                  # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── views/           # Páginas principales
│   │   ├── services/        # Servicios API
│   │   ├── context/         # Context API (Auth)
│   │   └── main.jsx         # Punto de entrada React
│   ├── package.json
│   └── vite.config.js
├── database/                  # Scripts SQL
│   ├── init.sql              # Creación de tablas
│   └── seeds.sql             # Datos de prueba
└── docs/                     # Documentación
    ├── historias_usuario.md
    └── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

### 1. Configurar la Base de Datos

```bash
# Crear base de datos PostgreSQL
createdb parqueadero_db

# Ejecutar scripts de inicialización
psql -d parqueadero_db -f database/init.sql
psql -d parqueadero_db -f database/seeds.sql
```

### 2. Configurar Backend

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Editar .env con tu configuración:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=parqueadero_db
# DB_USER=tu_usuario
# DB_PASSWORD=tu_password
# JWT_SECRET=tu_secreto_jwt

# Iniciar servidor de desarrollo
npm run dev
```

El servidor backend estará disponible en `http://localhost:3000`

### 3. Configurar Frontend

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🔑 Credenciales de Prueba

### Administrador
- **Email**: `admin@parqueadero.com`
- **Contraseña**: `secret`
- **Permisos**: Acceso completo al sistema

### Controlador
- **Email**: `juan.perez@parqueadero.com`
- **Contraseña**: `secret`
- **Permisos**: Registro de entradas/salidas y reportes

## 📊 Funcionalidades por Rol

### 👨‍💼 Administrador
- ✅ Gestión completa de parqueaderos
- ✅ Gestión de usuarios y controladores
- ✅ Configuración de tarifas
- ✅ Acceso a todos los reportes
- ✅ Dashboard completo

### 👨‍🔧 Controlador
- ✅ Registro de entradas de vehículos
- ✅ Registro de salidas y cobros
- ✅ Visualización de espacios disponibles
- ✅ Reportes de su actividad
- ✅ Dashboard operativo

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación sin estado
- **bcryptjs** - Hash de contraseñas
- **cors** - Políticas de origen cruzado
- **dotenv** - Variables de entorno

### Frontend
- **React 18** - Librería de UI
- **Vite** - Build tool y servidor de desarrollo
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **Lucide React** - Iconos
- **CSS3** - Estilos responsive

### Base de Datos
- **PostgreSQL** - RDBMS principal
- **Triggers** - Lógica de negocio a nivel DB
- **Índices** - Optimización de consultas
- **Constraints** - Integridad de datos

## 🔄 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil

### Parqueaderos
- `GET /api/parqueaderos` - Listar parqueaderos
- `POST /api/parqueaderos` - Crear parqueadero (admin)
- `PUT /api/parqueaderos/:id` - Actualizar parqueadero (admin)
- `DELETE /api/parqueaderos/:id` - Eliminar parqueadero (admin)
- `GET /api/parqueaderos/alertas/capacidad-baja` - Alertas

### Entradas
- `POST /api/entradas` - Registrar entrada
- `GET /api/entradas` - Listar entradas
- `GET /api/entradas/parqueadero/:id/activas` - Entradas activas

### Salidas
- `POST /api/salidas` - Registrar salida
- `GET /api/salidas` - Listar salidas

### Reportes
- `GET /api/reportes/fecha` - Reporte por fecha
- `GET /api/reportes/tipo-vehiculo` - Reporte por tipo
- `GET /api/reportes/controlador` - Reporte por controlador

## 📈 Datos de Prueba

El sistema incluye datos de prueba que permiten explorar todas las funcionalidades:

- **4 Parqueaderos** con diferentes capacidades y ubicaciones
- **8 Vehículos** de diferentes tipos (carros, motos, bicicletas)
- **Tarifas configuradas** para todos los tipos de vehículos
- **Horarios de atención** variados por parqueadero
- **Entradas activas** para simular ocupación
- **Historial de transacciones** para generar reportes

## 🧪 Scripts de Desarrollo

### Backend
```bash
npm start          # Servidor de producción
npm run dev        # Servidor de desarrollo con nodemon
npm test           # Ejecutar tests (Jest)
```

### Frontend
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run preview    # Preview del build
npm run lint       # Verificar código con ESLint
```

## 🔒 Seguridad

- **Autenticación JWT** con expiración configurada
- **Hash de contraseñas** con bcrypt y salt rounds
- **Middleware de autorización** por roles
- **Validación de entrada** en todos los endpoints
- **Sanitización de datos** en consultas SQL
- **CORS configurado** para origen específico

## 📱 Responsive Design

El frontend está optimizado para:
- 💻 **Desktop** (1200px+)
- 📱 **Tablet** (768px - 1199px)
- 📱 **Mobile** (320px - 767px)

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
PORT=3000
DB_HOST=tu_host_produccion
DB_NAME=parqueadero_prod
JWT_SECRET=secreto_muy_seguro_para_produccion
```

### Build de Producción
```bash
# Backend
npm start

# Frontend
npm run build
# Servir archivos estáticos desde /dist
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request


## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ por el equipo de ParkNow**
