export type Route = {
  id: number;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumptionT: number;
  distanceKm: number;
  totalEmissionsT: number;
  isBaseline?: boolean;
};
