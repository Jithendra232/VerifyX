const Product = require("../models/Product");
const VerificationLog = require("../models/VerificationLog");
const Transfer = require("../models/Transfer");
const User = require("../models/User");
const { calculateRiskLevel, capRiskScore, uniqueReasons } = require("../utils/riskHelpers");
const { isValidObjectId } = require("../utils/objectIdUtils");

/**
 * Analyze fake scan attempts from verification logs
 * @param {Array} logs - Verification logs for the product
 * @returns {object} { score: number, reason: string|null, count: number }
 */
const analyzeFakeScans = (logs) => {
  const fakeScanCount = logs.filter(
    (log) => log.result === "FAKE"
  ).length;

  let score = 0;
  let reason = null;

  if (fakeScanCount >= 5) {
    score = 40;
    reason = "Multiple fake verification attempts detected";
  } else if (fakeScanCount >= 3) {
    score = 25;
    reason = "Multiple fake verification attempts detected";
  } else if (fakeScanCount >= 1) {
    score = 10;
    reason = "Multiple fake verification attempts detected";
  }

  return { score, reason, count: fakeScanCount };
};

/**
 * Check if product has suspicious status
 * @param {Object} product - Product document
 * @returns {object} { score: number, reason: string|null }
 */
const analyzeSuspiciousStatus = (product) => {
  if (product.verificationStatus === "suspicious") {
    return {
      score: 40,
      reason: "Product flagged as suspicious",
    };
  }
  return { score: 0, reason: null };
};

/**
 * Check for excessive scan count
 * @param {Object} product - Product document
 * @returns {object} { score: number, reason: string|null, scanCount: number }
 */
const analyzeExcessiveScans = (product) => {
  const scanCount = product.scanCount || 0;

  if (scanCount > 20) {
    return {
      score: 20,
      reason: "Abnormally high scan activity detected",
      scanCount,
    };
  }

  return { score: 0, reason: null, scanCount };
};

/**
 * Detect supply chain skipping (missing intermediate transfers)
 * @param {string} productId - Product ID
 * @returns {Promise<object>} { score: number, reason: string|null }
 */
const analyzeSupplyChainSkipping = async (productId) => {
  const transfers = await Transfer.find({
    product: productId,
    status: "COMPLETED",
  }).populate("fromUser toUser", "role");

  if (transfers.length === 0) {
    return { score: 0, reason: null };
  }

  const hasDistributor = transfers.some(
    (t) =>
      t.fromUser?.role === "distributor" ||
      t.toUser?.role === "distributor"
  );

  const hasRetailer = transfers.some(
    (t) =>
      t.fromUser?.role === "retailer" ||
      t.toUser?.role === "retailer"
  );

  const reachedCustomer = transfers.some(
    (t) => t.toUser?.role === "customer"
  );

  if (reachedCustomer && (!hasDistributor || !hasRetailer)) {
    return {
      score: 25,
      reason: "Incomplete supply chain detected",
    };
  }

  return { score: 0, reason: null };
};

/**
 * Detect ownership/lifecycle inconsistencies
 * @param {Object} product - Product document
 * @returns {Promise<object>} { score: number, reason: string|null }
 */
const analyzeOwnershipInconsistency = async (product) => {
  if (!product.currentOwner) {
    return { score: 0, reason: null };
  }

  const owner = await User.findById(product.currentOwner).select("role");

  if (!owner) {
    return { score: 0, reason: null };
  }

  const inconsistencies = [
    {
      status: "SOLD",
      expectedRole: "customer",
    },
    {
      status: "IN_RETAIL",
      expectedRole: "retailer",
    },
    {
      status: "IN_DISTRIBUTION",
      expectedRole: "distributor",
    },
  ];

  for (const { status, expectedRole } of inconsistencies) {
    if (product.status === status && owner.role !== expectedRole) {
      return {
        score: 35,
        reason: "Ownership lifecycle inconsistency detected",
      };
    }
  }

  return { score: 0, reason: null };
};

