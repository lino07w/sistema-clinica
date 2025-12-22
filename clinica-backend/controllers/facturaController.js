/**
 * Controlador de Facturación con Sequelize
 */

import facturaService from '../services/facturaService.js';
import { logAction } from '../utils/auditLogger.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class FacturaController {
    // GET /api/facturas
    getAll = asyncHandler(async (req, res) => {
        const facturas = await facturaService.getAll();
        successResponse(res, facturas, 'Facturas obtenidas correctamente');
    });

    // GET /api/facturas/:id
    getById = asyncHandler(async (req, res) => {
        const factura = await facturaService.getById(req.params.id);
        successResponse(res, factura, 'Factura obtenida correctamente');
    });

    // POST /api/facturas
    create = asyncHandler(async (req, res) => {
        const { pacienteId, monto, concepto, fecha } = req.body;

        if (!pacienteId || !monto) {
            return errorResponse(res, 'Paciente ID y Monto son requeridos', 400);
        }

        const factura = await facturaService.create({
            pacienteId,
            monto: Number(monto),
            concepto: concepto || 'Consulta Médica',
            fecha: fecha || new Date().toISOString().split('T')[0],
            estado: 'pendiente'
        });

        const userId = req.user ? req.user.id : 'unknown';
        const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
        logAction(userId, userName, 'CREATE', 'FACTURA', `Factura creada: $${factura.monto}`);

        successResponse(res, factura, 'Factura creada exitosamente', 201);
    });

    // PUT /api/facturas/:id
    update = asyncHandler(async (req, res) => {
        const factura = await facturaService.update(req.params.id, req.body);
        const userId = req.user ? req.user.id : 'unknown';
        const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
        logAction(userId, userName, 'UPDATE', 'FACTURA', `Factura actualizada: ID ${req.params.id}`);
        successResponse(res, factura, 'Factura actualizada exitosamente');
    });

    // DELETE /api/facturas/:id
    delete = asyncHandler(async (req, res) => {
        await facturaService.delete(req.params.id);
        const userId = req.user ? req.user.id : 'unknown';
        const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
        logAction(userId, userName, 'DELETE', 'FACTURA', `Factura eliminada: ID ${req.params.id}`);
        successResponse(res, null, 'Factura eliminada exitosamente');
    });

    // GET /api/facturas/paciente/:pacienteId
    getByPaciente = asyncHandler(async (req, res) => {
        const facturas = await facturaService.getByPaciente(req.params.pacienteId);
        successResponse(res, facturas, 'Facturas del paciente obtenidas correctamente');
    });

    // GET /api/facturas/stats/global
    getStats = asyncHandler(async (req, res) => {
        const totalPagado = await facturaService.getTotalByEstado('pagada');
        const totalPendiente = await facturaService.getTotalByEstado('pendiente');

        successResponse(res, {
            pagado: totalPagado,
            pendiente: totalPendiente,
            total: totalPagado + totalPendiente
        }, 'Estadísticas obtenidas correctamente');
    });
}

export default new FacturaController();

