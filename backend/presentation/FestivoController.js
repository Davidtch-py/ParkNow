import { FestivoRepository } from '../persistence/FestivoRepository.js';
import { festivosApiService } from '../infrastructure/festivosApiService.js';

const festivoRepository = new FestivoRepository();

export class FestivoController {
  async obtenerTodos(req, res) {
    try {
      const { year } = req.query;
      
      let festivos;
      if (year) {
        festivos = await festivoRepository.findByYear(year);
      } else {
        festivos = await festivoRepository.findAll();
      }

      res.json({
        success: true,
        festivos
      });
    } catch (error) {
      console.error('[ERROR] Error al obtener festivos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const festivo = await festivoRepository.findById(id);

      if (!festivo) {
        return res.status(404).json({
          success: false,
          error: 'Festivo no encontrado'
        });
      }

      res.json({
        success: true,
        festivo
      });
    } catch (error) {
      console.error('[ERROR] Error al obtener festivo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async crear(req, res) {
    try {
      const { nombre, fecha, descripcion } = req.body;

      if (!nombre || !fecha) {
        return res.status(400).json({
          success: false,
          error: 'Nombre y fecha son requeridos'
        });
      }

      const festivo = await festivoRepository.create({
        nombre,
        fecha,
        descripcion
      });

      res.status(201).json({
        success: true,
        festivo
      });
    } catch (error) {
      console.error('[ERROR] Error al crear festivo:', error);
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un festivo registrado para esta fecha'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, fecha, descripcion } = req.body;

      const festivoExistente = await festivoRepository.findById(id);
      if (!festivoExistente) {
        return res.status(404).json({
          success: false,
          error: 'Festivo no encontrado'
        });
      }

      const festivo = await festivoRepository.update(id, {
        nombre: nombre || festivoExistente.nombre,
        fecha: fecha || festivoExistente.fecha,
        descripcion: descripcion !== undefined ? descripcion : festivoExistente.descripcion
      });

      res.json({
        success: true,
        festivo
      });
    } catch (error) {
      console.error('[ERROR] Error al actualizar festivo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const festivo = await festivoRepository.findById(id);
      if (!festivo) {
        return res.status(404).json({
          success: false,
          error: 'Festivo no encontrado'
        });
      }

      await festivoRepository.delete(id);

      res.json({
        success: true,
        message: 'Festivo eliminado correctamente'
      });
    } catch (error) {
      console.error('[ERROR] Error al eliminar festivo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async verificarFestivo(req, res) {
    try {
      const { fecha } = req.query;

      if (!fecha) {
        return res.status(400).json({
          success: false,
          error: 'Fecha es requerida'
        });
      }

      const esFestivo = await festivoRepository.esFestivo(fecha);

      res.json({
        success: true,
        fecha,
        esFestivo
      });
    } catch (error) {
      console.error('[ERROR] Error al verificar festivo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Sincronizar festivos desde la API de Colombia
   */
  async sincronizar(req, res) {
    try {
      const { year } = req.params;

      if (!year) {
        return res.status(400).json({
          success: false,
          error: 'Año es requerido'
        });
      }

      const resultado = await festivosApiService.sincronizarFestivos(parseInt(year));

      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(500).json(resultado);
      }
    } catch (error) {
      console.error('[ERROR] Error al sincronizar festivos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Sincronizar festivos del año actual y siguiente
   */
  async sincronizarActualYSiguiente(req, res) {
    try {
      const resultados = await festivosApiService.sincronizarActualYSiguiente();

      res.json({
        success: true,
        resultados
      });
    } catch (error) {
      console.error('[ERROR] Error al sincronizar festivos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}
