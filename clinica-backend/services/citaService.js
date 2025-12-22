import { Op } from 'sequelize';
import db from '../models/index.js';
const { Cita, Paciente, Medico } = db;

class CitaService {
  async getAll(filters = {}) {
    return await Cita.findAll({
      where: filters,
      include: [
        { model: Paciente, as: 'paciente', attributes: ['id', 'nombre', 'dni'] },
        { model: Medico, as: 'medico', attributes: ['id', 'nombre', 'especialidad'] }
      ],
      order: [['fecha', 'DESC'], ['hora', 'DESC']]
    });
  }

  async getById(id) {
    const cita = await Cita.findByPk(id, {
      include: [
        { model: Paciente, as: 'paciente' },
        { model: Medico, as: 'medico' }
      ]
    });
    if (!cita) throw new Error('Cita no encontrada');
    return cita;
  }

  async create(citaData) {
    // Verificar que el paciente existe
    const paciente = await Paciente.findByPk(citaData.pacienteId);
    if (!paciente) throw new Error('Paciente no encontrado');

    // Verificar que el médico existe
    const medico = await Medico.findByPk(citaData.medicoId);
    if (!medico) throw new Error('Médico no encontrado');

    // Verificar disponibilidad (no dos citas a la misma hora con el mismo médico)
    const conflicto = await Cita.findOne({
      where: {
        medicoId: citaData.medicoId,
        fecha: citaData.fecha,
        hora: citaData.hora,
        estado: { [Op.ne]: 'cancelada' }
      }
    });

    if (conflicto) {
      throw new Error('Ya existe una cita programada para ese médico en ese horario');
    }

    return await Cita.create(citaData);
  }

  async update(id, citaData) {
    const cita = await Cita.findByPk(id);
    if (!cita) throw new Error('Cita no encontrada');

    // Si se está cambiando la hora o fecha, verificar disponibilidad
    if ((citaData.fecha && citaData.fecha !== cita.fecha) ||
      (citaData.hora && citaData.hora !== cita.hora) ||
      (citaData.medicoId && citaData.medicoId !== cita.medicoId)) {

      const conflicto = await Cita.findOne({
        where: {
          id: { [Op.ne]: id },
          medicoId: citaData.medicoId || cita.medicoId,
          fecha: citaData.fecha || cita.fecha,
          hora: citaData.hora || cita.hora,
          estado: { [Op.ne]: 'cancelada' }
        }
      });

      if (conflicto) {
        throw new Error('Ya existe una cita programada para ese médico en ese horario');
      }
    }

    return await cita.update(citaData);
  }

  async delete(id) {
    const cita = await Cita.findByPk(id);
    if (!cita) throw new Error('Cita no encontrada');

    await cita.destroy();
    return true;
  }

  async getByPaciente(pacienteId) {
    return await Cita.findAll({
      where: { pacienteId },
      include: [
        { model: Medico, as: 'medico', attributes: ['nombre', 'especialidad'] }
      ],
      order: [['fecha', 'DESC'], ['hora', 'DESC']]
    });
  }

  async getByMedico(medicoId) {
    return await Cita.findAll({
      where: { medicoId },
      include: [
        { model: Paciente, as: 'paciente', attributes: ['nombre', 'dni'] }
      ],
      order: [['fecha', 'DESC'], ['hora', 'DESC']]
    });
  }

  async getByFecha(fecha) {
    return await Cita.findAll({
      where: { fecha },
      include: [
        { model: Paciente, as: 'paciente', attributes: ['nombre', 'dni'] },
        { model: Medico, as: 'medico', attributes: ['nombre', 'especialidad'] }
      ],
      order: [['hora', 'ASC']]
    });
  }
}

export default new CitaService();
