/**
 * Controlador de Citas con Sistema de Roles
 */

import citaService from '../services/citaService.js';
import { logAction } from '../utils/auditLogger.js';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

class CitaController {
  getAll = asyncHandler(async (req, res) => {
    const todasLasCitas = await citaService.getAll();

    // Filtrar citas según el rol del usuario
    let citasFiltradas = todasLasCitas;

    if (req.user.rol === 'medico') {
      // El médico solo ve sus propias citas
      citasFiltradas = todasLasCitas.filter(c => c.medicoId === req.user.medicoId);
    } else if (req.user.rol === 'paciente') {
      // El paciente solo ve sus propias citas
      citasFiltradas = todasLasCitas.filter(c => c.pacienteId === req.user.pacienteId);
    }
    // Admin y Recepcionista ven todas las citas (no se filtra)

    successResponse(res, citasFiltradas, 'Citas obtenidas correctamente');
  });

  getById = asyncHandler(async (req, res) => {
    const cita = await citaService.getById(req.params.id);

    // Verificar permisos: el usuario debe tener acceso a esta cita
    if (req.user.rol === 'medico' && cita.medicoId !== req.user.medicoId) {
      return errorResponse(res, 'No tienes permiso para ver esta cita', 403);
    }

    if (req.user.rol === 'paciente' && cita.pacienteId !== req.user.pacienteId) {
      return errorResponse(res, 'No tienes permiso para ver esta cita', 403);
    }

    successResponse(res, cita, 'Cita obtenida correctamente');
  });

