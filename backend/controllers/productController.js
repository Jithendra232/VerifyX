const Product = require("../models/Product");
const Transfer = require("../models/Transfer");
const VerificationLog = require("../models/VerificationLog");
const User = require("../models/User");
const QRCode = require("qrcode");
const { cloudinary, hasCloudinaryConfig } = require("../config/cloudinary");
const { analyzeProductRisk } = require("../services/riskAnalysisService");
const { parseStoredLocation, sanitizeString } = require("../utils/validationUtils");
const { getLogDisplayStatus } = require("../utils/verificationHelpers");

const createProduct = async (req, res) => {
  try {
    const {
      productName,
      batchNumber,
      manufactureDate,
      expiryDate,
      quantity,
      clerkId,
      productImage,
    } = req.body;

    const manufacturer = await User.findOne({
      clerkId,
    });

    if (!manufacturer) {
      return res.status(404).json({
        success: false,
        message: "Manufacturer not found",
      });
    }

    const safeQuantity = Number(quantity);
    if (
      !productName ||
      !batchNumber ||
      !manufactureDate ||
      !expiryDate ||
      !Number.isFinite(safeQuantity) ||
      safeQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Product name, batch number, dates, and a valid quantity are required",
      });
    }

    const product = await Product.create({
      productName: sanitizeString(productName, 120),
      batchNumber: sanitizeString(batchNumber, 80),
      manufactureDate,
      expiryDate,
      quantity: safeQuantity,
      productImage: sanitizeString(productImage, 500) || undefined,
      createdBy: manufacturer._id,
      currentOwner: manufacturer._id,
    });

    const qrData = JSON.stringify({
      productId: product._id,
      batchNumber: product.batchNumber,
    });

    const qrCode = await QRCode.toDataURL(qrData);

    product.qrCode = qrCode;

    await product.save();

    res.status(201).json(product);

  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: error.code === 11000 ? "Batch number already exists" : error.message,
    });
  }
};

const uploadProductImage = async (req, res) => {
  try {
    if (!hasCloudinaryConfig) {
      return res.status(503).json({
        success: false,
        message: "Cloudinary is not configured on this server",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "supply-chain-products",
      resource_type: "image",
      transformation: [
        { width: 1200, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("uploadProductImage error:", error);
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};

const getProductJourney = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId)
      .populate("createdBy", "name email role")
      .populate("currentOwner", "name email role")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const [transfers, logs, risk] = await Promise.all([
      Transfer.find({ product: productId })
        .populate("fromUser", "name email role")
        .populate("toUser", "name email role")
        .sort({ createdAt: 1 })
        .lean(),
      VerificationLog.find({ product: productId })
        .populate("scannedBy", "name email role")
        .sort({ createdAt: -1 })
        .limit(25)
        .lean(),
      analyzeProductRisk(productId).catch(() => null),
    ]);

    const timeline = [
      {
        id: `created-${product._id}`,
        type: "CREATED",
        title: "Product created",
        actor: product.createdBy,
        owner: product.createdBy,
        createdAt: product.createdAt,
        status: product.status,
      },
      ...transfers.map((transfer) => ({
        id: transfer._id,
        type: transfer.transferType,
        title: "Ownership transferred",
        actor: transfer.fromUser,
        owner: transfer.toUser,
        fromUser: transfer.fromUser,
        toUser: transfer.toUser,
        createdAt: transfer.createdAt,
        status: transfer.status,
        notes: transfer.notes,
      })),
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return res.status(200).json({
      success: true,
      product,
      currentOwner: product.currentOwner,
      timeline,
      transfers,
      verifications: logs.map((log) => ({
        ...log,
        status: getLogDisplayStatus(log),
        locationData: parseStoredLocation(log.location),
      })),
      risk,
    });
  } catch (error) {
    console.error("getProductJourney error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load product journey",
    });
  }
};

module.exports = {
  createProduct,
  uploadProductImage,
  getProductJourney,
};
