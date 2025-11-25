import { ReporteUseCase } from '../application/ReporteUseCase.js';
import { EntradaRepository } from '../persistence/EntradaRepository.js';
import { SalidaRepository } from '../persistence/SalidaRepository.js';
import { VehiculoRepository } from '../persistence/VehiculoRepository.js';
import { UsuarioRepository } from '../persistence/UsuarioRepository.js';
import { ReportesRepository } from '../persistence/ReportesRepository.js';

const entradaRepository = new EntradaRepository();
const salidaRepository = new SalidaRepository();
const vehiculoRepository = new VehiculoRepository();
const usuarioRepository = new UsuarioRepository();
const reportesRepository = new ReportesRepository();

const reporteUseCase = new ReporteUseCase(
  entradaRepository,
  salidaRepository,
  vehiculoRepository,
  usuarioRepository
);

export class ReporteController {

  async crear(req, res) {
    try {
      console.log("HOLSA DJSKJDKLA");
      console.log("Body recibido en crear:", req.body);
      console.log("CHAO PSD");
      const nuevoReporte = await Reporte.create(req.body);
      res.json({ success: true, reporte: nuevoReporte });
    } catch (error) {
      console.error('Error creando reporte:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }

  }

  async obtenerTodos(req, res) {
    try {
      const reportes = await reportesRepository.findAll();
      console.log("Reportes encontrados:", reportes); // <-- debug
      res.json({
        success: true,
        reportes
      });
    } catch (error) {
      console.error('Error en obtenerTodos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

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
}