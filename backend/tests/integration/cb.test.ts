import request from "supertest";
import app from "../../src/adapters/inbound/http/expressServer";

describe("GET /compliance/cb", () => {
  it("computes CB for existing route", async () => {
    const res = await request(app).get("/compliance/cb?shipId=R001&year=2024");

    expect(res.status).toBe(200);
    expect(res.body.cb_before).not.toBeUndefined();
  });
});
