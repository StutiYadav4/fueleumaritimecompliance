import { TARGET_INTENSITY, MJ_PER_TON } from '../../shared/constants';


/**
* Compute Compliance Balance in tonnes CO2e
* CB = (target - actual) * energyMJ
* where energyMJ = fuelT * MJ_PER_TON
* return value in tonnes CO2e (divide g->kg->t as needed)
*/
export function computeCB(target: number, actual: number, fuelT: number) {
const energyMJ = fuelT * MJ_PER_TON;
// (gCO2e/MJ) * MJ = gCO2e -> convert to tonnes (1e6 g = 1 t)
const cb_g = (target - actual) * energyMJ; // gCO2e
const cb_t = cb_g / 1_000_000; // tonnes CO2e
return { cb_g, cb_t };
}


export function computeCBForRoute(route: { ghgIntensity: number; fuelConsumptionT: number }) {
return computeCB(TARGET_INTENSITY, route.ghgIntensity, route.fuelConsumptionT);
}