import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Car, RefreshCw } from 'lucide-react';
import { parqueaderoService } from '../services/index';
import MatrizEspacios from '../components/MatrizEspacios';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface Parqueadero {
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  capacidad_total: number;
  capacidadTotal: number;
  capacidad_disponible?: number;
  capacidadDisponible?: number;
  estado: string;
  latitud?: number;
  longitud?: number;
}

const DetalleParqueadero: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [parqueadero, setParqueadero] = useState<Parqueadero | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (id) {
      cargarParqueadero();
    }
  }, [id]);

  const cargarParqueadero = async () => {
    try {
      setLoading(true);
      const response = await parqueaderoService.getById(id!);
      
      if (response.success) {
        setParqueadero(response.parqueadero);
      }
    } catch (error) {
      console.error('Error al cargar parqueadero:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    cargarParqueadero();
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <LoadingSkeleton count={1} type="card" />
      </div>
    );
  }

  if (!parqueadero) {
    return (
      <div className="container-fluid">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Parqueadero no encontrado</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const capacidadTotal = parqueadero.capacidad_total || parqueadero.capacidadTotal || 0;
  const capacidadDisponible = parqueadero.capacidad_disponible ?? parqueadero.capacidadDisponible ?? 0;
  const ocupados = capacidadTotal - capacidadDisponible;
  const porcentajeOcupacion = capacidadTotal > 0 ? Math.round((ocupados / capacidadTotal) * 100) : 0;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{parqueadero.nombre}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{parqueadero.direccion}, {parqueadero.ciudad}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-black rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ backgroundColor: 'var(--park-blue)' }}
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Capacidad Total</p>
              <p className="text-3xl font-bold text-gray-900">{capacidadTotal}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Espacios Ocupados</p>
              <p className="text-3xl font-bold text-red-600">{ocupados}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Car className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Espacios Disponibles</p>
              <p className="text-3xl font-bold text-green-600">{capacidadDisponible}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Car className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Barra de ocupación */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Ocupación</h3>
          <span className="text-2xl font-bold text-gray-900">{porcentajeOcupacion}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              porcentajeOcupacion >= 90
                ? 'bg-red-600'
                : porcentajeOcupacion >= 70
                ? 'bg-yellow-600'
                : 'bg-green-600'
            }`}
            style={{ width: `${porcentajeOcupacion}%` }}
          ></div>
        </div>
      </div>

      {/* Matriz de espacios */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Distribución de Espacios</h2>
          <p className="text-sm text-gray-600 mt-1">
            Pasa el cursor sobre cada espacio para ver detalles del vehículo y tiempo de estacionamiento
          </p>
        </div>
        <MatrizEspacios 
          key={refreshKey}
          parqueaderoId={parqueadero.id} 
          capacidadTotal={capacidadTotal} 
        />
      </div>
    </div>
  );
};

export default DetalleParqueadero;
