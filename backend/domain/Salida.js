export class Salida {
  constructor(id, entradaId, fechaHoraSalida, tiempoTotal, montoTotal, controladorId, createdAt, updatedAt) {
    this.id = id;
    this.entradaId = entradaId;
    this.fechaHoraSalida = fechaHoraSalida;
    this.tiempoTotal = tiempoTotal; // en minutos
    this.montoTotal = montoTotal;
    this.controladorId = controladorId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Métodos de dominio
  calcularTiempoEstadia(fechaEntrada) {
    const diferencia = this.fechaHoraSalida - fechaEntrada;
    return Math.ceil(diferencia / (1000 * 60)); // en minutos
  }

  static isValidMonto(monto) {
    return monto >= 0;
  }
}