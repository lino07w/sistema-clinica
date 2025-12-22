import request from 'supertest';
import { app, sequelize } from '../server.js';

describe('Citas Endpoints', () => {
    let token;
    let testCitaId;
    let pacienteId;
    let medicoId;

    beforeAll(async () => {
        await sequelize.authenticate();
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                usernameOrEmail: 'admin',
                password: '123456'
            });
        token = res.body.data.token;

        // Obtener un paciente y un médico para las pruebas
        const pacRes = await request(app)
            .get('/api/pacientes')
            .set('Authorization', `Bearer ${token}`);
        pacienteId = pacRes.body.data[0]?.id;

        const medRes = await request(app)
            .get('/api/medicos')
            .set('Authorization', `Bearer ${token}`);
        medicoId = medRes.body.data[0]?.id;
    });

    afterAll(async () => {
        if (testCitaId) {
            await request(app)
                .delete(`/api/citas/${testCitaId}`)
                .set('Authorization', `Bearer ${token}`);
        }
        await sequelize.close();
    });

    it('should list all appointments', async () => {
        const res = await request(app)
            .get('/api/citas')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should create a new appointment', async () => {
        if (!pacienteId || !medicoId) {
            console.warn('⚠️ No se puede probar creación de cita: No hay pacientes o médicos en la DB');
            return;
        }

        const res = await request(app)
            .post('/api/citas')
            .set('Authorization', `Bearer ${token}`)
            .send({
                pacienteId: pacienteId,
                medicoId: medicoId,
                fecha: '2025-12-30',
                hora: '10:00',
                motivo: 'Consulta de prueba'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        testCitaId = res.body.data.id;
    });
});
