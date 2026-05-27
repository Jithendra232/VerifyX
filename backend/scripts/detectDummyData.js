/**
 * Read-only report for obvious test/dummy records.
 * Does NOT delete or modify any data.
 *
 * Run: node scripts/detectDummyData.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Transfer = require("../models/Transfer");
const VerificationLog = require("../models/VerificationLog");

const TEST_PATTERNS = [
  /test/i,
  /dummy/i,
  /fake/i,
  /sample/i,
  /dist_001/i,
  /^temp/i,
];

const matchesTestPattern = (value) =>
  value && TEST_PATTERNS.some((pattern) => pattern.test(String(value)));

const printSection = (title, items) => {
  console.log(`\n=== ${title} (${items.length}) ===`);
  if (items.length === 0) {
    console.log("  None detected.");
    return;
  }
  items.forEach((item) => console.log(`  - ${item}`));
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    console.log("No data was scanned or modified. Fix connectivity and re-run.");
    process.exit(0);
  }

  const users = await User.find().lean();
  const products = await Product.find().lean();
  const transfers = await Transfer.find().lean();

  const suspiciousUsers = users
    .filter(
      (user) =>
        matchesTestPattern(user.name) ||
        matchesTestPattern(user.email) ||
        matchesTestPattern(user.clerkId)
    )
    .map((user) => `${user._id} | ${user.name} | ${user.email} | role=${user.role}`);

  const suspiciousProducts = products
    .filter(
      (product) =>
        matchesTestPattern(product.productName) ||
        matchesTestPattern(product.batchNumber)
    )
    .map(
      (product) =>
        `${product._id} | ${product.productName} | batch=${product.batchNumber}`
    );

  const orphanProducts = products
    .filter((product) => !product.createdBy || !product.currentOwner)
    .map(
      (product) =>
        `${product._id} | missing createdBy=${!product.createdBy} currentOwner=${!product.currentOwner}`
    );

  const productIds = new Set(products.map((product) => String(product._id)));
  const userIds = new Set(users.map((user) => String(user._id)));

  const brokenTransfers = transfers
    .filter((transfer) => {
      const missingProduct = !productIds.has(String(transfer.product));
      const missingFrom = !userIds.has(String(transfer.fromUser));
      const missingTo = !userIds.has(String(transfer.toUser));
      return missingProduct || missingFrom || missingTo;
    })
    .map(
      (transfer) =>
        `${transfer._id} | product=${transfer.product} from=${transfer.fromUser} to=${transfer.toUser}`
    );

  const logCount = await VerificationLog.countDocuments({
    $or: [{ product: { $exists: false } }, { product: null }],
  });

  printSection("Suspicious test users", suspiciousUsers);
  printSection("Suspicious test products", suspiciousProducts);
  printSection("Orphan products (missing owner fields)", orphanProducts);
  printSection("Broken transfers (missing references)", brokenTransfers);

  console.log(`\n=== Verification logs without product (${logCount}) ===`);
  if (logCount > 0) {
    console.log("  Expected for FAKE/invalid QR scans after integrity update.");
  } else {
    console.log("  None detected.");
  }

  console.log("\n=== Suggested manual cleanup (review before running) ===");
  console.log("  // Example: remove a test user by id");
  console.log('  // db.users.deleteOne({ _id: ObjectId("...") })');
  console.log("  // Example: remove orphan product");
  console.log('  // db.products.deleteOne({ _id: ObjectId("...") })');
  console.log("\nReport complete. No data was modified.\n");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((error) => {
  console.error("detectDummyData failed:", error.message);
  process.exit(1);
});
