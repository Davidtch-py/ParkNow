import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthUseCase } from '../application/AuthUseCase.js';
import { UsuarioRepository } from '../persistence/UsuarioRepository.js';

const usuarioRepository = new UsuarioRepository();
const authUseCase = new AuthUseCase(usuarioRepository, bcrypt, jwt);

export class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email y contraseña son requeridos'
        });
      }

      const result = await authUseCase.login(email, password);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async register(req, res) {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Nombre, email y contraseña son requeridos'
        });
      }

      const result = await authUseCase.register({ nombre, email, password, rol });
      
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

  async profile(req, res) {
    try {
      const usuario = await usuarioRepository.findById(req.user.id);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}