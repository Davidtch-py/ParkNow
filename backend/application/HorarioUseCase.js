import { HorarioRepository } from '../persistence/HorarioRepository.js';

export class HorarioUseCase {
  constructor(horarioRepository) {
    this.horarioRepository = horarioRepository;
  }

  /**
   * Valida si un parqueadero está abierto en este momento
   */
  async validarParqueaderoAbierto(parqueaderoId) {
    try {
      const ahora = new Date();
      const diaSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'][ahora.getDay()];
      const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
      
      // Obtener horario del día actual
      const horario = await this.horarioRepository.findByParqueaderoAndDia(parqueaderoId, diaSemana);
      
      if (!horario) {
        return {
          abierto: false,
          razon: 'No hay horario configurado para este día',
          horario: null
        };
      }
      
      if (!horario.abierto) {
        return {
          abierto: false,
          razon: 'Parqueadero cerrado este día',
          horario
        };
      }
      
      if (horaActual < horario.horaApertura) {
        return {
          abierto: false,
          razon: `Abre a las ${horario.horaApertura}`,
          horario
        };
      }
      
      if (horaActual > horario.horaCierre) {
        return {
          abierto: false,
          razon: `Cerrado. Abre mañana a las ${horario.horaApertura}`,
          horario
        };
      }
      
      // Calcular minutos hasta cierre
      const [horaC, minC] = horario.horaCierre.split(':').map(Number);
      const [horaA, minA] = horaActual.split(':').map(Number);
      const minutosHastaCierre = (horaC * 60 + minC) - (horaA * 60 + minA);
      
      return {
        abierto: true,
        razon: null,
        horario,
        minutosHastaCierre: minutosHastaCierre,
        proximoCierre: horario.horaCierre
      };
    } catch (error) {
      throw new Error(`Error validando horario: ${error.message}`);
    }
  }

  /**
   * Obtiene horarios de un parqueadero
   */
  async obtenerHorariosParqueadero(parqueaderoId) {
    try {
      const horarios = await this.horarioRepository.findByParqueadero(parqueaderoId);
      return {
        success: true,
        horarios
      };
    } catch (error) {
      throw new Error(`Error obteniendo horarios: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo horario
   */
  async crearHorario(horarioData) {
    try {
      // Validaciones
      if (!horarioData.parqueaderoId || !horarioData.diaSemana) {
        throw new Error('ParqueaderoId y diaSemana son requeridos');
      }

      if (!horarioData.horaApertura || !horarioData.horaCierre) {
        throw new Error('Hora de apertura y cierre son requeridas');
      }

      // Validar que apertura < cierre
      if (horarioData.horaApertura >= horarioData.horaCierre) {
        throw new Error('La hora de apertura debe ser menor a la de cierre');
      }

      const horario = await this.horarioRepository.create(horarioData);
      return {
        success: true,
        horario
      };
    } catch (error) {
      throw new Error(`Error creando horario: ${error.message}`);
    }
  }

  /**
   * Actualiza un horario
   */
  async actualizarHorario(id, horarioData) {
    try {
      const horario = await this.horarioRepository.update(id, horarioData);
      return {
        success: true,
        horario
      };
    } catch (error) {
      throw new Error(`Error actualizando horario: ${error.message}`);
    }
  }

  /**
   * Elimina un horario
   */
  async eliminarHorario(id) {
    try {
      await this.horarioRepository.delete(id);
      return {
        success: true,
        mensaje: 'Horario eliminado correctamente'
      };
    } catch (error) {
      throw new Error(`Error eliminando horario: ${error.message}`);
    }
  }
}
