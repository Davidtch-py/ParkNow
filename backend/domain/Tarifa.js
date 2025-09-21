export class Tarifa {
  constructor(id, parqueaderoId, tipoVehiculo, tarifaHora, tarifaDia, tarifaMes, vigenciaDesde, vigenciaHasta, createdAt, updatedAt) {
    this.id = id;
    this.parqueaderoId = parqueaderoId;
    this.tipoVehiculo = tipoVehiculo; // 'carro', 'moto', 'bicicleta'
    this.tarifaHora = tarifaHora;
    this.tarifaDia = tarifaDia;
    this.tarifaMes = tarifaMes;
    this.vigenciaDesde = vigenciaDesde;
    this.vigenciaHasta = vigenciaHasta;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Métodos de dominio
  calcularMonto(tiempoEnMinutos) {
    const horas = Math.ceil(tiempoEnMinutos / 60);
    
    if (horas >= 24 * 30) { // Más de un mes
      const meses = Math.ceil(horas / (24 * 30));
      return meses * this.tarifaMes;
    } else if (horas >= 24) { // Más de un día
      const dias = Math.ceil(horas / 24);
      return dias * this.tarifaDia;
    } else { // Por horas
      return horas * this.tarifaHora;
    }
  }

  estaVigente(fecha = new Date()) {
    return fecha >= this.vigenciaDesde && fecha <= this.vigenciaHasta;
  }

  static isValidTipoVehiculo(tipo) {
    return ['carro', 'moto', 'bicicleta'].includes(tipo);
  }
}