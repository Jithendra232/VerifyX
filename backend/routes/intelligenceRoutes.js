const express = require("express");
const protectRoute = require("../middleware/authMiddleware");
const { getProductIntelligence } = require("../controllers/intelligenceController");

const router = express.Router();

router.get("/product/:productId", protectRoute, getProductIntelligence);

module.exports = router;
