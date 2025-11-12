const request = require("supertest");
const app = require("../src/app");
require("dotenv").config({ path: ".env.test" });

describe("Skills routes", () => {
  let tempSkillId;

  // Seed a temporary skill
  beforeEach(async () => {
    const res = await request(app)
      .post("/api/skills") // Only if you have a POST route, otherwise skip
      .send({
        name: `Test Skill ${Date.now()}`,
      });

    // If POST /skills doesn't exist, comment out the seeding portion.
    if (res.body?.id) tempSkillId = res.body.id;
  });

  // Cleanup
  afterEach(async () => {
    if (tempSkillId) {
      await request(app).delete(`/api/skills/${tempSkillId}`);
    }
  });

  it("GET /api/skills should return a JSON array of skills", async () => {
    const res = await request(app).get("/api/skills");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const skill = res.body[0];
      expect(skill).toHaveProperty("id");
      expect(skill).toHaveProperty("name");
    }
  });

  it("GET /api/skills/unknown should return 404 for invalid route", async () => {
    const res = await request(app).get("/api/skills/unknown");
    expect(res.statusCode).toBe(404);
  });
});
