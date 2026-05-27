const normalizeRole = (role) =>
  typeof role === "string" ? role.trim().toLowerCase() : "";

module.exports = {
  normalizeRole,
};
