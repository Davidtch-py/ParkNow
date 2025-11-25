import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  FileText,
  Calendar,
  Car,
  Search,
  DollarSign,
  Clock,
  User,
  MapPin,
  Eye,
  Printer,
  X
} from 'lucide-react';
import { reporteService, parqueaderoService } from '../services/index';
import { toast } from 'react-toastify';

interface Reporte {
  id: number;
  tipo: 'diario' | 'semanal' | 'mensual' | 'personalizado';
  titulo: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  parqueaderoId?: number;
  parqueaderoNombre?: string;
  controlador?: string;
  totalVehiculos: number;
  totalIngresos: number;
  tiempoPromedioEstadia: number;
  vehiculosPorTipo: {
    carros: number;
    motos: number;
    bicicletas: number;
  };
  fechaGeneracion: string;
  estado: 'generado' | 'enviado' | 'descargado';
}

interface FiltrosReporte {
  fechaInicio: string;
  fechaFin: string;
  parqueaderoId: string;
  controlador: string;
  tipoVehiculo: string;
  tipoReporte: string;
}

const ReportesListView = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [reportesFiltrados, setReportesFiltrados] = useState<Reporte[]>([]);
  const [parqueaderos, setParqueaderos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [generandoReporte, setGenerandoReporte] = useState(false);

  // const { user } = useAuth();

  const [filtros, setFiltros] = useState<FiltrosReporte>({
    fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // hace 30 días
    fechaFin: new Date().toISOString().split('T')[0], // hoy
    parqueaderoId: '',
    controlador: '',
    tipoVehiculo: '',
    tipoReporte: 'todos'
  });

  const [busqueda, setBusqueda] = useState('');

  const aplicarFiltros = useCallback(() => {
    let resultado = reportes;
    if (busqueda) {
      resultado = resultado.filter(r =>
        r.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    setReportesFiltrados(resultado);
  }, [reportes, busqueda]);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar parqueaderos
      const parqueaderosResult = await parqueaderoService.getAll();
      if (parqueaderosResult.success) {
        setParqueaderos(parqueaderosResult.parqueaderos);
      }

      // Cargar reportes reales desde el backend
      const reportesResult = await reporteService.getAll();
      if (reportesResult.success) {
        setReportes(reportesResult.reportes);
      } else {
        toast.error('No se pudieron cargar los reportes');
      }

    } catch (error) {
      toast.error('Error cargando reportes');
    } finally {
      setLoading(false);
    }
  };

  const generarNuevoReporte = async () => {
    try {
      setGenerandoReporte(true);

      const nuevoReporte = {
        tipo: filtros.tipoReporte || 'personalizado',
        titulo: `Reporte ${filtros.tipoReporte || 'personalizado'} - ${filtros.fechaInicio} a ${filtros.fechaFin}`,
        descripcion: 'Generado desde la interfaz',
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin,
        parqueaderoId: filtros.parqueaderoId ? parseInt(filtros.parqueaderoId) : null,
        controlador: filtros.controlador || null,
        totalVehiculos: 0,
        totalIngresos: 0,
        tiempoPromedioEstadia: 0,
        vehiculosPorTipo: { carros: 0, motos: 0, bicicletas: 0 },
        estado: 'generado'
      };
      console.log("Nuevo reporte a enviar:", nuevoReporte);

      const result = await reporteService.crear(nuevoReporte);

      if (result.success) {
        toast.success('Reporte generado exitosamente');
        cargarDatos(); // Recargar lista de reportes
      } else {
        toast.error('Error al generar reporte');
      }

    } catch (error) {
      toast.error('Error de conexión al generar reporte');
    } finally {
      setGenerandoReporte(false);
    }
  };

  const descargarReporte = async (reporte: Reporte) => {
    try {
      // Crear una ventana temporal para generar el PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Por favor permite ventanas emergentes para descargar');
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Reporte - ${reporte.titulo}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
              .logo { font-size: 28px; font-weight: bold; color: #98cae5; margin-bottom: 10px; }
              .title { font-size: 24px; margin: 10px 0; color: #1f2937; }
              .meta { color: #6b7280; font-size: 14px; }
              .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
              .card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; }
              .card-title { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
              .card-value { font-size: 28px; font-weight: bold; color: #111827; margin-top: 8px; }
              .section-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #374151; border-left: 4px solid #98cae5; padding-left: 12px; }
              .table-container { margin-bottom: 40px; }
              .table { width: 100%; border-collapse: collapse; }
              .table th { text-align: left; padding: 12px; background-color: #f3f4f6; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
              .table td { padding: 12px; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
              .table tr:last-child td { border-bottom: none; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
              .info-item { margin-bottom: 10px; }
              .info-label { font-weight: 600; color: #374151; display: inline-block; width: 120px; }
              .info-value { color: #4b5563; }
              .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #eee; padding-top: 20px; }
              @media print {
                body { -webkit-print-color-adjust: exact; padding: 0; }
                .card { background-color: #f9fafb !important; border: 1px solid #e5e7eb !important; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">ParkNow</div>
              <h1 class="title">${reporte.titulo}</h1>
              <div class="meta">
                Generado el ${formatDate(reporte.fechaGeneracion)}
              </div>
            </div>

            <div class="info-grid">
              <div>
                <div class="info-item">
                  <span class="info-label">Periodo:</span>
                  <span class="info-value">${formatDate(reporte.fechaInicio)} - ${formatDate(reporte.fechaFin)}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Tipo:</span>
                  <span class="info-value" style="text-transform: capitalize">${reporte.tipo}</span>
                </div>
              </div>
              <div>
                <div class="info-item">
                  <span class="info-label">Parqueadero:</span>
                  <span class="info-value">${reporte.parqueaderoNombre || 'Todos'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Controlador:</span>
                  <span class="info-value">${reporte.controlador || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div class="section-title">Resumen General</div>
            <div class="grid">
              <div class="card">
                <div class="card-title">Total Vehículos</div>
                <div class="card-value">${reporte.totalVehiculos.toLocaleString()}</div>
              </div>
              <div class="card">
                <div class="card-title">Total Ingresos</div>
                <div class="card-value">${formatCurrency(reporte.totalIngresos)}</div>
              </div>
              <div class="card">
                <div class="card-title">Tiempo Promedio</div>
                <div class="card-value">${reporte.tiempoPromedioEstadia}h</div>
              </div>
            </div>

            <div class="section-title">Detalle por Vehículo</div>
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Tipo de Vehículo</th>
                    <th>Cantidad</th>
                    <th>Porcentaje</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Carros</td>
                    <td>${reporte.vehiculosPorTipo.carros}</td>
                    <td>${reporte.totalVehiculos > 0 ? Math.round((reporte.vehiculosPorTipo.carros / reporte.totalVehiculos) * 100) : 0}%</td>
                  </tr>
                  <tr>
                    <td>Motos</td>
                    <td>${reporte.vehiculosPorTipo.motos}</td>
                    <td>${reporte.totalVehiculos > 0 ? Math.round((reporte.vehiculosPorTipo.motos / reporte.totalVehiculos) * 100) : 0}%</td>
                  </tr>
                  <tr>
                    <td>Bicicletas</td>
                    <td>${reporte.vehiculosPorTipo.bicicletas}</td>
                    <td>${reporte.totalVehiculos > 0 ? Math.round((reporte.vehiculosPorTipo.bicicletas / reporte.totalVehiculos) * 100) : 0}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="footer">
              <p>Este documento es un reporte generado automáticamente por el sistema de gestión ParkNow.</p>
              <p>Fecha de generación: ${new Date().toLocaleString('es-CO')}</p>
            </div>

            <script>
              window.onload = function() {
                // Esperar a que el contenido se cargue completamente
                setTimeout(function() {
                  // Abrir el diálogo de impresión con opción de guardar como PDF
                  window.print();
                  
                  // Cerrar la ventana después de que el usuario termine con el diálogo
                  setTimeout(function() {
                    window.close();
                  }, 100);
                }, 500);
              }
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Actualizar estado del reporte
      const reportesActualizados = reportes.map(r =>
        r.id === reporte.id ? { ...r, estado: 'descargado' as const } : r
      );
      setReportes(reportesActualizados);
    } catch (error) {
      console.error('Error descargando reporte:', error);
      toast.error('Error al descargar reporte');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'generado':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'enviado':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'descargado':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'diario':
        return 'bg-orange-100 text-orange-800';
      case 'semanal':
        return 'bg-purple-100 text-purple-800';
      case 'mensual':
        return 'bg-blue-100 text-blue-800';
      case 'personalizado':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes del Sistema</h1>
        <p className="text-gray-600">Genera y consulta reportes de ocupación, ingresos y estadísticas</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Panel de filtros */}
        <div className="xl:col-span-4">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Generar Nuevo Reporte</h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Reportes
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Buscar por título, parqueadero..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
              </div>

              {/* Rango de fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filtros.fechaInicio}
                    onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filtros.fechaFin}
                    onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                  />
                </div>
              </div>

              {/* Tipo de reporte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Reporte
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filtros.tipoReporte}
                  onChange={(e) => setFiltros({ ...filtros, tipoReporte: e.target.value })}
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="diario">Diario</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>

              {/* Parqueadero */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parqueadero
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filtros.parqueaderoId}
                  onChange={(e) => setFiltros({ ...filtros, parqueaderoId: e.target.value })}
                >
                  <option value="">Todos los parqueaderos</option>
                  {parqueaderos.map((parqueadero) => (
                    <option key={parqueadero.id} value={parqueadero.id}>
                      {parqueadero.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de vehículo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Vehículo
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filtros.tipoVehiculo}
                  onChange={(e) => setFiltros({ ...filtros, tipoVehiculo: e.target.value })}
                >
                  <option value="">Todos los tipos</option>
                  <option value="carro">Carros</option>
                  <option value="moto">Motos</option>
                  <option value="bicicleta">Bicicletas</option>
                </select>
              </div>

              {/* Botón generar */}
              <button
                onClick={generarNuevoReporte}
                disabled={generandoReporte}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-black font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" style={{ backgroundColor: "var(--park-blue)" }}
              >
                {generandoReporte ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Generar Reporte
              </button>
            </div>
          </div>
        </div>

        {/* Lista de reportes */}
        <div className="xl:col-span-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Reportes Generados ({reportesFiltrados.length})
                </h3>
                <span className="text-sm text-gray-500">
                  Mostrando {reportesFiltrados.length} de {reportes.length} reportes
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Cargando reportes...</p>
                </div>
              ) : reportesFiltrados.length > 0 ? (
                reportesFiltrados.map((reporte) => (
                  <div key={reporte.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{reporte.titulo}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoColor(reporte.tipo)}`}>
                            {reporte.tipo}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEstadoColor(reporte.estado)}`}>
                            {reporte.estado}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Período</div>
                              <div className="text-sm font-medium">
                                {formatDate(reporte.fechaInicio)} - {formatDate(reporte.fechaFin)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Car className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Vehículos</div>
                              <div className="text-sm font-medium">{reporte.totalVehiculos.toLocaleString()}</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Ingresos</div>
                              <div className="text-sm font-medium">{formatCurrency(reporte.totalIngresos)}</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Tiempo Prom.</div>
                              <div className="text-sm font-medium">{reporte.tiempoPromedioEstadia}h</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {reporte.parqueaderoNombre && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{reporte.parqueaderoNombre}</span>
                            </div>
                          )}
                          {reporte.controlador && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{reporte.controlador}</span>
                            </div>
                          )}
                          <div>
                            Generado: {formatDate(reporte.fechaGeneracion)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setReporteSeleccionado(reporte);
                            setMostrarDetalle(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => descargarReporte(reporte)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes</h3>
                  <p className="text-gray-500">No se encontraron reportes con los filtros aplicados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalle del reporte */}
      {mostrarDetalle && reporteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Detalle del Reporte
              </h3>
              <button
                onClick={() => setMostrarDetalle(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Contenido del reporte detallado */}
            <div className="space-y-6">
              {/* Header del reporte */}
              <div className="border-b border-gray-200 pb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {reporteSeleccionado.titulo}
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Período:</span>
                    <div className="font-medium">
                      {formatDate(reporteSeleccionado.fechaInicio)} - {formatDate(reporteSeleccionado.fechaFin)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Parqueadero:</span>
                    <div className="font-medium">{reporteSeleccionado.parqueaderoNombre}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Controlador:</span>
                    <div className="font-medium">{reporteSeleccionado.controlador || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Generado:</span>
                    <div className="font-medium">{formatDate(reporteSeleccionado.fechaGeneracion)}</div>
                  </div>
                </div>
              </div>

              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Vehículos</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {reporteSeleccionado.totalVehiculos.toLocaleString()}
                      </p>
                    </div>
                    <Car className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Total Ingresos</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(reporteSeleccionado.totalIngresos)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Tiempo Promedio</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {reporteSeleccionado.tiempoPromedioEstadia}h
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Distribución por tipo de vehículo */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="text-lg font-medium text-gray-900 mb-4">
                  Distribución por Tipo de Vehículo
                </h5>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {reporteSeleccionado.vehiculosPorTipo.carros}
                    </div>
                    <div className="text-sm text-gray-600">Carros</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {reporteSeleccionado.vehiculosPorTipo.motos}
                    </div>
                    <div className="text-sm text-gray-600">Motos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {reporteSeleccionado.vehiculosPorTipo.bicicletas}
                    </div>
                    <div className="text-sm text-gray-600">Bicicletas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesListView;