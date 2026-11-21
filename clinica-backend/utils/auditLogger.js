import { v4 as uuidv4 } from 'uuid';
import db from '../models/index.js';

const { AuditLog } = db;

/**
 * Registra una acción en el log de auditoría.
 * Nunca lanza: un fallo de auditoría no debe interrumpir la operación principal.
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
  }
};

/** Igual que `logAction`, tomando el autor del usuario autenticado en `req`. */
export const logUserAction = (req, accion, entidad, detalles) => {
  const usuarioId = req.user?.id ?? 'unknown';
  const usuarioNombre = req.user?.nombre || req.user?.username || req.user?.email || 'Unknown';
  return logAction(usuarioId, usuarioNombre, accion, entidad, detalles);
};

export default { logAction, logUserAction };
