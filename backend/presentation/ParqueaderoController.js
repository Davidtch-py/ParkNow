import { ParqueaderoUseCase } from '../application/ParqueaderoUseCase.js';
import { ParqueaderoRepository } from '../persistence/ParqueaderoRepository.js';
import { HorarioRepository } from '../persistence/HorarioRepository.js';

const parqueaderoRepository = new ParqueaderoRepository();
const horarioRepository = new HorarioRepository();
const parqueaderoUseCase = new ParqueaderoUseCase(parqueaderoRepository, horarioRepository);

export class ParqueaderoController {
  async crear(req, res) {
    try {
      const { nombre, direccion, capacidadTotal, ciudad } = req.body;

      if (!nombre || !direccion || !capacidadTotal) {
        return res.status(400).json({
          success: false,
          error: 'Nombre, dirección y capacidad total son requeridos'
        });
      }

      const result = await parqueaderoUseCase.crearParqueadero({
        nombre,
        direccion,
        capacidadTotal,
        ciudad
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
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}