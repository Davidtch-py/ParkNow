import { HorarioRepository } from '../persistence/HorarioRepository.js';

const horarioRepository = new HorarioRepository();

export class HorarioController {
  async obtenerTodos(req, res) {
    try {
      const { parqueaderoId } = req.query;
      
      let horarios;
      if (parqueaderoId) {
        horarios = await horarioRepository.findByParqueadero(parqueaderoId);
      } else {
        horarios = await horarioRepository.findAll();
      }

      res.json({
        success: true,
        horarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const horario = await horarioRepository.findById(id);

      if (!horario) {
        return res.status(404).json({
          success: false,
          error: 'Horario no encontrado'
        });
      }

      res.json({
        success: true,
        horario
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async crear(req, res) {
    try {
      const { parqueaderoId, diaSemana, horaApertura, horaCierre, activo, esFestivo } = req.body;

      console.log('[HorarioController] Datos recibidos:', req.body);

      if (!parqueaderoId || !diaSemana || !horaApertura || !horaCierre) {
        return res.status(400).json({
          success: false,
          error: 'Parqueadero, día de semana, hora de apertura y cierre son requeridos'
        });
      }

      const nuevoHorario = await horarioRepository.create({
        parqueaderoId,
        diaSemana,
        horaApertura,
        horaCierre,
        activo: activo !== undefined ? activo : true,
        esFestivo: esFestivo || false
      });

      res.status(201).json({
        success: true,
        horario: nuevoHorario
      });
    } catch (error) {
      console.error('[HorarioController] Error al crear horario:', error);
      console.error('[HorarioController] Stack:', error.stack);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { diaSemana, horaApertura, horaCierre, activo } = req.body;

      const horario = await horarioRepository.findById(id);
      if (!horario) {
        return res.status(404).json({
          success: false,
          error: 'Horario no encontrado'
        });
      }

      const horarioActualizado = await horarioRepository.update(id, {
        diaSemana: diaSemana || horario.diaSemana,
        horaApertura: horaApertura || horario.horaApertura,
        horaCierre: horaCierre || horario.horaCierre,
        activo: activo !== undefined ? activo : horario.activo
      });

      res.json({
        success: true,
        horario: horarioActualizado
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const horario = await horarioRepository.findById(id);
      if (!horario) {
        return res.status(404).json({
          success: false,
          error: 'Horario no encontrado'
        });
      }

      await horarioRepository.delete(id);

      res.json({
        success: true,
        message: 'Horario eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerPorParqueadero(req, res) {
    try {
      const { parqueaderoId } = req.params;
      const horarios = await horarioRepository.findByParqueadero(parqueaderoId);

      res.json({
        success: true,
        horarios
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}