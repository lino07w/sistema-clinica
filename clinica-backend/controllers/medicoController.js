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
    const medico = await medicoService.getById(req.params.id);
    successResponse(res, medico, 'Médico obtenido correctamente');
  });

  create = asyncHandler(async (req, res) => {
    const medico = await medicoService.create(req.body);
    successResponse(res, medico, 'Médico creado exitosamente', 201);
  });

  update = asyncHandler(async (req, res) => {
    const medico = await medicoService.update(req.params.id, req.body);
    successResponse(res, medico, 'Médico actualizado exitosamente');
  });

  delete = asyncHandler(async (req, res) => {
    await medicoService.delete(req.params.id);
    successResponse(res, null, 'Médico eliminado exitosamente');
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
