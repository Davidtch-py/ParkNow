# Configuración de MQTT Broker Gratuito

## Opción 1: HiveMQ Cloud (Recomendado - Gratis)

### 1. Crear cuenta en HiveMQ Cloud

1. Ve a https://console.hivemq.cloud/
2. Crea una cuenta gratuita
3. Click en **Create New Cluster**
4. Selecciona el plan **Free** (hasta 100 conexiones)
5. Elige una región cercana (ej: EU-Central)
6. Click **Create Cluster**

### 2. Configurar credenciales

1. Una vez creado el cluster, ve a **Access Management**
2. Click **Add Credentials**
3. Username: `parknow_user`
4. Password: Genera una contraseña segura
5. Permissions: **Publish and Subscribe**
6. Topic Filter: `parknow/#` (permite todos los topics de ParkNow)
7. **Save**

### 3. Obtener URL de conexión

En la página del cluster verás:
- **Host:** `xxxxx.s2.eu.hivemq.cloud`
- **Port (WebSocket):** `8884`
- **URL completa:** `wss://xxxxx.s2.eu.hivemq.cloud:8884/mqtt`

### 4. Configurar variables de entorno

#### Frontend (Vercel):

Ve a Vercel → Settings → Environment Variables y agrega:

```
REACT_APP_MQTT_URL=tu-cluster.s2.eu.hivemq.cloud:8884/mqtt
REACT_APP_MQTT_USERNAME=parknow_user
REACT_APP_MQTT_PASSWORD=tu_password_segura
```

**Nota:** No es necesario incluir `wss://` en la URL, el código lo agregará automáticamente cuando la página se cargue por HTTPS. Si prefieres incluirlo, usa:
```
REACT_APP_MQTT_URL=wss://tu-cluster.s2.eu.hivemq.cloud:8884/mqtt
```

#### Backend (Render):

Ve a Render → Environment y agrega:

```
MQTT_BROKER_URL=mqtt://tu-cluster.s2.eu.hivemq.cloud:1883
MQTT_USERNAME=parknow_user
MQTT_PASSWORD=tu_password_segura
```

O para WebSocket desde el backend:
```
MQTT_BROKER_URL=wss://tu-cluster.s2.eu.hivemq.cloud:8884/mqtt
```

---

## Opción 2: EMQX Cloud (Alternativa Gratuita)

### 1. Crear cuenta

1. Ve a https://www.emqx.com/en/cloud
2. Crea una cuenta
3. Click **Create Deployment**
4. Selecciona **Serverless** 

### 2. Configurar

Similar a HiveMQ, obtendrás:
- Host
- Puerto WebSocket (8084)
- Credenciales

---

## Opción 3: Broker Público de Prueba (Solo para desarrollo)

**⚠️ NO usar en producción - Sin seguridad**

Para pruebas rápidas puedes usar:

```
REACT_APP_MQTT_URL=wss://broker.emqx.io:8084/mqtt
```

No requiere credenciales pero es público y cualquiera puede ver los mensajes.

---

## Actualizar el Backend

El backend también necesita conectarse al mismo broker. Actualiza las variables en Render:

```
MQTT_BROKER_URL=wss://tu-cluster.s2.eu.hivemq.cloud:8884/mqtt
MQTT_USERNAME=parknow_user
MQTT_PASSWORD=tu_password_segura
```

Y actualiza el código del backend para usar estas variables.

---

## Verificar Conexión

1. Despliega el frontend con las nuevas variables
2. Abre la consola del navegador
3. Deberías ver: `✅ Conectado a MQTT Broker`
4. Prueba registrando una entrada/salida de vehículo
5. Deberías recibir notificaciones en tiempo real

---

## Troubleshooting

### Error: Connection refused
- Verifica que la URL sea correcta (debe empezar con `wss://` para WebSocket seguro)
- Verifica que el puerto sea `8884` para WebSocket

### Error: Authentication failed
- Verifica username y password
- Verifica que el usuario tenga permisos para `parknow/#`

### No recibo notificaciones
- Verifica que el backend esté publicando mensajes
- Verifica los topics en HiveMQ Cloud Dashboard → **Trace**
- Verifica la consola del navegador para errores
