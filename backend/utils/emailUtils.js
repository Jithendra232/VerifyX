const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") {
    return null;
  }

  return email.trim().toLowerCase();
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildEmailRegex = (normalizedEmail) =>
  new RegExp(`^${escapeRegex(normalizedEmail)}$`, "i");

module.exports = {
  normalizeEmail,
  buildEmailRegex,
};
