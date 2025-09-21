export class Usuario {
  constructor(id, nombre, email, password, rol, createdAt, updatedAt) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.rol = rol; // 'admin', 'controlador'
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Validaciones de dominio
  static isValidRol(rol) {
    return ['admin', 'controlador'].includes(rol);
  }

  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}