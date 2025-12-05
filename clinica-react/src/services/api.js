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
  getMe: () => axiosInstance.get('/auth/me')
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

export default axiosInstance;
