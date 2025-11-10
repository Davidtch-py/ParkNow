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
('Admin', 'Principal', 'ADMIN001', 'admin@parqueadero.com', '3001000000', '$2a$10$N9qo8uLOickgx2ZMRZoMy.t5x7VKhR9g5s9l6gL/0y1GRz1kE3Klu', 'ADMIN'),
('Juan', 'Perez', 'CTRL001', 'juan.perez@parqueadero.com', '3001000001', '$2a$10$N9qo8uLOickgx2ZMRZoMy.t5x7VKhR9g5s9l6gL/0y1GRz1kE3Klu', 'CONTROLADOR');

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

-- Insertar espacios de parqueo (CORREGIDO: usando codigo_espacio en lugar de numero)
INSERT INTO espacios (id_parqueadero, codigo_espacio, estado) VALUES
-- Espacios para ParkNow Centro (id: 1)
(1, 'A01', 'LIBRE'), (1, 'A02', 'LIBRE'), (1, 'A03', 'LIBRE'),
(1, 'A04', 'LIBRE'), (1, 'A05', 'LIBRE'),
(1, 'B01', 'LIBRE'), (1, 'B02', 'LIBRE'), (1, 'B03', 'LIBRE'),
(1, 'M01', 'LIBRE'), (1, 'M02', 'LIBRE'), (1, 'M03', 'LIBRE'),
-- Espacios para ParkNow Norte (id: 2)
(2, 'A01', 'LIBRE'), (2, 'A02', 'OCUPADO'), (2, 'A03', 'LIBRE'),
(2, 'B01', 'LIBRE'), (2, 'B02', 'LIBRE'),
(2, 'M01', 'LIBRE'), (2, 'M02', 'OCUPADO');

-- Insertar vehículos
INSERT INTO vehiculos (placa, id_tipo_vehiculo, marca, modelo, color, propietario, telefono) VALUES
('ABC123', 1, 'Toyota', 'Corolla', 'Blanco', 'Juan Pérez', '3001234567'),
('XYZ789', 2, 'Yamaha', 'FZ16', 'Negro', 'María García', '3009876543'),
('DEF456', 1, 'Chevrolet', 'Spark', 'Rojo', 'Carlos López', '3005551234'),
('GHI012', 3, 'Ford', 'F-150', 'Azul', 'Ana Martínez', '3007778888'),
('JKL345', 2, 'Honda', 'CB600', 'Rojo', 'Pedro Sánchez', '3002223333');

-- Insertar tarifas (CORREGIDO: usando nombres de columnas correctos)
INSERT INTO tarifas (id_parqueadero, valor_hora, valor_dia, valor_mes, fecha_inicio, fecha_fin) VALUES
-- Tarifas para ParkNow Centro
(1, 3000.00, 25000.00, 450000.00, '2024-01-01', '2024-12-31'),
(1, 1500.00, 12000.00, 200000.00, '2024-01-01', '2024-12-31'),
(1, 4000.00, 35000.00, 600000.00, '2024-01-01', '2024-12-31'),
(1, 500.00, 3000.00, 50000.00, '2024-01-01', '2024-12-31'),
-- Tarifas para ParkNow Norte
(2, 3500.00, 28000.00, 480000.00, '2024-01-01', '2024-12-31'),
(2, 1800.00, 14000.00, 220000.00, '2024-01-01', '2024-12-31'),
(2, 4500.00, 38000.00, 650000.00, '2024-01-01', '2024-12-31'),
-- Tarifas para ParkNow Sur
(3, 2800.00, 22000.00, 400000.00, '2024-01-01', '2024-12-31'),
(3, 1400.00, 11000.00, 180000.00, '2024-01-01', '2024-12-31'),
-- Tarifas para ParkNow Medellín
(4, 3200.00, 26000.00, 460000.00, '2024-01-01', '2024-12-31'),
(4, 1600.00, 13000.00, 210000.00, '2024-01-01', '2024-12-31');

