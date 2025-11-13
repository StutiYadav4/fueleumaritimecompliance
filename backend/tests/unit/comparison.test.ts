import { buildComparison } from "../../src/core/application/comparison";

describe("buildComparison", () => {
  it("computes percent difference & compliance", () => {
    const baseline = { ghg_intensity: 90 };
    const route = { route_id: "R1", ghg_intensity: 100 };

    const res = buildComparison(baseline, route);

    expect(res.percentDiff).toBeGreaterThan(0);
    expect(res.compliant).toBe(false);
  });
});
