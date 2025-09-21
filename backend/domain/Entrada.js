export class Entrada {
  constructor(id, vehiculoId, parqueaderoId, controladorId, fechaHoraEntrada, espacioAsignado, createdAt, updatedAt) {
    this.id = id;
    this.vehiculoId = vehiculoId;
    this.parqueaderoId = parqueaderoId;
    this.controladorId = controladorId;
    this.fechaHoraEntrada = fechaHoraEntrada;
    this.espacioAsignado = espacioAsignado;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Validaciones de dominio
  static isValidEspacioAsignado(espacio) {
    return espacio > 0;
  }

  isEntradaReciente(minutosLimite = 60) {
    const ahora = new Date();
    const diferencia = (ahora - this.fechaHoraEntrada) / (1000 * 60); // en minutos
    return diferencia <= minutosLimite;
  }
}