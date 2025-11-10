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
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('admin', 'controlador')) DEFAULT 'controlador',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de parqueaderos
CREATE TABLE parqueaderos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    capacidad_total INTEGER NOT NULL CHECK (capacidad_total > 0),
    capacidad_disponible INTEGER NOT NULL CHECK (capacidad_disponible >= 0),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de vehículos
CREATE TABLE vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('carro', 'moto', 'bicicleta')) NOT NULL,
    color VARCHAR(30),
    marca VARCHAR(50),
    modelo VARCHAR(50),
    propietario VARCHAR(100) NOT NULL,
    telefono VARCHAR(15),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tarifas
CREATE TABLE tarifas (
    id SERIAL PRIMARY KEY,
    parqueadero_id INTEGER REFERENCES parqueaderos(id) ON DELETE CASCADE,
    tipo_vehiculo VARCHAR(20) CHECK (tipo_vehiculo IN ('carro', 'moto', 'bicicleta')) NOT NULL,
    tarifa_hora DECIMAL(10, 2) NOT NULL,
    tarifa_dia DECIMAL(10, 2) NOT NULL,
    tarifa_mes DECIMAL(10, 2) NOT NULL,
    vigencia_desde DATE NOT NULL,
    vigencia_hasta DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de horarios de atención
CREATE TABLE horarios (
    id SERIAL PRIMARY KEY,
    parqueadero_id INTEGER REFERENCES parqueaderos(id) ON DELETE CASCADE,
    dia_semana INTEGER CHECK (dia_semana >= 0 AND dia_semana <= 6) NOT NULL, -- 0=Domingo, 6=Sábado
    hora_apertura TIME NOT NULL,
    hora_cierre TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de entradas
CREATE TABLE entradas (
    id SERIAL PRIMARY KEY,
    vehiculo_id INTEGER REFERENCES vehiculos(id) ON DELETE RESTRICT,
    parqueadero_id INTEGER REFERENCES parqueaderos(id) ON DELETE RESTRICT,
    controlador_id INTEGER REFERENCES usuarios(id) ON DELETE RESTRICT,
    fecha_hora_entrada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    espacio_asignado INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de salidas
CREATE TABLE salidas (
    id SERIAL PRIMARY KEY,
    entrada_id INTEGER UNIQUE REFERENCES entradas(id) ON DELETE RESTRICT,
    fecha_hora_salida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tiempo_total INTEGER NOT NULL, -- en minutos
    monto_total DECIMAL(10, 2) NOT NULL,
    controlador_id INTEGER REFERENCES usuarios(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX idx_entradas_vehiculo ON entradas(vehiculo_id);
CREATE INDEX idx_entradas_parqueadero ON entradas(parqueadero_id);
CREATE INDEX idx_entradas_fecha ON entradas(fecha_hora_entrada);
CREATE INDEX idx_salidas_entrada ON salidas(entrada_id);
CREATE INDEX idx_salidas_fecha ON salidas(fecha_hora_salida);
CREATE INDEX idx_tarifas_vigencia ON tarifas(vigencia_desde, vigencia_hasta);

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

CREATE TRIGGER update_parqueaderos_updated_at BEFORE UPDATE ON parqueaderos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehiculos_updated_at BEFORE UPDATE ON vehiculos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarifas_updated_at BEFORE UPDATE ON tarifas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_horarios_updated_at BEFORE UPDATE ON horarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entradas_updated_at BEFORE UPDATE ON entradas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salidas_updated_at BEFORE UPDATE ON salidas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para verificar capacidad antes de insertar entrada
CREATE OR REPLACE FUNCTION check_capacidad_before_entrada()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT capacidad_disponible FROM parqueaderos WHERE id = NEW.parqueadero_id) <= 0 THEN
        RAISE EXCEPTION 'No hay espacios disponibles en este parqueadero';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para verificar capacidad
CREATE TRIGGER check_capacidad_entrada BEFORE INSERT ON entradas
    FOR EACH ROW EXECUTE FUNCTION check_capacidad_before_entrada();

COMMENT ON DATABASE parqueadero_db IS 'Base de datos para sistema de gestión de parqueaderos';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema (administradores y controladores)';
COMMENT ON TABLE parqueaderos IS 'Información de los parqueaderos';
COMMENT ON TABLE vehiculos IS 'Registro de vehículos';
COMMENT ON TABLE tarifas IS 'Tarifas por tipo de vehículo y parqueadero';
COMMENT ON TABLE horarios IS 'Horarios de atención de los parqueaderos';
COMMENT ON TABLE entradas IS 'Registro de entradas de vehículos';
COMMENT ON TABLE salidas IS 'Registro de salidas de vehículos y cobros';