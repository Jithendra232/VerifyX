import { apiFetch } from "./apiClient";

export const fetchVerificationLogs = (getToken, params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  const query = search.toString();
  return apiFetch(`/verify/logs${query ? `?${query}` : ""}`, getToken);
};
