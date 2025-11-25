import { ReporteUseCase } from '../application/ReporteUseCase.js';
import { ReporteConPersistenciaUseCase } from '../application/ReporteConPersistenciaUseCase.js';
import { EntradaRepository } from '../persistence/EntradaRepository.js';
import { SalidaRepository } from '../persistence/SalidaRepository.js';
import { VehiculoRepository } from '../persistence/VehiculoRepository.js';
import { UsuarioRepository } from '../persistence/UsuarioRepository.js';

const entradaRepository = new EntradaRepository();
const salidaRepository = new SalidaRepository();
const vehiculoRepository = new VehiculoRepository();
const usuarioRepository = new UsuarioRepository();

const reporteUseCase = new ReporteUseCase(
  entradaRepository,
  salidaRepository,
  vehiculoRepository,
  usuarioRepository
);

const reporteConPersistenciaUseCase = new ReporteConPersistenciaUseCase(salidaRepository);

export class ReporteController {
  async generarPorFecha(req, res) {
    try {
      const { fechaInicio, fechaFin, parqueaderoId } = req.query;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          error: 'Fecha de inicio y fin son requeridas'
        });
      }

      const result = await reporteUseCase.generarReportePorFecha(
        new Date(fechaInicio),
        new Date(fechaFin),
        parqueaderoId ? parseInt(parqueaderoId) : null
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async generarPorTipoVehiculo(req, res) {
    try {
      const { tipoVehiculo, fechaInicio, fechaFin, parqueaderoId } = req.query;

      if (!tipoVehiculo || !fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de vehículo, fecha de inicio y fin son requeridos'
        });
      }

      const result = await reporteUseCase.generarReportePorTipoVehiculo(
        tipoVehiculo,
        new Date(fechaInicio),
        new Date(fechaFin),
        parqueaderoId ? parseInt(parqueaderoId) : null
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async generarPorControlador(req, res) {
    try {
      const { controladorId, fechaInicio, fechaFin } = req.query;

      if (!controladorId || !fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          error: 'ID del controlador, fecha de inicio y fin son requeridos'
        });
      }

      const result = await reporteUseCase.generarReportePorControlador(
        parseInt(controladorId),
        new Date(fechaInicio),
        new Date(fechaFin)
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerIngresosDiarios(req, res) {
    try {
      const { parqueaderoId } = req.query;
      
      // Obtener fecha de hoy (inicio y fin del día)
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const finDia = new Date(hoy);
      finDia.setHours(23, 59, 59, 999);

      const result = await reporteUseCase.generarReportePorFecha(
        hoy,
        finDia,
        parqueaderoId ? parseInt(parqueaderoId) : null
      );

      // Calcular total de ingresos del día
      const ingresosDiarios = result.registros?.reduce((total, registro) => {
        return total + (parseFloat(registro.monto_total) || 0);
      }, 0) || 0;

      res.json({
        success: true,
        ingresosDiarios: Math.round(ingresosDiarios),
        fecha: hoy.toISOString().split('T')[0],
        totalRegistros: result.registros?.length || 0
      });
    } catch (error) {
      console.error('[ERROR] Error obteniendo ingresos diarios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        ingresosDiarios: 0
      });
    }
  }

  async obtenerEstadisticasDashboard(req, res) {
    try {
      const { parqueaderoId } = req.query;
      
      console.log('[DEBUG] Obteniendo estadísticas dashboard para parqueadero:', parqueaderoId);
      
      // Obtener todas las salidas registradas (registros con fecha_salida)
      const salidas = await salidaRepository.findAll();
      console.log('[DEBUG] Total salidas encontradas:', salidas.length);
      
      // Filtrar por parqueadero si se especifica
      let salidasFiltradas = salidas;
      if (parqueaderoId) {
        salidasFiltradas = salidas.filter(s => {
          // El parqueadero está en espacio.parqueadero.id
          const parqueaderoIdSalida = s.espacio?.parqueadero?.id || s.espacio?.id_parqueadero;
          return parqueaderoIdSalida === parseInt(parqueaderoId);
        });
        console.log('[DEBUG] Salidas filtradas por parqueadero:', salidasFiltradas.length);
      }
      
      // Calcular tiempo promedio de estadía
      let tiempoPromedioHoras = 0;
      if (salidasFiltradas.length > 0) {
        const tiemposTotales = salidasFiltradas.map(salida => {
          const entrada = new Date(salida.fecha_ingreso);
          const salidaDate = new Date(salida.fecha_salida);
          const diferenciaMs = salidaDate - entrada;
          const horas = diferenciaMs / (1000 * 60 * 60);
          return horas;
        });
        
        const sumaHoras = tiemposTotales.reduce((acc, h) => acc + h, 0);
        tiempoPromedioHoras = sumaHoras / tiemposTotales.length;
        
        console.log('[DEBUG] Tiempos calculados:', tiemposTotales);
        console.log('[DEBUG] Tiempo promedio (horas):', tiempoPromedioHoras);
      }
      
      res.json({
        success: true,
        tiempoPromedioEstadia: Math.round(tiempoPromedioHoras * 10) / 10, // Redondear a 1 decimal
        totalSalidas: salidasFiltradas.length
      });
    } catch (error) {
      console.error('[ERROR] Error obteniendo estadísticas dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        tiempoPromedioEstadia: 0
      });
    }
  }

  // ========== NUEVOS MÉTODOS CON PERSISTENCIA ==========

  async generarYGuardarReporte(req, res) {
    try {
      const filtros = req.body;

      if (!filtros.fechaInicio || !filtros.fechaFin) {
        return res.status(400).json({
          success: false,
          error: 'Fecha de inicio y fin son requeridas'
        });
      }

      const result = await reporteConPersistenciaUseCase.generarYGuardarReporte(filtros);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('[ERROR] Error generando y guardando reporte:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerReportesGuardados(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const result = await reporteConPersistenciaUseCase.obtenerReportesGuardados(
        parseInt(limit),
        parseInt(offset)
      );
      
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Error obteniendo reportes guardados:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerReportePorId(req, res) {
    try {
      const { id } = req.params;
      
      const result = await reporteConPersistenciaUseCase.obtenerReportePorId(parseInt(id));
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('[ERROR] Error obteniendo reporte por ID:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerReportesRecientes(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const result = await reporteConPersistenciaUseCase.obtenerReportesRecientes(parseInt(limit));
      
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Error obteniendo reportes recientes:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async obtenerReportesPorParqueadero(req, res) {
    try {
      const { parqueaderoId } = req.params;
      const { limit = 20 } = req.query;
      
      const result = await reporteConPersistenciaUseCase.obtenerReportesPorParqueadero(
        parseInt(parqueaderoId),
        parseInt(limit)
      );
      
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Error obteniendo reportes por parqueadero:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async actualizarEstadoReporte(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      if (!estado) {
        return res.status(400).json({
          success: false,
          error: 'Estado es requerido'
        });
      }
      
      const result = await reporteConPersistenciaUseCase.actualizarEstadoReporte(
        parseInt(id),
        estado
      );
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('[ERROR] Error actualizando estado de reporte:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async eliminarReporte(req, res) {
    try {
      const { id } = req.params;
      
      const result = await reporteConPersistenciaUseCase.eliminarReporte(parseInt(id));
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('[ERROR] Error eliminando reporte:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}