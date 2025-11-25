import React from 'react';
import { Car, Calendar, DollarSign, Clock, MapPin, User, FileText } from 'lucide-react';

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
  detalles?: any[];
}

interface ReporteImprimibleProps {
  reporte: ReporteData;
}

const ReporteImprimible: React.FC<ReporteImprimibleProps> = ({ reporte }) => {
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
    <div id="reporte-imprimible" className="reporte-imprimible">
      <style>{`
        /* Estilos para pantalla - ocultar el reporte */
        @media screen {
          .reporte-imprimible {
            position: fixed;
            left: -9999px;
            top: -9999px;
            width: 210mm;
            opacity: 0;
            pointer-events: none;
          }
        }

        /* Estilos para impresión */
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          body * {
            visibility: hidden;
          }
          
          .reporte-imprimible,
          .reporte-imprimible * {
            visibility: visible;
          }
          
          .reporte-imprimible {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            background: white;
            font-family: 'Arial', 'Helvetica', sans-serif;
          }
          
          /* Colores de la app - Tailwind config */
          .print-header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            margin-bottom: 25px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .print-card {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
          }
          
          .print-card-blue {
            background: #eff6ff;
            border-color: #3b82f6;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print-card-green {
            background: #EAFAF7;
            border-color: #249782;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print-card-orange {
            background: #fff7ed;
            border-color: #f97316;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 25px;
          }
          
          .print-stat {
            text-align: center;
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #e5e7eb;
          }
          
          .print-stat-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          
          .print-stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
          }
          
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          .print-table th {
            background: #3b82f6;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .print-table tr:nth-child(even) {
            background: #f9fafb;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
          
          .print-logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          h1, h2, h3 {
            color: #1f2937;
            margin-bottom: 15px;
          }
          
          .print-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .print-info-label {
            font-weight: 600;
            color: #4b5563;
          }
          
          .print-info-value {
            color: #1f2937;
          }

          /* Asegurar que los colores se impriman */
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Evitar saltos de página en elementos clave */
          .print-header,
          .print-section,
          .print-card,
          .print-grid {
            page-break-inside: avoid;
          }

          /* Ocultar elementos innecesarios */
          nav, header, footer:not(.print-footer), .sidebar, .topbar {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="print-header">
        <div className="print-logo">🅿️ ParkNow</div>
        <h1 style={{ fontSize: '28px', margin: '10px 0' }}>{reporte.titulo}</h1>
        <p style={{ fontSize: '14px', opacity: 0.9 }}>
          Sistema de Gestión de Parqueaderos
        </p>
      </div>

      {/* Información General */}
      <div className="print-section">
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>📋 Información del Reporte</h2>
        <div className="print-card">
          <div className="print-info-row">
            <span className="print-info-label">Tipo de Reporte:</span>
            <span className="print-info-value">{reporte.tipo.toUpperCase()}</span>
          </div>
          <div className="print-info-row">
            <span className="print-info-label">Período:</span>
            <span className="print-info-value">
              {formatDate(reporte.fechaInicio)} - {formatDate(reporte.fechaFin)}
            </span>
          </div>
          {reporte.parqueaderoNombre && (
            <div className="print-info-row">
              <span className="print-info-label">Parqueadero:</span>
              <span className="print-info-value">{reporte.parqueaderoNombre}</span>
            </div>
          )}
          {reporte.controlador && (
            <div className="print-info-row">
              <span className="print-info-label">Controlador:</span>
              <span className="print-info-value">{reporte.controlador}</span>
            </div>
          )}
          <div className="print-info-row">
            <span className="print-info-label">Fecha de Generación:</span>
            <span className="print-info-value">{formatDateTime(reporte.fechaGeneracion)}</span>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="print-section">
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>📊 Métricas Principales</h2>
        <div className="print-grid">
          <div className="print-stat print-card-blue">
            <div className="print-stat-label">Total Vehículos</div>
            <div className="print-stat-value" style={{ color: '#1e40af' }}>
              {reporte.totalVehiculos.toLocaleString()}
            </div>
          </div>
          <div className="print-stat print-card-green">
            <div className="print-stat-label">Total Ingresos</div>
            <div className="print-stat-value" style={{ color: '#249782' }}>
              {formatCurrency(reporte.totalIngresos)}
            </div>
          </div>
          <div className="print-stat print-card-orange">
            <div className="print-stat-label">Tiempo Promedio</div>
            <div className="print-stat-value" style={{ color: '#ea580c' }}>
              {toNumber(reporte.tiempoPromedioEstadia).toFixed(1)}h
            </div>
          </div>
        </div>
      </div>

      {/* Distribución por Tipo de Vehículo */}
      <div className="print-section">
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>🚗 Distribución por Tipo de Vehículo</h2>
        <div className="print-card">
          <table className="print-table">
            <thead>
              <tr>
                <th>Tipo de Vehículo</th>
                <th style={{ textAlign: 'center' }}>Cantidad</th>
                <th style={{ textAlign: 'center' }}>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🚗 Carros</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {reporte.vehiculosPorTipo.carros}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {calcularPorcentaje(reporte.vehiculosPorTipo.carros, reporte.totalVehiculos)}%
                </td>
              </tr>
              <tr>
                <td>🏍️ Motos</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {reporte.vehiculosPorTipo.motos}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {calcularPorcentaje(reporte.vehiculosPorTipo.motos, reporte.totalVehiculos)}%
                </td>
              </tr>
              <tr>
                <td>🚲 Bicicletas</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {reporte.vehiculosPorTipo.bicicletas}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {calcularPorcentaje(reporte.vehiculosPorTipo.bicicletas, reporte.totalVehiculos)}%
                </td>
              </tr>
              <tr style={{ background: '#f3f4f6', fontWeight: 'bold' }}>
                <td>TOTAL</td>
                <td style={{ textAlign: 'center' }}>{reporte.totalVehiculos}</td>
                <td style={{ textAlign: 'center' }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Análisis y Observaciones */}
      <div className="print-section">
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>💡 Análisis</h2>
        <div className="print-card">
          <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>
            <strong>Ingreso Promedio por Vehículo:</strong>{' '}
            {formatCurrency(reporte.totalIngresos / reporte.totalVehiculos)}
          </p>
          <p style={{ marginBottom: '10px', lineHeight: '1.6' }}>
            <strong>Tipo de Vehículo Predominante:</strong>{' '}
            {reporte.vehiculosPorTipo.carros > reporte.vehiculosPorTipo.motos && 
             reporte.vehiculosPorTipo.carros > reporte.vehiculosPorTipo.bicicletas
              ? 'Carros'
              : reporte.vehiculosPorTipo.motos > reporte.vehiculosPorTipo.bicicletas
              ? 'Motos'
              : 'Bicicletas'}
          </p>
          <p style={{ lineHeight: '1.6' }}>
            <strong>Días del Período:</strong>{' '}
            {Math.ceil((new Date(reporte.fechaFin).getTime() - new Date(reporte.fechaInicio).getTime()) / (1000 * 60 * 60 * 24)) + 1} días
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="print-footer">
        <p>
          <strong>ParkNow</strong> - Sistema de Gestión de Parqueaderos
        </p>
        <p>
          Reporte generado el {formatDateTime(reporte.fechaGeneracion)}
        </p>
        <p style={{ marginTop: '10px', fontSize: '11px' }}>
          Este documento es un reporte oficial del sistema ParkNow.
        </p>
      </div>
    </div>
  );
};

export default ReporteImprimible;
