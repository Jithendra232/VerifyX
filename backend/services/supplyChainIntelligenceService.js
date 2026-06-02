const Product = require("../models/Product");
const Transfer = require("../models/Transfer");
const VerificationLog = require("../models/VerificationLog");
const User = require("../models/User");
const { analyzeProductRisk } = require("./riskAnalysisService");
const { analyzeRouteAnomalies } = require("./routeAnomalyService");
const { buildRouteChain } = require("../utils/journeyUtils");
const { capRiskScore, uniqueReasons } = require("../utils/riskHelpers");
const { parseStoredLocation } = require("../utils/validationUtils");
const { formatLocationLabel } = require("../utils/geoUtils");

const toDisplayRiskLevel = (riskLevel) => {
  const normalized = String(riskLevel || "LOW").toUpperCase();
  if (normalized === "CRITICAL" || normalized === "HIGH") return "High";
  if (normalized === "MEDIUM") return "Medium";
  return "Low";
};

const assessCounterfeitStatus = ({ riskScore, routeAnomaly, verificationLogs = [], product }) => {
  const duplicateAttempts = verificationLogs.filter((log) => log.result === "FAKE").length;
  const suspiciousVerifications = verificationLogs.filter(
    (log) => log.result === "SUSPICIOUS"
  ).length;

  if (
    riskScore >= 75 ||
    routeAnomaly.score >= 25 ||
    duplicateAttempts >= 3 ||
    product?.verificationStatus === "suspicious"
  ) {
    return {
      status: "Counterfeit Suspected",
      code: "COUNTERFEIT_SUSPECTED",
      reasons: [
        "Multiple fraud indicators exceed safe thresholds",
        ...routeAnomaly.reasons,
      ],
    };
  }

  if (
    riskScore >= 40 ||
    routeAnomaly.score > 0 ||
    suspiciousVerifications > 0 ||
    duplicateAttempts > 0
  ) {
    return {
      status: "Suspicious",
      code: "SUSPICIOUS",
      reasons: [
        "Supply chain or verification signals require review",
        ...routeAnomaly.reasons,
      ],
    };
  }

  return {
    status: "Authentic",
    code: "AUTHENTIC",
    reasons: ["No critical counterfeit indicators detected from recorded events"],
  };
};

const buildInvestigatorBrief = ({ risk, routeAnomaly, counterfeit, routeChain, transfers }) => {
  const lines = [];

  if (risk?.reasons?.length) {
    risk.reasons.forEach((reason) => {
      lines.push(reason.endsWith(".") ? reason : `${reason}.`);
    });
  }

  routeAnomaly.reasons.forEach((reason) => {
    lines.push(reason.endsWith(".") ? reason : `${reason}.`);
  });

  if (risk?.signals?.supplyChainSkipped) {
    lines.push(
      "Product skipped an expected distributor or retailer stage before reaching a customer."
    );
  }

  const completedTransfers = transfers.filter((transfer) => transfer.status === "COMPLETED");
  if (completedTransfers.length >= 2) {
    const first = completedTransfers[0];
    const last = completedTransfers[completedTransfers.length - 1];
    const firstAt = new Date(first.completedAt || first.createdAt);
    const lastAt = new Date(last.completedAt || last.createdAt);
    const hours = Math.max((lastAt - firstAt) / (1000 * 60 * 60), 0).toFixed(1);

    const firstLoc = parseStoredLocation(first.location);
    const lastLoc = parseStoredLocation(last.location);

    if (firstLoc && lastLoc && hours <= 6) {
      lines.push(
        `Custody moved from ${formatLocationLabel(firstLoc) || "an origin location"} to ${formatLocationLabel(lastLoc) || "a new location"} within ${hours} hours.`
      );
    }
  }

  if (routeChain.length) {
    const roles = routeChain.map((node) => node.stage || node.role).join(" → ");
    lines.push(`Observed route chain: ${roles}.`);
  }

  if (!lines.length) {
    lines.push("No significant supply chain anomalies were detected from current records.");
  }

  return {
    summary: lines[0],
    findings: [...new Set(lines)].slice(0, 8),
    counterfeitStatus: counterfeit.status,
    riskScore: risk?.riskScore ?? 0,
    riskLevel: toDisplayRiskLevel(risk?.riskLevel),
  };
};

