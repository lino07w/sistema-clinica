import db from '../models/index.js';

const { sequelize } = db;

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');

        // Mostrar detalles de la conexión
        const dbName = sequelize.config.database;
        const dbUser = sequelize.config.username;
        const dbHost = sequelize.config.host;
        const dbPort = sequelize.config.port;

        console.log(`📊 Base de datos: ${dbName}`);
        console.log(`👤 Usuario: ${dbUser}`);
        console.log(`🌐 Host: ${dbHost}:${dbPort}`);

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
        console.error('\n🔍 Verifica:');
        console.error('  1. PostgreSQL está corriendo');
        console.error('  2. Las credenciales en .env son correctas');
        console.error('  3. La base de datos "clinica_db" existe');
        process.exit(1);
    }
}

testConnection();
