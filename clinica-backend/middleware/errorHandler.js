/**
 * Manejo centralizado de errores.
 *
 * Los servicios y controladores lanzan `ApiError` con el código HTTP
 * adecuado; cualquier otro error se traduce aquí. En producción nunca se
 * devuelve el stack ni el mensaje de errores inesperados.
 */

import config from '../config/config.js';

export class ApiError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(message, 400, details);
  }

  static forbidden(message = 'No tienes permisos para realizar esta acción') {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new ApiError(message, 404);
  }

  static conflict(message = 'El recurso ya existe') {
    return new ApiError(message, 409);
  }
}

/** Middleware para rutas inexistentes (404). */
export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Ruta no encontrada - ${req.originalUrl}`));
};

/** Traduce errores conocidos de librerías a `ApiError`. */
const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  switch (err.name) {
    case 'SequelizeValidationError':
      return ApiError.badRequest(
        'Error de validación de datos',
        err.errors?.map((e) => ({ field: e.path, message: e.message }))
      );
    case 'SequelizeUniqueConstraintError':
      return ApiError.conflict(
        `Ya existe un registro con ese valor${err.errors?.[0]?.path ? ` (${err.errors[0].path})` : ''}`
      );
    case 'SequelizeForeignKeyConstraintError':
      return ApiError.conflict('La operación viola una relación con otro registro');
    case 'SequelizeDatabaseError':
      // p. ej. valor inválido para un ENUM o un tipo de dato incorrecto
      return ApiError.badRequest('Datos inválidos para la base de datos');
    case 'JsonWebTokenError':
      return new ApiError('Token inválido', 401);
    case 'TokenExpiredError':
      return new ApiError('Token expirado', 401);
    default:
      break;
  }

  // Body JSON mal formado (express.json)
  if (err.type === 'entity.parse.failed') {
    return ApiError.badRequest('El cuerpo de la petición no es un JSON válido');
  }

  const unexpected = new ApiError('Error interno del servidor', 500);
  unexpected.isOperational = false;
  return unexpected;
};

// eslint-disable-next-line no-unused-vars -- Express identifica los manejadores de error por su aridad (4 argumentos)
export const errorHandler = (err, req, res, next) => {
  const error = normalizeError(err);

  if (!error.isOperational || error.statusCode >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details && { errors: error.details }),
    ...(config.env === 'development' && { stack: err.stack })
  });
};

/** Envuelve controladores async para propagar errores a `errorHandler`. */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
