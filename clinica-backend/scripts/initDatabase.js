/**
 * Crea/actualiza las tablas y siembra los datos mínimos.
 * Uso: npm run db:init   (útil para preparar la base de datos de producción)
 */

import db from '../models/index.js';
import { initializeDatabase } from '../bootstrap.js';

const run = async () => {
  try {
    await initializeDatabase({ alter: true });
    console.log('🎉 Base de datos inicializada correctamente');
    process.exitCode = 0;
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error.message);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
};

run();
