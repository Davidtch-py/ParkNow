-- Datos de prueba para el sistema de parqueaderos
-- PostgreSQL Script

-- Insertar usuarios de prueba
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Admin Principal', 'admin@parqueadero.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'), -- password: secret
('Juan Pérez', 'juan.perez@parqueadero.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'controlador'),
('María García', 'maria.garcia@parqueadero.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'controlador'),
('Carlos Rodríguez', 'carlos.rodriguez@parqueadero.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'controlador');

-- Insertar parqueaderos de prueba
INSERT INTO parqueaderos (nombre, direccion, capacidad_total, capacidad_disponible, latitud, longitud) VALUES
('Parqueadero Centro', 'Calle 50 #10-20, Centro', 100, 85, 4.6097100, -74.0817500),
('Parqueadero Norte', 'Carrera 15 #80-45, Zona Rosa', 150, 120, 4.6629700, -74.0583600),
('Parqueadero Sur', 'Avenida Primera #30-15, Sur', 80, 65, 4.5481200, -74.1141300),
('Parqueadero Chapinero', 'Calle 63 #11-50, Chapinero', 200, 180, 4.6533200, -74.0630100);

-- Insertar vehículos de prueba
INSERT INTO vehiculos (placa, tipo, color, marca, modelo, propietario, telefono) VALUES
('ABC123', 'carro', 'Blanco', 'Toyota', 'Corolla', 'Pedro Martínez', '3001234567'),
('DEF456', 'carro', 'Negro', 'Chevrolet', 'Aveo', 'Ana López', '3009876543'),
('GHI789', 'moto', 'Rojo', 'Yamaha', 'FZ150', 'Luis Sánchez', '3005551234'),
('JKL012', 'moto', 'Azul', 'Honda', 'CB125', 'Carmen Ruiz', '3007778888'),
('MNO345', 'carro', 'Gris', 'Nissan', 'March', 'Roberto Silva', '3002223333'),
('PQR678', 'bicicleta', 'Verde', 'Trek', 'Mountain', 'Sofia Morales', '3004445555'),
('STU901', 'carro', 'Rojo', 'Mazda', 'Mazda3', 'Diego Torres', '3006667777'),
('VWX234', 'moto', 'Negro', 'Suzuki', 'GN125', 'Elena Vargas', '3008889999');

-- Insertar tarifas de prueba
INSERT INTO tarifas (parqueadero_id, tipo_vehiculo, tarifa_hora, tarifa_dia, tarifa_mes, vigencia_desde, vigencia_hasta) VALUES
-- Parqueadero Centro
(1, 'carro', 3000.00, 25000.00, 400000.00, '2024-01-01', '2024-12-31'),
(1, 'moto', 2000.00, 15000.00, 250000.00, '2024-01-01', '2024-12-31'),
(1, 'bicicleta', 1000.00, 8000.00, 120000.00, '2024-01-01', '2024-12-31'),
-- Parqueadero Norte
(2, 'carro', 3500.00, 28000.00, 450000.00, '2024-01-01', '2024-12-31'),
(2, 'moto', 2500.00, 18000.00, 280000.00, '2024-01-01', '2024-12-31'),
(2, 'bicicleta', 1200.00, 9000.00, 140000.00, '2024-01-01', '2024-12-31'),
-- Parqueadero Sur
(3, 'carro', 2500.00, 20000.00, 350000.00, '2024-01-01', '2024-12-31'),
(3, 'moto', 1800.00, 12000.00, 200000.00, '2024-01-01', '2024-12-31'),
(3, 'bicicleta', 800.00, 6000.00, 100000.00, '2024-01-01', '2024-12-31'),
-- Parqueadero Chapinero
(4, 'carro', 4000.00, 32000.00, 500000.00, '2024-01-01', '2024-12-31'),
(4, 'moto', 3000.00, 22000.00, 350000.00, '2024-01-01', '2024-12-31'),
(4, 'bicicleta', 1500.00, 10000.00, 160000.00, '2024-01-01', '2024-12-31');

-- Insertar horarios de prueba (Lunes a Viernes: 6:00-22:00, Sábados: 8:00-20:00, Domingos: 10:00-18:00)
INSERT INTO horarios (parqueadero_id, dia_semana, hora_apertura, hora_cierre, activo) VALUES
-- Parqueadero Centro
(1, 1, '06:00', '22:00', true), -- Lunes
(1, 2, '06:00', '22:00', true), -- Martes
(1, 3, '06:00', '22:00', true), -- Miércoles
(1, 4, '06:00', '22:00', true), -- Jueves
(1, 5, '06:00', '22:00', true), -- Viernes
(1, 6, '08:00', '20:00', true), -- Sábado
(1, 0, '10:00', '18:00', true), -- Domingo
-- Parqueadero Norte
(2, 1, '05:30', '23:00', true),
(2, 2, '05:30', '23:00', true),
(2, 3, '05:30', '23:00', true),
(2, 4, '05:30', '23:00', true),
(2, 5, '05:30', '23:00', true),
(2, 6, '07:00', '21:00', true),
(2, 0, '09:00', '19:00', true),
-- Parqueadero Sur
(3, 1, '06:30', '21:30', true),
(3, 2, '06:30', '21:30', true),
(3, 3, '06:30', '21:30', true),
(3, 4, '06:30', '21:30', true),
(3, 5, '06:30', '21:30', true),
(3, 6, '08:30', '19:30', true),
(3, 0, '10:30', '17:30', true),
-- Parqueadero Chapinero (24 horas)
(4, 1, '00:00', '23:59', true),
(4, 2, '00:00', '23:59', true),
(4, 3, '00:00', '23:59', true),
(4, 4, '00:00', '23:59', true),
(4, 5, '00:00', '23:59', true),
(4, 6, '00:00', '23:59', true),
(4, 0, '00:00', '23:59', true);

-- Insertar algunas entradas de prueba (vehículos actualmente en el parqueadero)
INSERT INTO entradas (vehiculo_id, parqueadero_id, controlador_id, fecha_hora_entrada, espacio_asignado) VALUES
(1, 1, 2, CURRENT_TIMESTAMP - INTERVAL '2 hours', 15),
(2, 1, 2, CURRENT_TIMESTAMP - INTERVAL '1 hour', 16),
(3, 2, 3, CURRENT_TIMESTAMP - INTERVAL '30 minutes', 5),
(4, 2, 3, CURRENT_TIMESTAMP - INTERVAL '45 minutes', 6),
(5, 3, 4, CURRENT_TIMESTAMP - INTERVAL '3 hours', 25),
(6, 4, 2, CURRENT_TIMESTAMP - INTERVAL '15 minutes', 101),
(7, 1, 3, CURRENT_TIMESTAMP - INTERVAL '4 hours', 17);

-- Insertar algunas salidas de prueba (vehículos que ya salieron)
INSERT INTO salidas (entrada_id, fecha_hora_salida, tiempo_total, monto_total, controlador_id) 
SELECT 
    e.id,
    e.fecha_hora_entrada + INTERVAL '2 hours',
    120, -- 2 horas = 120 minutos
    6000.00, -- 2 horas * 3000 COP/hora
    e.controlador_id
FROM entradas e 
WHERE e.id IN (
    -- Simular algunas salidas históricas
    SELECT id FROM entradas 
    ORDER BY fecha_hora_entrada 
    LIMIT 0 -- No insertar salidas reales para mantener entradas activas
);

-- Insertar datos históricos para reportes (entradas y salidas del mes pasado)
INSERT INTO entradas (vehiculo_id, parqueadero_id, controlador_id, fecha_hora_entrada, espacio_asignado) VALUES
(8, 1, 2, CURRENT_TIMESTAMP - INTERVAL '25 days', 18),
(1, 2, 3, CURRENT_TIMESTAMP - INTERVAL '20 days', 7),
(2, 3, 4, CURRENT_TIMESTAMP - INTERVAL '15 days', 26),
(3, 4, 2, CURRENT_TIMESTAMP - INTERVAL '10 days', 102),
(4, 1, 3, CURRENT_TIMESTAMP - INTERVAL '5 days', 19);

-- Insertar salidas correspondientes a las entradas históricas
INSERT INTO salidas (entrada_id, fecha_hora_salida, tiempo_total, monto_total, controlador_id)
SELECT 
    e.id,
    e.fecha_hora_entrada + INTERVAL '3 hours',
    180, -- 3 horas = 180 minutos
    CASE 
        WHEN v.tipo = 'carro' THEN 9000.00
        WHEN v.tipo = 'moto' THEN 6000.00
        ELSE 3000.00
    END,
    e.controlador_id
FROM entradas e
JOIN vehiculos v ON e.vehiculo_id = v.id
WHERE e.fecha_hora_entrada < CURRENT_TIMESTAMP - INTERVAL '4 days'
AND e.id NOT IN (SELECT entrada_id FROM salidas WHERE entrada_id IS NOT NULL);

-- Comentarios explicativos
COMMENT ON TABLE usuarios IS 'Usuarios: admin@parqueadero.com (admin), juan.perez@parqueadero.com (controlador)';
COMMENT ON TABLE parqueaderos IS '4 parqueaderos de prueba con diferentes capacidades y ubicaciones';
COMMENT ON TABLE vehiculos IS '8 vehículos de prueba de diferentes tipos (carros, motos, bicicletas)';
COMMENT ON TABLE tarifas IS 'Tarifas por hora, día y mes para cada tipo de vehículo en cada parqueadero';
COMMENT ON TABLE horarios IS 'Horarios de atención diferenciados por día de la semana';
COMMENT ON TABLE entradas IS 'Entradas activas y históricas para pruebas de reportes';
COMMENT ON TABLE salidas IS 'Salidas históricas para pruebas de reportes y cálculos';