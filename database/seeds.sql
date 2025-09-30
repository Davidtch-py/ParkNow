-- Datos de prueba para el sistema de parqueaderos ParkNow
-- PostgreSQL Script

-- Limpiar datos existentes (en orden para evitar conflictos de foreign keys)
TRUNCATE TABLE vehiculos_suscripciones CASCADE;
TRUNCATE TABLE alianzas CASCADE;
TRUNCATE TABLE registros CASCADE;
TRUNCATE TABLE espacios CASCADE;
TRUNCATE TABLE horarios CASCADE;
TRUNCATE TABLE tarifas CASCADE;
TRUNCATE TABLE parqueaderos_usuarios CASCADE;
TRUNCATE TABLE vehiculos CASCADE;
TRUNCATE TABLE tipos_vehiculos CASCADE;
TRUNCATE TABLE parqueaderos CASCADE;
TRUNCATE TABLE suscripciones CASCADE;
TRUNCATE TABLE usuarios CASCADE;

-- Reiniciar secuencias
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;
ALTER SEQUENCE tipos_vehiculos_id_seq RESTART WITH 1;
ALTER SEQUENCE parqueaderos_id_seq RESTART WITH 1;
ALTER SEQUENCE vehiculos_id_seq RESTART WITH 1;
ALTER SEQUENCE espacios_id_seq RESTART WITH 1;
ALTER SEQUENCE tarifas_id_seq RESTART WITH 1;
ALTER SEQUENCE horarios_id_seq RESTART WITH 1;
ALTER SEQUENCE registros_id_seq RESTART WITH 1;
ALTER SEQUENCE alianzas_id_seq RESTART WITH 1;
ALTER SEQUENCE suscripciones_id_seq RESTART WITH 1;
ALTER SEQUENCE vehiculos_suscripciones_id_seq RESTART WITH 1;
ALTER SEQUENCE parqueaderos_usuarios_id_seq RESTART WITH 1;

