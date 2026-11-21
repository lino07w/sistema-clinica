/**
 * Punto de entrada del servidor HTTP (local, Docker, Render...).
 * Para Vercel se usa `api/index.js`.
 */

import app from './app.js';
import config from './config/config.js';
import { initializeDatabase } from './bootstrap.js';

const start = async () => {
  try {
    // `alter` sólo en desarrollo: en producción el esquema no debe mutar solo.
    await initializeDatabase({ alter: config.env === 'development' });
    console.log('✅ Conexión a PostgreSQL establecida');

    app.listen(config.port, () => {
      console.log(`✅ API escuchando en http://localhost:${config.port} (${config.env})`);
      console.log(`📚 Documentación: http://localhost:${config.port}/api-docs`);
    });
  } catch (err) {
    console.error('❌ Error iniciando la aplicación:', err.message);
    process.exit(1);
  }
};

start();
