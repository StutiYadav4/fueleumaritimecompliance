import { computeCBForRoute } from "../../src/core/application/computeCB";

describe("computeCBForRoute", () => {
  it("computes surplus correctly", () => {
    const route = {
      ghg_intensity: 85, // lower than target → surplus
      fuel_consumption_t: 100,
    };

    const result = computeCBForRoute(route);

    expect(result.cb_t).toBeGreaterThan(0);
  });

  it("computes deficit correctly", () => {
    const route = {
      ghg_intensity: 100, // higher than target → deficit
      fuel_consumption_t: 100,
    };

    const result = computeCBForRoute(route);

    expect(result.cb_t).toBeLessThan(0);
  });
});
