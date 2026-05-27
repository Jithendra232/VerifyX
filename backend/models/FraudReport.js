const mongoose = require("mongoose");

const fraudReportSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    issueType: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    riskLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "FraudReport",
  fraudReportSchema
);