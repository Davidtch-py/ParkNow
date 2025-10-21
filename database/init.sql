-- Creación de la base de datos para el sistema de parqueaderos
-- PostgreSQL Script

-- Crear la base de datos (ejecutar como superusuario)
-- CREATE DATABASE parqueadero_db;
-- \c parqueadero_db;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (administradores y controladores)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('ADMIN', 'CONTROLADOR')) DEFAULT 'CONTROLADOR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tipos de vehículos
CREATE TABLE tipos_vehiculos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de parqueaderos
CREATE TABLE parqueaderos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    capacidad_total INTEGER NOT NULL CHECK (capacidad_total > 0),
    estado VARCHAR(1) CHECK (estado IN ('A', 'I')) DEFAULT 'A', -- A=Activo, I=Inactivo
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación parqueaderos-usuarios (controladores asignados)
CREATE TABLE parqueaderos_usuarios (
    id SERIAL PRIMARY KEY,
    id_parqueadero INTEGER REFERENCES parqueaderos(id) ON DELETE CASCADE,
    id_usuario INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_asignacion DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_parqueadero, id_usuario)
);

-- Tabla de vehículos
CREATE TABLE vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    id_tipo_vehiculo INTEGER REFERENCES tipos_vehiculos(id) ON DELETE RESTRICT,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    color VARCHAR(30),
    propietario VARCHAR(100),
    telefono VARCHAR(15),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de espacios de parqueadero
CREATE TABLE espacios (
    id SERIAL PRIMARY KEY,
    id_parqueadero INTEGER REFERENCES parqueaderos(id) ON DELETE CASCADE,
    codigo_espacio VARCHAR(10) NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('LIBRE', 'OCUPADO', 'RESERVADO', 'FUERA_SERVICIO')) DEFAULT 'LIBRE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_parqueadero, codigo_espacio)
);

