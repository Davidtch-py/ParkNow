import bcryptjs from 'bcryptjs';
import { UsuarioRepository } from '../persistence/UsuarioRepository.js';

export class UsuarioUseCase {
  constructor(usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  /**
   * Obtiene todos los usuarios
   */
  async obtenerTodos(filtros = {}) {
    try {
      const usuarios = await this.usuarioRepository.findAll(filtros);
      return {
        success: true,
        usuarios: usuarios.map(u => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          rol: u.rol,
          createdAt: u.createdAt
        }))
      };
    } catch (error) {
      throw new Error(`Error obteniendo usuarios: ${error.message}`);
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async obtenerPorId(id) {
    try {
      const usuario = await this.usuarioRepository.findById(id);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      return {
        success: true,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          createdAt: usuario.createdAt
        }
      };
    } catch (error) {
      throw new Error(`Error obteniendo usuario: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo usuario
   */
  async crearUsuario(usuarioData) {
    try {
      // Validaciones
      if (!usuarioData.nombre || !usuarioData.email || !usuarioData.password) {
        throw new Error('Nombre, email y contraseña son requeridos');
      }

      // Validar rol
      const rolesValidos = ['admin', 'controlador'];
      if (!rolesValidos.includes(usuarioData.rol)) {
        throw new Error('Rol inválido. Debe ser admin o controlador');
      }

      // Verificar si email ya existe
      const usuarioExistente = await this.usuarioRepository.findByEmail(usuarioData.email);
      if (usuarioExistente) {
        throw new Error('Email ya registrado');
      }

      // Encriptar contraseña
      const salt = await bcryptjs.genSalt(10);
      const passwordEncriptada = await bcryptjs.hash(usuarioData.password, salt);

      const usuario = await this.usuarioRepository.create({
        nombre: usuarioData.nombre,
        email: usuarioData.email,
        password: passwordEncriptada,
        rol: usuarioData.rol || 'controlador'
      });

      return {
        success: true,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      };
    } catch (error) {
      throw new Error(`Error creando usuario: ${error.message}`);
    }
  }

  /**
   * Actualiza un usuario
   */
  async actualizarUsuario(id, usuarioData) {
    try {
      const usuario = await this.usuarioRepository.findById(id);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      const actualizacion = {};

      if (usuarioData.nombre) {
        actualizacion.nombre = usuarioData.nombre;
      }

      if (usuarioData.rol) {
        const rolesValidos = ['admin', 'controlador'];
        if (!rolesValidos.includes(usuarioData.rol)) {
          throw new Error('Rol inválido');
        }
        actualizacion.rol = usuarioData.rol;
      }

      if (usuarioData.password) {
        const salt = await bcryptjs.genSalt(10);
        actualizacion.password = await bcryptjs.hash(usuarioData.password, salt);
      }

      const usuarioActualizado = await this.usuarioRepository.update(id, actualizacion);

      return {
        success: true,
        usuario: {
          id: usuarioActualizado.id,
          nombre: usuarioActualizado.nombre,
          email: usuarioActualizado.email,
          rol: usuarioActualizado.rol
        }
      };
    } catch (error) {
      throw new Error(`Error actualizando usuario: ${error.message}`);
    }
  }

  /**
   * Elimina un usuario
   */
  async eliminarUsuario(id) {
    try {
      const usuario = await this.usuarioRepository.findById(id);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // No permitir eliminar el último admin
      if (usuario.rol === 'admin') {
        const admins = await this.usuarioRepository.findByRol('admin');
        if (admins.length <= 1) {
          throw new Error('No se puede eliminar el último administrador');
        }
      }

      await this.usuarioRepository.delete(id);

      return {
        success: true,
        mensaje: 'Usuario eliminado correctamente'
      };
    } catch (error) {
      throw new Error(`Error eliminando usuario: ${error.message}`);
    }
  }

  /**
   * Obtiene usuarios por rol
   */
  async obtenerPorRol(rol) {
    try {
      const usuarios = await this.usuarioRepository.findByRol(rol);
      return {
        success: true,
        usuarios: usuarios.map(u => ({
          id: u.id,
          nombre: u.nombre,
          email: u.email,
          rol: u.rol
        }))
      };
    } catch (error) {
      throw new Error(`Error obteniendo usuarios por rol: ${error.message}`);
    }
  }
}
