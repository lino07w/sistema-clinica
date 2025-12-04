/**
 * Servicio de Médicos
 */

import storage from '../utils/fileStorage.js';

class MedicoService {
  async getAll(filters = {}) {
    return await storage.find('medicos', filters);
  }

  async getById(id) {
    const medico = await storage.findById('medicos', id);
    if (!medico) throw new Error('Médico no encontrado');
    return medico;
  }

  async create(medicoData) {
    // Verificar DNI duplicado
    const existingDni = await storage.findOne('medicos', { dni: medicoData.dni });
    if (existingDni) throw new Error('Ya existe un médico con este DNI');

    // Verificar matrícula duplicada
    const existingMatricula = await storage.findOne('medicos', { 
      matricula: medicoData.matricula 
    });
    if (existingMatricula) throw new Error('Ya existe un médico con esta matrícula');

    return await storage.create('medicos', { ...medicoData, activo: true });
  }

  async update(id, medicoData) {
    const existing = await storage.findById('medicos', id);
    if (!existing) throw new Error('Médico no encontrado');

    // Verificar DNI duplicado si cambió
    if (medicoData.dni && medicoData.dni !== existing.dni) {
      const duplicateDni = await storage.findOne('medicos', { dni: medicoData.dni });
      if (duplicateDni) throw new Error('Ya existe un médico con este DNI');
    }

    // Verificar matrícula duplicada si cambió
    if (medicoData.matricula && medicoData.matricula !== existing.matricula) {
      const duplicateMatricula = await storage.findOne('medicos', { 
        matricula: medicoData.matricula 
      });
      if (duplicateMatricula) throw new Error('Ya existe un médico con esta matrícula');
    }

    return await storage.updateById('medicos', id, medicoData);
  }

  async delete(id) {
    const existing = await storage.findById('medicos', id);
    if (!existing) throw new Error('Médico no encontrado');

    const citas = await storage.find('citas', { medicoId: id });
    if (citas.length > 0) {
      throw new Error('No se puede eliminar el médico porque tiene citas asociadas');
    }

    await storage.deleteById('medicos', id);
    return true;
  }

  async search(query) {
    const allMedicos = await storage.read('medicos');
    if (!query) return allMedicos;

    const searchQuery = query.toLowerCase();
    return allMedicos.filter(medico => 
      medico.nombre.toLowerCase().includes(searchQuery) ||
      medico.dni.includes(searchQuery) ||
      medico.especialidad.toLowerCase().includes(searchQuery)
    );
  }

  async getByEspecialidad(especialidad) {
    return await storage.find('medicos', { especialidad, activo: true });
  }
}

export default new MedicoService();
