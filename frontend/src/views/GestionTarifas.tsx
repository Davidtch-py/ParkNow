import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Pencil, 
  Check, 
  DollarSign, 
  Car,
  Save,
  X,
  TrendingUp
} from 'lucide-react';
import CountUp from 'react-countup';
import { tarifaService, parqueaderoService } from '../services/index';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface Tarifa {
  id: number;
  parqueaderoId?: number;
  parqueaderoNombre?: string;
  tipoVehiculo: 'carro' | 'moto' | 'bicicleta';
  tipoTarifa: 'por_hora' | 'tarifa_plana' | 'fraccionada';
  valor: number;
  tiempoMinimo?: number; // en minutos
  descripcion?: string;
  activa: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

interface EstadisticasTarifas {
  totalTarifas: number;
  tarifasActivas: number;
  promedioTarifaCarros: number;
  ingresosDiarios: number;
}

const GestionTarifas = () => {
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [tarifasFiltradas, setTarifasFiltradas] = useState<Tarifa[]>([]);
  const [parqueaderos, setParqueaderos] = useState<any[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasTarifas>({
    totalTarifas: 0,
    tarifasActivas: 0,
    promedioTarifaCarros: 0,
    ingresosDiarios: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tarifaEditando, setTarifaEditando] = useState<Tarifa | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroParqueadero, setFiltroParqueadero] = useState('');

  // const { user } = useAuth();

  const [formTarifa, setFormTarifa] = useState({
    parqueaderoId: '',
    tipoVehiculo: 'carro' as 'carro' | 'moto' | 'bicicleta',
    tipoTarifa: 'por_hora' as 'por_hora' | 'tarifa_plana' | 'fraccionada',
    valor: '',
    tiempoMinimo: '',
    descripcion: '',
    activa: true
  });

  const aplicarFiltros = useCallback(() => {
    let resultado = tarifas;

    if (busqueda) {
      resultado = resultado.filter(t => 
        t.parqueaderoNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        t.tipoVehiculo.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroTipo !== 'todos') {
      resultado = resultado.filter(t => t.tipoVehiculo === filtroTipo);
    }

    if (filtroParqueadero !== 'todos') {
      resultado = resultado.filter(t => t.parqueaderoId === parseInt(filtroParqueadero));
    }

    setTarifasFiltradas(resultado);
  }, [tarifas, busqueda, filtroTipo, filtroParqueadero]);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar parqueaderos
      const parqueaderosResult = await parqueaderoService.getAll();
      if (parqueaderosResult.success) {
        setParqueaderos(parqueaderosResult.parqueaderos);
      }

      // Simular carga de tarifas
      const tarifasMock: Tarifa[] = [
        {
          id: 1,
          parqueaderoId: 1,
          parqueaderoNombre: 'Parqueadero Central',
          tipoVehiculo: 'carro',
          tipoTarifa: 'por_hora',
          valor: 3000,
          tiempoMinimo: 30,
          descripcion: 'Tarifa estándar para carros por hora',
          activa: true,
          fechaCreacion: '2024-01-01T00:00:00Z',
          fechaActualizacion: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          parqueaderoId: 1,
          parqueaderoNombre: 'Parqueadero Central',
          tipoVehiculo: 'moto',
          tipoTarifa: 'por_hora',
          valor: 1500,
          tiempoMinimo: 30,
          descripcion: 'Tarifa estándar para motos por hora',
          activa: true,
          fechaCreacion: '2024-01-01T00:00:00Z',
          fechaActualizacion: '2024-01-15T10:30:00Z'
        },
        {
          id: 3,
          parqueaderoId: 2,
          parqueaderoNombre: 'Plaza Norte',
          tipoVehiculo: 'carro',
          tipoTarifa: 'tarifa_plana',
          valor: 8000,
          descripcion: 'Tarifa plana diaria para carros',
          activa: true,
          fechaCreacion: '2024-01-02T00:00:00Z',
          fechaActualizacion: '2024-01-10T15:20:00Z'
        },
        {
          id: 4,
          parqueaderoId: 2,
          parqueaderoNombre: 'Plaza Norte',
          tipoVehiculo: 'bicicleta',
          tipoTarifa: 'tarifa_plana',
          valor: 2000,
          descripcion: 'Tarifa plana diaria para bicicletas',
          activa: true,
          fechaCreacion: '2024-01-02T00:00:00Z',
          fechaActualizacion: '2024-01-08T09:45:00Z'
        },
        {
          id: 5,
          parqueaderoId: 3,
          parqueaderoNombre: 'Centro Comercial Sur',
          tipoVehiculo: 'carro',
          tipoTarifa: 'fraccionada',
          valor: 2500,
          tiempoMinimo: 15,
          descripcion: 'Tarifa fraccionada cada 15 minutos',
          activa: false, // Tarifa inactiva
          fechaCreacion: '2024-01-05T00:00:00Z',
          fechaActualizacion: '2024-01-12T14:10:00Z'
        }
      ];

      setTarifas(tarifasMock);

      // Calcular estadísticas
      const stats: EstadisticasTarifas = {
        totalTarifas: tarifasMock.length,
        tarifasActivas: tarifasMock.filter(t => t.activa).length,
        promedioTarifaCarros: Math.round(
          tarifasMock
            .filter(t => t.tipoVehiculo === 'carro' && t.activa)
            .reduce((sum, t) => sum + t.valor, 0) / 
          tarifasMock.filter(t => t.tipoVehiculo === 'carro' && t.activa).length
        ),
        ingresosDiarios: 2450000 // Simulado
      };
      setEstadisticas(stats);

    } catch (error) {
      toast.error('Error cargando datos de tarifas');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrear = () => {
    setTarifaEditando(null);
    setFormTarifa({
      parqueaderoId: '',
      tipoVehiculo: 'carro',
      tipoTarifa: 'por_hora',
      valor: '',
      tiempoMinimo: '',
      descripcion: '',
      activa: true
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (tarifa: Tarifa) => {
    setTarifaEditando(tarifa);
    setFormTarifa({
      parqueaderoId: tarifa.parqueaderoId?.toString() || '',
      tipoVehiculo: tarifa.tipoVehiculo,
      tipoTarifa: tarifa.tipoTarifa,
      valor: tarifa.valor.toString(),
      tiempoMinimo: tarifa.tiempoMinimo?.toString() || '',
      descripcion: tarifa.descripcion || '',
      activa: tarifa.activa
    });
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setTarifaEditando(null);
    setFormTarifa({
      parqueaderoId: '',
      tipoVehiculo: 'carro',
      tipoTarifa: 'por_hora',
      valor: '',
      tiempoMinimo: '',
      descripcion: '',
      activa: true
    });
  };

  const guardarTarifa = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTarifa.valor || !formTarifa.parqueaderoId) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      setLoading(true);

      const tarifaData = {
        parqueaderoId: parseInt(formTarifa.parqueaderoId),
        tipoVehiculo: formTarifa.tipoVehiculo,
        tipoTarifa: formTarifa.tipoTarifa,
        valor: parseInt(formTarifa.valor),
        tiempoMinimo: formTarifa.tiempoMinimo ? parseInt(formTarifa.tiempoMinimo) : undefined,
        descripcion: formTarifa.descripcion,
        activa: formTarifa.activa
      };

      if (tarifaEditando) {
        // Actualizar tarifa existente
        const result = await tarifaService.update(tarifaEditando.id, tarifaData);
        if (result.success) {
          toast.success('Tarifa actualizada exitosamente');
        } else {
          toast.error('Error al actualizar tarifa');
        }
      } else {
        // Crear nueva tarifa
        const result = await tarifaService.create(tarifaData);
        if (result.success) {
          toast.success('Tarifa creada exitosamente');
        } else {
          toast.error('Error al crear tarifa');
        }
      }

      cerrarModal();
      cargarDatos();

    } catch (error) {
      toast.error('Error de conexión al guardar tarifa');
    } finally {
      setLoading(false);
    }
  };

  const toggleEstadoTarifa = async (tarifa: Tarifa) => {
    try {
      const nuevoEstado = !tarifa.activa;
      const result = await tarifaService.toggleEstado(tarifa.id, nuevoEstado);
      
      if (result.success) {
        toast.success(`Tarifa ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`);
        cargarDatos();
      } else {
        toast.error('Error al cambiar estado de la tarifa');
      }
    } catch (error) {
      toast.error('Error de conexión al cambiar estado');
    }
  };

  const eliminarTarifa = async (tarifa: Tarifa) => {
    if (!window.confirm(`¿Estás seguro de eliminar la tarifa para ${tarifa.tipoVehiculo} en ${tarifa.parqueaderoNombre}?`)) {
      return;
    }

    try {
      const result = await tarifaService.delete(tarifa.id);
      
      if (result.success) {
        toast.success('Tarifa eliminada exitosamente');
        cargarDatos();
      } else {
        toast.error('Error al eliminar tarifa');
      }
    } catch (error) {
      toast.error('Error de conexión al eliminar tarifa');
    }
  };

  const getTipoVehiculoIcon = (tipo: string) => {
    return <Car className="h-4 w-4" />; // En producción usarías íconos específicos
  };

  const getTipoVehiculoColor = (tipo: string) => {
    switch (tipo) {
      case 'carro':
        return 'bg-blue-100 text-blue-800';
      case 'moto':
        return 'bg-green-100 text-green-800';
      case 'bicicleta':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoTarifaColor = (tipo: string) => {
    switch (tipo) {
      case 'por_hora':
        return 'bg-purple-100 text-purple-800';
      case 'tarifa_plana':
        return 'bg-indigo-100 text-indigo-800';
      case 'fraccionada':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading && tarifas.length === 0) {
    return (
      <div className="container-fluid">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Tarifas</h1>
        <p className="text-gray-600">Configura las tarifas por tipo de vehículo y parqueadero</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-md">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                <CountUp end={estadisticas.totalTarifas} duration={2} />
              </h3>
              <p className="text-gray-600">Total Tarifas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-md">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                <CountUp end={estadisticas.tarifasActivas} duration={2} />
              </h3>
              <p className="text-gray-600">Tarifas Activas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-md">
              <Car className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(estadisticas.promedioTarifaCarros)}
              </h3>
              <p className="text-gray-600">Promedio Carros</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-md">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(estadisticas.ingresosDiarios)}
              </h3>
              <p className="text-gray-600">Ingresos Diarios</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y botón crear */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar tarifas..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos los tipos</option>
                <option value="carro">Carros</option>
                <option value="moto">Motos</option>
                <option value="bicicleta">Bicicletas</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtroParqueadero}
                onChange={(e) => setFiltroParqueadero(e.target.value)}
              >
                <option value="">Todos los parqueaderos</option>
                {parqueaderos.map((parqueadero) => (
                  <option key={parqueadero.id} value={parqueadero.id}>
                    {parqueadero.nombre}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={abrirModalCrear}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Tarifa
            </button>
          </div>
        </div>
      </div>

      {/* Lista de tarifas */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Tarifas Configuradas ({tarifasFiltradas.length})
          </h3>
        </div>

        {tarifasFiltradas.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {tarifasFiltradas.map((tarifa) => (
              <div key={tarifa.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {getTipoVehiculoIcon(tarifa.tipoVehiculo)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoVehiculoColor(tarifa.tipoVehiculo)}`}>
                          {tarifa.tipoVehiculo}
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoTarifaColor(tarifa.tipoTarifa)}`}>
                        {tarifa.tipoTarifa.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                        tarifa.activa ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {tarifa.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-500">Parqueadero</div>
                        <div className="font-medium">{tarifa.parqueaderoNombre}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Valor</div>
                        <div className="font-medium text-green-600">{formatCurrency(tarifa.valor)}</div>
                      </div>
                      {tarifa.tiempoMinimo && (
                        <div>
                          <div className="text-sm text-gray-500">Tiempo Mínimo</div>
                          <div className="font-medium">{tarifa.tiempoMinimo} minutos</div>
                        </div>
                      )}
                    </div>

                    {tarifa.descripcion && (
                      <p className="text-sm text-gray-600 mb-2">{tarifa.descripcion}</p>
                    )}

                    <div className="text-xs text-gray-500">
                      Actualizada: {new Date(tarifa.fechaActualizacion).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => abrirModalEditar(tarifa)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleEstadoTarifa(tarifa)}
                      className={`p-2 rounded-md transition-colors ${
                        tarifa.activa 
                          ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={tarifa.activa ? 'Desactivar' : 'Activar'}
                    >
                      {tarifa.activa ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => eliminarTarifa(tarifa)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tarifas configuradas</h3>
            <p className="text-gray-500">Crea tu primera tarifa para comenzar</p>
          </div>
        )}
      </div>

      {/* Modal de crear/editar tarifa */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {tarifaEditando ? 'Editar Tarifa' : 'Nueva Tarifa'}
            </h3>

            <form onSubmit={guardarTarifa} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parqueadero <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formTarifa.parqueaderoId}
                  onChange={(e) => setFormTarifa({...formTarifa, parqueaderoId: e.target.value})}
                >
                  <option value="">Selecciona un parqueadero</option>
                  {parqueaderos.map((parqueadero) => (
                    <option key={parqueadero.id} value={parqueadero.id}>
                      {parqueadero.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Vehículo <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formTarifa.tipoVehiculo}
                  onChange={(e) => setFormTarifa({...formTarifa, tipoVehiculo: e.target.value as 'carro' | 'moto' | 'bicicleta'})}
                >
                  <option value="carro">Carro</option>
                  <option value="moto">Moto</option>
                  <option value="bicicleta">Bicicleta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Tarifa <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formTarifa.tipoTarifa}
                  onChange={(e) => setFormTarifa({...formTarifa, tipoTarifa: e.target.value as 'por_hora' | 'tarifa_plana' | 'fraccionada'})}
                >
                  <option value="por_hora">Por Hora</option>
                  <option value="tarifa_plana">Tarifa Plana</option>
                  <option value="fraccionada">Fraccionada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (COP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 3000"
                  value={formTarifa.valor}
                  onChange={(e) => setFormTarifa({...formTarifa, valor: e.target.value})}
                />
              </div>

              {(formTarifa.tipoTarifa === 'por_hora' || formTarifa.tipoTarifa === 'fraccionada') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo Mínimo (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 30"
                    value={formTarifa.tiempoMinimo}
                    onChange={(e) => setFormTarifa({...formTarifa, tiempoMinimo: e.target.value})}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción opcional de la tarifa"
                  value={formTarifa.descripcion}
                  onChange={(e) => setFormTarifa({...formTarifa, descripcion: e.target.value})}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activa"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formTarifa.activa}
                  onChange={(e) => setFormTarifa({...formTarifa, activa: e.target.checked})}
                />
                <label htmlFor="activa" className="ml-2 block text-sm text-gray-900">
                  Tarifa activa
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {tarifaEditando ? 'Actualizar' : 'Crear'} Tarifa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionTarifas;