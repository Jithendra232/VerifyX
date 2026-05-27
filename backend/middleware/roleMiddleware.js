const User = require("../models/User");
const { normalizeRole } = require("../utils/roleUtils");

const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    try {
      const user =
        req.user ||
        (await User.findOne({
          clerkId: req.userId,
        }));

      const userRole = req.userRole || normalizeRole(user?.role);
      const allowedRoles = roles.map((entry) => normalizeRole(entry));

      if (!user || !allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Access Denied",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
};

module.exports = authorizeRoles;
