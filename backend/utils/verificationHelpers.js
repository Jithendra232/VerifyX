const mongoose = require("mongoose");
const VerificationLog = require("../models/VerificationLog");

const RESULT_TO_API_STATUS = {
  AUTHENTIC: "authentic",
  SUSPICIOUS: "suspicious",
  FAKE: "suspicious",
};

const RESULT_TO_LEGACY_SCAN_RESULT = {
  AUTHENTIC: "authentic",
  SUSPICIOUS: "suspicious",
  FAKE: "suspicious",
};

const parseProductIdFromRequest = (body = {}) => {
  const { productId, qrData } = body;

  if (productId) {
    return String(productId).trim();
  }

  if (!qrData) {
    return null;
  }

  if (typeof qrData === "object" && qrData !== null) {
    return qrData.productId || qrData.id || null;
  }

  if (typeof qrData !== "string") {
    return null;
  }

  const trimmed = qrData.trim();

  try {
    const parsed = JSON.parse(trimmed);
    return parsed.productId || parsed.id || null;
  } catch {
    return trimmed;
  }
};

const serializeQrData = (qrData, fallbackId) => {
  if (qrData === undefined || qrData === null) {
    return fallbackId ? String(fallbackId) : undefined;
  }

  if (typeof qrData === "string") {
    return qrData;
  }

  try {
    return JSON.stringify(qrData);
  } catch {
    return String(qrData);
  }
};

const createVerificationLog = async ({
  product,
  scannedBy,
  result,
  message,
  qrData,
  location,
}) => {
  return VerificationLog.create({
    product: product || undefined,
    scannedBy: scannedBy || undefined,
    result,
    message: message || "",
    qrData,
    location,
    scanResult: RESULT_TO_LEGACY_SCAN_RESULT[result],
  });
};

const toApiStatus = (result) => RESULT_TO_API_STATUS[result] || "suspicious";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Dashboard queries: match new `result` field and legacy `scanResult` */
const logFilter = {
  authentic: {
    $or: [{ result: "AUTHENTIC" }, { scanResult: "authentic" }],
  },
  suspicious: {
    $or: [
      { result: { $in: ["SUSPICIOUS", "FAKE"] } },
      { scanResult: "suspicious" },
    ],
  },
};

const getLogDisplayStatus = (log) =>
  log.result || log.scanResult || "unknown";

module.exports = {
  parseProductIdFromRequest,
  serializeQrData,
  createVerificationLog,
  toApiStatus,
  isValidObjectId,
  logFilter,
  getLogDisplayStatus,
};
