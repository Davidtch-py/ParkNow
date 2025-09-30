import { Vehiculo } from './models.js';
import { Op } from 'sequelize';

export class VehiculoRepository {
  async create(vehiculoData) {
    try {
      const vehiculo = await Vehiculo.create(vehiculoData);
      return await this.findById(vehiculo.id);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe un vehículo con esta placa');
      }
      throw new Error(`Error al crear vehículo: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const vehiculo = await Vehiculo.findByPk(id);
      
      if (!vehiculo) {
        throw new Error('Vehículo no encontrado');
      }
      
      return vehiculo;
    } catch (error) {
      throw new Error(`Error al obtener vehículo: ${error.message}`);
    }
  }

  async findByPlaca(placa) {
    try {
      return await Vehiculo.findOne({ 
        where: { placa }
      });
    } catch (error) {
      throw new Error(`Error al buscar vehículo por placa: ${error.message}`);
    }
  }

  async findAll(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.placa) {
        whereClause.placa = { [Op.like]: `%${filters.placa}%` };
      }
      
      if (filters.propietario) {
        whereClause.propietario = { [Op.like]: `%${filters.propietario}%` };
      }

      if (filters.tipo) {
        whereClause.tipo = filters.tipo;
      }

      return await Vehiculo.findAll({
        where: whereClause,
        order: [['placa', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error al obtener vehículos: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      const vehiculo = await Vehiculo.findByPk(id);
      if (!vehiculo) {
        throw new Error('Vehículo no encontrado');
      }

      await vehiculo.update(updateData);
      return await this.findById(id);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe un vehículo con esta placa');
      }
      throw new Error(`Error al actualizar vehículo: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const vehiculo = await Vehiculo.findByPk(id);
      if (!vehiculo) {
        throw new Error('Vehículo no encontrado');
      }

      await vehiculo.destroy();
      return { message: 'Vehículo eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar vehículo: ${error.message}`);
    }
  }

  async findByTipo(tipo) {
    try {
      return await Vehiculo.findAll({ 
        where: { tipo },
        order: [['placa', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error al buscar vehículos por tipo: ${error.message}`);
    }
  }
}