import { Vehiculo } from './models.js';

export class VehiculoRepository {
  async create(vehiculoData) {
    return await Vehiculo.create(vehiculoData);
  }

  async findById(id) {
    return await Vehiculo.findByPk(id);
  }

  async findByPlaca(placa) {
    return await Vehiculo.findOne({ where: { placa } });
  }

  async findAll() {
    return await Vehiculo.findAll();
  }

  async update(id, updateData) {
    await Vehiculo.update(updateData, { where: { id } });
    return await this.findById(id);
  }

  async delete(id) {
    const result = await Vehiculo.destroy({ where: { id } });
    return result > 0;
  }

  async findByTipo(tipo) {
    return await Vehiculo.findAll({ where: { tipo } });
  }
}