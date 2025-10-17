const request = require("supertest");
const app = require("../src/app");
require('dotenv').config({ path: '.env.test' });

describe("Auth routes", () =>{
    it("GET /api/auth should return 404 for unknown path", async () => {
        const res = await request(app).get('/api/auth/unknown');
        expect(res.statusCode).toBe(404);
    })

    it("POST /api/register should return 400 for missing fields", async () =>{
        const res = await request(app)
            .post("/api/auth/register")
            .expect("Content-Type", /json/)
            .send({
                email: "xyz@amazon.com",
                password: "hello" // missing userType field
            });

        expect(res.statusCode).toBe(400);
    })
})