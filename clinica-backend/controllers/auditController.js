import { logAction } from '../utils/auditLogger.js';
import auditService from '../services/auditService.js';

class AuditController {
    // Obtener todos los logs de auditoría
    async getAll(req, res) {
        try {
            const logs = await auditService.getAll();

            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Error obteniendo logs de auditoría:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener logs de auditoría'
            });
        }
    }

    // Obtener logs por usuario
    async getByUser(req, res) {
        try {
            const { usuarioId } = req.params;
            const logs = await auditService.getByUser(usuarioId);

            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Error obteniendo logs por usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener logs por usuario'
            });
        }
    }

    // Obtener logs por entidad
    async getByEntidad(req, res) {
        try {
            const { entidad } = req.params;
            const logs = await auditService.getByEntidad(entidad);

            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Error obteniendo logs por entidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener logs por entidad'
            });
        }
    }

    // Obtener logs por rango de fechas
    async getByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren startDate y endDate'
                });
            }

            const logs = await auditService.getByDateRange(startDate, endDate);

            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Error obteniendo logs por fecha:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener logs por fecha'
            });
        }
    }
}

export default new AuditController();
