import jwt from 'jsonwebtoken';
import { ParqueaderoUsuarioRepository } from '../persistence/ParqueaderoUsuarioRepository.js';

const parqueaderoUsuarioRepository = new ParqueaderoUsuarioRepository();

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token de acceso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token inválido' 
    });
  }
};

export const adminMiddleware = (req, res, next) => {
  // Verificar tanto 'admin' como 'ADMIN' para compatibilidad
  if (req.user.rol !== 'admin' && req.user.rol !== 'ADMIN') {
    return res.status(403).json({ 
      success: false, 
      error: 'Acceso denegado. Se requieren permisos de administrador' 
    });
  }
  next();
};

/**
 * Middleware para verificar que un controlador tenga acceso a un parqueadero específico
 * Los administradores tienen acceso a todos los parqueaderos
 */
export const parqueaderoAccessMiddleware = async (req, res, next) => {
  try {
    const { rol, id: userId } = req.user;
    
    // Los administradores tienen acceso a todos los parqueaderos
    if (rol === 'admin' || rol === 'ADMIN') {
      return next();
    }

    // Obtener el ID del parqueadero de los parámetros o del body
    const parqueaderoId = req.params.parqueaderoId || 
                          req.params.id || 
                          req.body.parqueaderoId ||
                          req.body.id_parqueadero;

    if (!parqueaderoId) {
      return res.status(400).json({
        success: false,
        error: 'ID de parqueadero no especificado'
      });
    }

    // Verificar si el controlador tiene acceso al parqueadero
    const tieneAcceso = await parqueaderoUsuarioRepository.verificarAccesoParqueadero(
      userId,
      parqueaderoId
    );

    if (!tieneAcceso) {
      return res.status(403).json({
        success: false,
        error: 'No tienes acceso a este parqueadero'
      });
    }

    next();
  } catch (error) {
    console.error('[ERROR] Error en parqueaderoAccessMiddleware:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al verificar permisos'
    });
  }
};