const mongoose = require("mongoose");
const Product = require("../models/Product");
const Transfer = require("../models/Transfer");
const User = require("../models/User");
const { emitNotification } = require("../config/socket");
const { sanitizeString } = require("../utils/validationUtils");

const TRANSFER_TYPES = [
  "MANUFACTURER_TO_DISTRIBUTOR",
  "DISTRIBUTOR_TO_RETAILER",
  "RETAILER_TO_CUSTOMER",
];

const STATUS_BY_RECEIVER_ROLE = {
  distributor: "IN_DISTRIBUTION",
  retailer: "IN_RETAIL",
  customer: "SOLD",
};

const FLOW_BY_ROLE = {
  manufacturer: {
    receiverRole: "distributor",
    transferType: "MANUFACTURER_TO_DISTRIBUTOR",
  },
  distributor: {
    receiverRole: "retailer",
    transferType: "DISTRIBUTOR_TO_RETAILER",
  },
  retailer: {
    receiverRole: "customer",
    transferType: "RETAILER_TO_CUSTOMER",
  },
};

const transferPopulate = [
  { path: "product", select: "productName batchNumber quantity verificationStatus status currentOwner" },
  { path: "fromUser", select: "name email role clerkId" },
  { path: "toUser", select: "name email role clerkId" },
];

const validateTransferFlow = ({ fromRole, toRole, transferType }) => {
  const expected = FLOW_BY_ROLE[fromRole];

  if (!expected) {
    return "Your role cannot initiate product transfers";
  }

  if (expected.receiverRole !== toRole) {
    return `Invalid receiver role. ${fromRole} can only transfer to ${expected.receiverRole}`;
  }

  if (expected.transferType !== transferType) {
    return `Invalid transfer type. Expected ${expected.transferType}`;
  }

  return null;
};

const transferProduct = async (req, res) => {
  try {
    const { productId, toUserId, transferType, notes } = req.body;

    if (!productId || !toUserId || !transferType) {
      return res.status(400).json({
        success: false,
        message: "productId, toUserId, and transferType are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver id",
      });
    }

    if (!TRANSFER_TYPES.includes(transferType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transfer type",
      });
    }

    const fromUserId = req.user._id;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!product.currentOwner) {
      return res.status(400).json({
        success: false,
        message: "Product has no assigned owner",
      });
    }

    if (product.currentOwner.toString() !== fromUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not the current owner of this product",
      });
    }

    if (toUserId === fromUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot transfer product to yourself",
      });
    }

    const toUser = await User.findById(toUserId);

    if (!toUser) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    const flowError = validateTransferFlow({
      fromRole: req.user.role,
      toRole: toUser.role,
      transferType,
    });

    if (flowError) {
      return res.status(400).json({
        success: false,
        message: flowError,
      });
    }

    const existingPendingTransfer = await Transfer.findOne({
      product: productId,
      status: "PENDING",
    });

    if (existingPendingTransfer) {
      return res.status(409).json({
        success: false,
        message: "A pending transfer already exists for this product",
      });
    }

    const transfer = await Transfer.create({
      product: productId,
      fromUser: fromUserId,
      toUser: toUserId,
      transferType,
      status: "PENDING",
      notes: sanitizeString(notes, 300),
      statusHistory: [
        {
          status: "PENDING",
          changedBy: fromUserId,
          note: "Transfer initiated",
        },
      ],
    });

    emitNotification("product-transfer", {
      type: "transfer",
      title: "Transfer request received",
      message: `${req.user.name} requested to transfer ${product.productName}`,
      severity: "LOW",
      productId: product._id,
      transferId: transfer._id,
    }, [`user:${toUser.clerkId}`, `role:${toUser.role}`]);

    res.status(201).json({
      success: true,
      message: "Transfer request created",
      transfer,
      product,
    });
  } catch (error) {
    console.error("transferProduct error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Transfer failed",
    });
  }
};

const listTransfers = async (req, res) => {
  try {
    const scope = req.query.scope || "incoming";
    const status = req.query.status;
    const userId = req.user._id;

    const query =
      scope === "outgoing"
        ? { fromUser: userId }
        : scope === "all"
          ? { $or: [{ fromUser: userId }, { toUser: userId }] }
          : { toUser: userId };
    if (status && status !== "ALL") query.status = status;

    const transfers = await Transfer.find(query)
      .populate(transferPopulate)
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: transfers.length,
      transfers,
    });
  } catch (error) {
    console.error("listTransfers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load transfers",
    });
  }
};