-- Insertar usuarios
INSERT INTO usuarios (nombre, apellido, documento, email, telefono, password, rol) VALUES
('Dean', 'Kwon', 'C001', 'dean@rbkorea.com', '3001112233', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CONTROLADOR'),
('Crush', 'Shin', 'C002', 'crush@rbkorea.com', '3001112244', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CONTROLADOR'),
('Summer', 'Walker', 'E001', 'summer@rbus.com', '3012223344', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('Brent', 'Faiyaz', 'E002', 'brent@rbus.com', '3012223355', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CONTROLADOR'),
('Mabiland', 'Morales', 'CO01', 'mabiland@rbcol.com', '3203334455', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN'),
('Lianna', 'Rodriguez', 'CO02', 'lianna@rbcol.com', '3203334466', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CONTROLADOR'),
-- Usuarios adicionales para compatibilidad
('Admin', 'Principal', 'ADMIN001', 'admin@parqueadero.com', '3001000000', '$2a$10$N9qo8uLOickgx2ZMRZoMy.t5x7VKhR9g5s9l6gL/0y1GRz1kE3Klu', 'ADMIN'), -- password: secret
('Juan', 'Perez', 'CTRL001', 'juan.perez@parqueadero.com', '3001000001', '$2a$10$N9qo8uLOickgx2ZMRZoMy.t5x7VKhR9g5s9l6gL/0y1GRz1kE3Klu', 'CONTROLADOR'); -- password: secret

-- Insertar tipos de vehículos
INSERT INTO tipos_vehiculos (nombre, descripcion) VALUES
('Carro', 'Vehículo particular de 4 ruedas'),
('Moto', 'Motocicleta de 2 ruedas'),
('Camioneta', 'Vehículo utilitario de carga ligera'),
('Bicicleta', 'Vehículo de tracción humana de 2 ruedas');

-- Insertar parqueaderos
INSERT INTO parqueaderos (nombre, direccion, ciudad, capacidad_total, latitud, longitud) VALUES
('ParkNow Centro', 'Calle 15 #10-23', 'Bogotá', 100, 4.6097, -74.0817),
('ParkNow Norte', 'Carrera 7 #45-67', 'Bogotá', 150, 4.6533, -74.0836),
('ParkNow Sur', 'Avenida 1 #30-15', 'Bogotá', 80, 4.5709, -74.1066),
('ParkNow Medellín Centro', 'Carrera 50 #20-30', 'Medellín', 120, 6.2442, -75.5812);

-- Insertar espacios de parqueo
INSERT INTO espacios (parqueadero_id, numero, tipo_vehiculo_id, estado, ubicacion_x, ubicacion_y) VALUES
-- Espacios para ParkNow Centro (id: 1)
(1, 'A01', 1, 'DISPONIBLE', 1, 1), (1, 'A02', 1, 'DISPONIBLE', 1, 2), (1, 'A03', 1, 'DISPONIBLE', 1, 3),
(1, 'A04', 1, 'DISPONIBLE', 1, 4), (1, 'A05', 1, 'DISPONIBLE', 1, 5),
(1, 'B01', 1, 'DISPONIBLE', 2, 1), (1, 'B02', 1, 'DISPONIBLE', 2, 2), (1, 'B03', 1, 'DISPONIBLE', 2, 3),
(1, 'M01', 2, 'DISPONIBLE', 3, 1), (1, 'M02', 2, 'DISPONIBLE', 3, 2), (1, 'M03', 2, 'DISPONIBLE', 3, 3),
-- Espacios para ParkNow Norte (id: 2)
(2, 'A01', 1, 'DISPONIBLE', 1, 1), (2, 'A02', 1, 'OCUPADO', 1, 2), (2, 'A03', 1, 'DISPONIBLE', 1, 3),
(2, 'B01', 1, 'DISPONIBLE', 2, 1), (2, 'B02', 1, 'DISPONIBLE', 2, 2),
(2, 'M01', 2, 'DISPONIBLE', 3, 1), (2, 'M02', 2, 'OCUPADO', 3, 2);

-- Insertar vehículos
INSERT INTO vehiculos (placa, tipo_vehiculo_id, marca, modelo, color, propietario) VALUES
('ABC123', 1, 'Toyota', 'Corolla', 'Blanco', 'Juan Pérez'),
('XYZ789', 2, 'Yamaha', 'FZ16', 'Negro', 'María García'),
('DEF456', 1, 'Chevrolet', 'Spark', 'Rojo', 'Carlos López'),
('GHI012', 3, 'Ford', 'F-150', 'Azul', 'Ana Martínez'),
('JKL345', 2, 'Honda', 'CB600', 'Rojo', 'Pedro Sánchez');

-- Insertar tarifas
INSERT INTO tarifas (parqueadero_id, tipo_vehiculo_id, precio_hora, precio_dia, precio_mes) VALUES
-- Tarifas para ParkNow Centro
(1, 1, 3000.00, 25000.00, 450000.00), -- Carros
(1, 2, 1500.00, 12000.00, 200000.00), -- Motos
(1, 3, 4000.00, 35000.00, 600000.00), -- Camionetas
(1, 4, 500.00, 3000.00, 50000.00),    -- Bicicletas
-- Tarifas para ParkNow Norte
(2, 1, 3500.00, 28000.00, 480000.00),
(2, 2, 1800.00, 14000.00, 220000.00),
(2, 3, 4500.00, 38000.00, 650000.00),
-- Tarifas para ParkNow Sur
(3, 1, 2800.00, 22000.00, 400000.00),
(3, 2, 1400.00, 11000.00, 180000.00),
-- Tarifas para ParkNow Medellín
(4, 1, 3200.00, 26000.00, 460000.00),
(4, 2, 1600.00, 13000.00, 210000.00);

-- Insertar horarios de funcionamiento
INSERT INTO horarios (parqueadero_id, dia_semana, hora_apertura, hora_cierre, activo) VALUES
-- Horarios para todos los parqueaderos (Lunes a Viernes)
(1, 1, '06:00:00', '22:00:00', true), (1, 2, '06:00:00', '22:00:00', true),
(1, 3, '06:00:00', '22:00:00', true), (1, 4, '06:00:00', '22:00:00', true),
(1, 5, '06:00:00', '22:00:00', true), (1, 6, '08:00:00', '20:00:00', true),
(1, 0, '08:00:00', '18:00:00', true), -- Domingo
-- Horarios ParkNow Norte
(2, 1, '05:30:00', '23:00:00', true), (2, 2, '05:30:00', '23:00:00', true),
(2, 3, '05:30:00', '23:00:00', true), (2, 4, '05:30:00', '23:00:00', true),
(2, 5, '05:30:00', '23:00:00', true), (2, 6, '07:00:00', '21:00:00', true),
(2, 0, '07:00:00', '19:00:00', true);

-- Insertar suscripciones
INSERT INTO suscripciones (nombre, descripcion, precio_mensual, duracion_meses, descuento_porcentaje, beneficios) VALUES
('Básica', 'Plan básico con descuentos en tarifas', 50000.00, 1, 10.00, 'Descuento del 10% en tarifas por horas'),
('Premium', 'Plan premium con mayores beneficios', 120000.00, 1, 20.00, 'Descuento del 20% en tarifas, reserva de espacios'),
('Anual', 'Plan anual con máximo descuento', 500000.00, 12, 30.00, 'Descuento del 30% en tarifas, reserva prioritaria, espacios exclusivos');

-- Insertar alianzas comerciales
INSERT INTO alianzas (nombre, descripcion, descuento_porcentaje, codigo_promocional, fecha_inicio, fecha_fin, activa) VALUES
('Alianza Empresarial Tech', 'Descuento para empleados de empresas tecnológicas', 15.00, 'TECH2024', '2024-01-01', '2024-12-31', true),
('Estudiantes Universitarios', 'Descuento especial para estudiantes', 25.00, 'STUDENT2024', '2024-01-01', '2024-12-31', true),
('Residentes del Sector', 'Descuento para residentes cercanos', 12.00, 'VECINO2024', '2024-01-01', '2024-12-31', true);

-- Insertar algunos registros de ejemplo
INSERT INTO registros (parqueadero_id, espacio_id, vehiculo_id, usuario_id, tipo_registro, fecha_entrada, fecha_salida, costo_total, metodo_pago, observaciones) VALUES
(2, 2, 1, 1, 'ENTRADA', NOW() - INTERVAL '2 hours', NULL, NULL, NULL, 'Vehículo en el parqueadero'),
(2, 17, 2, 2, 'ENTRADA', NOW() - INTERVAL '1 hour', NULL, NULL, NULL, 'Motocicleta estacionada'),
(1, 1, 3, 3, 'SALIDA', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 6000.00, 'EFECTIVO', 'Pago en efectivo al salir'),
(1, 9, 4, 4, 'SALIDA', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours', 3000.00, 'TARJETA', 'Pago con tarjeta');

-- Insertar relaciones usuarios-parqueaderos
INSERT INTO parqueaderos_usuarios (parqueadero_id, usuario_id) VALUES
(1, 1), (1, 2), -- Dean y Crush en ParkNow Centro
(2, 3), (2, 4), -- Summer y Brent en ParkNow Norte
(3, 5), (4, 6), -- Mabiland en Sur, Lianna en Medellín
(1, 7), (2, 8); -- Admin y Juan en múltiples parqueaderos

-- Insertar algunas suscripciones de vehículos (ejemplo)
INSERT INTO vehiculos_suscripciones (vehiculo_id, suscripcion_id, fecha_inicio, fecha_fin, activa) VALUES
(1, 2, '2024-01-01', '2024-01-31', true), -- ABC123 con plan Premium
(2, 1, '2024-01-15', '2024-02-14', true), -- XYZ789 con plan Básico
(3, 3, '2024-01-01', '2024-12-31', true); -- DEF456 con plan Anual

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