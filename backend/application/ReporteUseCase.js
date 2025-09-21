export class ReporteUseCase {
  constructor(entradaRepository, salidaRepository, vehiculoRepository, usuarioRepository) {
    this.entradaRepository = entradaRepository;
    this.salidaRepository = salidaRepository;
    this.vehiculoRepository = vehiculoRepository;
    this.usuarioRepository = usuarioRepository;
  }

  async generarReportePorFecha(fechaInicio, fechaFin, parqueaderoId) {
    try {
      const entradas = await this.entradaRepository.findByDateRange(
        fechaInicio, 
        fechaFin, 
        parqueaderoId
      );

      const salidas = await this.salidaRepository.findByDateRange(
        fechaInicio, 
        fechaFin, 
        parqueaderoId
      );

      const totalIngresos = salidas.reduce((sum, salida) => sum + salida.montoTotal, 0);

      return {
        success: true,
        reporte: {
          periodo: { fechaInicio, fechaFin },
          totalEntradas: entradas.length,
          totalSalidas: salidas.length,
          totalIngresos,
          vehiculosActivos: entradas.length - salidas.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generarReportePorTipoVehiculo(tipoVehiculo, fechaInicio, fechaFin, parqueaderoId) {
    try {
      const salidas = await this.salidaRepository.findByVehicleTypeAndDateRange(
        tipoVehiculo,
        fechaInicio,
        fechaFin,
        parqueaderoId
      );

      const totalIngresos = salidas.reduce((sum, salida) => sum + salida.montoTotal, 0);
      const tiempoPromedio = salidas.length > 0 
        ? salidas.reduce((sum, salida) => sum + salida.tiempoTotal, 0) / salidas.length 
        : 0;

      return {
        success: true,
        reporte: {
          tipoVehiculo,
          periodo: { fechaInicio, fechaFin },
          totalSalidas: salidas.length,
          totalIngresos,
          tiempoPromedioMinutos: Math.round(tiempoPromedio)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generarReportePorControlador(controladorId, fechaInicio, fechaFin) {
    try {
      const controlador = await this.usuarioRepository.findById(controladorId);
      if (!controlador) {
        throw new Error('Controlador no encontrado');
      }

      const entradas = await this.entradaRepository.findByControllerAndDateRange(
        controladorId,
        fechaInicio,
        fechaFin
      );

      const salidas = await this.salidaRepository.findByControllerAndDateRange(
        controladorId,
        fechaInicio,
        fechaFin
      );

      return {
        success: true,
        reporte: {
          controlador: {
            id: controlador.id,
            nombre: controlador.nombre
          },
          periodo: { fechaInicio, fechaFin },
          entradasRegistradas: entradas.length,
          salidasRegistradas: salidas.length
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