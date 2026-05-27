import { normalizeRole } from "./roleUtils";

export const ROLE_DASHBOARD_PATHS = {
  admin: "/dashboard/admin",
  manufacturer: "/dashboard/manufacturer",
  distributor: "/dashboard/distributor",
  retailer: "/dashboard/retailer",
  customer: "/dashboard/customer",
};

export const getDashboardPathForRole = (role) =>
  ROLE_DASHBOARD_PATHS[normalizeRole(role)] || "/";
