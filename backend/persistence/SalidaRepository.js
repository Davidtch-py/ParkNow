import { Registro, Vehiculo, Espacio, Parqueadero, Usuario } from './models.js';
import { Op } from 'sequelize';

export class SalidaRepository {
  // Actualizar un registro existente con la salida
  async create(salidaData) {
    const registro = await Registro.findByPk(salidaData.entradaId || salidaData.registroId);
    if (!registro) {
      throw new Error('Registro no encontrado');
    }
    
    await registro.update({
      fecha_salida: salidaData.fechaHoraSalida || new Date(),
      monto_total: salidaData.montoTotal || salidaData.monto_total
    });
    
    return registro;
  }

  async findById(id) {
    return await Registro.findByPk(id, {
      where: { fecha_salida: { [Op.ne]: null } },
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Espacio, as: 'espacio', include: [{ model: Parqueadero, as: 'parqueadero' }] },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }

  async findByEntrada(registroId) {
    return await Registro.findOne({
      where: { 
        id: registroId,
        fecha_salida: { [Op.ne]: null }
      },
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Espacio, as: 'espacio', include: [{ model: Parqueadero, as: 'parqueadero' }] },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }

  async findByDateRange(fechaInicio, fechaFin, parqueaderoId = null) {
    const includeClause = [
      { model: Vehiculo, as: 'vehiculo' },
      { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] },
      { 
        model: Espacio, 
        as: 'espacio',
        include: [{ model: Parqueadero, as: 'parqueadero' }]
      }
    ];

    if (parqueaderoId) {
      includeClause[2].include[0].where = { id: parqueaderoId };
      includeClause[2].required = true;
    }

    return await Registro.findAll({
      where: {
        fecha_salida: {
          [Op.between]: [fechaInicio, fechaFin],
          [Op.ne]: null
        }
      },
      include: includeClause
    });
  }

  async findByVehicleTypeAndDateRange(tipoVehiculo, fechaInicio, fechaFin, parqueaderoId = null) {
    const includeClause = [
      {
        model: Vehiculo,
        as: 'vehiculo',
        where: { tipo: tipoVehiculo }
      },
      { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] },
      { 
        model: Espacio, 
        as: 'espacio',
        include: [{ model: Parqueadero, as: 'parqueadero' }]
      }
    ];

    if (parqueaderoId) {
      includeClause[2].include[0].where = { id: parqueaderoId };
      includeClause[2].required = true;
    }

    return await Registro.findAll({
      where: {
        fecha_salida: {
          [Op.between]: [fechaInicio, fechaFin],
          [Op.ne]: null
        }
      },
      include: includeClause
    });
  }

  async findByControllerAndDateRange(controladorId, fechaInicio, fechaFin) {
    return await Registro.findAll({
      where: {
        id_usuario: controladorId,
        fecha_salida: {
          [Op.between]: [fechaInicio, fechaFin],
          [Op.ne]: null
        }
      },
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Espacio, as: 'espacio', include: [{ model: Parqueadero, as: 'parqueadero' }] }
      ]
    });
  }

  async findAll() {
    return await Registro.findAll({
      where: {
        fecha_salida: { [Op.ne]: null }
      },
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Espacio, as: 'espacio', include: [{ model: Parqueadero, as: 'parqueadero' }] },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }
}