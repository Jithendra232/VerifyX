const express = require("express");
const protectRoute = require("../middleware/authMiddleware");
const {
  transferProduct,
  getTransferHistory,
} = require("../controllers/transferController");

const router = express.Router();

router.post("/", protectRoute, transferProduct);
router.get("/:productId", protectRoute, getTransferHistory);

module.exports = router;
