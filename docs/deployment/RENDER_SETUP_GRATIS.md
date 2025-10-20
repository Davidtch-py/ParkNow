# 🆓 Setup Render.com - 100% GRATIS (Sin Tarjeta)

## ✅ Por Qué Render.com

- ✅ **100% Gratis** - No requiere tarjeta de crédito
- ✅ **PostgreSQL incluido** - Base de datos gratis
- ✅ **750 horas/mes** - Suficiente para 1 servicio 24/7
- ✅ **MQTT funciona** - Soporta WebSockets
- ✅ **SSL gratis** - HTTPS automático
- ✅ **No límite de deploys** - Deploys ilimitados

## ⚠️ Única Limitación

- Después de **15 minutos de inactividad**, el servicio se duerme
- Se despierta automáticamente en ~30 segundos al recibir una petición
- **Solución**: Usar un cron job gratuito para mantenerlo despierto

## 🚀 Configuración Paso a Paso

### 1. Crear Cuenta en Render

```bash
# 1. Ve a https://render.com
# 2. Sign Up con GitHub (gratis, sin tarjeta)
# 3. Autoriza acceso a tu repositorio
```

### 2. Crear Base de Datos PostgreSQL

```bash
# En Render Dashboard:
# 1. Click "New +" → "PostgreSQL"
# 2. Name: parknow-db-production
# 3. Database: parknow
# 4. User: parknow
# 5. Region: Oregon (más cercano a Latinoamérica)
# 6. Plan: Free
# 7. Click "Create Database"
# 8. Copiar "Internal Database URL"
```

### 3. Crear Servicio Backend

```bash
# En Render Dashboard:
# 1. Click "New +" → "Web Service"
# 2. Connect tu repositorio de GitHub
# 3. Name: parknow-backend-production
# 4. Region: Oregon
# 5. Branch: main
# 6. Root Directory: (dejar vacío)
# 7. Runtime: Node
# 8. Build Command: cd backend && npm install
# 9. Start Command: cd backend && npm start
# 10. Plan: Free
```

### 4. Configurar Variables de Entorno

En el servicio backend, ve a "Environment" y agrega:

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<pegar-internal-database-url>
JWT_SECRET=tu-secret-super-seguro-cambiar-esto
MQTT_PORT=1883
MQTT_WS_PORT=8883
```

### 5. Crear Servicio Staging (Develop)

Repetir pasos 2-4 pero con:
- Name: `parknow-backend-staging`
- Branch: `develop`
- Database: `parknow-db-staging`

### 6. Obtener Service IDs y API Key

**API Key:**
```bash
# 1. Ve a Account Settings (tu avatar arriba a la derecha)
# 2. API Keys
# 3. Create API Key
# 4. Name: "GitHub Actions"
# 5. Copiar key
```

**Service IDs:**
```bash
# 1. Ve a tu servicio backend
# 2. Settings → General
# 3. Copiar "Service ID" (está en la URL también)
# Ejemplo: srv-abc123xyz
```

### 7. Configurar Secrets en GitHub

Ve a tu repo → Settings → Secrets → Actions → New repository secret

```bash
# Render
RENDER_API_KEY=<tu-api-key>
RENDER_SERVICE_ID=<service-id-production>
RENDER_SERVICE_ID_STAGING=<service-id-staging>

# Vercel (igual que antes)
VERCEL_TOKEN=<tu-vercel-token>
VERCEL_ORG_ID=<tu-org-id>
VERCEL_PROJECT_ID=<tu-project-id>

# URLs
PROD_API_URL=https://parknow-backend-production.onrender.com
STAGING_API_URL=https://parknow-backend-staging.onrender.com
```

## 🔄 Mantener el Servicio Despierto

### Opción 1: Cron-job.org (Gratis)

```bash
# 1. Ve a https://cron-job.org
# 2. Sign up (gratis)
# 3. Create cronjob:
#    - Title: Keep ParkNow Alive
#    - URL: https://parknow-backend-production.onrender.com/api/health
#    - Schedule: Every 10 minutes
#    - Save
```

### Opción 2: UptimeRobot (Gratis)

```bash
# 1. Ve a https://uptimerobot.com
# 2. Sign up (gratis, 50 monitores)
# 3. Add New Monitor:
#    - Type: HTTP(s)
#    - URL: https://parknow-backend-production.onrender.com/api/health
#    - Interval: 5 minutes
#    - Create Monitor
```

### Opción 3: Crear Endpoint Health en Backend

```javascript
// backend/server.js
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 📊 Límites del Tier Gratuito

