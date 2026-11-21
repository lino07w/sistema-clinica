/**
 * Controlador de Historial Médico con Sequelize
 */

import historialService from '../services/historialService.js';
import { logUserAction } from '../utils/auditLogger.js';
import { successResponse } from '../utils/response.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

class HistorialController {
    // GET /api/historial
    getAll = asyncHandler(async (req, res) => {
        const historial = await historialService.getAll();
        successResponse(res, historial, 'Historial obtenido correctamente');
    });

    // GET /api/historial/:id
    getById = asyncHandler(async (req, res) => {
        const registro = await historialService.getById(req.params.id);
        successResponse(res, registro, 'Registro de historial obtenido correctamente');
    });

    // POST /api/historial
    create = asyncHandler(async (req, res) => {
        const { pacienteId, medicoId, fecha, diagnostico } = req.body;

        if (!pacienteId || !medicoId || !fecha || !diagnostico) {
            throw ApiError.badRequest('Faltan campos obligatorios: pacienteId, medicoId, fecha, diagnostico');
        }

        const registro = await historialService.create(req.body);

        logUserAction(req, 'CREATE', 'HISTORIAL', `Registro médico creado para paciente ID ${pacienteId}`);

        successResponse(res, registro, 'Registro creado correctamente', 201);
    });

    // PUT /api/historial/:id
    update = asyncHandler(async (req, res) => {
        const registro = await historialService.update(req.params.id, req.body);
        logUserAction(req, 'UPDATE', 'HISTORIAL', `Registro médico actualizado: ID ${req.params.id}`);
        successResponse(res, registro, 'Registro actualizado correctamente');
    });

    // DELETE /api/historial/:id
    delete = asyncHandler(async (req, res) => {
        await historialService.delete(req.params.id);
        logUserAction(req, 'DELETE', 'HISTORIAL', `Registro médico eliminado: ID ${req.params.id}`);
        successResponse(res, null, 'Registro eliminado correctamente');
    });

    // GET /api/historial/paciente/:pacienteId
    getByPaciente = asyncHandler(async (req, res) => {
        const historial = await historialService.getByPaciente(req.params.pacienteId);
        successResponse(res, historial, 'Historial del paciente obtenido correctamente');
    });
}

export default new HistorialController();

