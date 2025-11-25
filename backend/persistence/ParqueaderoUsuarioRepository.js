import sequelize from './database.js';

export class ParqueaderoUsuarioRepository {
  async asignarParqueadero(idParqueadero, idUsuario) {
    try {
      const [result] = await sequelize.query(
        `INSERT INTO parqueaderos_usuarios (id_parqueadero, id_usuario, fecha_asignacion)
         VALUES ($1, $2, CURRENT_DATE)
         ON CONFLICT (id_parqueadero, id_usuario) DO NOTHING
         RETURNING *`,
        {
          bind: [idParqueadero, idUsuario],
          type: sequelize.QueryTypes.INSERT
        }
      );
      return result[0];
    } catch (error) {
      console.error('[ERROR] Error al asignar parqueadero:', error);
      throw error;
    }
  }

  async desasignarParqueadero(idParqueadero, idUsuario) {
    try {
      await sequelize.query(
        `DELETE FROM parqueaderos_usuarios 
         WHERE id_parqueadero = $1 AND id_usuario = $2`,
        {
          bind: [idParqueadero, idUsuario],
          type: sequelize.QueryTypes.DELETE
        }
      );
      return true;
    } catch (error) {
      console.error('[ERROR] Error al desasignar parqueadero:', error);
      throw error;
    }
  }

  async obtenerParqueaderosPorUsuario(idUsuario) {
    try {
      console.log('[DEBUG] Obteniendo parqueaderos para usuario:', idUsuario);
      
      // Usar el modelo de Sequelize para obtener conversión automática a camelCase
      const asignaciones = await ParqueaderoUsuario.findAll({
        where: { idUsuario },
        include: [{
          model: Parqueadero,
          as: 'parqueadero',
          required: true
        }],
        order: [[{ model: Parqueadero, as: 'parqueadero' }, 'nombre', 'ASC']]
      });
      
      // Extraer solo los parqueaderos con sus datos en camelCase
      const parqueaderos = asignaciones.map(asig => {
        const p = asig.parqueadero.toJSON();
        return {
          ...p,
          fechaAsignacion: asig.fechaAsignacion
        };
      });
      
      console.log('[DEBUG] Parqueaderos encontrados:', parqueaderos.length);
      if (parqueaderos.length > 0) {
        console.log('[DEBUG] Primer parqueadero:', parqueaderos[0]);
      }
      return parqueaderos;
    } catch (error) {
      console.error('[ERROR] Error al obtener parqueaderos por usuario:', error);
      console.error('[ERROR] Stack:', error.stack);
      // Retornar array vacío en lugar de lanzar error
      return [];
    }
  }

  async obtenerControladoresPorParqueadero(idParqueadero) {
    try {
      const controladores = await sequelize.query(
        `SELECT u.id, u.nombre, u.apellido, u.documento, u.email, u.telefono, u.rol, pu.fecha_asignacion
         FROM usuarios u
         INNER JOIN parqueaderos_usuarios pu ON u.id = pu.id_usuario
         WHERE pu.id_parqueadero = $1 AND u.rol = 'CONTROLADOR'
         ORDER BY u.nombre, u.apellido`,
        {
          bind: [idParqueadero],
          type: sequelize.QueryTypes.SELECT
        }
      );
      return controladores;
    } catch (error) {
      console.error('[ERROR] Error al obtener controladores por parqueadero:', error);
      throw error;
    }
  }

  async verificarAccesoParqueadero(idUsuario, idParqueadero) {
    try {
      const [result] = await sequelize.query(
        `SELECT EXISTS(
          SELECT 1 FROM parqueaderos_usuarios 
          WHERE id_usuario = $1 AND id_parqueadero = $2
        ) as tiene_acceso`,
        {
          bind: [idUsuario, idParqueadero],
          type: sequelize.QueryTypes.SELECT
        }
      );
      return result.tiene_acceso;
    } catch (error) {
      console.error('[ERROR] Error al verificar acceso a parqueadero:', error);
      throw error;
    }
  }

  async obtenerTodosLosControladores() {
    try {
      const controladores = await sequelize.query(
        `SELECT id, nombre, apellido, documento, email, telefono, rol, created_at
         FROM usuarios
         WHERE rol = 'CONTROLADOR'
         ORDER BY nombre, apellido`,
        {
          type: sequelize.QueryTypes.SELECT
        }
      );
      return controladores;
    } catch (error) {
      console.error('[ERROR] Error al obtener controladores:', error);
      throw error;
    }
  }
}
