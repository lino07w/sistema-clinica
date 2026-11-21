/**
 * Configuración centralizada de la aplicación.
 *
 * Todas las variables de entorno se leen y validan aquí (fail-fast): en
 * producción la aplicación no arranca si falta un secreto obligatorio, en
 * lugar de usar silenciosamente un valor inseguro por defecto.
 */

import 'dotenv/config';

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';
const isTest = env === 'test';

/** Convierte "a, b ,c" en ['a', 'b', 'c'] descartando vacíos. */
const parseList = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseBoolean = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
};

const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

/**
 * Devuelve la variable requerida. En producción lanza un error si no existe;
 * en desarrollo/test usa el valor de respaldo indicado.
 */
const required = (name, devFallback) => {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) {
    throw new Error(`[config] La variable de entorno ${name} es obligatoria en producción`);
  }
  return devFallback;
};

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

const frontendUrl = (process.env.FRONTEND_URL || (isProduction ? '' : 'http://localhost:5173')).replace(/\/$/, '');

const corsOrigins = [...new Set([
  ...parseList(process.env.CORS_ORIGIN),
  ...(frontendUrl ? [frontendUrl] : []),
  ...(isProduction ? [] : DEV_ORIGINS)
])];

if (isProduction && corsOrigins.length === 0) {
  console.warn('[config] CORS_ORIGIN/FRONTEND_URL no definidos: el navegador bloqueará las peticiones del frontend.');
}

const config = Object.freeze({
  env,
  isProduction,
  isTest,
  port: parseInteger(process.env.PORT, 3000),
  frontendUrl,

  jwt: Object.freeze({
    secret: required('JWT_SECRET', 'dev_only_insecure_secret'),
    expire: process.env.JWT_EXPIRE || '7d'
  }),

  cors: Object.freeze({
    origin: corsOrigins,
    credentials: true
  }),

  rateLimit: Object.freeze({
    windowMs: parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    maxRequests: parseInteger(process.env.RATE_LIMIT_MAX_REQUESTS, isTest ? 10_000 : 300)
  }),

  database: Object.freeze({
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInteger(process.env.DB_PORT, 5432),
    name: process.env.DB_NAME || 'clinica_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    // SSL activado por defecto en producción (Neon, Render, Supabase...).
    ssl: parseBoolean(process.env.DB_SSL, isProduction),
    poolMax: parseInteger(process.env.DB_POOL_MAX, 5),
    logging: parseBoolean(process.env.DB_LOGGING, false)
  }),

  defaultAdmin: Object.freeze({
    username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@clinica.com',
    // En producción no hay contraseña por defecto: si no se define, no se crea el admin.
    password: process.env.DEFAULT_ADMIN_PASSWORD || (isProduction ? null : '123456')
  }),

  email: Object.freeze({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInteger(process.env.EMAIL_PORT, 2525),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || '"Sistema Clínica" <noreply@clinica.com>'
  })
});

export default config;
