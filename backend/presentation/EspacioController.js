import { EspacioRepository } from '../persistence/EspacioRepository.js';
import sequelize from '../persistence/database.js';

const espacioRepository = new EspacioRepository();

export class EspacioController {
  /**
   * Obtener todos los espacios de un parqueadero con información de vehículos
   */
  async obtenerEspaciosPorParqueadero(req, res) {
    try {
      const { idParqueadero } = req.params;

      if (!idParqueadero) {
        return res.status(400).json({
          success: false,
          error: 'idParqueadero es requerido'
        });
      }

      // Obtener espacios con información de vehículos activos
      const espacios = await sequelize.query(
        `SELECT 
          e.id,
          e.codigo_espacio,
          e.estado,
          e.id_parqueadero,
          r.id as registro_id,
          r.fecha_ingreso,
          v.id as vehiculo_id,
          v.placa,
          v.marca,
          v.modelo,
          v.color,
          v.tipo as tipo_vehiculo,
          EXTRACT(EPOCH FROM (NOW() - r.fecha_ingreso)) / 3600 as horas_estacionado
        FROM espacios e
        LEFT JOIN registros r ON e.id = r.id_espacio AND r.fecha_salida IS NULL
        LEFT JOIN vehiculos v ON r.id_vehiculo = v.id
        WHERE e.id_parqueadero = $1
        ORDER BY e.codigo_espacio ASC`,
        {
          bind: [idParqueadero],
          type: sequelize.QueryTypes.SELECT
        }
      );

      res.json({
        success: true,
        espacios
      });
    } catch (error) {
      console.error('[ERROR] Error al obtener espacios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener todos los espacios
   */
  async obtenerTodos(req, res) {
    try {
      const { parqueaderoId, estado } = req.query;
      
      const filters = {};
      if (parqueaderoId) filters.parqueaderoId = parqueaderoId;
      if (estado) filters.estado = estado;

      const espacios = await espacioRepository.findAll(filters);

      res.json({
        success: true,
        espacios
      });
    } catch (error) {
      console.error('[ERROR] Error al obtener espacios:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener espacios disponibles de un parqueadero
   */
  async obtenerDisponibles(req, res) {
    try {
      const { idParqueadero } = req.params;

      if (!idParqueadero) {
        return res.status(400).json({
          success: false,
          error: 'idParqueadero es requerido'
        });
      }

      const espacios = await espacioRepository.findAllDisponibles(idParqueadero);

      res.json({
        success: true,
        espacios
      });
    } catch (error) {
      console.error('[ERROR] Error al obtener espacios disponibles:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Generar espacios automáticamente para un parqueadero
   */
  async generarEspacios(req, res) {
    try {
      const { idParqueadero } = req.params;

      if (!idParqueadero) {
        return res.status(400).json({
          success: false,
          error: 'idParqueadero es requerido'
        });
      }

      // Obtener información del parqueadero
      const parqueadero = await sequelize.query(
        'SELECT id, nombre, capacidad_total FROM parqueaderos WHERE id = $1',
        {
          bind: [idParqueadero],
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (!parqueadero || parqueadero.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Parqueadero no encontrado'
        });
      }

      const capacidadTotal = parqueadero[0].capacidad_total;

      // Verificar cuántos espacios ya existen
      const espaciosExistentes = await sequelize.query(
        'SELECT COUNT(*) as total FROM espacios WHERE id_parqueadero = $1',
        {
          bind: [idParqueadero],
          type: sequelize.QueryTypes.SELECT
        }
      );

      const totalExistentes = parseInt(espaciosExistentes[0].total);

      if (totalExistentes >= capacidadTotal) {
        return res.json({
          success: true,
          message: 'Los espacios ya están generados',
          espaciosCreados: 0
        });
      }

      // Generar los espacios faltantes
      const espaciosACrear = [];
      for (let i = totalExistentes + 1; i <= capacidadTotal; i++) {
        espaciosACrear.push({
          codigo_espacio: `E-${String(i).padStart(3, '0')}`,
          estado: 'LIBRE',
          id_parqueadero: idParqueadero
        });
      }

      // Insertar espacios en batch
      await sequelize.query(
        `INSERT INTO espacios (codigo_espacio, estado, id_parqueadero, created_at, updated_at)
         VALUES ${espaciosACrear.map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3}, NOW(), NOW())`).join(', ')}`,
        {
          bind: espaciosACrear.flatMap(e => [e.codigo_espacio, e.estado, e.id_parqueadero]),
          type: sequelize.QueryTypes.INSERT
        }
      );

      res.json({
        success: true,
        message: `Se generaron ${espaciosACrear.length} espacios exitosamente`,
        espaciosCreados: espaciosACrear.length
      });
    } catch (error) {
      console.error('[ERROR] Error al generar espacios:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Crear un nuevo espacio
   */
  async crear(req, res) {
    try {
      const { id_parqueadero, codigo_espacio, estado } = req.body;

      if (!id_parqueadero || !codigo_espacio) {
        return res.status(400).json({
          success: false,
          error: 'id_parqueadero y codigo_espacio son requeridos'
        });
      }

      const espacio = await espacioRepository.create({
        id_parqueadero,
        codigo_espacio,
        estado: estado || 'LIBRE'
      });

      res.status(201).json({
        success: true,
        message: 'Espacio creado correctamente',
        espacio
      });
    } catch (error) {
      console.error('[ERROR] Error al crear espacio:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar un espacio
   */
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'id es requerido'
        });
      }

      const espacio = await espacioRepository.update(id, updateData);

      res.json({
        success: true,
        message: 'Espacio actualizado correctamente',
        espacio
      });
    } catch (error) {
      console.error('[ERROR] Error al actualizar espacio:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar un espacio
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'id es requerido'
        });
      }

      await espacioRepository.delete(id);

      res.json({
        success: true,
        message: 'Espacio eliminado correctamente'
      });
    } catch (error) {
      console.error('[ERROR] Error al eliminar espacio:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }
}
