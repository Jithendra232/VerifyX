const Product = require("../models/Product");
const VerificationLog = require("../models/VerificationLog");
const {
  parseProductIdFromRequest,
  serializeQrData,
  createVerificationLog,
  toApiStatus,
  isValidObjectId,
  getLogDisplayStatus,
} = require("../utils/verificationHelpers");
const { analyzeProductRisk } = require("../services/riskAnalysisService");
const { analyzeProductIntelligence } = require("../services/supplyChainIntelligenceService");
const { emitNotification } = require("../config/socket");
const {
  parseLocationPayload,
  parsePositiveInt,
  sanitizeString,
  parseStoredLocation,
} = require("../utils/validationUtils");

const respondWithLog = async (res, options) => {
  const { httpStatus, result, message, product, scannedBy, qrData, location } = options;

  const log = await createVerificationLog({
    product: product?._id,
    scannedBy,
    result,
    message,
    qrData,
    location,
  });

  emitNotification("verification", {
    type: result === "AUTHENTIC" ? "verification" : "risk",
    title: result === "AUTHENTIC" ? "Verification recorded" : "Suspicious verification",
    message,
    severity: result === "AUTHENTIC" ? "LOW" : "HIGH",
    productId: product?._id,
    logId: log._id,
  });

  const payload = {
    status: toApiStatus(result),
    message,
  };

  if (product) {
    payload.product = product;
  }

  return res.status(httpStatus).json(payload);
};

const verifyProduct = async (req, res) => {
  try {
    const { scannedBy, qrData } = req.body;
    const resolvedProductId = parseProductIdFromRequest(req.body);
    const serializedQr = serializeQrData(qrData, resolvedProductId);
    const location = parseLocationPayload(req.body.location);

    if (!resolvedProductId) {
      return respondWithLog(res, {
        httpStatus: 400,
        result: "FAKE",
        message: "Invalid or missing QR payload",
        scannedBy,
        qrData: serializedQr,
        location,
      });
    }

    if (!isValidObjectId(resolvedProductId)) {
      return respondWithLog(res, {
        httpStatus: 400,
        result: "FAKE",
        message: "Invalid Product ID",
        scannedBy,
        qrData: serializedQr,
        location,
      });
    }

    const product = await Product.findById(resolvedProductId);

    if (!product) {
      return respondWithLog(res, {
        httpStatus: 404,
        result: "FAKE",
        message: "Product Not Found",
        scannedBy,
        qrData: serializedQr,
        location,
      });
    }

    const isAuthentic = product.verificationStatus === "authentic";
    const result = isAuthentic ? "AUTHENTIC" : "SUSPICIOUS";
    const message = isAuthentic
      ? "Product verified successfully"
      : "Product flagged as suspicious in registry";

    const log = await createVerificationLog({
      product: product._id,
      scannedBy,
      result,
      message,
      qrData: serializedQr,
      location,
    });

    if (isAuthentic) {
      await Product.findByIdAndUpdate(product._id, {
        $inc: { scanCount: 1 },
      });
    }

    const updatedProduct = await Product.findById(product._id);

    let riskAnalysis = null;
    let intelligence = null;
    try {
      riskAnalysis = await analyzeProductRisk(product._id);
      intelligence = await analyzeProductIntelligence(product._id);
    } catch (riskError) {
      console.error("Risk analysis error (non-critical):", riskError.message);
    }

    const responsePayload = {
      status: product.verificationStatus,
      message,
      product: updatedProduct,
    };

    if (riskAnalysis) {
      responsePayload.riskAnalysis = {
        riskScore: riskAnalysis.riskScore,
        riskLevel: riskAnalysis.riskLevel,
        reasons: riskAnalysis.reasons,
      };

      if (riskAnalysis.riskLevel === "HIGH" || riskAnalysis.riskLevel === "CRITICAL") {
        emitNotification("risk-alert", {
          type: "risk",
          title: `${riskAnalysis.riskLevel} risk product`,
          message: `${product.productName} needs review`,
          severity: riskAnalysis.riskLevel,
          productId: product._id,
          logId: log._id,
        });
      }
    }

    if (intelligence) {
      responsePayload.counterfeitAssessment = {
        status: intelligence.counterfeit.status,
        code: intelligence.counterfeit.code,
      };
      responsePayload.assistant = intelligence.assistant;
      responsePayload.investigator = {
        summary: intelligence.investigator.summary,
        findings: intelligence.investigator.findings,
      };
    }

    emitNotification("verification", {
      type: result === "AUTHENTIC" ? "verification" : "risk",
      title: result === "AUTHENTIC" ? "Product verified" : "Suspicious scan",
      message,
      severity: riskAnalysis?.riskLevel || (result === "AUTHENTIC" ? "LOW" : "HIGH"),
      productId: product._id,
      logId: log._id,
    });

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("verifyProduct error:", error);
    return res.status(500).json({
      status: "suspicious",
      message: error.message || "Verification failed",
    });
  }
};

const getVerificationLogs = async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1, 1000);
    const limit = parsePositiveInt(req.query.limit, 10, 50);
    const status = sanitizeString(req.query.status || "all", 20).toUpperCase();
    const search = sanitizeString(req.query.search || "", 120);

    const query = {};
    if (status !== "ALL") {
      query.result = status;
    }

    if (search) {
      query.$or = [
        { message: { $regex: search, $options: "i" } },
        { qrData: { $regex: search, $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      VerificationLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("product", "productName batchNumber verificationStatus productImage")
        .populate("scannedBy", "name email role")
        .lean(),
      VerificationLog.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
      logs: logs.map((log) => ({
        ...log,
        status: getLogDisplayStatus(log),
        locationData: parseStoredLocation(log.location),
      })),
    });
  } catch (error) {
    console.error("getVerificationLogs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load verification logs",
    });
  }
};

module.exports = {
  verifyProduct,
  getVerificationLogs,
};
