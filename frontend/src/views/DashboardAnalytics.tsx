import React, { useState, useEffect } from 'react';
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
  CheckCircle
} from 'lucide-react';
import CountUp from 'react-countup';
import { parqueaderoService, entradaService } from '../services/index';
import { useAuth } from '../context/AuthContext';

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
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // const { user } = useAuth();

  // Memoizamos la función cargarDatosDashboard para evitar recreaciones innecesarias
  const cargarDatosDashboardMemo = React.useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos del dashboard...');
      
      // Obtener datos de parqueaderos
      const parqueaderosResponse = await parqueaderoService.getAll();
      console.log('📊 Respuesta parqueaderos:', parqueaderosResponse);
      
      if (!parqueaderosResponse.success) {
        throw new Error('Error al cargar parqueaderos');
      }
      
      // Obtener entradas activas para calcular ocupación
      const entradasResponse = await entradaService.getAll();
      console.log('🚗 Respuesta entradas:', entradasResponse);
      
      // Procesar datos de parqueaderos con ocupación real
      const parqueaderosData: ParqueaderoStatus[] = parqueaderosResponse.parqueaderos.map((p: any) => {
        const capacidadTotal = p.capacidadTotal || 0;
        const capacidadDisponible = p.capacidadDisponible || 0;
        const ocupados = capacidadTotal - capacidadDisponible;
        const disponibles = capacidadDisponible;
        const porcentajeOcupacion = capacidadTotal > 0 ? Math.round((ocupados / capacidadTotal) * 100) : 0;
        
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
      const espaciosTotales = parqueaderosResponse.parqueaderos.reduce((acc: number, p: any) => acc + (p.capacidadTotal || 0), 0);
      const espaciosDisponibles = parqueaderosResponse.parqueaderos.reduce((acc: number, p: any) => acc + (p.capacidadDisponible || 0), 0);
      const espaciosOcupados = espaciosTotales - espaciosDisponibles;
      const ocupacionPromedio = espaciosTotales > 0 ? Math.round((espaciosOcupados / espaciosTotales) * 100) : 0;
      
      // Calcular estadísticas del día actual usando las entradas
      let vehiculosHoy = 0;
      let tiempoPromedioEstadia = 2.5; // Valor por defecto
      
      if (entradasResponse.success && entradasResponse.entradas) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const mañana = new Date(hoy);
        mañana.setDate(mañana.getDate() + 1);
        
        vehiculosHoy = entradasResponse.entradas.filter((entrada: any) => {
          const fechaEntrada = new Date(entrada.fechaHoraEntrada);
          return fechaEntrada >= hoy && fechaEntrada < mañana;
        }).length;
      }
      
      // Generar distribución por tipo de vehículo usando datos reales
      const vehiculosPorTipo: VehiculosPorTipo[] = [];
      const tiposVehiculos: Record<string, {cantidad: number, color: string}> = {
        'carro': { cantidad: 0, color: 'bg-blue-500' },
        'moto': { cantidad: 0, color: 'bg-green-500' },
        'bicicleta': { cantidad: 0, color: 'bg-orange-500' },
      };
      
      if (entradasResponse.success && entradasResponse.entradas) {
        entradasResponse.entradas.forEach((entrada: any) => {
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
      
      // Calcular ingresos estimados (simplificado)
      const ingresosDia = vehiculosHoy * 5000; // $5,000 promedio por vehículo
      
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
      
    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
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
    // Cargar datos al montar el componente o cuando cambie selectedPeriod
    cargarDatosDashboardMemo();
    
    // Actualizar cada 30 segundos, pero incrementamos a 60 segundos para reducir llamadas
    const interval = setInterval(cargarDatosDashboardMemo, 60000); // Aumentado a 60000ms (60 segundos)
    
    // Limpiar intervalo cuando se desmonte el componente
    return () => clearInterval(interval);
  }, [cargarDatosDashboardMemo]); // Dependencia en la función memoizada

  // Función para cargar datos manualmente, ahora solo se usa cuando el usuario
  // explícitamente solicita una recarga de datos (no en intervalos automáticos)
  // const cargarDatosDashboard = () => {
  //   // Llamamos a la versión memoizada
  //   cargarDatosDashboardMemo();
  // };

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
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard ParkNow</h1>
          <p className="text-gray-600">Monitoreo en tiempo real del sistema de parqueaderos</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
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
                  <div key={parqueadero.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <h4 className="font-medium text-gray-900">{parqueadero.nombre}</h4>
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
                        style={{ width: `${vehiculo.porcentaje}%` }}
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
    </div>
  );
};

export default DashboardAnalytics;