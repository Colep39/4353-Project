require('dotenv').config({ path: ".env.test" });

const mockLimit = jest.fn().mockResolvedValue({
  data: [{
    id: 123,
    user_id: 2,
    title: "Temporary test notification",
    message: "Lorem ipsum test",
    created_at: "2024-01-01T00:00:00Z"
  }],
  error: null
});

const mockTable = {
  select: jest.fn(() => mockTable),
  eq: jest.fn(() => mockTable),
  order: jest.fn(() => mockTable),
  limit: mockLimit,
};

jest.mock("../src/supabaseNoAuth", () => ({
  auth: {
    getUser: jest.fn(token =>
      Promise.resolve({
        data: { user: { id: token.includes("volunteer") ? 2 : 1 } },
        error: null
      })
    )
  },
  from: jest.fn(() => mockTable)
}));


// after mocking, NOW require app
const request = require("supertest");
const app = require("../src/app");
const jwt = require("jsonwebtoken");

// --- TOKENS ---
const adminToken = jwt.sign({ sub: 1, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });
const userToken = jwt.sign({ sub: 2, role: "volunteer" }, process.env.JWT_SECRET, { expiresIn: "1h" });

describe("Notification routes", () => {

  it("should return 401 when missing auth token", async () => {
    const res = await request(app).get("/api/notifications/2");
    expect(res.statusCode).toBe(401);
  });

  it("GET /api/notifications/:id should return user notifications", async () => {
    const res = await request(app)
      .get("/api/notifications/2")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("title");
    expect(res.body[0]).toHaveProperty("message");
    expect(res.body[0]).toHaveProperty("created_at");
  });

  it("GET /api/notifications/unknown should return 404", async () => {
    // make mock return empty
    const supabaseMock = require("../src/supabaseNoAuth");
    supabaseMock.from().limit.mockResolvedValueOnce({
      data: [],
      error: null
    });

    const res = await request(app)
      .get("/api/notifications/99999")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });

});
