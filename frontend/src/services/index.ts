import api from './api.js';

export const authService = {
  async login(email: string, password: string) {
    console.log('🚀 [authService] Iniciando login para:', email);
    console.log('🚀 [authService] Datos a enviar:', { email, password: '***' });
    
    try {
      console.log('🔄 [authService] Enviando petición POST a:', '/auth/login');
      console.log('🔄 [authService] URL completa esperada:', 'http://localhost:3000/api/auth/login');
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('📡 [authService] Respuesta completa recibida:', response);
      console.log('📄 [authService] Data de la respuesta:', response.data);
      console.log('📊 [authService] Status de la respuesta:', response.status);
      
      if (response.data.success) {
        console.log('✅ [authService] Login exitoso, guardando datos...');
        localStorage.setItem('token', response.data.token);
        
        // Si es controlador, cargar parqueaderos asignados
        const usuario = response.data.usuario;
        if (usuario.rol === 'CONTROLADOR' || usuario.rol === 'controlador') {
          try {
            const parqueaderosResponse = await api.get(`/parqueaderos-usuarios/controlador/${usuario.id}`);
            if (parqueaderosResponse.data.success && parqueaderosResponse.data.parqueaderos) {
              usuario.parqueaderosAsignados = parqueaderosResponse.data.parqueaderos.map((p: any) => p.id);
              console.log('📍 [authService] Parqueaderos asignados cargados:', usuario.parqueaderosAsignados);
            }
          } catch (error) {
            console.warn('⚠️ [authService] No se pudieron cargar parqueaderos asignados:', error);
            usuario.parqueaderosAsignados = [];
          }
        }
        
        localStorage.setItem('user', JSON.stringify(usuario));
        console.log('💾 [authService] Token y usuario guardados en localStorage');
      } else {
        console.log('❌ [authService] Login falló según response.data.success');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('💥 [authService] Error capturado:', error);
      console.error('💥 [authService] Tipo de error:', error.constructor.name);
      console.error('💥 [authService] Stack trace:', error.stack);
      
      // Si hay respuesta del servidor pero con error (4xx, 5xx)
      if (error.response) {
        console.log('🔍 [authService] Error con respuesta del servidor:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Retornar el error exacto del backend
        return {
          success: false,
          error: error.response.data?.error || `Error del servidor: ${error.response.status}`
        };
      }
      
      // Si es un error de petición (request) - no hay respuesta
      if (error.request) {
        console.log('📤 [authService] Error de petición (sin respuesta del servidor)');
        return {
          success: false,
          error: 'No se pudo conectar al servidor. Verifica que el backend esté corriendo en puerto 3000.'
        };
      }
      
      // Error de configuración u otro
      console.log('⚙️ [authService] Error de configuración:', error.message);
      return {
        success: false,
        error: `Error de configuración: ${error.message}`
      };
    }
  },

  async register(userData: any) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout() {
    // Limpiar datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // NO usar window.location.href - dejar que React Router maneje la navegación
    console.log('Sesión cerrada correctamente');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export const vehiculoService = {
  async getAll() {
    const response = await api.get('/vehiculos');
    return response.data;
  },

  async getById(id: string | number) {
    const response = await api.get(`/vehiculos/${id}`);
    return response.data;
  },

  async create(vehiculoData: any) {
    const response = await api.post('/vehiculos', vehiculoData);
    return response.data;
  },

  async update(id: string | number, vehiculoData: any) {
    const response = await api.put(`/vehiculos/${id}`, vehiculoData);
    return response.data;
  },

  async delete(id: string | number) {
    const response = await api.delete(`/vehiculos/${id}`);
    return response.data;
  },

  async getByPlaca(placa: string) {
    const response = await api.get(`/vehiculos/placa/${placa}`);
    return response.data;
  },

  async getByTipo(tipo: string) {
    const response = await api.get(`/vehiculos/tipo/${tipo}`);
    return response.data;
  }
};

export const parqueaderoService = {
  async getAll() {
    try {
      const response = await api.get('/parqueaderos');
      return response.data;
    } catch (error: any) {
      console.error('Error en parqueaderoService.getAll:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, error: error.message || 'Error de conexión' };
    }
  },

  async getById(id: string | number) {
    const response = await api.get(`/parqueaderos/${id}`);
    return response.data;
  },

  async create(parqueaderoData: any) {
    const response = await api.post('/parqueaderos', parqueaderoData);
    return response.data;
  },

  async update(id: string | number, parqueaderoData: any) {
    const response = await api.put(`/parqueaderos/${id}`, parqueaderoData);
    return response.data;
  },

  async delete(id: string | number) {
    const response = await api.delete(`/parqueaderos/${id}`);
    return response.data;
  },

  async getCapacidadBaja(umbral: number = 10) {
    const response = await api.get(`/parqueaderos/alertas/capacidad-baja?umbral=${umbral}`);
    return response.data;
  },

  async getParqueaderosPorControlador(idUsuario?: string | number) {
    // Si no se proporciona ID, obtenerlo del localStorage
    if (!idUsuario) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        idUsuario = user.id;
      }
    }
    
    if (!idUsuario) {
      throw new Error('No se pudo determinar el ID del usuario');
    }
    
    const response = await api.get(`/parqueaderos-usuarios/controlador/${idUsuario}`);
    return response.data;
  }
};

export const entradaService = {
  async registrar(entradaData: any) {
    const response = await api.post('/entradas', entradaData);
    return response.data;
  },

  async getAll() {
    const response = await api.get('/entradas');
    return response.data;
  },

  async getById(id: string | number) {
    const response = await api.get(`/entradas/${id}`);
    return response.data;
  },

  async getActivas(parqueaderoId: string | number) {
    const response = await api.get(`/entradas/parqueadero/${parqueaderoId}/activas`);
    return response.data;
  }
};

export const salidaService = {
  async registrar(salidaData: any) {
    const response = await api.post('/salidas', salidaData);
    return response.data;
  },

  async getAll() {
    const response = await api.get('/salidas');
    return response.data;
  },

  async getById(id: string | number) {
    const response = await api.get(`/salidas/${id}`);
    return response.data;
  }
};

export const reporteService = {
  async obtenerEstadisticasDashboard(parqueaderoId?: string | number) {
    const params = parqueaderoId ? `?parqueaderoId=${parqueaderoId}` : '';
    const response = await api.get(`/reportes/estadisticas-dashboard${params}`);
    return response.data;
  },

  async obtenerIngresosDiarios(parqueaderoId?: string | number) {
    const params = parqueaderoId ? `?parqueaderoId=${parqueaderoId}` : '';
    const response = await api.get(`/reportes/ingresos-diarios${params}`);
    return response.data;
  },

  async generarPorFecha(fechaInicio: Date, fechaFin: Date, parqueaderoId: string | null = null) {
    const params = new URLSearchParams({
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0]
    });
    
    if (parqueaderoId) {
      params.append('parqueaderoId', parqueaderoId);
    }
    
    const response = await api.get(`/reportes/fecha?${params}`);
    return response.data;
  },

  async generarPorTipoVehiculo(tipoVehiculo: string, fechaInicio: Date, fechaFin: Date, parqueaderoId: string | null = null) {
    const params = new URLSearchParams({
      tipoVehiculo,
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0]
    });
    
    if (parqueaderoId) {
      params.append('parqueaderoId', parqueaderoId);
    }
    
    const response = await api.get(`/reportes/tipo-vehiculo?${params}`);
    return response.data;
  },

  async generarPorControlador(controladorId: string, fechaInicio: Date, fechaFin: Date) {
    const params = new URLSearchParams({
      controladorId,
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0]
    });
    
    const response = await api.get(`/reportes/controlador?${params}`);
    return response.data;
  }
};

