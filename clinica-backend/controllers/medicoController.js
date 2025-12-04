/**
 * Controlador de Médicos
 */

import medicoService from '../services/medicoService.js';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class MedicoController {
  getAll = asyncHandler(async (req, res) => {
    const medicos = await medicoService.getAll();
    successResponse(res, medicos, 'Médicos obtenidos correctamente');
  });

  getById = asyncHandler(async (req, res) => {
    try {
      const medico = await medicoService.getById(req.params.id);
      successResponse(res, medico, 'Médico obtenido correctamente');
    } catch (error) {
      notFoundResponse(res, error.message);
    }
  });

  create = asyncHandler(async (req, res) => {
    try {
      const medico = await medicoService.create(req.body);
      successResponse(res, medico, 'Médico creado exitosamente', 201);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  });

  update = asyncHandler(async (req, res) => {
    try {
      const medico = await medicoService.update(req.params.id, req.body);
      successResponse(res, medico, 'Médico actualizado exitosamente');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  });

  delete = asyncHandler(async (req, res) => {
    try {
      await medicoService.delete(req.params.id);
      successResponse(res, null, 'Médico eliminado exitosamente');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  });

  search = asyncHandler(async (req, res) => {
    const medicos = await medicoService.search(req.query.q);
    successResponse(res, medicos, 'Búsqueda completada');
  });

  getByEspecialidad = asyncHandler(async (req, res) => {
    const medicos = await medicoService.getByEspecialidad(req.params.especialidad);
    successResponse(res, medicos, 'Médicos obtenidos correctamente');
  });
}

export default new MedicoController();
