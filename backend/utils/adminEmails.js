const { normalizeEmail } = require("./emailUtils");

const getAdminEmails = () => {
  const raw = process.env.ADMIN_EMAILS || "";

  return raw
    .split(",")
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);
};

const isAdminEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return false;
  }

  return getAdminEmails().includes(normalizedEmail);
};

module.exports = {
  getAdminEmails,
  isAdminEmail,
};
