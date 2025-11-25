import React, { useState, useEffect, useCallback } from 'react';
<<<<<<< Updated upstream
import { Car, Clock, User, MapPin, LogIn, LogOut, Search } from 'lucide-react';
import { entradaService, salidaService, parqueaderoService } from '../services/index';
=======
import { Car, Clock, User, MapPin, LogIn, LogOut, Search, Bike } from 'lucide-react';
import { entradaService, salidaService, parqueaderoService, vehiculoService, tarifaService } from '../services/index';
>>>>>>> Stashed changes
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

  const cargarEntradasActivas = useCallback(async () => {
    try {
<<<<<<< Updated upstream
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
          fechaHoraEntrada: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          controlador: 'Sistema'
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
          fechaHoraEntrada: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          controlador: 'María García'
=======
      setLoading(true);

      console.log('🔍 Cargando entradas activas...');
      console.log('📍 ParqueaderoId seleccionado:', formEntrada.parqueaderoId);

      // Si hay un parqueadero seleccionado, cargar sus entradas activas
      if (formEntrada.parqueaderoId) {
        console.log('📡 Llamando a API: /entradas/parqueadero/' + formEntrada.parqueaderoId + '/activas');
        const response = await entradaService.getActivas(formEntrada.parqueaderoId);

        console.log('📥 Respuesta de API completa:', response);
        console.log('📥 Response.success:', response.success);
        console.log('📥 Response.entradas:', response.entradas);
        console.log('📥 Número de entradas:', response.entradas?.length);

        if (response.success && response.entradas) {
          console.log('📊 Entradas encontradas en BD:', response.entradas.length);
          console.log('📋 Datos crudos de entradas:', JSON.stringify(response.entradas, null, 2));

          // Mapear las entradas desde la estructura de la BD (tabla registros)
          const entradasFormateadas: EntradaActiva[] = response.entradas.map((entrada: any) => {
            console.log('🔄 Mapeando entrada:', entrada);
            console.log('   - id:', entrada.id);
            console.log('   - id_espacio:', entrada.id_espacio);
            console.log('   - espacio?.parqueadero?.id:', entrada.espacio?.parqueadero?.id);
            console.log('   - vehiculo?.placa:', entrada.vehiculo?.placa);

            return {
              id: entrada.id,
              vehiculoId: entrada.id_vehiculo || entrada.vehiculoId,
              placa: entrada.vehiculo?.placa || entrada.Vehiculo?.placa || 'N/A',
              tipoVehiculo: entrada.vehiculo?.tipo || entrada.Vehiculo?.tipo || 'N/A',
              propietario: entrada.vehiculo?.propietario || entrada.Vehiculo?.propietario || 'N/A',
              parqueaderoId: entrada.espacio?.parqueadero?.id || entrada.parqueaderoId || 0,
              nombreParqueadero: entrada.espacio?.parqueadero?.nombre || entrada.Parqueadero?.nombre || 'N/A',
              espacioAsignado: entrada.id_espacio ? `Espacio ${entrada.id_espacio}` : 'Sin asignar',
              fechaHoraEntrada: entrada.fecha_ingreso || entrada.fechaHoraEntrada,
              controlador: entrada.controlador?.nombre || entrada.Usuario?.nombre || 'N/A'
            };
          });

          console.log('✅ Entradas formateadas:', entradasFormateadas);
          console.log('✅ Cantidad de entradas formateadas:', entradasFormateadas.length);
          setEntradasActivas(entradasFormateadas);
          console.log('✅ Entradas activas cargadas:', entradasFormateadas.length);
        } else {
          console.log('⚠️ No se encontraron entradas o success=false');
          console.log('⚠️ Response:', response);
          setEntradasActivas([]);
>>>>>>> Stashed changes
        }
      ];
      setEntradasActivas(entradasMock);
    } catch (error) {
      toast.error('Error cargando entradas activas');
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'salida') {
      cargarEntradasActivas();
    }
  }, [activeTab, cargarEntradasActivas]);

