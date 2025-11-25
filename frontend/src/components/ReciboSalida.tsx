import React from 'react';
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
  const handleImprimir = () => {
    const contenidoHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recibo de Salida - ${vehiculo.placa}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 0;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 0;
            color: #1a1a1a;
          }
          
          .recibo {
            width: 100%;
            height: 100%;
            padding: 20mm;
            background: white;
          }
          
          .header {
            background: linear-gradient(135deg, #4478e9ff 0%, #1e40af 100%);
            color: white;
            padding: 30px;
            text-align: center;
            margin: -20mm -20mm 15mm -20mm;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .header h1 {
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
          
          .header p {
            font-size: 20px;
            opacity: 0.95;
            font-weight: 300;
          }
          
          .contenido {
            padding: 0 5mm;
          }
          
          .seccion {
            margin-bottom: 20px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 12px;
            border-left: 5px solid #2563eb;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          }
          
          .seccion h3 {
            font-size: 18px;
            color: #1e293b;
            margin-bottom: 15px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
          }
          
          .tabla {
            width: 100%;
            border-collapse: collapse;
          }
          
          .tabla tr {
            border-bottom: 1px solid #e2e8f0;
          }
          
          .tabla tr:last-child {
            border-bottom: none;
          }
          
          .tabla td {
            padding: 12px 0;
            font-size: 15px;
          }
          
          .tabla td:first-child {
            color: #64748b;
            font-weight: 500;
            width: 40%;
          }
          
          .tabla td:last-child {
            font-weight: 600;
            color: #0f172a;
            text-align: right;
            width: 60%;
          }
          
          .tiempo-destacado {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
            border: 2px solid #93c5fd;
          }
          
          .tiempo-destacado td:last-child {
            color: #1e40af;
            font-size: 22px;
            font-weight: 700;
          }
          
          .tarifa-detalle {
            background: white;
            padding: 20px;
            border-radius: 8px;
            font-size: 15px;
            color: #475569;
            line-height: 1.6;
            border: 1px solid #e2e8f0;
          }
          
          .costo-total {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 4px solid #86efac;
            padding: 30px;
            border-radius: 16px;
            margin: 25px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          
          .costo-total-contenido {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .costo-total-label {
            font-size: 26px;
            font-weight: 600;
            color: #166534;
          }
          
          .costo-total-valor {
            font-size: 52px;
            font-weight: 900;
            color: #16a34a;
            letter-spacing: -1px;
          }
          
          .nota {
            background: #fef3c7;
            border: 2px solid #fbbf24;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            text-align: center;
          }
          
          .nota p {
            color: #92400e;
            font-size: 14px;
            font-weight: 500;
          }
          
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #64748b;
            font-size: 13px;
          }
          
          .footer p {
            margin: 5px 0;
          }
          
          .footer .gracias {
            font-size: 16px;
            font-weight: 600;
            color: #2563eb;
            margin-bottom: 10px;
          }
          
          @media print {
            body {
              width: 210mm;
              height: 297mm;
            }
            .recibo {
              page-break-after: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="recibo">
          <div class="header">
            <h1>RECIBO DE SALIDA</h1>
            <p>${parqueadero.nombre}</p>
          </div>

          <div class="contenido">
            <div class="seccion">
              <h3>📋 Información del Vehículo</h3>
              <table class="tabla">
                <tr>
                  <td>Placa:</td>
                  <td>${vehiculo.placa}</td>
                </tr>
                <tr>
                  <td>Tipo de Vehículo:</td>
                  <td style="text-transform: capitalize;">${vehiculo.tipo}</td>
                </tr>
                ${vehiculo.propietario ? `
                <tr>
                  <td>Propietario:</td>
                  <td>${vehiculo.propietario}</td>
                </tr>
                ` : ''}
              </table>
            </div>

            <div class="seccion">
              <h3>🕐 Detalles de Estacionamiento</h3>
              <table class="tabla">
                <tr>
                  <td>Fecha y Hora de Entrada:</td>
                  <td>${recibo.fechaIngreso}</td>
                </tr>
                <tr>
                  <td>Fecha y Hora de Salida:</td>
                  <td>${recibo.fechaSalida}</td>
                </tr>
              </table>
              <table class="tabla tiempo-destacado">
                <tr>
                  <td>⏱️ –Tiempo Total Estacionado:</td>
                  <td>${recibo.tiempoEstacionado}</td>
                </tr>
              </table>
            </div>

            <div class="seccion">
              <h3>💰 Cálculo de Tarifa</h3>
              <div class="tarifa-detalle">
                ${recibo.detallesTarifa}
              </div>
            </div>

            <div class="costo-total">
              <div class="costo-total-contenido">
                <span class="costo-total-label">💵 TOTAL A PAGAR:</span>
                <span class="costo-total-valor">${recibo.costoTotal}</span>
              </div>
            </div>

          </div>
        </div>
      </body>
      </html>
    `;

    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoHTML);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      setTimeout(() => {
        ventanaImpresion.print();
      }, 500);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-2xl font-bold">Recibo de Salida</h2>
            <p className="text-blue-100 text-sm mt-1">Parqueadero {parqueadero.nombre}</p>
          </div>

          <div className="p-6 space-y-4">
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

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Cálculo de Tarifa</h3>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="text-gray-700">{recibo.detallesTarifa}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Costo Total:</span>
                <span className="text-3xl font-bold text-green-600">{recibo.costoTotal}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-sm text-blue-800">
                ✓ Por favor confirma el pago de <span className="font-bold">{recibo.costoTotal}</span> antes de permitir la salida del vehículo.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3">
            <button
              onClick={handleImprimir}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </button>
            <button
              onClick={onCancelar}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
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
      </div>
    </>
  );
};

export default ReciboSalida;
