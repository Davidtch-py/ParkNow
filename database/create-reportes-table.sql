-- Crear tabla de reportes para persistencia
CREATE TABLE IF NOT EXISTS reportes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('diario', 'semanal', 'mensual', 'personalizado')),
  titulo VARCHAR(255) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  parqueadero_id INTEGER REFERENCES parqueaderos(id) ON DELETE SET NULL,
  parqueadero_nombre VARCHAR(100),
  controlador VARCHAR(100),
  total_vehiculos INTEGER NOT NULL DEFAULT 0,
  total_ingresos DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tiempo_promedio_estadia DECIMAL(5, 2) NOT NULL DEFAULT 0,
  vehiculos_por_tipo JSONB NOT NULL DEFAULT '{"carros": 0, "motos": 0, "bicicletas": 0}'::jsonb,
  fecha_generacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(20) NOT NULL DEFAULT 'generado' CHECK (estado IN ('generado', 'enviado', 'descargado')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_reportes_fecha_generacion ON reportes(fecha_generacion DESC);
CREATE INDEX IF NOT EXISTS idx_reportes_parqueadero_id ON reportes(parqueadero_id);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON reportes(tipo);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha_inicio_fin ON reportes(fecha_inicio, fecha_fin);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_reportes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reportes_updated_at
BEFORE UPDATE ON reportes
FOR EACH ROW
EXECUTE FUNCTION update_reportes_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE reportes IS 'Tabla para almacenar reportes generados del sistema';
COMMENT ON COLUMN reportes.tipo IS 'Tipo de reporte: diario, semanal, mensual o personalizado';
COMMENT ON COLUMN reportes.vehiculos_por_tipo IS 'JSON con conteo de vehículos por tipo: {carros, motos, bicicletas}';
COMMENT ON COLUMN reportes.estado IS 'Estado del reporte: generado, enviado o descargado';