<<<<<<< Updated upstream
=======
  // Recargar entradas activas cuando cambie el parqueadero seleccionado
  useEffect(() => {
    if (activeTab === 'salida') {
      cargarEntradasActivas();
    }
  }, [formEntrada.parqueaderoId, activeTab, cargarEntradasActivas]);

>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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

=======
      // Cargar vehículos desde la base de datos
      const vehiculosResult = await vehiculoService.getAll();
      if (vehiculosResult.success) {
        setVehiculos(vehiculosResult.vehiculos);
        setFilteredVehiculos(vehiculosResult.vehiculos);
      } else {
        console.error('Error cargando vehículos:', vehiculosResult.error);
        toast.error('Error cargando vehículos');
        setVehiculos([]);
        setFilteredVehiculos([]);
      }

      // Cargar entradas activas si hay parqueadero seleccionado
      if (formEntrada.parqueaderoId) {
        await cargarEntradasActivas();
      }
>>>>>>> Stashed changes
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error cargando datos iniciales');
    } finally {
      setLoading(false);
    }
<<<<<<< Updated upstream
  };
=======
  }, [cargarEntradasActivas, formEntrada.parqueaderoId]);

  useEffect(() => {
    cargarDatos();

    // Escuchar evento de actualización del dashboard
    const handleRefresh = () => {
      console.log('🔄 Evento refreshDashboard recibido en RegistroEntradaSalida');
      cargarDatos();
    };

    window.addEventListener('refreshDashboard', handleRefresh);

    return () => {
      window.removeEventListener('refreshDashboard', handleRefresh);
    };
  }, [cargarDatos]);
