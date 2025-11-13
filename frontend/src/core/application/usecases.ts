/**
 * Small use-case wrappers (keeps UI decoupled from raw API)
 * For now they delegate to adapters/infrastructure/apiClient via hooks.
 */

import { api } from "../../adapters/infrastructure/apiClient";
import { Route } from "../domain/types";

export async function fetchRoutes(): Promise<Route[]> {
  const res = await api.get<Route[]>("/routes");
  return res.data;
}

export async function setRouteBaseline(id: number): Promise<void> {
  await api.post(`/routes/${id}/baseline`);
}

export async function fetchComparison() {
  const res = await api.get("/routes/comparison");
  return res.data;
}

export async function fetchCB(year?: number, shipId?: string) {
  const qs = new URLSearchParams();
  if (shipId) qs.set("shipId", shipId);
  if (year) qs.set("year", String(year));
  const res = await api.get(`/compliance/cb?${qs.toString()}`);
  return res.data;
}

export async function createPool(payload: { year?: number; members: { shipId: string; cbBefore: number }[] }) {
  const res = await api.post("/pools", payload);
  return res.data;
}
