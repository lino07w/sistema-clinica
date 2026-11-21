import auditService from '../services/auditService.js';
import { successResponse } from '../utils/response.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';

class AuditController {
  // GET /api/auditoria
  getAll = asyncHandler(async (req, res) => {
    const logs = await auditService.getAll();
    successResponse(res, logs, 'Logs de auditoría obtenidos correctamente');
  });

  getByUser = asyncHandler(async (req, res) => {
    const logs = await auditService.getByUser(req.params.usuarioId);
    successResponse(res, logs, 'Logs del usuario obtenidos correctamente');
  });

  getByEntidad = asyncHandler(async (req, res) => {
    const logs = await auditService.getByEntidad(req.params.entidad);
    successResponse(res, logs, 'Logs de la entidad obtenidos correctamente');
  });

  getByDateRange = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) throw ApiError.badRequest('Se requieren startDate y endDate');

    const logs = await auditService.getByDateRange(startDate, endDate);
    successResponse(res, logs, 'Logs del rango de fechas obtenidos correctamente');
  });
}

export default new AuditController();
