import { getDashboardPathForRole } from "./rolePaths";

export const logAuthDebug = (label, payload) => {
  if (!import.meta.env.DEV) {
    return;
  }

  console.log(`[AuthDebug] ${label}`, payload);
};

export const getAuthRedirectTarget = (mongoUser) => {
  if (!mongoUser?.role) {
    return null;
  }

  const path = getDashboardPathForRole(mongoUser.role);
  return path === "/" ? null : path;
};
