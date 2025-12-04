import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token en cada petición
api.interceptors.request.use(
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
api.interceptors.response.use(
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

// ===== AUTH =====
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// ===== PACIENTES =====
export const pacientesAPI = {
  getAll: async () => {
    const response = await api.get('/pacientes');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/pacientes', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/pacientes/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/pacientes/${id}`);
    return response.data;
  }
};

// ===== MÉDICOS =====
export const medicosAPI = {
  getAll: async () => {
    const response = await api.get('/medicos');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/medicos/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/medicos', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/medicos/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/medicos/${id}`);
    return response.data;
  }
};

// ===== CITAS =====
export const citasAPI = {
  getAll: async () => {
    const response = await api.get('/citas');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/citas/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/citas', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/citas/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/citas/${id}`);
    return response.data;
  }
};

export default api;