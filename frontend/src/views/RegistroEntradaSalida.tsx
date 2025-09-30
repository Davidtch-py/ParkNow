import React, { useState, useEffect } from 'react';
import { Car, Clock, User, MapPin, LogIn, LogOut, Search, Plus, Calendar, CheckCircle, X } from 'lucide-react';
import { entradaService, salidaService, parqueaderoService } from '../services/index';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface Vehiculo {
  id: number;
  placa: string;
  tipo: 'carro' | 'moto' | 'bicicleta';
  propietario: string;
  telefono?: string;
}

interface Parqueadero {
  id: number;
  nombre: string;
  capacidadTotal: number;
  capacidadDisponible: number;
}

interface EntradaActiva {
  id: number;
  vehiculoId: number;
  placa: string;
  tipoVehiculo: string;
  propietario: string;
  parqueaderoId: number;
  nombreParqueadero: string;
  espacioAsignado: string;
  fechaHoraEntrada: string;
  controlador: string;
}

const RegistroEntradaSalida = () => {
  const [activeTab, setActiveTab] = useState<'entrada' | 'salida'>('entrada');
  const [parqueaderos, setParqueaderos] = useState<Parqueadero[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [entradasActivas, setEntradasActivas] = useState<EntradaActiva[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchVehicle, setSearchVehicle] = useState('');
  const [filteredVehiculos, setFilteredVehiculos] = useState<Vehiculo[]>([]);

  const { user } = useAuth();

  // Estados para formulario de entrada
  const [formEntrada, setFormEntrada] = useState({
    vehiculoId: '',
    parqueaderoId: '',
    espacioAsignado: '',
    observaciones: ''
  });

  // Estados para formulario de salida
  const [selectedEntrada, setSelectedEntrada] = useState<EntradaActiva | null>(null);
  const [observacionesSalida, setObservacionesSalida] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (activeTab === 'salida') {
      cargarEntradasActivas();
    }
  }, [activeTab]);

  useEffect(() => {
    // Filtrar vehículos basado en la búsqueda
    if (searchVehicle) {
      const filtered = vehiculos.filter(vehiculo => 
        vehiculo.placa.toLowerCase().includes(searchVehicle.toLowerCase()) ||
        vehiculo.propietario.toLowerCase().includes(searchVehicle.toLowerCase())
      );
      setFilteredVehiculos(filtered);
    } else {
      setFilteredVehiculos(vehiculos);
    }
  }, [searchVehicle, vehiculos]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar parqueaderos
      const parqueaderosResult = await parqueaderoService.getAll();
      if (parqueaderosResult.success) {
        setParqueaderos(parqueaderosResult.parqueaderos);
      }

      // Simular carga de vehículos (en producción vendría de vehiculoService)
      const vehiculosMock: Vehiculo[] = [
        { id: 1, placa: 'ABC123', tipo: 'carro', propietario: 'Juan Pérez', telefono: '3001234567' },
        { id: 2, placa: 'XYZ789', tipo: 'moto', propietario: 'María García' },
        { id: 3, placa: 'DEF456', tipo: 'carro', propietario: 'Carlos López', telefono: '3009876543' },
        { id: 4, placa: 'GHI012', tipo: 'bicicleta', propietario: 'Ana Martínez' },
        { id: 5, placa: 'JKL345', tipo: 'moto', propietario: 'Luis Rodriguez', telefono: '3007654321' }
      ];
      setVehiculos(vehiculosMock);
      setFilteredVehiculos(vehiculosMock);

    } catch (error) {
      toast.error('Error cargando datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const cargarEntradasActivas = async () => {
    try {
      // Simular carga de entradas activas
      const entradasMock: EntradaActiva[] = [
        {
          id: 1,
          vehiculoId: 1,
          placa: 'ABC123',
          tipoVehiculo: 'carro',
          propietario: 'Juan Pérez',
          parqueaderoId: 1,
          nombreParqueadero: 'Parqueadero Central',
          espacioAsignado: 'A-15',
          fechaHoraEntrada: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // hace 2 horas
          controlador: user?.nombre || 'Sistema'
        },
        {
          id: 2,
          vehiculoId: 3,
          placa: 'DEF456',
          tipoVehiculo: 'carro',
          propietario: 'Carlos López',
          parqueaderoId: 2,
          nombreParqueadero: 'Plaza Norte',
          espacioAsignado: 'B-08',
          fechaHoraEntrada: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // hace 45 minutos
          controlador: 'María García'
        }
      ];
      setEntradasActivas(entradasMock);
    } catch (error) {
      toast.error('Error cargando entradas activas');
    }
  };

  const handleRegistrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formEntrada.vehiculoId || !formEntrada.parqueaderoId) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);
      
      const vehiculo = vehiculos.find(v => v.id === parseInt(formEntrada.vehiculoId));
      const parqueadero = parqueaderos.find(p => p.id === parseInt(formEntrada.parqueaderoId));

      if (!vehiculo || !parqueadero) {
        toast.error('Vehículo o parqueadero no encontrado');
        return;
      }

      if (parqueadero.capacidadDisponible <= 0) {
        toast.error('El parqueadero no tiene espacios disponibles');
        return;
      }

      const entradaData = {
        vehiculoId: parseInt(formEntrada.vehiculoId),
        parqueaderoId: parseInt(formEntrada.parqueaderoId),
        espacioAsignado: formEntrada.espacioAsignado || `AUTO-${Date.now()}`,
        observaciones: formEntrada.observaciones
      };

      const result = await entradaService.registrar(entradaData);
      
      if (result.success) {
        toast.success(`Entrada registrada exitosamente para ${vehiculo.placa}`);
        
        // Resetear formulario
        setFormEntrada({
          vehiculoId: '',
          parqueaderoId: '',
          espacioAsignado: '',
          observaciones: ''
        });
        
        // Recargar datos
        cargarDatos();
      } else {
        toast.error(result.error || 'Error al registrar entrada');
      }

    } catch (error) {
      toast.error('Error de conexión al registrar entrada');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarSalida = async (entrada: EntradaActiva) => {
    try {
      setLoading(true);
      
      const salidaData = {
        entradaId: entrada.id,
        observaciones: observacionesSalida
      };

      const result = await salidaService.registrar(salidaData);
      
      if (result.success) {
        toast.success(`Salida registrada exitosamente para ${entrada.placa}`);
        
        // Remover de entradas activas
        setEntradasActivas(entradasActivas.filter(e => e.id !== entrada.id));
        setSelectedEntrada(null);
        setObservacionesSalida('');
        
        // Recargar datos
        cargarDatos();
      } else {
        toast.error(result.error || 'Error al registrar salida');
      }

    } catch (error) {
      toast.error('Error de conexión al registrar salida');
    } finally {
      setLoading(false);
    }
  };

  const getTipoVehiculoIcon = (tipo: string) => {
    switch (tipo) {
      case 'carro':
        return <Car className="h-5 w-5 text-blue-600" />;
      case 'moto':
        return <Car className="h-5 w-5 text-green-600" />; // En un proyecto real usarías un ícono de moto
      case 'bicicleta':
        return <Car className="h-5 w-5 text-orange-600" />; // En un proyecto real usarías un ícono de bicicleta
      default:
        return <Car className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTipoVehiculoColor = (tipo: string) => {
    switch (tipo) {
      case 'carro':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'moto':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'bicicleta':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const calcularTiempoEstacionado = (fechaEntrada: string) => {
    const entrada = new Date(fechaEntrada);
    const ahora = new Date();
    const diferencia = ahora.getTime() - entrada.getTime();
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    } else {
      return `${minutos}m`;
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registro de Entrada y Salida</h1>
        <p className="text-gray-600">Gestiona el ingreso y salida de vehículos</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('entrada')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'entrada'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <LogIn className="inline-block h-4 w-4 mr-2" />
              Registrar Entrada
            </button>
            <button
              onClick={() => setActiveTab('salida')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'salida'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <LogOut className="inline-block h-4 w-4 mr-2" />
              Registrar Salida
            </button>
          </nav>
        </div>
      </div>

      {/* Contenido por Tab */}
      {activeTab === 'entrada' ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Formulario de Entrada */}
          <div className="xl:col-span-8">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Registrar Nueva Entrada</h3>
              </div>
              
              <form onSubmit={handleRegistrarEntrada} className="p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Búsqueda de Vehículo */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar Vehículo por Placa o Propietario
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Escribe la placa o nombre del propietario..."
                        value={searchVehicle}
                        onChange={(e) => setSearchVehicle(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Selección de Vehículo */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehículo <span className="text-red-500">*</span>
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md">
                      {filteredVehiculos.length > 0 ? (
                        filteredVehiculos.map((vehiculo) => (
                          <div
                            key={vehiculo.id}
                            className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                              formEntrada.vehiculoId === vehiculo.id.toString() ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => setFormEntrada({...formEntrada, vehiculoId: vehiculo.id.toString()})}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {getTipoVehiculoIcon(vehiculo.tipo)}
                                <div>
                                  <div className="font-medium text-gray-900">{vehiculo.placa}</div>
                                  <div className="text-sm text-gray-500">{vehiculo.propietario}</div>
                                  {vehiculo.telefono && (
                                    <div className="text-xs text-gray-400">{vehiculo.telefono}</div>
                                  )}
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTipoVehiculoColor(vehiculo.tipo)}`}>
                                {vehiculo.tipo}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No se encontraron vehículos
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Parqueadero */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parqueadero <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formEntrada.parqueaderoId}
                      onChange={(e) => setFormEntrada({...formEntrada, parqueaderoId: e.target.value})}
                    >
                      <option value="">Selecciona un parqueadero</option>
                      {parqueaderos.map((parqueadero) => (
                        <option key={parqueadero.id} value={parqueadero.id}>
                          {parqueadero.nombre} - {parqueadero.capacidadDisponible} espacios disponibles
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Espacio Asignado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Espacio Asignado (opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: A-15, B-08, etc."
                      value={formEntrada.espacioAsignado}
                      onChange={(e) => setFormEntrada({...formEntrada, espacioAsignado: e.target.value})}
                    />
                    <p className="mt-1 text-sm text-gray-500">Si no especificas, se asignará automáticamente</p>
                  </div>

                  {/* Observaciones */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Observaciones adicionales..."
                      value={formEntrada.observaciones}
                      onChange={(e) => setFormEntrada({...formEntrada, observaciones: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <LogIn className="h-4 w-4 mr-2" />
                    )}
                    Registrar Entrada
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Panel de Información */}
          <div className="xl:col-span-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">Controlador</div>
                    <div className="text-sm text-gray-500">{user?.nombre || 'Sistema'}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm font-medium">Fecha y Hora</div>
                    <div className="text-sm text-gray-500">{new Date().toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <div>
                    <div className="text-sm font-medium">Total Parqueaderos</div>
                    <div className="text-sm text-gray-500">{parqueaderos.length} disponibles</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tab de Salida */
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Vehículos Actualmente Estacionados</h3>
            <p className="text-sm text-gray-600 mt-1">Selecciona un vehículo para registrar su salida</p>
          </div>
          
          <div className="p-6">
            {entradasActivas.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {entradasActivas.map((entrada) => (
                  <div
                    key={entrada.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEntrada(entrada)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getTipoVehiculoIcon(entrada.tipoVehiculo)}
                        <div>
                          <div className="font-medium text-gray-900">{entrada.placa}</div>
                          <div className="text-sm text-gray-500">{entrada.propietario}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTipoVehiculoColor(entrada.tipoVehiculo)}`}>
                        {entrada.tipoVehiculo}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Parqueadero:</span>
                        <span className="font-medium">{entrada.nombreParqueadero}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Espacio:</span>
                        <span className="font-medium">{entrada.espacioAsignado}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tiempo:</span>
                        <span className="font-medium text-blue-600">
                          {calcularTiempoEstacionado(entrada.fechaHoraEntrada)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Entrada:</span>
                        <span className="font-medium">
                          {new Date(entrada.fechaHoraEntrada).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay vehículos estacionados</h3>
                <p className="text-gray-500">Todos los espacios están libres actualmente</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Salida */}
      {selectedEntrada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Salida
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-3 mb-2">
                {getTipoVehiculoIcon(selectedEntrada.tipoVehiculo)}
                <div>
                  <div className="font-medium">{selectedEntrada.placa}</div>
                  <div className="text-sm text-gray-500">{selectedEntrada.propietario}</div>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <div><strong>Parqueadero:</strong> {selectedEntrada.nombreParqueadero}</div>
                <div><strong>Espacio:</strong> {selectedEntrada.espacioAsignado}</div>
                <div><strong>Tiempo estacionado:</strong> {calcularTiempoEstacionado(selectedEntrada.fechaHoraEntrada)}</div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones de Salida
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observaciones adicionales para la salida..."
                value={observacionesSalida}
                onChange={(e) => setObservacionesSalida(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedEntrada(null);
                  setObservacionesSalida('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleRegistrarSalida(selectedEntrada)}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Confirmar Salida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroEntradaSalida;