# Guía de Deployment - ParkNow

## Variables de Entorno Requeridas

### Frontend (Vercel)

Configura estas variables en Vercel Dashboard → Tu Proyecto → Settings → Environment Variables:

#### Production:
```
REACT_APP_API_URL=https://parknow-backend.onrender.com/api
```

#### Preview/Development:
```
REACT_APP_API_URL=https://parknow-backend-staging.onrender.com/api
```

### Backend (Render)

Configura estas variables en Render Dashboard → Tu Servicio → Environment:

#### Production:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://parknow:PASSWORD@dpg-XXXXX.ohio-postgres.render.com:5432/parknow
JWT_SECRET=tu_jwt_secret_seguro
MQTT_PORT=1883
MQTT_WS_PORT=8883
FRONTEND_URL=https://parknow.vercel.app
```

**Nota:** El backend permite automáticamente todos los dominios `*.vercel.app`, pero puedes especificar `FRONTEND_URL` para mayor control.

## GitHub Actions Secrets

Configura estos secrets en GitHub → Settings → Secrets and variables → Actions:

### Vercel:
- `VERCEL_TOKEN` - Token de tu cuenta Vercel
- `VERCEL_ORG_ID` - ID de tu organización/usuario
- `VERCEL_PROJECT_ID` - ID del proyecto

### Render:
- `RENDER_API_KEY` - API Key de Render
- `RENDER_SERVICE_ID` - ID del servicio de producción
- `RENDER_SERVICE_ID_STAGING` - ID del servicio de staging

### URLs:
- `PROD_API_URL` - https://parknow-backend.onrender.com/api
- `STAGING_API_URL` - https://parknow-backend-staging.onrender.com/api

## Pasos para Deployment

### 1. Backend en Render

1. Crear base de datos PostgreSQL
2. Crear Web Service
3. Configurar variables de entorno
4. Deploy automático desde GitHub

### 2. Frontend en Vercel

1. Importar proyecto desde GitHub
2. **NO configurar Root Directory** (dejar en blanco, el script lo maneja)
3. Configurar variables de entorno:
   - `REACT_APP_API_URL=https://parknow-backend.onrender.com/api`
4. En **Settings** → **Git**:
   - Ignored Build Step: `bash vercel-ignore-build.sh`
   - Esto evitará deploys innecesarios cuando solo cambien archivos del backend
5. Deploy automático solo cuando cambien archivos del frontend

### 3. GitHub Actions

Los workflows se ejecutarán automáticamente al hacer push a:
- `main` → Deploy a producción
- `develop` → Deploy a staging

## URLs del Proyecto

- **Frontend Production:** https://tu-proyecto.vercel.app
- **Backend Production:** https://parknow-backend.onrender.com
- **API Docs:** https://parknow-backend.onrender.com/api

## Troubleshooting

### Error de conexión al backend
- Verificar que `REACT_APP_API_URL` esté configurada en Vercel
- Verificar que el backend esté corriendo en Render
- Verificar CORS en el backend

### Error de base de datos
- Verificar que `DATABASE_URL` tenga el formato completo con puerto `:5432`
- Verificar que la base de datos esté activa en Render

### Build fallido en Vercel
- Verificar que `.npmrc` con `legacy-peer-deps=true` esté en el repo
- Verificar que `vercel.json` tenga `--legacy-peer-deps` en los comandos
