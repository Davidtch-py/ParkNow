export class EntradaUseCase {
  constructor(entradaRepository, vehiculoRepository, parqueaderoRepository, espacioRepository) {
    this.entradaRepository = entradaRepository;
    this.vehiculoRepository = vehiculoRepository;
    this.parqueaderoRepository = parqueaderoRepository;
    this.espacioRepository = espacioRepository;
  }

  async registrarEntrada(entradaData) {
    try {
      console.log('🚀 Iniciando registro de entrada:', entradaData);
      
      // Verificar que el parqueadero existe
      const parqueadero = await this.parqueaderoRepository.findById(entradaData.parqueaderoId);
      if (!parqueadero) {
        throw new Error('Parqueadero no encontrado');
      }
      console.log('✅ Parqueadero encontrado:', parqueadero.nombre);

      // Verificar capacidad disponible
      if (!parqueadero.puedeRecibirVehiculo()) {
        throw new Error('No hay espacios disponibles');
      }
      console.log('✅ Capacidad disponible:', parqueadero.capacidadDisponible);

      // Verificar que el vehículo existe
      const vehiculo = await this.vehiculoRepository.findById(entradaData.vehiculoId);
      if (!vehiculo) {
        throw new Error('Vehículo no encontrado');
      }
      console.log('✅ Vehículo encontrado:', vehiculo.placa);

      // Verificar que no hay una entrada activa para este vehículo
      const entradaActiva = await this.entradaRepository.findActiveByVehiculo(entradaData.vehiculoId);
      if (entradaActiva) {
        throw new Error('El vehículo ya tiene una entrada activa');
      }
      console.log('✅ No hay entrada activa previa');

      // Asignar espacio automáticamente si no se proporcionó uno válido
      let espacioAsignado = null;
      const espacioValue = entradaData.espacioAsignado;
      const espacioNum = parseInt(espacioValue);
      
      // Si se proporciona un ID de espacio válido, verificarlo
      if (!isNaN(espacioNum) && espacioNum > 0) {
        const espacio = await this.espacioRepository.findById(espacioNum);
        if (espacio && espacio.estado === 'LIBRE') {
          espacioAsignado = espacioNum;
        }
      }
      
      // Si no hay espacio asignado, buscar uno disponible automáticamente
      if (!espacioAsignado) {
        const espaciosDisponibles = await this.espacioRepository.findAllDisponibles(
          entradaData.parqueaderoId
        );
        
        if (espaciosDisponibles && espaciosDisponibles.length > 0) {
          espacioAsignado = espaciosDisponibles[0].id;
        }
        // Si no hay espacios disponibles, continuar sin asignar (id_espacio será null)
      }

      // Ocupar el espacio si se encontró uno
      if (espacioAsignado) {
        await this.espacioRepository.ocuparEspacio(espacioAsignado);
        console.log('✅ Espacio asignado y ocupado:', espacioAsignado);
      } else {
        console.log('⚠️ No se asignó espacio (continuando sin espacio)');
      }

      // Registrar entrada
      const nuevaEntrada = await this.entradaRepository.create({
        ...entradaData,
        espacioAsignado: espacioAsignado,
        fechaHoraEntrada: new Date()
      });
      console.log('✅ Entrada registrada en BD');

      // Reducir capacidad disponible
      await this.parqueaderoRepository.update(entradaData.parqueaderoId, {
        capacidadDisponible: parqueadero.capacidadDisponible - 1
      });
      console.log('✅ Capacidad actualizada');

      return {
        success: true,
        entrada: nuevaEntrada
      };
    } catch (error) {
      console.error('❌ Error en registrarEntrada:', error.message);
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