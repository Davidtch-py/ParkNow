export class Parqueadero {
  constructor(id, nombre, direccion, capacidadTotal, capacidadDisponible, ciudad, latitud, longitud, createdAt, updatedAt) {
    this.id = id;
    this.nombre = nombre;
    this.direccion = direccion;
    this.capacidadTotal = capacidadTotal;
    this.capacidadDisponible = capacidadDisponible;
    this.ciudad = ciudad
    //this.latitud = latitud;
    //this.longitud = longitud;
    this.latitud = latitud || null;
    this.longitud = longitud || null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Validaciones de dominio
  static isValidCapacidad(capacidad) {
    return capacidad > 0;
  }

  isCapacidadBaja(umbral = 10) {
    const porcentajeDisponible = (this.capacidadDisponible / this.capacidadTotal) * 100;
    return porcentajeDisponible <= umbral;
  }

  puedeRecibirVehiculo() {
    return this.capacidadDisponible > 0;
  }
}