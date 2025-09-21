import { Salida, Entrada, Vehiculo, Usuario } from './models.js';
import { Op } from 'sequelize';

export class SalidaRepository {
  async create(salidaData) {
    return await Salida.create(salidaData);
  }

  async findById(id) {
    return await Salida.findByPk(id, {
      include: [
        {
          model: Entrada,
          include: [{ model: Vehiculo }]
        },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }

  async findByEntrada(entradaId) {
    return await Salida.findOne({
      where: { entradaId },
      include: [
        {
          model: Entrada,
          include: [{ model: Vehiculo }]
        },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }

  async findByDateRange(fechaInicio, fechaFin, parqueaderoId = null) {
    const includeClause = [
      {
        model: Entrada,
        include: [{ model: Vehiculo }]
      },
      { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
    ];

    const whereClause = {
      fechaHoraSalida: {
        [Op.between]: [fechaInicio, fechaFin]
      }
    };

    if (parqueaderoId) {
      includeClause[0].where = { parqueaderoId };
    }

    return await Salida.findAll({
      where: whereClause,
      include: includeClause
    });
  }

  async findByVehicleTypeAndDateRange(tipoVehiculo, fechaInicio, fechaFin, parqueaderoId = null) {
    const includeClause = [
      {
        model: Entrada,
        include: [{
          model: Vehiculo,
          where: { tipo: tipoVehiculo }
        }]
      },
      { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
    ];

    if (parqueaderoId) {
      includeClause[0].where = { parqueaderoId };
    }

    return await Salida.findAll({
      where: {
        fechaHoraSalida: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      },
      include: includeClause
    });
  }

  async findByControllerAndDateRange(controladorId, fechaInicio, fechaFin) {
    return await Salida.findAll({
      where: {
        controladorId,
        fechaHoraSalida: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      },
      include: [
        {
          model: Entrada,
          include: [{ model: Vehiculo }]
        }
      ]
    });
  }

  async findAll() {
    return await Salida.findAll({
      include: [
        {
          model: Entrada,
          include: [{ model: Vehiculo }]
        },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }
}