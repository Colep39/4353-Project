const request = require('supertest');
const app = require('../src/app');
require('dotenv').config({ path: '.env.test' });
const jwt = require("jsonwebtoken");

const adminToken = jwt.sign(
  { sub: 1, role: "admin" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

const userToken = jwt.sign(
  { sub: 2, role: "volunteer" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

describe('Notification routes', () => {
  let tempNotificationId;

  // Create typed fake notifications for the user
  beforeEach(async () => {
    const res = await request(app)
      .post("/api/notifications")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        user_id: 2,
        title: "Temporary test notification",
        message: "Lorem ipsum test",
      });

    tempNotificationId = res.body.id;
  });

  // Clean up
  afterEach(async () => {
    await request(app)
      .delete(`/api/notifications/${tempNotificationId}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it('should return 401 when missing auth token', async () => {
    const res = await request(app).get('/api/notifications/2');
    expect(res.statusCode).toBe(401);
  });

  it('GET /api/notifications/:id should return array of notifications for that user', async () => {
    const res = await request(app)
      .get('/api/notifications/2')
      .set('Authorization', `Bearer ${userToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const note = res.body[0];
      expect(note).toHaveProperty("id");
      expect(note).toHaveProperty("title");
      expect(note).toHaveProperty("message");
      expect(note).toHaveProperty("created_at");
    }
  });

  it("GET /api/notifications/unknown should return 404", async () => {
    const res = await request(app)
      .get("/api/notifications/99999")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
  });
});
