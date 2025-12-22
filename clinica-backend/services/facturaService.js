import db from '../models/index.js';
const { Factura, Paciente } = db;

class FacturaService {
    async getAll(filters = {}) {
        return await Factura.findAll({
            where: filters,
            include: [
                { model: Paciente, as: 'paciente', attributes: ['id', 'nombre', 'dni'], required: false }
            ],
            order: [['fecha', 'DESC'], ['createdAt', 'DESC']]
        });
    }

    async getById(id) {
        const factura = await Factura.findByPk(id, {
            include: [
                { model: Paciente, as: 'paciente', required: false }
            ]
        });
        if (!factura) throw new Error('Factura no encontrada');
        return factura;
    }

    async create(facturaData) {
        // Verificar que el paciente existe si se proporcionó un ID
        if (facturaData.pacienteId) {
            const paciente = await Paciente.findByPk(facturaData.pacienteId);
            if (!paciente) {
                // Si no existe, permitir factura con nombre pero sin ID
                facturaData.pacienteId = null;
            }
        }

        return await Factura.create({
            ...facturaData,
            estado: facturaData.estado || 'pendiente'
        });
    }

    async update(id, facturaData) {
        const factura = await Factura.findByPk(id);
        if (!factura) throw new Error('Factura no encontrada');

        return await factura.update(facturaData);
    }

    async delete(id) {
        const factura = await Factura.findByPk(id);
        if (!factura) throw new Error('Factura no encontrada');

        await factura.destroy();
        return true;
    }

    async getByPaciente(pacienteId) {
        return await Factura.findAll({
            where: { pacienteId },
            order: [['fecha', 'DESC']]
        });
    }

    async getByEstado(estado) {
        return await Factura.findAll({
            where: { estado },
            include: [
                { model: Paciente, as: 'paciente', attributes: ['nombre', 'dni'], required: false }
            ],
            order: [['fecha', 'DESC']]
        });
    }

    async getTotalByEstado(estado) {
        const result = await Factura.sum('monto', {
            where: { estado }
        });
        return result || 0;
    }
}

export default new FacturaService();
