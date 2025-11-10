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
      
      if (filters.parqueaderoId || filters.id_parqueadero) {
        whereClause.id_parqueadero = filters.parqueaderoId || filters.id_parqueadero;
      }
      
      if (filters.estado !== undefined) {
        whereClause.estado = filters.estado;
      }

      return await Espacio.findAll({
        where: whereClause,
        include: [{ model: Parqueadero, as: 'parqueadero' }],
        order: [['codigo_espacio', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error al obtener espacios: ${error.message}`);
    }
  }
  
  async findAllByParqueadero(parqueaderoId) {
    try {
      return await Espacio.findAll({
        where: { id_parqueadero: parqueaderoId },
        include: [{ model: Parqueadero, as: 'parqueadero' }],
        order: [['codigo_espacio', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error al obtener espacios: ${error.message}`);
    }
  }
  
  async findAllDisponibles(parqueaderoId) {
    try {
      return await Espacio.findAll({
        where: {
          id_parqueadero: parqueaderoId,
          estado: 'LIBRE'
        },
        include: [{ model: Parqueadero, as: 'parqueadero' }],
        order: [['codigo_espacio', 'ASC']]
      });
    } catch (error) {
      throw new Error(`Error al obtener espacios disponibles: ${error.message}`);
    }
  }
  
  async ocuparEspacio(id) {
    try {
      const espacio = await Espacio.findByPk(id);
      if (!espacio) {
        throw new Error('Espacio no encontrado');
      }
      
      if (espacio.estado !== 'LIBRE') {
        throw new Error('El espacio no está disponible');
      }
      
      await espacio.update({ estado: 'OCUPADO' });
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
      
      await espacio.update({ estado: 'LIBRE' });
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
}
