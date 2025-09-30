import { Espacio, Parqueadero } from './models.js';

export class EspacioRepository {
  async create(espacioData) {
    try {
      const espacio = await Espacio.create(espacioData);
      return await this.findById(espacio.id);
    } catch (error) {
      throw new Error(`Error al crear espacio: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await Espacio.findByPk(id, {
        include: [
          {
            model: Parqueadero,
            as: 'parqueadero'
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al obtener espacio: ${error.message}`);
    }
  }

  async findAll(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.parqueaderoId) {
        whereClause.parqueaderoId = filters.parqueaderoId;
      }
      
      if (filters.tipoVehiculo) {
        whereClause.tipoVehiculo = filters.tipoVehiculo;
      }
      
      if (filters.estado !== undefined) {
        whereClause.estado = filters.estado;
      }

      return await Espacio.findAll({
        where: whereClause,
        include: [
          {
            model: Parqueadero,
            as: 'parqueadero'
          }
        ],
        order: [['numero', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error al obtener espacios: ${error.message}`);
    }
  }
  
  async findAllByParqueadero(parqueaderoId) {
    return await this.findAll({ parqueaderoId });
  }
  
  async findAllDisponibles(parqueaderoId, tipoVehiculo) {
    return await this.findAll({
      parqueaderoId,
      tipoVehiculo,
      estado: 'DISPONIBLE'
    });
  }
  
  async ocuparEspacio(id, vehiculoId) {
    try {
      const espacio = await Espacio.findByPk(id);
      if (!espacio) {
        throw new Error('Espacio no encontrado');
      }
      
      if (espacio.estado !== 'DISPONIBLE') {
        throw new Error('El espacio no está disponible');
      }
      
      await espacio.update({
        estado: 'OCUPADO',
        vehiculoId
      });
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al ocupar espacio: ${error.message}`);
    }
  }
  
  async liberarEspacio(id) {
    try {
      const espacio = await Espacio.findByPk(id);
      if (!espacio) {
        throw new Error('Espacio no encontrado');
      }
      
      if (espacio.estado !== 'OCUPADO') {
        throw new Error('El espacio no está ocupado');
      }
      
      await espacio.update({
        estado: 'DISPONIBLE',
        vehiculoId: null
      });
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al liberar espacio: ${error.message}`);
    }
  }
  
  async update(id, updateData) {
    try {
      const espacio = await Espacio.findByPk(id);
      if (!espacio) {
        throw new Error('Espacio no encontrado');
      }

      await espacio.update(updateData);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar espacio: ${error.message}`);
    }
  }
  
  async delete(id) {
    try {
      const espacio = await Espacio.findByPk(id);
      if (!espacio) {
        throw new Error('Espacio no encontrado');
      }
      
      if (espacio.estado === 'OCUPADO') {
        throw new Error('No se puede eliminar un espacio ocupado');
      }

      await espacio.destroy();
      return { success: true, message: 'Espacio eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar espacio: ${error.message}`);
    }
  }
  
  async contarPorParqueaderoYTipo(parqueaderoId) {
    try {
      const result = await Espacio.findAll({
        where: { parqueaderoId },
        attributes: [
          'tipoVehiculo',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.fn('SUM', sequelize.literal("CASE WHEN estado = 'DISPONIBLE' THEN 1 ELSE 0 END")), 'disponibles']
        ],
        group: ['tipoVehiculo']
      });
      
      return result.map(item => ({
        tipoVehiculo: item.tipoVehiculo,
        total: parseInt(item.getDataValue('total')),
        disponibles: parseInt(item.getDataValue('disponibles'))
      }));
    } catch (error) {
      throw new Error(`Error al contar espacios: ${error.message}`);
    }
  }
}
