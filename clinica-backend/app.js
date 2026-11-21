/**
 * Definición de la aplicación Express (sin `listen`).
 *
 * Se exporta por separado para reutilizarla en:
 *  - `server.js`   → servidor HTTP tradicional (local / Docker / Render)
 *  - `api/index.js` → función serverless (Vercel)
 *  - tests con supertest
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import config from './config/config.js';
import swaggerSpecs from './config/swagger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import facturaRoutes from './routes/facturaRoutes.js';
import configRoutes from './routes/configRoutes.js';
import historialRoutes from './routes/historialRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { pacienteRouter, medicoRouter, citaRouter } from './routes/entityRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// Detrás de un proxy (Vercel, Render, Nginx) para que req.ip y el rate limit
// usen la IP real del cliente.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api/', rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.maxRequests,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde' }
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health check (útil para monitoreo y plataformas de despliegue)
const healthPayload = () => ({
  success: true,
  message: 'API Sistema de Clínica',
  version: process.env.npm_package_version || '1.0.0',
  status: 'OK'
});
app.get('/', (req, res) => res.json(healthPayload()));
app.get('/api/health', (req, res) => res.json(healthPayload()));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/pacientes', pacienteRouter);
app.use('/api/medicos', medicoRouter);
app.use('/api/citas', citaRouter);
app.use('/api/facturas', facturaRoutes);
app.use('/api/configuracion', configRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/auditoria', auditRoutes);

// 404 y manejo de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);

export default app;
