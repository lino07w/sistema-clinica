/**
 * Middleware de Manejo de Errores
 * Maneja todos los errores de forma centralizada
 */

import config from '../config/config.js';

/**
 * Clase personalizada de error de API
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para manejar errores 404
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(`Ruta no encontrada - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error para debugging
  if (config.env === 'development') {
    console.error('❌ Error:', err);
  }

  // Error de validación de Mongoose (cuando migremos a BD)
  if (err.name === 'ValidationError') {
    const message = 'Error de validación de datos';
    error = new ApiError(message, 400);
  }

  // Error de cast de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado';
    error = new ApiError(message, 404);
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = new ApiError(message, 401);
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = new ApiError(message, 401);
  }

  // Error de duplicado (código 11000 en MongoDB)
  if (err.code === 11000) {
    const message = 'Recurso duplicado';
    error = new ApiError(message, 409);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.env === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
};

/**
 * Middleware para capturar errores asíncronos
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
