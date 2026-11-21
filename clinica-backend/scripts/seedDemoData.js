/**
 * Carga datos de demostración. BORRA la base de datos.
 *
 * Uso:            npm run seed
 * En producción:  SEED_ALLOW_RESET=true npm run seed   (protección explícita)
 */

import config from '../config/config.js';
import db from '../models/index.js';
import { seedDemoData } from '../seeders/demoData.js';

const run = async () => {
  if (config.isProduction && process.env.SEED_ALLOW_RESET !== 'true') {
    throw new Error('Este script BORRA la base de datos. En producción ejecútalo con SEED_ALLOW_RESET=true.');
  }
  await seedDemoData({ reset: true, log: console.log });
};

run()
  .then(() => {
    console.log('\n🚀 Datos de demostración cargados');
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error('❌ Error cargando datos de demo:', error.message);
    process.exitCode = 1;
  })
  .finally(() => db.sequelize.close());
