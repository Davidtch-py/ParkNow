import { Tarifa, Parqueadero } from './models.js';
import { Op } from 'sequelize';

export class TarifaRepository {
  async create(tarifaData) {
    return await Tarifa.create(tarifaData);
  }

  async findById(id) {
    return await Tarifa.findByPk(id, {
      include: [{ model: Parqueadero }]
    });
  }

  async findByParqueaderoAndTipo(parqueaderoId, tipoVehiculo) {
    const fechaActual = new Date();
    
    return await Tarifa.findOne({
      where: {
        parqueaderoId,
        tipoVehiculo,
        vigenciaDesde: { [Op.lte]: fechaActual },
        vigenciaHasta: { [Op.gte]: fechaActual }
      },
      include: [{ model: Parqueadero }]
    });
  }

  async findByParqueadero(parqueaderoId) {
    return await Tarifa.findAll({
      where: { parqueaderoId },
      include: [{ model: Parqueadero }]
    });
  }

  async findAll() {
    return await Tarifa.findAll({
      include: [{ model: Parqueadero }]
    });
  }

  async update(id, updateData) {
    await Tarifa.update(updateData, { where: { id } });
    return await this.findById(id);
  }

  async delete(id) {
    const result = await Tarifa.destroy({ where: { id } });
    return result > 0;
  }
}