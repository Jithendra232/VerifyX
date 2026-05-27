const mongoose = require("mongoose");
const { normalizeEmail } = require("../utils/emailUtils");

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "manufacturer",
        "distributor",
        "retailer",
        "customer",
      ],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

// Mongoose 9+ pre hooks do not use next(); normalize email synchronously.
userSchema.pre("save", function normalizeUserEmail() {
  if (this.email) {
    this.email = normalizeEmail(this.email);
  }
});

module.exports = mongoose.model("User", userSchema);
