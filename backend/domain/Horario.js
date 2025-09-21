export class Horario {
  constructor(id, parqueaderoId, diaSemana, horaApertura, horaCierre, activo, createdAt, updatedAt) {
    this.id = id;
    this.parqueaderoId = parqueaderoId;
    this.diaSemana = diaSemana; // 0=Domingo, 1=Lunes, ..., 6=Sábado
    this.horaApertura = horaApertura; // HH:MM formato 24h
    this.horaCierre = horaCierre; // HH:MM formato 24h
    this.activo = activo;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Métodos de dominio
  static isValidDiaSemana(dia) {
    return dia >= 0 && dia <= 6;
  }

  static isValidHora(hora) {
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return horaRegex.test(hora);
  }

  estaAbierto(horaActual) {
    if (!this.activo) return false;
    
    const [horaAp, minAp] = this.horaApertura.split(':').map(Number);
    const [horaCi, minCi] = this.horaCierre.split(':').map(Number);
    const [horaAct, minAct] = horaActual.split(':').map(Number);
    
    const minutosApertura = horaAp * 60 + minAp;
    const minutosCierre = horaCi * 60 + minCi;
    const minutosActual = horaAct * 60 + minAct;
    
    return minutosActual >= minutosApertura && minutosActual <= minutosCierre;
  }

  getDuracionEnHoras() {
    const [horaAp, minAp] = this.horaApertura.split(':').map(Number);
    const [horaCi, minCi] = this.horaCierre.split(':').map(Number);
    
    const minutosApertura = horaAp * 60 + minAp;
    const minutosCierre = horaCi * 60 + minCi;
    
    return (minutosCierre - minutosApertura) / 60;
  }
}