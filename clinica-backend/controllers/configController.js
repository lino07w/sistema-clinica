import configService from '../services/configService.js';

class ConfigController {
    // Obtener configuración
    async get(req, res) {
        try {
            const config = await configService.get();

            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener configuración'
            });
        }
    }

    // Actualizar configuración
    async update(req, res) {
        try {
            const config = await configService.update(req.body);

            res.json({
                success: true,
                message: 'Configuración actualizada correctamente',
                data: config
            });
        } catch (error) {
            console.error('Error actualizando configuración:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar configuración'
            });
        }
    }
}

export default new ConfigController();
