import request from 'supertest';
import { app, sequelize } from '../server.js';

describe('Pacientes Endpoints', () => {
    let token;
    let testPacienteId;

    beforeAll(async () => {
        await sequelize.authenticate();

        // Login para obtener token
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                usernameOrEmail: 'admin',
                password: '123456'
            });
        token = res.body.data.token;
    });

    afterAll(async () => {
        // Limpiar el paciente de prueba si existe
        if (testPacienteId) {
            await request(app)
                .delete(`/api/pacientes/${testPacienteId}`)
                .set('Authorization', `Bearer ${token}`);
        }
        await sequelize.close();
    });

    it('should create a new patient', async () => {
        const res = await request(app)
            .post('/api/pacientes')
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Test Paciente Automático',
                dni: `TEST-${Date.now()}`,
                fechaNacimiento: '1990-01-01',
                genero: 'Masculino',
                email: 'test@auto.com',
                telefono: '123456789'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        testPacienteId = res.body.data.id;
    });

    it('should list all patients', async () => {
        const res = await request(app)
            .get('/api/pacientes')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        // Debe haber al menos el que acabamos de crear
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should get a specific patient by ID', async () => {
        const res = await request(app)
            .get(`/api/pacientes/${testPacienteId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.nombre).toBe('Test Paciente Automático');
    });

    it('should update a patient', async () => {
        const res = await request(app)
            .put(`/api/pacientes/${testPacienteId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                nombre: 'Test Paciente Actualizado'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);

        // Verificar cambio
        const check = await request(app)
            .get(`/api/pacientes/${testPacienteId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(check.body.data.nombre).toBe('Test Paciente Actualizado');
    });
});
