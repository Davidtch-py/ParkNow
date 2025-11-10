import { SalidaUseCase } from '../application/SalidaUseCase.js';
import { SalidaRepository } from '../persistence/SalidaRepository.js';
import { EntradaRepository } from '../persistence/EntradaRepository.js';
import { ParqueaderoRepository } from '../persistence/ParqueaderoRepository.js';
import { TarifaRepository } from '../persistence/TarifaRepository.js';
import { VehiculoRepository } from '../persistence/VehiculoRepository.js';

const salidaRepository = new SalidaRepository();
const entradaRepository = new EntradaRepository();
const parqueaderoRepository = new ParqueaderoRepository();
const tarifaRepository = new TarifaRepository();
const vehiculoRepository = new VehiculoRepository();

const salidaUseCase = new SalidaUseCase(
  salidaRepository, 
  entradaRepository, 
  parqueaderoRepository, 
  tarifaRepository,
  vehiculoRepository
);

export class SalidaController {
  async registrar(req, res) {
    try {
      const { entradaId } = req.body;
      const controladorId = req.user.id;

      if (!entradaId) {
        return res.status(400).json({
          success: false,
          error: 'ID de entrada es requerido'
        });
      }

      const result = await salidaUseCase.registrarSalida({
        entradaId,
        controladorId
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

  async obtenerTodas(req, res) {
    try {
      const salidas = await salidaRepository.findAll();
      res.json({
        success: true,
        salidas
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
      const salida = await salidaRepository.findById(id);

      if (!salida) {
        return res.status(404).json({
          success: false,
          error: 'Salida no encontrada'
        });
      }

      res.json({
        success: true,
        salida
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}