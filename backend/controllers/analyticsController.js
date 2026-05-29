const Product = require("../models/Product");
const Transfer = require("../models/Transfer");
const VerificationLog = require("../models/VerificationLog");
const { logFilter } = require("../utils/verificationHelpers");
const { parseStoredLocation } = require("../utils/validationUtils");

const getDateBucket = (date) =>
  new Date(date).toISOString().slice(0, 10);

const getAnalyticsSummary = async (req, res) => {
  try {
    const role = req.userRole;
    const userId = req.user._id;
    const productScope =
      role === "admin"
        ? {}
        : { $or: [{ currentOwner: userId }, { createdBy: userId }] };

    const scopedProducts = await Product.find(productScope)
      .select("_id")
      .lean();
    const productIds = scopedProducts.map((product) => product._id);
    const scopedProductQuery = role === "admin" ? {} : { product: { $in: productIds } };
    const transferScope =
      role === "admin" ? {} : { $or: [{ fromUser: userId }, { toUser: userId }] };

    const [
      totalProducts,
      totalTransfers,
      totalVerifications,
      suspiciousScans,
      fakeScans,
      transfersByType,
      recentLogs,
    ] = await Promise.all([
      Product.countDocuments(productScope),
      Transfer.countDocuments(transferScope),
      VerificationLog.countDocuments(scopedProductQuery),
      VerificationLog.countDocuments({ ...scopedProductQuery, ...logFilter.suspicious }),
      VerificationLog.countDocuments({ ...scopedProductQuery, result: "FAKE" }),
      Transfer.aggregate([
        { $match: transferScope },
        { $group: { _id: "$transferType", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      VerificationLog.find(scopedProductQuery)
        .sort({ createdAt: -1 })
        .limit(100)
        .select("result location createdAt")
        .lean(),
    ]);

    const trendsMap = recentLogs.reduce((acc, log) => {
      const bucket = getDateBucket(log.createdAt);
      acc[bucket] = acc[bucket] || { name: bucket, verifications: 0, suspicious: 0 };
      acc[bucket].verifications += 1;
      if (log.result === "SUSPICIOUS" || log.result === "FAKE") {
        acc[bucket].suspicious += 1;
      }
      return acc;
    }, {});

    const hotspots = recentLogs
      .map((log) => ({ location: parseStoredLocation(log.location), result: log.result }))
      .filter((item) => item.location)
      .map((item, index) => ({
        id: `${item.location.lat}-${item.location.lng}-${index}`,
        ...item.location,
        severity: item.result === "AUTHENTIC" ? "LOW" : "HIGH",
      }));

    return res.status(200).json({
      success: true,
      cards: {
        totalProducts,
        totalTransfers,
        totalVerifications,
        suspiciousScans,
        fakeScans,
        fraudRate: totalVerifications
          ? Math.round(((suspiciousScans + fakeScans) / totalVerifications) * 100)
          : 0,
      },
      verificationTrends: Object.values(trendsMap).reverse().slice(-14),
      transferMetrics: transfersByType.map((item) => ({
        name: item._id || "Unknown",
        value: item.count,
      })),
      fraudStatistics: [
        { name: "Authentic", value: Math.max(totalVerifications - suspiciousScans - fakeScans, 0), color: "#10b981" },
        { name: "Suspicious", value: suspiciousScans, color: "#f59e0b" },
        { name: "Fake", value: fakeScans, color: "#ef4444" },
      ],
      hotspots,
    });
  } catch (error) {
    console.error("getAnalyticsSummary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load analytics summary",
    });
  }
};

module.exports = {
  getAnalyticsSummary,
};
