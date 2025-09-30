import { Parqueadero, sequelize } from './models.js';

export class ParqueaderoRepository {
  async create(parqueaderoData) {
    return await Parqueadero.create(parqueaderoData);
  }

  async findById(id) {
    return await Parqueadero.findByPk(id);
  }

  async findAll() {
    try {
      console.log('🔍 Intentando obtener todos los parqueaderos...');
      const result = await Parqueadero.findAll();
      console.log('✅ Parqueaderos obtenidos:', result.length);
      return result;
    } catch (error) {
      console.error('❌ Error en findAll:', error.message);
      throw error;
    }
  }

  async update(id, updateData) {
    await Parqueadero.update(updateData, { where: { id } });
    return await this.findById(id);
  }

  async delete(id) {
    const result = await Parqueadero.destroy({ where: { id } });
    return result > 0;
  }

  async findWithLowCapacity(threshold = 10) {
    return await Parqueadero.findAll({
      where: sequelize.literal(`(capacidad_disponible * 100.0 / capacidad_total) <= ${threshold}`)
    });
  }
}