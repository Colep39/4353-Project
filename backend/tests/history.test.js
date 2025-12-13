const request = require("supertest");
const app = require("../src/app");
const supabase = require("../src/supabaseNoAuth");

jest.mock("../src/supabaseNoAuth", () => {
  return {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  };
});

const token = "mock-token";

describe("GET /api/volunteerHistory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when no token provided", async () => {
    const res = await request(app).get("/api/volunteerHistory");
    expect(res.status).toBe(401);
  });

  

  it("returns 401 when getUser returns null user", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    });

    const res = await request(app)
      .get("/api/volunteerHistory")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  it("returns 500 when volunteer_history query errors", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 1 } },
      error: null
    });

    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: "DB FAILED" }
      })
    });

    const res = await request(app)
      .get("/api/volunteerHistory")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB FAILED");
  });

  it("returns empty array when volunteer_history is empty", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 1 } },
      error: null
    });

    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({
        data: [],
        error: null
      })
    });

    const res = await request(app)
      .get("/api/volunteerHistory")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns 500 when events table errors", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 1 } },
      error: null
    });

    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({
        data: [{ event_id: 10 }],
        error: null
      })
    });

    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: "EVENTS FAIL" }
      })
    });

    const res = await request(app)
      .get("/api/volunteerHistory")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("EVENTS FAIL");
  });

  it("returns normalized event structure", async () => {
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 1 } },
      error: null
    });

    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({
        data: [{ event_id: 123 }],
        error: null
      })
    });

    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValueOnce({
        data: [
          {
            event_id: 123,
            event_name: "Mock Event",
            event_description: "Desc",
            event_urgency: 2,
            location: "Houston",
            event_image: "/img/a.jpg",
            start_date: "2024-02-01T00:00:00.000Z",
            end_date: "2024-02-02T00:00:00.000Z",
            event_skills: [
              { skills: { skill_id: 2, description: "Zeta" } },
              { skills: { skill_id: 1, description: "Alpha" } }
            ]
          }
        ],
        error: null
      })
    });

    const res = await request(app)
      .get("/api/volunteerHistory")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);

    const item = res.body[0];
    expect(item.id).toBe(123);
    expect(item.title).toBe("Mock Event");

    expect(item.skills.map(s => s.description)).toEqual(["Alpha", "Zeta"]);

    expect(typeof item.date.start).toBe("string");
    expect(typeof item.date.end).toBe("string");
  });
});
