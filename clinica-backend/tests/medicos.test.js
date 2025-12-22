import request from 'supertest';
import { app, sequelize } from '../server.js';

describe('Medicos Endpoints', () => {
    let token;

    beforeAll(async () => {
        await sequelize.authenticate();
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                usernameOrEmail: 'admin',
                password: '123456'
            });
        token = res.body.data.token;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should list all doctors', async () => {
        const res = await request(app)
            .get('/api/medicos')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
