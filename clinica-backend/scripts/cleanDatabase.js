import db from '../models/index.js';

const { sequelize } = db;

async function cleanDatabase() {
    try {
        console.log('🧹 Limpiando base de datos...\n');

        await sequelize.authenticate();
        console.log('✅ Conexión establecida\n');

        // Eliminar vistas (que causan el error)
        console.log('📋 Eliminando vistas...');
        await sequelize.query('DROP VIEW IF EXISTS vista_citas_completa CASCADE;');
        console.log('  ✅ Vistas eliminadas\n');

        // Eliminar todas las tablas
        console.log('🗑️  Eliminando tablas anteriores...');
        await sequelize.query('DROP TABLE IF EXISTS audit_logs CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS historial_medico CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS facturas CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS citas CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS medicos CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS pacientes CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS config CASCADE;');
        await sequelize.query('DROP TABLE IF EXISTS users CASCADE;');
        console.log('  ✅ Tablas eliminadas\n');

        // Eliminar tipos ENUM
        console.log('🔢 Eliminando tipos ENUM...');
        await sequelize.query('DROP TYPE IF EXISTS "enum_users_rol" CASCADE;');
        await sequelize.query('DROP TYPE IF EXISTS "enum_users_estado" CASCADE;');
        await sequelize.query('DROP TYPE IF EXISTS "enum_citas_estado" CASCADE;');
        await sequelize.query('DROP TYPE IF EXISTS "enum_facturas_estado" CASCADE;');
        console.log('  ✅ Tipos ENUM eliminados\n');

        console.log('🎉 Base de datos limpiada correctamente');
        console.log('\n💡 Ahora ejecuta: node scripts/initDatabase.js');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error limpiando la base de datos:', error.message);
        process.exit(1);
    }
}

cleanDatabase();
