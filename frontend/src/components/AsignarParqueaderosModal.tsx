import React, { useState, useEffect } from 'react';
import { X, Building2, Check, Search } from 'lucide-react';
import { parqueaderoService, usuarioService } from '../services/index';
import { toast } from 'react-toastify';

interface Parqueadero {
  id: number;
  nombre: string;
  direccion: string;
  capacidad_total: number;
  capacidad_disponible: number;
}

interface AsignarParqueaderosModalProps {
  show: boolean;
  onHide: () => void;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  } | null;
  onSuccess: () => void;
}

const AsignarParqueaderosModal: React.FC<AsignarParqueaderosModalProps> = ({
  show,
  onHide,
  usuario,
  onSuccess
}) => {
  const [parqueaderos, setParqueaderos] = useState<Parqueadero[]>([]);
  const [parqueaderoAsignado, setParqueaderoAsignado] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (show && usuario) {
      cargarDatos();
    }
  }, [show, usuario]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar todos los parqueaderos
      try {
        const parqueaderosResponse = await parqueaderoService.getAll();
        console.log('Respuesta parqueaderos:', parqueaderosResponse);
        
        if (parqueaderosResponse && parqueaderosResponse.success) {
          setParqueaderos(parqueaderosResponse.parqueaderos || []);
        } else {
          console.error('Error en respuesta de parqueaderos:', parqueaderosResponse);
          toast.error(parqueaderosResponse?.error || 'Error al cargar parqueaderos');
        }
      } catch (error: any) {
        console.error('Error al cargar parqueaderos:', error);
        toast.error(`Error al cargar parqueaderos: ${error.message || 'Error de conexión'}`);
      }

      // Cargar parqueaderos asignados al usuario
      if (usuario) {
        try {
          const asignadosResponse = await usuarioService.obtenerParqueaderosAsignados(usuario.id);
          console.log('Respuesta asignados:', asignadosResponse);
          
          if (asignadosResponse && asignadosResponse.success && asignadosResponse.parqueaderos && asignadosResponse.parqueaderos.length > 0) {
            // Tomar solo el primer parqueadero asignado
            setParqueaderoAsignado(asignadosResponse.parqueaderos[0].id);
          } else {
            // No hay parqueaderos asignados aún, esto es normal
            setParqueaderoAsignado(null);
          }
        } catch (error: any) {
          console.error('Error al cargar asignaciones:', error);
          // No mostrar error si no hay asignaciones, es normal
          setParqueaderoAsignado(null);
        }
      }
    } catch (error: any) {
      console.error('Error general cargando datos:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarParqueadero = (parqueaderoId: number) => {
    setParqueaderoAsignado(parqueaderoId);
  };

  // Filtrar parqueaderos según el término de búsqueda
  const parqueaderosFiltrados = parqueaderos.filter(parqueadero =>
    parqueadero.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parqueadero.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGuardar = async () => {
    if (!usuario) return;
    
    // Validar que se haya seleccionado un parqueadero
    if (!parqueaderoAsignado) {
      toast.error('Debes seleccionar un parqueadero');
      return;
    }

    try {
      setSaving(true);

      // Obtener parqueadero actual
      let parqueaderoActual: number | null = null;
      try {
        const asignadosResponse = await usuarioService.obtenerParqueaderosAsignados(usuario.id);
        if (asignadosResponse && asignadosResponse.success && asignadosResponse.parqueaderos && asignadosResponse.parqueaderos.length > 0) {
          parqueaderoActual = asignadosResponse.parqueaderos[0].id;
        }
      } catch (error) {
        console.log('No hay asignaciones previas, continuando...');
      }

      // Si hay un parqueadero actual diferente, desasignarlo primero
      if (parqueaderoActual && parqueaderoActual !== parqueaderoAsignado) {
        try {
          const result = await usuarioService.desasignarParqueadero(usuario.id, parqueaderoActual);
          console.log(`Desasignado parqueadero anterior ${parqueaderoActual}:`, result);
        } catch (error: any) {
          console.error('Error desasignando parqueadero anterior:', error);
        }
      }

      // Asignar el nuevo parqueadero (solo si es diferente al actual)
      if (parqueaderoActual !== parqueaderoAsignado) {
        try {
          console.log(`[DEBUG] Asignando parqueadero ${parqueaderoAsignado} al usuario:`, {
            idUsuario: usuario.id,
            nombreUsuario: usuario.nombre,
            emailUsuario: usuario.email,
            rolUsuario: usuario.rol
          });
          const result = await usuarioService.asignarParqueadero(usuario.id, parqueaderoAsignado);
          console.log(`Asignado parqueadero ${parqueaderoAsignado}:`, result);
          
          if (!result || !result.success) {
            throw new Error(result?.error || 'Error al asignar parqueadero');
          }
        } catch (error: any) {
          console.error('Error asignando parqueadero:', error);
          toast.error(`Error al asignar parqueadero: ${error.message}`);
          throw error;
        }
      }

      toast.success('Parqueadero asignado correctamente');
      onSuccess();
      onHide();
    } catch (error: any) {
      console.error('Error guardando asignación:', error);
      toast.error(`Error al guardar la asignación: ${error.message || 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  if (!show || !usuario) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onHide}></div>
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Asignar Parqueaderos
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {usuario.nombre} ({usuario.email})
            </p>
          </div>
          <button
            onClick={onHide}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Cargando parqueaderos...</span>
            </div>
          ) : parqueaderos.length > 0 ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Selecciona el parqueadero que este controlador gestionará:
                </p>

                {/* Barra de búsqueda */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o dirección..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Contador de resultados */}
                <div className="text-xs text-gray-500 mb-2">
                  {parqueaderosFiltrados.length} de {parqueaderos.length} parqueadero(s)
                  {searchTerm && ` - Filtrando por "${searchTerm}"`}
                </div>
              </div>

              {parqueaderosFiltrados.length > 0 ? (
                <div className="space-y-3">
                  {parqueaderosFiltrados.map((parqueadero) => {
                const isSeleccionado = parqueaderoAsignado === parqueadero.id;
                return (
                  <div
                    key={parqueadero.id}
                    onClick={() => seleccionarParqueadero(parqueadero.id)}
                    className={`
                      border rounded-lg p-4 cursor-pointer transition-all
                      ${isSeleccionado
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Radio button */}
                        <div className="flex-shrink-0 mt-1">
                          <div className={`
                            h-5 w-5 rounded-full border-2 flex items-center justify-center
                            ${isSeleccionado ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}
                          `}>
                            {isSeleccionado && (
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">
                            {parqueadero.nombre}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {parqueadero.direccion}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Capacidad: {parqueadero.capacidad_total}</span>
                            <span>Disponibles: {parqueadero.capacidad_disponible}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    {searchTerm 
                      ? `No se encontraron parqueaderos que coincidan con "${searchTerm}"`
                      : 'No hay parqueaderos disponibles'
                    }
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Limpiar búsqueda
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No hay parqueaderos disponibles</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {parqueaderoAsignado ? '1 parqueadero seleccionado' : 'Ningún parqueadero seleccionado'}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onHide}
              disabled={saving}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={saving || !parqueaderoAsignado}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                'Guardar Asignación'
              )}
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default AsignarParqueaderosModal;
