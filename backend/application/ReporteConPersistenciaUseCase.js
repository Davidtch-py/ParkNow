import { ReportesRepository } from '../persistence/ReportesRepository.js';

export class ReporteConPersistenciaUseCase {
  constructor(salidaRepository) {
    this.salidaRepository = salidaRepository;
    this.reportesRepository = new ReportesRepository();
  }

  /**
   * Generar y guardar un reporte por rango de fechas
   */
  async generarYGuardarReporte(filtros) {
    try {
      const {
        fechaInicio,
        fechaFin,
        parqueaderoId,
        parqueaderoNombre,
        tipoVehiculo,
        controlador,
        tipoReporte
      } = filtros;

      // Obtener salidas del repositorio
      const salidas = await this.salidaRepository.findAll();

      // Filtrar salidas por rango de fechas
      let salidasFiltradas = salidas.filter(salida => {
        const fechaSalida = new Date(salida.fecha_salida);
        return fechaSalida >= new Date(fechaInicio) && fechaSalida <= new Date(fechaFin);
      });

      // Filtrar por parqueadero si se especifica
      if (parqueaderoId) {
        salidasFiltradas = salidasFiltradas.filter(salida => {
          const parqueaderoIdSalida = salida.espacio?.parqueadero?.id || salida.espacio?.id_parqueadero;
          return parqueaderoIdSalida === parseInt(parqueaderoId);
        });
      }

      // Filtrar por tipo de vehículo si se especifica
      if (tipoVehiculo) {
        salidasFiltradas = salidasFiltradas.filter(salida => {
          const tipo = salida.vehiculo?.tipo_vehiculo?.toLowerCase();
          return tipo === tipoVehiculo.toLowerCase();
        });
      }

      // Calcular métricas
      const totalVehiculos = salidasFiltradas.length;
      const totalIngresos = salidasFiltradas.reduce((sum, salida) => {
        return sum + (parseFloat(salida.monto_total) || 0);
      }, 0);

      // Calcular tiempo promedio de estadía
      let tiempoPromedioEstadia = 0;
      if (salidasFiltradas.length > 0) {
        const tiemposTotales = salidasFiltradas.map(salida => {
          const entrada = new Date(salida.fecha_ingreso);
          const salidaDate = new Date(salida.fecha_salida);
          const diferenciaMs = salidaDate.getTime() - entrada.getTime();
          const horas = diferenciaMs / (1000 * 60 * 60);
          return horas;
        });
        const sumaHoras = tiemposTotales.reduce((acc, h) => acc + h, 0);
        tiempoPromedioEstadia = sumaHoras / tiemposTotales.length;
      }

      // Contar vehículos por tipo
      const vehiculosPorTipo = {
        carros: 0,
        motos: 0,
        bicicletas: 0
      };

      salidasFiltradas.forEach(salida => {
        const tipo = salida.vehiculo?.tipo_vehiculo?.toLowerCase();
        if (tipo === 'carro') vehiculosPorTipo.carros++;
        else if (tipo === 'moto') vehiculosPorTipo.motos++;
        else if (tipo === 'bicicleta') vehiculosPorTipo.bicicletas++;
      });

      // Crear título del reporte
      const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      };

      const tipo = tipoReporte === 'todos' ? 'personalizado' : tipoReporte;
      const titulo = `Reporte ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} - ${formatDate(fechaInicio)} a ${formatDate(fechaFin)}`;

      // Crear objeto de reporte
      const reporteData = {
        tipo: tipo,
        titulo,
        fechaInicio,
        fechaFin,
        parqueaderoId: parqueaderoId || null,
        parqueaderoNombre: parqueaderoNombre || 'Todos los parqueaderos',
        controlador: controlador || null,
        totalVehiculos,
        totalIngresos: Math.round(totalIngresos),
        tiempoPromedioEstadia: Math.round(tiempoPromedioEstadia * 10) / 10,
        vehiculosPorTipo,
        fechaGeneracion: new Date(),
        estado: 'generado'
      };

      // Guardar el reporte en la base de datos
      const reporteGuardado = await this.reportesRepository.create(reporteData);

      return {
        success: true,
        reporte: reporteGuardado
      };
    } catch (error) {
      console.error('[ReporteConPersistenciaUseCase.generarYGuardarReporte] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener todos los reportes guardados
   */
  async obtenerReportesGuardados(limit = 50, offset = 0) {
    try {
      const reportes = await this.reportesRepository.findAll(limit, offset);
      const total = await this.reportesRepository.count();

      return {
        success: true,
        reportes,
        total,
        limit,
        offset
      };
    } catch (error) {
      console.error('[ReporteConPersistenciaUseCase.obtenerReportesGuardados] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener un reporte por ID
   */
  async obtenerReportePorId(id) {
    try {
      const reporte = await this.reportesRepository.findById(id);

      if (!reporte) {
        return {
          success: false,
          error: 'Reporte no encontrado'
        };
      }

      return {
        success: true,
        reporte
      };
    } catch (error) {
      console.error('[ReporteConPersistenciaUseCase.obtenerReportePorId] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener reportes recientes (últimos 30 días)
   */
  async obtenerReportesRecientes(limit = 10) {
    try {
      const reportes = await this.reportesRepository.findRecent(limit);

      return {
        success: true,
        reportes
      };
    } catch (error) {
      console.error('[ReporteConPersistenciaUseCase.obtenerReportesRecientes] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener reportes por parqueadero
   */
  async obtenerReportesPorParqueadero(parqueaderoId, limit = 20) {
    try {
      const reportes = await this.reportesRepository.findByParqueadero(parqueaderoId, limit);

      return {
        success: true,
        reportes
      };
    } catch (error) {
      console.error('[ReporteConPersistenciaUseCase.obtenerReportesPorParqueadero] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Actualizar estado de un reporte
   */
  async actualizarEstadoReporte(id, nuevoEstado) {
    try {
      const reporte = await this.reportesRepository.updateEstado(id, nuevoEstado);

      return {
        success: true,
        reporte
      };
    } catch (error) {
      console.error('[ReporteConPersistenciaUseCase.actualizarEstadoReporte] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Eliminar un reporte
   */
  async eliminarReporte(id) {
    try {
      await this.reportesRepository.delete(id);

      return {
        success: true,
        message: 'Reporte eliminado correctamente'
      };
    } catch (error) {
      console.error('[ReporteConPersistenciaUseCase.eliminarReporte] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
