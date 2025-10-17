import React, { useState, useEffect } from 'react';
import { Save, Edit, Trash2, Plus, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface HorarioItem {
  dia: string;
  horaApertura: string;
  horaCierre: string;
  activo: boolean;
}

interface Horario {
  id: number;
  parqueaderoId: number;
  nombreParqueadero: string;
  horarios: HorarioItem[];
  fechaCreacion: string;
}

const HorariosAtencion = () => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [parqueaderos, setParqueaderos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedHorario, setSelectedHorario] = useState<Horario | null>(null);
  const [selectedParqueadero, setSelectedParqueadero] = useState('');

  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  const [formData, setFormData] = useState<HorarioItem[]>(
    diasSemana.map(dia => ({
      dia,
      horaApertura: '08:00',
      horaCierre: '18:00',
      activo: dia !== 'Domingo' // Por defecto domingo cerrado
    }))
  );

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Simular carga de parqueaderos (esto vendría del servicio real)
      const parqueaderosMock = [
        { id: 1, nombre: 'Parqueadero Central' },
        { id: 2, nombre: 'Plaza Norte' },
        { id: 3, nombre: 'Centro Comercial' }
      ];
      setParqueaderos(parqueaderosMock);

      // Simular carga de horarios existentes
      const horariosMock: Horario[] = [
        {
          id: 1,
          parqueaderoId: 1,
          nombreParqueadero: 'Parqueadero Central',
          fechaCreacion: '2024-01-15',
          horarios: [
            { dia: 'Lunes', horaApertura: '07:00', horaCierre: '20:00', activo: true },
            { dia: 'Martes', horaApertura: '07:00', horaCierre: '20:00', activo: true },
            { dia: 'Miércoles', horaApertura: '07:00', horaCierre: '20:00', activo: true },
            { dia: 'Jueves', horaApertura: '07:00', horaCierre: '20:00', activo: true },
            { dia: 'Viernes', horaApertura: '07:00', horaCierre: '22:00', activo: true },
            { dia: 'Sábado', horaApertura: '08:00', horaCierre: '22:00', activo: true },
            { dia: 'Domingo', horaApertura: '09:00', horaCierre: '18:00', activo: true }
          ]
        },
        {
          id: 2,
          parqueaderoId: 2,
          nombreParqueadero: 'Plaza Norte',
          fechaCreacion: '2024-02-01',
          horarios: [
            { dia: 'Lunes', horaApertura: '06:00', horaCierre: '23:59', activo: true },
            { dia: 'Martes', horaApertura: '06:00', horaCierre: '23:59', activo: true },
            { dia: 'Miércoles', horaApertura: '06:00', horaCierre: '23:59', activo: true },
            { dia: 'Jueves', horaApertura: '06:00', horaCierre: '23:59', activo: true },
            { dia: 'Viernes', horaApertura: '06:00', horaCierre: '23:59', activo: true },
            { dia: 'Sábado', horaApertura: '06:00', horaCierre: '23:59', activo: true },
            { dia: 'Domingo', horaApertura: '06:00', horaCierre: '23:59', activo: true }
          ]
        }
      ];
      setHorarios(horariosMock);

    } catch (error) {
      toast.error('Error cargando datos');
    } finally {
      setLoading(false);
    }
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

    // Validar horarios
    for (const item of diasActivos) {
      if (item.horaApertura >= item.horaCierre) {
        toast.error(`El horario del ${item.dia} es inválido: la hora de cierre debe ser posterior a la apertura`);
        return;
      }
    }

    try {
      const parqueadero = parqueaderos.find(p => p.id === parseInt(selectedParqueadero));
      
      if (isEdit && selectedHorario) {
        // Actualizar horario existente
        const horariosActualizados = horarios.map(h => 
          h.id === selectedHorario.id 
            ? { ...h, horarios: formData, parqueaderoId: parseInt(selectedParqueadero), nombreParqueadero: parqueadero.nombre }
            : h
        );
        setHorarios(horariosActualizados);
        toast.success('Horario actualizado exitosamente');
      } else {
        // Crear nuevo horario
        const nuevoHorario: Horario = {
          id: Date.now(),
          parqueaderoId: parseInt(selectedParqueadero),
          nombreParqueadero: parqueadero.nombre,
          horarios: formData,
          fechaCreacion: new Date().toISOString().split('T')[0]
        };
        setHorarios([...horarios, nuevoHorario]);
        toast.success('Horario creado exitosamente');
      }
      
      resetForm();
    } catch (error) {
      toast.error('Error al guardar el horario');
    }
  };

  const resetForm = () => {
    setFormData(
      diasSemana.map(dia => ({
        dia,
        horaApertura: '08:00',
        horaCierre: '18:00',
        activo: dia !== 'Domingo'
      }))
    );
    setSelectedParqueadero('');
    setShowModal(false);
    setIsEdit(false);
    setSelectedHorario(null);
  };

  const handleEdit = (horario: Horario) => {
    setSelectedHorario(horario);
    setSelectedParqueadero(horario.parqueaderoId.toString());
    setFormData(horario.horarios);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = (horario: Horario) => {
    if (window.confirm(`¿Estás seguro de eliminar el horario de ${horario.nombreParqueadero}?`)) {
      const horariosActualizados = horarios.filter(h => h.id !== horario.id);
      setHorarios(horariosActualizados);
      toast.success('Horario eliminado exitosamente');
    }
  };

  const updateHorarioItem = (index: number, field: keyof HorarioItem, value: any) => {
    const nuevosHorarios = [...formData];
    nuevosHorarios[index] = { ...nuevosHorarios[index], [field]: value };
    setFormData(nuevosHorarios);
  };

  const aplicarATodos = () => {
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
    const nuevosHorarios = formData.map(item => ({
      ...item,
      horaApertura: '00:00',
      horaCierre: '23:59',
      activo: true
    }));
    setFormData(nuevosHorarios);
    toast.info('Configurado para 24 horas');
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
          onClick={() => setShowModal(true)}
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
                  <div key={item.dia} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      {item.activo ? (
                        <CheckCircle className="size-4 text-green-500 mr-2" />
                      ) : (
                        <AlertCircle className="size-4 text-gray-400 mr-2" />
                      )}
                      <span className={`font-medium ${item.activo ? 'text-gray-900' : 'text-gray-400'}`}>
                        {item.dia}
                      </span>
                    </div>
                    <div className={`text-sm ${item.activo ? 'text-gray-700' : 'text-gray-400'}`}>
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

              {/* Acciones rápidas */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={aplicarATodos}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  Aplicar horario de lunes a todos
                </button>
                <button
                  type="button"
                  onClick={setHorario24h}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Configurar 24 horas
                </button>
              </div>

              {/* Configuración por día */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Configuración por día</h4>
                
                {formData.map((item, index) => (
                  <div key={item.dia} className="grid grid-cols-12 gap-4 items-center p-3 bg-gray-50 rounded-md">
                    <div className="col-span-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={item.activo}
                          onChange={(e) => updateHorarioItem(index, 'activo', e.target.checked)}
                          className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="font-medium text-gray-700">{item.dia}</span>
                      </label>
                    </div>

                    <div className="col-span-4">
                      <input
                        type="time"
                        value={item.horaApertura}
                        onChange={(e) => updateHorarioItem(index, 'horaApertura', e.target.value)}
                        disabled={!item.activo}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>

                    <div className="col-span-1 text-center text-gray-500">-</div>

                    <div className="col-span-4">
                      <input
                        type="time"
                        value={item.horaCierre}
                        onChange={(e) => updateHorarioItem(index, 'horaCierre', e.target.value)}
                        disabled={!item.activo}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                  </div>
                ))}
              </div>

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