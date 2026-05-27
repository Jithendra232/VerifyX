const Product = require("../models/Product");
const {
  parseProductIdFromRequest,
  serializeQrData,
  createVerificationLog,
  toApiStatus,
  isValidObjectId,
} = require("../utils/verificationHelpers");
const { analyzeProductRisk } = require("../services/riskAnalysisService");

const respondWithLog = async (res, options) => {
  const { httpStatus, result, message, product, scannedBy, qrData } = options;

  await createVerificationLog({
    product: product?._id,
    scannedBy,
    result,
    message,
    qrData,
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

    if (!resolvedProductId) {
      return respondWithLog(res, {
        httpStatus: 400,
        result: "FAKE",
        message: "Invalid or missing QR payload",
        scannedBy,
        qrData: serializedQr,
      });
    }

    if (!isValidObjectId(resolvedProductId)) {
      return respondWithLog(res, {
        httpStatus: 400,
        result: "FAKE",
        message: "Invalid Product ID",
        scannedBy,
        qrData: serializedQr,
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
      });
    }

    const isAuthentic = product.verificationStatus === "authentic";
    const result = isAuthentic ? "AUTHENTIC" : "SUSPICIOUS";
    const message = isAuthentic
      ? "Product verified successfully"
      : "Product flagged as suspicious in registry";

    await createVerificationLog({
      product: product._id,
      scannedBy,
      result,
      message,
      qrData: serializedQr,
    });

    if (isAuthentic) {
      await Product.findByIdAndUpdate(product._id, {
        $inc: { scanCount: 1 },
      });
    }

    const updatedProduct = await Product.findById(product._id);

    // Get risk analysis (non-blocking, don't fail verification if it fails)
    let riskAnalysis = null;
    try {
      riskAnalysis = await analyzeProductRisk(product._id);
    } catch (riskError) {
      console.error("Risk analysis error (non-critical):", riskError.message);
    }

    const responsePayload = {
      status: product.verificationStatus,
      message,
      product: updatedProduct,
    };

    // Include risk analysis if available
    if (riskAnalysis) {
      responsePayload.riskAnalysis = {
        riskScore: riskAnalysis.riskScore,
        riskLevel: riskAnalysis.riskLevel,
        reasons: riskAnalysis.reasons,
      };
    }

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("verifyProduct error:", error);
    return res.status(500).json({
      status: "suspicious",
      message: error.message || "Verification failed",
    });
  }
};

module.exports = {
  verifyProduct,
};
