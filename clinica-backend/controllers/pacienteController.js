/**
 * Controlador de Pacientes
 */

import pacienteService from '../services/pacienteService.js';
import { logAction } from '../utils/auditLogger.js';
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
    const paciente = await pacienteService.getById(req.params.id);
    successResponse(res, paciente, 'Paciente obtenido correctamente');
  });

  // POST /api/pacientes
  create = asyncHandler(async (req, res) => {
    const paciente = await pacienteService.create(req.body);
    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'CREATE', 'PACIENTE', `Paciente creado: ${paciente.nombre}`);
    successResponse(res, paciente, 'Paciente creado exitosamente', 201);
  });

  // PUT /api/pacientes/:id
  update = asyncHandler(async (req, res) => {
    const paciente = await pacienteService.update(req.params.id, req.body);
    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'UPDATE', 'PACIENTE', `Paciente actualizado: ${paciente.nombre}`);
    successResponse(res, paciente, 'Paciente actualizado exitosamente');
  });

  // DELETE /api/pacientes/:id
  delete = asyncHandler(async (req, res) => {
    await pacienteService.delete(req.params.id);
    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'DELETE', 'PACIENTE', `Paciente eliminado: ID ${req.params.id}`);
    successResponse(res, null, 'Paciente eliminado exitosamente');
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
