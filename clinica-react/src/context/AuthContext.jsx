import { createContext, useContext, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/** Lee la sesión guardada; si está corrupta la descarta. */
const loadStoredUser = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const savedUser = localStorage.getItem(USER_KEY);
  if (!token || !savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  // Inicialización perezosa: la sesión se lee de forma síncrona en el primer
  // render, sin efectos ni parpadeo de "no autenticado".
  const [user, setUser] = useState(loadStoredUser);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    // El backend devuelve { success, message, data: { user, token } }
    const { token, user: userData } = response.data.data;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
    isPaciente
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};