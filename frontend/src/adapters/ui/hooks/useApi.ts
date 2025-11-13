import { api } from "../../infrastructure/apiClient";

// ---------------- ROUTES ----------------

export async function fetchRoutes() {
  return (await api.get("/routes")).data;
}

export async function setBaseline(id: number) {
  return (await api.post(`/routes/${id}/baseline`)).data;
}

// ---------------- COMPARISON ----------------

export async function fetchComparison() {
  return (await api.get("/routes/comparison")).data;
}

// ---------------- COMPLIANCE BALANCE (CB) ----------------

export async function fetchCB(year: number, shipId: string) {
  return (await api.get(`/compliance/cb?year=${year}&shipId=${shipId}`)).data;
}

// ---------------- BANKING ----------------

export async function fetchBankRecords(shipId: string, year: number) {
  return (await api.get(`/banking/records?shipId=${shipId}&year=${year}`)).data;
}

export async function bankSurplus(shipId: string, year: number) {
  return (await api.post(`/banking/bank`, { shipId, year })).data;
}

// ADD THIS — missing in your file
export async function applyBankSurplus(shipId: string, year: number) {
  return (await api.post(`/banking/apply`, { shipId, year })).data;
}

// ---------------- POOLING ----------------

export async function createPool(year: number, members: any[]) {
  return (await api.post(`/pools`, { year, members })).data;
}

export async function fetchAdjustedCB(year: number, shipId: string) {
  return (await api.get(`/compliance/adjusted-cb?year=${year}&shipId=${shipId}`)).data;
}

