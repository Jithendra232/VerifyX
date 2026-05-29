const express = require("express");

const router = express.Router();

const {
  verifyProduct,
  getVerificationLogs,
} = require("../controllers/verificationController");
const protectRoute = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimitMiddleware");

router.get("/logs", protectRoute, getVerificationLogs);
router.post("/", rateLimit({ windowMs: 60 * 1000, max: 30 }), verifyProduct);

module.exports = router;
