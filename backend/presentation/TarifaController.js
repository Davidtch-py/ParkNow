import { TarifaRepository } from '../persistence/TarifaRepository.js';

const tarifaRepository = new TarifaRepository();

export class TarifaController {
  async obtenerTodas(req, res) {
    try {
      const tarifas = await tarifaRepository.findAll();
      res.json({
        success: true,
        tarifas
      });
    } catch (error) {
      console.error('❌ Error obteniendo tarifas:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const tarifa = await tarifaRepository.findById(id);

      if (!tarifa) {
        return res.status(404).json({
          success: false,
          error: 'Tarifa no encontrada'
        });
      }

      res.json({
        success: true,
        tarifa
      });
    } catch (error) {
      console.error('❌ Error obteniendo tarifa:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async crear(req, res) {
    try {
      const { parqueaderoId, tipoVehiculo, tarifaHora, tarifaDia, tarifaMes, vigenciaDesde, vigenciaHasta } = req.body;

      // Validaciones
      if (!parqueaderoId || !tipoVehiculo) {
        return res.status(400).json({
          success: false,
          error: 'ParqueaderoId y tipoVehiculo son requeridos'
        });
      }

      if (!tarifaHora || !tarifaDia || !tarifaMes) {
        return res.status(400).json({
          success: false,
          error: 'Todas las tarifas (hora, día, mes) son requeridas'
        });
      }

      if (!vigenciaDesde || !vigenciaHasta) {
        return res.status(400).json({
          success: false,
          error: 'Vigencia desde y hasta son requeridas'
        });
      }

      const tiposVehiculo = ['carro', 'moto', 'bicicleta'];
      if (!tiposVehiculo.includes(tipoVehiculo)) {
        return res.status(400).json({ 
          success: false, 
          error: 'tipoVehiculo inválido. Valores permitidos: carro, moto, bicicleta' 
        });
      }

      const nuevaTarifa = await tarifaRepository.create({
        parqueaderoId,
        tipoVehiculo,
        tarifaHora: parseFloat(tarifaHora),
        tarifaDia: parseFloat(tarifaDia),
        tarifaMes: parseFloat(tarifaMes),
        vigenciaDesde: new Date(vigenciaDesde),
        vigenciaHasta: new Date(vigenciaHasta)
      });

      return res.status(201).json({ success: true, tarifa: nuevaTarifa });
    } catch (error) {
      console.error('❌ Error creando tarifa:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { tipoVehiculo, tarifaHora, tarifaDia, tarifaMes, vigenciaDesde, vigenciaHasta } = req.body;

      const tarifa = await tarifaRepository.findById(id);
      if (!tarifa) {
        return res.status(404).json({
          success: false,
          error: 'Tarifa no encontrada'
        });
      }

      const tarifaActualizada = await tarifaRepository.update(id, {
        tipoVehiculo: tipoVehiculo || tarifa.tipoVehiculo,
        tarifaHora: tarifaHora !== undefined ? parseFloat(tarifaHora) : tarifa.tarifaHora,
        tarifaDia: tarifaDia !== undefined ? parseFloat(tarifaDia) : tarifa.tarifaDia,
        tarifaMes: tarifaMes !== undefined ? parseFloat(tarifaMes) : tarifa.tarifaMes,
        vigenciaDesde: vigenciaDesde ? new Date(vigenciaDesde) : tarifa.vigenciaDesde,
        vigenciaHasta: vigenciaHasta ? new Date(vigenciaHasta) : tarifa.vigenciaHasta
      });

      res.json({
        success: true,
        tarifa: tarifaActualizada
      });
    } catch (error) {
      console.error('❌ Error actualizando tarifa:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const tarifa = await tarifaRepository.findById(id);
      if (!tarifa) {
        return res.status(404).json({
          success: false,
          error: 'Tarifa no encontrada'
        });
      }

      await tarifaRepository.delete(id);

      res.json({
        success: true,
        message: 'Tarifa eliminada exitosamente'
      });
    } catch (error) {
      console.error('❌ Error eliminando tarifa:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerPorParqueadero(req, res) {
    try {
      const { parqueaderoId } = req.params;
      const tarifas = await tarifaRepository.findByParqueadero(parqueaderoId);

      res.json({
        success: true,
        tarifas
      });
    } catch (error) {
      console.error('❌ Error obteniendo tarifas por parqueadero:', error.message);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}
