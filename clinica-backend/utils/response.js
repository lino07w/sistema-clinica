/**
 * Utilidades para respuestas de API estandarizadas
 */

/**
 * Respuesta exitosa
 */
export const successResponse = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Respuesta de error
 */
export const errorResponse = (res, message = 'Error en el servidor', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de validación fallida
 */
export const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Error de validación',
    errors: errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }))
  });
};

/**
 * Respuesta de no autorizado
 */
export const unauthorizedResponse = (res, message = 'No autorizado') => {
  return errorResponse(res, message, 401);
};

/**
 * Respuesta de no encontrado
 */
export const notFoundResponse = (res, message = 'Recurso no encontrado') => {
  return errorResponse(res, message, 404);
};

/**
 * Respuesta de conflicto (recurso duplicado)
 */
export const conflictResponse = (res, message = 'El recurso ya existe') => {
  return errorResponse(res, message, 409);
};
