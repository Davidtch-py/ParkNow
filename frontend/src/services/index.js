import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.usuario));
    }
    
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export const parqueaderoService = {
  async getAll() {
    const response = await api.get('/parqueaderos');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/parqueaderos/${id}`);
    return response.data;
  },

  async create(parqueaderoData) {
    const response = await api.post('/parqueaderos', parqueaderoData);
    return response.data;
  },

  async update(id, parqueaderoData) {
    const response = await api.put(`/parqueaderos/${id}`, parqueaderoData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/parqueaderos/${id}`);
    return response.data;
  },

  async getCapacidadBaja(umbral = 10) {
    const response = await api.get(`/parqueaderos/alertas/capacidad-baja?umbral=${umbral}`);
    return response.data;
  }
};

export const entradaService = {
  async registrar(entradaData) {
    const response = await api.post('/entradas', entradaData);
    return response.data;
  },

  async getAll() {
    const response = await api.get('/entradas');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/entradas/${id}`);
    return response.data;
  },

  async getActivas(parqueaderoId) {
    const response = await api.get(`/entradas/parqueadero/${parqueaderoId}/activas`);
    return response.data;
  }
};

export const salidaService = {
  async registrar(salidaData) {
    const response = await api.post('/salidas', salidaData);
    return response.data;
  },

  async getAll() {
    const response = await api.get('/salidas');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/salidas/${id}`);
    return response.data;
  }
};

export const reporteService = {
  async generarPorFecha(fechaInicio, fechaFin, parqueaderoId = null) {
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

  async generarPorTipoVehiculo(tipoVehiculo, fechaInicio, fechaFin, parqueaderoId = null) {
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

  async generarPorControlador(controladorId, fechaInicio, fechaFin) {
    const params = new URLSearchParams({
      controladorId,
      fechaInicio: fechaInicio.toISOString().split('T')[0],
      fechaFin: fechaFin.toISOString().split('T')[0]
    });
    
    const response = await api.get(`/reportes/controlador?${params}`);
    return response.data;
  }
};