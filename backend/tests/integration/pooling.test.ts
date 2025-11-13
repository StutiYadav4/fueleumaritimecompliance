import request from "supertest";
import app from "../../src/adapters/inbound/http/expressServer";

describe("Pooling API", () => {
  it("creates a pool successfully", async () => {
    const res = await request(app)
      .post("/pools")
      .send({
        year: 2025,
        members: [
          { shipId: "R001", cbBefore: 100 },
          { shipId: "R002", cbBefore: -50 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.members).toBeDefined();
  });
});
