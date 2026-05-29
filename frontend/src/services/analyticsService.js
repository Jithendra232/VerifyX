import { apiFetch } from "./apiClient";

export const fetchAnalyticsSummary = (getToken) =>
  apiFetch("/analytics/summary", getToken);
