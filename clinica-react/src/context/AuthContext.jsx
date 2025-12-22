import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    // Validar que los datos existan y sean válidos
    if (token && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Si hay error al parsear, limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    // El backend devuelve { success, message, data: { user, token } }
    const { token, user: userData } = response.data.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Funciones de verificación de roles
  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === 'string') {
      return user.rol === roles;
    }
    return roles.includes(user.rol);
  };

  const isAdmin = () => hasRole('administrador');
  const isMedico = () => hasRole('medico');
  const isRecepcionista = () => hasRole('recepcionista');
  const isPaciente = () => hasRole('paciente');

  const value = {
    user,
    login,
    logout,
    hasRole,
    isAdmin,
    isMedico,
    isRecepcionista,
    isPaciente,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};