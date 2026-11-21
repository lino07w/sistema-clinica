import request from 'supertest';
import app from '../app.js';
import db from '../models/index.js';

export const { sequelize } = db;
export { app };

/** Inicia sesión con el administrador sembrado por `npm run pretest`. */
export const loginAsAdmin = async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ usernameOrEmail: 'admin', password: '123456' });
  return res.body.data.token;
};
