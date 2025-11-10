import { Usuario } from './models.js';

export class UsuarioRepository {
  async create(userData) {
    return await Usuario.create(userData);
  }

  async findById(id) {
    return await Usuario.findByPk(id);
  }

  async findByEmail(email) {
    return await Usuario.findOne({ where: { email } });
  }

  async findAll() {
    return await Usuario.findAll({
      attributes: { exclude: ['password'] }
    });
  }

  async update(id, updateData) {
    await Usuario.update(updateData, { where: { id } });
    return await this.findById(id);
  }

  async delete(id) {
    const result = await Usuario.destroy({ where: { id } });
    return result > 0;
  }
}