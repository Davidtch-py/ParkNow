import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, MapPin, Clock, Users, Car, Building, Calendar, PartyPopper } from 'lucide-react';
import { parqueaderoService } from '../services/index';
import { toast } from 'react-toastify';

interface ParqueaderoData {
  nombre: string;
  direccion: string;
  capacidadTotal: number;
  latitud?: number;
  longitud?: number;
  tipo: 'publico' | 'privado';
  tamaño: 'pequeño' | 'mediano' | 'grande';
  servicios: string[];
}

const ParqueaderoWizard = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ParqueaderoData>({
        nombre: '',
        direccion: '',
        capacidadTotal: 0,
        latitud: undefined,
        longitud: undefined,
        tipo: 'publico',
        tamaño: 'mediano',
        servicios: []
    });

    const steps = [
        { id: 1, title: "Información Básica", icon: Building },
        { id: 2, title: "Ubicación", icon: MapPin },
        { id: 3, title: "Servicios", icon: Calendar },
        { id: 4, title: "Completado", icon: PartyPopper }
    ];

    const handleNextStep = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1:
                if (!formData.nombre || !formData.direccion || !formData.capacidadTotal) {
                    toast.error('Por favor completa todos los campos obligatorios');
                    return false;
                }
                if (formData.capacidadTotal <= 0) {
                    toast.error('La capacidad debe ser mayor a 0');
                    return false;
                }
                return true;
            case 2:
                return true; // Ubicación es opcional
            case 3:
                return true; // Servicios son opcionales
            default:
                return true;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const result = await parqueaderoService.create({
                ...formData,
                capacidadDisponible: formData.capacidadTotal
            });
            
            if (result.success) {
                toast.success('Parqueadero creado exitosamente');
                setCurrentStep(4);
            } else {
                toast.error(result.error || 'Error al crear el parqueadero');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceToggle = (service: string) => {
        setFormData(prev => ({
            ...prev,
            servicios: prev.servicios.includes(service)
                ? prev.servicios.filter(s => s !== service)
                : [...prev.servicios, service]
        }));
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            direccion: '',
            capacidadTotal: 0,
            latitud: undefined,
            longitud: undefined,
            tipo: 'publico',
            tamaño: 'mediano',
            servicios: []
        });
        setCurrentStep(1);
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
                            <div className="grid grid-cols-1 gap-3 lg:grid-cols-4 nav-tabs form-wizard mb-5">
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
                                        
                                        {/* Tipo de Parqueadero */}
                                        <label className="inline-block mb-3 text-base font-medium">
                                            Tipo de Parqueadero <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-1 gap-3 mb-4 md:grid-cols-2">
                                            <div>
                                                <input 
                                                    id="publicoRadio" 
                                                    name="tipo" 
                                                    type="radio" 
                                                    value="publico"
                                                    checked={formData.tipo === 'publico'}
                                                    onChange={(e) => setFormData(prev => ({...prev, tipo: e.target.value as 'publico' | 'privado'}))}
                                                    className="hidden peer"
                                                />
                                                <label 
                                                    htmlFor="publicoRadio" 
                                                    className="block px-3 text-center border rounded-md cursor-pointer border-slate-200 py-7 text-slate-500 peer-checked:border-blue-500 peer-checked:text-blue-500 hover:border-blue-300"
                                                >
                                                    <Building className="block size-8 mx-auto mb-3" />
                                                    <span className="block font-medium">Público</span>
                                                </label>
                                            </div>
                                            <div>
                                                <input 
                                                    id="privadoRadio" 
                                                    name="tipo" 
                                                    type="radio" 
                                                    value="privado"
                                                    checked={formData.tipo === 'privado'}
                                                    onChange={(e) => setFormData(prev => ({...prev, tipo: e.target.value as 'publico' | 'privado'}))}
                                                    className="hidden peer"
                                                />
                                                <label 
                                                    htmlFor="privadoRadio" 
                                                    className="block px-3 text-center border rounded-md cursor-pointer border-slate-200 py-7 text-slate-500 peer-checked:border-blue-500 peer-checked:text-blue-500 hover:border-blue-300"
                                                >
                                                    <Building className="block size-8 mx-auto mb-3" />
                                                    <span className="block font-medium">Privado</span>
                                                </label>
                                            </div>
                                        </div>

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
                                            <div>
                                                <label className="inline-block mb-2 text-base font-medium">Tamaño</label>
                                                <select
                                                    className="form-input w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                                                    value={formData.tamaño}
                                                    onChange={(e) => setFormData(prev => ({...prev, tamaño: e.target.value as 'pequeño' | 'mediano' | 'grande'}))}
                                                >
                                                    <option value="pequeño">Pequeño (1-50 espacios)</option>
                                                    <option value="mediano">Mediano (51-200 espacios)</option>
                                                    <option value="grande">Grande (200+ espacios)</option>
                                                </select>
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
                                                <label className="inline-block mb-2 text-base font-medium">Latitud</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    className="form-input w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                                                    placeholder="4.6097100"
                                                    value={formData.latitud || ''}
                                                    onChange={(e) => setFormData(prev => ({...prev, latitud: parseFloat(e.target.value) || undefined}))}
                                                />
                                            </div>
                                            <div>
                                                <label className="inline-block mb-2 text-base font-medium">Longitud</label>
                                                <input
                                                    type="number"
                                                    step="any"
                                                    className="form-input w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:border-blue-500"
                                                    placeholder="-74.0817500"
                                                    value={formData.longitud || ''}
                                                    onChange={(e) => setFormData(prev => ({...prev, longitud: parseFloat(e.target.value) || undefined}))}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 p-4 bg-blue-50 rounded-md">
                                            <p className="text-sm text-blue-700">
                                                <strong>Consejo:</strong> Puedes obtener las coordenadas desde Google Maps haciendo clic derecho en la ubicación.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Servicios */}
                                {currentStep === 3 && (
                                    <div>
                                        <h5 className="mb-3 text-lg font-semibold">Servicios Disponibles</h5>
                                        <p className="mb-4 text-slate-600">
                                            Selecciona los servicios que ofrece este parqueadero.
                                        </p>
                                        
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                            {[
                                                'Seguridad 24/7',
                                                'Cámaras de vigilancia',
                                                'Techo cubierto',
                                                'Lavado de vehículos',
                                                'Carga eléctrica',
                                                'Acceso discapacitados',
                                                'Espacios grandes',
                                                'Ventilación',
                                                'Iluminación LED'
                                            ].map((service) => (
                                                <div key={service} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={service}
                                                        checked={formData.servicios.includes(service)}
                                                        onChange={() => handleServiceToggle(service)}
                                                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <label htmlFor={service} className="text-sm font-medium text-gray-700">
                                                        {service}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Completado */}
                                {currentStep === 4 && (
                                    <div className="text-center py-8">
                                        <PartyPopper className="h-16 w-16 mx-auto mb-4 text-green-500" />
                                        <h5 className="mb-3 text-lg font-semibold text-green-700">¡Parqueadero Registrado!</h5>
                                        <p className="text-slate-600 mb-6">
                                            El parqueadero <strong>{formData.nombre}</strong> ha sido registrado exitosamente en el sistema.
                                        </p>
                                        
                                        <div className="bg-gray-50 p-4 rounded-md mb-4 text-left">
                                            <h6 className="font-semibold mb-2">Resumen:</h6>
                                            <ul className="text-sm space-y-1">
                                                <li><strong>Nombre:</strong> {formData.nombre}</li>
                                                <li><strong>Tipo:</strong> {formData.tipo}</li>
                                                <li><strong>Capacidad:</strong> {formData.capacidadTotal} espacios</li>
                                                <li><strong>Dirección:</strong> {formData.direccion}</li>
                                                {formData.servicios.length > 0 && (
                                                    <li><strong>Servicios:</strong> {formData.servicios.join(', ')}</li>
                                                )}
                                            </ul>
                                        </div>
                                        
                                        <button
                                            onClick={resetForm}
                                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                        >
                                            Registrar Otro Parqueadero
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Buttons */}
                            {currentStep < 4 && (
                                <div className="flex justify-between gap-2 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={handlePrevStep}
                                        disabled={currentStep === 1}
                                        className="px-4 py-2 text-slate-500 bg-slate-200 border border-slate-200 rounded-md hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ← Anterior
                                    </button>
                                    
                                    {currentStep === 3 ? (
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
                                            className="px-4 py-2 text-white bg-blue-500 border border-blue-500 rounded-md hover:bg-blue-600"
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