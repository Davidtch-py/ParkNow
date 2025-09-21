export class AuthUseCase {
  constructor(usuarioRepository, bcrypt, jwt) {
    this.usuarioRepository = usuarioRepository;
    this.bcrypt = bcrypt;
    this.jwt = jwt;
  }

  async login(email, password) {
    try {
      const usuario = await this.usuarioRepository.findByEmail(email);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      const isValidPassword = await this.bcrypt.compare(password, usuario.password);
      
      if (!isValidPassword) {
        throw new Error('Contraseña incorrecta');
      }

      const token = this.jwt.sign(
        { id: usuario.id, email: usuario.email, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        token,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async register(userData) {
    try {
      const existingUser = await this.usuarioRepository.findByEmail(userData.email);
      
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      const hashedPassword = await this.bcrypt.hash(userData.password, 10);
      
      const nuevoUsuario = await this.usuarioRepository.create({
        ...userData,
        password: hashedPassword
      });

      return {
        success: true,
        usuario: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          email: nuevoUsuario.email,
          rol: nuevoUsuario.rol
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}