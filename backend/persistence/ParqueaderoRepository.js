import { Parqueadero } from './models.js';

export class ParqueaderoRepository {
  async create(parqueaderoData) {
    return await Parqueadero.create(parqueaderoData);
  }

  async findById(id) {
    return await Parqueadero.findByPk(id);
  }

  async findAll() {
    return await Parqueadero.findAll();
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