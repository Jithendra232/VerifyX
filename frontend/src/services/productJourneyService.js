import { apiFetch } from "./apiClient";

export const fetchProductJourney = (productId, getToken) =>
  apiFetch(`/products/${productId}/journey`, getToken);
