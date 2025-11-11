const request = require("supertest");
const app = require("../src/app");
require("dotenv").config({ path: ".env.test" });
const jwt = require("jsonwebtoken");
const path = require("path");

const adminToken = jwt.sign(
  { sub: 1, role: "admin" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

const volunteerToken = jwt.sign(
  { sub: 2, role: "volunteer" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

describe("Event management routes", () => {
  let tempEventId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/eventManagement")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Temp Event",
        description: "Temporary event for testing",
        location: "Austin",
        urgency: 3,
        image: "/images/events/temp.jpg",
        date: {
          start: new Date(2025, 10, 10).toISOString(),
          end: new Date(2025, 10, 11).toISOString(),
        },
      });
    tempEventId = res.body.id;
  });

  afterEach(async () => {
    await request(app)
      .delete(`/api/eventManagement/${tempEventId}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  // ===== Existing CRUD Tests =====
  it("GET /api/eventManagement should return a JSON array of events", async () => {
    const res = await request(app)
      .get("/api/eventManagement")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const event = res.body[0];
      expect(event).toHaveProperty("id");
      expect(event).toHaveProperty("title");
      expect(event).toHaveProperty("urgency");
      expect(event).toHaveProperty("description");
      expect(event).toHaveProperty("image");
      expect(event).toHaveProperty("date");
      expect(event.date).toHaveProperty("start");
      expect(event.date).toHaveProperty("end");
    }
  });

  it("GET /api/eventManagement should reject non-admin users", async () => {
    const res = await request(app)
      .get("/api/eventManagement")
      .set("Authorization", `Bearer ${volunteerToken}`);
    expect([401, 403]).toContain(res.statusCode);
  });

  it("GET /api/eventManagement/unknown should return 404", async () => {
    const res = await request(app)
      .get("/api/eventManagement/unknown")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it("GET /api/eventManagement/recommendedVolunteers should return a JSON array", async () => {
    const res = await request(app)
      .get(`/api/eventManagement/recommendedVolunteers?event_id=${tempEventId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const volunteer = res.body[0];
      expect(volunteer).toHaveProperty("name");
      expect(volunteer).toHaveProperty("email");
      expect(volunteer).toHaveProperty("location");
    }
  });

  it("GET /api/eventManagement/recommendedVolunteers/unknown should return 404", async () => {
    const res = await request(app)
      .get("/api/eventManagement/recommendedVolunteers/unknown")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it("POST /api/eventManagement should return 400 for missing fields", async () => {
    const res = await request(app)
      .post("/api/eventManagement")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Missing Urgency",
        date: { start: new Date(2025, 10, 10), end: new Date(2025, 10, 11) },
        description: "Missing urgency field",
        image: "/images/events/temp.jpg",
      });
    expect(res.statusCode).toBe(400);
  });

  it("POST /api/eventManagement should return 400 for invalid urgency", async () => {
    const res = await request(app)
      .post("/api/eventManagement")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Invalid Urgency",
        date: { start: new Date(2025, 10, 10), end: new Date(2025, 10, 11) },
        urgency: 10,
        description: "Urgency > 4",
        image: "/images/events/temp.jpg",
      });
    expect(res.statusCode).toBe(400);
  });

  it("POST /api/eventManagement should return 400 for invalid dates", async () => {
    const res = await request(app)
      .post("/api/eventManagement")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "End Before Start",
        date: { start: new Date(2025, 10, 11), end: new Date(2025, 10, 10) },
        urgency: 2,
        description: "End date before start",
        image: "/images/events/temp.jpg",
      });
    expect(res.statusCode).toBe(400);
  });

  it("POST /api/eventManagement should create event for valid data", async () => {
    const res = await request(app)
      .post("/api/eventManagement")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Valid Event",
        description: "A proper event",
        location: "Houston",
        urgency: 3,
        image: "/images/events/temp.jpg",
        date: { start: new Date(2025, 11, 1).toISOString(), end: new Date(2025, 11, 2).toISOString() },
        skill_ids: [1, 2],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Valid Event");

    await request(app)
      .delete(`/api/eventManagement/${res.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`);
  });

  it("PUT /api/eventManagement/:id should return 404 for unknown event", async () => {
    const res = await request(app)
      .put("/api/eventManagement/999999")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Update",
        date: { start: new Date(2025, 11, 1), end: new Date(2025, 11, 2) },
        urgency: 2,
        description: "Update unknown",
        image: "/images/events/temp.jpg",
      });
    expect(res.statusCode).toBe(404);
  });

  it("PUT /api/eventManagement/:id should update existing event", async () => {
    const res = await request(app)
      .put(`/api/eventManagement/${tempEventId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Updated Event",
        description: "Updated description",
        location: "Dallas",
        urgency: 2,
        image: "/images/events/temp.jpg",
        date: { start: new Date(2025, 11, 1).toISOString(), end: new Date(2025, 11, 2).toISOString() },
        skill_ids: [1],
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated Event");
    expect(res.body).toHaveProperty("id", tempEventId);
  });

  it("DELETE /api/eventManagement/:id should return 200 with ID", async () => {
    const createRes = await request(app)
      .post("/api/eventManagement")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "To Delete",
        description: "Will be deleted",
        location: "Austin",
        urgency: 1,
        image: "/images/events/temp.jpg",
        date: { start: new Date(2025, 11, 1).toISOString(), end: new Date(2025, 11, 2).toISOString() },
        skill_ids: [1, 2],
      });

    const idToDelete = createRes.body?.id;

    if (!idToDelete) throw new Error("POST /api/eventManagement did not return a valid id");

    const deleteRes = await request(app)
      .delete(`/api/eventManagement/${idToDelete}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty("id", idToDelete);
  });

  it("DELETE /api/eventManagement/:id should return 404 for unknown event", async () => {
    const res = await request(app)
      .delete("/api/eventManagement/999999")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Event not found");
  });

const path = require("path");

// Additional Event management routes
describe("Additional Event management routes", () => {
  it("GET /api/eventManagement/skills should return a JSON array of skills", async () => {
    const res = await request(app)
      .get("/api/eventManagement/skills")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const skill = res.body[0];
      expect(skill).toHaveProperty("id");
      // API returns "description" not "name"
      expect(skill).toHaveProperty("description");
    }
  });

  it("GET /api/eventManagement/skills should reject non-admin users", async () => {
    const res = await request(app)
      .get("/api/eventManagement/skills")
      .set("Authorization", `Bearer ${volunteerToken}`);

    expect([401, 403]).toContain(res.statusCode);
  });

  it("POST /api/eventManagement/upload should accept an image file", async () => {
    const res = await request(app)
      .post("/api/eventManagement/upload")
      .set("Authorization", `Bearer ${adminToken}`)
      .attach("image", path.join(__dirname, "fixtures/test-image.jpg")); // ⚡ use "image" here

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("url"); // matches your uploadEventImage
  });

  it("POST /api/eventManagement/upload should reject non-admin users", async () => {
    const res = await request(app)
      .post("/api/eventManagement/upload")
      .set("Authorization", `Bearer ${volunteerToken}`)
      .attach("image", path.join(__dirname, "fixtures/test-image.jpg")); // ⚡ same fix

    expect([401, 403]).toContain(res.statusCode);
  });

  it("POST /api/eventManagement/upload should return 400 if no file is sent", async () => {
    const res = await request(app)
      .post("/api/eventManagement/upload")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
  });

  it("POST /api/eventManagement/recommendedVolunteers should save recommended volunteers", async () => {
    const res = await request(app)
      .post("/api/eventManagement/recommendedVolunteers")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ event_id: tempEventId, user_ids: ["05473813-371d-41f6-a5a8-b1a0205f5b13"] });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("POST /api/eventManagement/recommendedVolunteers should reject non-admin users", async () => {
    const res = await request(app)
      .post("/api/eventManagement/recommendedVolunteers")
      .set("Authorization", `Bearer ${volunteerToken}`)
      .send({ event_id: tempEventId, user_ids: ["05473813-371d-41f6-a5a8-b1a0205f5b13"] });

    expect([401, 403]).toContain(res.statusCode);
  });
});
});
