const supabase = require("../src/supabaseNoAuth");
const jwt = require("jsonwebtoken");

jest.mock("../src/supabaseNoAuth", () => {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 2 } },
        error: null
      })
    },

    from: jest.fn((table) => {
      if (table === "volunteer_history") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: [{ event_id: 123 }],
            error: null
          })
        };
      }

      if (table === "events") {
        return {
          select: jest.fn().mockReturnThis(),
          lt: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: [
              {
                event_id: 123,
                event_name: "Mock Event",
                event_description: "Mock Desc",
                event_urgency: 1,
                location: "Houston",
                event_image: "/img/mock.jpg",
                start_date: new Date(2024, 1, 1).toISOString(),
                end_date: new Date(2024, 1, 2).toISOString(),
                event_skills: [
                  { skills: { skill_id: 1, description: "Mock Skill" } }
                ]
              }
            ],
            error: null
          })
        };
      }

      return {};
    })
  };
});


const request = require("supertest");
const app = require("../src/app");
require("dotenv").config({ path: ".env.test" });

const token = "mock-token"; 

describe("Volunteer History routes", () => {
  let tempEventId;

  afterEach(async () => {
    if (tempEventId) {
      await request(app)
        .delete(`/api/eventManagement/${tempEventId}`)
        .set("Authorization", `Bearer ${token}`);
    }
  });

  it("should return 401 when missing token", async () => {
    const res = await request(app).get("/api/volunteerHistory");
    expect(res.statusCode).toBe(401);
  });

  it("GET /api/volunteerHistory/:badId returns 404", async () => {
    const res = await request(app)
      .get("/api/volunteerHistory/9999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("Should return 500 when Supabase returns error on volunteer history", async () => {
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: "DB error" }
      })
    })

    const res = await request(app)
      .get("/api/volunteerHistory")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("DB error");
  });

  it("GET /api/volunteerHistory returns array of volunteer history", async () => {
    const res = await request(app)
      .get("/api/volunteerHistory")
      .set("Authorization", `Bearer ${token}`);

    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(
        res.body.every(
          (x) =>
            x.hasOwnProperty("id") &&
            x.hasOwnProperty("title") &&
            x.hasOwnProperty("date") &&
            x.hasOwnProperty("urgency") &&
            x.hasOwnProperty("description") &&
            x.hasOwnProperty("image")
        )
      ).toBe(true);
    }
  });
});