export const tarifaService = {
  async getAll() {
    try {
      const response = await api.get('/tarifas');
      return response.data;
    } catch (error: any) {
      console.error('[tarifaService.getAll] Error:', error);
      if (error.response) {
        return { success: false, error: error.response.data || `HTTP ${error.response.status}` };
      }
      if (error.request) {
        return { success: false, error: 'No se pudo conectar al servidor de tarifas' };
      }
      return { success: false, error: error.message };
    }
  },

  async getById(id: string | number) {
    try {
      const response = await api.get(`/tarifas/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('[tarifaService.getById] Error:', error);
      if (error.response) {
        return { success: false, error: error.response.data || `HTTP ${error.response.status}` };
      }
      if (error.request) {
        return { success: false, error: 'No se pudo conectar al servidor de tarifas' };
      }
      return { success: false, error: error.message };
    }
  },

  async create(tarifaData: any) {
    try {
      const response = await api.post('/tarifas', tarifaData);
      return response.data;
    } catch (error: any) {
      console.error('[tarifaService.create] Error creando tarifa:', error);
      if (error.response) {
        return { success: false, error: error.response.data || `HTTP ${error.response.status}` };
      }
      if (error.request) {
        return { success: false, error: 'No se pudo conectar al servidor al crear la tarifa' };
      }
      return { success: false, error: error.message };
    }
  },

  async update(id: string | number, tarifaData: any) {
    try {
      const response = await api.put(`/tarifas/${id}`, tarifaData);
      return response.data;
    } catch (error: any) {
      console.error('[tarifaService.update] Error actualizando tarifa:', error);
      if (error.response) {
        return { success: false, error: error.response.data || `HTTP ${error.response.status}` };
      }
      if (error.request) {
        return { success: false, error: 'No se pudo conectar al servidor al actualizar la tarifa' };
      }
      return { success: false, error: error.message };
    }
  },

  async delete(id: string | number) {
    try {
      const response = await api.delete(`/tarifas/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('[tarifaService.delete] Error eliminando tarifa:', error);
      if (error.response) {
        return { success: false, error: error.response.data || `HTTP ${error.response.status}` };
      }
      if (error.request) {
        return { success: false, error: 'No se pudo conectar al servidor al eliminar la tarifa' };
      }
      return { success: false, error: error.message };
    }
  },

  async toggleEstado(id: string | number, activa: boolean) {
    try {
      const response = await api.put(`/tarifas/${id}`, { activa });
      return response.data;
    } catch (error: any) {
      console.error('[tarifaService.toggleEstado] Error cambiando estado de tarifa:', error);
      if (error.response) {
        return { success: false, error: error.response.data || `HTTP ${error.response.status}` };
      }
      if (error.request) {
        return { success: false, error: 'No se pudo conectar al servidor al cambiar estado de la tarifa' };
      }
      return { success: false, error: error.message };
    }
  },

  async calcularCosto(parqueaderoId: string | number, tipoVehiculo: string, fechaIngreso: Date, fechaSalida?: Date) {
    const response = await api.post('/tarifas/calcular-costo', {
      parqueaderoId,
      tipoVehiculo,
      fechaIngreso: fechaIngreso.toISOString(),
      fechaSalida: fechaSalida ? fechaSalida.toISOString() : undefined
    });
    return response.data;
  },

  async obtenerTarifasParqueadero(parqueaderoId: string | number) {
    const response = await api.get(`/tarifas/parqueadero/${parqueaderoId}`);
    return response.data;
  }
};

export const usuarioService = {
  async getAll() {
    const response = await api.get('/usuarios');
    return response.data;
  },

  async getById(id: string | number) {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  async create(usuarioData: any) {
    const response = await api.post('/usuarios', usuarioData);
    return response.data;
  },

  async update(id: string | number, usuarioData: any) {
    const response = await api.put(`/usuarios/${id}`, usuarioData);
    return response.data;
  },

  async delete(id: string | number) {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  // Asignación de parqueaderos a controladores
  async asignarParqueadero(idUsuario: string | number, idParqueadero: string | number) {
    try {
      const response = await api.post('/parqueaderos-usuarios/asignar', {
        idUsuario,
        idParqueadero
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en asignarParqueadero:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, error: error.message || 'Error de conexión' };
    }
  },

  async desasignarParqueadero(idUsuario: string | number, idParqueadero: string | number) {
    try {
      const response = await api.post('/parqueaderos-usuarios/desasignar', {
        idUsuario,
        idParqueadero
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en desasignarParqueadero:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, error: error.message || 'Error de conexión' };
    }
  },

  async obtenerParqueaderosAsignados(idUsuario: string | number) {
    try {
      const response = await api.get(`/parqueaderos-usuarios/controlador/${idUsuario}`);
      return response.data;
    } catch (error: any) {
      console.error('Error en obtenerParqueaderosAsignados:', error);
      if (error.response?.data) {
        return error.response.data;
      }
      return { success: false, error: error.message || 'Error de conexión', parqueaderos: [] };
    }
  }
};

export const horarioService = {
  async getAll(parqueaderoId: string | number | null = null) {
    const params = parqueaderoId ? `?parqueaderoId=${parqueaderoId}` : '';
    const response = await api.get(`/horarios${params}`);
    return response.data;
  },

  async getById(id: string | number) {
    const response = await api.get(`/horarios/${id}`);
    return response.data;
  },

  async getByParqueadero(parqueaderoId: string | number) {
    const response = await api.get(`/horarios/parqueadero/${parqueaderoId}`);
    return response.data;
  },

  async create(horarioData: any) {
    const response = await api.post('/horarios', horarioData);
    return response.data;
  },

  async update(id: string | number, horarioData: any) {
    const response = await api.put(`/horarios/${id}`, horarioData);
    return response.data;
  },

  async delete(id: string | number) {
    const response = await api.delete(`/horarios/${id}`);
    return response.data;
  }
};

export const espacioService = {
  async getAll(parqueaderoId?: string | number, estado?: string) {
    const params = new URLSearchParams();
    if (parqueaderoId) params.append('parqueaderoId', parqueaderoId.toString());
    if (estado) params.append('estado', estado);
    
    const queryString = params.toString();
    const url = queryString ? `/espacios?${queryString}` : '/espacios';
    
    const response = await api.get(url);
    return response.data;
  },

  async getEspaciosPorParqueadero(idParqueadero: string | number) {
    const response = await api.get(`/espacios/parqueadero/${idParqueadero}`);
    return response.data;
  },

  async getDisponibles(idParqueadero: string | number) {
    const response = await api.get(`/espacios/parqueadero/${idParqueadero}/disponibles`);
    return response.data;
  },

  async create(espacioData: any) {
    const response = await api.post('/espacios', espacioData);
    return response.data;
  },

  async update(id: string | number, espacioData: any) {
    const response = await api.put(`/espacios/${id}`, espacioData);
    return response.data;
  },

  async delete(id: string | number) {
    const response = await api.delete(`/espacios/${id}`);
    return response.data;
  }
};