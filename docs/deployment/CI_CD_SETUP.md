# CI/CD Setup - GitHub Actions (100% Gratis)

## 🎯 Arquitectura de Despliegue

### Producción (main)
- **Frontend**: Vercel (gratis ilimitado)
- **Backend + MQTT**: Railway.app (tier gratuito)
- **Base de Datos**: PostgreSQL en Railway (gratis)
- **URL**: `parknow-production.vercel.app`

### Staging (develop)
- **Frontend**: Vercel Preview (gratis ilimitado)
- **Backend + MQTT**: Railway.app staging (gratis)
- **Base de Datos**: PostgreSQL staging en Railway (gratis)
- **URL**: `parknow-staging.vercel.app`

## 📦 Servicios Gratuitos Utilizados

| Servicio | Tier Gratuito | Uso |
|----------|---------------|-----|
| **GitHub Actions** | 2000 min/mes | CI/CD |
| **Vercel** | Ilimitado | Frontend |
| **Railway.app** | $5 crédito/mes | Backend + DB + MQTT |
| **PostgreSQL** | Incluido en Railway | Base de datos |

## 🚀 Configuración Paso a Paso

### 1. Crear Cuenta en Railway.app

```bash
# 1. Ve a https://railway.app
# 2. Sign up con GitHub
# 3. Crea un nuevo proyecto: "ParkNow"
```

### 2. Configurar Base de Datos en Railway

```bash
# En Railway Dashboard:
# 1. Click "New" → "Database" → "PostgreSQL"
# 2. Nombrar: "parknow-db-production"
# 3. Copiar DATABASE_URL de las variables
# 4. Repetir para staging: "parknow-db-staging"
```

### 3. Configurar Backend en Railway

```bash
# En Railway Dashboard:
# 1. Click "New" → "GitHub Repo"
# 2. Seleccionar tu repositorio
# 3. Nombrar servicio: "backend-production"
# 4. Configurar variables de entorno:
```

**Variables de Entorno (Production):**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=${POSTGRES_DATABASE_URL}
JWT_SECRET=tu-secret-super-seguro-aqui
MQTT_PORT=1883
MQTT_WS_PORT=8883
```

**Variables de Entorno (Staging):**
```env
NODE_ENV=staging
PORT=3000
DATABASE_URL=${POSTGRES_DATABASE_URL_STAGING}
JWT_SECRET=tu-secret-staging-aqui
MQTT_PORT=1883
MQTT_WS_PORT=8883
```

### 4. Crear Cuenta en Vercel

```bash
# 1. Ve a https://vercel.com
# 2. Sign up con GitHub
# 3. Import Project → Selecciona tu repo
# 4. Framework Preset: Create React App
# 5. Root Directory: frontend
```

### 5. Configurar Variables en Vercel

**Production (main branch):**
```env
REACT_APP_API_URL=https://backend-production.railway.app
```

**Preview (develop branch):**
```env
REACT_APP_API_URL=https://backend-staging.railway.app
```

### 6. Configurar Secrets en GitHub

Ve a: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

**Secrets Requeridos:**

```bash
# Vercel
VERCEL_TOKEN=<tu-token-de-vercel>
VERCEL_ORG_ID=<tu-org-id>
VERCEL_PROJECT_ID=<tu-project-id>

# Railway
RAILWAY_TOKEN=<tu-railway-token>

# URLs
PROD_API_URL=https://backend-production.railway.app
STAGING_API_URL=https://backend-staging.railway.app
```

#### Cómo Obtener los Tokens:

**Vercel Token:**
```bash
# 1. Ve a https://vercel.com/account/tokens
# 2. Create Token → Nombre: "GitHub Actions"
# 3. Copiar token
```

**Vercel Org ID y Project ID:**
```bash
# 1. Ve a tu proyecto en Vercel
# 2. Settings → General
# 3. Copiar "Project ID" y "Team ID"
```

**Railway Token:**
```bash
# 1. Ve a https://railway.app/account/tokens
# 2. Create Token → Nombre: "GitHub Actions"
# 3. Copiar token
```

## 🔄 Flujo de Trabajo

### Desarrollo Normal

```bash
# 1. Crear rama feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commit
git add .
git commit -m "feat: nueva funcionalidad"

# 3. Push a GitHub
git push origin feature/nueva-funcionalidad

# 4. Crear Pull Request a develop
# No se ejecuta CI/CD automáticamente

