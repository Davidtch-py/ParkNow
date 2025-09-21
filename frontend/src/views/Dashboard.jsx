import React, { useState, useEffect } from 'react';
import { parqueaderoService, entradaService } from '../services';
import { Car, Users, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalParqueaderos: 0,
    totalEspacios: 0,
    espaciosOcupados: 0,
    espaciosDisponibles: 0
  });
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar parqueaderos
      const parqueaderosResult = await parqueaderoService.getAll();
      if (parqueaderosResult.success) {
        const parqueaderos = parqueaderosResult.parqueaderos;
        
        const totalParqueaderos = parqueaderos.length;
        const totalEspacios = parqueaderos.reduce((sum, p) => sum + p.capacidadTotal, 0);
        const espaciosDisponibles = parqueaderos.reduce((sum, p) => sum + p.capacidadDisponible, 0);
        const espaciosOcupados = totalEspacios - espaciosDisponibles;

        setStats({
          totalParqueaderos,
          totalEspacios,
          espaciosOcupados,
          espaciosDisponibles
        });
      }

      // Cargar alertas de capacidad baja
      const alertasResult = await parqueaderoService.getCapacidadBaja(20);
      if (alertasResult.success) {
        setAlertas(alertasResult.alertas);
      }

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  const porcentajeOcupacion = stats.totalEspacios > 0 
    ? Math.round((stats.espaciosOcupados / stats.totalEspacios) * 100) 
    : 0;

  return (
    <div>
      <div className="flex flex-between mb-20">
        <h1>Dashboard</h1>
        <button 
          onClick={cargarDatos} 
          className="btn btn-secondary"
          disabled={loading}
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-4 mb-30">
        <div className="card text-center">
          <Car size={32} style={{ margin: '0 auto 10px', color: '#007bff' }} />
          <h3>{stats.totalParqueaderos}</h3>
          <p style={{ color: '#666' }}>Parqueaderos</p>
        </div>
        
        <div className="card text-center">
          <Users size={32} style={{ margin: '0 auto 10px', color: '#28a745' }} />
          <h3>{stats.totalEspacios}</h3>
          <p style={{ color: '#666' }}>Espacios Totales</p>
        </div>
        
        <div className="card text-center">
          <TrendingUp size={32} style={{ margin: '0 auto 10px', color: '#dc3545' }} />
          <h3>{stats.espaciosOcupados}</h3>
          <p style={{ color: '#666' }}>Espacios Ocupados</p>
        </div>
        
        <div className="card text-center">
          <div style={{ 
            width: '32px', 
            height: '32px', 
            margin: '0 auto 10px',
            backgroundColor: '#ffc107',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {porcentajeOcupacion}%
          </div>
          <h3>{stats.espaciosDisponibles}</h3>
          <p style={{ color: '#666' }}>Espacios Disponibles</p>
        </div>
      </div>

      {/* Alertas de capacidad baja */}
      {alertas.length > 0 && (
        <div className="card mb-20">
          <div className="flex gap-10 mb-15">
            <AlertTriangle size={24} style={{ color: '#dc3545' }} />
            <h2 style={{ color: '#dc3545' }}>Alertas de Capacidad Baja</h2>
          </div>
          
          <div className="grid grid-2">
            {alertas.map((alerta) => (
              <div 
                key={alerta.id} 
                className="alert alert-warning"
                style={{ margin: '5px 0' }}
              >
                <strong>{alerta.nombre}</strong>
                <br />
                Disponibles: {alerta.capacidadDisponible}/{alerta.capacidadTotal} 
                ({alerta.porcentajeDisponible}%)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen visual */}
      <div className="card">
        <h2 className="mb-15">Ocupación de Parqueaderos</h2>
        <div style={{
          height: '20px',
          backgroundColor: '#e9ecef',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '10px'
        }}>
          <div style={{
            height: '100%',
            width: `${porcentajeOcupacion}%`,
            backgroundColor: porcentajeOcupacion > 80 ? '#dc3545' : 
                            porcentajeOcupacion > 60 ? '#ffc107' : '#28a745',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Ocupación general: {porcentajeOcupacion}% ({stats.espaciosOcupados} de {stats.totalEspacios} espacios)
        </p>
      </div>
    </div>
  );
};

export default Dashboard;