  create = asyncHandler(async (req, res) => {
    // Solo Admin y Recepcionista pueden crear citas (validado en rutas)
    const cita = await citaService.create(req.body);
    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'CREATE', 'CITA', `Cita creada para ${cita.fecha} a las ${cita.hora}`);

    // Intentar enviar correo de confirmación
    try {
      const { Paciente } = await import('../models/index.js').then(m => m.default);
      const paciente = await Paciente.findByPk(cita.pacienteId);

      if (paciente && paciente.email) {
        const { sendEmail } = await import('../utils/emailSender.js');
        await sendEmail({
          email: paciente.email,
          subject: 'Confirmación de Cita Médica',
          message: `Hola ${paciente.nombre}, tu cita ha sido programada para el día ${cita.fecha} a las ${cita.hora}.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
              <h2 style="color: #0A4D68; text-align: center;">Confirmación de Cita</h2>
              <p>Hola <strong>${paciente.nombre}</strong>,</p>
              <p>Tu cita médica ha sido programada exitosamente con los siguientes detalles:</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${cita.fecha}</p>
                <p style="margin: 5px 0;"><strong>⏰ Hora:</strong> ${cita.hora}</p>
              </div>
              <p>Por favor, llega 10 minutos antes de tu hora programada.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="font-size: 12px; color: #64748b; text-align: center;">Este es un mensaje automático, por favor no respondas a este correo.</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error('Error enviando correo de confirmación:', emailError);
    }

    successResponse(res, cita, 'Cita creada exitosamente', 201);
  });

  update = asyncHandler(async (req, res) => {
    const citaExistente = await citaService.getById(req.params.id);

    // Verificar permisos según el rol
    if (req.user.rol === 'medico') {
      // El médico solo puede actualizar sus propias citas y solo el estado
      if (citaExistente.medicoId !== req.user.medicoId) {
        return errorResponse(res, 'No tienes permiso para actualizar esta cita', 403);
      }

      // El médico solo puede cambiar el estado
      const datosPermitidos = {
        estado: req.body.estado
      };

      const cita = await citaService.update(req.params.id, datosPermitidos);
      const userId = req.user ? req.user.id : 'unknown';
      const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
      logAction(userId, userName, 'UPDATE', 'CITA', `Estado de cita actualizado: ${cita.estado}`);
      return successResponse(res, cita, 'Estado de cita actualizado exitosamente');
    }

    // Admin y Recepcionista pueden actualizar todo
    const cita = await citaService.update(req.params.id, req.body);
    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'UPDATE', 'CITA', `Cita actualizada`);
    successResponse(res, cita, 'Cita actualizada exitosamente');
  });

  delete = asyncHandler(async (req, res) => {
    // Solo Admin puede eliminar (validado en rutas)
    await citaService.delete(req.params.id);
    const userId = req.user ? req.user.id : 'unknown';
    const userName = req.user ? (req.user.nombre || req.user.username) : 'Unknown';
    logAction(userId, userName, 'DELETE', 'CITA', `Cita eliminada: ID ${req.params.id}`);
    successResponse(res, null, 'Cita eliminada exitosamente');
  });

  getByPaciente = asyncHandler(async (req, res) => {
    // Verificar permisos: un paciente solo puede ver sus propias citas
    if (req.user.rol === 'paciente' && req.params.pacienteId !== req.user.pacienteId) {
      return errorResponse(res, 'No tienes permiso para ver estas citas', 403);
    }

    const citas = await citaService.getByPaciente(req.params.pacienteId);
    successResponse(res, citas, 'Citas del paciente obtenidas correctamente');
  });

  getByMedico = asyncHandler(async (req, res) => {
    // Verificar permisos: un médico solo puede ver sus propias citas
    if (req.user.rol === 'medico' && req.params.medicoId !== req.user.medicoId) {
      return errorResponse(res, 'No tienes permiso para ver estas citas', 403);
    }

    const citas = await citaService.getByMedico(req.params.medicoId);
    successResponse(res, citas, 'Citas del médico obtenidas correctamente');
  });

  getByFecha = asyncHandler(async (req, res) => {
    const todasLasCitas = await citaService.getByFecha(req.params.fecha);

    // Filtrar según el rol
    let citasFiltradas = todasLasCitas;

    if (req.user.rol === 'medico') {
      citasFiltradas = todasLasCitas.filter(c => c.medicoId === req.user.medicoId);
    } else if (req.user.rol === 'paciente') {
      citasFiltradas = todasLasCitas.filter(c => c.pacienteId === req.user.pacienteId);
    }

    successResponse(res, citasFiltradas, 'Citas de la fecha obtenidas correctamente');
  });

  getStats = asyncHandler(async (req, res) => {
    const allStats = await citaService.getStats();

    // Si es médico, filtrar estadísticas solo de sus citas
    if (req.user.rol === 'medico') {
      const todasLasCitas = await citaService.getAll();
      const citasMedico = todasLasCitas.filter(c => c.medicoId === req.user.medicoId);

      const statsMedico = {
        total: citasMedico.length,
        programadas: citasMedico.filter(c => c.estado === 'programada').length,
        completadas: citasMedico.filter(c => c.estado === 'completada').length,
        canceladas: citasMedico.filter(c => c.estado === 'cancelada').length,
        en_proceso: citasMedico.filter(c => c.estado === 'en_proceso').length
      };

      return successResponse(res, statsMedico, 'Estadísticas obtenidas correctamente');
    }

    // Si es paciente, filtrar estadísticas solo de sus citas
    if (req.user.rol === 'paciente') {
      const todasLasCitas = await citaService.getAll();
      const citasPaciente = todasLasCitas.filter(c => c.pacienteId === req.user.pacienteId);

      const statsPaciente = {
        total: citasPaciente.length,
        programadas: citasPaciente.filter(c => c.estado === 'programada').length,
        completadas: citasPaciente.filter(c => c.estado === 'completada').length,
        canceladas: citasPaciente.filter(c => c.estado === 'cancelada').length,
        en_proceso: citasPaciente.filter(c => c.estado === 'en_proceso').length
      };

      return successResponse(res, statsPaciente, 'Estadísticas obtenidas correctamente');
    }

    // Admin y Recepcionista ven todas las estadísticas
    successResponse(res, allStats, 'Estadísticas obtenidas correctamente');
  });
}

export default new CitaController();