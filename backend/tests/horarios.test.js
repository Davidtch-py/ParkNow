/**
 * Tests Exhaustivos para Horarios de Atención - VERSIÓN CORREGIDA
 * Valida: Creación, lectura, actualización, eliminación, validaciones
 */

import { HorarioRepository } from '../persistence/HorarioRepository.js';
import { sequelize, Horario, Parqueadero } from '../persistence/models.js';

describe('Horarios de Atención - Tests Exhaustivos (Corregido)', () => {
  let horarioRepository;
  let parqueaderoId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    horarioRepository = new HorarioRepository();

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
    test('✅ Crear horario válido', async () => {
      const horarioData = {
        parqueaderoId,
        diaSemana: 'LUNES',
        horaApertura: '06:00',
        horaCierre: '22:00',
        activo: true
      };

      const horario = await horarioRepository.create(horarioData);

      expect(horario).toBeDefined();
      expect(horario.id).toBeDefined();
      expect(horario.parqueaderoId).toBe(parqueaderoId);
      expect(horario.diaSemana).toBe('LUNES');
      expect(horario.activo).toBe(true);
    });

    test('✅ Obtener horarios por parqueadero', async () => {
      const horarios = await horarioRepository.findByParqueadero(parqueaderoId);

      expect(horarios).toBeDefined();
      expect(Array.isArray(horarios)).toBe(true);
      expect(horarios.length).toBeGreaterThan(0);
      expect(horarios.every(h => h.parqueaderoId === parqueaderoId)).toBe(true);
    });

    test('✅ Actualizar horario', async () => {
      const horarios = await horarioRepository.findByParqueadero(parqueaderoId);
      const horarioId = horarios[0].id;

      const horarioActualizado = await horarioRepository.update(horarioId, {
        horaApertura: '07:00',
        horaCierre: '23:00',
        activo: false
      });

      expect(horarioActualizado).toBeDefined();
      expect(horarioActualizado.activo).toBe(false);
    });

    test('✅ Eliminar horario', async () => {
      const horarioData = {
        parqueaderoId,
        diaSemana: 'MARTES',
        horaApertura: '06:00',
        horaCierre: '22:00'
      };

      const horario = await horarioRepository.create(horarioData);
      const resultado = await horarioRepository.delete(horario.id);

      expect(resultado).toBe(true);
    });
  });

  describe('Validaciones de Datos', () => {
    test('❌ Rechazar horario sin parqueaderoId', async () => {
      const horarioData = {
        diaSemana: 'LUNES',
        horaApertura: '06:00',
        horaCierre: '22:00'
      };

      await expect(horarioRepository.create(horarioData)).rejects.toThrow();
    });

    test('❌ Rechazar horario sin diaSemana', async () => {
      const horarioData = {
        parqueaderoId,
        horaApertura: '06:00',
        horaCierre: '22:00'
      };

      await expect(horarioRepository.create(horarioData)).rejects.toThrow();
    });

    test('❌ Rechazar horario sin horaApertura', async () => {
      const horarioData = {
        parqueaderoId,
        diaSemana: 'LUNES',
        horaCierre: '22:00'
      };

      await expect(horarioRepository.create(horarioData)).rejects.toThrow();
    });

    test('❌ Rechazar horario sin horaCierre', async () => {
      const horarioData = {
        parqueaderoId,
        diaSemana: 'LUNES',
        horaApertura: '06:00'
      };

      await expect(horarioRepository.create(horarioData)).rejects.toThrow();
    });

    test('✅ Validar días de semana válidos', async () => {
      const diasValidos = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

      for (const dia of diasValidos) {
        const horario = await horarioRepository.create({
          parqueaderoId,
          diaSemana: dia,
          horaApertura: '06:00',
          horaCierre: '22:00'
        });

        expect(horario.diaSemana).toBe(dia);
      }
    });

    test('✅ Validar formato de hora', async () => {
      const horarioData = {
        parqueaderoId,
        diaSemana: 'LUNES',
        horaApertura: '06:00',
        horaCierre: '22:00'
      };

      const horario = await horarioRepository.create(horarioData);

      const regexHora = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
      expect(regexHora.test(horario.horaApertura)).toBe(true);
      expect(regexHora.test(horario.horaCierre)).toBe(true);
    });
  });

  describe('Integridad de Datos en BD', () => {
    test('✅ Horario se guarda correctamente en BD', async () => {
      const horarioData = {
        parqueaderoId,
        diaSemana: 'VIERNES',
        horaApertura: '08:00',
        horaCierre: '20:00'
      };

      const horario = await horarioRepository.create(horarioData);
      const horarioRecuperado = await Horario.findByPk(horario.id);

      expect(horarioRecuperado).toBeDefined();
      expect(horarioRecuperado.diaSemana).toBe('VIERNES');
    });

    test('✅ Relación con parqueadero se mantiene', async () => {
      const horario = await horarioRepository.create({
        parqueaderoId,
        diaSemana: 'SABADO',
        horaApertura: '09:00',
        horaCierre: '18:00'
      });

      const horarioConParqueadero = await Horario.findByPk(horario.id, {
        include: ['Parqueadero']
      });

      expect(horarioConParqueadero.Parqueadero).toBeDefined();
      expect(horarioConParqueadero.Parqueadero.id).toBe(parqueaderoId);
    });

    test('✅ Timestamps se crean automáticamente', async () => {
      const horario = await horarioRepository.create({
        parqueaderoId,
        diaSemana: 'DOMINGO',
        horaApertura: '10:00',
        horaCierre: '17:00'
      });

      expect(horario.createdAt).toBeDefined();
      expect(horario.updatedAt).toBeDefined();
      expect(horario.createdAt instanceof Date).toBe(true);
    });
  });

  describe('Casos Extremos', () => {
    test('✅ Crear múltiples horarios para mismo parqueadero', async () => {
      const horarios = [];

      for (let i = 0; i < 3; i++) {
        const dias = ['LUNES', 'MARTES', 'MIERCOLES'];
        const horario = await horarioRepository.create({
          parqueaderoId,
          diaSemana: dias[i],
          horaApertura: '06:00',
          horaCierre: '22:00'
        });
        horarios.push(horario);
      }

      expect(horarios.length).toBe(3);
      const horariosRecuperados = await horarioRepository.findByParqueadero(parqueaderoId);
      expect(horariosRecuperados.length).toBeGreaterThanOrEqual(3);
    });
  });
});
