import { ParqueaderoUsuarioRepository } from '../persistence/ParqueaderoUsuarioRepository.js';
import { ParqueaderoRepository } from '../persistence/ParqueaderoRepository.js';
import { UsuarioRepository } from '../persistence/UsuarioRepository.js';

const parqueaderoUsuarioRepository = new ParqueaderoUsuarioRepository();
const parqueaderoRepository = new ParqueaderoRepository();
const usuarioRepository = new UsuarioRepository();

export class ParqueaderoUsuarioController {
  /**
   * Asignar un controlador a un parqueadero
   */
  async asignar(req, res) {
    try {
      const { idParqueadero, idUsuario } = req.body;

      if (!idParqueadero || !idUsuario) {
        return res.status(400).json({
          success: false,
          error: 'idParqueadero e idUsuario son requeridos'
        });
      }

      // Verificar que el parqueadero existe
      const parqueadero = await parqueaderoRepository.findById(idParqueadero);
      if (!parqueadero) {
        return res.status(404).json({
          success: false,
          error: 'Parqueadero no encontrado'
        });
      }

      // Verificar que el usuario existe y es controlador
      const usuario = await usuarioRepository.findById(idUsuario);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      if (usuario.rol !== 'CONTROLADOR') {
        return res.status(400).json({
          success: false,
          error: 'Solo se pueden asignar usuarios con rol CONTROLADOR'
        });
      }

      const asignacion = await parqueaderoUsuarioRepository.asignarParqueadero(
        idParqueadero,
        idUsuario
      );

      res.status(201).json({
        success: true,
        message: 'Controlador asignado correctamente al parqueadero',
        asignacion
      });
    } catch (error) {
      console.error('[ERROR] Error al asignar controlador:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Desasignar un controlador de un parqueadero
   */
  async desasignar(req, res) {
    try {
      const { idParqueadero, idUsuario } = req.body;

      if (!idParqueadero || !idUsuario) {
        return res.status(400).json({
          success: false,
          error: 'idParqueadero e idUsuario son requeridos'
        });
      }

      await parqueaderoUsuarioRepository.desasignarParqueadero(
        idParqueadero,
        idUsuario
      );

      res.json({
        success: true,
        message: 'Controlador desasignado correctamente del parqueadero'
      });
    } catch (error) {
      console.error('[ERROR] Error al desasignar controlador:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener parqueaderos asignados a un controlador
   */
  async obtenerParqueaderosPorControlador(req, res) {
    try {
      const { idUsuario } = req.params;

      // Si no se proporciona idUsuario, usar el del usuario autenticado
      const usuarioId = idUsuario || req.user.id;

      const parqueaderos = await parqueaderoUsuarioRepository.obtenerParqueaderosPorUsuario(
        usuarioId
      );

      res.json({
        success: true,
        parqueaderos
      });
    } catch (error) {
      console.error('[ERROR] Error al obtener parqueaderos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener controladores asignados a un parqueadero
   */
  async obtenerControladoresPorParqueadero(req, res) {
    try {
      const { idParqueadero } = req.params;

      if (!idParqueadero) {
        return res.status(400).json({
          success: false,
          error: 'idParqueadero es requerido'
        });
      }

      const controladores = await parqueaderoUsuarioRepository.obtenerControladoresPorParqueadero(
        idParqueadero
      );

      res.json({
        success: true,
        controladores
      });
    } catch (error) {
      console.error('[ERROR] Error al obtener controladores:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener todos los controladores disponibles
   */
  async obtenerTodosLosControladores(req, res) {
    try {
      const controladores = await parqueaderoUsuarioRepository.obtenerTodosLosControladores();

      res.json({
        success: true,
        controladores
      });
    } catch (error) {
      console.error('[ERROR] Error al obtener controladores:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}
