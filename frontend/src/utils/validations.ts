/**
 * Validaciones para formularios
 */

export const validaciones = {
  // Validar placa (formato: ABC123 o ABC-123)
  placa: (placa: string): { valido: boolean; error?: string } => {
    if (!placa) return { valido: false, error: 'La placa es requerida' };
    if (placa.length < 4) return { valido: false, error: 'La placa debe tener al menos 4 caracteres' };
    if (placa.length > 10) return { valido: false, error: 'La placa no puede exceder 10 caracteres' };
    return { valido: true };
  },

  // Validar teléfono
  telefono: (telefono: string): { valido: boolean; error?: string } => {
    if (!telefono) return { valido: true }; // Opcional
    if (telefono.length < 7) return { valido: false, error: 'El teléfono debe tener al menos 7 dígitos' };
    if (telefono.length > 15) return { valido: false, error: 'El teléfono no puede exceder 15 dígitos' };
    if (!/^\d+$/.test(telefono)) return { valido: false, error: 'El teléfono solo puede contener números' };
    return { valido: true };
  },

  // Validar propietario
  propietario: (propietario: string): { valido: boolean; error?: string } => {
    if (!propietario) return { valido: true }; // Opcional
    if (propietario.length < 3) return { valido: false, error: 'El nombre debe tener al menos 3 caracteres' };
    if (propietario.length > 100) return { valido: false, error: 'El nombre no puede exceder 100 caracteres' };
    return { valido: true };
  },

  // Validar color
  color: (color: string): { valido: boolean; error?: string } => {
    if (!color) return { valido: false, error: 'El color es requerido' };
    if (color.length < 3) return { valido: false, error: 'El color debe tener al menos 3 caracteres' };
    if (color.length > 30) return { valido: false, error: 'El color no puede exceder 30 caracteres' };
    return { valido: true };
  },

  // Validar marca
  marca: (marca: string): { valido: boolean; error?: string } => {
    if (!marca) return { valido: true }; // Opcional
    if (marca.length < 2) return { valido: false, error: 'La marca debe tener al menos 2 caracteres' };
    if (marca.length > 50) return { valido: false, error: 'La marca no puede exceder 50 caracteres' };
    return { valido: true };
  },

  // Validar modelo
  modelo: (modelo: string): { valido: boolean; error?: string } => {
    if (!modelo) return { valido: true }; // Opcional
    if (modelo.length < 2) return { valido: false, error: 'El modelo debe tener al menos 2 caracteres' };
    if (modelo.length > 50) return { valido: false, error: 'El modelo no puede exceder 50 caracteres' };
    return { valido: true };
  },

  // Validar tipo de vehículo
  tipoVehiculo: (tipo: string): { valido: boolean; error?: string } => {
    const tiposValidos = ['carro', 'moto', 'bicicleta'];
    if (!tipo) return { valido: false, error: 'El tipo de vehículo es requerido' };
    if (!tiposValidos.includes(tipo)) return { valido: false, error: 'Tipo de vehículo inválido' };
    return { valido: true };
  },

  // Validar formulario completo de vehículo
  vehiculoCompleto: (vehiculo: any): { valido: boolean; errores: Record<string, string> } => {
    const errores: Record<string, string> = {};

    const validacionPlaca = validaciones.placa(vehiculo.placa);
    if (!validacionPlaca.valido) errores.placa = validacionPlaca.error || '';

    const validacionTipo = validaciones.tipoVehiculo(vehiculo.tipo);
    if (!validacionTipo.valido) errores.tipo = validacionTipo.error || '';

    const validacionColor = validaciones.color(vehiculo.color);
    if (!validacionColor.valido) errores.color = validacionColor.error || '';

    const validacionPropietario = validaciones.propietario(vehiculo.propietario);
    if (!validacionPropietario.valido) errores.propietario = validacionPropietario.error || '';

    const validacionTelefono = validaciones.telefono(vehiculo.telefono);
    if (!validacionTelefono.valido) errores.telefono = validacionTelefono.error || '';

    const validacionMarca = validaciones.marca(vehiculo.marca);
    if (!validacionMarca.valido) errores.marca = validacionMarca.error || '';

    const validacionModelo = validaciones.modelo(vehiculo.modelo);
    if (!validacionModelo.valido) errores.modelo = validacionModelo.error || '';

    return {
      valido: Object.keys(errores).length === 0,
      errores
    };
  },

  // Validar entrada
  entrada: (entrada: any): { valido: boolean; errores: Record<string, string> } => {
    const errores: Record<string, string> = {};

    if (!entrada.vehiculoId) errores.vehiculoId = 'Debe seleccionar un vehículo';
    if (!entrada.parqueaderoId) errores.parqueaderoId = 'Debe seleccionar un parqueadero';

    return {
      valido: Object.keys(errores).length === 0,
      errores
    };
  }
};
