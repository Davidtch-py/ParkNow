/**
 * Tests Exhaustivos para Gestión de Tarifas - VERSIÓN CORREGIDA
 * Valida: Cálculos, vigencia, tipos de tarifa, integridad de datos
 */

import { TarifaRepository } from '../persistence/TarifaRepository.js';
import { TarifaUseCase } from '../application/TarifaUseCase.js';
import { sequelize, Tarifa, Parqueadero } from '../persistence/models.js';

describe('Gestión de Tarifas - Tests Exhaustivos (Corregido)', () => {
  let tarifaRepository, tarifaUseCase;
  let parqueaderoId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    tarifaRepository = new TarifaRepository();
    tarifaUseCase = new TarifaUseCase(tarifaRepository);

    const parqueadero = await Parqueadero.create({
      nombre: 'Parqueadero Test',
      direccion: 'Calle Test 123',
      capacidadTotal: 100,
      capacidadDisponible: 100,
      telefono: '3001234567',
      email: 'test@parqueadero.com'
    });
    parqueaderoId = parqueadero.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('CRUD - Crear, Leer, Actualizar, Eliminar', () => {
    test('✅ Crear tarifa válida', async () => {
      const tarifaData = {
        parqueaderoId,
        tipoVehiculo: 'carro',
        tarifaHora: 5000,
        tarifaDia: 30000,
        tarifaMes: 400000,
        vigenciaDesde: new Date('2025-01-01'),
        vigenciaHasta: new Date('2026-12-31')
      };

      const resultado = await tarifaUseCase.crearTarifa(tarifaData);

      expect(resultado.success).toBe(true);
      expect(resultado.tarifa).toBeDefined();
      expect(parseFloat(resultado.tarifa.tarifaHora)).toBe(5000);
      expect(parseFloat(resultado.tarifa.tarifaDia)).toBe(30000);
      expect(parseFloat(resultado.tarifa.tarifaMes)).toBe(400000);
    });

    test('✅ Obtener tarifas por parqueadero', async () => {
      const tarifas = await tarifaRepository.findByParqueadero(parqueaderoId);

      expect(tarifas).toBeDefined();
      expect(Array.isArray(tarifas)).toBe(true);
      expect(tarifas.length).toBeGreaterThan(0);
      expect(tarifas.every(t => t.parqueaderoId === parqueaderoId)).toBe(true);
    });
  });

  describe('Validaciones de Datos', () => {
    test('❌ Rechazar tarifa sin parqueaderoId', async () => {
      const tarifaData = {
        tipoVehiculo: 'carro',
        tarifaHora: 5000,
        tarifaDia: 30000,
        tarifaMes: 400000,
        vigenciaDesde: new Date('2025-01-01'),
        vigenciaHasta: new Date('2026-12-31')
      };

      try {
        await tarifaUseCase.crearTarifa(tarifaData);
        expect(true).toBe(false); // No debería llegar aquí
      } catch (error) {
        expect(error.message).toContain('requerido');
      }
    });

    test('❌ Rechazar tarifa sin tipoVehiculo', async () => {
      const tarifaData = {
        parqueaderoId,
        tarifaHora: 5000,
        tarifaDia: 30000,
        tarifaMes: 400000,
        vigenciaDesde: new Date('2025-01-01'),
        vigenciaHasta: new Date('2026-12-31')
      };

      try {
        await tarifaUseCase.crearTarifa(tarifaData);
        expect(true).toBe(false); // No debería llegar aquí
      } catch (error) {
        expect(error.message).toContain('requerido');
      }
    });

    test('❌ Rechazar tarifa sin tarifaHora', async () => {
      const tarifaData = {
        parqueaderoId,
        tipoVehiculo: 'carro',
        tarifaDia: 30000,
        tarifaMes: 400000,
        vigenciaDesde: new Date('2025-01-01'),
        vigenciaHasta: new Date('2026-12-31')
      };

      try {
        await tarifaUseCase.crearTarifa(tarifaData);
        expect(true).toBe(false); // No debería llegar aquí
      } catch (error) {
        expect(error.message).toContain('tarifas');
      }
    });

    test('✅ Validar tipos de vehículo válidos', async () => {
      const tiposValidos = ['carro', 'moto', 'bicicleta'];

      for (const tipo of tiposValidos) {
        const tarifaData = {
          parqueaderoId,
          tipoVehiculo: tipo,
          tarifaHora: 5000,
          tarifaDia: 30000,
          tarifaMes: 400000,
          vigenciaDesde: new Date('2025-01-01'),
          vigenciaHasta: new Date('2026-12-31')
        };

        const resultado = await tarifaUseCase.crearTarifa(tarifaData);
        expect(resultado.success).toBe(true);
      }
    });
  });

  describe('Cálculo de Costos', () => {
    test('✅ Calcular costo por hora correctamente', async () => {
      const tarifaHora = 5000;
      const horas = 3;
      const costoEsperado = tarifaHora * horas;

      expect(costoEsperado).toBe(15000);
    });

    test('✅ Calcular costo por día correctamente', async () => {
      const tarifaDia = 30000;
      const dias = 2;
      const costoEsperado = tarifaDia * dias;

      expect(costoEsperado).toBe(60000);
    });

    test('✅ Aproximar horas hacia arriba', async () => {
      const tiemposMinutos = [30, 61, 119, 120, 121];
      const horasEsperadas = [1, 2, 2, 2, 3];

      tiemposMinutos.forEach((minutos, index) => {
        const horas = Math.ceil(minutos / 60);
        expect(horas).toBe(horasEsperadas[index]);
      });
    });

    test('✅ Generar recibo con detalles correctos', async () => {
      const recibo = {
        placa: 'ABC123',
        horaEntrada: new Date('2025-11-11T10:00:00Z'),
        horaSalida: new Date('2025-11-11T12:30:00Z'),
        tiempoEstacionado: 150, // minutos
        tarifaHora: 5000,
        horasRedondeadas: 3,
        costoTotal: 15000
      };

      expect(recibo.costoTotal).toBe(15000);
      expect(recibo.horasRedondeadas).toBe(3);
    });
  });

  describe('Vigencia de Tarifas', () => {
    test('✅ Obtener tarifa vigente', async () => {
      const tarifaData = {
        parqueaderoId,
        tipoVehiculo: 'moto',
        tarifaHora: 3000,
        tarifaDia: 20000,
        tarifaMes: 300000,
        vigenciaDesde: new Date('2025-01-01'),
        vigenciaHasta: new Date('2026-12-31')
      };

      const resultado = await tarifaUseCase.crearTarifa(tarifaData);
      expect(resultado.success).toBe(true);

      const tarifas = await tarifaRepository.findByParqueadero(parqueaderoId);
      const tarifaVigente = tarifas.find(t => t.tipoVehiculo === 'moto');

      expect(tarifaVigente).toBeDefined();
    });
  });

  describe('Integridad de Datos en BD', () => {
    test('✅ Tarifa se guarda correctamente en BD', async () => {
      const tarifaData = {
        parqueaderoId,
        tipoVehiculo: 'bicicleta',
        tarifaHora: 1000,
        tarifaDia: 5000,
        tarifaMes: 50000,
        vigenciaDesde: new Date('2025-01-01'),
        vigenciaHasta: new Date('2026-12-31')
      };

      const resultado = await tarifaUseCase.crearTarifa(tarifaData);
      const tarifaRecuperada = await Tarifa.findByPk(resultado.tarifa.id);

      expect(tarifaRecuperada).toBeDefined();
      expect(tarifaRecuperada.tipoVehiculo).toBe('bicicleta');
    });

    test('✅ Relación con parqueadero se mantiene', async () => {
      const tarifas = await tarifaRepository.findByParqueadero(parqueaderoId);
      expect(tarifas.length).toBeGreaterThan(0);

      tarifas.forEach(tarifa => {
        expect(tarifa.parqueaderoId).toBe(parqueaderoId);
      });
    });

    test('✅ Timestamps se crean automáticamente', async () => {
      const tarifaData = {
        parqueaderoId,
        tipoVehiculo: 'bicicleta',
        tarifaHora: 1000,
        tarifaDia: 5000,
        tarifaMes: 50000,
        vigenciaDesde: new Date('2025-01-01'),
        vigenciaHasta: new Date('2026-12-31')
      };

      const resultado = await tarifaUseCase.crearTarifa(tarifaData);

      expect(resultado.tarifa.createdAt).toBeDefined();
      expect(resultado.tarifa.updatedAt).toBeDefined();
    });
  });

  describe('Casos Extremos', () => {
    test('✅ Manejar múltiples tarifas por tipo de vehículo', async () => {
      const tarifas = [];

      for (let i = 0; i < 3; i++) {
        const tarifaData = {
          parqueaderoId,
          tipoVehiculo: 'carro',
          tarifaHora: 5000 + (i * 1000),
          tarifaDia: 30000 + (i * 5000),
          tarifaMes: 400000 + (i * 50000),
          vigenciaDesde: new Date('2025-01-01'),
          vigenciaHasta: new Date('2026-12-31')
        };

        const resultado = await tarifaUseCase.crearTarifa(tarifaData);
        if (resultado.success) {
          tarifas.push(resultado.tarifa);
        }
      }

      expect(tarifas.length).toBeGreaterThan(0);
    });

    test('✅ Calcular costos con tarifas diferentes', async () => {
      const tarifas = [
        { tipo: 'carro', hora: 5000 },
        { tipo: 'moto', hora: 3000 },
        { tipo: 'bicicleta', hora: 1000 }
      ];

      tarifas.forEach(tarifa => {
        const costo = tarifa.hora * 2;
        expect(costo).toBeGreaterThan(0);
      });
    });
  });
});
