import { apiFetch } from "./apiClient";

export const fetchTransferRecipients = (getToken) =>
  apiFetch("/transfers/recipients", getToken);

export const fetchEligibleTransferProducts = (getToken) =>
  apiFetch("/transfers/eligible-products", getToken);

export const fetchTransfers = (getToken, scope = "incoming", status = "ALL") => {
  const params = new URLSearchParams({ scope, status });
  return apiFetch(`/transfers?${params.toString()}`, getToken);
};

export const createTransferRequest = (getToken, payload) =>
  apiFetch("/transfers", getToken, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const acceptTransferRequest = (getToken, transferId, payload = {}) =>
  apiFetch(`/transfers/${transferId}/accept`, getToken, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const rejectTransferRequest = (getToken, transferId, reason = "") =>
  apiFetch(`/transfers/${transferId}/reject`, getToken, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
