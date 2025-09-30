import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, BellRing, CheckCircle, X, Settings, RefreshCw } from 'lucide-react';
import { parqueaderoService } from '../services/index';
import { toast } from 'react-toastify';

interface AlertaCapacidad {
  id: number;
  parqueaderoId: number;
  nombreParqueadero: string;
  direccion: string;
  capacidadTotal: number;
  capacidadDisponible: number;
  porcentajeOcupado: number;
  nivel: 'critico' | 'alto' | 'medio';
  fechaAlerta: string;
  leida: boolean;
}

interface ConfiguracionAlertas {
  umbralCritico: number;
  umbralAlto: number;
  umbralMedio: number;
  notificacionesActivas: boolean;
  sonidoActivo: boolean;
  intervaloActualizacion: number; // en minutos
}

const AlertasCapacidad = () => {
  const [alertas, setAlertas] = useState<AlertaCapacidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [configuracion, setConfiguracion] = useState<ConfiguracionAlertas>({
    umbralCritico: 95, // 95% ocupado
    umbralAlto: 85,    // 85% ocupado
    umbralMedio: 75,   // 75% ocupado
    notificacionesActivas: true,
    sonidoActivo: true,
    intervaloActualizacion: 5
  });
  const [filtroNivel, setFiltroNivel] = useState<'todos' | 'critico' | 'alto' | 'medio'>('todos');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'leidas' | 'no-leidas'>('no-leidas');

  useEffect(() => {
    cargarAlertas();
    const interval = setInterval(cargarAlertas, configuracion.intervaloActualizacion * 60 * 1000);
    return () => clearInterval(interval);
  }, [configuracion.intervaloActualizacion]);

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      
      // Simular carga de alertas desde el backend
      // En producción, esto vendría de parqueaderoService.getAlertsCapacidad()
      const alertasMock: AlertaCapacidad[] = [
        {
          id: 1,
          parqueaderoId: 1,
          nombreParqueadero: 'Parqueadero Central',
          direccion: 'Calle 100 #15-30',
          capacidadTotal: 200,
          capacidadDisponible: 8,
          porcentajeOcupado: 96,
          nivel: 'critico',
          fechaAlerta: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // hace 10 minutos
          leida: false
        },
        {
          id: 2,
          parqueaderoId: 2,
          nombreParqueadero: 'Plaza Norte',
          direccion: 'Carrera 45 #80-20',
          capacidadTotal: 150,
          capacidadDisponible: 22,
          porcentajeOcupado: 85,
          nivel: 'alto',
          fechaAlerta: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // hace 25 minutos
          leida: true
        },
        {
          id: 3,
          parqueaderoId: 3,
          nombreParqueadero: 'Centro Comercial',
          direccion: 'Avenida 68 #32-15',
          capacidadTotal: 300,
          capacidadDisponible: 75,
          porcentajeOcupado: 75,
          nivel: 'medio',
          fechaAlerta: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // hace 45 minutos
          leida: false
        }
      ];

      setAlertas(alertasMock);
      
      // Mostrar notificación para alertas nuevas críticas
      const alertasCriticasNuevas = alertasMock.filter(alerta => 
        alerta.nivel === 'critico' && !alerta.leida
      );
      
      if (alertasCriticasNuevas.length > 0 && configuracion.notificacionesActivas) {
        toast.error(`¡${alertasCriticasNuevas.length} parqueadero(s) con capacidad crítica!`, {
          position: 'top-right',
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Reproducir sonido si está activado
        if (configuracion.sonidoActivo) {
          // En un entorno real, aquí reproduciríamos un sonido
          console.log('🔔 Sonido de alerta reproducido');
        }
      }

    } catch (error) {
      toast.error('Error cargando alertas de capacidad');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = (alertaId: number) => {
    setAlertas(alertas.map(alerta => 
      alerta.id === alertaId ? { ...alerta, leida: true } : alerta
    ));
  };

  const marcarTodasComoLeidas = () => {
    setAlertas(alertas.map(alerta => ({ ...alerta, leida: true })));
    toast.success('Todas las alertas marcadas como leídas');
  };

  const eliminarAlerta = (alertaId: number) => {
    setAlertas(alertas.filter(alerta => alerta.id !== alertaId));
    toast.success('Alerta eliminada');
  };

  const obtenerColorNivel = (nivel: string) => {
    switch (nivel) {
      case 'critico':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'alto':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medio':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const obtenerIconoNivel = (nivel: string) => {
    switch (nivel) {
      case 'critico':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'alto':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medio':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const alertasFiltradas = alertas.filter(alerta => {
    const cumpleFiltroNivel = filtroNivel === 'todos' || alerta.nivel === filtroNivel;
    const cumpleFiltroEstado = filtroEstado === 'todos' || 
      (filtroEstado === 'leidas' && alerta.leida) || 
      (filtroEstado === 'no-leidas' && !alerta.leida);
    
    return cumpleFiltroNivel && cumpleFiltroEstado;
  });

  const contadorAlertas = {
    total: alertas.length,
    noLeidas: alertas.filter(a => !a.leida).length,
    criticas: alertas.filter(a => a.nivel === 'critico').length,
    altas: alertas.filter(a => a.nivel === 'alto').length,
    medias: alertas.filter(a => a.nivel === 'medio').length
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alertas de Capacidad</h1>
          <p className="text-gray-600">Monitoreo en tiempo real de la ocupación de parqueaderos</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={cargarAlertas}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <Settings className="size-4 mr-2" />
            Configuración
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Alertas</p>
              <p className="text-2xl font-bold text-gray-900">{contadorAlertas.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <BellRing className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">No Leídas</p>
              <p className="text-2xl font-bold text-blue-600">{contadorAlertas.noLeidas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Críticas</p>
              <p className="text-2xl font-bold text-red-600">{contadorAlertas.criticas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Altas</p>
              <p className="text-2xl font-bold text-orange-600">{contadorAlertas.altas}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Medias</p>
              <p className="text-2xl font-bold text-yellow-600">{contadorAlertas.medias}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Acciones */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value as any)}
              >
                <option value="todos">Todos los niveles</option>
                <option value="critico">Crítico</option>
                <option value="alto">Alto</option>
                <option value="medio">Medio</option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as any)}
              >
                <option value="todos">Todos los estados</option>
                <option value="no-leidas">No leídas</option>
                <option value="leidas">Leídas</option>
              </select>
            </div>

            {contadorAlertas.noLeidas > 0 && (
              <button
                onClick={marcarTodasComoLeidas}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* Lista de Alertas */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : alertasFiltradas.length > 0 ? (
            alertasFiltradas.map((alerta) => (
              <div
                key={alerta.id}
                className={`p-4 ${!alerta.leida ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {obtenerIconoNivel(alerta.nivel)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {alerta.nombreParqueadero}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${obtenerColorNivel(alerta.nivel)}`}>
                          {alerta.nivel.toUpperCase()}
                        </span>
                        {!alerta.leida && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            NUEVA
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-2">{alerta.direccion}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-gray-500">Ocupación:</span>
                          <p className="font-semibold text-lg">{alerta.porcentajeOcupado}%</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Disponibles:</span>
                          <p className="font-semibold text-lg text-green-600">{alerta.capacidadDisponible}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Total:</span>
                          <p className="font-semibold text-lg">{alerta.capacidadTotal}</p>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${
                            alerta.porcentajeOcupado >= 95 ? 'bg-red-600' :
                            alerta.porcentajeOcupado >= 85 ? 'bg-orange-500' :
                            'bg-yellow-500'
                          }`}
                          style={{ width: `${alerta.porcentajeOcupado}%` }}
                        ></div>
                      </div>

                      <p className="text-sm text-gray-500">
                        Alerta generada: {new Date(alerta.fechaAlerta).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {!alerta.leida && (
                      <button
                        onClick={() => marcarComoLeida(alerta.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                        title="Marcar como leída"
                      >
                        <CheckCircle className="size-5" />
                      </button>
                    )}
                    <button
                      onClick={() => eliminarAlerta(alerta.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Eliminar alerta"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay alertas</h3>
              <p className="text-gray-500">
                {filtroEstado === 'no-leidas' ? 
                  'Todas las alertas han sido leídas' : 
                  'No se encontraron alertas con los filtros seleccionados'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Configuración */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Configuración de Alertas
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Umbral Crítico (% ocupado)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={configuracion.umbralCritico}
                  onChange={(e) => setConfiguracion({...configuracion, umbralCritico: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{configuracion.umbralCritico}%</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Umbral Alto (% ocupado)
                </label>
                <input
                  type="range"
                  min="50"
                  max={configuracion.umbralCritico - 1}
                  value={configuracion.umbralAlto}
                  onChange={(e) => setConfiguracion({...configuracion, umbralAlto: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{configuracion.umbralAlto}%</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Umbral Medio (% ocupado)
                </label>
                <input
                  type="range"
                  min="50"
                  max={configuracion.umbralAlto - 1}
                  value={configuracion.umbralMedio}
                  onChange={(e) => setConfiguracion({...configuracion, umbralMedio: parseInt(e.target.value)})}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">{configuracion.umbralMedio}%</div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notificaciones"
                  checked={configuracion.notificacionesActivas}
                  onChange={(e) => setConfiguracion({...configuracion, notificacionesActivas: e.target.checked})}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="notificaciones" className="text-sm font-medium text-gray-700">
                  Activar notificaciones push
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sonido"
                  checked={configuracion.sonidoActivo}
                  onChange={(e) => setConfiguracion({...configuracion, sonidoActivo: e.target.checked})}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="sonido" className="text-sm font-medium text-gray-700">
                  Activar sonido de alerta
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo de actualización (minutos)
                </label>
                <select
                  value={configuracion.intervaloActualizacion}
                  onChange={(e) => setConfiguracion({...configuracion, intervaloActualizacion: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 minuto</option>
                  <option value={5}>5 minutos</option>
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                  toast.success('Configuración guardada');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasCapacidad;