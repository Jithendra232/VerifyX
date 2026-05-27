const mongoose = require("mongoose");

const verificationLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    result: {
      type: String,
      enum: ["AUTHENTIC", "SUSPICIOUS", "FAKE"],
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    qrData: {
      type: String,
    },
    location: {
      type: String,
    },
    /** @deprecated Kept for older log entries and dashboard compatibility */
    scanResult: {
      type: String,
      enum: ["authentic", "suspicious"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("VerificationLog", verificationLogSchema);
