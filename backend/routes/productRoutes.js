const express = require("express");
const multer = require("multer");

const router = express.Router();
const {
  createProduct,
  getProductJourney,
  uploadProductImage,
} = require("../controllers/productController");
const protectRoute = require("../middleware/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

router.get("/", (req, res) => {
  res.json({
    message: "Product Route Working",
  });
});


router.get("/:productId/journey", protectRoute, getProductJourney);
router.post("/upload-image", protectRoute, upload.single("image"), uploadProductImage);
router.post("/create", createProduct);
module.exports = router;
