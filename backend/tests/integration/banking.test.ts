import request from "supertest";
import app from "../../src/adapters/inbound/http/expressServer";

describe("Banking API", () => {
  it("banks surplus if available", async () => {
    const res = await request(app)
      .post("/banking/bank")
      .send({ shipId: "R001", year: 2024, amountT: 1 });

    expect(res.status).toBe(201);
  });
});
