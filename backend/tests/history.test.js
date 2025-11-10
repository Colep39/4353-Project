const request = require("supertest");
const app = require("../src/app");
require('dotenv').config({ path: '.env.test' });
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { sub: 2, role: "volunteer" },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe("Volunteer History routes", () => {
  let tempEventId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/eventManagement")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Temp Vol History",
        description: "Volunteered test event",
        location: "Houston",
        urgency: 1,
        image: "/images/events/temp.jpg",
        date: {
          start: new Date(2025, 5, 1).toISOString(),
          end: new Date(2025, 5, 2).toISOString(),
        },
        skill_ids: [1],
      });

    tempEventId = res.body.id;
  });

  afterEach(async () => {
    if (tempEventId) {
      await request(app)
        .delete(`/api/eventManagement/${tempEventId}`)
        .set("Authorization", `Bearer ${token}`);
    }
  });

  it("should return 401 when missing token", async () => {
    const res = await request(app).get('/api/volunteerHistory');
    expect(res.statusCode).toBe(401);
  });

  it("GET /api/volunteerHistory/:badId returns 404", async () => {
    const res = await request(app)
      .get('/api/volunteerHistory/9999')
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("GET /api/volunteerHistory returns array of volunteer history", async () => {
    const res = await request(app)
      .get('/api/volunteerHistory')
      .set("Authorization", `Bearer ${token}`);

    expect(res.headers['content-type']).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body.every(x =>
        x.hasOwnProperty('id') &&
        x.hasOwnProperty('title') &&
        x.hasOwnProperty('date') &&
        x.hasOwnProperty('urgency') &&
        x.hasOwnProperty('description') &&
        x.hasOwnProperty('image')
      )).toBe(true);
    }
  });
});