>>>>>>> Stashed changes

  const handleRegistrarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulario
    if (!formEntrada.vehiculoId || !formEntrada.parqueaderoId) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    try {
      setLoading(true);

      const entradaData = {
        vehiculoId: parseInt(formEntrada.vehiculoId),
        parqueaderoId: parseInt(formEntrada.parqueaderoId),
        espacioAsignado: formEntrada.espacioAsignado,
        observaciones: formEntrada.observaciones
      };

      const result = await entradaService.registrar(entradaData);

      if (result.success) {
        toast.success('Entrada registrada exitosamente');

        // Limpiar formulario
        setFormEntrada({
          vehiculoId: '',
          parqueaderoId: formEntrada.parqueaderoId, // Mantener el parqueadero seleccionado
          espacioAsignado: '',
          observaciones: ''
        });
<<<<<<< Updated upstream
        
        // Recargar datos
        cargarDatos();
=======
        setSearchVehicle('');

        // Notificar al dashboard para que se actualice en tiempo real
        if ((window as any).refreshDashboard) {
          (window as any).refreshDashboard();
        }

        // También emitir un evento personalizado
        window.dispatchEvent(new CustomEvent('refreshDashboard'));
>>>>>>> Stashed changes
      } else {
        toast.error(result.error || 'Error al registrar entrada');
      }

    } catch (error) {
<<<<<<< Updated upstream
      toast.error('Error de conexión al registrar entrada');
=======
      toast.warn('El vehiculo ya tiene una entrada activa');
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarSalida = async (entrada: EntradaActiva) => {
    try {
      setLoading(true);
<<<<<<< Updated upstream
      
=======

      console.log('🚀 Calculando costo de salida...');

      const parqueaderoId = formEntrada.parqueaderoId || entrada.parqueaderoId;

      if (!parqueaderoId) {
        toast.error('Debe seleccionar un parqueadero');
        setLoading(false);
        return;
      }

      // Calcular costo
      const resultadoCosto = await tarifaService.calcularCosto(
        parqueaderoId,
        entrada.tipoVehiculo,
        new Date(entrada.fechaHoraEntrada),
        new Date()
      );

      if (resultadoCosto.success) {
        // Mostrar recibo
        setDatosRecibo({
          entrada,
          parqueaderoId,
          costo: resultadoCosto.costo,
          recibo: resultadoCosto.recibo
        });
        setMostrarRecibo(true);
        setLoading(false);
      } else {
        toast.error(resultadoCosto.error || 'Error calculando costo');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      toast.error('Error de conexión al calcular costo');
      setLoading(false);
    }
  };

  const handleConfirmarPago = async () => {
    try {
      setLoading(true);

      if (!datosRecibo) {
        toast.error('Datos del recibo no disponibles');
        setLoading(false);
        return;
      }

>>>>>>> Stashed changes
      const salidaData = {
        entradaId: entrada.id,
        observaciones: observacionesSalida
      };

      const result = await salidaService.registrar(salidaData);

      if (result.success) {
<<<<<<< Updated upstream
        toast.success(`Salida registrada exitosamente para ${entrada.placa}`);
        
=======
        toast.success(`Salida registrada exitosamente para ${datosRecibo.entrada.placa}`);

>>>>>>> Stashed changes
        // Remover de entradas activas
        setEntradasActivas(entradasActivas.filter(e => e.id !== entrada.id));
        setSelectedEntrada(null);
        setObservacionesSalida('');
<<<<<<< Updated upstream
        
        // Recargar datos
        cargarDatos();
=======
        setMostrarRecibo(false);
        setDatosRecibo(null);

        // Recargar datos
        cargarDatos();

        // Notificar al dashboard
        if ((window as any).refreshDashboard) {
          (window as any).refreshDashboard();
        }
        window.dispatchEvent(new CustomEvent('refreshDashboard'));
>>>>>>> Stashed changes
      } else {
        toast.error(result.error || 'Error al registrar salida');
      }

    } catch (error) {
      toast.error('Error de conexión al registrar salida');
    } finally {
      setLoading(false);
    }
  };

<<<<<<< Updated upstream
=======
  const handleRegistrarNuevoVehiculo = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulario completo
    const validacion = validaciones.vehiculoCompleto(formNuevoVehiculo);

    if (!validacion.valido) {
      setErroresValidacion(validacion.errores);
      toast.error('Por favor completa todos los campos correctamente');
      return;
    }

    setErroresValidacion({});

    try {
      setLoading(true);

      const result = await vehiculoService.create(formNuevoVehiculo);

      if (result.success) {
        toast.success(`Vehículo ${formNuevoVehiculo.placa} registrado exitosamente`);

        // Agregar el nuevo vehículo a la lista
        setVehiculos([...vehiculos, result.vehiculo]);
        setFilteredVehiculos([...vehiculos, result.vehiculo]);

        // Seleccionar automáticamente el nuevo vehículo
        setFormEntrada({ ...formEntrada, vehiculoId: result.vehiculo.id.toString() });

        // Resetear formulario y cerrar modal
        setFormNuevoVehiculo({
          placa: '',
          tipo: 'carro',
          propietario: '',
          telefono: '',
          color: '',
          marca: '',
          modelo: ''
        });
        setShowNuevoVehiculo(false);
      } else {
        toast.error(result.error || 'Error al registrar vehículo');
      }
    } catch (error) {
      toast.error('Error de conexión al registrar vehículo');
    } finally {
      setLoading(false);
    }
  };

>>>>>>> Stashed changes
  const getTipoVehiculoIcon = (tipo: string) => {
    switch (tipo) {
      case 'carro':
        return <Car className="h-5 w-5 text-blue-600" />;
      case 'moto':
        return <Bike className="h-5 w-5 text-green-600" />; // En un proyecto real usarías un ícono de moto
      case 'bicicleta':
        return <Bike className="h-5 w-5 text-orange-600" />; // En un proyecto real usarías un ícono de bicicleta
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
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'entrada'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <LogIn className="inline-block h-4 w-4 mr-2" />
              Registrar Entrada
            </button>
            <button
              onClick={() => setActiveTab('salida')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'salida'
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
<<<<<<< Updated upstream
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
=======
                    <div className="space-y-2">
                      <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md bg-white">
                        {filteredVehiculos.length > 0 ? (
                          filteredVehiculos.map((vehiculo) => (
                            <div
                              key={vehiculo.id}
                              className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${formEntrada.vehiculoId === vehiculo.id.toString() ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                                }`}
                              onClick={() => setFormEntrada({ ...formEntrada, vehiculoId: vehiculo.id.toString() })}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  {getTipoVehiculoIcon(vehiculo.tipo)}
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{vehiculo.placa}</div>
                                    <div className="text-sm text-gray-500">{vehiculo.propietario || 'Sin propietario'}</div>
                                    {vehiculo.telefono && (
                                      <div className="text-xs text-gray-400">{vehiculo.telefono}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTipoVehiculoColor(vehiculo.tipo)}`}>
                                    {vehiculo.tipo}
                                  </span>
                                  {formEntrada.vehiculoId === vehiculo.id.toString() && (
                                    <div className="text-green-600 font-bold">✓</div>
>>>>>>> Stashed changes
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
                      onChange={(e) => setFormEntrada({ ...formEntrada, parqueaderoId: e.target.value })}
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
                      onChange={(e) => setFormEntrada({ ...formEntrada, espacioAsignado: e.target.value })}
                    />
<<<<<<< Updated upstream
                    <p className="mt-1 text-sm text-gray-500">Si no especificas, se asignará automáticamente</p>
=======
                    {formEntrada.parqueaderoId && parqueaderos.length > 0 ? (
                      <p className="mt-1 text-sm text-gray-500">
                        Parqueadero: {parqueaderos.find(p => p.id === parseInt(formEntrada.parqueaderoId))?.nombre} -
                        Espacios disponibles: {parqueaderos.find(p => p.id === parseInt(formEntrada.parqueaderoId))?.capacidadDisponible} de {parqueaderos.find(p => p.id === parseInt(formEntrada.parqueaderoId))?.capacidadTotal}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">Si no especificas, se asignará automáticamente</p>
                    )}
>>>>>>> Stashed changes
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
                      onChange={(e) => setFormEntrada({ ...formEntrada, observaciones: e.target.value })}
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
<<<<<<< Updated upstream
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
=======
            {/* Selector de Parqueadero */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parqueadero
              </label>
              <select
                value={formEntrada.parqueaderoId}
                onChange={(e) => {
                  console.log('🔄 Cambiando parqueadero a:', e.target.value);
                  setFormEntrada({ ...formEntrada, parqueaderoId: e.target.value });
                  setSearchSalida(''); // Limpiar búsqueda al cambiar parqueadero
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un parqueadero</option>
                {parqueaderos.map((parqueadero) => (
                  <option key={parqueadero.id} value={parqueadero.id}>
                    {parqueadero.nombre} ({parqueadero.capacidadDisponible}/{parqueadero.capacidadTotal} disponibles)
                  </option>
                ))}
              </select>
            </div>

            {/* Buscador de Vehículos */}
            {formEntrada.parqueaderoId && entradasActivas.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Vehículo
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Escribe la placa o propietario..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchSalida}
                    onChange={(e) => setSearchSalida(e.target.value)}
                  />
                </div>
              </div>
            )}

            {!formEntrada.parqueaderoId && entradasActivas.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Selecciona un parqueadero para ver los vehículos estacionados</p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-gray-500">Cargando entradas activas...</p>
              </div>
            ) : entradasActivas.length > 0 ? (
              <div>
                <div className="mb-4 text-sm text-gray-600">
                  Total: <span className="font-medium">{entradasActivas.length}</span> vehículos estacionados
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {entradasActivas
                    .filter((entrada) =>
                      entrada.placa.toLowerCase().includes(searchSalida.toLowerCase()) ||
                      (entrada.propietario && entrada.propietario.toLowerCase().includes(searchSalida.toLowerCase()))
                    )
                    .map((entrada) => (
                      <div
                        key={entrada.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedEntrada?.id === entrada.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        onClick={() => setSelectedEntrada(entrada)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1">
                            {getTipoVehiculoIcon(entrada.tipoVehiculo)}
                            <div className="flex-1">
                              <div className="font-bold text-lg text-gray-900">{entrada.placa}</div>
                              <div className="text-sm text-gray-600">{entrada.propietario || 'Sin propietario'}</div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTipoVehiculoColor(entrada.tipoVehiculo)}`}>
                            {entrada.tipoVehiculo}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Espacio:</span>
                            <span className="font-medium text-gray-900">{entrada.espacioAsignado}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tiempo:</span>
                            <span className="font-medium text-blue-600 text-lg">{calcularTiempoEstacionado(entrada.fechaHoraEntrada)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Entrada:</span>
                            <span className="font-medium text-gray-900 text-xs">
                              {new Date(entrada.fechaHoraEntrada).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {selectedEntrada?.id === entrada.id && (
                          <div className="mt-3 pt-3 border-t border-blue-200 text-center">
                            <span className="text-blue-600 font-medium text-sm">✓ Seleccionado</span>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
                {entradasActivas.filter((entrada) =>
                  entrada.placa.toLowerCase().includes(searchSalida.toLowerCase()) ||
                  (entrada.propietario && entrada.propietario.toLowerCase().includes(searchSalida.toLowerCase()))
                ).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No se encontraron vehículos con ese criterio de búsqueda</p>
                    </div>
                  )}
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

      {/* Modal de Registro de Nuevo Vehículo */}
      {showNuevoVehiculo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Registrar Nuevo Vehículo
            </h3>

            <form onSubmit={handleRegistrarNuevoVehiculo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: ABC123"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${erroresValidacion.placa
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  value={formNuevoVehiculo.placa}
                  onChange={(e) => {
                    setFormNuevoVehiculo({ ...formNuevoVehiculo, placa: e.target.value.toUpperCase() });
                    if (erroresValidacion.placa) {
                      const validacion = validaciones.placa(e.target.value.toUpperCase());
                      if (validacion.valido) {
                        const newErrors = { ...erroresValidacion };
                        delete newErrors.placa;
                        setErroresValidacion(newErrors);
                      }
                    }
                  }}
                />
                {erroresValidacion.placa && (
                  <p className="text-red-500 text-xs mt-1">{erroresValidacion.placa}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formNuevoVehiculo.tipo}
                  onChange={(e) => setFormNuevoVehiculo({ ...formNuevoVehiculo, tipo: e.target.value as 'carro' | 'moto' | 'bicicleta' })}
                >
                  <option value="carro">Carro</option>
                  <option value="moto">Moto</option>
                  <option value="bicicleta">Bicicleta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Propietario
                </label>
                <input
                  type="text"
                  placeholder="Nombre del propietario"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formNuevoVehiculo.propietario}
                  onChange={(e) => setFormNuevoVehiculo({ ...formNuevoVehiculo, propietario: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="3001234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formNuevoVehiculo.telefono}
                  onChange={(e) => setFormNuevoVehiculo({ ...formNuevoVehiculo, telefono: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  placeholder="Toyota, Honda, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formNuevoVehiculo.marca}
                  onChange={(e) => setFormNuevoVehiculo({ ...formNuevoVehiculo, marca: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  placeholder="Corolla, Civic, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formNuevoVehiculo.modelo}
                  onChange={(e) => setFormNuevoVehiculo({ ...formNuevoVehiculo, modelo: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rojo, Blanco, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formNuevoVehiculo.color}
                  onChange={(e) => setFormNuevoVehiculo({ ...formNuevoVehiculo, color: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNuevoVehiculo(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Car className="h-4 w-4 mr-2" />
                  )}
                  Registrar Vehículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Componente de Recibo de Salida */}
      {mostrarRecibo && datosRecibo && (
        <ReciboSalida
          recibo={datosRecibo.recibo}
          vehiculo={datosRecibo.entrada}
          parqueadero={parqueaderos.find(p => p.id === parseInt(datosRecibo.parqueaderoId)) || { nombre: 'N/A' }}
          costo={datosRecibo.costo}
          onConfirmar={handleConfirmarPago}
          onCancelar={() => {
            setMostrarRecibo(false);
            setDatosRecibo(null);
          }}
          loading={loading}
        />
      )}
>>>>>>> Stashed changes
    </div>
  );
};

export default RegistroEntradaSalida;