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
      enum: ["PENDING", "COMPLETED"],
      default: "COMPLETED",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transfer", transferSchema);
