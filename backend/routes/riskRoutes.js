const express = require("express");
const router = express.Router();
const {
  getProductRisk,
  getBatchRiskAnalysis,
  getHighRiskProducts,
} = require("../controllers/riskController");

const authMiddleware = require("../middleware/authMiddleware");

// Static routes MUST come before /:productId
router.get("/batch", authMiddleware, getBatchRiskAnalysis);
router.get("/high-risk", authMiddleware, getHighRiskProducts);
router.get("/:productId", authMiddleware, getProductRisk);

module.exports = router;
