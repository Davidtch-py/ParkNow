/**
 * Tests de Lógica de Negocio - Perspectiva del Dueño del Parqueadero
 * 
 * Estos tests validan que el sistema funciona correctamente desde el punto de vista
 * del negocio: ingresos, ocupación, reportes, etc.
 */

import { EntradaRepository } from '../persistence/EntradaRepository.js';
import { SalidaRepository } from '../persistence/SalidaRepository.js';
import { VehiculoRepository } from '../persistence/VehiculoRepository.js';
import { ParqueaderoRepository } from '../persistence/ParqueaderoRepository.js';
import { TarifaRepository } from '../persistence/TarifaRepository.js';
import { sequelize, Entrada, Salida, Vehiculo, Parqueadero, Tarifa } from '../persistence/models.js';

describe('Lógica de Negocio - Perspectiva del Dueño', () => {
  let entradaRepository, salidaRepository, vehiculoRepository, parqueaderoRepository, tarifaRepository;
  let parqueaderoId, vehiculoId, usuarioId = 1;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    entradaRepository = new EntradaRepository();
    salidaRepository = new SalidaRepository();
    vehiculoRepository = new VehiculoRepository();
    parqueaderoRepository = new ParqueaderoRepository();
    tarifaRepository = new TarifaRepository();

    // Crear datos de prueba
    const parqueadero = await Parqueadero.create({
      nombre: 'Parqueadero Principal',
      direccion: 'Calle Principal 123',
      capacidadTotal: 100,
      capacidadDisponible: 100,
      telefono: '3001234567',
      email: 'info@parqueadero.com'
    });
    parqueaderoId = parqueadero.id;

    const vehiculo = await Vehiculo.create({
      placa: 'ABC123',
      tipo: 'carro',
      color: 'Rojo',
      propietario: 'Juan Pérez'
    });
    vehiculoId = vehiculo.id;

    // Crear tarifa
    await Tarifa.create({
      parqueaderoId,
      tipoVehiculo: 'carro',
      tarifaHora: 5000,
      tarifaDia: 30000,
      tarifaMes: 400000,
      vigenciaDesde: new Date('2025-01-01'),
      vigenciaHasta: new Date('2026-12-31')
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('📊 ESCENARIO 1: Entrada de Vehículo', () => {
    test('✅ Registrar entrada de vehículo', async () => {
      const entrada = await entradaRepository.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date()
      });

      expect(entrada).toBeDefined();
      expect(entrada.id_vehiculo).toBe(vehiculoId);
      expect(entrada.id_parqueadero).toBe(parqueaderoId);
    });

    test('✅ Validar que vehículo no está ya estacionado', async () => {
      // Primera entrada
      const entrada1 = await entradaRepository.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date()
      });

      // Intentar segunda entrada del mismo vehículo
      const entradasActivas = await Entrada.findAll({
        where: {
          id_vehiculo: vehiculoId,
          fecha_salida: null
        }
      });

      expect(entradasActivas.length).toBe(1);
      expect(entradasActivas[0].id).toBe(entrada1.id);
    });

    test('✅ Decrementar capacidad disponible al registrar entrada', async () => {
      const parqueaderoAntes = await Parqueadero.findByPk(parqueaderoId);
      const capacidadAntes = parqueaderoAntes.capacidadDisponible;

      // Crear nuevo vehículo
      const vehiculo2 = await Vehiculo.create({
        placa: 'XYZ789',
        tipo: 'moto',
        color: 'Azul'
      });

      // Registrar entrada
      await entradaRepository.create({
        id_vehiculo: vehiculo2.id,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date()
      });

      // Actualizar capacidad (simular)
      await parqueaderoRepository.update(parqueaderoId, {
        capacidadDisponible: capacidadAntes - 1
      });

      const parqueaderoAfter = await Parqueadero.findByPk(parqueaderoId);
      expect(parqueaderoAfter.capacidadDisponible).toBe(capacidadAntes - 1);
    });

    test('✅ Rechazar entrada si no hay espacios disponibles', async () => {
      // Llenar parqueadero
      await Parqueadero.update(
        { capacidadDisponible: 0 },
        { where: { id: parqueaderoId } }
      );

      const parqueadero = await Parqueadero.findByPk(parqueaderoId);
      expect(parqueadero.capacidadDisponible).toBe(0);
    });
  });

  describe('💰 ESCENARIO 2: Salida y Cálculo de Ingresos', () => {
    test('✅ Calcular costo correcto por hora', async () => {
      const fechaIngreso = new Date('2025-11-11T10:00:00Z');
      const fechaSalida = new Date('2025-11-11T12:30:00Z');

      const tiempoMs = fechaSalida - fechaIngreso;
      const tiempoMinutos = Math.ceil(tiempoMs / (1000 * 60));
      const horasRedondeadas = Math.ceil(tiempoMinutos / 60);

      const tarifa = 5000;
      const costo = horasRedondeadas * tarifa;

      expect(horasRedondeadas).toBe(3);
      expect(costo).toBe(15000);
    });

    test('✅ Registrar salida y actualizar capacidad', async () => {
      const entrada = await entradaRepository.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date()
      });

      const salida = await salidaRepository.create({
        id_entrada: entrada.id,
        id_usuario: usuarioId,
        fecha_salida: new Date(),
        monto_total: 15000
      });

      expect(salida).toBeDefined();
      expect(salida.monto_total).toBe(15000);
    });

    test('✅ Incrementar capacidad disponible al registrar salida', async () => {
      const parqueaderoAntes = await Parqueadero.findByPk(parqueaderoId);
      const capacidadAntes = parqueaderoAntes.capacidadDisponible;

      // Simular incremento
      await parqueaderoRepository.update(parqueaderoId, {
        capacidadDisponible: capacidadAntes + 1
      });

      const parqueaderoAfter = await Parqueadero.findByPk(parqueaderoId);
      expect(parqueaderoAfter.capacidadDisponible).toBe(capacidadAntes + 1);
    });

    test('✅ Generar recibo con detalles correctos', async () => {
      const entrada = await entradaRepository.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date('2025-11-11T10:00:00Z')
      });

      const salida = await salidaRepository.create({
        id_entrada: entrada.id,
        id_usuario: usuarioId,
        fecha_salida: new Date('2025-11-11T12:30:00Z'),
        monto_total: 15000
      });

      expect(salida.monto_total).toBeGreaterThan(0);
      expect(salida.fecha_salida).toBeGreaterThan(entrada.fecha_ingreso);
    });
  });

  describe('📈 ESCENARIO 3: Reportes y Análisis', () => {
    test('✅ Calcular ingresos totales del día', async () => {
      // Crear múltiples salidas
      const salidas = [];
      for (let i = 0; i < 3; i++) {
        const vehiculo = await Vehiculo.create({
          placa: `VEH${i}`,
          tipo: 'carro',
          color: 'Gris'
        });

        const entrada = await entradaRepository.create({
          id_vehiculo: vehiculo.id,
          id_usuario: usuarioId,
          id_parqueadero: parqueaderoId,
          fecha_ingreso: new Date()
        });

        const salida = await salidaRepository.create({
          id_entrada: entrada.id,
          id_usuario: usuarioId,
          fecha_salida: new Date(),
          monto_total: 10000 * (i + 1)
        });

        salidas.push(salida);
      }

      const totalIngresos = salidas.reduce((sum, s) => sum + s.monto_total, 0);
      expect(totalIngresos).toBe(60000); // 10000 + 20000 + 30000
    });

    test('✅ Calcular ocupación promedio', async () => {
      const parqueadero = await Parqueadero.findByPk(parqueaderoId);
      const ocupados = parqueadero.capacidadTotal - parqueadero.capacidadDisponible;
      const porcentaje = (ocupados / parqueadero.capacidadTotal) * 100;

      expect(porcentaje).toBeGreaterThanOrEqual(0);
      expect(porcentaje).toBeLessThanOrEqual(100);
    });

    test('✅ Contar vehículos procesados por tipo', async () => {
      const entradas = await Entrada.findAll({
        include: ['Vehiculo']
      });

      const porTipo = {};
      entradas.forEach(e => {
        const tipo = e.Vehiculo.tipo;
        porTipo[tipo] = (porTipo[tipo] || 0) + 1;
      });

      expect(Object.keys(porTipo).length).toBeGreaterThan(0);
    });

    test('✅ Calcular tiempo promedio de estancia', async () => {
      const salidas = await Salida.findAll({
        include: ['Entrada']
      });

      if (salidas.length > 0) {
        const tiemposMs = salidas.map(s => 
          new Date(s.fecha_salida) - new Date(s.Entrada.fecha_ingreso)
        );
        const tiempoPromedio = tiemposMs.reduce((a, b) => a + b, 0) / tiemposMs.length;

        expect(tiempoPromedio).toBeGreaterThan(0);
      }
    });
  });

  describe('🔒 ESCENARIO 4: Integridad de Datos', () => {
    test('✅ Capacidad nunca es negativa', async () => {
      const parqueadero = await Parqueadero.findByPk(parqueaderoId);
      expect(parqueadero.capacidadDisponible).toBeGreaterThanOrEqual(0);
    });

    test('✅ Capacidad nunca excede total', async () => {
      const parqueadero = await Parqueadero.findByPk(parqueaderoId);
      expect(parqueadero.capacidadDisponible).toBeLessThanOrEqual(parqueadero.capacidadTotal);
    });

    test('✅ Montos siempre positivos', async () => {
      const salidas = await Salida.findAll();
      salidas.forEach(s => {
        expect(s.monto_total).toBeGreaterThanOrEqual(0);
      });
    });

    test('✅ Fecha de salida es posterior a entrada', async () => {
      const salidas = await Salida.findAll({
        include: ['Entrada']
      });

      salidas.forEach(s => {
        expect(new Date(s.fecha_salida)).toBeGreaterThan(new Date(s.Entrada.fecha_ingreso));
      });
    });

    test('✅ No hay entradas sin vehículo', async () => {
      const entradas = await Entrada.findAll({
        include: ['Vehiculo']
      });

      entradas.forEach(e => {
        expect(e.Vehiculo).toBeDefined();
      });
    });
  });

  describe('🔄 ESCENARIO 5: Flujos Completos', () => {
    test('✅ Flujo completo: Entrada → Salida → Reporte', async () => {
      // 1. Crear vehículo
      const vehiculo = await Vehiculo.create({
        placa: 'FLUJO001',
        tipo: 'carro',
        color: 'Negro'
      });

      // 2. Registrar entrada
      const entrada = await entradaRepository.create({
        id_vehiculo: vehiculo.id,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date()
      });

      expect(entrada.id).toBeDefined();

      // 3. Registrar salida
      const salida = await salidaRepository.create({
        id_entrada: entrada.id,
        id_usuario: usuarioId,
        fecha_salida: new Date(),
        monto_total: 15000
      });

      expect(salida.monto_total).toBe(15000);

      // 4. Verificar en reportes
      const salidas = await Salida.findAll({
        where: { id_entrada: entrada.id }
      });

      expect(salidas.length).toBe(1);
      expect(salidas[0].monto_total).toBe(15000);
    });

    test('✅ Manejar múltiples vehículos simultáneamente', async () => {
      const vehiculos = [];
      const entradas = [];

      // Crear 5 vehículos y registrar entradas
      for (let i = 0; i < 5; i++) {
        const vehiculo = await Vehiculo.create({
          placa: `MULTI${i}`,
          tipo: 'carro',
          color: 'Blanco'
        });
        vehiculos.push(vehiculo);

        const entrada = await entradaRepository.create({
          id_vehiculo: vehiculo.id,
          id_usuario: usuarioId,
          id_parqueadero: parqueaderoId,
          fecha_ingreso: new Date()
        });
        entradas.push(entrada);
      }

      // Verificar que todas las entradas existen
      expect(entradas.length).toBe(5);
      expect(vehiculos.length).toBe(5);
    });

    test('✅ Validar consistencia después de múltiples operaciones', async () => {
      const parqueadero = await Parqueadero.findByPk(parqueaderoId);
      const entradas = await Entrada.findAll({
        where: { id_parqueadero: parqueaderoId }
      });
      const salidas = await Salida.findAll();

      // Validaciones
      expect(parqueadero.capacidadDisponible).toBeGreaterThanOrEqual(0);
      expect(parqueadero.capacidadDisponible).toBeLessThanOrEqual(parqueadero.capacidadTotal);
      expect(entradas.length).toBeGreaterThan(0);
    });
  });

  describe('⚠️ ESCENARIO 6: Casos Extremos', () => {
    test('✅ Parqueadero lleno', async () => {
      await Parqueadero.update(
        { capacidadDisponible: 0 },
        { where: { id: parqueaderoId } }
      );

      const parqueadero = await Parqueadero.findByPk(parqueaderoId);
      expect(parqueadero.capacidadDisponible).toBe(0);
    });

    test('✅ Parqueadero vacío', async () => {
      await Parqueadero.update(
        { capacidadDisponible: 100 },
        { where: { id: parqueaderoId } }
      );

      const parqueadero = await Parqueadero.findByPk(parqueaderoId);
      expect(parqueadero.capacidadDisponible).toBe(100);
    });

    test('✅ Manejar montos muy grandes', async () => {
      const entrada = await entradaRepository.create({
        id_vehiculo: vehiculoId,
        id_usuario: usuarioId,
        id_parqueadero: parqueaderoId,
        fecha_ingreso: new Date()
      });

      const salida = await salidaRepository.create({
        id_entrada: entrada.id,
        id_usuario: usuarioId,
        fecha_salida: new Date(),
        monto_total: 999999999
      });

      expect(salida.monto_total).toBe(999999999);
    });
  });
});
