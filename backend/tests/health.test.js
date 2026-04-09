const request = require("supertest");
const app = require("../app");

describe("GET /health", () => {
  it("returns 200 with expected health payload", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "OK");
    expect(response.body).toHaveProperty("uptime");
    expect(response.body).toHaveProperty("timestamp");
    expect(response.body).toHaveProperty("database");
    expect(["connected", "disconnected"]).toContain(response.body.database);
  });
});
