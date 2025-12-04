/**
 * Middleware de Validación
 * Usa express-validator para validar datos de entrada
 */

import { body, param, query, validationResult } from 'express-validator';
import { validationErrorResponse } from '../utils/response.js';

/**
 * Middleware para verificar resultados de validación
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return validationErrorResponse(res, errors);
  }
  
  next();
};

// ==================== VALIDACIONES DE AUTENTICACIÓN ====================

export const validateLogin = [
  body('username')
    .notEmpty().withMessage('El usuario es obligatorio')
    .trim()
    .isLength({ min: 3 }).withMessage('El usuario debe tener al menos 3 caracteres'),
  
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  validate
];

// ==================== VALIDACIONES DE PACIENTES ====================

export const validateCreatePaciente = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('dni')
    .notEmpty().withMessage('El DNI es obligatorio')
    .trim()
    .matches(/^\d{8}$/).withMessage('El DNI debe tener exactamente 8 dígitos'),
  
  body('telefono')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{9}$/).withMessage('El teléfono debe tener exactamente 9 dígitos'),
  
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('El email no es válido'),
  
  body('direccion')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('La dirección no puede tener más de 200 caracteres'),
  
  body('fechaNacimiento')
    .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
    .isISO8601().withMessage('La fecha de nacimiento debe ser válida')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      if (fecha > hoy) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
      return true;
    }),
  
  validate
];

export const validateUpdatePaciente = [
  param('id')
    .notEmpty().withMessage('El ID es obligatorio'),
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('dni')
    .optional()
    .trim()
    .matches(/^\d{8}$/).withMessage('El DNI debe tener exactamente 8 dígitos'),
  
  body('telefono')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{9}$/).withMessage('El teléfono debe tener exactamente 9 dígitos'),
  
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('El email no es válido'),
  
  body('fechaNacimiento')
    .optional()
    .isISO8601().withMessage('La fecha de nacimiento debe ser válida'),
  
  validate
];

// ==================== VALIDACIONES DE MÉDICOS ====================

export const validateCreateMedico = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('dni')
    .notEmpty().withMessage('El DNI es obligatorio')
    .trim()
    .matches(/^\d{8}$/).withMessage('El DNI debe tener exactamente 8 dígitos'),
  
  body('especialidad')
    .notEmpty().withMessage('La especialidad es obligatoria')
    .trim()
    .isIn([
      'Medicina General',
      'Cardiología',
      'Pediatría',
      'Traumatología',
      'Ginecología',
      'Dermatología',
      'Neurología',
      'Oftalmología',
      'Otorrinolaringología',
      'Psiquiatría',
      'Urología',
      'Endocrinología'
    ]).withMessage('Especialidad no válida'),
  
  body('matricula')
    .notEmpty().withMessage('La matrícula es obligatoria')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('La matrícula debe tener entre 3 y 50 caracteres'),
  
  body('telefono')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{9}$/).withMessage('El teléfono debe tener exactamente 9 dígitos'),
  
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail().withMessage('El email no es válido'),
  
  body('horario')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('El horario no puede tener más de 100 caracteres'),
  
  validate
];

export const validateUpdateMedico = [
  param('id')
    .notEmpty().withMessage('El ID es obligatorio'),
  
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('especialidad')
    .optional()
    .trim()
    .isIn([
      'Medicina General',
      'Cardiología',
      'Pediatría',
      'Traumatología',
      'Ginecología',
      'Dermatología',
      'Neurología',
      'Oftalmología',
      'Otorrinolaringología',
      'Psiquiatría',
      'Urología',
      'Endocrinología'
    ]).withMessage('Especialidad no válida'),
  
  validate
];

// ==================== VALIDACIONES DE CITAS ====================

export const validateCreateCita = [
  body('pacienteId')
    .notEmpty().withMessage('El ID del paciente es obligatorio'),
  
  body('medicoId')
    .notEmpty().withMessage('El ID del médico es obligatorio'),
  
  body('fecha')
    .notEmpty().withMessage('La fecha es obligatoria')
    .isISO8601().withMessage('La fecha debe ser válida')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fecha < hoy) {
        throw new Error('La fecha de la cita no puede ser pasada');
      }
      return true;
    }),
  
  body('hora')
    .notEmpty().withMessage('La hora es obligatoria')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('La hora debe estar en formato HH:MM'),
  
  body('motivo')
    .notEmpty().withMessage('El motivo es obligatorio')
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('El motivo debe tener entre 3 y 200 caracteres'),
  
  body('estado')
    .optional()
    .isIn(['programada', 'confirmada', 'en-atencion', 'completada', 'cancelada'])
    .withMessage('Estado no válido'),
  
  body('observaciones')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Las observaciones no pueden tener más de 500 caracteres'),
  
  validate
];

export const validateUpdateCita = [
  param('id')
    .notEmpty().withMessage('El ID es obligatorio'),
  
  body('estado')
    .optional()
    .isIn(['programada', 'confirmada', 'en-atencion', 'completada', 'cancelada'])
    .withMessage('Estado no válido'),
  
  body('motivo')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('El motivo debe tener entre 3 y 200 caracteres'),
  
  validate
];

// ==================== VALIDACIONES DE PARÁMETROS ====================

export const validateId = [
  param('id')
    .notEmpty().withMessage('El ID es obligatorio'),
  
  validate
];

// ==================== VALIDACIONES DE QUERY ====================

export const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('La búsqueda debe tener entre 1 y 100 caracteres'),
  
  validate
];
