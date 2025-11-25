import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  Activity,
  BarChart3,
  Zap,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import CountUp from 'react-countup';
import { parqueaderoService, entradaService, salidaService, reporteService } from '../services/index';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import AlertasCapacidad from '../components/AlertasCapacidad';
import { useAuth } from '../context/AuthContext';
import '../assets/scss/parknow-colors.css';

interface DashboardStats {
  espaciosTotales: number;
  espaciosOcupados: number;
  espaciosDisponibles: number;
  vehiculosHoy: number;
  ingresosDia: number;
  tiempoPromedioEstadia: number;
  ocupacionPromedio: number;
  alertasActivas: number;
}

interface ParqueaderoStatus {
  id: number;
  nombre: string;
  capacidadTotal: number;
  ocupados: number;
  disponibles: number;
  porcentajeOcupacion: number;
  status: 'normal' | 'warning' | 'critical';
}

interface VehiculosPorTipo {
  tipo: string;
  cantidad: number;
  porcentaje: number;
  color: string;
}

const DashboardAnalytics = () => {
  const [stats, setStats] = useState<DashboardStats>({
    espaciosTotales: 0,
    espaciosOcupados: 0,
    espaciosDisponibles: 0,
    vehiculosHoy: 0,
    ingresosDia: 0,
    tiempoPromedioEstadia: 0,
    ocupacionPromedio: 0,
    alertasActivas: 0
  });

  const [parqueaderos, setParqueaderos] = useState<ParqueaderoStatus[]>([]);
  const [vehiculosPorTipo, setVehiculosPorTipo] = useState<VehiculosPorTipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Memoizamos la función cargarDatosDashboard para evitar recreaciones innecesarias
  const cargarDatosDashboardMemo = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos del dashboard...');
      console.log('👤 Usuario actual:', user);
      console.log('🔐 Es admin:', isAdmin);
      
      // Obtener datos de parqueaderos según el rol del usuario
      let parqueaderosResponse;
      if (isAdmin) {
        // Admin ve todos los parqueaderos
        parqueaderosResponse = await parqueaderoService.getAll();
        console.log('📊 [ADMIN] Respuesta parqueaderos (todos):', parqueaderosResponse);
      } else {
        // Controlador solo ve sus parqueaderos asignados
        parqueaderosResponse = await parqueaderoService.getParqueaderosPorControlador();
        console.log('📊 [CONTROLADOR] Respuesta parqueaderos (asignados):', parqueaderosResponse);
        console.log('📊 [CONTROLADOR] Número de parqueaderos:', parqueaderosResponse?.parqueaderos?.length);
        
        // Adaptar la respuesta al formato esperado
        if (parqueaderosResponse.success && parqueaderosResponse.parqueaderos) {
          parqueaderosResponse = {
            success: true,
            parqueaderos: parqueaderosResponse.parqueaderos
          };
        } else {
          console.warn('⚠️ [CONTROLADOR] No hay parqueaderos asignados o error en respuesta');
          parqueaderosResponse = {
            success: true,
            parqueaderos: []
          };
        }
      }
      
      if (!parqueaderosResponse.success || !parqueaderosResponse.parqueaderos) {
        console.error('❌ Error al cargar parqueaderos:', parqueaderosResponse);
        throw new Error('Error al cargar parqueaderos');
      }
      
      console.log('✅ Parqueaderos cargados:', parqueaderosResponse.parqueaderos.length);
      
      // Obtener entradas activas para calcular ocupación
      const entradasResponse = await entradaService.getAll();
      console.log('🚗 Respuesta entradas:', entradasResponse);
      
      // Obtener salidas para filtrar entradas activas
      const salidasResponse = await salidaService.getAll();
      console.log('🚪 Respuesta salidas:', salidasResponse);
      
      // Filtrar solo entradas activas (sin salida registrada)
      let entradasActivas: any[] = [];
      if (entradasResponse.success && entradasResponse.entradas) {
        const idsConSalida = new Set(
          salidasResponse.success && salidasResponse.salidas 
            ? salidasResponse.salidas.map((s: any) => s.entradaId || s.id_entrada)
            : []
        );
        
        entradasActivas = entradasResponse.entradas.filter((entrada: any) => 
          !idsConSalida.has(entrada.id)
        );
      }
      
      console.log('✅ Entradas activas (sin salida):', entradasActivas);
      
      // Procesar datos de parqueaderos con ocupación real
      const parqueaderosData: ParqueaderoStatus[] = parqueaderosResponse.parqueaderos.map((p: any) => {
        // Soportar tanto camelCase como snake_case
        const capacidadTotal = p.capacidadTotal || p.capacidad_total || 0;
        const capacidadDisponible = p.capacidadDisponible || p.capacidad_disponible || 0;
        const ocupados = capacidadTotal - capacidadDisponible;
        const disponibles = capacidadDisponible;
        const porcentajeOcupacion = capacidadTotal > 0 ? Math.round((ocupados / capacidadTotal) * 100) : 0;
        
        console.log(`📊 Parqueadero ${p.nombre}:`, {
          capacidadTotal,
          capacidadDisponible,
          ocupados,
          disponibles,
          porcentajeOcupacion
        });
        
        let status: 'normal' | 'warning' | 'critical' = 'normal';
        if (porcentajeOcupacion >= 90) {
          status = 'critical';
        } else if (porcentajeOcupacion >= 70) {
          status = 'warning';
        }
        
        return {
          id: p.id,
          nombre: p.nombre,
          capacidadTotal,
          ocupados,
          disponibles,
          porcentajeOcupacion,
          status
        };
      });
      
      // Calcular estadísticas generales usando datos reales
      const espaciosTotales = parqueaderosResponse.parqueaderos.reduce((acc: number, p: any) => {
        const total = p.capacidadTotal || p.capacidad_total || 0;
        return acc + total;
      }, 0);
      const espaciosDisponibles = parqueaderosResponse.parqueaderos.reduce((acc: number, p: any) => {
        const disponible = p.capacidadDisponible || p.capacidad_disponible || 0;
        return acc + disponible;
      }, 0);
      const espaciosOcupados = espaciosTotales - espaciosDisponibles;
      const ocupacionPromedio = espaciosTotales > 0 ? Math.round((espaciosOcupados / espaciosTotales) * 100) : 0;
      
      // Calcular estadísticas del día actual
      let vehiculosHoy = 0;
      let tiempoPromedioEstadia = 0;
      let ingresosDia = 0;
      
      // Definir rango del día actual
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);
      
      // Contar entradas del día
      if (entradasActivas.length > 0) {
        vehiculosHoy = entradasActivas.filter((entrada: any) => {
          const fechaEntrada = new Date(entrada.fechaHoraEntrada);
          return fechaEntrada >= hoy && fechaEntrada < mañana;
        }).length;
      }
      
      // Obtener tiempo promedio de estadía y calcular ingresos reales desde el backend
      try {
        const estadisticasResponse = await reporteService.obtenerEstadisticasDashboard();
        if (estadisticasResponse.success) {
          tiempoPromedioEstadia = estadisticasResponse.tiempoPromedioEstadia || 0;
          console.log('⏱️ Tiempo promedio de estadía:', tiempoPromedioEstadia);
        }
      } catch (error) {
        console.error('Error obteniendo tiempo promedio:', error);
        tiempoPromedioEstadia = 0;
      }
      
      // Calcular ingresos reales del día desde las salidas
      console.log('💰 [DEBUG] salidasResponse:', salidasResponse);
      if (salidasResponse.success && salidasResponse.salidas) {
        console.log('💰 [DEBUG] Total salidas en BD:', salidasResponse.salidas.length);
        console.log('💰 [DEBUG] Primeras 3 salidas:', salidasResponse.salidas.slice(0, 3));
        
        const salidasHoy = salidasResponse.salidas.filter((salida: any) => {
          const fechaSalida = new Date(salida.fecha_salida || salida.fechaHoraSalida);
          return fechaSalida >= hoy && fechaSalida < mañana;
        });
        
        console.log('💰 [DEBUG] Salidas filtradas hoy:', salidasHoy.length);
        console.log('💰 [DEBUG] Salidas hoy completas:', salidasHoy);
        
        ingresosDia = salidasHoy.reduce((total: number, salida: any) => {
          const monto = parseFloat(salida.monto_total || salida.montoTotal || 0);
          console.log(`💰 [DEBUG] Salida ID ${salida.id}: monto_total=${salida.monto_total}, montoTotal=${salida.montoTotal}, parseado=${monto}`);
          return total + monto;
        }, 0);
        
        console.log('💰 Salidas hoy:', salidasHoy.length);
        console.log('💰 Ingresos del día:', ingresosDia);
      } else {
        console.log('💰 [DEBUG] No hay salidas o error:', salidasResponse);
      }
      
      // Generar distribución por tipo de vehículo usando SOLO entradas activas
      const vehiculosPorTipo: VehiculosPorTipo[] = [];
      const tiposVehiculos: Record<string, {cantidad: number, color: string}> = {
        'carro': { cantidad: 0, color: 'bg-blue-500' },
        'moto': { cantidad: 0, color: 'bg-green-500' },
        'bicicleta': { cantidad: 0, color: 'bg-orange-500' },
      };
      
      if (entradasActivas.length > 0) {
        entradasActivas.forEach((entrada: any) => {
          const tipo = entrada.Vehiculo?.tipo?.toLowerCase() || 'otro';
          if (tiposVehiculos[tipo]) {
            tiposVehiculos[tipo].cantidad++;
          } else {
            tiposVehiculos[tipo] = { cantidad: 1, color: 'bg-gray-500' };
          }
        });
      }
      
      let totalVehiculos = 0;
      Object.entries(tiposVehiculos).forEach(([tipo, data]) => {
        if (data.cantidad > 0) {
          totalVehiculos += data.cantidad;
        }
      });
      
      Object.entries(tiposVehiculos).forEach(([tipo, data]) => {
        if (data.cantidad > 0) {
          vehiculosPorTipo.push({
            tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1),
            cantidad: data.cantidad,
            porcentaje: totalVehiculos > 0 ? Math.round((data.cantidad / totalVehiculos) * 100) : 0,
            color: data.color
          });
        }
      });
      
      // Verificar alertas de baja capacidad
      let alertasActivas = 0;
      try {
        const alertasResponse = await parqueaderoService.getCapacidadBaja(10);
        alertasActivas = alertasResponse.success ? (alertasResponse.parqueaderos?.length || 0) : 0;
      } catch (error) {
        console.warn('No se pudieron obtener alertas:', error);
        // Calcular alertas manualmente
        alertasActivas = parqueaderosData.filter(p => p.porcentajeOcupacion >= 90).length;
      }
      
      // Consolidar todos los datos
      const statsData: DashboardStats = {
        espaciosTotales,
        espaciosOcupados,
        espaciosDisponibles,
        vehiculosHoy,
        ingresosDia,
        tiempoPromedioEstadia,
        ocupacionPromedio,
        alertasActivas
      };
      
      console.log('✅ Datos del dashboard cargados:', { statsData, parqueaderosData, vehiculosPorTipo });
      
      setStats(statsData);
      setParqueaderos(parqueaderosData);
      setVehiculosPorTipo(vehiculosPorTipo);
      setLastUpdate(new Date());
      
    } catch (error: any) {
      console.error('❌ Error cargando datos del dashboard:', {
        message: error?.message || 'Error desconocido',
        response: error?.response?.data,
        status: error?.response?.status,
        error: error
      });
      
      // Mostrar datos por defecto en caso de error
      setStats({
        espaciosTotales: 0,
        espaciosOcupados: 0,
        espaciosDisponibles: 0,
        vehiculosHoy: 0,
        ingresosDia: 0,
        tiempoPromedioEstadia: 0,
        ocupacionPromedio: 0,
        alertasActivas: 0
      });
      setParqueaderos([]);
      setVehiculosPorTipo([]);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias para evitar recreaciones innecesarias

  useEffect(() => {
    // Cargar datos al montar el componente
    cargarDatosDashboardMemo();
    
    // Escuchar eventos de actualización desde otros componentes (entrada/salida)
    // Sin intervalo automático - solo reacciona a eventos
    const handleRefreshData = () => {
      console.log('🔄 Dashboard: Recibido evento de actualización (entrada/salida)');
      cargarDatosDashboardMemo();
    };
    
    window.addEventListener('refreshDashboard', handleRefreshData);
    
    // Limpiar event listener cuando se desmonte el componente
    return () => {
      window.removeEventListener('refreshDashboard', handleRefreshData);
    };
  }, [cargarDatosDashboardMemo]); // Dependencia en la función memoizada

  // Función para cargar datos manualmente
  const cargarDatosDashboard = useCallback(() => {
    console.log('📊 Dashboard: Recarga manual solicitada');
    cargarDatosDashboardMemo();
  }, [cargarDatosDashboardMemo]);

  // Exponer la función de recarga para que pueda ser llamada desde otros componentes
  useEffect(() => {
    // Hacer disponible la función globalmente para otros componentes
    (window as any).refreshDashboard = cargarDatosDashboard;
    
    return () => {
      delete (window as any).refreshDashboard;
    };
  }, [cargarDatosDashboard]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'normal':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical':
        return 'Completo';
      case 'warning':
        return 'Casi lleno';
      case 'normal':
        return 'Disponible';
      default:
        return 'Normal';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
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
      {/* Header Mejorado */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard ParkNow</h1>
            <p className="text-gray-600">Monitoreo en tiempo real del sistema de parqueaderos</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Última actualización */}
            {lastUpdate && (
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                <span className="font-medium">Actualizado:</span> {lastUpdate.toLocaleTimeString()}
              </div>
            )}
            
            {/* Botón Refresh */}
            <button
              onClick={() => cargarDatosDashboardMemo()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            
            {/* Selector de período */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && parqueaderos.length === 0 ? (
        <div>
          <LoadingSkeleton count={4} type="card" />
        </div>
      ) : parqueaderos.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No hay parqueaderos"
          description="Comienza agregando un parqueadero al sistema"
        />
      ) : (
        <>
        {/* Alertas de Capacidad */}
        <AlertasCapacidad parqueaderos={parqueaderos} />
        
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Espacios Totales */}
        <div className="bg-blue-100 rounded-lg shadow p-6 relative overflow-hidden">
          <Car className="absolute top-0 right-0 h-32 w-32 text-blue-200/50 -mr-10 -mt-10" />
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-md text-white mb-4">
            <MapPin className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            <CountUp end={stats.espaciosTotales} duration={2} />
          </h3>
          <p className="text-gray-600">Espacios Totales</p>
        </div>

        {/* Espacios Ocupados */}
        <div className="bg-red-100 rounded-lg shadow p-6 relative overflow-hidden">
          <Activity className="absolute top-0 right-0 h-32 w-32 text-red-200/50 -mr-10 -mt-10" />
          <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-md text-white mb-4">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            <CountUp end={stats.espaciosOcupados} duration={2} />
          </h3>
          <p className="text-gray-600">Espacios Ocupados</p>
        </div>

        {/* Espacios Disponibles */}
        <div className="bg-green-100 rounded-lg shadow p-6 relative overflow-hidden">
          <Zap className="absolute top-0 right-0 h-32 w-32 text-green-200/50 -mr-10 -mt-10" />
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-md text-white mb-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            <CountUp end={stats.espaciosDisponibles} duration={2} />
          </h3>
          <p className="text-gray-600">Espacios Disponibles</p>
        </div>

        {/* Ingresos del Día */}
        <div className="bg-purple-100 rounded-lg shadow p-6 relative overflow-hidden">
          <TrendingUp className="absolute top-0 right-0 h-32 w-32 text-purple-200/50 -mr-10 -mt-10" />
          <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-md text-white mb-4">
            <DollarSign className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(stats.ingresosDia)}
          </h3>
          <p className="text-gray-600">Ingresos Hoy</p>
        </div>
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Vehículos Hoy */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Vehículos Hoy</p>
              <h3 className="text-2xl font-bold text-gray-900">
                <CountUp end={stats.vehiculosHoy} duration={2} />
              </h3>
            </div>
            <Car className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        {/* Tiempo Promedio */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tiempo Promedio</p>
              <h3 className="text-2xl font-bold text-gray-900">
                <CountUp end={stats.tiempoPromedioEstadia} decimals={1} duration={2} />h
              </h3>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        {/* Ocupación Promedio */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Ocupación Promedio</p>
              <h3 className="text-2xl font-bold text-gray-900">
                <CountUp end={stats.ocupacionPromedio} duration={2} />%
              </h3>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        {/* Alertas Activas */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Alertas Activas</p>
              <h3 className="text-2xl font-bold text-gray-900">
                <CountUp end={stats.alertasActivas} duration={2} />
              </h3>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Estado de Parqueaderos */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Estado de Parqueaderos</h3>
              <p className="text-sm text-gray-600 mt-1">Ocupación en tiempo real por parqueadero</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {parqueaderos.map((parqueadero) => (
                  <div 
                    key={parqueadero.id} 
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                    onClick={() => navigate(`/parqueadero/${parqueadero.id}`)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                            {parqueadero.nombre}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {parqueadero.ocupados}/{parqueadero.capacidadTotal} espacios ocupados
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(parqueadero.status)}`}>
                        {getStatusText(parqueadero.status)}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          parqueadero.porcentajeOcupacion >= 90 
                            ? 'bg-red-500' 
                            : parqueadero.porcentajeOcupacion >= 70 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${parqueadero.porcentajeOcupacion}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{parqueadero.disponibles} disponibles</span>
                      <span>{parqueadero.porcentajeOcupacion}% ocupado</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Distribución por Tipo de Vehículo */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Vehículos por Tipo</h3>
              <p className="text-sm text-gray-600 mt-1">Distribución actual</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {vehiculosPorTipo.map((vehiculo, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${vehiculo.color}`}></div>
                      <span className="text-sm font-medium text-gray-900">{vehiculo.tipo}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{vehiculo.cantidad}</div>
                      <div className="text-xs text-gray-500">{vehiculo.porcentaje}%</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Gráfico simple de barras */}
              <div className="mt-6 space-y-2">
                {vehiculosPorTipo.map((vehiculo, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-16 text-xs text-gray-600">{vehiculo.tipo}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${vehiculo.color} transition-all duration-500`}
                        style={{ width: `${vehiculo.porcentaje}%`, accentColor: 'var(--park-blue)',
                        borderColor: 'var(--park-blue)' }}
                      ></div>
                    </div>
                    <div className="w-8 text-xs text-gray-600 text-right">{vehiculo.porcentaje}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Resumen del Sistema</h3>
          <span className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleTimeString()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Sistema Operativo</h4>
            <p className="text-sm text-gray-600">Todos los parqueaderos funcionando correctamente</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">
              {parqueaderos.length} Parqueaderos
            </h4>
            <p className="text-sm text-gray-600">Activos y monitorizados en tiempo real</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">24/7 Operación</h4>
            <p className="text-sm text-gray-600">Servicio continuo todos los días</p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default DashboardAnalytics;