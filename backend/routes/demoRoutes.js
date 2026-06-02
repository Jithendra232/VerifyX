const express = require("express");
const protectRoute = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { seedDemo, clearDemo } = require("../controllers/demoController");

const router = express.Router();

router.post("/seed", protectRoute, authorizeRoles("admin"), seedDemo);
router.delete("/reset", protectRoute, authorizeRoles("admin"), clearDemo);

module.exports = router;
