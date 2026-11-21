/**
 * Inicialización de la base de datos: crea las tablas si no existen y
 * siembra los datos mínimos (configuración y administrador inicial).
 *
 * Es idempotente: puede ejecutarse en cada arranque sin efectos secundarios.
 */

import config from './config/config.js';
import db from './models/index.js';
import { seedDemoData } from './seeders/demoData.js';

const { sequelize, User, Config, Paciente } = db;

const seedConfig = async () => {
  if ((await Config.count()) > 0) return;
  await Config.create({
    nombreClinica: 'Clínica Médica',
    horarioAtencion: 'Lun-Vie: 8:00-18:00, Sáb: 8:00-13:00',
    moneda: 'S/'
  });
};

const seedAdmin = async () => {
  if (await User.findOne({ where: { rol: 'administrador' } })) return;

  const { username, email, password } = config.defaultAdmin;
  if (!password) {
    console.warn('[bootstrap] No existe un administrador y DEFAULT_ADMIN_PASSWORD no está definido: no se crea ninguno.');
    return;
  }

  await User.create({
    username,
    email,
    password,
    nombre: 'Administrador Sistema',
    rol: 'administrador',
    estado: 'activo'
  });
};

/**
 * @param {object}  [options]
 * @param {boolean} [options.alter=false] Ajusta columnas de tablas existentes.
 *   Útil en desarrollo; en producción se recomienda usar migraciones.
 */
export const initializeDatabase = async ({ alter = false } = {}) => {
  await sequelize.authenticate();
  await sequelize.sync({ alter });
  await seedConfig();
  await seedAdmin();

  // Demo pública: si se habilita y la BD está vacía, se cargan datos de
  // ejemplo. Nunca borra ni sobrescribe datos existentes.
  if (config.seedDemoData && (await Paciente.count()) === 0) {
    await seedDemoData();
    console.log('[bootstrap] Datos de demostración cargados');
  }
};

export default initializeDatabase;
