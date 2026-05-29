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
  "DISTRIBUTOR_TO_DISTRIBUTOR",
];

const STATUS_BY_RECEIVER_ROLE = {
  distributor: "IN_DISTRIBUTION",
  retailer: "IN_RETAIL",
  customer: "SOLD",
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
      console.log(transferType);
      console.log(TRANSFER_TYPES);
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
    const transfer = await Transfer.create({
      product: productId,
      fromUser: fromUserId,
      toUser: toUserId,
      transferType,
      notes: sanitizeString(notes, 300),
    });
    
    product.currentOwner = toUserId;

    const nextStatus = STATUS_BY_RECEIVER_ROLE[toUser.role];
    if (nextStatus) {
      product.status = nextStatus;
    }

    await product.save();

    emitNotification("product-transfer", {
      type: "transfer",
      title: "Product transfer completed",
      message: `${product.productName} transferred to ${toUser.name}`,
      severity: "LOW",
      productId: product._id,
      transferId: transfer._id,
    }, [`user:${toUser.clerkId}`, `role:${toUser.role}`]);

    res.status(201).json({
      success: true,
      message: "Transfer successful",
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
};
