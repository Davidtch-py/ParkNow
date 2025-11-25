import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, CheckCircle, UserCheck, FileEdit, Building2 } from 'lucide-react';
import { usuarioService } from '../services/index';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import AsignarParqueaderosModal from '../components/AsignarParqueaderosModal';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'CONTROLADOR';
  createdAt: string;
  updatedAt: string;
}

const UsuariosListView = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'CONTROLADOR' as 'ADMIN' | 'CONTROLADOR'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('todos');

  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      cargarUsuarios();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    filtrarUsuarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarios, searchTerm, filterRol]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      
      // Intentar cargar usuarios desde la API
      try {
        // Utilizar el servicio de usuarios para obtener la lista
        const response = await usuarioService.getAll();
        
        if (response.success && response.usuarios) {
          setUsuarios(response.usuarios);
        } else {
          // Si hay error o no hay datos, usar datos de respaldo
          console.warn('No se pudieron cargar datos reales de usuarios:', response.error);
          fallbackUsuarios();
        }
      } catch (error) {
        console.error('Error al cargar usuarios de la API:', error);
        // Si falla la petición, cargar datos de respaldo
        fallbackUsuarios();
      }
    } catch (error) {
      console.error('Error general al cargar usuarios:', error);
      toast.error('Error cargando usuarios. Usando datos de respaldo.');
      fallbackUsuarios();
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar datos de respaldo en caso de error de la API
  const fallbackUsuarios = () => {
    const usuariosMock: Usuario[] = [
      {
        id: 1,
        nombre: 'Administrador Principal',
        email: 'admin@parqueadero.com',
        rol: 'ADMIN',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: '2024-01-15T00:00:00.000Z'
      },
      {
        id: 2,
        nombre: 'Juan Pérez',
        email: 'juan.perez@parqueadero.com',
        rol: 'CONTROLADOR',
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: '2024-02-01T00:00:00.000Z'
      },
      {
        id: 3,
        nombre: 'María García',
        email: 'maria.garcia@parqueadero.com',
        rol: 'CONTROLADOR',
        createdAt: '2024-02-15T00:00:00.000Z',
        updatedAt: '2024-02-15T00:00:00.000Z'
      }
    ];
    setUsuarios(usuariosMock);
  };

  const filtrarUsuarios = () => {
    let filtered = usuarios;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(usuario => 
        usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por rol
    if (filterRol !== 'todos') {
      filtered = filtered.filter(usuario => usuario.rol === filterRol);
    }

    setFilteredUsuarios(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEdit && selectedUser) {
        // Actualizar usuario existente
        try {
          // Crear objeto con datos a actualizar
          const userData = {
            nombre: formData.nombre,
            email: formData.email,
            rol: formData.rol
          };
          
          // Si hay contraseña nueva, incluirla
          if (formData.password) {
            Object.assign(userData, { password: formData.password });
          }
          
          // Llamar al servicio para actualizar el usuario
          const result = await usuarioService.update(selectedUser.id, userData);
          
          if (result && result.success) {
            // Actualizar la lista local de usuarios
            const usuariosActualizados = usuarios.map(usuario => 
              usuario.id === selectedUser.id 
                ? { ...usuario, nombre: formData.nombre, email: formData.email, rol: formData.rol }
                : usuario
            );
            setUsuarios(usuariosActualizados);
            toast.success('Usuario actualizado exitosamente');
          } else {
            toast.error(result.error || 'Error al actualizar usuario');
          }
        } catch (error) {
          console.error('Error al actualizar usuario:', error);
          
          // Actualización local en caso de error (para demo)
          const usuariosActualizados = usuarios.map(usuario => 
            usuario.id === selectedUser.id 
              ? { ...usuario, nombre: formData.nombre, email: formData.email, rol: formData.rol }
              : usuario
          );
          setUsuarios(usuariosActualizados);
          toast.warning('Modo demostración: Usuario actualizado localmente');
        }
      } else {
        // Crear nuevo usuario
        try {
          const result = await usuarioService.create({
            nombre: formData.nombre,
            email: formData.email,
            password: formData.password,
            rol: formData.rol
          });

          if (result.success) {
            // Si tenemos ID del servidor, usarlo
            const nuevoUsuario: Usuario = {
              id: result.usuario?.id || Date.now(), 
              nombre: formData.nombre,
              email: formData.email,
              rol: formData.rol,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setUsuarios([...usuarios, nuevoUsuario]);
            toast.success('Usuario creado exitosamente');
            
            // Si es un controlador, abrir modal de asignación de parqueaderos
            if (formData.rol === 'CONTROLADOR') {
              resetForm();
              setSelectedUser(nuevoUsuario);
              setShowAsignarModal(true);
              toast.info('Ahora asigna parqueaderos a este controlador');
              return; // No cerrar el modal aún
            }
          } else {
            toast.error(result.error || 'Error al crear usuario');
          }
        } catch (error) {
          console.error('Error al crear usuario:', error);
          
          // Creación local en caso de error (para demo)
          const nuevoUsuario: Usuario = {
            id: Date.now(),
            nombre: formData.nombre,
            email: formData.email,
            rol: formData.rol,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setUsuarios([...usuarios, nuevoUsuario]);
          toast.warning('Modo demostración: Usuario creado localmente');
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error general en el formulario:', error);
      toast.error('Error de conexión');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'CONTROLADOR'
    });
    setShowModal(false);
    setIsEdit(false);
    setSelectedUser(null);
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol
    });
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setShowDeleteModal(true);
  };

  const handleAsignarParqueaderos = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setShowAsignarModal(true);
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        // Llamar al servicio para eliminar el usuario
        const result = await usuarioService.delete(selectedUser.id);
        
        if (result && result.success) {
          const usuariosActualizados = usuarios.filter(usuario => usuario.id !== selectedUser.id);
          setUsuarios(usuariosActualizados);
          toast.success('Usuario eliminado exitosamente');
        } else {
          toast.error(result.error || 'Error al eliminar usuario');
          
          // Eliminación local en caso de error (para demo)
          const usuariosActualizados = usuarios.filter(usuario => usuario.id !== selectedUser.id);
          setUsuarios(usuariosActualizados);
          toast.warning('Modo demostración: Usuario eliminado localmente');
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        
        // Eliminación local en caso de error (para demo)
        const usuariosActualizados = usuarios.filter(usuario => usuario.id !== selectedUser.id);
        setUsuarios(usuariosActualizados);
        toast.warning('Modo demostración: Usuario eliminado localmente');
      } finally {
        setShowDeleteModal(false);
        setSelectedUser(null);
      }
    }
  };



  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const StatusBadge = ({ activo }: { activo: boolean }) => {
    return activo ? (
      <span className="px-2.5 py-0.5 text-xs font-medium rounded border bg-green-100 border-green-300 text-green-700 inline-flex items-center">
        <CheckCircle className="size-3 mr-1.5" />
        Activo
      </span>
    ) : (
      <span className="px-2.5 py-0.5 text-xs font-medium rounded border bg-red-100 border-red-300 text-red-700 inline-flex items-center">
        <X className="size-3 mr-1.5" />
        Inactivo
      </span>
    );
  };

  const RolBadge = ({ rol }: { rol: string }) => {
    return rol === 'ADMIN' ? (
      <span className="px-2.5 py-0.5 text-xs font-medium rounded border bg-blue-100 border-blue-300 text-blue-700">
        Administrador
      </span>
    ) : (
      <span className="px-2.5 py-0.5 text-xs font-medium rounded border bg-gray-100 border-gray-300 text-gray-700">
        Controlador
      </span>
    );
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">Solo los administradores pueden acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra usuarios y controladores del sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 text-black rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{backgroundColor: "var(--park-blue)"}}
        >
          <Plus className="size-4 mr-2" />
          Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterRol}
              onChange={(e) => setFilterRol(e.target.value)}
            >
              <option value="todos">Todos los roles</option>
              <option value="ADMIN">Administradores</option>
              <option value="CONTROLADOR">Controladores</option>
            </select>
            <div className="text-sm text-gray-500 flex items-center">
              Total: {filteredUsuarios.length} usuarios
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsuarios.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {usuario.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RolBadge rol={usuario.rol} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(usuario.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <div className="flex space-x-2">
                          {usuario.rol === 'CONTROLADOR' && (
                            <button
                              onClick={() => handleAsignarParqueaderos(usuario)}
                              className="text-green-600 hover:text-green-900"
                              title="Asignar parqueaderos"
                            >
                              <Building2 className="size-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar usuario"
                          >
                            <FileEdit className="size-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(usuario)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={resetForm}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg p-6 w-full max-w-md pointer-events-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre del usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@ejemplo.com"
                />
              </div>

              {!isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required={!isEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Contraseña segura"
                    minLength={6}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'ADMIN' | 'CONTROLADOR' })}
                >
                  <option value="CONTROLADOR">Controlador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isEdit ? 'Actualizar' : 'Crear'} Usuario
                </button>
              </div>
            </form>
            </div>
          </div>
        </>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && selectedUser && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowDeleteModal(false)}></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg p-6 w-full max-w-md pointer-events-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser.nombre}</strong>? 
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Eliminar
              </button>
            </div>
            </div>
          </div>
        </>
      )}

      {/* Modal para asignar parqueaderos */}
      <AsignarParqueaderosModal
        show={showAsignarModal}
        onHide={() => setShowAsignarModal(false)}
        usuario={selectedUser}
        onSuccess={() => {
          toast.success('Parqueaderos asignados correctamente');
          cargarUsuarios();
        }}
      />
    </div>
  );
};

export default UsuariosListView;