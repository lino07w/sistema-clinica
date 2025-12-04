/**
 * Middleware de Autenticación
 * Verifica que el usuario esté autenticado mediante JWT
 */

import { verifyToken } from '../utils/jwt.js';
import { unauthorizedResponse } from '../utils/response.js';

/**
 * Middleware para proteger rutas
 */
export const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'Token no proporcionado');
    }

    // Extraer el token
    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar el token
    const decoded = verifyToken(token);

    if (!decoded) {
      return unauthorizedResponse(res, 'Token inválido o expirado');
    }

    // Agregar información del usuario al request
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return unauthorizedResponse(res, 'Error de autenticación');
  }
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero agrega user al request si existe
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin usuario autenticado
    next();
  }
};

/**
 * Middleware para verificar roles (futuro)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedResponse(res, 'No autenticado');
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return unauthorizedResponse(res, 'No tiene permisos para esta acción');
    }

    next();
  };
};
