export class SalidaUseCase {
  constructor(salidaRepository, entradaRepository, parqueaderoRepository, tarifaRepository) {
    this.salidaRepository = salidaRepository;
    this.entradaRepository = entradaRepository;
    this.parqueaderoRepository = parqueaderoRepository;
    this.tarifaRepository = tarifaRepository;
  }

  async registrarSalida(salidaData) {
    try {
      // Buscar la entrada
      const entrada = await this.entradaRepository.findById(salidaData.entradaId);
      if (!entrada) {
        throw new Error('Entrada no encontrada');
      }

      // Verificar que no existe una salida para esta entrada
      const salidaExistente = await this.salidaRepository.findByEntrada(salidaData.entradaId);
      if (salidaExistente) {
        throw new Error('Ya existe una salida registrada para esta entrada');
      }

      // Obtener el vehículo para conocer el tipo
      const vehiculo = await this.vehiculoRepository.findById(entrada.vehiculoId);
      if (!vehiculo) {
        throw new Error('Vehículo no encontrado');
      }

      // Buscar la tarifa vigente
      const tarifa = await this.tarifaRepository.findByParqueaderoAndTipo(
        entrada.parqueaderoId, 
        vehiculo.tipo
      );
      if (!tarifa) {
        throw new Error('No se encontró tarifa para este tipo de vehículo');
      }

      // Calcular tiempo y monto
      const fechaSalida = new Date();
      const tiempoTotal = Math.ceil((fechaSalida - entrada.fechaHoraEntrada) / (1000 * 60)); // en minutos
      const montoTotal = tarifa.calcularMonto(tiempoTotal);

      // Registrar salida
      const nuevaSalida = await this.salidaRepository.create({
        ...salidaData,
        fechaHoraSalida: fechaSalida,
        tiempoTotal,
        montoTotal
      });

      // Aumentar capacidad disponible
      const parqueadero = await this.parqueaderoRepository.findById(entrada.parqueaderoId);
      await this.parqueaderoRepository.update(entrada.parqueaderoId, {
        capacidadDisponible: parqueadero.capacidadDisponible + 1
      });

      return {
        success: true,
        salida: nuevaSalida,
        resumen: {
          tiempoTotal: `${Math.floor(tiempoTotal / 60)}h ${tiempoTotal % 60}m`,
          montoTotal
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