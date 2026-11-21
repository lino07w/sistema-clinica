import db from '../models/index.js';

const { sequelize, User, Paciente, Medico, Cita, Factura, HistorialMedico, AuditLog } = db;

async function verify() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida\n');

        console.log('📊 Verificando datos migrados:\n');
        console.log('='.repeat(50));

        const userCount = await User.count();
        const pacienteCount = await Paciente.count();
        const medicoCount = await Medico.count();
        const citaCount = await Cita.count();
        const facturaCount = await Factura.count();
        const historialCount = await HistorialMedico.count();
        const auditCount = await AuditLog.count();

        console.log(`👤 Usuarios:          ${userCount}`);
        console.log(`🏥 Pacientes:         ${pacienteCount}`);
        console.log(`⚕️  Médicos:           ${medicoCount}`);
        console.log(`📅 Citas:             ${citaCount}`);
        console.log(`💰 Facturas:          ${facturaCount}`);
        console.log(`📋 Historial Médico:  ${historialCount}`);
        console.log(`📝 Logs de Auditoría: ${auditCount}`);

        console.log('='.repeat(50));

        // Verificar relaciones
        console.log('\n🔗 Verificando relaciones:\n');

        const usuarios = await User.findAll({ limit: 3 });
        console.log(`✅ Se pueden leer ${usuarios.length} usuarios`);

        if (pacienteCount > 0) {
            await Paciente.findAll({ limit: 1 });
            console.log(`✅ Se pueden leer pacientes`);
        }

        if (citaCount > 0) {
            await Cita.findAll({
                include: [
                    { model: Paciente, as: 'paciente' },
                    { model: Medico, as: 'medico' }
                ],
                limit: 1
            });
            console.log(`✅ Las relaciones de citas funcionan`);
        }

        console.log('\n🎉 Base de datos verificada correctamente');
        console.log('\n💡 Siguiente paso: Actualizar servicios y controladores');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verify();
