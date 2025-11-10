const request = require("supertest");
const app = require("../src/app");
require("dotenv").config({ path: ".env.test" });

describe("States routes", () => {

  it("GET /api/states should return a JSON array of states", async () => {
    const res = await request(app).get("/api/states");

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      const state = res.body[0];
      expect(state).toHaveProperty("state_code");
      expect(state).toHaveProperty("state_name");
    }
  });

  it("GET /api/states/unknown should return 404", async () => {
    const res = await request(app).get("/api/states/unknown");
    expect(res.statusCode).toBe(404);
  });
});