# 5. Merge a develop
# ✅ Se ejecuta deploy-develop.yml
# ✅ Frontend → Vercel Preview
# ✅ Backend → Railway Staging

# 6. Probar en staging
# URL: https://parknow-staging.vercel.app

# 7. Si todo OK, merge develop → main
# ✅ Se ejecuta deploy-production.yml
# ✅ Frontend → Vercel Production
# ✅ Backend → Railway Production
```

### Deploy Manual

```bash
# En GitHub:
# 1. Ve a Actions
# 2. Selecciona workflow
# 3. Click "Run workflow"
# 4. Selecciona rama
```

## 💰 Costos y Límites

### GitHub Actions (Gratis)
- ✅ 2000 minutos/mes
- ✅ Cada deploy ~5-10 minutos
- ✅ ~200-400 deploys/mes gratis
- ⚠️ Si se excede: $0.008/minuto

### Vercel (Gratis)
- ✅ Deploys ilimitados
- ✅ 100 GB bandwidth/mes
- ✅ Previews ilimitados
- ⚠️ Si se excede: $20/mes Pro

### Railway (Gratis)
- ✅ $5 crédito/mes
- ✅ ~500 horas de ejecución
- ✅ 1 GB RAM, 1 vCPU
- ⚠️ Si se excede: $0.000231/GB-hour

## 🛡️ Protecciones para Evitar Costos

### 1. Timeouts en Workflows

```yaml
timeout-minutes: 10  # Máximo 10 minutos por job
```

### 2. Concurrency Control

```yaml
concurrency:
  group: production-${{ github.ref }}
  cancel-in-progress: true  # Cancela builds anteriores
```

### 3. Artifact Retention

```yaml
retention-days: 1  # Solo 1 día de retención
```

### 4. Cache de Dependencias

```yaml
cache: 'npm'  # Cachea node_modules
```

### 5. Conditional Jobs

```yaml
if: github.event_name == 'push'  # Solo en push, no en PRs
```

## 📊 Monitoreo de Uso

### GitHub Actions
```bash
# Ve a: Settings → Billing → Plans and usage
# Revisa: Actions minutes used
```

### Vercel
```bash
# Dashboard → Usage
# Revisa: Bandwidth, Builds
```

### Railway
```bash
# Dashboard → Usage
# Revisa: Créditos restantes
```

## 🚨 Alertas de Límite

### Configurar Alertas en GitHub

```bash
# 1. Settings → Billing → Spending limit
# 2. Set limit: $0 (no gastar nada)
# 3. Email notifications: ON
```

### Configurar Alertas en Railway

```bash
# 1. Project Settings → Usage
# 2. Set alert: 80% of $5 credit
# 3. Email notifications: ON
```

## 🔧 Troubleshooting

### Error: "Workflow run exceeded timeout"

**Solución:**
```yaml
# Aumentar timeout o optimizar build
timeout-minutes: 15
```

### Error: "Railway deployment failed"

**Solución:**
```bash
# 1. Verificar logs en Railway Dashboard
# 2. Verificar variables de entorno
# 3. Verificar railway.json
```

### Error: "Vercel deployment failed"

**Solución:**
```bash
# 1. Verificar logs en Vercel Dashboard
# 2. Verificar vercel.json
# 3. Verificar build command
```

## 📝 Checklist de Configuración

- [ ] Cuenta Railway creada
- [ ] Cuenta Vercel creada
- [ ] Base de datos PostgreSQL creada (prod + staging)
- [ ] Backend configurado en Railway (prod + staging)
- [ ] Frontend configurado en Vercel
- [ ] Secrets configurados en GitHub
- [ ] Variables de entorno configuradas
- [ ] Workflows probados
- [ ] Alertas de límite configuradas
- [ ] Documentación actualizada

## 🎉 Resultado Final

### URLs de Producción
```
Frontend: https://parknow.vercel.app
Backend:  https://backend-production.railway.app
API:      https://backend-production.railway.app/api
MQTT WS:  wss://backend-production.railway.app:8883
```

### URLs de Staging
```
Frontend: https://parknow-staging.vercel.app
Backend:  https://backend-staging.railway.app
API:      https://backend-staging.railway.app/api
MQTT WS:  wss://backend-staging.railway.app:8883
```

## 📚 Recursos Adicionales

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Estado**: ✅ Configuración Completa
**Costo**: $0/mes (dentro de límites gratuitos)
**Mantenimiento**: Mínimo
