export type Route = {
    id: number;
    routeId: string;
    vesselType: string;
    fuelType: string;
    year: number;
    ghgIntensity: number; // gCO2e/MJ
    fuelConsumptionT: number; // t
    distanceKm: number;
    totalEmissionsT: number;
    isBaseline?: boolean;
};


export type CBRecord = {
    shipId: string;
    year: number;
    cb_gco2eq: number; // in gCO2e
};
