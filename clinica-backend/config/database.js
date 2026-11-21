/**
 * Conexión a PostgreSQL mediante Sequelize.
 *
 * Soporta `DATABASE_URL` (Neon, Render, Vercel Postgres...) o variables
 * `DB_*` individuales. `pg` se pasa explícitamente como `dialectModule`
 * para que los bundlers serverless (Vercel) lo incluyan en el paquete.
 */

import pg from 'pg';
import { Sequelize } from 'sequelize';
import config from './config.js';

const { database } = config;

const options = {
  dialect: 'postgres',
  dialectModule: pg,
  dialectOptions: database.ssl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {},
  logging: database.logging ? console.log : false,
  pool: {
    max: database.poolMax,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
};

const sequelize = database.url
  ? new Sequelize(database.url, options)
  : new Sequelize(database.name, database.user, database.password, {
    ...options,
    host: database.host,
    port: database.port
  });

export default sequelize;
