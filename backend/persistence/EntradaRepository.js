import { Entrada, Vehiculo, Parqueadero, Usuario, Salida } from './models.js';
import { Op } from 'sequelize';

export class EntradaRepository {
  async create(entradaData) {
    return await Entrada.create(entradaData);
  }

  async findById(id) {
    return await Entrada.findByPk(id, {
      include: [
        { model: Vehiculo },
        { model: Parqueadero },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }

  async findActiveByVehiculo(vehiculoId) {
    return await Entrada.findOne({
      where: { vehiculoId },
      include: [{
        model: Salida,
        required: false
      }],
      having: { '$Salida.id$': null }
    });
  }

  async findActiveByParqueadero(parqueaderoId) {
    return await Entrada.findAll({
      where: { parqueaderoId },
      include: [
        { model: Vehiculo },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] },
        {
          model: Salida,
          required: false
        }
      ],
      having: { '$Salida.id$': null }
    });
  }

  async findByDateRange(fechaInicio, fechaFin, parqueaderoId = null) {
    const whereClause = {
      fechaHoraEntrada: {
        [Op.between]: [fechaInicio, fechaFin]
      }
    };

    if (parqueaderoId) {
      whereClause.parqueaderoId = parqueaderoId;
    }

    return await Entrada.findAll({
      where: whereClause,
      include: [
        { model: Vehiculo },
        { model: Parqueadero },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }

  async findByControllerAndDateRange(controladorId, fechaInicio, fechaFin) {
    return await Entrada.findAll({
      where: {
        controladorId,
        fechaHoraEntrada: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      },
      include: [
        { model: Vehiculo },
        { model: Parqueadero }
      ]
    });
  }

  async findAll() {
    return await Entrada.findAll({
      include: [
        { model: Vehiculo },
        { model: Parqueadero },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }
}