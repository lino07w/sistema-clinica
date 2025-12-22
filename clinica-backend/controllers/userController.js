import { Op } from 'sequelize';
import userService from '../services/userService.js';
import { logAction } from '../utils/auditLogger.js';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/index.js';

const { User, Medico } = db;

class UserController {
  /**
   * Obtener todos los usuarios
   */
  getAll = asyncHandler(async (req, res) => {
    const users = await userService.getAll();
    successResponse(res, users, 'Usuarios obtenidos correctamente');
  });

  /**
   * Obtener usuarios pendientes de aprobación
   */
  getPendientes = asyncHandler(async (req, res) => {
    const users = await userService.getPendientes();
    successResponse(res, users, 'Usuarios pendientes obtenidos correctamente');
  });

  /**
   * Obtener usuario por ID
   */
  getById = asyncHandler(async (req, res) => {
    const user = await userService.getById(req.params.id);
    successResponse(res, user, 'Usuario obtenido correctamente');
  });

  /**
   * Crear nuevo usuario (solo Admin)
   */
  create = asyncHandler(async (req, res) => {
    const user = await userService.create(req.body);

    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'CREATE', 'USER', `Usuario creado: ${user.nombre}`);

    successResponse(res, user.toJSON(), 'Usuario creado correctamente', 201);
  });

  /**
   * Actualizar usuario
   */
  update = asyncHandler(async (req, res) => {
    const user = await userService.update(req.params.id, req.body);

    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'UPDATE', 'USER', `Usuario actualizado: ${user.nombre}`);

    successResponse(res, user.toJSON(), 'Usuario actualizado correctamente');
  });

  /**
   * Eliminar usuario
   */
  deleteUser = asyncHandler(async (req, res) => {
    await userService.delete(req.params.id);

    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'DELETE', 'USER', `Usuario eliminado: ID ${req.params.id}`);

    successResponse(res, null, 'Usuario eliminado correctamente');
  });

  /**
   * Aprobar solicitud de usuario
   */
  aprobar = asyncHandler(async (req, res) => {
    const user = await userService.aprobar(req.params.id);

    // Si es médico, registrarlo en la tabla de médicos también
    if (user.rol === 'medico') {
      const existingMedico = await Medico.findOne({
        where: {
          [Op.or]: [
            { email: user.email },
            ...(user.medicoId ? [{ id: user.medicoId }] : [])
          ]
        }
      });

      if (!existingMedico) {
        const medicoId = user.medicoId || `med-${uuidv4()}`;
        await Medico.create({
          id: medicoId,
          nombre: user.nombre,
          email: user.email,
          telefono: user.telefono || '',
          especialidad: user.especialidad || 'General',
          matricula: user.matricula || '',
          activo: true
        });

        // Vincular el ID del médico al usuario
        await user.update({ medicoId });
      }
    }

    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'APPROVE', 'USER', `Usuario aprobado: ${user.nombre}`);

    successResponse(res, user.toJSON(), 'Usuario aprobado correctamente');
  });

  /**
   * Rechazar solicitud de usuario
   */
  rechazar = asyncHandler(async (req, res) => {
    const { motivo } = req.body;
    const user = await userService.rechazar(req.params.id, motivo);

    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'REJECT', 'USER', `Usuario rechazado: ${user.nombre}`);

    successResponse(res, user.toJSON(), 'Usuario rechazado correctamente');
  });

  /**
   * Cambiar estado de usuario (activar/desactivar)
   */
  cambiarEstado = asyncHandler(async (req, res) => {
    const { estado } = req.body;
    const user = await userService.cambiarEstado(req.params.id, estado);

    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'CHANGE_STATUS', 'USER', `Estado cambiado: ${user.nombre} - ${estado}`);

    successResponse(res, user.toJSON(), `Usuario ${estado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
  });
}

export default new UserController();