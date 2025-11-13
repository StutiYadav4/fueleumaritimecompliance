import { Route } from "../domain/types";

export interface IRoutesPort {
  getAllRoutes(): Promise<Route[]>;
  setBaseline(routeId: number): Promise<void>;
}
