const express = require("express");
const protectRoute = require("../middleware/authMiddleware");
const { getAnalyticsSummary } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/summary", protectRoute, getAnalyticsSummary);

module.exports = router;
