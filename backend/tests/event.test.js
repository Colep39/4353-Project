const request = require("supertest");
const app = require("../src/app");
require('dotenv').config({ path: '.env.test' });
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { sub: 1, role: "volunteer" },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

describe("Event routes", () => {
  let tempEventId;

  // Seed a temporary event so there's guaranteed data
  beforeEach(async () => {
    const res = await request(app)
      .post("/api/eventManagement")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Temp Event",
        description: "Temporary event for testing",
        location: "Houston",
        urgency: 2,
        image: "/images/events/temp.jpg",
        date: {
          start: new Date(2026, 1, 10).toISOString(),
          end: new Date(2026, 1, 11).toISOString(),
        },
        skill_ids: [1],
      });

    tempEventId = res.body.id;
  });

  // Clean up after tests
  afterEach(async () => {
    if (tempEventId) {
      await request(app)
        .delete(`/api/eventManagement/${tempEventId}`)
        .set("Authorization", `Bearer ${token}`);
    }
  });

  it("should return 401 with no authorization token", async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toBe(401);
  });

  it("GET /api/events should return a list of events", async () => {
    const res = await request(app)
      .get('/api/events')
      .set("Authorization", `Bearer ${token}`);

    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const event = res.body[0];
      expect(event).toHaveProperty("id");
      expect(event).toHaveProperty("title");
      expect(event).toHaveProperty("date");
      expect(event.date).toHaveProperty("start");
      expect(event.date).toHaveProperty("end");
      expect(event).toHaveProperty("urgency");
      expect(event).toHaveProperty("description");
      expect(event).toHaveProperty("image");
    }
  });

  it("GET /api/events/:id should return event details", async () => {
    const res = await request(app)
      .get(`/api/events/${tempEventId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("title");
  });

  it("GET /api/events/unknown should return 404", async () => {
    const res = await request(app)
      .get('/api/events/unknown')
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("GET /api/events/999999 should return 404 for unknown event id", async () => {
    const res = await request(app)
      .get('/api/events/999999')
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});
