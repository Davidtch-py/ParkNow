import { ParqueaderoUseCase } from '../application/ParqueaderoUseCase.js';
import { ParqueaderoRepository } from '../persistence/ParqueaderoRepository.js';
import { HorarioRepository } from '../persistence/HorarioRepository.js';
import { mqttService } from '../infrastructure/mqttService.js';

const parqueaderoRepository = new ParqueaderoRepository();
const horarioRepository = new HorarioRepository();
const parqueaderoUseCase = new ParqueaderoUseCase(parqueaderoRepository, horarioRepository);

export class ParqueaderoController {
  async crear(req, res) {
    try {
      const { nombre, direccion, capacidadTotal, ciudad, latitud, longitud } = req.body;

      if (!nombre || !direccion || !capacidadTotal) {
        return res.status(400).json({
          success: false,
          error: 'Nombre, dirección y capacidad total son requeridos'
        });
      }

      // Validar coordenadas GPS si se proporcionaron
      if (latitud !== undefined || longitud !== undefined) {
        // Si se proporciona una, ambas deben estar presentes
        if (latitud === undefined || longitud === undefined) {
          return res.status(400).json({
            success: false,
            error: 'Debes proporcionar tanto latitud como longitud, o no proporcionar ninguna'
          });
        }

        // Validar rango de latitud (-90 a 90)
        if (latitud < -90 || latitud > 90) {
          return res.status(400).json({
            success: false,
            error: 'La latitud debe estar entre -90 y 90 grados'
          });
        }

        // Validar rango de longitud (-180 a 180)
        if (longitud < -180 || longitud > 180) {
          return res.status(400).json({
            success: false,
            error: 'La longitud debe estar entre -180 y 180 grados'
          });
        }

        // Validar que no sean exactamente 0,0 (Null Island)
        if (latitud === 0 && longitud === 0) {
          return res.status(400).json({
            success: false,
            error: 'Las coordenadas 0,0 no son válidas'
          });
        }
      }

      const result = await parqueaderoUseCase.crearParqueadero({
        nombre,
        direccion,
        capacidadTotal,
        ciudad,
        latitud,
        longitud
      });

      if (result.success) {
        // Crear espacios automáticamente para el nuevo parqueadero
        try {
          const { sequelize } = await import('../persistence/models.js');
          const espaciosValues = [];
          const espaciosPlaceholders = [];
          
          for (let i = 1; i <= capacidadTotal; i++) {
            const idx = (i - 1) * 3;
            espaciosPlaceholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, NOW(), NOW())`);
            espaciosValues.push(`E-${String(i).padStart(3, '0')}`, 'LIBRE', result.parqueadero.id);
          }
          
          await sequelize.query(
            `INSERT INTO espacios (codigo_espacio, estado, id_parqueadero, created_at, updated_at) 
             VALUES ${espaciosPlaceholders.join(', ')}`,
            {
              bind: espaciosValues,
              type: sequelize.QueryTypes.INSERT
            }
          );
          
          console.log(`✅ ${capacidadTotal} espacios creados automáticamente para ${nombre}`);
        } catch (espacioError) {
          console.error('⚠️ Error creando espacios automáticamente:', espacioError.message);
          // No fallar la creación del parqueadero si falla la creación de espacios
        }
        
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const result = await parqueaderoUseCase.obtenerParqueaderos();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const parqueadero = await parqueaderoRepository.findById(id);

      if (!parqueadero) {
        return res.status(404).json({
          success: false,
          error: 'Parqueadero no encontrado'
        });
      }

      res.json({
        success: true,
        parqueadero
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const result = await parqueaderoUseCase.actualizarParqueadero(id, updateData);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const result = await parqueaderoUseCase.eliminarParqueadero(id);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async verificarCapacidadBaja(req, res) {
    try {
      const { umbral } = req.query;
      const result = await parqueaderoUseCase.verificarCapacidadBaja(umbral ? parseInt(umbral) : 10);
      
      // Enviar notificaciones MQTT para cada parqueadero con capacidad baja
      if (result.success && result.parqueaderos && result.parqueaderos.length > 0) {
        try {
          result.parqueaderos.forEach(parqueadero => {
            mqttService.notificarCapacidadBaja(parqueadero);
          });
        } catch (mqttError) {
          console.error('[ERROR] Error al enviar notificaciones MQTT:', mqttError);
        }
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}