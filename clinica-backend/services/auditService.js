import { Op } from 'sequelize';
import db from '../models/index.js';
const { AuditLog } = db;
import { v4 as uuidv4 } from 'uuid';

class AuditService {
    async getAll() {
        return await AuditLog.findAll({
            order: [['timestamp', 'DESC']],
            limit: 1000 // Limitar a los últimos 1000 registros
        });
    }

    async create(logData) {
        return await AuditLog.create({
            id: logData.id || uuidv4(),
            ...logData,
            timestamp: new Date()
        });
    }

    async getByUser(usuarioId) {
        return await AuditLog.findAll({
            where: { usuarioId },
            order: [['timestamp', 'DESC']],
            limit: 100
        });
    }

    async getByEntidad(entidad) {
        return await AuditLog.findAll({
            where: { entidad },
            order: [['timestamp', 'DESC']],
            limit: 100
        });
    }

    async getByAccion(accion) {
        return await AuditLog.findAll({
            where: { accion },
            order: [['timestamp', 'DESC']],
            limit: 100
        });
    }

    async getByDateRange(startDate, endDate) {
        return await AuditLog.findAll({
            where: {
                timestamp: {
                    [Op.between]: [new Date(startDate), new Date(endDate)]
                }
            },
            order: [['timestamp', 'DESC']]
        });
    }
}

export default new AuditService();
