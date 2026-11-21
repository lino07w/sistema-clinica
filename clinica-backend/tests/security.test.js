import request from 'supertest';
import { app, sequelize, loginAsAdmin } from './helpers.js';

const { User } = sequelize.models;

const uniqueEmail = (prefix) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}@test.com`;

describe('Seguridad', () => {
  const createdEmails = [];

  afterAll(async () => {
    await User.destroy({ where: { email: createdEmails } });
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('ignora campos privilegiados enviados por el cliente (mass assignment)', async () => {
      const email = uniqueEmail('mass');
      createdEmails.push(email);

      const res = await request(app).post('/api/auth/register').send({
        email,
        password: 'secreto123',
        nombre: 'Intento de escalada',
        rol: 'recepcionista',
        estado: 'activo',
        medicoId: 'med-falso'
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.estado).toBe('pendiente');

      const user = await User.findOne({ where: { email } });
      expect(user.estado).toBe('pendiente');
      expect(user.medicoId).toBeNull();
    });

    it('no permite auto-registrarse como administrador', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: uniqueEmail('admin'),
        password: 'secreto123',
        nombre: 'Falso admin',
        rol: 'administrador'
      });
      expect(res.statusCode).toBe(403);
    });

    it('una cuenta pendiente no puede iniciar sesión', async () => {
      const email = uniqueEmail('pend');
      createdEmails.push(email);
      await request(app).post('/api/auth/register').send({
        email, password: 'secreto123', nombre: 'Pendiente', rol: 'medico'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ usernameOrEmail: email, password: 'secreto123' });
      expect(res.statusCode).toBe(403);
    });

    it('rechaza emails duplicados con 409', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'admin@clinica.com', password: 'secreto123', nombre: 'Dup', rol: 'medico'
      });
      expect(res.statusCode).toBe(409);
    });
  });

  describe('Respuestas de usuarios', () => {
    it('nunca expone el hash de la contraseña', async () => {
      const token = await loginAsAdmin();
      const email = uniqueEmail('nohash');
      createdEmails.push(email);

      const res = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${token}`)
        .send({ email, password: 'secreto123', nombre: 'Sin hash', rol: 'recepcionista' });

      expect(res.statusCode).toBe(201);
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data).not.toHaveProperty('resetPasswordToken');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('responde igual exista o no el email (sin enumeración de usuarios)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'no-existe@test.com' });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Manejo de errores', () => {
    it('devuelve 401 sin token', async () => {
      const res = await request(app).get('/api/pacientes');
      expect(res.statusCode).toBe(401);
    });

    it('devuelve 404 JSON para rutas inexistentes', async () => {
      const res = await request(app).get('/api/no-existe');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('devuelve 404 (no 500) para un recurso inexistente', async () => {
      const token = await loginAsAdmin();
      const res = await request(app)
        .get('/api/pacientes/pac-inexistente')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });
  });
});
