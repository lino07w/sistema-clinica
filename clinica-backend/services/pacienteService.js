/**
 * Servicio de Pacientes
 * Maneja la lógica de negocio de pacientes
 */

import storage from '../utils/fileStorage.js';

class PacienteService {
  /**
   * Obtener todos los pacientes
   */
  async getAll(filters = {}) {
    return await storage.find('pacientes', filters);
  }

  /**
   * Obtener paciente por ID
   */
  async getById(id) {
    const paciente = await storage.findById('pacientes', id);
    
    if (!paciente) {
      throw new Error('Paciente no encontrado');
    }
    
    return paciente;
  }

  /**
   * Crear nuevo paciente
   */
  async create(pacienteData) {
    // Verificar si ya existe un paciente con el mismo DNI
    const existingPaciente = await storage.findOne('pacientes', { 
      dni: pacienteData.dni 
    });

    if (existingPaciente) {
      throw new Error('Ya existe un paciente con este DNI');
    }

    // Crear paciente
    const paciente = await storage.create('pacientes', pacienteData);
    
    return paciente;
  }

  /**
   * Actualizar paciente
   */
  async update(id, pacienteData) {
    // Verificar que el paciente existe
    const existingPaciente = await storage.findById('pacientes', id);
    
    if (!existingPaciente) {
      throw new Error('Paciente no encontrado');
    }

    // Si se está actualizando el DNI, verificar que no esté duplicado
    if (pacienteData.dni && pacienteData.dni !== existingPaciente.dni) {
      const duplicateDni = await storage.findOne('pacientes', { 
        dni: pacienteData.dni 
      });

      if (duplicateDni) {
        throw new Error('Ya existe un paciente con este DNI');
      }
    }

    // Actualizar paciente
    const updatedPaciente = await storage.updateById('pacientes', id, pacienteData);
    
    return updatedPaciente;
  }

  /**
   * Eliminar paciente
   */
  async delete(id) {
    // Verificar que el paciente existe
    const existingPaciente = await storage.findById('pacientes', id);
    
    if (!existingPaciente) {
      throw new Error('Paciente no encontrado');
    }

    // Verificar si tiene citas asociadas
    const citas = await storage.find('citas', { pacienteId: id });
    
    if (citas.length > 0) {
      throw new Error('No se puede eliminar el paciente porque tiene citas asociadas');
    }

    // Eliminar paciente
    await storage.deleteById('pacientes', id);
    
    return true;
  }

  /**
   * Buscar pacientes
   */
  async search(query) {
    const allPacientes = await storage.read('pacientes');
    
    if (!query) {
      return allPacientes;
    }

    const searchQuery = query.toLowerCase();
    
    return allPacientes.filter(paciente => 
      paciente.nombre.toLowerCase().includes(searchQuery) ||
      paciente.dni.includes(searchQuery) ||
      (paciente.email && paciente.email.toLowerCase().includes(searchQuery))
    );
  }

  /**
   * Obtener estadísticas de pacientes
   */
  async getStats() {
    const pacientes = await storage.read('pacientes');
    
    // Calcular edades
    const edades = pacientes.map(p => {
      const hoy = new Date();
      const nacimiento = new Date(p.fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      
      return edad;
    });

    return {
      total: pacientes.length,
      edadPromedio: edades.length > 0 
        ? Math.round(edades.reduce((a, b) => a + b, 0) / edades.length) 
        : 0,
      registrosRecientes: pacientes.filter(p => {
        const registro = new Date(p.createdAt);
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        return registro >= hace30Dias;
      }).length
    };
  }
}

export default new PacienteService();
