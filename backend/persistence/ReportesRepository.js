import { Reporte, Parqueadero } from './models.js';
import { Op } from 'sequelize';

export class ReportesRepository {
  // Crear un nuevo reporte
  async create(reporteData) {
    try {
      const reporte = await Reporte.create(reporteData);
      return reporte;
    } catch (error) {
      console.error('[ReportesRepository.create] Error:', error);
      throw error;
    }
  }

  // Obtener todos los reportes
  async findAll(limit = 50, offset = 0) {
    try {
      const reportes = await Reporte.findAll({
        include: [{
          model: Parqueadero,
          as: 'parqueadero',
          attributes: ['id', 'nombre', 'direccion']
        }],
        order: [['fecha_generacion', 'DESC']],
        limit,
        offset
      });

      return reportes;
    } catch (error) {
      console.error('[ReportesRepository.findAll] Error:', error);
      throw error;
    }
  }

  // Obtener un reporte por ID
  async findById(id) {
    try {
      const reporte = await Reporte.findByPk(id, {
        include: [{
          model: Parqueadero,
          as: 'parqueadero',
          attributes: ['id', 'nombre', 'direccion']
        }]
      });
      return reporte;
    } catch (error) {
      console.error('[ReportesRepository.findById] Error:', error);
      throw error;
    }
  }

  // Obtener reportes por rango de fechas
  async findByDateRange(fechaInicio, fechaFin, parqueaderoId = null) {
    try {
      const whereClause = {
        fecha_inicio: { [Op.gte]: fechaInicio },
        fecha_fin: { [Op.lte]: fechaFin }
      };

      if (parqueaderoId) {
        whereClause.parqueadero_id = parqueaderoId;
      }

      const reportes = await Reporte.findAll({
        where: whereClause,
        include: [{
          model: Parqueadero,
          as: 'parqueadero',
          attributes: ['id', 'nombre', 'direccion']
        }],
        order: [['fecha_generacion', 'DESC']]
      });

      return reportes;
    } catch (error) {
      console.error('[ReportesRepository.findByDateRange] Error:', error);
      throw error;
    }
  }

  // Obtener reportes por parqueadero
  async findByParqueadero(parqueaderoId, limit = 20) {
    try {
      const reportes = await Reporte.findAll({
        where: {
          parqueadero_id: parqueaderoId
        },
        include: [{
          model: Parqueadero,
          as: 'parqueadero',
          attributes: ['id', 'nombre', 'direccion']
        }],
        order: [['fecha_generacion', 'DESC']],
        limit
      });

      return reportes;
    } catch (error) {
      console.error('[ReportesRepository.findByParqueadero] Error:', error);
      throw error;
    }
  }

  // Obtener reportes por tipo
  async findByTipo(tipo, limit = 20) {
    try {
      const reportes = await Reporte.findAll({
        where: {
          tipo
        },
        include: [{
          model: Parqueadero,
          as: 'parqueadero',
          attributes: ['id', 'nombre', 'direccion']
        }],
        order: [['fecha_generacion', 'DESC']],
        limit
      });

      return reportes;
    } catch (error) {
      console.error('[ReportesRepository.findByTipo] Error:', error);
      throw error;
    }
  }

  // Actualizar el estado de un reporte
  async updateEstado(id, nuevoEstado) {
    try {
      const reporte = await Reporte.findByPk(id);
      
      if (!reporte) {
        throw new Error('Reporte no encontrado');
      }

      reporte.estado = nuevoEstado;
      await reporte.save();
      
      return reporte;
    } catch (error) {
      console.error('[ReportesRepository.updateEstado] Error:', error);
      throw error;
    }
  }

  // Eliminar un reporte
  async delete(id) {
    try {
      const reporte = await Reporte.findByPk(id);
      
      if (!reporte) {
        throw new Error('Reporte no encontrado');
      }

      await reporte.destroy();
      return true;
    } catch (error) {
      console.error('[ReportesRepository.delete] Error:', error);
      throw error;
    }
  }

  // Contar reportes totales
  async count(whereClause = {}) {
    try {
      const count = await Reporte.count({ where: whereClause });
      return count;
    } catch (error) {
      console.error('[ReportesRepository.count] Error:', error);
      throw error;
    }
  }

  // Obtener reportes recientes (últimos 30 días)
  async findRecent(limit = 10) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30);

      const reportes = await Reporte.findAll({
        where: {
          fecha_generacion: {
            [Op.gte]: fechaLimite
          }
        },
        include: [{
          model: Parqueadero,
          as: 'parqueadero',
          attributes: ['id', 'nombre', 'direccion']
        }],
        order: [['fecha_generacion', 'DESC']],
        limit
      });

      return reportes;
    } catch (error) {
      console.error('[ReportesRepository.findRecent] Error:', error);
      throw error;
    }
  }
}
