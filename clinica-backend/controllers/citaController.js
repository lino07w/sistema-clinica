/**
 * Controlador de Citas con Sistema de Roles
 */

import citaService from '../services/citaService.js';
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
    try {
      const cita = await citaService.getById(req.params.id);
      
      // Verificar permisos: el usuario debe tener acceso a esta cita
      if (req.user.rol === 'medico' && cita.medicoId !== req.user.medicoId) {
        return errorResponse(res, 'No tienes permiso para ver esta cita', 403);
      }
      
      if (req.user.rol === 'paciente' && cita.pacienteId !== req.user.pacienteId) {
        return errorResponse(res, 'No tienes permiso para ver esta cita', 403);
      }
      
      successResponse(res, cita, 'Cita obtenida correctamente');
    } catch (error) {
      notFoundResponse(res, error.message);
    }
  });

  create = asyncHandler(async (req, res) => {
    try {
      // Solo Admin y Recepcionista pueden crear citas (validado en rutas)
      const cita = await citaService.create(req.body);
      successResponse(res, cita, 'Cita creada exitosamente', 201);
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  });

  update = asyncHandler(async (req, res) => {
    try {
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
        return successResponse(res, cita, 'Estado de cita actualizado exitosamente');
      }
      
      // Admin y Recepcionista pueden actualizar todo
      const cita = await citaService.update(req.params.id, req.body);
      successResponse(res, cita, 'Cita actualizada exitosamente');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
  });

  delete = asyncHandler(async (req, res) => {
    try {
      // Solo Admin puede eliminar (validado en rutas)
      await citaService.delete(req.params.id);
      successResponse(res, null, 'Cita eliminada exitosamente');
    } catch (error) {
      errorResponse(res, error.message, 400);
    }
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