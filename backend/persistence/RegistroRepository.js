import { Registro, Parqueadero, Vehiculo, Usuario } from './models.js';

export class RegistroRepository {
  async create(registroData) {
    try {
      const registro = await Registro.create(registroData);
      return await this.findById(registro.id);
    } catch (error) {
      throw new Error(`Error al crear registro: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await Registro.findByPk(id, {
        include: [
          {
            model: Vehiculo,
            as: 'vehiculo'
          },
          {
            model: Parqueadero,
            as: 'parqueadero'
          },
          {
            model: Usuario,
            as: 'controlador',
            attributes: ['id', 'nombre', 'email', 'rol']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al obtener registro: ${error.message}`);
    }
  }

  async findAll(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.parqueaderoId) {
        whereClause.parqueaderoId = filters.parqueaderoId;
      }
      
      if (filters.vehiculoId) {
        whereClause.vehiculoId = filters.vehiculoId;
      }
      
      if (filters.controladorId) {
        whereClause.controladorId = filters.controladorId;
      }
      
      if (filters.estado) {
        whereClause.estado = filters.estado;
      }
      
      if (filters.fechaInicio && filters.fechaFin) {
        whereClause.fechaHoraEntrada = {
          [Op.between]: [filters.fechaInicio, filters.fechaFin]
        };
      } else if (filters.fechaInicio) {
        whereClause.fechaHoraEntrada = {
          [Op.gte]: filters.fechaInicio
        };
      } else if (filters.fechaFin) {
        whereClause.fechaHoraEntrada = {
          [Op.lte]: filters.fechaFin
        };
      }

      return await Registro.findAll({
        where: whereClause,
        include: [
          {
            model: Vehiculo,
            as: 'vehiculo'
          },
          {
            model: Parqueadero,
            as: 'parqueadero'
          },
          {
            model: Usuario,
            as: 'controlador',
            attributes: ['id', 'nombre', 'email', 'rol']
          }
        ],
        order: [['fechaHoraEntrada', 'DESC']]
      });
    } catch (error) {
      throw new Error(`Error al obtener registros: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      const registro = await Registro.findByPk(id);
      if (!registro) {
        throw new Error('Registro no encontrado');
      }

      await registro.update(updateData);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar registro: ${error.message}`);
    }
  }
  
  async registrarEntrada(vehiculoId, parqueaderoId, controladorId, espacioAsignado) {
    try {
      return await this.create({
        vehiculoId,
        parqueaderoId,
        controladorId,
        fechaHoraEntrada: new Date(),
        espacioAsignado,
        estado: 'ACTIVO'
      });
    } catch (error) {
      throw new Error(`Error al registrar entrada: ${error.message}`);
    }
  }
  
  async registrarSalida(id, montoTotal, controladorId) {
    try {
      const registro = await this.findById(id);
      if (!registro) {
        throw new Error('Registro no encontrado');
      }
      
      if (registro.estado !== 'ACTIVO') {
        throw new Error('El vehículo ya ha salido del parqueadero');
      }
      
      const fechaHoraSalida = new Date();
      const tiempoTotal = Math.floor((fechaHoraSalida - registro.fechaHoraEntrada) / (1000 * 60)); // en minutos
      
      await registro.update({
        fechaHoraSalida,
        tiempoTotal,
        montoTotal,
        controladorSalidaId: controladorId,
        estado: 'COMPLETADO'
      });
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al registrar salida: ${error.message}`);
    }
  }
  
  async obtenerRegistrosActivos(parqueaderoId) {
    return await this.findAll({
      parqueaderoId,
      estado: 'ACTIVO'
    });
  }
  
  async obtenerRegistroPorVehiculoActivo(placa) {
    try {
      const vehiculo = await Vehiculo.findOne({ where: { placa } });
      if (!vehiculo) {
        return null;
      }
      
      return await Registro.findOne({
        where: {
          vehiculoId: vehiculo.id,
          estado: 'ACTIVO'
        },
        include: [
          {
            model: Vehiculo,
            as: 'vehiculo'
          },
          {
            model: Parqueadero,
            as: 'parqueadero'
          },
          {
            model: Usuario,
            as: 'controlador',
            attributes: ['id', 'nombre', 'email', 'rol']
          }
        ]
      });
    } catch (error) {
      throw new Error(`Error al buscar registro activo: ${error.message}`);
    }
  }
}
