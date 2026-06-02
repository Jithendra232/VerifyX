const Product = require("../models/Product");
const Transfer = require("../models/Transfer");
const User = require("../models/User");
const VerificationLog = require("../models/VerificationLog");
const QRCode = require("qrcode");

const DEMO_TAG = "DEMO_SUPPLYCHAIN";
const demoEmail = (role, index) => `demo.${role}.${index}@supplyverify.demo`;

const demoLocation = (city, state, country, lat, lng) =>
  JSON.stringify({ city, state, country, lat, lng, source: "demo" });

const resetDemoData = async () => {
  const demoUsers = await User.find({ email: { $regex: /@supplyverify\.demo$/ } }).select("_id");
  const demoUserIds = demoUsers.map((user) => user._id);

  const demoProducts = await Product.find({ batchNumber: { $regex: /^DEMO-/ } }).select("_id");
  const demoProductIds = demoProducts.map((product) => product._id);

  await Promise.all([
    VerificationLog.deleteMany({ product: { $in: demoProductIds } }),
    Transfer.deleteMany({
      $or: [{ product: { $in: demoProductIds } }, { fromUser: { $in: demoUserIds } }],
    }),
    Product.deleteMany({ _id: { $in: demoProductIds } }),
    User.deleteMany({ _id: { $in: demoUserIds } }),
  ]);

  return {
    usersRemoved: demoUserIds.length,
    productsRemoved: demoProductIds.length,
  };
};

const seedDemoData = async () => {
  if (process.env.DEMO_MODE_ENABLED !== "true") {
    const error = new Error("Demo mode is disabled. Set DEMO_MODE_ENABLED=true to seed demo data.");
    error.statusCode = 403;
    throw error;
  }

  await resetDemoData();

  const roles = ["manufacturer", "distributor", "retailer", "customer"];
  const usersByRole = {};

  for (const role of roles) {
    usersByRole[role] = [];
    for (let index = 1; index <= 2; index += 1) {
      const user = await User.create({
        clerkId: `${DEMO_TAG}_${role}_${index}`,
        email: demoEmail(role, index),
        name: `Demo ${role} ${index}`,
        role,
      });
      usersByRole[role].push(user);
    }
  }

  const products = [];
  const cityStops = [
    { city: "Austin", state: "TX", country: "USA", lat: 30.2672, lng: -97.7431 },
    { city: "Dallas", state: "TX", country: "USA", lat: 32.7767, lng: -96.797 },
    { city: "Houston", state: "TX", country: "USA", lat: 29.7604, lng: -95.3698 },
    { city: "San Antonio", state: "TX", country: "USA", lat: 29.4241, lng: -98.4936 },
  ];

  for (let index = 1; index <= 3; index += 1) {
    const manufacturer = usersByRole.manufacturer[0];
    const batchNumber = `DEMO-BATCH-${Date.now()}-${index}`;
    const qrCode = await QRCode.toDataURL(
      JSON.stringify({ productId: `pending-${index}`, demo: true })
    );

    const product = await Product.create({
      productName: `Demo Product ${index}`,
      batchNumber,
      manufactureDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      quantity: 100 + index * 10,
      qrCode,
      createdBy: manufacturer._id,
      currentOwner: manufacturer._id,
      verificationStatus: "authentic",
      status: "CREATED",
    });

    product.qrCode = await QRCode.toDataURL(
      JSON.stringify({ productId: product._id.toString(), demo: true })
    );
    await product.save();
    products.push(product);
  }

  const chain = [
  {
      product: products[0],
      from: usersByRole.manufacturer[0],
      to: usersByRole.distributor[0],
      type: "MANUFACTURER_TO_DISTRIBUTOR",
      location: cityStops[0],
      nextStatus: "IN_DISTRIBUTION",
    },
    {
      product: products[0],
      from: usersByRole.distributor[0],
      to: usersByRole.retailer[0],
      type: "DISTRIBUTOR_TO_RETAILER",
      location: cityStops[1],
      nextStatus: "IN_RETAIL",
    },
    {
      product: products[0],
      from: usersByRole.retailer[0],
      to: usersByRole.customer[0],
      type: "RETAILER_TO_CUSTOMER",
      location: cityStops[2],
      nextStatus: "SOLD",
    },
    {
      product: products[1],
      from: usersByRole.manufacturer[1],
      to: usersByRole.distributor[1],
      type: "MANUFACTURER_TO_DISTRIBUTOR",
      location: cityStops[1],
      nextStatus: "IN_DISTRIBUTION",
    },
    {
      product: products[1],
      from: usersByRole.distributor[1],
      to: usersByRole.retailer[1],
      type: "DISTRIBUTOR_TO_RETAILER",
      location: cityStops[2],
      nextStatus: "IN_RETAIL",
    },
    {
      product: products[2],
      from: usersByRole.manufacturer[0],
      to: usersByRole.customer[1],
      type: "RETAILER_TO_CUSTOMER",
      location: cityStops[3],
      nextStatus: "SOLD",
    },
  ];

  for (const step of chain) {
    const now = new Date();
    const transfer = await Transfer.create({
      product: step.product._id,
      fromUser: step.from._id,
      toUser: step.to._id,
      transferType: step.type,
      status: "COMPLETED",
      location: demoLocation(
        step.location.city,
        step.location.state,
        step.location.country,
        step.location.lat,
        step.location.lng
      ),
      acceptedAt: now,
      completedAt: now,
      statusHistory: [
        { status: "PENDING", changedBy: step.from._id, note: "Demo transfer initiated", changedAt: now },
        { status: "COMPLETED", changedBy: step.to._id, note: "Demo transfer completed", changedAt: now },
      ],
    });

    step.product.currentOwner = step.to._id;
    step.product.status = step.nextStatus;
    await step.product.save();

    await VerificationLog.create({
      product: step.product._id,
      scannedBy: step.to._id,
      result: step.type === "RETAILER_TO_CUSTOMER" ? "AUTHENTIC" : "AUTHENTIC",
      message: "Demo verification checkpoint",
      location: demoLocation(
        step.location.city,
        step.location.state,
        step.location.country,
        step.location.lat + 0.01,
        step.location.lng - 0.01
      ),
    });

    void transfer;
  }

  return {
    tag: DEMO_TAG,
    users: Object.fromEntries(
      Object.entries(usersByRole).map(([role, users]) => [
        role,
        users.map((user) => ({ id: user._id, email: user.email, name: user.name })),
      ])
    ),
    products: products.map((product) => ({
      id: product._id,
      productName: product.productName,
      batchNumber: product.batchNumber,
    })),
  };
};

module.exports = {
  seedDemoData,
  resetDemoData,
  DEMO_TAG,
};
