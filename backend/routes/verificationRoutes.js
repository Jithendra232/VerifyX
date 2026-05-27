const express = require("express");

const router = express.Router();

const {
  verifyProduct,
} = require("../controllers/verificationController");

router.post("/", verifyProduct);

module.exports = router;