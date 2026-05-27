import { apiFetch } from "./apiClient";

export const fetchProductRisk = (productId, getToken) =>
  apiFetch(`/risk/${productId}`, getToken);

export const fetchHighRiskProducts = (getToken) =>
  apiFetch("/risk/high-risk", getToken);

export const fetchBatchRiskAnalysis = (getToken, limit = 20) =>
  apiFetch(`/risk/batch?limit=${limit}&sort=highest`, getToken);
