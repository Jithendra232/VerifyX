import { apiFetch } from "./apiClient";
import { normalizeRole } from "../utils/roleUtils";

export const fetchDashboardByRole = (role, getToken) =>
  apiFetch(`/dashboard/${normalizeRole(role)}`, getToken);
