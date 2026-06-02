import { apiFetch } from "./apiClient";

export const fetchProductIntelligence = (productId, getToken) =>
  apiFetch(`/intelligence/product/${productId}`, getToken);
