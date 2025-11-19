require("dotenv").config({ path: ".env.test" });
const jwt = require("jsonwebtoken");

const mockFrom = jest.fn();
const mockInsert = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockMaybeSingle = jest.fn();
const mockGte = jest.fn();

jest.mock("../src/supabaseNoAuth", () => ({
  from: mockFrom,
}));

beforeEach(() => {
  jest.clearAllMocks();

  mockFrom.mockImplementation((table) => {
    switch (table) {
      case "events": {
        const obj = {
          select: jest.fn().mockReturnThis(),
          gte: jest.fn().mockResolvedValue({
            data: [
              {
                event_id: 1,
                event_name: "Mock Event",
                event_description: "Temporary mock event",
                location: "Houston",
                event_urgency: 2,
                event_image: "/images/events/temp.jpg",
                start_date: new Date().toISOString(),
                end_date: new Date(Date.now() + 86400000).toISOString(),
                event_skills: [
                  { skill_id: 1, skills: { description: "Mock Skill" } },
                ],
              },
            ],
            error: null,
          }),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          single: jest.fn().mockReturnThis(),
        };

        return obj;
      }

      case "volunteer_history": {
        const vh = {
          select: jest.fn().mockReturnThis(),

          eq: jest.fn(() => ({
            data: [],
            error: null,
            eq: jest.fn().mockReturnThis(),
            maybeSingle: mockMaybeSingle,
          })),

          maybeSingle: mockMaybeSingle,

          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() =>
                Promise.resolve({
                  data: { volunteer_history_id: 999, user_id: 1, event_id: 1 },
                  error: null,
                })
              ),
            })),
          })),

          delete: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() =>
                Promise.resolve({
                  error: null,
                })
              ),
            })),
          })),
        };

        return vh;
      }

      case "recommended_events":
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        };

      default:
        return {
          select: jest.fn().mockReturnThis(),
          gte: mockGte.mockResolvedValue({ data: [], error: null }),
          eq: mockEq.mockResolvedValue({ data: [], error: null }),
          insert: mockInsert.mockReturnThis(),
          delete: mockDelete.mockResolvedValue({ data: null, error: null }),
          maybeSingle: mockMaybeSingle.mockResolvedValue({ data: null, error: null }),
        };
    }
  });
});

const request = require("supertest");
const app = require("../src/app");

const token = jwt.sign({ id: 1, role: "volunteer" }, process.env.JWT_SECRET, {
  expiresIn: "1h",
});

describe("Volunteer Events routes", () => {
  it("GET /api/events should return a list of normalized events", async () => {
    const res = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({
      id: expect.any(Number),
      title: expect.any(String),
      description: expect.any(String),
      location: expect.any(String),
      urgency: expect.any(Number),
      image: expect.any(String),
    });
  });

  it("POST /api/events/join without event_id should return 400", async () => {
    const res = await request(app)
      .post("/api/events/join")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("DELETE /api/events/leave without event_id should return 400", async () => {
    const res = await request(app)
      .delete("/api/events/leave")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("POST /api/events/join with valid event_id should return 201", async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    mockInsert.mockResolvedValueOnce({
      data: { volunteer_history_id: 999 },
      error: null,
    });

    const res = await request(app)
      .post("/api/events/join")
      .set("Authorization", `Bearer ${token}`)
      .send({ event_id: 1 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Joined event successfully");
    expect(res.body.data).toHaveProperty("volunteer_history_id", 999);
  });

  it("DELETE /api/events/leave with valid event_id should return 200", async () => {
    mockDelete.mockResolvedValueOnce({ error: null });

    const res = await request(app)
      .delete("/api/events/leave")
      .set("Authorization", `Bearer ${token}`) 
      .send({ event_id: 1 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Left event successfully");
  });
});