const buildVerificationAssistant = ({
  product,
  transfers,
  verificationLogs,
  risk,
  routeAnomaly,
  counterfeit,
}) => {
  const completedTransfers = transfers.filter((transfer) => transfer.status === "COMPLETED");
  const latestVerification = verificationLogs[0];

  return {
    productSummary: {
      name: product.productName,
      batchNumber: product.batchNumber,
      status: product.status,
      verificationStatus: product.verificationStatus,
    },
    ownershipSummary: {
      currentOwnerRole: product.currentOwner?.role || "unknown",
      transferCount: completedTransfers.length,
      lastTransferType: completedTransfers.at(-1)?.transferType || "none",
    },
    transferSummary: {
      completed: completedTransfers.length,
      pending: transfers.filter((transfer) => transfer.status === "PENDING").length,
      notes: completedTransfers.at(-1)?.notes || "",
    },
    authenticityExplanation: {
      label: counterfeit.status,
      riskScore: risk?.riskScore ?? 0,
      riskLevel: toDisplayRiskLevel(risk?.riskLevel),
      reasons: uniqueReasons([
        ...(risk?.reasons || []),
        ...routeAnomaly.reasons,
        ...counterfeit.reasons,
      ]).slice(0, 6),
      lastScan: latestVerification
        ? {
            result: latestVerification.result,
            at: latestVerification.createdAt,
            location: formatLocationLabel(parseStoredLocation(latestVerification.location)),
          }
        : null,
    },
    disclaimer:
      "This assistant explains recorded verification and supply chain signals. It does not authorize transfers or override fraud rules.",
  };
};

const analyzeProductIntelligence = async (productId) => {
  const product = await Product.findById(productId)
    .populate("createdBy", "name email role")
    .populate("currentOwner", "name email role")
    .lean();

  if (!product) {
    throw new Error("Product not found");
  }

  const [transfers, verificationLogs, baseRisk] = await Promise.all([
    Transfer.find({ product: productId })
      .populate("fromUser", "name email role")
      .populate("toUser", "name email role")
      .sort({ createdAt: 1 })
      .lean(),
    VerificationLog.find({ product: productId })
      .populate("scannedBy", "name email role")
      .sort({ createdAt: -1 })
      .lean(),
    analyzeProductRisk(productId),
  ]);

  const routeChain = buildRouteChain(product, transfers);
  const routeAnomaly = analyzeRouteAnomalies({
    transfers,
    verifications: verificationLogs,
    routeChain,
  });

  const combinedScore = capRiskScore((baseRisk?.riskScore || 0) + routeAnomaly.score);
  const risk = {
    ...baseRisk,
    riskScore: combinedScore,
    riskLevel:
      combinedScore >= 76
        ? "CRITICAL"
        : combinedScore >= 51
          ? "HIGH"
          : combinedScore >= 26
            ? "MEDIUM"
            : "LOW",
    reasons: uniqueReasons([...(baseRisk?.reasons || []), ...routeAnomaly.reasons]),
    signals: {
      ...(baseRisk?.signals || {}),
      routeAnomalyScore: routeAnomaly.score,
      geoEventCount: routeAnomaly.eventCount,
    },
  };

  const counterfeit = assessCounterfeitStatus({
    riskScore: risk.riskScore,
    routeAnomaly,
    verificationLogs,
    product,
  });

  const investigator = buildInvestigatorBrief({
    risk,
    routeAnomaly,
    counterfeit,
    routeChain,
    transfers,
  });

  const assistant = buildVerificationAssistant({
    product,
    transfers,
    verificationLogs,
    risk,
    routeAnomaly,
    counterfeit,
  });

  const fraudRules = [
    { id: "supply_chain_skip", triggered: Boolean(risk.signals?.supplyChainSkipped) },
    { id: "duplicate_fake_scans", triggered: (risk.signals?.fakeScans || 0) > 0 },
    { id: "excessive_scans", triggered: (risk.signals?.scanCount || 0) > 20 },
    { id: "rapid_scans", triggered: Boolean(risk.signals?.rapidScans) },
    { id: "ownership_inconsistency", triggered: Boolean(risk.signals?.ownershipInconsistent) },
    { id: "route_anomaly", triggered: routeAnomaly.score > 0 },
    { id: "repeated_fake_qr", triggered: (risk.signals?.repeatedFakeQrScans || 0) >= 3 },
  ].filter((rule) => rule.triggered);

  return {
    productId,
    riskScore: risk.riskScore,
    riskLevel: toDisplayRiskLevel(risk.riskLevel),
    riskLevelCode: risk.riskLevel,
    reasons: risk.reasons,
    signals: risk.signals,
    routeChain,
    routeAnomaly,
    counterfeit,
    fraudRules,
    investigator,
    assistant,
  };
};

module.exports = {
  analyzeProductIntelligence,
  assessCounterfeitStatus,
  buildInvestigatorBrief,
  buildVerificationAssistant,
  toDisplayRiskLevel,
};
