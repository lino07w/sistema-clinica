/**
 * Servidor Principal
 * Sistema de Gestión de Clínica - Backend API
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/config.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import { pacienteRouter, medicoRouter, citaRouter } from './routes/entityRoutes.js';

// Crear aplicación Express
const app = express();

/* ===================== MIDDLEWARE ===================== */

// CORS - Configuración permisiva para desarrollo
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Seguridad con headers - DESACTIVADO TEMPORALMENTE para debug CORS
// app.use(helmet({
//   crossOriginResourcePolicy: false
// }));

// Parseo de JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs de peticiones (solo en desarrollo)
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting - DESACTIVADO TEMPORALMENTE PARA DESARROLLO
// const limiter = rateLimit({
//   windowMs: config.rateLimit.windowMs,
//   max: config.rateLimit.maxRequests,
//   message: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde'
// });

// app.use('/api/', limiter);

// app.use('/api/', limiter);



/* ===================== RUTAS ===================== */

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Sistema de Gestión de Clínica',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      pacientes: '/api/pacientes',
      medicos: '/api/medicos',
      citas: '/api/citas'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas principales de la API
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRouter);
app.use('/api/medicos', medicoRouter);
app.use('/api/citas', citaRouter);

/* ===================== MANEJO DE ERRORES ===================== */

// Ruta no encontrada
app.use(notFound);

// Manejador de errores global
app.use(errorHandler);

/* ===================== SERVIDOR ===================== */

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║     Sistema de Gestión de Clínica - Backend     ║
╚══════════════════════════════════════════════════╝

✅ Servidor corriendo en puerto ${PORT}
🌍 Entorno: ${config.env}
🔗 URL: http://localhost:${PORT}
📚 API: http://localhost:${PORT}/api

Endpoints disponibles:
  - POST   /api/auth/login
  - GET    /api/auth/me
  - GET    /api/pacientes
  - POST   /api/pacientes
  - GET    /api/medicos
  - POST   /api/medicos
  - GET    /api/citas
  - POST   /api/citas

Presiona CTRL+C para detener el servidor
  `);
});

/* ===================== ERRORES NO CAPTURADOS ===================== */

process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
  process.exit(1);
});

export default app;
