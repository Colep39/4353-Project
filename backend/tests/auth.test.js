const request = require("supertest");
const app = require("../src/app");
require("dotenv").config({ path: ".env.test" });

jest.mock("../src/supabaseClient", () => ({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    refreshSession: jest.fn()
  }
}));

jest.mock("../src/supabaseNoAuth", () => {
  const mockObj = {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn().mockReturnThis(),
    insert: jest.fn()
  };
  return mockObj;
});

describe("Auth routes (FULL COVERAGE)", () => {
  afterEach(() => {
    process.env.NODE_ENV = "test";
  });

  let tempEmail = `temp${Date.now()}@test.com`;
  let tempPassword = "test123";
  let userType = "volunteer";

  const supabase = require("../src/supabaseClient");
  const supabaseNoAuth = require("../src/supabaseNoAuth");

  it("GET /api/auth/* → 404 unknown path", async () => {
    const res = await request(app).get("/api/auth/unknown");
    expect(res.statusCode).toBe(404);
  });

  it("register 400 missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: tempEmail, password: tempPassword });

    expect(res.statusCode).toBe(400);
  });

  it("register 201 valid (test mode)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: tempEmail, password: tempPassword, userType });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
  });

  it("register 400 verifyRegister fails", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "", password: "", userType: "" });

    expect(res.statusCode).toBe(400);
  });

  it("register 400 when supabase signUp returns error", async () => {
    process.env.NODE_ENV = "production";

    supabase.auth.signUp.mockResolvedValue({
      data: {},
      error: { message: "signup failed" }
    });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "x@y.com", password: "123456", userType });

    expect(res.statusCode).toBe(400);
  });

  it("register 500 when insert into user_profile fails", async () => {
    process.env.NODE_ENV = "production";

    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: "123", user_metadata: { role: "volunteer" } } },
      error: null
    });

    supabaseNoAuth.insert.mockResolvedValue({
      error: { message: "insert failed" }
    });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "x@y.com", password: "123456", userType });

    expect(res.statusCode).toBe(500);
  });

  it("register 500 on thrown error", async () => {
    process.env.NODE_ENV = "production";

    supabase.auth.signUp.mockImplementation(() => {
      throw new Error("unexpected");
    });

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@b.com", password: "123456", userType });

    expect(res.statusCode).toBe(500);
  });

  it("login 400 invalid input", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "", password: "" });

    expect(res.statusCode).toBe(400);
  });

  it("login 200 valid (test mode)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: tempEmail, password: tempPassword });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("login 400 supabase error", async () => {
    process.env.NODE_ENV = "production";

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "invalid" }
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "x@y.com", password: "wrong" });

    expect(res.statusCode).toBe(400);
  });

  it("role 401 missing header", async () => {
    const res = await request(app).get("/api/auth/role");
    expect(res.statusCode).toBe(401);
  });

  it("role 401 missing token", async () => {
    const res = await request(app)
      .get("/api/auth/role")
      .set("Authorization", "Bearer ");

    expect(res.statusCode).toBe(401);
  });

  it("role 401 invalid token", async () => {
    supabaseNoAuth.auth.getUser.mockResolvedValue({
      data: {},
      error: { message: "invalid" }
    });

    const res = await request(app)
      .get("/api/auth/role")
      .set("Authorization", "Bearer faketoken");

    expect(res.statusCode).toBe(401);
  });

  it("role 200 success", async () => {
    supabaseNoAuth.auth.getUser.mockResolvedValue({
      data: { user: { user_metadata: { role: "admin" } } },
      error: null
    });

    const res = await request(app)
      .get("/api/auth/role")
      .set("Authorization", "Bearer goodtoken");

    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe("admin");
  });

  it("refresh 400 missing refresh_token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({});

    expect(res.statusCode).toBe(400);
  });

  it("refresh 400 supabase error", async () => {
    supabase.auth.refreshSession.mockResolvedValue({
      data: null,
      error: { message: "refresh failed" }
    });

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refresh_token: "bad" });

    expect(res.statusCode).toBe(400);
  });

  it("refresh 200 success", async () => {
    supabase.auth.refreshSession.mockResolvedValue({
      data: {
        session: {
          access_token: "a",
          refresh_token: "b"
        }
      },
      error: null
    });

    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refresh_token: "good" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe("a");
    expect(res.body.refresh_token).toBe("b");
  });
});
