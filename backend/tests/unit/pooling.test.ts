import { createPoolAlloc } from "../../src/core/application/pooling";

describe("createPoolAlloc", () => {
  it("distributes surplus to cover deficit", () => {
    const members = [
      { shipId: "S1", cbBefore: 50 },
      { shipId: "S2", cbBefore: -30 },
    ];

    const res = createPoolAlloc(members);

    const totalAfter = res.reduce((a, b) => a + b.cbAfter, 0);
    expect(totalAfter).toBeCloseTo(20);
  });
});
