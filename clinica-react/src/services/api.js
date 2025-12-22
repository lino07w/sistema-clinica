import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a cada petición
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API de autenticación
export const authAPI = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (userData) => axiosInstance.post('/auth/register', userData),
  getMe: () => axiosInstance.get('/auth/me')
};

// API de usuarios
export const usuariosAPI = {
  getAll: () => axiosInstance.get('/usuarios'),
  getPendientes: () => axiosInstance.get('/usuarios/pendientes'),
  getById: (id) => axiosInstance.get(`/usuarios/${id}`),
  create: (data) => axiosInstance.post('/usuarios', data),
  update: (id, data) => axiosInstance.put(`/usuarios/${id}`, data),
  delete: (id) => axiosInstance.delete(`/usuarios/${id}`),
  aprobar: (id) => axiosInstance.post(`/usuarios/${id}/aprobar`),
  rechazar: (id, motivo) => axiosInstance.post(`/usuarios/${id}/rechazar`, { motivo }),
  cambiarEstado: (id, estado) => axiosInstance.patch(`/usuarios/${id}/estado`, { estado })
};

// API de pacientes
export const pacientesAPI = {
  getAll: () => axiosInstance.get('/pacientes'),
  getById: (id) => axiosInstance.get(`/pacientes/${id}`),
  create: (data) => axiosInstance.post('/pacientes', data),
  update: (id, data) => axiosInstance.put(`/pacientes/${id}`, data),
  delete: (id) => axiosInstance.delete(`/pacientes/${id}`)
};

// API de médicos
export const medicosAPI = {
  getAll: () => axiosInstance.get('/medicos'),
  getById: (id) => axiosInstance.get(`/medicos/${id}`),
  create: (data) => axiosInstance.post('/medicos', data),
  update: (id, data) => axiosInstance.put(`/medicos/${id}`, data),
  delete: (id) => axiosInstance.delete(`/medicos/${id}`)
};

// API de citas
export const citasAPI = {
  getAll: () => axiosInstance.get('/citas'),
  getById: (id) => axiosInstance.get(`/citas/${id}`),
  create: (data) => axiosInstance.post('/citas', data),
  update: (id, data) => axiosInstance.put(`/citas/${id}`, data),
  delete: (id) => axiosInstance.delete(`/citas/${id}`)
};

// API de facturas
export const facturasAPI = {
  getAll: () => axiosInstance.get('/facturas'),
  create: (data) => axiosInstance.post('/facturas', data),
  update: (id, data) => axiosInstance.put(`/facturas/${id}`, data),
  delete: (id) => axiosInstance.delete(`/facturas/${id}`)
};

// API de configuración
export const configAPI = {
  get: () => axiosInstance.get('/configuracion'),
  update: (data) => axiosInstance.put('/configuracion', data)
};

// API para historial médico
export const historialAPI = {
  getAll: () => axiosInstance.get('/historial'),
  create: (data) => axiosInstance.post('/historial', data),
  update: (id, data) => axiosInstance.put(`/historial/${id}`, data),
  delete: (id) => axiosInstance.delete(`/historial/${id}`),
};

// API para auditoría
export const auditAPI = {
  getAll: () => axiosInstance.get('/auditoria'),
};

export default axiosInstance;