# Historias de Usuario - Sistema ParkNow

## Historia de Usuario 1: Registrar Parqueadero (CRUD)

**Como** administrador del sistema  
**Quiero** gestionar los parqueaderos  
**Para** mantener actualizada la información de ubicaciones y capacidades

### Criterios de Aceptación:
- Puedo crear un nuevo parqueadero con nombre, dirección, capacidad total y coordenadas
- Puedo ver la lista de todos los parqueaderos registrados
- Puedo editar la información de un parqueadero existente
- Puedo eliminar un parqueadero que ya no esté en operación
- El sistema valida que la capacidad total sea mayor a 0
- Al crear un parqueadero, la capacidad disponible se inicializa igual a la capacidad total

---

## Historia de Usuario 2: Registrar Usuarios Controladores (CRUD)

**Como** administrador del sistema  
**Quiero** gestionar los usuarios controladores  
**Para** asignar responsables de las operaciones de entrada y salida

### Criterios de Aceptación:
- Puedo crear nuevos usuarios con rol de controlador
- Puedo ver la lista de todos los usuarios registrados
- Puedo editar la información de un usuario existente
- Puedo activar/desactivar usuarios según sea necesario
- El sistema valida que el email sea único
- Las contraseñas se almacenan de forma segura (hash)

---

## Historia de Usuario 3: Autenticar Usuario

**Como** usuario del sistema  
**Quiero** iniciar sesión con mis credenciales  
**Para** acceder a las funcionalidades según mi rol

### Criterios de Aceptación:
- Puedo iniciar sesión con email y contraseña
- El sistema valida las credenciales correctamente
- Se genera un token JWT válido por 24 horas
- Los administradores tienen acceso completo al sistema
- Los controladores tienen acceso limitado a operaciones de entrada/salida
- La sesión se mantiene hasta que expira o se cierra manualmente

---

## Historia de Usuario 4: Registrar Horarios de Atención (CRUD)

**Como** administrador del sistema  
**Quiero** definir los horarios de atención por parqueadero  
**Para** controlar los tiempos de operación

### Criterios de Aceptación:
- Puedo definir horarios diferentes para cada día de la semana
- Puedo establecer hora de apertura y cierre para cada día
- Puedo activar/desactivar días específicos
- El sistema valida que la hora de cierre sea posterior a la de apertura
- Algunos parqueaderos pueden operar 24 horas

---

## Historia de Usuario 5: Mostrar Alertas de Poca Capacidad

**Como** controlador o administrador  
**Quiero** recibir alertas cuando un parqueadero tenga poca capacidad disponible  
**Para** tomar acciones preventivas

### Criterios de Aceptación:
- El sistema muestra alertas cuando la capacidad disponible es menor al 20%
- Las alertas se muestran en el dashboard principal
- Se puede configurar el umbral de alerta
- Las alertas incluyen nombre del parqueadero y porcentaje de ocupación
- Se actualiza en tiempo real según entradas y salidas

---

## Historia de Usuario 6: Registrar Entrada de Vehículo

**Como** controlador  
**Quiero** registrar la entrada de un vehículo  
**Para** controlar la ocupación del parqueadero

### Criterios de Aceptación:
- Puedo seleccionar el vehículo de una lista o registrar uno nuevo
- Puedo seleccionar el parqueadero de destino
- Puedo asignar un espacio específico (opcional)
- El sistema verifica que hay capacidad disponible
- Se registra automáticamente la fecha y hora de entrada
- Se reduce la capacidad disponible del parqueadero
- No se permite entrada si el vehículo ya está activo en otro parqueadero

---

## Historia de Usuario 7: Registrar Salida de Vehículo

**Como** controlador  
**Quiero** registrar la salida de un vehículo  
**Para** liberar el espacio y calcular el costo

### Criterios de Aceptación:
- Puedo seleccionar la entrada activa correspondiente
- El sistema calcula automáticamente el tiempo total de estadía
- Se aplica la tarifa vigente según el tipo de vehículo
- Se calcula el monto total a cobrar
- Se registra automáticamente la fecha y hora de salida
- Se aumenta la capacidad disponible del parqueadero
- Se impide registrar salida si no existe entrada activa

---

## Historia de Usuario 8: Mostrar Espacios Disponibles

**Como** controlador o cliente  
**Quiero** ver los espacios disponibles en tiempo real  
**Para** tomar decisiones sobre dónde aparcar

### Criterios de Aceptación:
- El dashboard muestra capacidad disponible por parqueadero
- Se actualiza automáticamente con cada entrada/salida
- Se muestra porcentaje de ocupación con indicadores visuales
- Los parqueaderos con poca capacidad se destacan visualmente
- La información es precisa y está sincronizada

---

## Historia de Usuario 9: Obtener Reportes por Fecha, Tipo de Vehículo y Controlador

**Como** administrador  
**Quiero** generar reportes detallados  
**Para** analizar el desempeño y tomar decisiones

### Criterios de Aceptación:

#### Reporte por Fecha:
- Puedo especificar un rango de fechas
- El reporte incluye total de entradas y salidas
- Se muestran ingresos totales del período
- Se puede filtrar por parqueadero específico

#### Reporte por Tipo de Vehículo:
- Puedo seleccionar tipo de vehículo (carro, moto, bicicleta)
- Se muestra tiempo promedio de estadía
- Se calculan ingresos por tipo de vehículo
- Se puede combinar con filtros de fecha y parqueadero

#### Reporte por Controlador:
- Puedo seleccionar un controlador específico
- Se muestra cantidad de entradas y salidas registradas
- Se incluye el período de análisis
- Ayuda a evaluar productividad del personal

---

## Historia de Usuario 10: Gestión de Tarifas Planas

**Como** administrador  
**Quiero** definir tarifas por tipo de vehículo y parqueadero  
**Para** establecer precios competitivos y justos

### Criterios de Aceptación:
- Puedo definir tarifa por hora, día y mes
- Las tarifas se pueden configurar por tipo de vehículo
- Cada parqueadero puede tener tarifas diferentes
- Se puede establecer vigencia de las tarifas
- El sistema aplica automáticamente la tarifa vigente al calcular costos
- Se optimiza el cálculo (si conviene más tarifa diaria que por horas, se aplica la más económica para el cliente)

---

## Notas Técnicas

### Tecnologías Utilizadas:
- **Backend**: Node.js + Express + Sequelize + PostgreSQL
- **Frontend**: React + Vite + Axios
- **Autenticación**: JWT
- **Base de Datos**: PostgreSQL con triggers y validaciones

### Arquitectura:
- Patrón de capas: Domain, Application, Presentation, Persistence, Infrastructure
- Separación clara de responsabilidades
- API REST para comunicación frontend-backend

### Seguridad:
- Autenticación basada en tokens JWT
- Passwords hasheados con bcrypt
- Middleware de autorización por roles
- Validaciones tanto en frontend como backend