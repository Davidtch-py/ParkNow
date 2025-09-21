export class Vehiculo {
  constructor(id, placa, tipo, color, marca, modelo, propietario, telefono, createdAt, updatedAt) {
    this.id = id;
    this.placa = placa;
    this.tipo = tipo; // 'carro', 'moto', 'bicicleta'
    this.color = color;
    this.marca = marca;
    this.modelo = modelo;
    this.propietario = propietario;
    this.telefono = telefono;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Validaciones de dominio
  static isValidTipo(tipo) {
    return ['carro', 'moto', 'bicicleta'].includes(tipo);
  }

  static isValidPlaca(placa) {
    // Formato básico de placa colombiana: ABC123 o ABC12D
    const placaRegex = /^[A-Z]{3}[0-9]{2}[0-9A-Z]$/;
    return placaRegex.test(placa);
  }

  static isValidTelefono(telefono) {
    const telefonoRegex = /^[0-9]{10}$/;
    return telefonoRegex.test(telefono);
  }
}