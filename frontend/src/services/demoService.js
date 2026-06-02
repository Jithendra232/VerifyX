import { apiFetch } from "./apiClient";

export const seedDemoSupplyChain = (getToken) =>
  apiFetch("/demo/seed", getToken, { method: "POST" });

export const resetDemoSupplyChain = (getToken) =>
  apiFetch("/demo/reset", getToken, { method: "DELETE" });
