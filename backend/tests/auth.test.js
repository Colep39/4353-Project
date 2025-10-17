const request = require("supertest");
const app = require("../src/app");
require('dotenv').config({ path: '.env.test' });

describe("Auth routes", () =>{
    it("GET /api/auth should return 404 for unknown path", async () => {
        const res = await request(app).get('/api/auth/unknown');
        expect(res.statusCode).toBe(404);
    });

    // register endpoint
    it("POST /api/register should return 400 for missing fields", async () =>{
        const res = await request(app)
            .post("/api/auth/register")
            .expect("Content-Type", /json/)
            .send({
                email: "xyz@amazon.com",
                password: "hello" // missing userType field
            });

        expect(res.statusCode).toBe(400);
    });

    it("POST /api/register should return 200 on valid inputs", async () =>{
        const res = await request(app)
            .post("/api/auth/register")
            .expect("Content-Type", /json/)
            .send({
                email: "xyz@amazon.com",
                password: "hello",
                userType: "admin"
            })

        expect(res.statusCode).toBe(200);
    });

    // login endpoint
    it("POST /api/login should return 401 for invalid credentials", async () =>{
        const res = await request(app)
            .post("/api/auth/login")
            .expect("Content-Type", /json/)
            .send({
                email: "fake@email.com",
                password: "idontexist"
            })

        expect(res.statusCode).toBe(401);
    });

    it("POST /api/login should return 200 for valid match", async () =>{
        const res = await request(app)
            .post("/api/auth/login")
            .expect("Content-Type", /json/)
            .send({
                email: "real@test.com",
                password: "testpass"
            })

        expect(res.statusCode).toBe(200);
    });
})