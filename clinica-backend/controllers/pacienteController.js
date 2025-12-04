/**
 * Controlador de Pacientes
 */

import pacienteService from '../services/pacienteService.js';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class PacienteController {
  // GET /api/pacientes
  getAll = asyncHandler(async (req, res) => {
    const pacientes = await pacienteService.getAll();
    successResponse(res, pacientes, 'Pacientes obtenidos correctamente');
  });

  // GET /api/pacientes/:id
  getById = asyncHandler(async (req, res) => {
    try {
      const paciente = await pacienteService.getById(req.params.id);
      successResponse(res, paciente, 'Paciente obtenido correctamente');
    } catch (error) {
      notFoundResponse(res, error.message);
    }
  });

  // POST /api/pacientes
  create = asyncHandler(async (req, res) => {
    try {
      const paciente = await pacienteService.create(req.body);
      successResponse(res, paciente, 'Paciente creado exitosamente', 201);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  });

  // PUT /api/pacientes/:id
  update = asyncHandler(async (req, res) => {
    try {
      const paciente = await pacienteService.update(req.params.id, req.body);
      successResponse(res, paciente, 'Paciente actualizado exitosamente');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  });

  // DELETE /api/pacientes/:id
  delete = asyncHandler(async (req, res) => {
    try {
      await pacienteService.delete(req.params.id);
      successResponse(res, null, 'Paciente eliminado exitosamente');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  });

  // GET /api/pacientes/search?q=...
  search = asyncHandler(async (req, res) => {
    const pacientes = await pacienteService.search(req.query.q);
    successResponse(res, pacientes, 'Búsqueda completada');
  });

  // GET /api/pacientes/stats
  getStats = asyncHandler(async (req, res) => {
    const stats = await pacienteService.getStats();
    successResponse(res, stats, 'Estadísticas obtenidas correctamente');
  });
}

export default new PacienteController();
