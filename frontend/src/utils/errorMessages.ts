/**
 * Mapeo de mensajes de error técnicos a mensajes amigables para el usuario
 */
export const errorMessages: Record<string, string> = {
  // Tarifas
  'No hay tarifa vigente': 'No hay tarifa configurada para este vehículo. Contacta al administrador.',
  'No hay tarifa vigente para': 'No hay tarifa configurada. Contacta al administrador.',
  
  // Horarios
  'Parqueadero cerrado': 'El parqueadero está cerrado. Verifica los horarios de atención.',
  'No hay horario configurado': 'No hay horario configurado para este parqueadero.',
  'Abre a las': 'El parqueadero aún no ha abierto. Intenta más tarde.',
  'Cerrado. Abre mañana': 'El parqueadero está cerrado. Abre mañana.',
  
  // Capacidad
  'Capacidad completa': 'El parqueadero está lleno. Intenta más tarde.',
  'No hay espacios disponibles': 'No hay espacios disponibles en este parqueadero.',
  
  // Vehículos
  'Vehículo no encontrado': 'El vehículo no existe. Regístralo primero.',
  'Placa duplicada': 'Ya existe un vehículo con esta placa.',
  'Formato de placa inválido': 'La placa debe tener formato ABC123 (3 letras + 3 números).',
  
  // Usuarios
  'Usuario no autorizado': 'No tienes permisos para esta acción.',
  'Usuario no encontrado': 'El usuario no existe.',
  'Contraseña incorrecta': 'La contraseña es incorrecta.',
  'Email ya registrado': 'Este email ya está registrado.',
  
  // Conexión
  'Error de conexión': 'Problema de conexión. Verifica tu internet.',
  'Network Error': 'No hay conexión a internet. Verifica tu conexión.',
  'ECONNREFUSED': 'El servidor no está disponible. Intenta más tarde.',
  'ENOTFOUND': 'No se puede conectar al servidor. Verifica tu conexión.',
  'timeout': 'La solicitud tardó demasiado. Intenta de nuevo.',
  
  // Autenticación
  'Token expirado': 'Tu sesión ha expirado. Inicia sesión de nuevo.',
  'Token inválido': 'Tu sesión es inválida. Inicia sesión de nuevo.',
  'No autorizado': 'Debes iniciar sesión para continuar.',
  'Acceso denegado': 'No tienes permisos para acceder a esto.',
  
  // Validación
  'Campo requerido': 'Este campo es obligatorio.',
  'Valor inválido': 'El valor ingresado no es válido.',
  'Formato inválido': 'El formato no es válido.',
  
  // Base de datos
  'Violación de clave única': 'Este registro ya existe.',
  'Referencia inválida': 'El registro referenciado no existe.',
  'Error de base de datos': 'Error en la base de datos. Intenta de nuevo.',
  
  // Servidor
  'Error interno del servidor': 'Error en el servidor. Intenta más tarde.',
  'Servicio no disponible': 'El servicio no está disponible. Intenta más tarde.',
  'Demasiadas solicitudes': 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.',
};

/**
 * Obtiene un mensaje amigable para un error
 */
export const obtenerMensajeAmigable = (errorMessage: string): string => {
  if (!errorMessage) {
    return 'Ocurrió un error desconocido. Intenta de nuevo.';
  }

  // Buscar coincidencia exacta
  if (errorMessages[errorMessage]) {
    return errorMessages[errorMessage];
  }

  // Buscar coincidencia parcial
  for (const [key, value] of Object.entries(errorMessages)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  // Si no hay coincidencia, devolver el mensaje original si es corto, sino un genérico
  if (errorMessage.length < 100) {
    return errorMessage;
  }

  return 'Ocurrió un error. Por favor, intenta de nuevo o contacta al soporte.';
};

/**
 * Categoriza el tipo de error
 */
export const categorizarError = (errorMessage: string): 'error' | 'warning' | 'info' => {
  if (errorMessage.includes('Demasiadas solicitudes')) {
    return 'warning';
  }
  if (errorMessage.includes('expirado') || errorMessage.includes('sesión')) {
    return 'info';
  }
  return 'error';
};
