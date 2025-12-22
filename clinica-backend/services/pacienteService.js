import { Op } from 'sequelize';
import db from '../models/index.js';
const { Paciente } = db;

class PacienteService {
  async getAll(filters = {}) {
    return await Paciente.findAll({
      where: filters,
      order: [['createdAt', 'DESC']]
    });
  }

  async getById(id) {
    const paciente = await Paciente.findByPk(id);
    if (!paciente) throw new Error('Paciente no encontrado');
    return paciente;
  }

  async create(pacienteData) {
    // Verificar DNI duplicado
    const existingDni = await Paciente.findOne({ where: { dni: pacienteData.dni } });
    if (existingDni) throw new Error('Ya existe un paciente con este DNI');

    // Rellenar campos faltantes con valores por defecto para evitar errores
    pacienteData.genero = pacienteData.genero || 'No especificado';
    pacienteData.activo = pacienteData.activo !== undefined ? pacienteData.activo : true;
    if (pacienteData.fechaNacimiento) pacienteData.fechaNacimiento = new Date(pacienteData.fechaNacimiento);

    return await Paciente.create({ ...pacienteData });
  }

  async update(id, pacienteData) {
    const paciente = await Paciente.findByPk(id);
    if (!paciente) throw new Error('Paciente no encontrado');

    // Verificar DNI duplicado si cambió
    if (pacienteData.dni && pacienteData.dni !== paciente.dni) {
      const duplicateDni = await Paciente.findOne({
        where: {
          dni: pacienteData.dni,
          id: { [Op.ne]: id }
        }
      });
      if (duplicateDni) throw new Error('Ya existe un paciente con este DNI');
    }

    return await paciente.update(pacienteData);
  }

  async delete(id) {
    const paciente = await Paciente.findByPk(id);
    if (!paciente) throw new Error('Paciente no encontrado');

    // Verificar si tiene citas asociadas
    const { Cita } = db;
    const citasCount = await Cita.count({ where: { pacienteId: id } });
    if (citasCount > 0) {
      throw new Error('No se puede eliminar el paciente porque tiene citas asociadas');
    }

    await paciente.destroy();
    return true;
  }

  async search(query) {
    if (!query) return await this.getAll();

    const searchQuery = query.toLowerCase();
    return await Paciente.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${searchQuery}%` } },
          { dni: { [Op.iLike]: `%${searchQuery}%` } },
          { email: { [Op.iLike]: `%${searchQuery}%` } }
        ]
      },
      order: [['nombre', 'ASC']]
    });
  }
}

export default new PacienteService();