-- Tabla de tarifas
CREATE TABLE tarifas (
    id SERIAL PRIMARY KEY,
    id_parqueadero INTEGER REFERENCES parqueaderos(id) ON DELETE CASCADE,
    valor_hora DECIMAL(10, 2) NOT NULL,
    valor_dia DECIMAL(10, 2) NOT NULL,
    valor_mes DECIMAL(10, 2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de festivos
CREATE TABLE festivos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de horarios de atención
CREATE TABLE horarios (
    id SERIAL PRIMARY KEY,
    id_parqueadero INTEGER REFERENCES parqueaderos(id) ON DELETE CASCADE,
    dia_semana VARCHAR(20) CHECK (dia_semana IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO', 'FESTIVO')),
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    es_festivo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de registros (entradas y salidas unificadas)
CREATE TABLE registros (
    id SERIAL PRIMARY KEY,
    id_vehiculo INTEGER REFERENCES vehiculos(id) ON DELETE RESTRICT,
    id_usuario INTEGER REFERENCES usuarios(id) ON DELETE RESTRICT,
    id_espacio INTEGER REFERENCES espacios(id) ON DELETE RESTRICT,
    fecha_ingreso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_salida TIMESTAMP WITH TIME ZONE,
    monto_total DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de alianzas comerciales
CREATE TABLE alianzas (
    id SERIAL PRIMARY KEY,
    id_parqueadero INTEGER REFERENCES parqueaderos(id) ON DELETE CASCADE,
    nombre_comercial VARCHAR(100) NOT NULL,
    descripcion TEXT,
    descuento_porcentaje DECIMAL(5, 2) CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para suscripciones de vehículos
CREATE TABLE suscripciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_mensual DECIMAL(10, 2) NOT NULL,
    beneficios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación vehículos-suscripciones
CREATE TABLE vehiculos_suscripciones (
    id SERIAL PRIMARY KEY,
    id_vehiculo INTEGER REFERENCES vehiculos(id) ON DELETE CASCADE,
    id_suscripcion INTEGER REFERENCES suscripciones(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX idx_vehiculos_tipo ON vehiculos(id_tipo_vehiculo);
CREATE INDEX idx_registros_vehiculo ON registros(id_vehiculo);
CREATE INDEX idx_registros_usuario ON registros(id_usuario);
CREATE INDEX idx_registros_espacio ON registros(id_espacio);
CREATE INDEX idx_registros_fecha_ingreso ON registros(fecha_ingreso);
CREATE INDEX idx_registros_fecha_salida ON registros(fecha_salida);
CREATE INDEX idx_espacios_parqueadero ON espacios(id_parqueadero);
CREATE INDEX idx_espacios_estado ON espacios(estado);
CREATE INDEX idx_parqueaderos_usuarios_parqueadero ON parqueaderos_usuarios(id_parqueadero);
CREATE INDEX idx_parqueaderos_usuarios_usuario ON parqueaderos_usuarios(id_usuario);
CREATE INDEX idx_tarifas_vigencia ON tarifas(fecha_inicio, fecha_fin);
CREATE INDEX idx_horarios_parqueadero ON horarios(id_parqueadero);
CREATE INDEX idx_festivos_fecha ON festivos(fecha);
CREATE INDEX idx_alianzas_parqueadero ON alianzas(id_parqueadero);
CREATE INDEX idx_vehiculos_suscripciones_vehiculo ON vehiculos_suscripciones(id_vehiculo);
CREATE INDEX idx_vehiculos_suscripciones_fecha ON vehiculos_suscripciones(fecha_inicio, fecha_fin);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tipos_vehiculos_updated_at BEFORE UPDATE ON tipos_vehiculos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parqueaderos_updated_at BEFORE UPDATE ON parqueaderos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parqueaderos_usuarios_updated_at BEFORE UPDATE ON parqueaderos_usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehiculos_updated_at BEFORE UPDATE ON vehiculos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_espacios_updated_at BEFORE UPDATE ON espacios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarifas_updated_at BEFORE UPDATE ON tarifas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horarios_updated_at BEFORE UPDATE ON horarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_festivos_updated_at BEFORE UPDATE ON festivos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registros_updated_at BEFORE UPDATE ON registros
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alianzas_updated_at BEFORE UPDATE ON alianzas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suscripciones_updated_at BEFORE UPDATE ON suscripciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehiculos_suscripciones_updated_at BEFORE UPDATE ON vehiculos_suscripciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para verificar disponibilidad de espacio antes de insertar registro
CREATE OR REPLACE FUNCTION check_espacio_disponible()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT estado FROM espacios WHERE id = NEW.id_espacio) != 'LIBRE' THEN
        RAISE EXCEPTION 'El espacio no está disponible';
    END IF;
    
    -- Marcar espacio como ocupado
    UPDATE espacios SET estado = 'OCUPADO' WHERE id = NEW.id_espacio;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para liberar espacio cuando se registra salida
CREATE OR REPLACE FUNCTION liberar_espacio_salida()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se actualiza fecha_salida (registro de salida)
    IF NEW.fecha_salida IS NOT NULL AND OLD.fecha_salida IS NULL THEN
        UPDATE espacios SET estado = 'LIBRE' WHERE id = NEW.id_espacio;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para gestión automática de espacios
CREATE TRIGGER check_espacio_ingreso BEFORE INSERT ON registros
    FOR EACH ROW EXECUTE FUNCTION check_espacio_disponible();

CREATE TRIGGER liberar_espacio_update BEFORE UPDATE ON registros
    FOR EACH ROW EXECUTE FUNCTION liberar_espacio_salida();

-- Función para obtener el horario aplicable según fecha
CREATE OR REPLACE FUNCTION obtener_horario_aplicable(
    p_id_parqueadero INTEGER,
    p_fecha DATE
)
RETURNS TABLE (
    id INTEGER,
    hora_apertura TIME,
    hora_cierre TIME,
    tipo_dia VARCHAR(20)
) AS $$
DECLARE
    v_es_festivo BOOLEAN;
    v_dia_semana VARCHAR(20);
BEGIN
    -- Verificar si la fecha es festivo
    v_es_festivo := es_fecha_festivo(p_fecha);
    
    IF v_es_festivo THEN
        -- Buscar horario de festivo
        RETURN QUERY
        SELECT h.id, h.hora_apertura, h.hora_cierre, 'FESTIVO'::VARCHAR(20)
        FROM horarios h
        WHERE h.id_parqueadero = p_id_parqueadero
          AND h.es_festivo = TRUE
          AND h.activo = TRUE
        LIMIT 1;
    ELSE
        -- Obtener día de la semana
        v_dia_semana := CASE EXTRACT(DOW FROM p_fecha)
            WHEN 0 THEN 'DOMINGO'
            WHEN 1 THEN 'LUNES'
            WHEN 2 THEN 'MARTES'
            WHEN 3 THEN 'MIERCOLES'
            WHEN 4 THEN 'JUEVES'
            WHEN 5 THEN 'VIERNES'
            WHEN 6 THEN 'SABADO'
        END;
        
        -- Buscar horario del día de la semana
        RETURN QUERY
        SELECT h.id, h.hora_apertura, h.hora_cierre, v_dia_semana
        FROM horarios h
        WHERE h.id_parqueadero = p_id_parqueadero
          AND h.dia_semana = v_dia_semana
          AND h.activo = TRUE
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON DATABASE parqueadero_db IS 'Base de datos para sistema de gestión de parqueaderos ParkNow';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema (administradores y controladores)';
COMMENT ON TABLE tipos_vehiculos IS 'Catálogo de tipos de vehículos';
COMMENT ON TABLE parqueaderos IS 'Información de los parqueaderos';
COMMENT ON TABLE parqueaderos_usuarios IS 'Asignación de controladores a parqueaderos';
COMMENT ON TABLE vehiculos IS 'Registro de vehículos';
COMMENT ON TABLE espacios IS 'Espacios individuales de cada parqueadero';
COMMENT ON TABLE tarifas IS 'Tarifas por parqueadero';
COMMENT ON TABLE festivos IS 'Días festivos del año';
COMMENT ON TABLE horarios IS 'Horarios de atención de los parqueaderos';
COMMENT ON TABLE registros IS 'Registro unificado de entradas y salidas de vehículos';
COMMENT ON TABLE alianzas IS 'Alianzas comerciales con descuentos';
COMMENT ON TABLE suscripciones IS 'Planes de suscripción disponibles';
COMMENT ON TABLE vehiculos_suscripciones IS 'Suscripciones activas de vehículos';

-- NOTA: Los festivos se sincronizan automáticamente desde la API de Colombia
-- Usar el endpoint: POST /api/festivos/sincronizar/auto
-- O manualmente: POST /api/festivos/sincronizar/{year}

-- Función para verificar si una fecha es festivo
CREATE OR REPLACE FUNCTION es_fecha_festivo(fecha_consulta DATE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM festivos WHERE fecha = fecha_consulta
    );
END;
$$ LANGUAGE plpgsql;