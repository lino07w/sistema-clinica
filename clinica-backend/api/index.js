/**
 * Handler serverless para Vercel.
 *
 * Vercel ejecuta este archivo como una Function de Node.js. Todas las rutas
 * se redirigen aquí (ver `vercel.json`) y Express se encarga del ruteo.
 *
 * La inicialización de la base de datos se hace una sola vez por instancia
 * ("cold start") y se reutiliza en las siguientes invocaciones.
 */

import app from '../app.js';
import { initializeDatabase } from '../bootstrap.js';

let ready;

const ensureReady = () => {
  if (!ready) {
    ready = initializeDatabase().catch((err) => {
      ready = undefined; // permitir reintento en la próxima invocación
      throw err;
    });
  }
  return ready;
};

export default async function handler(req, res) {
  try {
    await ensureReady();
  } catch (err) {
    console.error('❌ No se pudo inicializar la base de datos:', err.message);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Servicio no disponible: base de datos inaccesible' }));
    return;
  }
  return app(req, res);
}
