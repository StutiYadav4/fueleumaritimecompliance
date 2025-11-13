import { Route } from '../domain/entities';


export function percentDiff(baseline: number, comparison: number) {
return ((comparison / baseline) - 1) * 100;
}


export function buildComparison(baseline: Route, other: Route) {
const pd = percentDiff(baseline.ghgIntensity, other.ghgIntensity);
return {
routeId: other.routeId,
baseline: baseline.ghgIntensity,
comparison: other.ghgIntensity,
percentDiff: pd,
compliant: other.ghgIntensity <= 89.3368
};
}