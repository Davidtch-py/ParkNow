import { TipoVehiculo } from './models.js';

class TipoVehiculoRepository {
  async findAll() {
    try {
      return await TipoVehiculo.findAll({
        order: [['nombre', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error al obtener tipos de vehículos: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const tipoVehiculo = await TipoVehiculo.findByPk(id);
      if (!tipoVehiculo) {
        throw new Error('Tipo de vehículo no encontrado');
      }
      return tipoVehiculo;
    } catch (error) {
      throw new Error(`Error al obtener tipo de vehículo: ${error.message}`);
    }
  }

  async findByNombre(nombre) {
    try {
      return await TipoVehiculo.findOne({
        where: { nombre }
      });
    } catch (error) {
      throw new Error(`Error al buscar tipo de vehículo por nombre: ${error.message}`);
    }
  }

  async create(tipoVehiculoData) {
    try {
      return await TipoVehiculo.create(tipoVehiculoData);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe un tipo de vehículo con ese nombre');
      }
      throw new Error(`Error al crear tipo de vehículo: ${error.message}`);
    }
  }

  async update(id, tipoVehiculoData) {
    try {
      const tipoVehiculo = await this.findById(id);
      return await tipoVehiculo.update(tipoVehiculoData);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Ya existe un tipo de vehículo con ese nombre');
      }
      throw new Error(`Error al actualizar tipo de vehículo: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const tipoVehiculo = await this.findById(id);
      await tipoVehiculo.destroy();
      return { message: 'Tipo de vehículo eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar tipo de vehículo: ${error.message}`);
    }
  }
}

export default new TipoVehiculoRepository();