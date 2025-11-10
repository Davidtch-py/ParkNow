import React, { useState, useEffect } from 'react';
import { reporteService, parqueaderoService } from '../services';
import { Calendar, FileText, Download } from 'lucide-react';

const Reportes = () => {
  const [tipoReporte, setTipoReporte] = useState('fecha');
  const [parqueaderos, setParqueaderos] = useState([]);
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    parqueaderoId: '',
    tipoVehiculo: 'carro',
    controladorId: ''
  });
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarParqueaderos();
    
    // Establecer fechas por defecto (última semana)
    const hoy = new Date();
    const semanaAnterior = new Date();
    semanaAnterior.setDate(hoy.getDate() - 7);
    
    setFormData(prev => ({
      ...prev,
      fechaInicio: semanaAnterior.toISOString().split('T')[0],
      fechaFin: hoy.toISOString().split('T')[0]
    }));
  }, []);

  const cargarParqueaderos = async () => {
    try {
      const result = await parqueaderoService.getAll();
      if (result.success) {
        setParqueaderos(result.parqueaderos);
      }
    } catch (error) {
      console.error('Error cargando parqueaderos:', error);
    }
  };

  const generarReporte = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReporte(null);

    try {
      const fechaInicio = new Date(formData.fechaInicio);
      const fechaFin = new Date(formData.fechaFin);

      let result;
      
      switch (tipoReporte) {
        case 'fecha':
          result = await reporteService.generarPorFecha(
            fechaInicio, 
            fechaFin, 
            formData.parqueaderoId || null
          );
          break;
        case 'tipo-vehiculo':
          result = await reporteService.generarPorTipoVehiculo(
            formData.tipoVehiculo,
            fechaInicio,
            fechaFin,
            formData.parqueaderoId || null
          );
          break;
        case 'controlador':
          if (!formData.controladorId) {
            setError('Debe especificar el ID del controlador');
            return;
          }
          result = await reporteService.generarPorControlador(
            parseInt(formData.controladorId),
            fechaInicio,
            fechaFin
          );
          break;
        default:
          setError('Tipo de reporte no válido');
          return;
      }

      if (result.success) {
        setReporte(result.reporte);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error generando reporte');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO');
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(monto);
  };

  return (
    <div>
      <div className="flex flex-between mb-20">
        <h1>Reportes y Estadísticas</h1>
        <Calendar size={24} style={{ color: '#007bff' }} />
      </div>

      <div className="grid grid-2 gap-20">
        {/* Formulario de generación */}
        <div className="card">
          <h2 className="mb-15">Generar Reporte</h2>
          
          <form onSubmit={generarReporte}>
            <div className="form-group">
              <label>Tipo de Reporte</label>
              <select 
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
              >
                <option value="fecha">Por Fecha</option>
                <option value="tipo-vehiculo">Por Tipo de Vehículo</option>
                <option value="controlador">Por Controlador</option>
              </select>
            </div>

            <div className="form-group">
              <label>Fecha Inicio</label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Fecha Fin</label>
              <input
                type="date"
                value={formData.fechaFin}
                onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Parqueadero (opcional)</label>
              <select 
                value={formData.parqueaderoId}
                onChange={(e) => setFormData({...formData, parqueaderoId: e.target.value})}
              >
                <option value="">Todos los parqueaderos</option>
                {parqueaderos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>

            {tipoReporte === 'tipo-vehiculo' && (
              <div className="form-group">
                <label>Tipo de Vehículo</label>
                <select 
                  value={formData.tipoVehiculo}
                  onChange={(e) => setFormData({...formData, tipoVehiculo: e.target.value})}
                >
                  <option value="carro">Carro</option>
                  <option value="moto">Moto</option>
                  <option value="bicicleta">Bicicleta</option>
                </select>
              </div>
            )}

            {tipoReporte === 'controlador' && (
              <div className="form-group">
                <label>ID del Controlador</label>
                <input
                  type="number"
                  value={formData.controladorId}
                  onChange={(e) => setFormData({...formData, controladorId: e.target.value})}
                  placeholder="Ej: 2"
                  required
                />
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Generando...' : (
                <>
                  <FileText size={16} className="mr-5" />
                  Generar Reporte
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resultados */}
        <div className="card">
          <h2 className="mb-15">Resultados</h2>
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {reporte ? (
            <div>
              <div className="mb-15">
                <h3>Reporte Generado</h3>
                <p style={{ color: '#666' }}>
                  Período: {formatearFecha(reporte.periodo.fechaInicio)} - {formatearFecha(reporte.periodo.fechaFin)}
                </p>
              </div>

              {tipoReporte === 'fecha' && (
                <div className="grid grid-2 gap-10 mb-15">
                  <div className="p-10" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Total Entradas:</strong> {reporte.totalEntradas}
                  </div>
                  <div className="p-10" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Total Salidas:</strong> {reporte.totalSalidas}
                  </div>
                  <div className="p-10" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Vehículos Activos:</strong> {reporte.vehiculosActivos}
                  </div>
                  <div className="p-10" style={{ backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                    <strong>Total Ingresos:</strong> {formatearMoneda(reporte.totalIngresos)}
                  </div>
                </div>
              )}

              {tipoReporte === 'tipo-vehiculo' && (
                <div className="grid grid-2 gap-10 mb-15">
                  <div className="p-10" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Tipo:</strong> {reporte.tipoVehiculo}
                  </div>
                  <div className="p-10" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Total Salidas:</strong> {reporte.totalSalidas}
                  </div>
                  <div className="p-10" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Tiempo Promedio:</strong> {Math.floor(reporte.tiempoPromedioMinutos / 60)}h {reporte.tiempoPromedioMinutos % 60}m
                  </div>
                  <div className="p-10" style={{ backgroundColor: '#e8f5e8', borderRadius: '4px' }}>
                    <strong>Total Ingresos:</strong> {formatearMoneda(reporte.totalIngresos)}
                  </div>
                </div>
              )}

              {tipoReporte === 'controlador' && (
                <div className="grid grid-2 gap-10 mb-15">
                  <div className="p-10" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Controlador:</strong> {reporte.controlador.nombre}
                  </div>
                  <div className="p-10" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>ID:</strong> {reporte.controlador.id}
                  </div>
                  <div className="p-10" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Entradas Registradas:</strong> {reporte.entradasRegistradas}
                  </div>
                  <div className="p-10" style={{ backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>Salidas Registradas:</strong> {reporte.salidasRegistradas}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center" style={{ color: '#666', padding: '40px' }}>
              <FileText size={48} style={{ marginBottom: '10px', opacity: 0.3 }} />
              <p>Selecciona los parámetros y genera un reporte</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;