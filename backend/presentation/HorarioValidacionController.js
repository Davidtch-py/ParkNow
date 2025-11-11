import { HorarioUseCase } from '../application/HorarioUseCase.js';
import { HorarioRepository } from '../persistence/HorarioRepository.js';

export class HorarioValidacionController {
  constructor(mqtt = null) {
    this.horarioRepository = new HorarioRepository();
    this.horarioUseCase = new HorarioUseCase(this.horarioRepository);
    this.mqtt = mqtt;
  }

  /**
   * Valida si un parqueadero está abierto
   * GET /api/horarios/validar/:parqueaderoId
   */
  async validarAbierto(req, res) {
    try {
      const { parqueaderoId } = req.params;

      if (!parqueaderoId) {
        return res.status(400).json({
          success: false,
          error: 'ParqueaderoId es requerido'
        });
      }

      const resultado = await this.horarioUseCase.validarParqueaderoAbierto(parqueaderoId);

      res.status(200).json(resultado);
    } catch (error) {
      console.error('❌ Error validando horario:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene horarios de un parqueadero
   * GET /api/horarios/parqueadero/:parqueaderoId
   */
  async obtenerHorarios(req, res) {
    try {
      const { parqueaderoId } = req.params;

      const resultado = await this.horarioUseCase.obtenerHorariosParqueadero(parqueaderoId);

      res.status(200).json(resultado);
    } catch (error) {
      console.error('❌ Error obteniendo horarios:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Crea un nuevo horario
   * POST /api/horarios
   */
  async crear(req, res) {
    try {
      const horarioData = req.body;

      const resultado = await this.horarioUseCase.crearHorario(horarioData);

      // Notificar cambios
      if (this.mqtt) {
        this.mqtt.publish('parknow/horarios/actualizado', JSON.stringify({
          evento: 'horario_creado',
          horario: resultado.horario
        }));
      }

      res.status(201).json(resultado);
    } catch (error) {
      console.error('❌ Error creando horario:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualiza un horario
   * PUT /api/horarios/:id
   */
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const horarioData = req.body;

      const resultado = await this.horarioUseCase.actualizarHorario(id, horarioData);

      // Notificar cambios
      if (this.mqtt) {
        this.mqtt.publish('parknow/horarios/actualizado', JSON.stringify({
          evento: 'horario_actualizado',
          horario: resultado.horario
        }));
      }

      res.status(200).json(resultado);
    } catch (error) {
      console.error('❌ Error actualizando horario:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Elimina un horario
   * DELETE /api/horarios/:id
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const resultado = await this.horarioUseCase.eliminarHorario(id);

      // Notificar cambios
      if (this.mqtt) {
        this.mqtt.publish('parknow/horarios/actualizado', JSON.stringify({
          evento: 'horario_eliminado',
          horarioId: id
        }));
      }

      res.status(200).json(resultado);
    } catch (error) {
      console.error('❌ Error eliminando horario:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
