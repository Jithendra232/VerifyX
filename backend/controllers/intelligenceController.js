const mongoose = require("mongoose");
const { analyzeProductIntelligence } = require("../services/supplyChainIntelligenceService");

const getProductIntelligence = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const intelligence = await analyzeProductIntelligence(productId);

    return res.status(200).json({
      success: true,
      intelligence,
    });
  } catch (error) {
    console.error("getProductIntelligence error:", error);
    return res.status(error.message === "Product not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to load product intelligence",
    });
  }
};

module.exports = {
  getProductIntelligence,
};
