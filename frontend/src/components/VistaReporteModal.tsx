import React from 'react';
import { X, Printer } from 'lucide-react';

interface ReporteData {
  id?: number;
  tipo: 'diario' | 'semanal' | 'mensual' | 'personalizado';
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
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
}

interface VistaReporteModalProps {
  reporte: ReporteData | null;
  onClose: () => void;
  onImprimir: () => void;
}

const VistaReporteModal: React.FC<VistaReporteModalProps> = ({ reporte, onClose, onImprimir }) => {
  if (!reporte) return null;

  // Convertir valores que pueden venir como string desde la BD
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  const formatCurrency = (value: number | string) => {
    const numValue = toNumber(value);
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numValue);
  };

  const calcularPorcentaje = (parte: number, total: number): string => {
    if (total === 0) return '0.0';
    return ((parte / total) * 100).toFixed(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-xl font-bold text-white">Vista Previa del Reporte</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onImprimir}
              className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center space-x-2"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Contenido del Reporte */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
            {/* Header del Reporte */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg mb-6">
              <div className="text-3xl font-bold mb-2">🅿️ ParkNow</div>
              <h1 className="text-2xl font-bold mb-1">{reporte.titulo}</h1>
              <p className="text-sm opacity-90">Sistema de Gestión de Parqueaderos</p>
            </div>

            {/* Información General */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">📋</span>
                Información del Reporte
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Tipo de Reporte:</span>
                  <span className="text-gray-900">{reporte.tipo.toUpperCase()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Período:</span>
                  <span className="text-gray-900">
                    {formatDate(reporte.fechaInicio)} - {formatDate(reporte.fechaFin)}
                  </span>
                </div>
                {reporte.parqueaderoNombre && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-semibold text-gray-700">Parqueadero:</span>
                    <span className="text-gray-900">{reporte.parqueaderoNombre}</span>
                  </div>
                )}
                {reporte.controlador && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="font-semibold text-gray-700">Controlador:</span>
                    <span className="text-gray-900">{reporte.controlador}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-gray-700">Fecha de Generación:</span>
                  <span className="text-gray-900">{formatDateTime(reporte.fechaGeneracion)}</span>
                </div>
              </div>
            </div>

            {/* Métricas Principales */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Métricas Principales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
                  <div className="text-sm text-blue-600 font-medium mb-1">Total Vehículos</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {reporte.totalVehiculos.toLocaleString()}
                  </div>
                </div>
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                  <div className="text-sm text-green-600 font-medium mb-1">Total Ingresos</div>
                  <div className="text-3xl font-bold text-green-900">
                    {formatCurrency(reporte.totalIngresos)}
                  </div>
                </div>
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 text-center">
                  <div className="text-sm text-orange-600 font-medium mb-1">Tiempo Promedio</div>
                  <div className="text-3xl font-bold text-orange-900">
                    {toNumber(reporte.tiempoPromedioEstadia).toFixed(1)}h
                  </div>
                </div>
              </div>
            </div>

            {/* Distribución por Tipo */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">🚗</span>
                Distribución por Tipo de Vehículo
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="py-3 px-4 text-left rounded-tl-lg">Tipo de Vehículo</th>
                      <th className="py-3 px-4 text-center">Cantidad</th>
                      <th className="py-3 px-4 text-center rounded-tr-lg">Porcentaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">🚗 Carros</td>
                      <td className="py-3 px-4 text-center font-bold">
                        {reporte.vehiculosPorTipo.carros}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {calcularPorcentaje(reporte.vehiculosPorTipo.carros, reporte.totalVehiculos)}%
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="py-3 px-4">🏍️ Motos</td>
                      <td className="py-3 px-4 text-center font-bold">
                        {reporte.vehiculosPorTipo.motos}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {calcularPorcentaje(reporte.vehiculosPorTipo.motos, reporte.totalVehiculos)}%
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">🚲 Bicicletas</td>
                      <td className="py-3 px-4 text-center font-bold">
                        {reporte.vehiculosPorTipo.bicicletas}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {calcularPorcentaje(reporte.vehiculosPorTipo.bicicletas, reporte.totalVehiculos)}%
                      </td>
                    </tr>
                    <tr className="bg-gray-100 font-bold">
                      <td className="py-3 px-4 rounded-bl-lg">TOTAL</td>
                      <td className="py-3 px-4 text-center">{reporte.totalVehiculos}</td>
                      <td className="py-3 px-4 text-center rounded-br-lg">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Análisis */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Análisis
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="text-gray-700">
                  <span className="font-semibold">Ingreso Promedio por Vehículo:</span>{' '}
                  {reporte.totalVehiculos > 0 
                    ? formatCurrency(reporte.totalIngresos / reporte.totalVehiculos)
                    : formatCurrency(0)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Tipo de Vehículo Predominante:</span>{' '}
                  {reporte.vehiculosPorTipo.carros > reporte.vehiculosPorTipo.motos && 
                   reporte.vehiculosPorTipo.carros > reporte.vehiculosPorTipo.bicicletas
                    ? 'Carros'
                    : reporte.vehiculosPorTipo.motos > reporte.vehiculosPorTipo.bicicletas
                    ? 'Motos'
                    : 'Bicicletas'}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Días del Período:</span>{' '}
                  {Math.ceil((new Date(reporte.fechaFin).getTime() - new Date(reporte.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1} días
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-200 pt-4 text-center text-sm text-gray-600">
              <p className="font-semibold">ParkNow - Sistema de Gestión de Parqueaderos</p>
              <p className="mt-1">Reporte generado el {formatDateTime(reporte.fechaGeneracion)}</p>
              <p className="mt-2 text-xs">Este documento es un reporte oficial del sistema ParkNow.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaReporteModal;
