/**
 * Servicio de Citas
 */

import storage from '../utils/fileStorage.js';

class CitaService {
  async getAll(filters = {}) {
    return await storage.find('citas', filters);
  }

  async getById(id) {
    const cita = await storage.findById('citas', id);
    if (!cita) throw new Error('Cita no encontrada');
    return cita;
  }

  async create(citaData) {
    // Verificar que el paciente existe
    const paciente = await storage.findById('pacientes', citaData.pacienteId);
    if (!paciente) throw new Error('Paciente no encontrado');

    // Verificar que el médico existe
    const medico = await storage.findById('medicos', citaData.medicoId);
    if (!medico) throw new Error('Médico no encontrado');

    // Verificar disponibilidad del médico
    const citaExistente = await storage.findOne('citas', {
      medicoId: citaData.medicoId,
      fecha: citaData.fecha,
      hora: citaData.hora
    });

    if (citaExistente && citaExistente.estado !== 'cancelada') {
      throw new Error('El médico ya tiene una cita en ese horario');
    }

    // Crear cita con estado por defecto
    return await storage.create('citas', {
      ...citaData,
      estado: citaData.estado || 'programada'
    });
  }

  async update(id, citaData) {
    const existing = await storage.findById('citas', id);
    if (!existing) throw new Error('Cita no encontrada');

    // Si se cambia el médico, fecha u hora, verificar disponibilidad
    if (citaData.medicoId || citaData.fecha || citaData.hora) {
      const medicoId = citaData.medicoId || existing.medicoId;
      const fecha = citaData.fecha || existing.fecha;
      const hora = citaData.hora || existing.hora;

      const conflicto = await storage.findOne('citas', {
        medicoId,
        fecha,
        hora
      });

      if (conflicto && conflicto.id !== id && conflicto.estado !== 'cancelada') {
        throw new Error('El médico ya tiene una cita en ese horario');
      }
    }

    return await storage.updateById('citas', id, citaData);
  }

  async delete(id) {
    const existing = await storage.findById('citas', id);
    if (!existing) throw new Error('Cita no encontrada');

    await storage.deleteById('citas', id);
    return true;
  }

  async getByPaciente(pacienteId) {
    return await storage.find('citas', { pacienteId });
  }

  async getByMedico(medicoId) {
    return await storage.find('citas', { medicoId });
  }

  async getByFecha(fecha) {
    return await storage.find('citas', { fecha });
  }

  async getStats() {
    const citas = await storage.read('citas');
    const hoy = new Date().toISOString().split('T')[0];

    return {
      total: citas.length,
      hoy: citas.filter(c => c.fecha === hoy).length,
      programadas: citas.filter(c => c.estado === 'programada').length,
      confirmadas: citas.filter(c => c.estado === 'confirmada').length,
      completadas: citas.filter(c => c.estado === 'completada').length,
      canceladas: citas.filter(c => c.estado === 'cancelada').length
    };
  }
}

export default new CitaService();
