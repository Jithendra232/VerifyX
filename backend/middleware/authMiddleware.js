const { getAuth } = require("@clerk/express");
const User = require("../models/User");
const { normalizeRole } = require("../utils/roleUtils");

/**
 * Resolves the MongoDB user from Clerk auth (or x-clerk-id header for dev).
 * Sets req.user (Mongoose doc) and req.userId (Clerk id) for downstream middleware.
 */
const protectRoute = async (req, res, next) => {
  try {
    const auth = getAuth(req);
    const clerkId =
      auth?.userId || req.headers["x-clerk-id"] || req.body?.clerkId;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Sync your account first.",
      });
    }

    req.user = user;
    req.userId = clerkId;
    req.userRole = normalizeRole(user.role);
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

module.exports = protectRoute;
