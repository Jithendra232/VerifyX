const User = require("../models/User");
const { isAdminEmail } = require("../utils/adminEmails");
const { buildEmailRegex, normalizeEmail } = require("../utils/emailUtils");
const { normalizeRole } = require("../utils/roleUtils");

const VALID_ROLES = [
  "admin",
  "manufacturer",
  "distributor",
  "retailer",
  "customer",
];

const syncUser = async (req, res) => {
  try {
    const { clerkId, name, email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!clerkId) {
      return res.status(400).json({
        success: false,
        message: "clerkId is required",
      });
    }

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "A valid email is required",
      });
    }

    const displayName = name || "User";
    const insertRole = isAdminEmail(normalizedEmail) ? "admin" : "customer";

    let user =
      (await User.findOne({ clerkId })) ||
      (await User.findOne({ email: normalizedEmail })) ||
      (await User.findOne({ email: buildEmailRegex(normalizedEmail) }));

    if (user) {
      const update = {
        clerkId,
        name: displayName || user.name,
        email: normalizedEmail,
      };

      if (isAdminEmail(normalizedEmail)) {
        update.role = "admin";
      }

      user = await User.findOneAndUpdate(
        { _id: user._id },
        { $set: update },
        { returnDocument: "after", runValidators: true }
      );
    } else {
      user = await User.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: {
            clerkId,
            name: displayName,
            email: normalizedEmail,
          },
          $setOnInsert: {
            role: insertRole,
          },
        },
        { returnDocument: "after", upsert: true, runValidators: true }
      );
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("[AuthSync] syncUser failed:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Account sync failed: duplicate account record",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Account sync failed",
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const normalizedRole = normalizeRole(role);

    if (!VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: normalizedRole },
      { returnDocument: "after", runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("[users] updateUserRole failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

module.exports = {
  syncUser,
  updateUserRole,
};
