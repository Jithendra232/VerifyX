const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },

    batchNumber: {
      type: String,
      required: true,
      unique: true,
    },

    manufactureDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    qrCode: {
      type: String,
    },

    productImage: {
      type: String,
    },

    currentOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    verificationStatus: {
      type: String,
      enum: ["authentic", "suspicious"],
      default: "authentic",
    },

    status: {
      type: String,
      enum: ["CREATED", "IN_DISTRIBUTION", "IN_RETAIL", "SOLD", "FLAGGED"],
      default: "CREATED",
    },

    scanCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);