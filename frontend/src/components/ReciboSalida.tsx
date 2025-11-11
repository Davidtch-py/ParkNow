import React, { useState } from 'react';
import { CheckCircle, Printer } from 'lucide-react';

interface ReciboProps {
  recibo: {
    fechaIngreso: string;
    fechaSalida: string;
    tiempoEstacionado: string;
    detallesTarifa: string;
    costoTotal: string;
  };
  vehiculo: {
    placa: string;
    tipo: string;
    propietario?: string;
  };
  parqueadero: {
    nombre: string;
  };
  costo: number;
  onConfirmar: () => void;
  onCancelar: () => void;
  loading?: boolean;
}

export const ReciboSalida: React.FC<ReciboProps> = ({
  recibo,
  vehiculo,
  parqueadero,
  costo,
  onConfirmar,
  onCancelar,
  loading = false
}) => {
  const [imprimiendo, setImprimiendo] = useState(false);

  const handleImprimir = () => {
    setImprimiendo(true);
    window.print();
    setTimeout(() => setImprimiendo(false), 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
          <CheckCircle className="h-12 w-12 mx-auto mb-2" />
          <h2 className="text-2xl font-bold">Recibo de Salida</h2>
          <p className="text-blue-100 text-sm mt-1">Parqueadero {parqueadero.nombre}</p>
        </div>

        {/* Contenido del Recibo */}
        <div className="p-6 space-y-4">
          {/* Información del Vehículo */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Información del Vehículo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Placa:</span>
                <span className="font-medium text-gray-900">{vehiculo.placa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium text-gray-900 capitalize">{vehiculo.tipo}</span>
              </div>
              {vehiculo.propietario && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Propietario:</span>
                  <span className="font-medium text-gray-900">{vehiculo.propietario}</span>
                </div>
              )}
            </div>
          </div>

          {/* Detalles de Tiempo */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Detalles de Estacionamiento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Entrada:</span>
                <span className="font-medium text-gray-900">{recibo.fechaIngreso}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Salida:</span>
                <span className="font-medium text-gray-900">{recibo.fechaSalida}</span>
              </div>
              <div className="flex justify-between bg-blue-50 p-2 rounded">
                <span className="text-gray-600">Tiempo Total:</span>
                <span className="font-bold text-blue-600">{recibo.tiempoEstacionado}</span>
              </div>
            </div>
          </div>

          {/* Detalles de Tarifa */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="font-semibold text-gray-900 mb-3">Cálculo de Tarifa</h3>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="text-gray-700">{recibo.detallesTarifa}</p>
            </div>
          </div>

          {/* Costo Total */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Costo Total:</span>
              <span className="text-3xl font-bold text-green-600">{recibo.costoTotal}</span>
            </div>
          </div>

          {/* Mensaje de Confirmación */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-800">
              ✓ Por favor confirma el pago de <span className="font-bold">{recibo.costoTotal}</span> antes de permitir la salida del vehículo.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
          <button
            onClick={handleImprimir}
            disabled={loading || imprimiendo}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </button>
          <button
            onClick={onCancelar}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Pago
              </>
            )}
          </button>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-recibo,
          .print-recibo * {
            visibility: visible;
          }
          .print-recibo {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ReciboSalida;