const getEligibleProducts = async (req, res) => {
  try {
    const products = await Product.find({ currentOwner: req.user._id })
      .sort({ createdAt: -1 })
      .select("productName batchNumber quantity verificationStatus status currentOwner createdAt")
      .populate("currentOwner", "name email role")
      .lean();

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("getEligibleProducts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load transferable products",
    });
  }
};

const getTransferRecipients = async (req, res) => {
  try {
    const expected = FLOW_BY_ROLE[req.user.role];

    if (!expected) {
      return res.status(200).json({
        success: true,
        receiverRole: null,
        users: [],
      });
    }

    const users = await User.find({
      role: expected.receiverRole,
      _id: { $ne: req.user._id },
    })
      .sort({ name: 1 })
      .select("name email role")
      .lean();

    return res.status(200).json({
      success: true,
      receiverRole: expected.receiverRole,
      transferType: expected.transferType,
      users,
    });
  } catch (error) {
    console.error("getTransferRecipients error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load transfer recipients",
    });
  }
};

const acceptTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(transferId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transfer id",
      });
    }

    const transfer = await Transfer.findById(transferId).populate(transferPopulate);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    if (transfer.toUser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the receiver can accept this transfer",
      });
    }

    if (transfer.status !== "PENDING") {
      return res.status(409).json({
        success: false,
        message: "Transfer has already been processed",
      });
    }

    const product = await Product.findById(transfer.product._id);

    if (!product || product.currentOwner.toString() !== transfer.fromUser._id.toString()) {
      return res.status(409).json({
        success: false,
        message: "Product ownership changed before this transfer was accepted",
      });
    }

    const now = new Date();
    transfer.status = "COMPLETED";
    transfer.acceptedAt = now;
    transfer.completedAt = now;
    transfer.statusHistory.push(
      { status: "ACCEPTED", changedBy: req.user._id, note: "Transfer accepted", changedAt: now },
      { status: "COMPLETED", changedBy: req.user._id, note: "Ownership updated", changedAt: now }
    );

    product.currentOwner = transfer.toUser._id;
    const nextStatus = STATUS_BY_RECEIVER_ROLE[transfer.toUser.role];
    if (nextStatus) product.status = nextStatus;

    await Promise.all([transfer.save(), product.save()]);

    emitNotification("transfer-accepted", {
      type: "transfer",
      title: "Transfer accepted",
      message: `${req.user.name} accepted ${transfer.product.productName}`,
      severity: "LOW",
      productId: transfer.product._id,
      transferId: transfer._id,
    }, [`user:${transfer.fromUser.clerkId}`, `role:${transfer.fromUser.role}`]);

    return res.status(200).json({
      success: true,
      message: "Transfer accepted",
      transfer,
      product,
    });
  } catch (error) {
    console.error("acceptTransfer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to accept transfer",
    });
  }
};

const rejectTransfer = async (req, res) => {
  try {
    const { transferId } = req.params;
    const { reason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(transferId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transfer id",
      });
    }

    const transfer = await Transfer.findById(transferId).populate(transferPopulate);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: "Transfer not found",
      });
    }

    if (transfer.toUser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the receiver can reject this transfer",
      });
    }

    if (transfer.status !== "PENDING") {
      return res.status(409).json({
        success: false,
        message: "Transfer has already been processed",
      });
    }

    transfer.status = "REJECTED";
    transfer.rejectedAt = new Date();
    transfer.statusHistory.push({
      status: "REJECTED",
      changedBy: req.user._id,
      note: sanitizeString(reason || "Transfer rejected", 300),
      changedAt: transfer.rejectedAt,
    });

    await transfer.save();

    emitNotification("transfer-rejected", {
      type: "transfer",
      title: "Transfer rejected",
      message: `${req.user.name} rejected ${transfer.product.productName}`,
      severity: "MEDIUM",
      productId: transfer.product._id,
      transferId: transfer._id,
    }, [`user:${transfer.fromUser.clerkId}`, `role:${transfer.fromUser.role}`]);

    return res.status(200).json({
      success: true,
      message: "Transfer rejected",
      transfer,
    });
  } catch (error) {
    console.error("rejectTransfer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reject transfer",
    });
  }
};

const getTransferHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const transfers = await Transfer.find({ product: productId })
      .populate("fromUser", "name email role")
      .populate("toUser", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: transfers.length,
      transfers,
    });
  } catch (error) {
    console.error("getTransferHistory error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transfer history",
    });
  }
};

module.exports = {
  transferProduct,
  getTransferHistory,
  listTransfers,
  getEligibleProducts,
  getTransferRecipients,
  acceptTransfer,
  rejectTransfer,
};
