const Product = require("../models/Product");
const User = require("../models/User");
const QRCode = require("qrcode");

const createProduct = async (req, res) => {
  try {
    const {
      productName,
      batchNumber,
      manufactureDate,
      expiryDate,
      quantity,
      clerkId,
    } = req.body;

    const manufacturer = await User.findOne({
      clerkId,
    });

    if (!manufacturer) {
      return res.status(404).json({
        message: "Manufacturer not found",
      });
    }

    const product = await Product.create({
      productName,
      batchNumber,
      manufactureDate,
      expiryDate,
      quantity,
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
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
};