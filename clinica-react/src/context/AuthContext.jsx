import { createContext, useState, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      
      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true, user: userData };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.rol);
    }
    return user.rol === roles;
  };

  const isAdmin = () => hasRole('administrador');
  const isMedico = () => hasRole('medico');
  const isRecepcionista = () => hasRole('recepcionista');
  const isPaciente = () => hasRole('paciente');

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    hasRole,
    isAdmin,
    isMedico,
    isRecepcionista,
    isPaciente
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};