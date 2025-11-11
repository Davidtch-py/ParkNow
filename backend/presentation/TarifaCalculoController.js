import { TarifaUseCase } from '../application/TarifaUseCase.js';
import { TarifaRepository } from '../persistence/TarifaRepository.js';
import { SalidaRepository } from '../persistence/SalidaRepository.js';

export class TarifaCalculoController {
  constructor(mqtt = null) {
    this.tarifaRepository = new TarifaRepository();
    this.salidaRepository = new SalidaRepository();
    this.tarifaUseCase = new TarifaUseCase(this.tarifaRepository, this.salidaRepository);
    this.mqtt = mqtt;
  }

  /**
   * Calcula el costo de salida para un vehículo
   * POST /api/tarifas/calcular-costo
   */
  async calcularCosto(req, res) {
    try {
      const { parqueaderoId, tipoVehiculo, fechaIngreso, fechaSalida } = req.body;

      // Validaciones
      if (!parqueaderoId || !tipoVehiculo || !fechaIngreso) {
        return res.status(400).json({
          success: false,
          error: 'parqueaderoId, tipoVehiculo y fechaIngreso son requeridos'
        });
      }

      const resultado = await this.tarifaUseCase.calcularCosto(
        parqueaderoId,
        tipoVehiculo,
        new Date(fechaIngreso),
        fechaSalida ? new Date(fechaSalida) : new Date()
      );

      res.status(200).json(resultado);
    } catch (error) {
      console.error('❌ Error calculando costo:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene todas las tarifas de un parqueadero
   * GET /api/tarifas/parqueadero/:parqueaderoId
   */
  async obtenerTarifasParqueadero(req, res) {
    try {
      const { parqueaderoId } = req.params;

      const resultado = await this.tarifaUseCase.obtenerTarifasParqueadero(parqueaderoId);

      res.status(200).json(resultado);
    } catch (error) {
      console.error('❌ Error obteniendo tarifas:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Crea una nueva tarifa
   * POST /api/tarifas
   */
  async crear(req, res) {
    try {
      const tarifaData = req.body;

      const resultado = await this.tarifaUseCase.crearTarifa(tarifaData);

      // Notificar cambios
      if (this.mqtt) {
        this.mqtt.publish('parknow/tarifas/actualizado', JSON.stringify({
          evento: 'tarifa_creada',
          tarifa: resultado.tarifa
        }));
      }

      res.status(201).json(resultado);
    } catch (error) {
      console.error('❌ Error creando tarifa:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Actualiza una tarifa
   * PUT /api/tarifas/:id
   */
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const tarifaData = req.body;

      const resultado = await this.tarifaUseCase.actualizarTarifa(id, tarifaData);

      // Notificar cambios
      if (this.mqtt) {
        this.mqtt.publish('parknow/tarifas/actualizado', JSON.stringify({
          evento: 'tarifa_actualizada',
          tarifa: resultado.tarifa
        }));
      }

      res.status(200).json(resultado);
    } catch (error) {
      console.error('❌ Error actualizando tarifa:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Elimina una tarifa
   * DELETE /api/tarifas/:id
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const resultado = await this.tarifaUseCase.eliminarTarifa(id);

      // Notificar cambios
      if (this.mqtt) {
        this.mqtt.publish('parknow/tarifas/actualizado', JSON.stringify({
          evento: 'tarifa_eliminada',
          tarifaId: id
        }));
      }

      res.status(200).json(resultado);
    } catch (error) {
      console.error('❌ Error eliminando tarifa:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene todas las tarifas
   * GET /api/tarifas
   */
  async obtenerTodas(req, res) {
    try {
      const tarifas = await this.tarifaRepository.findAll();

      res.status(200).json({
        success: true,
        tarifas
      });
    } catch (error) {
      console.error('❌ Error obteniendo tarifas:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene una tarifa por ID
   * GET /api/tarifas/:id
   */
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const tarifa = await this.tarifaRepository.findById(id);

      if (!tarifa) {
        return res.status(404).json({
          success: false,
          error: 'Tarifa no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        tarifa
      });
    } catch (error) {
      console.error('❌ Error obteniendo tarifa:', error.message);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}
