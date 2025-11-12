const request = require("supertest");
const app = require("../src/app");
require('dotenv').config({ path: '.env.test' });

describe("Auth routes", () => {
  let tempEmail = `temp${Date.now()}@test.com`;
  let tempPassword = "test123";
  let userType = "volunteer";

  it("GET /api/auth should return 404 for unknown path", async () => {
    const res = await request(app).get('/api/auth/unknown');
    expect(res.statusCode).toBe(404);
  });

  // REGISTRATION TESTS

  it("POST /api/auth/register should return 400 for missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .expect("Content-Type", /json/)
      .send({
        email: tempEmail,
        password: tempPassword // missing userType
      });

    expect(res.statusCode).toBe(400);
  });

  it("POST /api/auth/register should return 201 on valid input", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .expect("Content-Type", /json/)
      .send({
        email: tempEmail,
        password: tempPassword,
        userType
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("POST /api/auth/register should return 409 on duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: tempEmail,
        password: tempPassword,
        userType
      });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty("message");
  });

  // LOGIN TESTS

  it("POST /api/auth/login should return 401 for invalid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .expect("Content-Type", /json/)
      .send({
        email: "fake@email.com",
        password: "idontexist"
      });

    expect(res.statusCode).toBe(401);
  });

  it("POST /api/auth/login should return 200 & JWT for valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .expect("Content-Type", /json/)
      .send({
        email: tempEmail,
        password: tempPassword
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(typeof res.body.token).toBe("string");
  });
});
