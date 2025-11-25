import React, { useState } from 'react';
import { MapPin, Building, PartyPopper, Clock } from 'lucide-react';
import { parqueaderoService } from '../services/index';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface ParqueaderoData {
  nombre: string;
  direccion: string;
  ciudad: string;
  capacidadTotal: number;
  latitud?: number;
  longitud?: number;
}

const ParqueaderoWizard = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [createdParqueaderoId, setCreatedParqueaderoId] = useState<number | null>(null);
    const [formData, setFormData] = useState<ParqueaderoData>({
        nombre: '',
        direccion: '',
        ciudad: '',
        capacidadTotal: 0,
        latitud: undefined,
        longitud: undefined
    });

    const steps = [
        { id: 1, title: "Información Básica", icon: Building },
        { id: 2, title: "Ubicación", icon: MapPin },
        { id: 3, title: "Completado", icon: PartyPopper }
    ];

    const handleNextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1:
                if (!formData.nombre || !formData.direccion || !formData.ciudad || !formData.capacidadTotal) {
                    toast.error('Por favor completa todos los campos obligatorios');
                    return false;
                }
                if (formData.capacidadTotal <= 0) {
                    toast.error('La capacidad debe ser mayor a 0');
                    return false;
                }
                return true;
            case 2:
                // Validar coordenadas GPS si se proporcionaron
                if (formData.latitud !== undefined || formData.longitud !== undefined) {
                    // Si se proporciona una, ambas deben estar presentes
                    if (formData.latitud === undefined || formData.longitud === undefined) {
                        toast.error('Debes proporcionar tanto latitud como longitud, o dejar ambas vacías');
                        return false;
                    }
                    
                    // Validar rango de latitud (-90 a 90)
                    if (formData.latitud < -90 || formData.latitud > 90) {
                        toast.error('La latitud debe estar entre -90 y 90 grados');
                        return false;
                    }
                    
                    // Validar rango de longitud (-180 a 180)
                    if (formData.longitud < -180 || formData.longitud > 180) {
                        toast.error('La longitud debe estar entre -180 y 180 grados');
                        return false;
                    }
                    
                    // Validar que no sean exactamente 0,0 (Null Island - probablemente un error)
                    if (formData.latitud === 0 && formData.longitud === 0) {
                        toast.error('Las coordenadas 0,0 no son válidas. Por favor verifica los valores.');
                        return false;
                    }
                }
                return true;
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await parqueaderoService.create(formData);
            
            if (result.success) {
                toast.success('Parqueadero creado exitosamente');
                setCreatedParqueaderoId(result.parqueadero?.id || null);
                setCurrentStep(3);
            } else {
                toast.error(result.error || 'Error al crear el parqueadero');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };


    const resetForm = () => {
        setFormData({
            nombre: '',
            direccion: '',
            ciudad: '',
            capacidadTotal: 0,
            latitud: undefined,
            longitud: undefined
        });
        setCreatedParqueaderoId(null);
        setCurrentStep(1);
    };

    const handleGestionarHorario = () => {
        if (createdParqueaderoId) {
            navigate(`/parknow-horarios?parqueaderoId=${createdParqueaderoId}`);
        } else {
            navigate('/parknow-horarios');
        }
    };

    return (
        <div className="container-fluid group-data-[content=boxed]:max-w-boxed mx-auto">
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Registrar Nuevo Parqueadero</h1>
                <p className="text-slate-500">Complete el formulario paso a paso</p>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-12">
                <div className="col-span-12 2xl:col-start-3 2xl:col-span-8">
                    <div className="card">
                        <div className="card-body">
                            {/* Steps Navigation */}
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 nav-tabs form-wizard mb-5">
                                {steps.map((step) => {
                                    const Icon = step.icon;
                                    const isActive = currentStep === step.id;
                                    const isCompleted = currentStep > step.id;
                                    
                                    return (
                                        <div 
                                            key={step.id}
                                            className={`block px-4 py-5 text-center rounded-md border transition-colors ${
                                                isActive 
                                                    ? 'bg-blue-500 text-white border-blue-500' 
                                                    : isCompleted
                                                    ? 'bg-green-100 text-green-700 border-green-300'
                                                    : 'text-slate-500 bg-slate-50 border-slate-200'
                                            }`}
                                            style={isActive ? { backgroundColor: 'var(--park-blue)' } : {}}
                                        >
                                            <Icon className={`block h-6 mx-auto mb-2 ${
                                                isActive ? 'text-white' : isCompleted ? 'text-green-600' : 'text-slate-400'
                                            }`} />
                                            <span className="block font-medium text-sm">{step.id}. {step.title}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Step Content */}
                            <div className="tab-content">
                                {/* Step 1: Información Básica */}
                                {currentStep === 1 && (
                                    <div>
                                        <h5 className="mb-3 text-lg font-semibold">Información Básica</h5>
                                        
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="inline-block mb-2 text-base font-medium">
                                                    Nombre del Parqueadero <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-input w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                                                    placeholder="Ej: Parqueadero Central"
                                                    value={formData.nombre}
                                                    onChange={(e) => setFormData(prev => ({...prev, nombre: e.target.value}))}
                                                />
                                            </div>
                                            <div>
                                                <label className="inline-block mb-2 text-base font-medium">
                                                    Ciudad <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-input w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                                                    placeholder="Ej: Bogotá"
                                                    value={formData.ciudad}
                                                    onChange={(e) => setFormData(prev => ({...prev, ciudad: e.target.value}))}
                                                />
                                            </div>
                                            <div>
                                                <label className="inline-block mb-2 text-base font-medium">
                                                    Capacidad Total <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    className="form-input w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                                                    placeholder="100"
                                                    value={formData.capacidadTotal || ''}
                                                    onChange={(e) => setFormData(prev => ({...prev, capacidadTotal: parseInt(e.target.value) || 0}))}
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="inline-block mb-2 text-base font-medium">
                                                    Dirección <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    className="form-input w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                                                    rows={3}
                                                    placeholder="Dirección completa del parqueadero"
                                                    value={formData.direccion}
                                                    onChange={(e) => setFormData(prev => ({...prev, direccion: e.target.value}))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Ubicación */}
                                {currentStep === 2 && (
                                    <div>
                                        <h5 className="mb-3 text-lg font-semibold">Ubicación GPS (Opcional)</h5>
                                        <p className="mb-4 text-slate-600">
                                            Proporciona las coordenadas GPS para mostrar el parqueadero en el mapa.
                                        </p>
                                        
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="inline-block mb-2 text-base font-medium">
                                                    Latitud
                                                    <span className="ml-1 text-xs text-slate-500">(-90 a 90)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    min="-90"
                                                    max="90"
                                                    className="form-input w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                                                    placeholder="4.6097100"
                                                    value={formData.latitud || ''}
                                                    onChange={(e) => setFormData(prev => ({...prev, latitud: parseFloat(e.target.value) || undefined}))}
                                                />
                                                <p className="mt-1 text-xs text-slate-500">Ejemplo: 4.6097 (Bogotá)</p>
                                            </div>
                                            <div>
                                                <label className="inline-block mb-2 text-base font-medium">
                                                    Longitud
                                                    <span className="ml-1 text-xs text-slate-500">(-180 a 180)</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    min="-180"
                                                    max="180"
                                                    className="form-input w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                                                    placeholder="-74.0817500"
                                                    value={formData.longitud || ''}
                                                    onChange={(e) => setFormData(prev => ({...prev, longitud: parseFloat(e.target.value) || undefined}))}
                                                />
                                                <p className="mt-1 text-xs text-slate-500">Ejemplo: -74.0817 (Bogotá)</p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                            <p className="text-sm text-blue-700 mb-2">
                                                <strong>💡 Cómo obtener coordenadas:</strong>
                                            </p>
                                            <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                                                <li>Abre Google Maps en tu navegador</li>
                                                <li>Haz clic derecho en la ubicación del parqueadero</li>
                                                <li>Selecciona las coordenadas que aparecen en la parte superior</li>
                                                <li>Copia y pega aquí (primer número = latitud, segundo = longitud)</li>
                                            </ol>
                                        </div>

                                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                            <p className="text-xs text-amber-800">
                                                <strong>⚠️ Importante:</strong> Las coordenadas deben ser válidas y estar dentro de los rangos permitidos del planeta Tierra.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Completado */}
                                {currentStep === 3 && (
                                    <div>
                                        <div className="text-center py-4">
                                            <PartyPopper className="h-16 w-16 mx-auto mb-4 text-green-500" />
                                            <h5 className="mb-3 text-lg font-semibold text-green-700">¡Parqueadero Registrado!</h5>
                                            <p className="text-slate-600 mb-6">
                                                El parqueadero <strong>{formData.nombre}</strong> ha sido registrado exitosamente en el sistema.
                                            </p>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-md mb-4">
                                            <h6 className="font-semibold mb-3">Resumen:</h6>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="font-medium text-slate-600">Nombre:</span>
                                                    <p className="text-slate-900">{formData.nombre}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-600">Ciudad:</span>
                                                    <p className="text-slate-900">{formData.ciudad}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-600">Capacidad:</span>
                                                    <p className="text-slate-900">{formData.capacidadTotal} espacios</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <span className="font-medium text-slate-600">Dirección:</span>
                                                    <p className="text-slate-900">{formData.direccion}</p>
                                                </div>
                                                {formData.latitud && formData.longitud && (
                                                    <div className="md:col-span-2">
                                                        <span className="font-medium text-slate-600">Coordenadas:</span>
                                                        <p className="text-slate-900">{formData.latitud}, {formData.longitud}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Mapa */}
                                        {formData.latitud && formData.longitud ? (
                                            <div className="mb-4">
                                                <h6 className="font-semibold mb-3">Ubicación en el Mapa:</h6>
                                                <div className="border border-slate-200 rounded-md overflow-hidden" style={{ height: '400px' }}>
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        style={{ border: 0 }}
                                                        title={`Ubicación del parqueadero ${formData.nombre}`}
                                                        src={`https://www.google.com/maps?q=${formData.latitud},${formData.longitud}&hl=es&z=16&output=embed`}
                                                        allowFullScreen
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-4 p-4 bg-blue-50 rounded-md text-center">
                                                <MapPin className="h-12 w-12 mx-auto mb-2 text-blue-400" />
                                                <p className="text-sm text-blue-700">
                                                    No se proporcionaron coordenadas GPS para este parqueadero.
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                                            <button
                                                onClick={handleGestionarHorario}
                                                className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2 font-medium"
                                            >
                                                <Clock className="h-5 w-5" />
                                                Gestionar Horario
                                            </button>
                                            <button
                                                onClick={resetForm}
                                                className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
                                            >
                                                Registrar Otro Parqueadero
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Buttons */}
                            {currentStep < 3 && (
                                <div className="flex justify-between gap-2 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={handlePrevStep}
                                        disabled={currentStep === 1}
                                        className="px-4 py-2 text-slate-500 bg-slate-200 border border-slate-200 rounded-md hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ← Anterior
                                    </button>
                                    
                                    {currentStep === 2 ? (
                                        <button 
                                            type="button" 
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="px-4 py-2 text-white bg-green-500 border border-green-500 rounded-md hover:bg-green-600 disabled:opacity-50"
                                        >
                                            {loading ? 'Registrando...' : 'Registrar Parqueadero'}
                                        </button>
                                    ) : (
                                        <button 
                                            type="button" 
                                            onClick={handleNextStep}
                                            className="px-4 py-2 text-black border border-blue-500 rounded-md hover:bg-blue-600" style={{ backgroundColor: 'var(--park-blue)' }}
                                        >
                                            Siguiente →
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParqueaderoWizard;