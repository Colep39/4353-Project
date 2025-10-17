const request = require('supertest');
const app = require('../src/app');
require('dotenv').config({ path: '.env.test' });

const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { sub: 1, },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe('User routes', () => {
    it('GET /api/user/:id should return user data for profile', async () => {
        const res = await request(app)
            .get('/api/users/1')
            .set('Authorization', `Bearer ${token}`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('email');
    });

    // see if update works
    it('PUT /api/users/:id/update should update user data for profile', async() => {
        const updatedData = {
            id: 1,
            name: "Cole Hawke",
            email: "colep3@icloud.com",
            address1: "1234 Elm St",
            address2: "Those who John Barnes",
            city: "Antarctica City",
            state: "Wakanda",
            zip: "99999",
            skills: ["Event Setup", "Food Distribution", "Fundraising"],
            preferences: "Prefers outdoor volunteering opportunities.",
            availability: ["Weekdays after 5pm", "Weekends"],
            joinedEvents: [],
            profilePhoto: "/images/avatars/cole.jpg",
            role: "Admin",
        };

        const res = await request(app)
            .put('/api/users/1/update')
            .set('Authorization', `Bearer ${token}`)
            .send(updatedData)
            .expect('Content-type', /json/)
        

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject(updatedData);
    });

    it('should return 404 for non-existing user', async () => {
        const res = await request(app)
            .get('/api/users/9999')
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('User not found');
    });

});