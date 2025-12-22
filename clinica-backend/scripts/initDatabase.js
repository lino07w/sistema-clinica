import db from '../models/index.js';

const { sequelize, User, Paciente, Medico, Cita, Factura, HistorialMedico, Config, AuditLog } = db;

async function initDatabase() {
    try {
        console.log('🔄 Iniciando sincronización de base de datos...\n');

        // Autenticar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión establecida\n');

        // Sincronizar modelos (crear tablas)
        // force: false = no elimina tablas existentes
        // alter: true = modifica las tablas para que coincidan con los modelos
        await sequelize.sync({ force: false, alter: true });

        console.log('✅ Tablas creadas/actualizadas correctamente:\n');
        console.log('  - users');
        console.log('  - pacientes');
        console.log('  - medicos');
        console.log('  - citas');
        console.log('  - facturas');
        console.log('  - historial_medico');
        console.log('  - config');
        console.log('  - audit_logs\n');

        // Crear configuración inicial si no existe
        const configExists = await Config.count();
        if (configExists === 0) {
            await Config.create({
                nombreClinica: 'Clínica Médica',
                horarioAtencion: 'Lun-Vie: 8:00-18:00, Sáb: 8:00-13:00',
                moneda: 'S/'
            });
            console.log('✅ Configuración inicial creada\n');
        }

        // Crear usuario administrador inicial si no existe
        const adminExists = await User.findOne({ where: { rol: 'administrador' } });
        if (!adminExists) {
            await User.create({
                username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
                email: 'admin@clinica.com',
                password: process.env.DEFAULT_ADMIN_PASSWORD || '123456',
                nombre: 'Administrador Sistema',
                rol: 'administrador',
                estado: 'activo'
            });
            console.log('✅ Usuario administrador inicial creado\n');
        }

        console.log('🎉 Base de datos inicializada correctamente');
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error inicializando la base de datos:', error);
        process.exit(1);
    }
}

initDatabase();
