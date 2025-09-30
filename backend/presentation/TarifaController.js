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
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async crear(req, res) {
    try {
      const { tipoVehiculo, tarifaPorHora, tarifaFija } = req.body;

      if (!tipoVehiculo || (!tarifaPorHora && !tarifaFija)) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de vehículo y al menos una tarifa son requeridos'
        });
      }

      const nuevaTarifa = await tarifaRepository.create({
        tipoVehiculo,
        tarifaPorHora: tarifaPorHora || 0,
        tarifaFija: tarifaFija || 0
      });

      res.status(201).json({
        success: true,
        tarifa: nuevaTarifa
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
      const { tipoVehiculo, tarifaPorHora, tarifaFija } = req.body;

      const tarifa = await tarifaRepository.findById(id);
      if (!tarifa) {
        return res.status(404).json({
          success: false,
          error: 'Tarifa no encontrada'
        });
      }

      const tarifaActualizada = await tarifaRepository.update(id, {
        tipoVehiculo: tipoVehiculo || tarifa.tipoVehiculo,
        tarifaPorHora: tarifaPorHora !== undefined ? tarifaPorHora : tarifa.tarifaPorHora,
        tarifaFija: tarifaFija !== undefined ? tarifaFija : tarifa.tarifaFija
      });

      res.json({
        success: true,
        tarifa: tarifaActualizada
      });
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
        message: 'Tarifa eliminada correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}
