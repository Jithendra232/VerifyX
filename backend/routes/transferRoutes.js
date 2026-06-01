const express = require("express");
const protectRoute = require("../middleware/authMiddleware");
const {
  transferProduct,
  getTransferHistory,
  listTransfers,
  getEligibleProducts,
  getTransferRecipients,
  acceptTransfer,
  rejectTransfer,
} = require("../controllers/transferController");

const router = express.Router();

router.post("/", protectRoute, transferProduct);
router.get("/", protectRoute, listTransfers);
router.get("/eligible-products", protectRoute, getEligibleProducts);
router.get("/recipients", protectRoute, getTransferRecipients);
router.patch("/:transferId/accept", protectRoute, acceptTransfer);
router.patch("/:transferId/reject", protectRoute, rejectTransfer);
router.get("/:productId", protectRoute, getTransferHistory);

module.exports = router;
