const request = require("supertest");
const app = require("../src/app");
require('dotenv').config({ path: '.env.test' });

const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { sub: 1, role: "volunteer" },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe("Volunteer History routes", () =>{
    it("GET /api/volunteerHistory should return 404 for unknown path", async () => {
        const res = await request(app).get('/api/volunteerHistory/unknown').set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
    })

    it("GET /api/volunteerHistory should return a valid json object", async() => {
        const res = await request(app).get('/api/volunteerHistory').set("Authorization", `Bearer ${token}`);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.every(x =>
            x.hasOwnProperty('id') &&
            x.hasOwnProperty('title') &&
            x.hasOwnProperty('date') &&
            x.hasOwnProperty('urgency') &&
            x.hasOwnProperty('description') &&
            x.hasOwnProperty('image')
        )).toBe(true);
    })

    
})