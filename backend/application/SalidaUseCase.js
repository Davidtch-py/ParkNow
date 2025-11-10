export class SalidaUseCase {
  constructor(salidaRepository, entradaRepository, parqueaderoRepository, tarifaRepository, vehiculoRepository, espacioRepository) {
    this.salidaRepository = salidaRepository;
    this.entradaRepository = entradaRepository;
    this.parqueaderoRepository = parqueaderoRepository;
    this.tarifaRepository = tarifaRepository;
    this.vehiculoRepository = vehiculoRepository;
    this.espacioRepository = espacioRepository;
  }

  async registrarSalida(salidaData) {
    try {
      console.log('🚀 Iniciando registro de salida:', JSON.stringify(salidaData, null, 2));
      console.log('📍 ParqueaderoId recibido en payload:', salidaData.parqueaderoId);
      
      // Buscar el registro de entrada (sin salida)
      const entrada = await this.entradaRepository.findById(salidaData.entradaId || salidaData.registroId);
      if (!entrada) {
        throw new Error('Registro de entrada no encontrado');
      }
      console.log('✅ Registro encontrado, id_vehiculo:', entrada.id_vehiculo);
      console.log('📍 Registro.id_espacio:', entrada.id_espacio);

      // Verificar que no existe una salida para esta entrada
      if (entrada.fecha_salida) {
        throw new Error('Ya existe una salida registrada para esta entrada');
      }
      console.log('✅ No tiene salida previa');

      // Obtener el vehículo para conocer el tipo
      const vehiculo = await this.vehiculoRepository.findById(entrada.id_vehiculo);
      if (!vehiculo) {
        throw new Error('Vehículo no encontrado');
      }
      console.log('✅ Vehículo encontrado:', vehiculo.placa, 'tipo:', vehiculo.tipo);

      // Obtener parqueadero desde el espacio o desde los datos de entrada
      let parqueaderoId = salidaData.parqueaderoId; // Usar el parqueaderoId del payload si viene
      
      if (!parqueaderoId) {
        // Si no viene en el payload, intentar obtenerlo desde el espacio
        if (entrada.espacio && entrada.espacio.parqueadero) {
          parqueaderoId = entrada.espacio.parqueadero.id;
          console.log('✅ Parqueadero obtenido desde entrada.espacio');
        } else if (entrada.id_espacio) {
          const espacio = await this.espacioRepository.findById(entrada.id_espacio);
          parqueaderoId = espacio.id_parqueadero;
          console.log('✅ Parqueadero obtenido buscando espacio');
        } else {
          throw new Error('No se puede determinar el parqueadero');
        }
      } else {
        console.log('✅ Parqueadero recibido desde el payload');
      }
      console.log('✅ ParqueaderoId:', parqueaderoId);

      // Buscar la tarifa vigente (opcional por ahora)
      const tarifa = await this.tarifaRepository.findByParqueaderoAndTipo(
        parqueaderoId,
        vehiculo.tipo
      );
      
      let montoTotal = 0;
      const fechaSalida = new Date();
      const tiempoTotal = Math.ceil((fechaSalida - new Date(entrada.fecha_ingreso)) / (1000 * 60)); // en minutos
      
      if (tarifa) {
        console.log('✅ Tarifa encontrada, tarifaHora:', tarifa.tarifaHora);
        montoTotal = tarifa.calcularMonto ? tarifa.calcularMonto(tiempoTotal) : ((tiempoTotal / 60) * tarifa.tarifaHora).toFixed(2);
        console.log('✅ Tiempo:', tiempoTotal, 'min, Monto:', montoTotal);
      } else {
        console.log('⚠️ No se encontró tarifa, se registrará salida con monto 0');
        console.log('✅ Tiempo:', tiempoTotal, 'min, Monto: 0');
      }

      // Liberar el espacio si está asignado
      if (entrada.id_espacio) {
        await this.espacioRepository.liberarEspacio(entrada.id_espacio);
        console.log('✅ Espacio liberado:', entrada.id_espacio);
      }

      // Actualizar el registro con la salida
      const registroActualizado = await this.salidaRepository.create({
        entradaId: entrada.id,
        registroId: entrada.id,
        fechaHoraSalida: fechaSalida,
        montoTotal,
        controladorId: salidaData.controladorId
      });
      console.log('✅ Registro actualizado con salida');

      // Aumentar capacidad disponible
      const parqueadero = await this.parqueaderoRepository.findById(parqueaderoId);
      await this.parqueaderoRepository.update(parqueaderoId, {
        capacidadDisponible: parqueadero.capacidadDisponible + 1
      });
      console.log('✅ Capacidad incrementada');

      return {
        success: true,
        salida: registroActualizado,
        resumen: {
          tiempoTotal: `${Math.floor(tiempoTotal / 60)}h ${tiempoTotal % 60}m`,
          montoTotal
        }
      };
    } catch (error) {
      console.error('❌ Error en registrarSalida:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}