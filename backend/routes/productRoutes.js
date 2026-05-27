const express = require("express");

const router = express.Router();
const { createProduct } = require("../controllers/productController");

router.get("/", (req, res) => {
  res.json({
    message: "Product Route Working",
  });
});


router.post("/create", createProduct);
module.exports = router;