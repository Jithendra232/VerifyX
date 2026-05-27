import { apiFetchWithToken } from "./apiClient";
import { normalizeRole } from "../utils/roleUtils";

export const fetchDashboardByRole = (role, token) =>
  apiFetchWithToken(`/dashboard/${normalizeRole(role)}`, token);
