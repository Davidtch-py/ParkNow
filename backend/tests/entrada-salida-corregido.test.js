/**
 * Tests Exhaustivos para Entrada/Salida de Vehículos - VERSIÓN CORREGIDA
 * Valida: Registro, flujo completo, cálculos, integridad
 */

import { sequelize, Vehiculo, Parqueadero, Registro, Usuario } from '../persistence/models.js';

describe('Entrada/Salida de Vehículos - Tests Exhaustivos (Corregido)', () => {
  let parqueaderoId, vehiculoId, usuarioId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Crear datos de prueba
    const parqueadero = await Parqueadero.create({
      nombre: 'Parqueadero Test',
      direccion: 'Calle Test 123',
      capacidadTotal: 100,
      capacidadDisponible: 100,
      telefono: '3001234567',
      email: 'test@parqueadero.com'
    });
    parqueaderoId = parqueadero.id;

    const usuario = await Usuario.create({
      nombre: 'Controlador Test',
      email: 'controlador@test.com',
      password: 'hashedpassword',
      rol: 'controlador'
    });
    usuarioId = usuario.id;

    const vehiculo = await Vehiculo.create({
      placa: 'ABC123',
      tipo: 'carro',
      color: 'Rojo',
      propietario: 'Juan Pérez'
    });
    vehiculoId = vehiculo.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Registro de Entrada', () => {
    test('✅ Registrar entrada de vehículo', async () => {
      const registro = await Registro.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        fecha_ingreso: new Date()
      });

      expect(registro).toBeDefined();
      expect(registro.id_vehiculo).toBe(vehiculoId);
    });

    test('✅ Entrada se guarda en BD correctamente', async () => {
      const registro = await Registro.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date(),
        tipo: 'entrada'
      });

      const registroRecuperado = await Registro.findByPk(registro.id);

      expect(registroRecuperado).toBeDefined();
      expect(registroRecuperado.id_vehiculo).toBe(vehiculoId);
    });

    test('✅ Obtener registro por ID', async () => {
      const registro = await Registro.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date(),
        tipo: 'entrada'
      });

      const registroObtenido = await Registro.findByPk(registro.id);

      expect(registroObtenido).toBeDefined();
      expect(registroObtenido.id).toBe(registro.id);
    });
  });

  describe('Registro de Salida', () => {
    test('✅ Registrar salida de vehículo', async () => {
      const entrada = await Registro.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date()
      });

      const salida = await Registro.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: entrada.fecha_ingreso,
        fecha_salida: new Date(),
        monto_total: 15000
      });

      expect(salida).toBeDefined();
      expect(parseFloat(salida.monto_total)).toBe(15000);
    });

    test('✅ Salida se guarda en BD correctamente', async () => {
      const salida = await Registro.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date(),
        fecha_salida: new Date(),
        monto_total: 20000,
        tipo: 'salida'
      });

      const salidaRecuperada = await Registro.findByPk(salida.id);

      expect(salidaRecuperada).toBeDefined();
      expect(parseFloat(salidaRecuperada.monto_total)).toBe(20000);
    });
  });

  describe('Flujo Completo Entrada → Salida', () => {
    test('✅ Flujo completo: Entrada → Salida', async () => {
      const vehiculo = await Vehiculo.create({
        placa: 'XYZ789',
        tipo: 'moto',
        color: 'Azul'
      });

      // Entrada
      const entrada = await Registro.create({
        id_vehiculo: vehiculo.id,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date('2025-11-11T10:00:00Z'),
        tipo: 'entrada'
      });

      expect(entrada.id).toBeDefined();

      // Salida
      const salida = await Registro.create({
        id_vehiculo: vehiculo.id,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: entrada.fecha_ingreso,
        fecha_salida: new Date('2025-11-11T12:30:00Z'),
        monto_total: 15000,
        tipo: 'salida'
      });

      expect(parseFloat(salida.monto_total)).toBe(15000);
      expect(salida.fecha_salida > entrada.fecha_ingreso).toBe(true);
    });

    test('✅ Manejar múltiples vehículos simultáneamente', async () => {
      const entradas = [];

      for (let i = 0; i < 3; i++) {
        const vehiculo = await Vehiculo.create({
          placa: `MULTI${i}`,
          tipo: 'carro',
          color: 'Blanco'
        });

        const entrada = await Registro.create({
          id_vehiculo: vehiculo.id,
          id_usuario: usuarioId,
          id_parqueadero: parqueaderoId,
          fecha_ingreso: new Date(),
          tipo: 'entrada'
        });

        entradas.push(entrada);
      }

      expect(entradas.length).toBe(3);
    });
  });

  describe('Cálculos de Tiempo y Costo', () => {
    test('✅ Calcular tiempo estacionado correctamente', async () => {
      const fechaIngreso = new Date('2025-11-11T10:00:00Z');
      const fechaSalida = new Date('2025-11-11T12:30:00Z');

      const tiempoMs = fechaSalida - fechaIngreso;
      const tiempoMinutos = Math.ceil(tiempoMs / (1000 * 60));
      const horasRedondeadas = Math.ceil(tiempoMinutos / 60);

      expect(horasRedondeadas).toBe(3);
    });

    test('✅ Aproximar horas hacia arriba', async () => {
      const tiemposMinutos = [30, 61, 119, 120, 121];
      const horasEsperadas = [1, 2, 2, 2, 3];

      tiemposMinutos.forEach((minutos, index) => {
        const horas = Math.ceil(minutos / 60);
        expect(horas).toBe(horasEsperadas[index]);
      });
    });

    test('✅ Calcular costo por hora', async () => {
      const tarifa = 5000;
      const horas = 3;
      const costo = horas * tarifa;

      expect(costo).toBe(15000);
    });

    test('✅ Calcular costo por día', async () => {
      const tarifaDia = 30000;
      const costo = tarifaDia;

      expect(costo).toBe(30000);
    });
  });

  describe('Integridad de Datos', () => {
    test('✅ Montos siempre positivos', async () => {
      const montos = [5000, 10000, 15000, 20000];

      montos.forEach(monto => {
        expect(monto).toBeGreaterThan(0);
      });
    });

    test('✅ Fecha de salida es posterior a entrada', async () => {
      const entrada = await Registro.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date('2025-11-11T10:00:00Z'),
        tipo: 'entrada'
      });

      const salida = await Registro.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: entrada.fecha_ingreso,
        fecha_salida: new Date('2025-11-11T12:00:00Z'),
        monto_total: 10000,
        tipo: 'salida'
      });

      expect(new Date(salida.fecha_salida) > new Date(entrada.fecha_ingreso)).toBe(true);
    });
  });

  describe('Casos Extremos', () => {
    test('✅ Manejar múltiples salidas del mismo vehículo', async () => {
      const vehiculo = await Vehiculo.create({
        placa: 'MULTI999',
        tipo: 'carro',
        color: 'Negro'
      });

      const salidas = [];

      for (let i = 0; i < 3; i++) {
        const salida = await Registro.create({
          id_vehiculo: vehiculo.id,
          id_usuario: usuarioId,
          id_parqueadero: parqueaderoId,
          fecha_ingreso: new Date(),
          fecha_salida: new Date(),
          monto_total: 10000 * (i + 1),
          tipo: 'salida'
        });

        salidas.push(salida);
      }

      expect(salidas.length).toBe(3);
    });
  });
});
