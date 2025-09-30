import React, { useState, useEffect } from 'react';
import { Search, Users, UserCheck, AlertCircle } from 'lucide-react';
import { usuarioService } from '../services/index';
import { useAuth } from '../context/AuthContext';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  activo?: boolean;
}

const UsuariosSimple = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      cargarUsuarios();
    }
  }, [isAuthenticated]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando usuarios...');
      const response = await usuarioService.getAll();
      console.log('Respuesta usuarios:', response);
      
      if (response.success && response.usuarios) {
        setUsuarios(response.usuarios);
        console.log('Usuarios cargados:', response.usuarios);
      } else {
        setError('No se pudieron cargar los usuarios: ' + (response.error || 'Error desconocido'));
      }
    } catch (error: any) {
      console.error('Error cargando usuarios:', error);
      setError('Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container-fluid">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acceso Requerido</h2>
            <p className="text-gray-600">Debes iniciar sesión para ver esta página.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Lista de Usuarios (Simple)
        </h1>
        <p className="text-gray-600">Vista simplificada de usuarios del sistema</p>
        
        {user && (
          <div className="mt-2 text-sm text-gray-500">
            Usuario actual: {user.nombre} ({user.rol})
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Cargando usuarios...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar usuarios</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={cargarUsuarios}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Reintentar
              </button>
            </div>
          ) : usuarios.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-600 mb-4">
                <Users className="h-5 w-5" />
                <span>Total de usuarios: {usuarios.length}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usuarios.map((usuario) => (
                  <div key={usuario.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {usuario.nombre} {usuario.apellido}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {usuario.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            usuario.rol === 'ADMIN' || usuario.rol === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {usuario.rol}
                          </span>
                          <span className="text-xs text-gray-500">
                            ID: {usuario.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
              <p className="text-gray-500">No se encontraron usuarios en el sistema.</p>
            </div>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Información de Debug</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>URL: {window.location.pathname}</div>
          <div>Usuario autenticado: {isAuthenticated ? 'Sí' : 'No'}</div>
          <div>Componente: UsuariosSimple</div>
          <div>Estado loading: {loading ? 'Sí' : 'No'}</div>
          <div>Error: {error || 'Ninguno'}</div>
        </div>
      </div>
    </div>
  );
};

export default UsuariosSimple;