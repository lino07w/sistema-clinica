import { Op } from 'sequelize';
import db from '../models/index.js';
const { Medico } = db;

class MedicoService {
  async getAll(filters = {}) {
    return await Medico.findAll({
      where: filters,
      order: [['nombre', 'ASC']]
    });
  }

  async getById(id) {
    const medico = await Medico.findByPk(id);
    if (!medico) throw new Error('Médico no encontrado');
    return medico;
  }

  async create(medicoData) {
    // Verificar matrícula duplicada
    const existingMatricula = await Medico.findOne({
      where: { matricula: medicoData.matricula }
    });
    if (existingMatricula) throw new Error('Ya existe un médico con esta matrícula');

    return await Medico.create({ ...medicoData, activo: true });
  }

  async update(id, medicoData) {
    const medico = await Medico.findByPk(id);
    if (!medico) throw new Error('Médico no encontrado');

    // Verificar matrícula duplicada si cambió
    if (medicoData.matricula && medicoData.matricula !== medico.matricula) {
      const duplicateMatricula = await Medico.findOne({
        where: {
          matricula: medicoData.matricula,
          id: { [Op.ne]: id }
        }
      });
      if (duplicateMatricula) throw new Error('Ya existe un médico con esta matrícula');
    }

    return await medico.update(medicoData);
  }

  async delete(id) {
    const medico = await Medico.findByPk(id);
    if (!medico) throw new Error('Médico no encontrado');

    // Verificar si tiene citas asociadas
    const { Cita } = db;
    const citasCount = await Cita.count({ where: { medicoId: id } });
    if (citasCount > 0) {
      throw new Error('No se puede eliminar el médico porque tiene citas asociadas');
    }

    await medico.destroy();
    return true;
  }

  async search(query) {
    if (!query) return await this.getAll();

    const searchQuery = query.toLowerCase();
    return await Medico.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.iLike]: `%${searchQuery}%` } },
          { especialidad: { [Op.iLike]: `%${searchQuery}%` } },
          { matricula: { [Op.iLike]: `%${searchQuery}%` } }
        ]
      },
      order: [['nombre', 'ASC']]
    });
  }

  async getByEspecialidad(especialidad) {
    return await Medico.findAll({
      where: { especialidad, activo: true },
      order: [['nombre', 'ASC']]
    });
  }
}

export default new MedicoService();
