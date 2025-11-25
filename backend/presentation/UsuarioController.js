import { UsuarioRepository } from '../persistence/UsuarioRepository.js';
import bcrypt from 'bcryptjs';

const usuarioRepository = new UsuarioRepository();

export class UsuarioController {
  async obtenerTodos(req, res) {
    try {
      const usuarios = await usuarioRepository.findAll();
      
      // Remover contraseñas de la respuesta
      const usuariosSinPassword = usuarios.map(user => {
        const { password, ...userWithoutPassword } = user.toJSON ? user.toJSON() : user;
        return userWithoutPassword;
      });

      res.json({
        success: true,
        usuarios: usuariosSinPassword
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
      const usuario = await usuarioRepository.findById(id);

      if (!usuario) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      const { password, ...usuarioSinPassword } = usuario.toJSON ? usuario.toJSON() : usuario;

      res.json({
        success: true,
        usuario: usuarioSinPassword
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
      const { nombre, email, password, rol } = req.body;

      if (!nombre || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Nombre, email y contraseña son requeridos'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'El formato del email no es válido'
        });
      }

      // Verificar si el email ya existe
      const usuarioExistente = await usuarioRepository.findByEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está registrado'
        });
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Normalizar rol a mayúsculas
      const rolNormalizado = (rol || 'controlador').toUpperCase();

      const nuevoUsuario = await usuarioRepository.create({
        nombre,
        email,
        password: hashedPassword,
        rol: rolNormalizado
      });

      const { password: _, ...usuarioSinPassword } = nuevoUsuario.toJSON ? nuevoUsuario.toJSON() : nuevoUsuario;

      res.status(201).json({
        success: true,
        usuario: usuarioSinPassword
      });
    } catch (error) {
      console.error('[ERROR] Error al crear usuario:', error);
      
      // Manejo específico de errores de validación de Sequelize
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => {
          if (err.validatorKey === 'isEmail') {
            return 'El formato del email no es válido';
          }
          if (err.validatorKey === 'notNull' || err.validatorKey === 'notEmpty') {
            return `El campo ${err.path} es requerido`;
          }
          return err.message;
        });
        
        return res.status(400).json({
          success: false,
          error: validationErrors.join(', ')
        });
      }
      
      // Manejo de errores de clave única duplicada
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          error: 'El email ya está registrado'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, password, rol } = req.body;

      const usuario = await usuarioRepository.findById(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Verificar si el nuevo email ya existe (si se está cambiando)
      if (email && email !== usuario.email) {
        const usuarioConEmail = await usuarioRepository.findByEmail(email);
        if (usuarioConEmail) {
          return res.status(400).json({
            success: false,
            error: 'El email ya está registrado'
          });
        }
      }

      // Normalizar rol a mayúsculas si se proporciona
      const rolNormalizado = rol ? rol.toUpperCase() : usuario.rol;

      const datosActualizacion = {
        nombre: nombre || usuario.nombre,
        email: email || usuario.email,
        rol: rolNormalizado
      };

      // Solo hash la contraseña si se proporciona una nueva
      if (password) {
        datosActualizacion.password = await bcrypt.hash(password, 10);
      }

      const usuarioActualizado = await usuarioRepository.update(id, datosActualizacion);
      const { password: _, ...usuarioSinPassword } = usuarioActualizado.toJSON ? usuarioActualizado.toJSON() : usuarioActualizado;

      res.json({
        success: true,
        usuario: usuarioSinPassword
      });
    } catch (error) {
      console.error('[ERROR] Error al actualizar usuario:', error);
      
      // Manejo específico de errores de validación de Sequelize
      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => {
          if (err.validatorKey === 'isEmail') {
            return 'El formato del email no es válido';
          }
          if (err.validatorKey === 'notNull' || err.validatorKey === 'notEmpty') {
            return `El campo ${err.path} es requerido`;
          }
          return err.message;
        });
        
        return res.status(400).json({
          success: false,
          error: validationErrors.join(', ')
        });
      }
      
      // Manejo de errores de clave única duplicada
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          error: 'El email ya está registrado'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const usuario = await usuarioRepository.findById(id);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      await usuarioRepository.delete(id);

      res.json({
        success: true,
        message: 'Usuario eliminado correctamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }


}