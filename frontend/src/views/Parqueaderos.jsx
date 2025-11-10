import React, { useState, useEffect } from 'react';
import { parqueaderoService } from '../services';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, MapPin, AlertCircle } from 'lucide-react';

const Parqueaderos = () => {
  const [parqueaderos, setParqueaderos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingParqueadero, setEditingParqueadero] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    capacidadTotal: '',
    latitud: '',
    longitud: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { isAdmin } = useAuth();

  useEffect(() => {
    cargarParqueaderos();
  }, []);

  const cargarParqueaderos = async () => {
    try {
      setLoading(true);
      const result = await parqueaderoService.getAll();
      if (result.success) {
        setParqueaderos(result.parqueaderos);
      }
    } catch (error) {
      setError('Error cargando parqueaderos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const data = {
        ...formData,
        capacidadTotal: parseInt(formData.capacidadTotal),
        latitud: formData.latitud ? parseFloat(formData.latitud) : null,
        longitud: formData.longitud ? parseFloat(formData.longitud) : null
      };

      let result;
      if (editingParqueadero) {
        result = await parqueaderoService.update(editingParqueadero.id, data);
      } else {
        result = await parqueaderoService.create(data);
      }

      if (result.success) {
        setSuccess(editingParqueadero ? 'Parqueadero actualizado' : 'Parqueadero creado');
        setShowModal(false);
        resetForm();
        cargarParqueaderos();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error guardando parqueadero');
    }
  };

  const handleEdit = (parqueadero) => {
    setEditingParqueadero(parqueadero);
    setFormData({
      nombre: parqueadero.nombre,
      direccion: parqueadero.direccion,
      capacidadTotal: parqueadero.capacidadTotal.toString(),
      latitud: parqueadero.latitud?.toString() || '',
      longitud: parqueadero.longitud?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar este parqueadero?')) return;

    try {
      const result = await parqueaderoService.delete(id);
      if (result.success) {
        setSuccess('Parqueadero eliminado');
        cargarParqueaderos();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Error eliminando parqueadero');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      capacidadTotal: '',
      latitud: '',
      longitud: ''
    });
    setEditingParqueadero(null);
    setError('');
  };

  const getCapacidadStatus = (parqueadero) => {
    const porcentaje = (parqueadero.capacidadDisponible / parqueadero.capacidadTotal) * 100;
    if (porcentaje <= 10) return { color: '#dc3545', text: 'Crítico' };
    if (porcentaje <= 30) return { color: '#ffc107', text: 'Bajo' };
    return { color: '#28a745', text: 'Normal' };
  };

  if (loading) {
    return <div className="loading">Cargando parqueaderos...</div>;
  }

  return (
    <div>
      <div className="flex flex-between mb-20">
        <h1>Gestión de Parqueaderos</h1>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            <Plus size={16} className="mr-5" />
            Nuevo Parqueadero
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="grid grid-2">
        {parqueaderos.map((parqueadero) => {
          const status = getCapacidadStatus(parqueadero);
          
          return (
            <div key={parqueadero.id} className="card">
              <div className="flex flex-between mb-10">
                <h3>{parqueadero.nombre}</h3>
                <div style={{ color: status.color, fontWeight: 'bold' }}>
                  {status.text}
                </div>
              </div>
              
              <p style={{ color: '#666', marginBottom: '10px' }}>
                <MapPin size={14} style={{ marginRight: '5px' }} />
                {parqueadero.direccion}
              </p>
              
              <div className="mb-15">
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '5px'
                }}>
                  <span>Disponibles:</span>
                  <span><strong>{parqueadero.capacidadDisponible}/{parqueadero.capacidadTotal}</strong></span>
                </div>
                
                <div style={{
                  height: '8px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${((parqueadero.capacidadTotal - parqueadero.capacidadDisponible) / parqueadero.capacidadTotal) * 100}%`,
                    backgroundColor: status.color,
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex gap-10">
                  <button 
                    onClick={() => handleEdit(parqueadero)}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    <Edit size={14} className="mr-5" />
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(parqueadero.id)}
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                  >
                    <Trash2 size={14} className="mr-5" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', maxWidth: '90vw' }}>
            <h2>{editingParqueadero ? 'Editar Parqueadero' : 'Nuevo Parqueadero'}</h2>
            
            {error && <div className="alert alert-error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Dirección</label>
                <textarea
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Capacidad Total</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacidadTotal}
                  onChange={(e) => setFormData({...formData, capacidadTotal: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Latitud (opcional)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitud}
                  onChange={(e) => setFormData({...formData, latitud: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Longitud (opcional)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitud}
                  onChange={(e) => setFormData({...formData, longitud: e.target.value})}
                />
              </div>
              
              <div className="flex gap-10">
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  {editingParqueadero ? 'Actualizar' : 'Crear'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="btn btn-secondary"
                  style={{flex: 1}}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parqueaderos;