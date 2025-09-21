import { Horario, Parqueadero } from './models.js';

export class HorarioRepository {
  async create(horarioData) {
    return await Horario.create(horarioData);
  }

  async findById(id) {
    return await Horario.findByPk(id, {
      include: [{ model: Parqueadero }]
    });
  }

  async findByParqueadero(parqueaderoId) {
    return await Horario.findAll({
      where: { parqueaderoId },
      include: [{ model: Parqueadero }]
    });
  }

  async findAll() {
    return await Horario.findAll({
      include: [{ model: Parqueadero }]
    });
  }

  async update(id, updateData) {
    await Horario.update(updateData, { where: { id } });
    return await this.findById(id);
  }

  async delete(id) {
    const result = await Horario.destroy({ where: { id } });
    return result > 0;
  }

  async findByParqueaderoAndDay(parqueaderoId, diaSemana) {
    return await Horario.findOne({
      where: { 
        parqueaderoId, 
        diaSemana,
        activo: true 
      }
    });
  }
}