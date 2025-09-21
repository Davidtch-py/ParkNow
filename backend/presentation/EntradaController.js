import { EntradaUseCase } from '../application/EntradaUseCase.js';
import { EntradaRepository } from '../persistence/EntradaRepository.js';
import { VehiculoRepository } from '../persistence/VehiculoRepository.js';
import { ParqueaderoRepository } from '../persistence/ParqueaderoRepository.js';

const entradaRepository = new EntradaRepository();
const vehiculoRepository = new VehiculoRepository();
const parqueaderoRepository = new ParqueaderoRepository();
const entradaUseCase = new EntradaUseCase(entradaRepository, vehiculoRepository, parqueaderoRepository);

export class EntradaController {
  async registrar(req, res) {
    try {
      const { vehiculoId, parqueaderoId, espacioAsignado } = req.body;
      const controladorId = req.user.id;

      if (!vehiculoId || !parqueaderoId) {
        return res.status(400).json({
          success: false,
          error: 'ID del vehículo y parqueadero son requeridos'
        });
      }

      const result = await entradaUseCase.registrarEntrada({
        vehiculoId,
        parqueaderoId,
        controladorId,
        espacioAsignado
      });

      if (result.success) {
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

  async obtenerActivas(req, res) {
    try {
      const { parqueaderoId } = req.params;
      const result = await entradaUseCase.obtenerEntradasActivas(parqueaderoId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerTodas(req, res) {
    try {
      const entradas = await entradaRepository.findAll();
      res.json({
        success: true,
        entradas
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
      const entrada = await entradaRepository.findById(id);

      if (!entrada) {
        return res.status(404).json({
          success: false,
          error: 'Entrada no encontrada'
        });
      }

      res.json({
        success: true,
        entrada
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}