-- Insertar horarios de funcionamiento (CORREGIDO: usando nombres de columnas correctos)
INSERT INTO horarios (id_parqueadero, dia_semana, hora_apertura, hora_cierre, activo) VALUES
-- Horarios para todos los parqueaderos (Lunes a Viernes)
(1, 'LUNES', '06:00:00', '22:00:00', true),
(1, 'MARTES', '06:00:00', '22:00:00', true),
(1, 'MIERCOLES', '06:00:00', '22:00:00', true),
(1, 'JUEVES', '06:00:00', '22:00:00', true),
(1, 'VIERNES', '06:00:00', '22:00:00', true),
(1, 'SABADO', '08:00:00', '20:00:00', true),
(1, 'DOMINGO', '08:00:00', '18:00:00', true),
-- Horarios ParkNow Norte
(2, 'LUNES', '05:30:00', '23:00:00', true),
(2, 'MARTES', '05:30:00', '23:00:00', true),
(2, 'MIERCOLES', '05:30:00', '23:00:00', true),
(2, 'JUEVES', '05:30:00', '23:00:00', true),
(2, 'VIERNES', '05:30:00', '23:00:00', true),
(2, 'SABADO', '07:00:00', '21:00:00', true),
(2, 'DOMINGO', '07:00:00', '19:00:00', true);

-- Insertar suscripciones (CORREGIDO: eliminando columnas que no existen)
INSERT INTO suscripciones (nombre, descripcion, precio_mensual, beneficios) VALUES
('Básica', 'Plan básico con descuentos en tarifas', 50000.00, 'Descuento del 10% en tarifas por horas'),
('Premium', 'Plan premium con mayores beneficios', 120000.00, 'Descuento del 20% en tarifas, reserva de espacios'),
('Anual', 'Plan anual con máximo descuento', 500000.00, 'Descuento del 30% en tarifas, reserva prioritaria, espacios exclusivos');

-- Insertar alianzas comerciales (CORREGIDO: usando nombres de columnas correctos)
INSERT INTO alianzas (id_parqueadero, nombre_comercial, descripcion, descuento_porcentaje, fecha_inicio, fecha_fin) VALUES
(1, 'Alianza Empresarial Tech', 'Descuento para empleados de empresas tecnológicas', 15.00, '2024-01-01', '2024-12-31'),
(2, 'Estudiantes Universitarios', 'Descuento especial para estudiantes', 25.00, '2024-01-01', '2024-12-31'),
(3, 'Residentes del Sector', 'Descuento para residentes cercanos', 12.00, '2024-01-01', '2024-12-31');

-- Insertar algunos registros de ejemplo (CORREGIDO: usando nombres de columnas correctos)
INSERT INTO registros (id_vehiculo, id_usuario, id_espacio, fecha_ingreso, fecha_salida, monto_total) VALUES
(1, 1, 2, NOW() - INTERVAL '2 hours', NULL, NULL),
(2, 2, 17, NOW() - INTERVAL '1 hour', NULL, NULL),
(3, 3, 1, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour', 6000.00),
(4, 4, 9, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours', 3000.00);

-- Insertar relaciones usuarios-parqueaderos (CORREGIDO: usando nombres de columnas correctos)
INSERT INTO parqueaderos_usuarios (id_parqueadero, id_usuario, fecha_asignacion) VALUES
(1, 1, CURRENT_DATE),
(1, 2, CURRENT_DATE),
(2, 3, CURRENT_DATE),
(2, 4, CURRENT_DATE),
(3, 5, CURRENT_DATE),
(4, 6, CURRENT_DATE),
(1, 7, CURRENT_DATE),
(2, 8, CURRENT_DATE);

-- Insertar algunas suscripciones de vehículos (ejemplo) (CORREGIDO: usando nombres de columnas correctos)
INSERT INTO vehiculos_suscripciones (id_vehiculo, id_suscripcion, fecha_inicio, fecha_fin) VALUES
(1, 2, '2024-01-01', '2024-01-31'),
(2, 1, '2024-01-15', '2024-02-14'),
(3, 3, '2024-01-01', '2024-12-31');

-- Comentarios explicativos
COMMENT ON TABLE usuarios IS 'Usuarios: admin@parqueadero.com (admin), juan.perez@parqueadero.com (controlador)';
COMMENT ON TABLE parqueaderos IS '4 parqueaderos de prueba con diferentes capacidades y ubicaciones';
COMMENT ON TABLE vehiculos IS '5 vehículos de prueba de diferentes tipos (carros, motos, camionetas)';
COMMENT ON TABLE tarifas IS 'Tarifas por hora, día y mes para cada parqueadero';
COMMENT ON TABLE horarios IS 'Horarios de atención diferenciados por día de la semana';
COMMENT ON TABLE registros IS 'Registros de entrada y salida de vehículos';
COMMENT ON TABLE suscripciones IS 'Planes de suscripción disponibles para vehículos';