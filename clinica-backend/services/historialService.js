import db from '../models/index.js';
const { HistorialMedico, Paciente, Medico } = db;

class HistorialService {
    async getAll(filters = {}) {
        return await HistorialMedico.findAll({
            where: filters,
            include: [
                { model: Paciente, as: 'paciente', attributes: ['id', 'nombre', 'dni'] },
                { model: Medico, as: 'medico', attributes: ['id', 'nombre', 'especialidad'] }
            ],
            order: [['fecha', 'DESC'], ['createdAt', 'DESC']]
        });
    }

    async getById(id) {
        const historial = await HistorialMedico.findByPk(id, {
            include: [
                { model: Paciente, as: 'paciente' },
                { model: Medico, as: 'medico' }
            ]
        });
        if (!historial) throw new Error('Registro de historial no encontrado');
        return historial;
    }

    async create(historialData) {
        // Verificar que el paciente existe
        const paciente = await Paciente.findByPk(historialData.pacienteId);
        if (!paciente) throw new Error('Paciente no encontrado');

        // Verificar que el médico existe
        const medico = await Medico.findByPk(historialData.medicoId);
        if (!medico) throw new Error('Médico no encontrado');

        return await HistorialMedico.create(historialData);
    }

    async update(id, historialData) {
        const historial = await HistorialMedico.findByPk(id);
        if (!historial) throw new Error('Registro de historial no encontrado');

        return await historial.update(historialData);
    }

    async delete(id) {
        const historial = await HistorialMedico.findByPk(id);
        if (!historial) throw new Error('Registro de historial no encontrado');

        await historial.destroy();
        return true;
    }

    async getByPaciente(pacienteId) {
        return await HistorialMedico.findAll({
            where: { pacienteId },
            include: [
                { model: Medico, as: 'medico', attributes: ['nombre', 'especialidad'] }
            ],
            order: [['fecha', 'DESC']]
        });
    }

    async getByMedico(medicoId) {
        return await HistorialMedico.findAll({
            where: { medicoId },
            include: [
                { model: Paciente, as: 'paciente', attributes: ['nombre', 'dni'] }
            ],
            order: [['fecha', 'DESC']]
        });
    }
}

export default new HistorialService();
