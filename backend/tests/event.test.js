const request = require("supertest");
const app = require("../src/app");
require('dotenv').config({ path: '.env.test' });
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { sub: 1, role: "volunteer" },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe("Event routes", () =>{
    /* This endpoint needs to be updated to use a mock DB instead of a real connection. This can be handled later.
    it("GET /api/events should return a JSON", async () => {
        const res = await request(app).get('/api/events').set("Authorization", `Bearer ${token}`);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.statusCode).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("title");
        expect(res.body[0]).toHaveProperty("date");
        expect(res.body[0].date).toHaveProperty("start");
        expect(res.body[0].date).toHaveProperty("end");
        expect(res.body[0]).toHaveProperty("urgency");
        expect(res.body[0]).toHaveProperty("description");
        expect(res.body[0]).toHaveProperty("image");

    })
    */
    it("GET /api/events/unknown should return a 404", async () => {
        const res = await request(app).get('/api/events/unknown').set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(404);
    })
})