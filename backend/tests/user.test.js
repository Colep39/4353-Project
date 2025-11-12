const request = require('supertest');
const app = require('../src/app');
require('dotenv').config({ path: '.env.test' });
const jwt = require("jsonwebtoken");

const adminToken = jwt.sign(
  { sub: 1, role: "admin" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

describe('User routes', () => {
  
  it('GET /api/users/:id should return user data for profile', async () => {
    const res = await request(app)
      .get('/api/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email');
    expect(res.body.id).toBe(1);
  });

  it('PUT /api/users/:id/update should update user data', async () => {
    const updatedData = {
      name: "Cole Hawke",
      email: "colep3@icloud.com",
      city: "Antarctica City",
      state: "Wakanda",
    };

    const res = await request(app)
      .put('/api/users/1/update')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updatedData)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toMatchObject(updatedData);
  });

  it('GET /api/users/:id should return 404 for non-existing user', async () => {
    const res = await request(app)
      .get('/api/users/9999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "User not found");
  });
});
