import request from 'supertest';
import { app, sequelize, loginAsAdmin } from './helpers.js';

const { Paciente, Medico, Cita } = sequelize.models;

describe('Citas Endpoints', () => {
  let token;
  let paciente;
  let medico;
  let citaId;

  const auth = (req) => req.set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    token = await loginAsAdmin();
    const suffix = Date.now();

    // Cada suite crea sus propios datos: los tests no dependen del estado de la BD.
    paciente = await Paciente.create({
      nombre: 'Paciente Citas Test',
      dni: `CT-${suffix}`,
      fechaNacimiento: '1990-01-01',
      genero: 'Femenino'
    });
    medico = await Medico.create({
      nombre: 'Médico Citas Test',
      especialidad: 'General',
      matricula: `MCT-${suffix}`,
      email: `medico-${suffix}@test.com`
    });
  });

  afterAll(async () => {
    await Cita.destroy({ where: { pacienteId: paciente.id } });
    await paciente.destroy();
    await medico.destroy();
    await sequelize.close();
  });

  it('lista las citas', async () => {
    const res = await auth(request(app).get('/api/citas'));

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('crea una cita', async () => {
    const res = await auth(request(app).post('/api/citas')).send({
      pacienteId: paciente.id,
      medicoId: medico.id,
      fecha: '2030-12-30',
      hora: '10:00',
      motivo: 'Consulta de prueba'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    citaId = res.body.data.id;
  });

  it('impide dos citas del mismo médico en el mismo horario (409)', async () => {
    const res = await auth(request(app).post('/api/citas')).send({
      pacienteId: paciente.id,
      medicoId: medico.id,
      fecha: '2030-12-30',
      hora: '10:00',
      motivo: 'Cita duplicada'
    });

    expect(res.statusCode).toBe(409);
  });

  it('no permite eliminar un paciente con citas (409)', async () => {
    const res = await auth(request(app).delete(`/api/pacientes/${paciente.id}`));
    expect(res.statusCode).toBe(409);
  });

  it('elimina la cita', async () => {
    const res = await auth(request(app).delete(`/api/citas/${citaId}`));
    expect(res.statusCode).toBe(200);
  });
});
