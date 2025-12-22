import request from 'supertest';
import { app, sequelize } from '../server.js';

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        await sequelize.authenticate();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('should login with correct credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                usernameOrEmail: 'admin',
                password: '123456'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('token');
    });

    it('should not login with wrong credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                usernameOrEmail: 'admin',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.success).toBe(false);
    });
});
