const request = require('supertest');
const app = require('../src/app');
require('dotenv').config({ path: '.env.test' });

const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { sub: 1, },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe('Notification routes', () => {
    it('returns 401 for unauthorized access to notifications', async () => {
        const res = await request(app).get('/api/notifications/unknown');
        expect(res.statusCode).toBe(401);

    });

    it('GET /api/notifications should return 200 and an array of the users notifications', async () => {
        const res = await request(app)
            .get('/api/notifications/1')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(Array.isArray(res.body)).toBe(true);

    });
});