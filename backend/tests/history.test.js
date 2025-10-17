const request = require("supertest");
const app = require("../src/app");
require('dotenv').config({ path: '.env.test' });

describe("Volunteer History routes", () =>{
    it("GET /api/volunteerHistory should return 404 for unknown path", async () => {
        const res = await request(app).get('/api/volunteerHistory/unknown');
        expect(res.statusCode).toBe(404);
    })
})