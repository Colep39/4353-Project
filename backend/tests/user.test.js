require("dotenv").config({ path: ".env.test" });

const supabase = require("../src/supabaseNoAuth");
jest.mock("../src/supabaseNoAuth");

const request = require("supertest");
const app = require("../src/app");
const jwt = require("jsonwebtoken");

const adminToken = jwt.sign(
  { sub: 1, role: "admin" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

describe("User routes", () => {
  let callIndex;

  const mockTable = {
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    or: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis()
  };

  beforeEach(() => {
    callIndex = 0;
    supabase.from.mockImplementation(() => mockTable);
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 1 } },
      error: null
    });
    mockTable.select.mockClear();
    mockTable.update.mockClear();
    mockTable.delete.mockClear();
    mockTable.insert.mockClear();
    mockTable.eq.mockClear();
    mockTable.single.mockClear();
    mockTable.or.mockClear();
    mockTable.in.mockClear();
  });

  it("GET /api/users/:id returns profile", async () => {
    mockTable.single.mockResolvedValueOnce({
      data: { full_name: "Cole Harden", city: "Houston" },
      error: null
    });
    const res = await request(app)
      .get("/api/users/1")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.full_name).toBe("Cole Harden");
  });

  it("GET /api/users/:id returns 401 when invalid token", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: null,
      error: new Error("bad token")
    });
    const res = await request(app)
      .get("/api/users/1")
      .set("Authorization", "Bearer BADTOKEN");
    expect(res.statusCode).toBe(401);
  });

  it("GET /api/users/:id returns 404 when profile missing", async () => {
    mockTable.single.mockResolvedValueOnce({ data: null, error: null });
    const res = await request(app)
      .get("/api/users/123")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it("GET /api/users/:id returns 500 on profileError", async () => {
    mockTable.single.mockResolvedValueOnce({
      data: null,
      error: new Error("profileError")
    });
    const res = await request(app)
      .get("/api/users/1")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(500);
  });

  it("GET /api/users/:id returns 401 when missing token", async () => {
    const res = await request(app).get("/api/users/1");
    expect(res.statusCode).toBe(401);
  });

  it("PUT /api/users/:id/update updates profile", async () => {
    mockTable.single.mockResolvedValueOnce({ data: { state_id: 99 } });
    const res = await request(app)
      .put("/api/users/1/update")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        full_name: "Cole Hawke",
        city: "Houston",
        state: "TX",
        skills: []
      });
    expect(res.statusCode).toBe(200);
  });

  it("PUT /api/users/:id/update with string skills runs split branch", async () => {
    const stateRow = { data: { state_id: 22 } };
    const emptySkills = { data: [] };

    callIndex = 0;
    supabase.from.mockImplementation(() => {
      if (callIndex === 0) {
        callIndex++;
        return {
          select: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(stateRow)
        };
      }
      if (callIndex === 1) {
        callIndex++;
        return {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis()
        };
      }
      if (callIndex === 2) {
        callIndex++;
        return {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis()
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue(emptySkills)
      };
    });

    const res = await request(app)
      .put("/api/users/1/update")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        full_name: "Tester",
        city: "Nowhere",
        state: "TX",
        skills: "SkillA, SkillB"
      });

    expect(res.statusCode).toBe(200);
  });

  it("PUT /api/users/:id/update triggers insert branch", async () => {
    const stateRow = { data: { state_id: 5 } };
    const skillRows = { data: [{ skill_id: 10, description: "Desc" }] };

    callIndex = 0;
    supabase.from.mockImplementation(() => {
      if (callIndex === 0) {
        callIndex++;
        return {
          select: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue(stateRow)
        };
      }
      if (callIndex === 1) {
        callIndex++;
        return {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis()
        };
      }
      if (callIndex === 2) {
        callIndex++;
        return {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis()
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue(skillRows),
        insert: jest.fn().mockResolvedValue({})
      };
    });

    const res = await request(app)
      .put("/api/users/1/update")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        full_name: "X",
        city: "Y",
        state: "TX",
        skills: ["A"]
      });

    expect(res.statusCode).toBe(200);
  });

  it("PUT /api/users/:id/update returns 401 invalid token", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: null,
      error: new Error("bad")
    });
    const res = await request(app)
      .put("/api/users/1/update")
      .set("Authorization", "Bearer BAD");
    expect(res.statusCode).toBe(401);
  });

  it("PUT /api/users/:id/update returns 500 when update fails", async () => {
    mockTable.single.mockResolvedValueOnce({ data: { state_id: 1 } });
    mockTable.update.mockImplementationOnce(() => {
      throw new Error("Update failed!");
    });
    const res = await request(app)
      .put("/api/users/1/update")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        full_name: "Bad Update",
        city: "Houston",
        state: "TX",
        skills: []
      });
    expect(res.statusCode).toBe(500);
  });

  it("PUT /api/users/:id/admin/update fails when invalid token", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: null,
      error: new Error("expired")
    });
    const res = await request(app)
      .put("/api/users/1/admin/update")
      .set("Authorization", "Bearer BAD")
      .send({ full_name: "Admin" });
    expect(res.statusCode).toBe(401);
  });
});
