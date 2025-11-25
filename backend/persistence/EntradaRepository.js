import { Registro, Vehiculo, Espacio, Parqueadero, Usuario } from './models.js';
import { Op } from 'sequelize';

export class EntradaRepository {
  async create(entradaData) {
    // Validar y convertir espacioAsignado a id_espacio
    let id_espacio = null;
    const espacioValue = entradaData.id_espacio || entradaData.espacioAsignado;
    
    if (espacioValue) {
      // Si es un número válido, usarlo
      const espacioNum = parseInt(espacioValue);
      if (!isNaN(espacioNum) && espacioNum > 0) {
        id_espacio = espacioNum;
      }
      // Si es string tipo "AUTO-..." o inválido, dejar como null
    }

    const payload = {
      id_vehiculo: entradaData.vehiculoId || entradaData.id_vehiculo,
      id_usuario: entradaData.controladorId || entradaData.id_usuario,
      id_espacio,
      fecha_ingreso: entradaData.fechaHoraEntrada || new Date(),
      monto_total: entradaData.monto_total || null
    };

    console.log('💾 Creando registro con payload:', payload);
    
    const resultado = await Registro.create(payload);
    
    console.log('✅ Registro creado en BD:', resultado.toJSON());
    
    return resultado;
  }

  async findById(id) {
    return await Registro.findByPk(id, {
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Espacio, as: 'espacio', include: [{ model: Parqueadero, as: 'parqueadero' }] },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }

  async findActiveByVehiculo(vehiculoId) {
    return await Registro.findOne({
      where: { 
        id_vehiculo: vehiculoId,
        fecha_salida: null
      },
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }

  async findActiveByParqueadero(parqueaderoId) {
    console.log(`[EntradaRepository] findActiveByParqueadero - parqueaderoId: ${parqueaderoId}`);
    
    try {
      const parqueaderoIdInt = parseInt(parqueaderoId);
      
      // Buscar registros activos (sin fecha_salida) que pertenezcan al parqueadero
      // Incluir tanto los que tienen espacio asignado como los que no
      const registros = await Registro.findAll({
        where: { 
          fecha_salida: null
        },
        include: [
          { 
            model: Vehiculo, 
            as: 'vehiculo',
            required: true
          },
          { 
            model: Usuario, 
            as: 'controlador', 
            attributes: ['id', 'nombre']
          },
          { 
            model: Espacio, 
            as: 'espacio',
            required: false, // Permitir registros sin espacio
            include: [{ 
              model: Parqueadero, 
              as: 'parqueadero',
              where: { id: parqueaderoIdInt },
              required: false
            }]
          }
        ]
      });
      
      // Filtrar solo los que pertenecen al parqueadero
      // (los que tienen espacio.parqueadero.id === parqueaderoId)
      const registrosFiltrados = registros.filter(r => {
        const parqueaderoDelRegistro = r.espacio?.parqueadero?.id;
        return parqueaderoDelRegistro === parqueaderoIdInt;
      });
      
      console.log(`[EntradaRepository] Total registros activos encontrados: ${registros.length}`);
      console.log(`[EntradaRepository] Registros del parqueadero ${parqueaderoId}: ${registrosFiltrados.length}`);
      registrosFiltrados.forEach((r, idx) => {
        console.log(`  [${idx + 1}] Placa: ${r.vehiculo?.placa}, Espacio: ${r.espacio?.codigo_espacio || 'Sin asignar'}`);
      });
      
      return registrosFiltrados;
    } catch (error) {
      console.error(`[EntradaRepository] Error en findActiveByParqueadero:`, error.message);
      console.error(`[EntradaRepository] Stack:`, error.stack);
      throw error;
    }
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
        fecha_ingreso: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      },
      include: includeClause
    });
  }

  async findByControllerAndDateRange(controladorId, fechaInicio, fechaFin) {
    return await Registro.findAll({
      where: {
        id_usuario: controladorId,
        fecha_ingreso: {
          [Op.between]: [fechaInicio, fechaFin]
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
      include: [
        { model: Vehiculo, as: 'vehiculo' },
        { model: Espacio, as: 'espacio', include: [{ model: Parqueadero, as: 'parqueadero' }] },
        { model: Usuario, as: 'controlador', attributes: ['id', 'nombre'] }
      ]
    });
  }
}