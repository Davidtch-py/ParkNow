import { VehiculoUseCase } from '../application/VehiculoUseCase.js';
import { VehiculoRepository } from '../persistence/VehiculoRepository.js';
import { mqttService } from '../infrastructure/mqttService.js';

const vehiculoRepository = new VehiculoRepository();
const vehiculoUseCase = new VehiculoUseCase(vehiculoRepository);

export class VehiculoController {
  async crear(req, res) {
    try {
      const { placa, tipo, propietario, telefono, color, marca, modelo } = req.body;

      const resultado = await vehiculoUseCase.crearVehiculo({
        placa,
        tipo,
        propietario,
        telefono,
        color,
        marca,
        modelo
      });

      if (resultado.success) {
        // Publicar en MQTT para notificación en tiempo real
        mqttService.publish('vehiculos/creado', {
          vehiculo: resultado.vehiculo,
          timestamp: new Date().toISOString(),
          usuario: req.usuario?.nombre || 'Sistema'
        });

        res.status(201).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en VehiculoController.crear:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const { placa, propietario, tipo } = req.query;
      
      const filters = {};
      if (placa) filters.placa = placa;
      if (propietario) filters.propietario = propietario;
      if (tipo) filters.tipo = tipo;

      const resultado = await vehiculoUseCase.obtenerTodos(filters);
      
      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en VehiculoController.obtenerTodos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      
      const resultado = await vehiculoUseCase.obtenerPorId(parseInt(id));
      
      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(404).json(resultado);
      }
    } catch (error) {
      console.error('Error en VehiculoController.obtenerPorId:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerPorPlaca(req, res) {
    try {
      const { placa } = req.params;
      
      const resultado = await vehiculoUseCase.obtenerPorPlaca(placa);
      
      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(404).json(resultado);
      }
    } catch (error) {
      console.error('Error en VehiculoController.obtenerPorPlaca:', error);
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
      
      const resultado = await vehiculoUseCase.actualizarVehiculo(parseInt(id), updateData);
      
      if (resultado.success) {
        // Publicar en MQTT para notificación en tiempo real
        mqttService.publish('vehiculos/actualizado', {
          vehiculo: resultado.vehiculo,
          timestamp: new Date().toISOString(),
          usuario: req.usuario?.nombre || 'Sistema'
        });

        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en VehiculoController.actualizar:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      
      const resultado = await vehiculoUseCase.eliminarVehiculo(parseInt(id));
      
      if (resultado.success) {
        // Publicar en MQTT para notificación en tiempo real
        mqttService.publish('vehiculos/eliminado', {
          id: parseInt(id),
          timestamp: new Date().toISOString(),
          usuario: req.usuario?.nombre || 'Sistema'
        });

        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en VehiculoController.eliminar:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerPorTipo(req, res) {
    try {
      const { tipo } = req.params;
      
      const resultado = await vehiculoUseCase.obtenerPorTipo(tipo);
      
      if (resultado.success) {
        res.json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en VehiculoController.obtenerPorTipo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}
