import React, { useState, useEffect } from 'react';
import { Save, Edit, Trash2, Plus, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { horarioService, parqueaderoService } from '../services/index';

interface HorarioItem {
  dia: string;
  horaApertura: string;
  horaCierre: string;
  activo: boolean;
  esFestivo?: boolean;
}

interface Horario {
  id: number;
  parqueaderoId: number;
  nombreParqueadero: string;
  horarios: HorarioItem[];
  fechaCreacion: string;
}

type ScheduleType = 'PERSONALIZADO' | 'DIURNO' | 'NOCTURNO' | '24H' | '24H_PARCIAL';

const HorariosAtencion = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [parqueaderos, setParqueaderos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);
  const [selectedParqueadero, setSelectedParqueadero] = useState('');

  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo', 'Festivos'
  ];

  const [formData, setFormData] = useState<HorarioItem[]>(
    diasSemana.map(dia => ({
      dia,
      horaApertura: dia === 'Festivos' ? '09:00' : '08:00',
      horaCierre: dia === 'Festivos' ? '17:00' : '18:00',
      activo: dia !== 'Domingo',
      esFestivo: dia === 'Festivos'
    }))
  );

  // Nuevo estado: tipo de horario seleccionado (estándares + personalizado)
  const [scheduleType, setScheduleType] = useState<ScheduleType>('PERSONALIZADO');
  // Para opción 24H_PARCIAL: días seleccionados que serán 24h
  const [selected24hDays, setSelected24hDays] = useState<string[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    // Cuando cambia el tipo de horario y no es personalizado, construir formData automático
    if (scheduleType !== 'PERSONALIZADO') {
      const nuevos = buildFormFromType(scheduleType, selected24hDays);
      setFormData(nuevos);
    }
    // si es PERSONALIZADO, no cambiar formData automáticamente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleType, selected24hDays]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar parqueaderos desde el backend
      const parqueaderosResponse = await parqueaderoService.getAll();
      if (parqueaderosResponse.success) {
        setParqueaderos(parqueaderosResponse.parqueaderos || []);
      } else {
        toast.error('Error al cargar parqueaderos');
      }

      // Cargar horarios desde el backend
      const horariosResponse = await horarioService.getAll();
      if (horariosResponse.success) {
        // Transformar los datos del backend al formato del frontend
        const horariosTransformados = transformarHorarios(horariosResponse.horarios || []);
        setHorarios(horariosTransformados);
      } else {
        toast.error('Error al cargar horarios');
      }

    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const transformarHorarios = (horariosBackend: any[]): Horario[] => {
    // Agrupar horarios por parqueadero
    const horariosAgrupados: { [key: number]: any[] } = {};
    
    horariosBackend.forEach((horario: any) => {
      const parqueaderoId = horario.id_parqueadero || horario.parqueaderoId;
      if (!horariosAgrupados[parqueaderoId]) {
        horariosAgrupados[parqueaderoId] = [];
      }
      horariosAgrupados[parqueaderoId].push(horario);
    });

    // Transformar al formato del frontend
    return Object.entries(horariosAgrupados).map(([parqueaderoId, horarios]) => {
      const primerHorario = horarios[0];
      return {
        id: parseInt(parqueaderoId),
        parqueaderoId: parseInt(parqueaderoId),
        nombreParqueadero: primerHorario.Parqueadero?.nombre || 'Parqueadero',
        fechaCreacion: primerHorario.created_at || primerHorario.createdAt || new Date().toISOString(),
        horarios: horarios.map((h: any) => {
          // Obtener dia_semana con fallback
          const diaSemana = h.dia_semana || h.diaSemana || '';
          
          // Transformar el nombre del día
          let diaFormateado = '';
          if (diaSemana === 'FESTIVO') {
            diaFormateado = 'Festivos';
          } else if (diaSemana) {
            diaFormateado = diaSemana.charAt(0) + diaSemana.slice(1).toLowerCase();
          } else {
            diaFormateado = 'Desconocido';
          }

          // Obtener horas con fallback
          const horaApertura = h.hora_apertura || h.horaApertura || '00:00:00';
          const horaCierre = h.hora_cierre || h.horaCierre || '00:00:00';

          return {
            dia: diaFormateado,
            horaApertura: horaApertura.substring(0, 5), // HH:MM
            horaCierre: horaCierre.substring(0, 5), // HH:MM
            activo: h.activo !== undefined ? h.activo : true,
            esFestivo: h.es_festivo || h.esFestivo || false
          };
        })
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedParqueadero) {
      toast.error('Selecciona un parqueadero');
      return;
    }

    // Validar que al menos un día esté activo
    const diasActivos = formData.filter(item => item.activo);
    if (diasActivos.length === 0) {
      toast.error('Debe haber al menos un día activo');
      return;
    }

    // Validar horarios: permitir horarios nocturnos (apertura > cierre), sólo rechazar igualdad
    for (const item of diasActivos) {
      if (item.horaApertura === item.horaCierre) {
        toast.error(`El horario del ${item.dia} es inválido: apertura y cierre no pueden ser iguales`);
        return;
      }
    }

    try {
      // Transformar datos al formato del backend (camelCase)
      const mapearDiaSemana = (dia: string): string => {
        if (dia === 'Festivos') return 'FESTIVO';
        
        const mapeo: { [key: string]: string } = {
          'LUNES': 'LUNES',
          'MARTES': 'MARTES',
          'MIÉRCOLES': 'MIERCOLES', // Sin acento para la BD
          'JUEVES': 'JUEVES',
          'VIERNES': 'VIERNES',
          'SÁBADO': 'SABADO', // Sin acento para la BD
          'DOMINGO': 'DOMINGO'
        };
        
        return mapeo[dia.toUpperCase()] || dia.toUpperCase();
      };

      const horariosParaBackend = formData.map(item => ({
        parqueaderoId: parseInt(selectedParqueadero),
        diaSemana: mapearDiaSemana(item.dia),
        horaApertura: item.horaApertura,
        horaCierre: item.horaCierre,
        activo: item.activo,
        esFestivo: item.esFestivo || false
      }));

      console.log('Horarios a enviar:', horariosParaBackend);

      // Verificar si ya existen horarios para este parqueadero
      const horariosExistentes = await horarioService.getByParqueadero(parseInt(selectedParqueadero));
      
      if (horariosExistentes.success && horariosExistentes.horarios && horariosExistentes.horarios.length > 0) {
        // Ya existen horarios, eliminarlos primero
        console.log('Eliminando horarios existentes...');
        for (const horarioExistente of horariosExistentes.horarios) {
          await horarioService.delete(horarioExistente.id);
        }
      }

      // Crear los nuevos horarios
      console.log('Creando nuevos horarios...');
      for (const horario of horariosParaBackend) {
        await horarioService.create(horario);
      }

      toast.success(isEdit ? 'Horarios actualizados exitosamente' : 'Horarios creados exitosamente');
      resetForm();
      await cargarDatos(); // Recargar datos
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      toast.error('Error al guardar los horarios');
    }
  };

  const resetForm = () => {
    setFormData(
      diasSemana.map(dia => ({
        dia,
        horaApertura: dia === 'Festivos' ? '09:00' : '08:00',
        horaCierre: dia === 'Festivos' ? '17:00' : '18:00',
        activo: dia !== 'Domingo',
        esFestivo: dia === 'Festivos'
      }))
    );
    setSelectedParqueadero('');
    setShowModal(false);
    setIsEdit(false);
    setSelectedHorario(null);
    setScheduleType('PERSONALIZADO');
    setSelected24hDays([]);
  };

  const handleEdit = (horario: Horario) => {
    setSelectedHorario(horario);
    setSelectedParqueadero(horario.parqueaderoId.toString());
    setFormData(horario.horarios);
    setIsEdit(true);
    setShowModal(true);
    setScheduleType('PERSONALIZADO'); // al editar volvemos a personalizado para evitar sobrescrituras automáticas
  };

  // ...existing code...
  const handleDelete = async (horario: Horario) => {
    if (!window.confirm(`¿Estás seguro de eliminar todos los horarios de ${horario.nombreParqueadero}?`)) {
      return;
    }
    try {
      toast.info('Eliminando horarios...');
      // Obtener horarios existentes del backend
      const resp = await horarioService.getByParqueadero(horario.parqueaderoId);
      if (resp.success && resp.horarios && resp.horarios.length > 0) {
        for (const h of resp.horarios) {
          // Asegúrate que `h.id` existe; si tu backend usa otro campo ajusta aquí.
          await horarioService.delete(h.id);
        }
      } else {
        // Si el servicio soporta eliminar por parqueadero directamente, usarlo:
        // await horarioService.deleteByParqueadero?.(horario.parqueaderoId);
      }

      // Actualización optimista de la UI (remover el parqueadero de la lista)
      setHorarios(prev => prev.filter(p => p.parqueaderoId !== horario.parqueaderoId));

      // Asegurar sincronización final con el backend
      await cargarDatos();

      toast.success('Horarios eliminados exitosamente');
    } catch (error) {
      console.error('Error al eliminar horarios:', error);
      toast.error('Error al eliminar los horarios');
    }
  };
// ...existing code...

  const updateHorarioItem = (index: number, field: keyof HorarioItem, value: any) => {
    const nuevosHorarios = [...formData];
    nuevosHorarios[index] = { ...nuevosHorarios[index], [field]: value };
    setFormData(nuevosHorarios);
    // Si el usuario edita manualmente, forzamos tipo personalizado
    if (scheduleType !== 'PERSONALIZADO') {
      setScheduleType('PERSONALIZADO');
    }
  };

  const aplicarATodos = () => {
    // Solo aplicar cuando estamos en personalizado
    if (scheduleType !== 'PERSONALIZADO') {
      toast.info('Para aplicar valores por día debes estar en "Personalizado"');
      return;
    }
    const horarioBase = formData[0]; // Usar lunes como base
    const nuevosHorarios = formData.map(item => ({
      ...item,
      horaApertura: horarioBase.horaApertura,
      horaCierre: horarioBase.horaCierre,
      activo: true
    }));
    setFormData(nuevosHorarios);
    toast.info('Horario aplicado a todos los días');
  };

  const setHorario24h = () => {
    // Si está en personalizado, aplicar 24h a todos los días
    if (scheduleType === 'PERSONALIZADO') {
      const nuevosHorarios = formData.map(item => ({
        ...item,
        horaApertura: '00:00',
        horaCierre: '23:59',
        activo: true
      }));
      setFormData(nuevosHorarios);
      toast.info('Configurado para 24 horas (personalizado)');
      return;
    }
    // Si no, cambiar el tipo a 24H
    setScheduleType('24H');
    toast.info('Tipo de horario cambiado a 24 horas (estándar)');
  };

  // Construye un formData a partir del tipo seleccionado
  const buildFormFromType = (type: ScheduleType, dias24h: string[]): HorarioItem[] => {
    const esFestivo = (dia: string) => dia === 'Festivos';
    switch (type) {
      case 'DIURNO':
        return diasSemana.map(dia => ({
          dia,
          horaApertura: esFestivo(dia) ? '09:00' : '08:00',
          horaCierre: esFestivo(dia) ? '17:00' : '18:00',
          activo: dia !== 'Domingo',
          esFestivo: esFestivo(dia)
        }));
      case 'NOCTURNO':
        // Horario nocturno: apertura 18:00, cierre 06:00 (permite cruce de día)
        return diasSemana.map(dia => ({
          dia,
          horaApertura: '18:00',
          horaCierre: '06:00',
          activo: dia !== 'Domingo',
          esFestivo: esFestivo(dia)
        }));
      case '24H':
        return diasSemana.map(dia => ({
          dia,
          horaApertura: '00:00',
          horaCierre: '23:59',
          activo: true,
          esFestivo: esFestivo(dia)
        }));
      case '24H_PARCIAL':
        return diasSemana.map(dia => {
          const is24 = dias24h.includes(dia);
          return {
            dia,
            horaApertura: is24 ? '00:00' : (esFestivo(dia) ? '09:00' : '08:00'),
            horaCierre: is24 ? '23:59' : (esFestivo(dia) ? '17:00' : '18:00'),
            activo: is24 ? true : dia !== 'Domingo',
            esFestivo: esFestivo(dia)
          };
        });
      case 'PERSONALIZADO':
      default:
        return formData;
    }
  };

  const toggle24hDay = (dia: string) => {
    const exists = selected24hDays.includes(dia);
    const nuevos = exists ? selected24hDays.filter(d => d !== dia) : [...selected24hDays, dia];
    setSelected24hDays(nuevos);
  };

  const getStatusBadge = (horarios: HorarioItem[]) => {
    const diasActivos = horarios.filter(h => h.activo).length;
    if (diasActivos === 7) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Todos los días</span>;
    } else if (diasActivos >= 5) {
      return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">{diasActivos} días</span>;
    } else {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">{diasActivos} días</span>;
    }
  };

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horarios de Atención</h1>
          <p className="text-gray-600">Configura los horarios de operación de cada parqueadero</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus className="size-4 mr-2" />
          Nuevo Horario
        </button>
      </div>

      {/* Lista de Horarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : horarios.length > 0 ? (
          horarios.map((horario) => (
            <div key={horario.id} className="bg-white rounded-lg shadow border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{horario.nombreParqueadero}</h3>
                  <p className="text-sm text-gray-500">Creado: {new Date(horario.fechaCreacion).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(horario.horarios)}
                  <button
                    onClick={() => handleEdit(horario)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Editar horario"
                  >
                    <Edit className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(horario)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    title="Eliminar horario"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {horario.horarios.map((item) => (
                  <div 
                    key={item.dia} 
                    className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 ${
                      item.esFestivo ? 'bg-amber-50 px-2 rounded' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      {item.activo ? (
                        <CheckCircle className={`size-4 mr-2 ${item.esFestivo ? 'text-amber-500' : 'text-green-500'}`} />
                      ) : (
                        <AlertCircle className="size-4 text-gray-400 mr-2" />
                      )}
                      <span className={`font-medium ${item.activo ? (item.esFestivo ? 'text-amber-900' : 'text-gray-900') : 'text-gray-400'}`}>
                        {item.dia}
                        {item.esFestivo}
                      </span>
                    </div>
                    <div className={`text-sm ${item.activo ? (item.esFestivo ? 'text-amber-700' : 'text-gray-700') : 'text-gray-400'}`}>
                      {item.activo ? (
                        `${item.horaApertura} - ${item.horaCierre}`
                      ) : (
                        'Cerrado'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay horarios configurados</h3>
            <p className="text-gray-500">Crea el primer horario de atención para tus parqueaderos.</p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar horario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {isEdit ? 'Editar Horario de Atención' : 'Nuevo Horario de Atención'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Selección de Parqueadero */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parqueadero
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedParqueadero}
                  onChange={(e) => setSelectedParqueadero(e.target.value)}
                  disabled={isEdit}
                >
                  <option value="">Selecciona un parqueadero</option>
                  {parqueaderos.map((parqueadero) => (
                    <option key={parqueadero.id} value={parqueadero.id}>
                      {parqueadero.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección de tipo de horario (estándares vs personalizado) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de horario</label>
                <div className="flex flex-col gap-2">
                  <label className="inline-flex items-center">
                    <input type="radio" name="tipo" checked={scheduleType === 'DIURNO'} onChange={() => setScheduleType('DIURNO')} className="mr-2" />
                    Horario Diurno (08:00 - 18:00, domingos cerrados)
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="tipo" checked={scheduleType === 'NOCTURNO'} onChange={() => setScheduleType('NOCTURNO')} className="mr-2" />
                    Horario Nocturno (18:00 - 06:00)
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="tipo" checked={scheduleType === '24H'} onChange={() => setScheduleType('24H')} className="mr-2" />
                    24 Horas (todos los días)
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="tipo" checked={scheduleType === '24H_PARCIAL'} onChange={() => setScheduleType('24H_PARCIAL')} className="mr-2" />
                    24 Horas en días específicos
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="tipo" checked={scheduleType === 'PERSONALIZADO'} onChange={() => setScheduleType('PERSONALIZADO')} className="mr-2" />
                    Personalizado (configurar por día)
                  </label>
                </div>
              </div>

              {/* Si se elige 24H_PARCIAL, mostrar selector de días para 24h */}
              {scheduleType === '24H_PARCIAL' && (
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm font-medium text-gray-700 mb-2">Selecciona los días que serán 24 horas</div>
                  <div className="flex flex-wrap gap-2">
                    {diasSemana.filter(d => d !== 'Festivos').map(dia => (
                      <label key={dia} className="inline-flex items-center px-3 py-1 border rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected24hDays.includes(dia)}
                          onChange={() => toggle24hDay(dia)}
                          className="mr-2"
                        />
                        {dia}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Acciones rápidas */}
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  type="button"
                  onClick={aplicarATodos}
                  title="Aplicar horario de lunes a todos"
                  aria-label="Aplicar horario a todos los días"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  <CheckCircle className="size-4 mr-2" />
                  Aplicar a todos horario del lunes
                </button>

                <button
                  type="button"
                  onClick={setHorario24h}
                  title="Configurar 24 horas"
                  aria-label="Configurar horario 24 horas"
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                >
                  <Calendar className="size-4 mr-2" />
                 configurar 24 horas
                </button>
              </div>

              {/* Configuración por día (solo editable si PERSONALIZADO) */}
              {scheduleType === 'PERSONALIZADO' && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-900">Configuración por día</h4>
                    <div className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                      💡 Los festivos se aplican automáticamente según el calendario oficial
                    </div>
                  </div>
                  
                  {formData.map((item, index) => (
                    <div 
                      key={item.dia} 
                      className="grid grid-cols-12 gap-4 items-center p-3 rounded-md bg-gray-50"
                    >
                      <div className="col-span-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={item.activo}
                            onChange={(e) => updateHorarioItem(index, 'activo', e.target.checked)}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={scheduleType !== 'PERSONALIZADO'}
                          />
                          <span className="font-medium text-gray-700">
                            {item.dia}
                            {item.esFestivo}
                          </span>
                        </label>
                      </div>

                      <div className="col-span-4">
                        <input
                          type="time"
                          value={item.horaApertura}
                          onChange={(e) => updateHorarioItem(index, 'horaApertura', e.target.value)}
                          disabled={scheduleType !== 'PERSONALIZADO' || !item.activo}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>

                      <div className="col-span-1 text-center text-gray-500">-</div>

                      <div className="col-span-4">
                        <input
                          type="time"
                          value={item.horaCierre}
                          onChange={(e) => updateHorarioItem(index, 'horaCierre', e.target.value)}
                          disabled={scheduleType !== 'PERSONALIZADO' || !item.activo}
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Save className="size-4 mr-2" />
                  {isEdit ? 'Actualizar' : 'Guardar'} Horario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorariosAtencion;
