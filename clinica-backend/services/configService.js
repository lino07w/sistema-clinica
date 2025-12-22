import db from '../models/index.js';
const { Config } = db;

class ConfigService {
    async get() {
        let config = await Config.findByPk(1);

        // Si no existe configuración, crear una por defecto
        if (!config) {
            config = await Config.create({
                id: 1,
                nombreClinica: 'Clínica Médica',
                horarioAtencion: 'Lun-Vie: 8:00-18:00, Sáb: 8:00-13:00',
                moneda: 'S/'
            });
        }

        return config;
    }

    async update(configData) {
        let config = await Config.findByPk(1);

        if (!config) {
            // Crear si no existe
            config = await Config.create({ id: 1, ...configData });
        } else {
            // Actualizar existente
            await config.update(configData);
        }

        return config;
    }
}

export default new ConfigService();
