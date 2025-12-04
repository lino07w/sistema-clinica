/**
 * API Client - Comunicación con el Backend
 */

const API_URL = 'http://localhost:3000/api';

// Utilidades para manejo de tokens
const TokenManager = {
  getToken() {
    return localStorage.getItem('token');
  },
  
  setToken(token) {
    localStorage.setItem('token', token);
  },
  
  removeToken() {
    localStorage.removeItem('token');
  },
  
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
};

// Función base para peticiones HTTP
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...TokenManager.getAuthHeaders(),
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
}

// ===== AUTENTICACIÓN =====
const AuthAPI = {
  async login(username, password) {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (data.success && data.data.token) {
      TokenManager.setToken(data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }
    
    return data;
  },

  async getMe() {
    return await fetchAPI('/auth/me');
  },

  logout() {
    TokenManager.removeToken();
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  }
};

// ===== PACIENTES =====
const PacientesAPI = {
  async getAll() {
    return await fetchAPI('/pacientes');
  },

  async getById(id) {
    return await fetchAPI(`/pacientes/${id}`);
  },

  async create(pacienteData) {
    return await fetchAPI('/pacientes', {
      method: 'POST',
      body: JSON.stringify(pacienteData)
    });
  },

  async update(id, pacienteData) {
    return await fetchAPI(`/pacientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pacienteData)
    });
  },

  async delete(id) {
    return await fetchAPI(`/pacientes/${id}`, {
      method: 'DELETE'
    });
  }
};

// ===== MÉDICOS =====
const MedicosAPI = {
  async getAll() {
    return await fetchAPI('/medicos');
  },

  async getById(id) {
    return await fetchAPI(`/medicos/${id}`);
  },

  async create(medicoData) {
    return await fetchAPI('/medicos', {
      method: 'POST',
      body: JSON.stringify(medicoData)
    });
  },

  async update(id, medicoData) {
    return await fetchAPI(`/medicos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicoData)
    });
  },

  async delete(id) {
    return await fetchAPI(`/medicos/${id}`, {
      method: 'DELETE'
    });
  }
};

// ===== CITAS =====
const CitasAPI = {
  async getAll() {
    return await fetchAPI('/citas');
  },

  async getById(id) {
    return await fetchAPI(`/citas/${id}`);
  },

  async create(citaData) {
    return await fetchAPI('/citas', {
      method: 'POST',
      body: JSON.stringify(citaData)
    });
  },

  async update(id, citaData) {
    return await fetchAPI(`/citas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(citaData)
    });
  },

  async delete(id) {
    return await fetchAPI(`/citas/${id}`, {
      method: 'DELETE'
    });
  }
};

// Exportar para usar en otros archivos
window.API = {
  Auth: AuthAPI,
  Pacientes: PacientesAPI,
  Medicos: MedicosAPI,
  Citas: CitasAPI,
  TokenManager
};