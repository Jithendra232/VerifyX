const express = require("express");

const router = express.Router();

const {
  syncUser,
  updateUserRole,
} = require("../controllers/userController");

const protectRoute = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.post("/sync", syncUser);
router.put("/role", protectRoute, authorizeRoles("admin"), updateUserRole);

module.exports = router;
