require("dotenv").config({ path: ".env.test" });

const mockLimit = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

const mockTable = {
  select: mockSelect.mockReturnThis(),
  eq: mockEq.mockReturnThis(),
  single: mockSingle,
  update: jest.fn(() => mockTable),
  delete: jest.fn(() => mockTable),
  insert: jest.fn(() => mockTable),
  or: jest.fn(() => mockTable),
  in: jest.fn(() => mockTable),
};

jest.mock("../src/supabaseNoAuth", () => ({
  auth: {
    getUser: jest.fn(() =>
      Promise.resolve({
        data: { user: { id: 1 } }, // always using admin for tests
        error: null
      })
    )
  },

  from: jest.fn(() => mockTable)
}));

const request = require("supertest");
const app = require("../src/app");
const jwt = require("jsonwebtoken");

const adminToken = jwt.sign(
  { sub: 1, role: "admin" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

describe("User routes", () => {

  beforeEach(() => {
    mockSingle.mockReset();
    mockSelect.mockReset();
    mockEq.mockReset();

    mockSelect.mockReturnThis();
    mockEq.mockReturnThis();
  });

  it("GET /api/users/:id should return user data for profile", async () => {

    mockSingle.mockResolvedValueOnce({
      data: {
        id: 1,
        email: "test@test.com",
        full_name: "Cole Harden",
        city: "Houston"
      },
      error: null
    });

    const res = await request(app)
      .get("/api/users/1")
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.id).toBe(1);
    expect(res.body).toHaveProperty("email");
  });

  it("PUT /api/users/:id/update should update user data", async () => {
    const updatedData = {
      full_name: "Cole Hawke",
      email: "colep3@icloud.com",
      city: "Antarctica City",
      state: "Wakanda",
      skills: []
    };

    mockSingle.mockResolvedValueOnce({
      data: { state_id: 1 },
      error: null
    });

    const res = await request(app)
      .put("/api/users/1/update")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updatedData)
      .expect(200);

    expect(res.body).toHaveProperty("message", "Profile updated successfully");
  });

  it("GET /api/users/:id should return 404 for non-existing user", async () => {

    mockSingle.mockResolvedValueOnce({
      data: null,
      error: null
    });

    const res = await request(app)
      .get("/api/users/9999")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "User Profile was not found");
  });

});
