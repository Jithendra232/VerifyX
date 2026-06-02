const { seedDemoData, resetDemoData } = require("../services/demoDataService");

const seedDemo = async (req, res) => {
  try {
    const payload = await seedDemoData();
    return res.status(201).json({
      success: true,
      message: "Demo supply chain data seeded",
      ...payload,
    });
  } catch (error) {
    console.error("seedDemo error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to seed demo data",
    });
  }
};

const clearDemo = async (req, res) => {
  try {
    const result = await resetDemoData();
    return res.status(200).json({
      success: true,
      message: "Demo supply chain data removed",
      ...result,
    });
  } catch (error) {
    console.error("clearDemo error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to reset demo data",
    });
  }
};

module.exports = {
  seedDemo,
  clearDemo,
};