/**
 * Detect rapid repeated scans (5+ scans within 5 minutes)
 * @param {Array} logs - Verification logs for the product (sorted by createdAt ascending)
 * @returns {object} { score: number, reason: string|null, detected: boolean }
 */
const analyzeRapidScans = (logs) => {
  if (logs.length < 5) {
    return { score: 0, reason: null, detected: false };
  }

  const fiveMinutesMs = 5 * 60 * 1000;

  for (let i = 0; i <= logs.length - 5; i++) {
    const timeDiff =
      new Date(logs[i + 4].createdAt).getTime() -
      new Date(logs[i].createdAt).getTime();

    if (timeDiff <= fiveMinutesMs) {
      return {
        score: 15,
        reason: "Rapid repeated scans detected",
        detected: true,
      };
    }
  }

  return { score: 0, reason: null, detected: false };
};

/**
 * Main risk analysis function
 * Analyzes a product for counterfeit risk based on multiple signals
 * @param {string} productId - MongoDB ObjectId of the product
 * @returns {Promise<object>} Risk analysis result
 */
const analyzeProductRisk = async (productId) => {
  try {
    if (!isValidObjectId(productId)) {
      console.warn("[RiskAnalysis] Invalid productId:", productId);
      return null;
    }

    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const [logs, ownerInconsistency, supplyChainSkipping] = await Promise.all([
      VerificationLog.find({ product: productId })
        .sort({ createdAt: 1 })
        .lean(),
      analyzeOwnershipInconsistency(product),
      analyzeSupplyChainSkipping(productId),
    ]);

    const fakeScanAnalysis = analyzeFakeScans(logs);
    const suspiciousStatusAnalysis = analyzeSuspiciousStatus(product);
    const excessiveScanAnalysis = analyzeExcessiveScans(product);
    const rapidScanAnalysis = analyzeRapidScans(logs);

    let totalScore = 0;
    const reasons = [];

    totalScore += fakeScanAnalysis.score;
    if (fakeScanAnalysis.reason) reasons.push(fakeScanAnalysis.reason);

    totalScore += suspiciousStatusAnalysis.score;
    if (suspiciousStatusAnalysis.reason)
      reasons.push(suspiciousStatusAnalysis.reason);

    totalScore += excessiveScanAnalysis.score;
    if (excessiveScanAnalysis.reason)
      reasons.push(excessiveScanAnalysis.reason);

    totalScore += supplyChainSkipping.score;
    if (supplyChainSkipping.reason) reasons.push(supplyChainSkipping.reason);

    totalScore += ownerInconsistency.score;
    if (ownerInconsistency.reason) reasons.push(ownerInconsistency.reason);

    totalScore += rapidScanAnalysis.score;
    if (rapidScanAnalysis.reason) reasons.push(rapidScanAnalysis.reason);

    totalScore = capRiskScore(totalScore);
    const riskLevel = calculateRiskLevel(totalScore);
    const uniqueReasonsList = uniqueReasons(reasons);

    return {
      productId: product._id,
      productName: product.productName,
      batchNumber: product.batchNumber,
      riskScore: totalScore,
      riskLevel,
      reasons: uniqueReasonsList,
      signals: {
        fakeScans: fakeScanAnalysis.count,
        scanCount: excessiveScanAnalysis.scanCount,
        rapidScans: rapidScanAnalysis.detected,
        isSuspicious: product.verificationStatus === "suspicious",
        supplyChainSkipped: supplyChainSkipping.score > 0,
        ownershipInconsistent: ownerInconsistency.score > 0,
      },
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  analyzeProductRisk,
  analyzeFakeScans,
  analyzeSuspiciousStatus,
  analyzeExcessiveScans,
  analyzeSupplyChainSkipping,
  analyzeOwnershipInconsistency,
  analyzeRapidScans,
};
