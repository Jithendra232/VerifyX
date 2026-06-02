const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transferType: {
      type: String,
      enum: [
        "MANUFACTURER_TO_DISTRIBUTOR",
        "DISTRIBUTOR_TO_RETAILER",
        "RETAILER_TO_CUSTOMER",
        "DISTRIBUTOR_TO_DISTRIBUTOR",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"],
      default: "PENDING",
    },
    notes: {
      type: String,
      default: "",
    },
    location: {
      type: String,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"],
          required: true,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        note: {
          type: String,
          default: "",
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    acceptedAt: Date,
    rejectedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transfer", transferSchema);
