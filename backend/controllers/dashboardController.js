const Product = require("../models/Product");
const Transfer = require("../models/Transfer");
const User = require("../models/User");
const VerificationLog = require("../models/VerificationLog");
const { logFilter, getLogDisplayStatus } = require("../utils/verificationHelpers");

const transferPopulate = [
  { path: "product", select: "productName batchNumber" },
  { path: "fromUser", select: "name role" },
  { path: "toUser", select: "name role" },
];

const manufacturerTransferPopulate = [
  { path: "product", select: "productName" },
  { path: "toUser", select: "name role" },
];

const handleError = (res, error, message) => {
  console.error(message, error);
  res.status(500).json({
    success: false,
    message: error.message || message,
  });
};

const getManufacturerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalProductsCreated,
      totalTransfersMade,
      pendingOutgoingTransfersCount,
      recentlyCreatedProducts,
      recentOutgoingTransfers,
    ] = await Promise.all([
      Product.countDocuments({ createdBy: userId }),
      Transfer.countDocuments({ fromUser: userId }),
      Transfer.countDocuments({ fromUser: userId, status: "PENDING" }),
      Product.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("productName batchNumber verificationStatus createdAt")
        .lean(),
      Transfer.find({ fromUser: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("transferType createdAt product toUser")
        .populate(manufacturerTransferPopulate)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProductsCreated,
        totalTransfersMade,
        pendingOutgoingTransfersCount,
      },
      recentlyCreatedProducts,
      recentOutgoingTransfers,
    });
  } catch (error) {
    handleError(res, error, "Manufacturer dashboard failed");
  }
};

const getDistributorDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      inventoryCount,
      productsCurrentlyOwned,
      receivedTransfersCount,
      outgoingTransfersCount,
      pendingIncomingTransfersCount,
      pendingOutgoingTransfersCount,
      receivedTransfers,
      outgoingTransfers,
    ] = await Promise.all([
      Product.countDocuments({ currentOwner: userId }),
      Product.find({ currentOwner: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("productName batchNumber quantity verificationStatus createdAt")
        .lean(),
      Transfer.countDocuments({ toUser: userId }),
      Transfer.countDocuments({ fromUser: userId }),
      Transfer.countDocuments({ toUser: userId, status: "PENDING" }),
      Transfer.countDocuments({ fromUser: userId, status: "PENDING" }),
      Transfer.find({ toUser: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("transferType status createdAt product fromUser toUser")
        .populate(transferPopulate)
        .lean(),
      Transfer.find({ fromUser: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("transferType status createdAt product fromUser toUser")
        .populate(transferPopulate)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        inventoryCount,
        receivedTransfersCount,
        outgoingTransfersCount,
        pendingIncomingTransfersCount,
        pendingOutgoingTransfersCount,
      },
      productsCurrentlyOwned,
      receivedTransfers,
      outgoingTransfers,
    });
  } catch (error) {
    handleError(res, error, "Distributor dashboard failed");
  }
};

const getRetailerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      inventoryCount,
      productsCurrentlyOwned,
      productsSold,
      pendingIncomingTransfersCount,
      pendingOutgoingTransfersCount,
      customerTransfers,
    ] = await Promise.all([
      Product.countDocuments({ currentOwner: userId }),
      Product.find({ currentOwner: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("productName batchNumber quantity verificationStatus createdAt")
        .lean(),
      Transfer.countDocuments({
        fromUser: userId,
        transferType: "RETAILER_TO_CUSTOMER",
      }),
      Transfer.countDocuments({ toUser: userId, status: "PENDING" }),
      Transfer.countDocuments({ fromUser: userId, status: "PENDING" }),
      Transfer.find({
        fromUser: userId,
        transferType: "RETAILER_TO_CUSTOMER",
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("transferType status createdAt product fromUser toUser")
        .populate(transferPopulate)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        inventoryCount,
        productsSold,
        inStock: inventoryCount,
        pendingIncomingTransfersCount,
        pendingOutgoingTransfersCount,
      },
      productsCurrentlyOwned,
      customerTransfers,
      inventoryStatistics: {
        owned: inventoryCount,
        sold: productsSold,
        inStock: inventoryCount,
      },
    });
  } catch (error) {
    handleError(res, error, "Retailer dashboard failed");
  }
};

const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const ownedProducts = await Product.find({ currentOwner: userId })
      .sort({ createdAt: -1 })
      .select("productName batchNumber verificationStatus createdAt")
      .lean();

    const ownedProductIds = ownedProducts.map((product) => product._id);

    const [verifiedProductsCount, suspiciousScans, pendingIncomingTransfersCount] = await Promise.all([
      VerificationLog.countDocuments({
        product: { $in: ownedProductIds },
        ...logFilter.authentic,
      }),
      VerificationLog.find({
        $or: [
          { scannedBy: userId },
          { product: { $in: ownedProductIds } },
        ],
        ...logFilter.suspicious,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select("product scannedBy status resultFlags createdAt")
        .populate("product", "productName batchNumber verificationStatus")
        .lean(),
      Transfer.countDocuments({ toUser: userId, status: "PENDING" }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        ownedProductsCount: ownedProducts.length,
        verifiedProductsCount,
        suspiciousScansCount: suspiciousScans.length,
        pendingIncomingTransfersCount,
      },
      ownedProducts,
      verifiedProductsCount,
      suspiciousScans,
    });
  } catch (error) {
    handleError(res, error, "Customer dashboard failed");
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalTransfers,
      suspiciousProductsCount,
      pendingTransfersCount,
      recentProducts,
      recentTransfers,
      recentVerifications,
      usersByRole,
      productsByStatus,
      transfersByType,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Transfer.countDocuments(),
      Product.countDocuments({ verificationStatus: "suspicious" }),
      Transfer.countDocuments({ status: "PENDING" }),
      Product.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("productName batchNumber verificationStatus createdAt")
        .populate("createdBy", "name email role")
        .lean(),
      Transfer.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("transferType status createdAt product fromUser toUser")
        .populate(transferPopulate)
        .lean(),
      VerificationLog.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("product scannedBy status resultFlags createdAt")
        .populate("product", "productName batchNumber")
        .lean(),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Product.aggregate([
        {
          $group: {
            _id: "$verificationStatus",
            count: { $sum: 1 },
          },
        },
      ]),
      Transfer.aggregate([
        { $group: { _id: "$transferType", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const recentActivities = [
      ...recentProducts.map((item) => ({
        type: "product",
        label: `Product created: ${item.productName}`,
        status: item.verificationStatus,
        createdAt: item.createdAt,
        meta: item.createdBy,
      })),
      ...recentTransfers.map((item) => ({
        type: "transfer",
        label: `Transfer: ${item.product?.productName || "Product"}`,
        status: item.status,
        createdAt: item.createdAt,
        meta: { from: item.fromUser, to: item.toUser },
      })),
      ...recentVerifications.map((item) => ({
        type: "verification",
        label: `Verification: ${item.product?.productName || "Unknown product"}`,
        status: getLogDisplayStatus(item),
        createdAt: item.createdAt,
        meta: item.product,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalTransfers,
        suspiciousProductsCount,
        pendingTransfersCount,
      },
      recentActivities,
      analyticsSummary: {
        usersByRole,
        productsByStatus,
        transfersByType,
      },
    });
  } catch (error) {
    handleError(res, error, "Admin dashboard failed");
  }
};

module.exports = {
  getManufacturerDashboard,
  getDistributorDashboard,
  getRetailerDashboard,
  getCustomerDashboard,
  getAdminDashboard,
};
