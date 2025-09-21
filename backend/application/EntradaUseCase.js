export class EntradaUseCase {
  constructor(entradaRepository, vehiculoRepository, parqueaderoRepository) {
    this.entradaRepository = entradaRepository;
    this.vehiculoRepository = vehiculoRepository;
    this.parqueaderoRepository = parqueaderoRepository;
  }

  async registrarEntrada(entradaData) {
    try {
      // Verificar que el parqueadero existe
      const parqueadero = await this.parqueaderoRepository.findById(entradaData.parqueaderoId);
      if (!parqueadero) {
        throw new Error('Parqueadero no encontrado');
      }

      // Verificar capacidad disponible
      if (!parqueadero.puedeRecibirVehiculo()) {
        throw new Error('No hay espacios disponibles');
      }

      // Verificar que el vehículo existe
      const vehiculo = await this.vehiculoRepository.findById(entradaData.vehiculoId);
      if (!vehiculo) {
        throw new Error('Vehículo no encontrado');
      }

      // Verificar que no hay una entrada activa para este vehículo
      const entradaActiva = await this.entradaRepository.findActiveByVehiculo(entradaData.vehiculoId);
      if (entradaActiva) {
        throw new Error('El vehículo ya tiene una entrada activa');
      }

      // Registrar entrada
      const nuevaEntrada = await this.entradaRepository.create({
        ...entradaData,
        fechaHoraEntrada: new Date()
      });

      // Reducir capacidad disponible
      await this.parqueaderoRepository.update(entradaData.parqueaderoId, {
        capacidadDisponible: parqueadero.capacidadDisponible - 1
      });

      return {
        success: true,
        entrada: nuevaEntrada
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async obtenerEntradasActivas(parqueaderoId) {
    try {
      const entradas = await this.entradaRepository.findActiveByParqueadero(parqueaderoId);
      return {
        success: true,
        entradas
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}