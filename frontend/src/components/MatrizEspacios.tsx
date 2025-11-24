import React, { useState, useEffect } from 'react';
import { Car, Clock, AlertCircle } from 'lucide-react';
import { espacioService } from '../services/index';

interface Espacio {
  id: number;
  codigo_espacio: string;
  estado: 'LIBRE' | 'OCUPADO' | 'RESERVADO' | 'FUERA_SERVICIO';
  id_parqueadero: number;
  registro_id?: number;
  fecha_ingreso?: string;
  vehiculo_id?: number;
  placa?: string;
  marca?: string;
  modelo?: string;
  color?: string;
  tipo_vehiculo?: string;
  horas_estacionado?: number;
}

interface MatrizEspaciosProps {
  parqueaderoId: number;
  capacidadTotal: number;
}

const MatrizEspacios: React.FC<MatrizEspaciosProps> = ({ parqueaderoId, capacidadTotal }) => {
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredEspacio, setHoveredEspacio] = useState<number | null>(null);

  useEffect(() => {
    cargarEspacios();
  }, [parqueaderoId]);

  const cargarEspacios = async () => {
    try {
      setLoading(true);
      const response = await espacioService.getEspaciosPorParqueadero(parqueaderoId);
      
      if (response.success) {
        const espaciosBackend = response.espacios || [];
        
        // Si no hay espacios en el backend, generar espacios virtuales
        if (espaciosBackend.length === 0 && capacidadTotal > 0) {
          const espaciosVirtuales: Espacio[] = [];
          for (let i = 1; i <= capacidadTotal; i++) {
            espaciosVirtuales.push({
              id: i,
              codigo_espacio: `E-${String(i).padStart(3, '0')}`,
              estado: 'LIBRE',
              id_parqueadero: parqueaderoId
            });
          }
          setEspacios(espaciosVirtuales);
        } else if (espaciosBackend.length < capacidadTotal) {
          // Si hay menos espacios que la capacidad total, completar con espacios virtuales
          const espaciosCompletos = [...espaciosBackend];
          const espaciosExistentes = espaciosBackend.length;
          
          for (let i = espaciosExistentes + 1; i <= capacidadTotal; i++) {
            espaciosCompletos.push({
              id: 1000 + i, // ID temporal para evitar conflictos
              codigo_espacio: `E-${String(i).padStart(3, '0')}`,
              estado: 'LIBRE',
              id_parqueadero: parqueaderoId
            });
          }
          setEspacios(espaciosCompletos);
        } else {
          setEspacios(espaciosBackend);
        }
      }
    } catch (error) {
      console.error('Error al cargar espacios:', error);
      
      // En caso de error, generar espacios virtuales
      const espaciosVirtuales: Espacio[] = [];
      for (let i = 1; i <= capacidadTotal; i++) {
        espaciosVirtuales.push({
          id: i,
          codigo_espacio: `E-${String(i).padStart(3, '0')}`,
          estado: 'LIBRE',
          id_parqueadero: parqueaderoId
        });
      }
      setEspacios(espaciosVirtuales);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'LIBRE':
        return 'bg-green-500 hover:bg-green-600';
      case 'OCUPADO':
        return 'bg-red-500 hover:bg-red-600';
      case 'RESERVADO':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'FUERA_SERVICIO':
        return 'bg-gray-400 hover:bg-gray-500';
      default:
        return 'bg-gray-300 hover:bg-gray-400';
    }
  };

  const formatTiempo = (horas?: number) => {
    if (!horas) return '0h 0m';
    
    const horasEnteras = Math.floor(horas);
    const minutos = Math.round((horas - horasEnteras) * 60);
    
    return `${horasEnteras}h ${minutos}m`;
  };

  const formatFecha = (fecha?: string) => {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular número de columnas para la matriz (máximo 10 columnas)
  const numColumnas = Math.min(10, Math.ceil(Math.sqrt(capacidadTotal)));
  const numFilas = Math.ceil(capacidadTotal / numColumnas);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Leyenda */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-700">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-700">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-700">Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-400 rounded"></div>
          <span className="text-sm text-gray-700">Fuera de servicio</span>
        </div>
      </div>

      {/* Matriz de espacios */}
      <div 
        className="grid gap-3 mx-auto"
        style={{
          gridTemplateColumns: `repeat(${numColumnas}, minmax(0, 1fr))`,
          maxWidth: `${numColumnas * 100}px`
        }}
      >
        {espacios.map((espacio) => (
          <div
            key={espacio.id}
            className="relative"
            onMouseEnter={() => setHoveredEspacio(espacio.id)}
            onMouseLeave={() => setHoveredEspacio(null)}
          >
            {/* Espacio */}
            <div
              className={`
                ${getEstadoColor(espacio.estado)}
                rounded-lg p-4 cursor-pointer transition-all duration-200
                flex flex-col items-center justify-center
                min-h-[80px] shadow-md
              `}
            >
              <Car className="h-6 w-6 text-white mb-1" />
              <span className="text-white font-semibold text-sm">
                {espacio.codigo_espacio}
              </span>
            </div>

            {/* Tooltip */}
            {hoveredEspacio === espacio.id && (
              <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
                <div className="bg-gray-900 text-white rounded-lg shadow-xl p-4">
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-gray-900"></div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                      <span className="font-bold text-lg">{espacio.codigo_espacio}</span>
                      <span className={`
                        px-2 py-1 rounded text-xs font-semibold
                        ${espacio.estado === 'LIBRE' ? 'bg-green-600' : ''}
                        ${espacio.estado === 'OCUPADO' ? 'bg-red-600' : ''}
                        ${espacio.estado === 'RESERVADO' ? 'bg-yellow-600' : ''}
                        ${espacio.estado === 'FUERA_SERVICIO' ? 'bg-gray-600' : ''}
                      `}>
                        {espacio.estado}
                      </span>
                    </div>

                    {espacio.estado === 'OCUPADO' && espacio.placa ? (
                      <>
                        <div className="flex items-start gap-2">
                          <Car className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold">{espacio.placa}</p>
                            <p className="text-xs text-gray-300">
                              {espacio.marca} {espacio.modelo}
                            </p>
                            {espacio.tipo_vehiculo && (
                              <p className="text-xs text-gray-400 capitalize">
                                {espacio.tipo_vehiculo}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm">
                              Tiempo: <span className="font-semibold">{formatTiempo(espacio.horas_estacionado)}</span>
                            </p>
                            <p className="text-xs text-gray-400">
                              Ingreso: {formatFecha(espacio.fecha_ingreso)}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : espacio.estado === 'LIBRE' ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Espacio disponible</span>
                      </div>
                    ) : espacio.estado === 'FUERA_SERVICIO' ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">No disponible</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Espacio reservado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-600 font-medium">Libres</p>
          <p className="text-2xl font-bold text-green-700">
            {espacios.filter(e => e.estado === 'LIBRE').length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs text-red-600 font-medium">Ocupados</p>
          <p className="text-2xl font-bold text-red-700">
            {espacios.filter(e => e.estado === 'OCUPADO').length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-600 font-medium">Reservados</p>
          <p className="text-2xl font-bold text-yellow-700">
            {espacios.filter(e => e.estado === 'RESERVADO').length}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 font-medium">Fuera de servicio</p>
          <p className="text-2xl font-bold text-gray-700">
            {espacios.filter(e => e.estado === 'FUERA_SERVICIO').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatrizEspacios;