| Recurso | Límite Gratuito |
|---------|-----------------|
| **Web Services** | 750 horas/mes |
| **PostgreSQL** | 1 GB storage |
| **Bandwidth** | 100 GB/mes |
| **Build Minutes** | 500 min/mes |
| **Concurrent Builds** | 1 |

## 💡 Tips para Optimizar

### 1. Reducir Tiempo de Build

```yaml
# render.yaml
build:
  - cd backend && npm ci --only=production
```

### 2. Usar Cache

Render cachea automáticamente `node_modules` entre builds.

### 3. Logs Eficientes

```javascript
// Solo logs importantes en producción
if (process.env.NODE_ENV === 'production') {
  console.log = () => {}; // Desactiva logs verbose
}
```

## 🔍 Monitoreo

### Dashboard de Render

```bash
# Ve a tu servicio → Logs
# Aquí ves:
# - Logs en tiempo real
# - Métricas de CPU/RAM
# - Requests/segundo
# - Errores
```

### Alertas por Email

```bash
# Render envía emails automáticamente si:
# - El servicio falla al iniciar
# - Hay errores críticos
# - Se excede el uso
```

## 🚨 Troubleshooting

### Problema: "Service is sleeping"

**Causa**: 15 minutos de inactividad

**Solución**: 
1. Configurar cron job (ver arriba)
2. O aceptar el delay de ~30 seg en primera petición

### Problema: "Build failed"

**Solución**:
```bash
# 1. Verificar logs en Render Dashboard
# 2. Verificar que build command sea correcto
# 3. Verificar que package.json tenga start script
```

### Problema: "Database connection failed"

**Solución**:
```bash
# 1. Verificar DATABASE_URL en variables de entorno
# 2. Usar "Internal Database URL" (no External)
# 3. Verificar que la DB esté en la misma región
```

## 📱 URLs Finales

### Producción (main)
```
Frontend: https://parknow.vercel.app
Backend:  https://parknow-backend-production.onrender.com
API:      https://parknow-backend-production.onrender.com/api
MQTT WS:  wss://parknow-backend-production.onrender.com:8883
```

### Staging (develop)
```
Frontend: https://parknow-staging.vercel.app
Backend:  https://parknow-backend-staging.onrender.com
API:      https://parknow-backend-staging.onrender.com/api
MQTT WS:  wss://parknow-backend-staging.onrender.com:8883
```

## ✅ Checklist

- [ ] Cuenta Render creada (sin tarjeta)
- [ ] Base de datos PostgreSQL creada (prod + staging)
- [ ] Servicio backend creado (prod + staging)
- [ ] Variables de entorno configuradas
- [ ] Service IDs copiados
- [ ] API Key creada
- [ ] Secrets configurados en GitHub
- [ ] Cron job configurado (opcional)
- [ ] Health endpoint funcionando
- [ ] Deploy probado

## 💰 Costo Total

```
Render.com:     $0/mes
Vercel:         $0/mes
GitHub Actions: $0/mes (dentro de 2000 min)
Cron-job.org:   $0/mes
UptimeRobot:    $0/mes

TOTAL:          $0/mes 🎉
```

## 🎉 Ventajas vs Railway

| Aspecto | Render | Railway |
|---------|--------|---------|
| **Costo** | $0 | $5 crédito/mes |
| **Tarjeta** | No requiere | Requiere |
| **PostgreSQL** | Gratis | Gratis |
| **Sleep** | Sí (15 min) | No |
| **Límite** | 750h/mes | 500h/mes |
| **Build** | 500 min/mes | Ilimitado |

## 📚 Recursos

- [Render Docs](https://render.com/docs)
- [Render Free Tier](https://render.com/docs/free)
- [Cron-job.org](https://cron-job.org)
- [UptimeRobot](https://uptimerobot.com)

---

**Estado**: ✅ 100% Gratis
**Requiere Tarjeta**: ❌ NO
**Costo Mensual**: $0
**Mantenimiento**: Mínimo (configurar cron job)
