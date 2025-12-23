import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/config.js';
import db from './models/index.js'; // 🆕 Importar base de datos
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js'; // 👈 NUEVO
import facturaRoutes from './routes/facturaRoutes.js';
import configRoutes from './routes/configRoutes.js';
import historialRoutes from './routes/historialRoutes.js';
import { pacienteRouter, medicoRouter, citaRouter } from './routes/entityRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';

const app = express();

// Middleware de seguridad
app.use(helmet());

// CORS - Usar configuración desde config.js (soporta desarrollo y producción)
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Rate limiting - ACTIVADO PARA SEGURIDAD
const limiter = rateLimit({
  windowMs: config.rateLimit?.windowMs || 15 * 60 * 1000,
  max: config.rateLimit?.maxRequests || 100,
  message: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde'
});
app.use('/api/', limiter);

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentación de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));


// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/pacientes', pacienteRouter);
app.use('/api/medicos', medicoRouter);
app.use('/api/citas', citaRouter);
app.use('/api/facturas', facturaRoutes); // 👈 NUEVO
app.use('/api/configuracion', configRoutes); // 👈 NUEVO
app.use('/api/historial', historialRoutes); // 👈 NUEVO
app.use('/api/auditoria', auditRoutes); // 👈 NUEVO

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema de Clínica',
    version: '1.0.0',
    status: 'OK'
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Iniciar servidor con base de datos
const PORT = config.port || 3000;

const { sequelize } = db;

// Exportar para pruebas
export { app, sequelize };

// Solo iniciar si no estamos en modo de prueba
if (process.env.NODE_ENV !== 'test') {
  sequelize.authenticate()
    .then(() => {
      console.log('✅ Conexión a PostgreSQL establecida correctamente');

      app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════╗
║     Sistema de Gestión de Clínica - Backend     ║
╚══════════════════════════════════════════════════╝

✅ Servidor corriendo en puerto ${PORT}
🌍 Entorno: ${config.env}
🗄️  Base de datos: PostgreSQL
🔗 URL: http://localhost:${PORT}
📚 API: http://localhost:${PORT}/api

Endpoints disponibles:
  - POST   /api/auth/register
  - POST   /api/auth/login
  - GET    /api/auth/me
  - GET    /api/usuarios
  - POST   /api/usuarios
  - GET    /api/pacientes
  - POST   /api/pacientes
  - GET    /api/medicos
  - POST   /api/medicos
  - GET    /api/citas
  - POST   /api/citas

Presiona CTRL+C para detener el servidor
        `);
      });
    })
    .catch(err => {
      console.error('❌ Error conectando a PostgreSQL:', err.message);
      process.exit(1);
    });
}

export default app;