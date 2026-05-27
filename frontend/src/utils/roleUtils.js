export const normalizeRole = (role) =>
  typeof role === "string" ? role.trim().toLowerCase() : "";

export const hasAllowedRole = (userRole, allowedRoles = []) => {
  const normalizedUserRole = normalizeRole(userRole);
  return allowedRoles.some(
    (allowedRole) => normalizeRole(allowedRole) === normalizedUserRole
  );
};
