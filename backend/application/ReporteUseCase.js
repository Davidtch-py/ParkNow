import { ReportesRepository } from '../persistence/ReportesRepository.js';

export class ReporteUseCase {
  constructor(entradaRepository, salidaRepository, vehiculoRepository, usuarioRepository) {
    this.entradaRepository = entradaRepository;
    this.salidaRepository = salidaRepository;
    this.vehiculoRepository = vehiculoRepository;
    this.usuarioRepository = usuarioRepository;
    this.reportesRepository = new ReportesRepository();
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

      // Calcular vehículos por tipo
      const vehiculosPorTipo = { carros: 0, motos: 0, bicicletas: 0 };
      salidas.forEach(salida => {
        const tipo = salida.vehiculo?.tipo?.toLowerCase();
        if (tipo === 'carro' || tipo === 'auto') {
          vehiculosPorTipo.carros++;
        } else if (tipo === 'moto' || tipo === 'motocicleta') {
          vehiculosPorTipo.motos++;
        } else if (tipo === 'bicicleta') {
          vehiculosPorTipo.bicicletas++;
        }
      });

      // Calcular tiempo promedio de estadía
      let tiempoTotal = 0;
      salidas.forEach(salida => {
        if (salida.fechaIngreso && salida.fechaSalida) {
          const entrada = new Date(salida.fechaIngreso);
          const salidaFecha = new Date(salida.fechaSalida);
          const horas = (salidaFecha - entrada) / (1000 * 60 * 60);
          tiempoTotal += horas;
        }
      });
      const tiempoPromedioEstadia = salidas.length > 0
        ? parseFloat((tiempoTotal / salidas.length).toFixed(1))
        : 0;

      // Crear objeto de reporte
      const reporteData = {
        tipo: 'personalizado',
        titulo: `Reporte ${fechaInicio.toISOString().split('T')[0]} a ${fechaFin.toISOString().split('T')[0]}`,
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0],
        parqueaderoId: parqueaderoId || null,
        parqueaderoNombre: parqueaderoId ? 'Parqueadero específico' : 'Todos los parqueaderos',
        totalVehiculos: salidas.length,
        totalIngresos,
        tiempoPromedioEstadia,
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
      console.error('Error en generarReportePorFecha:', error);
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

      // Crear vehículos por tipo basado en el tipo solicitado
      const vehiculosPorTipo = { carros: 0, motos: 0, bicicletas: 0 };
      if (tipoVehiculo === 'carro') vehiculosPorTipo.carros = salidas.length;
      else if (tipoVehiculo === 'moto') vehiculosPorTipo.motos = salidas.length;
      else if (tipoVehiculo === 'bicicleta') vehiculosPorTipo.bicicletas = salidas.length;

      // Crear objeto de reporte
      const reporteData = {
        tipo: 'personalizado',
        titulo: `Reporte de ${tipoVehiculo}s - ${fechaInicio.toISOString().split('T')[0]} a ${fechaFin.toISOString().split('T')[0]}`,
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0],
        parqueaderoId: parqueaderoId || null,
        parqueaderoNombre: parqueaderoId ? 'Parqueadero específico' : 'Todos los parqueaderos',
        totalVehiculos: salidas.length,
        totalIngresos,
        tiempoPromedioEstadia: Math.round(tiempoPromedio / 60), // Convertir minutos a horas
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
      console.error('Error en generarReportePorTipoVehiculo:', error);
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

      const totalIngresos = salidas.reduce((sum, salida) => sum + salida.montoTotal, 0);

      // Crear objeto de reporte
      const reporteData = {
        tipo: 'personalizado',
        titulo: `Reporte de ${controlador.nombre} - ${fechaInicio.toISOString().split('T')[0]} a ${fechaFin.toISOString().split('T')[0]}`,
        fechaInicio: fechaInicio.toISOString().split('T')[0],
        fechaFin: fechaFin.toISOString().split('T')[0],
        controlador: controlador.nombre,
        totalVehiculos: salidas.length,
        totalIngresos,
        tiempoPromedioEstadia: 0,
        vehiculosPorTipo: { carros: 0, motos: 0, bicicletas: 0 },
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
      console.error('Error en generarReportePorControlador:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}