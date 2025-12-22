import db from '../models/index.js';
const { AuditLog } = db;
import { v4 as uuidv4 } from 'uuid';

/**
 * Registrar acción en el log de auditoría
 */
export const logAction = async (usuarioId, usuarioNombre, accion, entidad, detalles) => {
    try {
        await AuditLog.create({
            id: uuidv4(),
            timestamp: new Date(),
            usuarioId,
            usuarioNombre,
            accion,
            entidad,
            detalles
        });
    } catch (error) {
        console.error('❌ Error guardando log de auditoría:', error.message);
        // No lanzar error para no interrumpir la operación principal
    }
};

export default {
    logAction
};
