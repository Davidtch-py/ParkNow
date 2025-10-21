import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Car, Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import '../assets/scss/parknow-colors.css';
import logo from '../assets/images/icon_ParkNow_horiz.png';

const LoginBoxed = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });

  const { login, isAuthenticated } = useAuth();

  // Log para debuggear recargas
  React.useEffect(() => {
    console.log('🔄 LoginBoxed component mounted/re-rendered');

    // Detectar si la página se está recargando
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('⚠️ Página está siendo recargada!');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = () => {
    const errors = { email: '', password: '' };
    let isValid = true;

    // Validación de email
    if (!email) {
      errors.email = 'El email es requerido';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Por favor ingresa un email válido';
        isValid = false;
      }
    }

    // Validación de contraseña
    if (!password) {
      errors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar propagación del evento

    // Limpiar errores previos
    setError('');
    setValidationErrors({ email: '', password: '' });

    // Validar formulario
    if (!validateForm()) {
      console.log('❌ Validación fallida, no continuar');
      return false; // Explicitly return false
    }

    setLoading(true);
    console.log('🔑 Intentando login con:', { email, password: '***' });

    try {
      const result = await login(email, password);
      console.log('📡 Respuesta del login:', result);

      if (!result.success) {
        // Evitar recarga de página - manejo de errores mejorado
        let errorMessage = 'Credenciales inválidas';

        // Mapear errores específicos del backend
        if (result.error?.toLowerCase().includes('usuario no encontrado')) {
          errorMessage = 'El correo electrónico no está registrado en el sistema';
        } else if (result.error?.toLowerCase().includes('contraseña incorrecta')) {
          errorMessage = 'La contraseña ingresada es incorrecta';
        } else if (result.error?.toLowerCase().includes('inactivo') || result.error?.toLowerCase().includes('desactivado')) {
          errorMessage = 'Usuario inactivo. Contacta al administrador';
        } else if (result.error?.toLowerCase().includes('conexión') || result.error?.toLowerCase().includes('network')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet';
        } else if (result.error) {
          // Usar el mensaje exacto del backend
          errorMessage = result.error;
        }

        // Mostrar error SIN recargar la página
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // NO hacer return aquí para evitar cualquier recarga
        console.log('❌ Login falló:', errorMessage);
        return false; // Prevent any default behavior
      } else {
        console.log('✅ Login exitoso, usuario:', result);
        setError(''); // Limpiar errores previos
        toast.success('¡Inicio de sesión exitoso!', {
          position: "top-right",
          autoClose: 3000,
        });
        // Login exitoso - React Router manejará la navegación
      }
    } catch (error) {
      console.error('💥 Error inesperado durante el inicio de sesión:', error);
      const errorMessage = 'Error inesperado en el cliente. Por favor intenta nuevamente.';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
      return false; // Prevent any default behavior
    } finally {
      setLoading(false);
    }

    return false; // Always prevent default form behavior
  };

  const fillDemoCredentials = (role: 'admin' | 'controlador') => {
    setError(''); // Limpiar errores al llenar credenciales
    setValidationErrors({ email: '', password: '' });

    if (role === 'admin') {
      setEmail('admin@parqueadero.com');
      setPassword('password');
    } else {
      setEmail('juan.perez@parqueadero.com');
      setPassword('password');
    }
  };



  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-16 bg-gradient-park">
      <div className="w-full max-w-6xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          {/* Left Side - Login Form */}
          <div className="lg:col-span-5 p-8 lg:p-12">
            <div className="max-w-md mx-auto">
              {/* Logo & Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'rgba(152, 202, 229, 0.1)' } as React.CSSProperties}>
                  <Car className="w-8 h-8" style={{ color: 'var(--park-blue)' } as React.CSSProperties} />
                </div>
                <div className="mb-2">
                  <img src={logo} alt="ParkNow Logo" className="mx-auto h-20 w-auto" />
                </div>
                <p className="text-gray-600">Sistema de Gestión de Parqueaderos</p>
              </div>

              {/* Error General */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-800 text-sm font-medium">Error de inicio de sesión</p>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
                noValidate
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target !== document.activeElement) {
                    e.preventDefault();
                  }
                }}
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--park-black)' } as React.CSSProperties}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors ${validationErrors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300'
                      }`}
                    style={{
                      borderColor: validationErrors.email ? 'rgb(252 165 165)' : 'rgb(209, 213, 219)'
                    } as React.CSSProperties}
                    placeholder="admin@parqueadero.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (validationErrors.email) {
                        setValidationErrors(prev => ({ ...prev, email: '' }));
                      }
                      if (error) setError('');
                    }}
                    disabled={loading}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--park-black)' } as React.CSSProperties}>
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 transition-colors ${validationErrors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-300'
                        }`}
                      style={{
                        borderColor: validationErrors.password ? 'rgb(252 165 165)' : 'rgb(209, 213, 219)'
                      } as React.CSSProperties}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (validationErrors.password) {
                          setValidationErrors(prev => ({ ...prev, password: '' }));
                        }
                        if (error) setError('');
                      }}
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                      style={{
                        accentColor: 'var(--park-blue)',
                        borderColor: 'var(--park-blue)'
                      }}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                  </label>
                  <a href="#" className="text-sm transition-colors" style={{ color: 'var(--park-blue-dark)' } as React.CSSProperties}>
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  onClick={(e) => {
                    console.log('🖱️ Botón submit clickeado');
                    // No need to prevent default here, handleSubmit will handle it
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 text-white font-medium rounded-lg focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'rgb(152, 202, 229)'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'var(--park-blue-dark)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = 'rgb(152, 202, 229)';
                    }
                  }}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Iniciando sesión...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="h-5 w-5 mr-2" />
                      Iniciar Sesión
                    </div>
                  )}
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: 'var(--park-cream-light)' }}>
                <div className="flex items-center mb-3">
                  <Info className="h-4 w-4 mr-2" style={{ color: 'var(--park-blue-dark)' }} />
                  <h3 className="text-sm font-medium" style={{ color: 'var(--park-black)' }}>
                    Credenciales de Demostración:
                  </h3>
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('admin')}
                    className="w-full text-left px-3 py-2 text-sm bg-white border rounded transition-all"
                    style={{
                      borderColor: 'rgb(210, 205, 190)'
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(152, 202, 229, 0.1)';
                      e.currentTarget.style.borderColor = 'rgb(152, 202, 229)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = 'rgb(210, 205, 190)';
                    }}
                    disabled={loading}
                  >
                    <div className="font-medium" style={{ color: 'var(--park-blue-dark)' } as React.CSSProperties}>
                      👑 Administrador
                    </div>
                    <div className="text-gray-500">admin@parqueadero.com</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('controlador')}
                    className="w-full text-left px-3 py-2 text-sm bg-white border rounded transition-all"
                    style={{
                      borderColor: 'rgb(210, 205, 190)'
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(152, 202, 229, 0.1)';
                      e.currentTarget.style.borderColor = 'rgb(152, 202, 229)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = 'rgb(210, 205, 190)';
                    }}
                    disabled={loading}
                  >
                    <div className="font-medium" style={{ color: 'rgb(120, 170, 200)' } as React.CSSProperties}>
                      👨‍💼 Controlador
                    </div>
                    <div className="text-gray-500">juan.perez@parqueadero.com</div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Contraseña para ambos: <strong>password</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Info Panel */}
          <div className="lg:col-span-7 text-white p-8 lg:p-12 flex flex-col bg-gradient-park-reverse">
            <div className="flex-1 flex flex-col justify-center">
              <div className="max-w-lg">
                <h2 className="text-4xl font-bold mb-6" style={{ color: 'rgb(0, 0, 0)' } as React.CSSProperties}>
                  Gestión Inteligente de Parqueaderos
                </h2>
                <p className="text-lg mb-8 leading-relaxed" style={{ color: 'rgb(0, 0, 0)', opacity: 0.8 } as React.CSSProperties}>
                  Controla y administra tus parqueaderos de manera eficiente con nuestro sistema integral de gestión.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgb(152, 202, 229)' } as React.CSSProperties}>
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: 'rgb(0, 0, 0)' } as React.CSSProperties}>
                        Monitoreo en Tiempo Real
                      </h3>
                      <p className="text-sm" style={{ color: 'rgb(0, 0, 0)', opacity: 0.7 } as React.CSSProperties}>
                        Visualiza la ocupación y disponibilidad al instante
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgb(152, 202, 229)' } as React.CSSProperties}>
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: 'rgb(0, 0, 0)' } as React.CSSProperties}>
                        Gestión de Tarifas
                      </h3>
                      <p className="text-sm" style={{ color: 'rgb(0, 0, 0)', opacity: 0.7 } as React.CSSProperties}>
                        Configura tarifas flexibles por tipo de vehículo
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgb(152, 202, 229)' } as React.CSSProperties}>
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: 'rgb(0, 0, 0)' } as React.CSSProperties}>
                        Reportes Detallados
                      </h3>
                      <p className="text-sm" style={{ color: 'rgb(0, 0, 0)', opacity: 0.7 } as React.CSSProperties}>
                        Genera reportes por fecha, controlador y tipo de vehículo
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'rgb(152, 202, 229)' } as React.CSSProperties}>
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--park-black)' } as React.CSSProperties}>
                        Alertas Inteligentes
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--park-black)', opacity: 0.7 } as React.CSSProperties}>
                        Recibe notificaciones cuando la capacidad sea limitada
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="mt-8 opacity-30">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-16 rounded-lg" style={{ backgroundColor: 'rgb(152, 202, 229)' } as React.CSSProperties}></div>
                <div className="h-16 rounded-lg" style={{ backgroundColor: 'rgb(233, 229, 217)' } as React.CSSProperties}></div>
                <div className="h-16 rounded-lg" style={{ backgroundColor: 'rgb(120, 170, 200)' } as React.CSSProperties}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginBoxed;