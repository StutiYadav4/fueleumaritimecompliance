import request from "supertest";
import app from "../../src/adapters/inbound/http/expressServer";

describe("GET /routes", () => {
  it("returns list of routes", async () => {
    const res = await request(app).get("/routes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
