const { analyzeProductRisk } = require("../services/riskAnalysisService");
const Product = require("../models/Product");
const { isValidObjectId } = require("../utils/objectIdUtils");

/**
 * GET /api/risk/:productId
 * Analyze counterfeit risk for a specific product
 */
const getProductRisk = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "A valid product ID is required",
      });
    }

    const riskAnalysis = await analyzeProductRisk(productId);

    if (!riskAnalysis) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      ...riskAnalysis,
    });
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Risk analysis error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to analyze product risk",
      error: error.message,
    });
  }
};

/**
 * GET /api/risk/batch
 * Analyze risk for multiple products (admin use)
 * Query params: ?limit=20&sort=highest
 */
const getBatchRiskAnalysis = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const sort = req.query.sort || "highest";

    const products = await Product.find()
      .select("_id productName batchNumber verificationStatus scanCount status currentOwner")
      .limit(limit)
      .lean();

    const riskAnalyses = await Promise.all(
      products.map(async (product) => {
        try {
          const analysis = await analyzeProductRisk(product._id);
          return analysis;
        } catch (error) {
          console.error(`Failed to analyze product ${product._id}:`, error.message);
          return null;
        }
      })
    );

    const validAnalyses = riskAnalyses.filter((r) => r !== null);

    if (sort === "highest") {
      validAnalyses.sort((a, b) => b.riskScore - a.riskScore);
    }

    return res.status(200).json({
      success: true,
      count: validAnalyses.length,
      products: validAnalyses,
    });
  } catch (error) {
    console.error("Batch risk analysis error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to perform batch risk analysis",
      error: error.message,
    });
  }
};

/**
 * GET /api/risk/high-risk
 * Get products with HIGH or CRITICAL risk levels
 */
const getHighRiskProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();

    const riskAnalyses = await Promise.all(
      products.map(async (product) => {
        try {
          const analysis = await analyzeProductRisk(product._id);
          return analysis;
        } catch (error) {
          return null;
        }
      })
    );

    const highRiskProducts = riskAnalyses
      .filter((r) => r !== null && (r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL"))
      .sort((a, b) => b.riskScore - a.riskScore);

    return res.status(200).json({
      success: true,
      count: highRiskProducts.length,
      products: highRiskProducts,
    });
  } catch (error) {
    console.error("High risk products error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve high risk products",
      error: error.message,
    });
  }
};

module.exports = {
  getProductRisk,
  getBatchRiskAnalysis,
  getHighRiskProducts,
};
